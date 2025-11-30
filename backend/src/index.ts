import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { initDatabase } from './db/schema.js';
import featuresRoutes from './routes/features.js';

// Initialize database on startup
initDatabase();

const app = new Hono();

// Enable CORS for frontend development
app.use('/*', cors());

// Health check endpoint
app.get('/api/health', (c) => {
  return c.json({ status: 'ok', message: 'FeatureBoard API is running' });
});

// Features API routes
app.route('/api/features', featuresRoutes);

// Start server
const port = 3001;
console.log(`Server is running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});

export default app;
