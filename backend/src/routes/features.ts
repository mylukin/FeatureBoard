import { Hono } from 'hono';
import { getDatabase, Feature, FeatureStatus, FeatureStatusType } from '../db/schema.js';

const features = new Hono();

// Validate feature status
function isValidStatus(status: string): status is FeatureStatusType {
  return Object.values(FeatureStatus).includes(status as FeatureStatusType);
}

// Validate priority (1-5)
function isValidPriority(priority: number): boolean {
  return Number.isInteger(priority) && priority >= 1 && priority <= 5;
}

// GET /api/features - List all features with optional filters
features.get('/', (c) => {
  const db = getDatabase();
  const status = c.req.query('status');
  const module = c.req.query('module');

  let query = 'SELECT * FROM features';
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (status) {
    if (!isValidStatus(status)) {
      return c.json({ error: 'Invalid status. Must be one of: todo, doing, done' }, 400);
    }
    conditions.push('status = ?');
    params.push(status);
  }

  if (module) {
    conditions.push('module = ?');
    params.push(module);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY priority DESC, createdAt DESC';

  try {
    const stmt = db.prepare(query);
    const rows = stmt.all(...params) as Feature[];
    return c.json(rows);
  } catch (error) {
    console.error('Error fetching features:', error);
    return c.json({ error: 'Failed to fetch features' }, 500);
  }
});

// GET /api/features/stats - Get statistics summary
features.get('/stats', (c) => {
  const db = getDatabase();

  try {
    // Get counts by status
    const statusStmt = db.prepare(`
      SELECT status, COUNT(*) as count
      FROM features
      GROUP BY status
    `);
    const statusRows = statusStmt.all() as { status: string; count: number }[];

    const byStatus: Record<string, number> = {
      todo: 0,
      doing: 0,
      done: 0,
    };
    for (const row of statusRows) {
      byStatus[row.status] = row.count;
    }

    // Get counts by module
    const moduleStmt = db.prepare(`
      SELECT module, COUNT(*) as count
      FROM features
      GROUP BY module
    `);
    const moduleRows = moduleStmt.all() as { module: string; count: number }[];

    const byModule: Record<string, number> = {};
    for (const row of moduleRows) {
      byModule[row.module] = row.count;
    }

    return c.json({ byStatus, byModule });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return c.json({ error: 'Failed to fetch statistics' }, 500);
  }
});

// GET /api/features/:id - Get a single feature by ID
features.get('/:id', (c) => {
  const db = getDatabase();
  const id = parseInt(c.req.param('id'), 10);

  if (isNaN(id)) {
    return c.json({ error: 'Invalid feature ID' }, 400);
  }

  try {
    const stmt = db.prepare('SELECT * FROM features WHERE id = ?');
    const feature = stmt.get(id) as Feature | undefined;

    if (!feature) {
      return c.json({ error: 'Feature not found' }, 404);
    }

    return c.json(feature);
  } catch (error) {
    console.error('Error fetching feature:', error);
    return c.json({ error: 'Failed to fetch feature' }, 500);
  }
});

// POST /api/features - Create a new feature
features.post('/', async (c) => {
  const db = getDatabase();

  let body: {
    title?: string;
    description?: string;
    module?: string;
    status?: string;
    priority?: number;
  };

  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  // Validate required field
  if (!body.title || typeof body.title !== 'string' || body.title.trim() === '') {
    return c.json({ error: 'Title is required and must be a non-empty string' }, 400);
  }

  // Validate status if provided
  if (body.status !== undefined && !isValidStatus(body.status)) {
    return c.json({ error: 'Invalid status. Must be one of: todo, doing, done' }, 400);
  }

  // Validate priority if provided
  if (body.priority !== undefined && !isValidPriority(body.priority)) {
    return c.json({ error: 'Priority must be an integer between 1 and 5' }, 400);
  }

  const title = body.title.trim();
  const description = body.description ?? null;
  const module = body.module ?? 'other';
  const status = body.status ?? 'todo';
  const priority = body.priority ?? 3;

  try {
    const stmt = db.prepare(`
      INSERT INTO features (title, description, module, status, priority)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(title, description, module, status, priority);

    // Fetch the created feature
    const getStmt = db.prepare('SELECT * FROM features WHERE id = ?');
    const feature = getStmt.get(result.lastInsertRowid) as Feature;

    return c.json(feature, 201);
  } catch (error) {
    console.error('Error creating feature:', error);
    return c.json({ error: 'Failed to create feature' }, 500);
  }
});

// PUT /api/features/:id - Update an existing feature
features.put('/:id', async (c) => {
  const db = getDatabase();
  const id = parseInt(c.req.param('id'), 10);

  if (isNaN(id)) {
    return c.json({ error: 'Invalid feature ID' }, 400);
  }

  let body: {
    title?: string;
    description?: string;
    module?: string;
    status?: string;
    priority?: number;
  };

  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  // Check if feature exists
  const checkStmt = db.prepare('SELECT * FROM features WHERE id = ?');
  const existing = checkStmt.get(id) as Feature | undefined;

  if (!existing) {
    return c.json({ error: 'Feature not found' }, 404);
  }

  // Validate title if provided
  if (body.title !== undefined && (typeof body.title !== 'string' || body.title.trim() === '')) {
    return c.json({ error: 'Title must be a non-empty string' }, 400);
  }

  // Validate status if provided
  if (body.status !== undefined && !isValidStatus(body.status)) {
    return c.json({ error: 'Invalid status. Must be one of: todo, doing, done' }, 400);
  }

  // Validate priority if provided
  if (body.priority !== undefined && !isValidPriority(body.priority)) {
    return c.json({ error: 'Priority must be an integer between 1 and 5' }, 400);
  }

  // Build update query dynamically
  const updates: string[] = [];
  const params: (string | number | null)[] = [];

  if (body.title !== undefined) {
    updates.push('title = ?');
    params.push(body.title.trim());
  }
  if (body.description !== undefined) {
    updates.push('description = ?');
    params.push(body.description);
  }
  if (body.module !== undefined) {
    updates.push('module = ?');
    params.push(body.module);
  }
  if (body.status !== undefined) {
    updates.push('status = ?');
    params.push(body.status);
  }
  if (body.priority !== undefined) {
    updates.push('priority = ?');
    params.push(body.priority);
  }

  if (updates.length === 0) {
    // No updates provided, return the existing feature
    return c.json(existing);
  }

  params.push(id);

  try {
    const stmt = db.prepare(`UPDATE features SET ${updates.join(', ')} WHERE id = ?`);
    stmt.run(...params);

    // Fetch the updated feature
    const getStmt = db.prepare('SELECT * FROM features WHERE id = ?');
    const feature = getStmt.get(id) as Feature;

    return c.json(feature);
  } catch (error) {
    console.error('Error updating feature:', error);
    return c.json({ error: 'Failed to update feature' }, 500);
  }
});

// DELETE /api/features/:id - Delete a feature
features.delete('/:id', (c) => {
  const db = getDatabase();
  const id = parseInt(c.req.param('id'), 10);

  if (isNaN(id)) {
    return c.json({ error: 'Invalid feature ID' }, 400);
  }

  try {
    // Check if feature exists
    const checkStmt = db.prepare('SELECT * FROM features WHERE id = ?');
    const existing = checkStmt.get(id) as Feature | undefined;

    if (!existing) {
      return c.json({ error: 'Feature not found' }, 404);
    }

    const stmt = db.prepare('DELETE FROM features WHERE id = ?');
    stmt.run(id);

    return c.json({ message: 'Feature deleted successfully' });
  } catch (error) {
    console.error('Error deleting feature:', error);
    return c.json({ error: 'Failed to delete feature' }, 500);
  }
});

export default features;
