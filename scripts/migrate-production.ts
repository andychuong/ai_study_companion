#!/usr/bin/env tsx
/**
 * Production database migration script
 * 
 * Usage:
 *   DATABASE_URL="your-production-url" npx tsx scripts/migrate-production.ts
 * 
 * Or set DATABASE_URL in your environment:
 *   export DATABASE_URL="your-production-url"
 *   npx tsx scripts/migrate-production.ts
 */

import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';

async function runMigrations() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ ERROR: DATABASE_URL is not set');
    console.error('');
    console.error('Please set DATABASE_URL environment variable:');
    console.error('  export DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"');
    console.error('  npx tsx scripts/migrate-production.ts');
    console.error('');
    console.error('Or pass it directly:');
    console.error('  DATABASE_URL="your-url" npx tsx scripts/migrate-production.ts');
    process.exit(1);
  }

  // Validate DATABASE_URL format
  if (!databaseUrl.startsWith('postgresql://') && !databaseUrl.startsWith('postgres://')) {
    console.error('❌ ERROR: DATABASE_URL must start with postgresql:// or postgres://');
    process.exit(1);
  }

  console.log('🔄 Running database migrations...');
  console.log(`📊 Database: ${databaseUrl.split('@')[1]?.split('/')[0] || 'unknown'}`);
  console.log('');

  let client: postgres.Sql | null = null;
  let db: ReturnType<typeof drizzle> | null = null;

  try {
    // Create postgres client
    client = postgres(databaseUrl, { max: 1 });
    db = drizzle(client);

    // Run migrations
    await migrate(db, { migrationsFolder: './drizzle' });
    
    console.log('');
    console.log('✅ Migrations completed successfully!');
    console.log('');
    console.log('📋 Next steps:');
    console.log('  1. Verify tables were created in your database');
    console.log('  2. Test the application endpoints');
    console.log('  3. Check Vercel logs for any errors');
    
  } catch (error) {
    console.error('');
    console.error('❌ Migration failed:');
    console.error(error);
    
    if (error instanceof Error) {
      console.error('');
      console.error('Error details:');
      console.error(`  Message: ${error.message}`);
      if (error.stack) {
        console.error(`  Stack: ${error.stack.split('\n').slice(0, 5).join('\n')}`);
      }
    }
    
    process.exit(1);
  } finally {
    // Close connection
    if (client) {
      await client.end();
    }
  }
}

// Run migrations
runMigrations().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

