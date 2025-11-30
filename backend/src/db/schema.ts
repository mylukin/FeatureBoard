import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database file location - stored in backend/data directory
const DB_PATH = path.join(__dirname, '../../data/featureboard.db');

// Feature status enum values
export const FeatureStatus = {
  TODO: 'todo',
  DOING: 'doing',
  DONE: 'done',
} as const;

export type FeatureStatusType = typeof FeatureStatus[keyof typeof FeatureStatus];

// Feature interface matching the database schema
export interface Feature {
  id: number;
  title: string;
  description: string | null;
  module: string;
  status: FeatureStatusType;
  priority: number;
  createdAt: string;
  updatedAt: string;
}

// SQL statement to create the features table
const CREATE_FEATURES_TABLE = `
  CREATE TABLE IF NOT EXISTS features (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    module TEXT DEFAULT 'other',
    status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'doing', 'done')),
    priority INTEGER DEFAULT 3 CHECK (priority >= 1 AND priority <= 5),
    createdAt TEXT DEFAULT (datetime('now')),
    updatedAt TEXT DEFAULT (datetime('now'))
  )
`;

// Trigger to auto-update the updatedAt timestamp
const CREATE_UPDATE_TRIGGER = `
  CREATE TRIGGER IF NOT EXISTS update_features_timestamp
  AFTER UPDATE ON features
  FOR EACH ROW
  BEGIN
    UPDATE features SET updatedAt = datetime('now') WHERE id = OLD.id;
  END
`;

let db: Database.Database | null = null;

/**
 * Initialize the database connection and create tables if they don't exist
 */
export function initDatabase(): Database.Database {
  if (db) {
    return db;
  }

  db = new Database(DB_PATH);

  // Enable foreign keys and WAL mode for better performance
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  // Create the features table
  db.exec(CREATE_FEATURES_TABLE);

  // Create the update trigger
  db.exec(CREATE_UPDATE_TRIGGER);

  console.log(`Database initialized at: ${DB_PATH}`);
  return db;
}

/**
 * Get the database instance (initializes if needed)
 */
export function getDatabase(): Database.Database {
  if (!db) {
    return initDatabase();
  }
  return db;
}

/**
 * Close the database connection
 */
export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
    console.log('Database connection closed');
  }
}
