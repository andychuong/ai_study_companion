#!/usr/bin/env tsx
/**
 * Database migration script
 * Run with: npx tsx scripts/migrate.ts
 */

import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { db } from '../lib/db';
import postgres from 'postgres';

async function runMigrations() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set');
  }

  console.log('Running database migrations...');

  try {
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log('Migrations completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

runMigrations();



