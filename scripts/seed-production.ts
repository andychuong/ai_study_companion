#!/usr/bin/env tsx
/**
 * Production database seeding script
 * 
 * This script seeds the production database with test data:
 * - Tutor user (tutor@example.com / password123)
 * - Student user (student@example.com / password123)
 * - Multiple concepts, goals, sessions, and practices
 * 
 * Usage:
 *   DATABASE_URL="your-production-url" npx tsx scripts/seed-production.ts
 * 
 * Or set DATABASE_URL in your environment:
 *   export DATABASE_URL="your-production-url"
 *   npx tsx scripts/seed-production.ts
 * 
 * WARNING: This will add data to your production database!
 * Make sure you have the correct DATABASE_URL before running.
 */

// Load environment variables FIRST using require (executes immediately)
const dotenv = require('dotenv');
const path = require('path');

// Try multiple env file locations
const envPaths = ['.env.local', '.env'];
let envLoaded = false;
for (const envPath of envPaths) {
  const result = dotenv.config({ path: path.resolve(process.cwd(), envPath) });
  if (!result.error) {
    console.log(`✅ Loaded environment from ${envPath}`);
    envLoaded = true;
    break;
  }
}

if (!envLoaded) {
  console.warn('⚠️  No .env file found, using system environment variables');
}

// Verify DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL is not set');
  console.error('');
  console.error('Please set DATABASE_URL environment variable:');
  console.error('  export DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"');
  console.error('  npx tsx scripts/seed-production.ts');
  console.error('');
  console.error('Or pass it directly:');
  console.error('  DATABASE_URL="your-url" npx tsx scripts/seed-production.ts');
  process.exit(1);
}

// Validate DATABASE_URL format
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl.startsWith('postgresql://') && !databaseUrl.startsWith('postgres://')) {
  console.error('❌ ERROR: DATABASE_URL must start with postgresql:// or postgres://');
  process.exit(1);
}

// Warn about production
console.log('');
console.log('⚠️  WARNING: This will seed the PRODUCTION database!');
console.log(`📊 Database: ${databaseUrl.split('@')[1]?.split('/')[0] || 'unknown'}`);
console.log('');
console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...');
console.log('');

// Now import everything else
import { db } from '../lib/db';
import { users, students, goals, sessions, practices, concepts, studentConcepts } from '../lib/db/schema';
import { eq, and } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const TUTOR_EMAIL = 'tutor@example.com';
const TUTOR_PASSWORD = 'password123';
const TUTOR_NAME = 'Dr. Sarah Johnson';

const STUDENT_EMAIL = 'student@example.com';
const STUDENT_PASSWORD = 'password123';
const STUDENT_NAME = 'Alex Chen';

