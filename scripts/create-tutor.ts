#!/usr/bin/env tsx

/**
 * Script to create a tutor user in the production database
 * 
 * Usage:
 *   DATABASE_URL=<production_url> tsx scripts/create-tutor.ts
 * 
 * Or with environment file:
 *   tsx scripts/create-tutor.ts
 */

import { db } from '../lib/db';
import { users } from '../lib/db/schema';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

interface TutorData {
  name: string;
  email: string;
  password: string;
}

async function createTutor(data: TutorData) {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('❌ DATABASE_URL is not set');
    console.error('Please set DATABASE_URL environment variable or add it to .env.local');
    process.exit(1);
  }

  console.log('🔧 Creating tutor user...');
  console.log(`📧 Email: ${data.email}`);
  console.log(`👤 Name: ${data.name}`);

  try {
    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, data.email),
    });

    if (existingUser) {
      if (existingUser.role === 'tutor') {
        console.log('✅ Tutor already exists with this email');
        console.log(`   ID: ${existingUser.id}`);
        console.log(`   Name: ${existingUser.name}`);
        return existingUser;
      } else {
        console.error('❌ User exists but is not a tutor');
        console.error(`   Current role: ${existingUser.role}`);
        process.exit(1);
      }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 10);

    // Create tutor user
    const [tutor] = await db
      .insert(users)
      .values({
        email: data.email,
        passwordHash,
        name: data.name,
        role: 'tutor',
      })
      .returning();

    console.log('✅ Tutor created successfully!');
    console.log(`   ID: ${tutor.id}`);
    console.log(`   Email: ${tutor.email}`);
    console.log(`   Name: ${tutor.name}`);
    console.log(`   Role: ${tutor.role}`);

    return tutor;
  } catch (error: any) {
    console.error('❌ Error creating tutor:', error.message);
    if (error.code === '23505') {
      console.error('   Duplicate email - tutor may already exist');
    }
    process.exit(1);
  }
}

async function main() {
  // Default tutor data (can be overridden via environment variables)
  const tutorData: TutorData = {
    name: process.env.TUTOR_NAME || 'Test Tutor',
    email: process.env.TUTOR_EMAIL || 'tutor@example.com',
    password: process.env.TUTOR_PASSWORD || 'TestTutor123!',
  };

  console.log('📝 Tutor Creation Script');
  console.log('=======================\n');

  // Warn if using defaults
  if (!process.env.TUTOR_EMAIL || !process.env.TUTOR_PASSWORD) {
    console.log('⚠️  Using default tutor credentials');
    console.log('   Set TUTOR_EMAIL and TUTOR_PASSWORD environment variables to customize\n');
  }

  await createTutor(tutorData);

  console.log('\n✅ Done!');
  console.log('\n📋 Next Steps:');
  console.log('   1. Test tutor login at: https://ai-study-companion-o94w.vercel.app/login');
  console.log('   2. Verify tutor appears in tutor list API');
  console.log('   3. Test tutor booking flow');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

