import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { db, sqlClient } from './db';

async function runMigrations() {
  try {
    await migrate(db, { migrationsFolder: './src/migrations' });
    console.log('Migrations applied successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await sqlClient.end();
  }
}

runMigrations();
