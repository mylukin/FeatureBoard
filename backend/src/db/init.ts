import { initDatabase, closeDatabase } from './schema.js';

console.log('Initializing FeatureBoard database...');

try {
  initDatabase();
  console.log('Database schema created successfully!');
} catch (error) {
  console.error('Failed to initialize database:', error);
  process.exit(1);
} finally {
  closeDatabase();
}
