import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

// Create connection pool for serverless
const connectionString = process.env.DATABASE_URL;
const client = postgres(connectionString, {
  max: 1, // Serverless-friendly: 1 connection per function
  idle_timeout: 30,
  connect_timeout: 10,
});

export const db = drizzle(client, { schema });

export type Database = typeof db;