async function seed() {
  // Wait 5 seconds before proceeding
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  console.log('🌱 Starting production database seeding...\n');

  try {
    // 1. Create or get tutor user
    console.log('📚 Creating tutor user...');
    let tutor = await db.query.users.findFirst({
      where: eq(users.email, TUTOR_EMAIL),
    });

    if (!tutor) {
      const tutorPasswordHash = await bcrypt.hash(TUTOR_PASSWORD, 10);
      [tutor] = await db
        .insert(users)
        .values({
          email: TUTOR_EMAIL,
          passwordHash: tutorPasswordHash,
          name: TUTOR_NAME,
          role: 'tutor',
        })
        .returning();
      console.log(`✅ Created tutor: ${tutor.email} (ID: ${tutor.id})`);
    } else {
      console.log(`✅ Tutor already exists: ${tutor.email} (ID: ${tutor.id})`);
    }

    // 2. Create or get student user
    console.log('\n👨‍🎓 Creating student user...');
    let student = await db.query.users.findFirst({
      where: eq(users.email, STUDENT_EMAIL),
    });

    if (!student) {
      const studentPasswordHash = await bcrypt.hash(STUDENT_PASSWORD, 10);
      [student] = await db
        .insert(users)
        .values({
          email: STUDENT_EMAIL,
          passwordHash: studentPasswordHash,
          name: STUDENT_NAME,
          role: 'student',
          grade: 10,
        })
        .returning();

      // Create student profile
      await db.insert(students).values({
        userId: student.id,
        grade: 10,
        learningStyle: 'visual',
        interests: ['Chemistry', 'Mathematics', 'Physics'],
        strengths: ['Problem-solving', 'Critical thinking'],
      });

      console.log(`✅ Created student: ${student.email} (ID: ${student.id})`);
    } else {
      console.log(`✅ Student already exists: ${student.email} (ID: ${student.id})`);
    }

    // 3. Create concepts
    console.log('\n📖 Creating concepts...');
    const conceptData = [
      { name: 'Quadratic Equations', subject: 'Mathematics', difficulty: 5 },
      { name: 'Acid-Base Chemistry', subject: 'Chemistry', difficulty: 6 },
      { name: 'Newton\'s Laws', subject: 'Physics', difficulty: 4 },
      { name: 'Cell Biology', subject: 'Biology', difficulty: 5 },
    ];

    const createdConcepts: Array<typeof concepts.$inferSelect> = [];
    for (const concept of conceptData) {
      const existing = await db.query.concepts.findFirst({
        where: and(
          eq(concepts.name, concept.name),
          eq(concepts.subject, concept.subject)
        ),
      });

      if (!existing) {
        const [created] = await db.insert(concepts).values(concept).returning();
        createdConcepts.push(created);
        console.log(`  ✅ Created concept: ${concept.name} (${concept.subject})`);
      } else {
        createdConcepts.push(existing);
        console.log(`  ✅ Concept already exists: ${concept.name}`);
      }
    }

    // 4. Create goals
    console.log('\n🎯 Creating goals...');
    const goalData = [
      {
        subject: 'Mathematics',
        description: 'Master quadratic equations and their applications',
        status: 'active' as const,
        progress: 60,
      },
      {
        subject: 'Chemistry',
        description: 'Understand acid-base reactions and pH calculations',
        status: 'active' as const,
        progress: 40,
      },
      {
        subject: 'Physics',
        description: 'Complete Newton\'s Laws of Motion',
        status: 'completed' as const,
        progress: 100,
        completedAt: new Date('2025-10-01'),
      },
    ];

    const createdGoals: Array<typeof goals.$inferSelect> = [];
    for (const goal of goalData) {
      const [created] = await db.insert(goals).values({
        studentId: student.id,
        ...goal,
      }).returning();
      createdGoals.push(created);
      console.log(`  ✅ Created goal: ${goal.subject} (${goal.status})`);
    }

    // 5. Create sessions
    console.log('\n📝 Creating sessions...');
    const sessionData = [
      {
        sessionDate: new Date('2025-10-10T10:00:00Z'),
        duration: 3600, // 1 hour
        transcript: 'Tutor: Good morning! Today we\'re working on quadratic equations...\nStudent: I understand the basic form ax² + bx + c = 0...',
        transcriptSource: 'manual_upload',
        transcriptFormat: 'plain_text',
        analysisStatus: 'completed' as const,
        analysisData: {
          topics: ['Quadratic Equations', 'Factoring'],
          concepts: [
            { name: 'Quadratic Equations', difficulty: 5, masteryLevel: 70 },
          ],
          studentStrengths: ['Algebraic manipulation'],
          areasForImprovement: ['Word problems'],
          actionItems: ['Practice more word problems'],
        },
      },
      {
        sessionDate: new Date('2025-10-15T14:00:00Z'),
        duration: 2700, // 45 minutes
        transcript: 'Tutor: Let\'s review acid-base chemistry today...\nStudent: I know pH measures acidity...',
        transcriptSource: 'manual_upload',
        transcriptFormat: 'plain_text',
        analysisStatus: 'completed' as const,
        analysisData: {
          topics: ['Acid-Base Chemistry', 'pH Calculations'],
          concepts: [
            { name: 'Acid-Base Chemistry', difficulty: 6, masteryLevel: 65 },
          ],
          studentStrengths: ['Understanding concepts'],
          areasForImprovement: ['Calculations'],
          actionItems: ['Practice pH calculations'],
        },
      },
    ];

    const createdSessions: Array<typeof sessions.$inferSelect> = [];
    for (const session of sessionData) {
      const [created] = await db.insert(sessions).values({
        studentId: student.id,
        tutorId: tutor.id,
        ...session,
      }).returning();
      createdSessions.push(created);
      console.log(`  ✅ Created session: ${session.sessionDate.toISOString()}`);
    }

    // 6. Create practices
    console.log('\n📚 Creating practices...');
    const practiceData = [
      {
        sessionId: createdSessions[0]?.id || null,
        status: 'completed' as const,
        questions: [
          {
            id: uuidv4(),
            question: 'Solve for x: x² - 5x + 6 = 0',
            type: 'multiple_choice',
            options: ['x = 2, x = 3', 'x = 1, x = 6', 'x = -2, x = -3', 'x = 0, x = 5'],
            difficulty: 5,
            correctAnswer: 'x = 2, x = 3',
            explanation: 'Factor: (x - 2)(x - 3) = 0, so x = 2 or x = 3',
          },
        ],
        score: 100,
        completedAt: new Date('2025-10-11'),
      },
    ];

    for (const practice of practiceData) {
      const formattedQuestions = practice.questions.map((q) => ({
        questionId: q.id,
        question: q.question,
        type: q.type,
        options: q.options,
        difficulty: q.difficulty,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        conceptId: createdConcepts[0]?.id || uuidv4(),
      }));

      const answers = formattedQuestions.map((q) => ({
        questionId: q.questionId,
        answer: q.correctAnswer,
        timestamp: practice.completedAt?.toISOString() || new Date().toISOString(),
      }));

      await db.insert(practices).values({
        studentId: student.id,
        sessionId: practice.sessionId,
        status: practice.status,
        questions: formattedQuestions as any,
        answers: answers,
        score: practice.score,
        completedAt: practice.completedAt,
      });
      console.log(`  ✅ Created practice: ${practice.status} (${formattedQuestions.length} questions)`);
    }

    // 7. Create student concept mastery
    console.log('\n📊 Creating student concept mastery...');
    for (const concept of createdConcepts) {
      const existing = await db.query.studentConcepts.findFirst({
        where: and(
          eq(studentConcepts.studentId, student.id),
          eq(studentConcepts.conceptId, concept.id)
        ),
      });

      if (!existing) {
        await db.insert(studentConcepts).values({
          studentId: student.id,
          conceptId: concept.id,
          masteryLevel: Math.floor(Math.random() * 40) + 50, // 50-90
          lastPracticed: new Date(),
        });
        console.log(`  ✅ Created mastery: ${concept.name} (${concept.subject})`);
      }
    }

    console.log('\n✨ Seeding completed successfully!\n');
    console.log('📋 Summary:');
    console.log(`  - Tutor: ${tutor.email} (password: ${TUTOR_PASSWORD})`);
    console.log(`  - Student: ${student.email} (password: ${STUDENT_PASSWORD})`);
    console.log(`  - Concepts: ${createdConcepts.length}`);
    console.log(`  - Goals: ${createdGoals.length}`);
    console.log(`  - Sessions: ${createdSessions.length}`);
    console.log(`  - Practices: ${practiceData.length}`);
    console.log('\n💡 You can now:');
    console.log('  1. Login as tutor at: /login (email: tutor@example.com)');
    console.log('  2. Login as student at: /login (email: student@example.com)');
    console.log('  3. Test the tutor dashboard at: /tutor');
    console.log('  4. Test the booking flow at: /sessions/book');
    console.log('');

  } catch (error) {
    console.error('\n❌ Seeding failed:');
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
  }
}

// Run seeding
seed().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

