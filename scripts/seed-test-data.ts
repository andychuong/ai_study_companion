/**
 * Test Data Seeding Script
 * 
 * This script creates comprehensive test data for the AI Study Companion:
 * - Tutor user
 * - Test student user (if doesn't exist)
 * - Goals
 * - Sessions with transcripts
 * - Practices
 * - Concepts and mastery tracking
 * 
 * Usage:
 *   npx tsx scripts/seed-test-data.ts
 *   or
 *   npm run seed
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
  console.error('❌ DATABASE_URL is not set. Please check your .env.local file.');
  process.exit(1);
}

// Now import everything else
import { db } from '../lib/db';
import { users, students, goals, sessions, practices, concepts, studentConcepts } from '../lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const TEST_STUDENT_EMAIL = 'test@example.com';
const TEST_STUDENT_PASSWORD = 'password123';
const TUTOR_EMAIL = 'tutor@example.com';
const TUTOR_PASSWORD = 'password123';

async function seed() {
  console.log('🌱 Starting test data seeding...\n');

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
          name: 'Dr. Sarah Johnson',
          role: 'tutor',
        })
        .returning();
      console.log(`✅ Created tutor: ${tutor.email} (ID: ${tutor.id})`);
    } else {
      console.log(`✅ Tutor already exists: ${tutor.email} (ID: ${tutor.id})`);
    }

    // 2. Create or get test student user
    console.log('\n👨‍🎓 Creating test student user...');
    let student = await db.query.users.findFirst({
      where: eq(users.email, TEST_STUDENT_EMAIL),
    });

    if (!student) {
      const studentPasswordHash = await bcrypt.hash(TEST_STUDENT_PASSWORD, 10);
      [student] = await db
        .insert(users)
        .values({
          email: TEST_STUDENT_EMAIL,
          passwordHash: studentPasswordHash,
          name: 'Test User',
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
      { name: 'Chemical Bonding', subject: 'Chemistry', difficulty: 6 },
      { name: 'pH and Acidity', subject: 'Chemistry', difficulty: 4 },
      { name: 'Algebraic Expressions', subject: 'Mathematics', difficulty: 3 },
      { name: 'Oxidation States', subject: 'Chemistry', difficulty: 7 },
      { name: 'Molarity Calculations', subject: 'Chemistry', difficulty: 6 },
    ];

    const createdConcepts = [];
    for (const concept of conceptData) {
      const existing = await db.query.concepts.findFirst({
        where: (concepts, { and, eq }) => 
          and(
            eq(concepts.name, concept.name),
            eq(concepts.subject, concept.subject)
          ),
      });

      if (!existing) {
        const [newConcept] = await db
          .insert(concepts)
          .values({
            name: concept.name,
            subject: concept.subject,
            description: `Learn about ${concept.name} in ${concept.subject}`,
            difficulty: concept.difficulty,
          })
          .returning();
        createdConcepts.push(newConcept);
        console.log(`  ✅ Created concept: ${concept.name}`);
      } else {
        createdConcepts.push(existing);
        console.log(`  ℹ️  Concept already exists: ${concept.name}`);
      }
    }

    // 4. Create goals
    console.log('\n🎯 Creating goals...');
    const goalData = [
      {
        subject: 'Chemistry',
        description: 'Master acid-base chemistry and pH calculations',
        progress: 45,
        targetDate: new Date('2025-12-31'),
      },
      {
        subject: 'Mathematics',
        description: 'Complete Algebra II curriculum',
        progress: 30,
        targetDate: new Date('2025-11-30'),
      },
      {
        subject: 'Chemistry',
        description: 'Understand chemical bonding concepts',
        progress: 100,
        status: 'completed' as const,
        completedAt: new Date('2025-10-15'),
      },
    ];

    for (const goal of goalData) {
      const existing = await db.query.goals.findFirst({
        where: (goals, { and, eq }) =>
          and(
            eq(goals.studentId, student.id),
            eq(goals.subject, goal.subject),
            eq(goals.description, goal.description)
          ),
      });

      if (!existing) {
        await db.insert(goals).values({
          studentId: student.id,
          subject: goal.subject,
          description: goal.description,
          status: goal.status || 'active',
          progress: goal.progress,
          targetDate: goal.targetDate,
          completedAt: goal.completedAt,
        });
        console.log(`  ✅ Created goal: ${goal.subject} - ${goal.description.substring(0, 40)}...`);
      } else {
        console.log(`  ℹ️  Goal already exists: ${goal.subject}`);
      }
    }

    // 5. Create sessions with transcripts
    console.log('\n📝 Creating sessions...');
    const sessionData = [
      {
        sessionDate: new Date('2025-10-15T10:00:00Z'),
        duration: 3600, // 1 hour
        transcript: `Tutor: Good morning! Today we're going to work on acid-base chemistry. Let's start with understanding pH.

Student: I'm a bit confused about pH. What does it actually measure?

Tutor: Great question! pH measures the concentration of hydrogen ions in a solution. The scale goes from 0 to 14, where 7 is neutral.

Student: So lower pH means more acidic?

Tutor: Exactly! Lower pH means higher concentration of H+ ions, which makes it more acidic. For example, lemon juice has a pH around 2, while water is neutral at 7.

Student: How do I calculate pH if I know the H+ concentration?

Tutor: You use the formula: pH = -log[H+]. So if [H+] = 0.001 M, what's the pH?

Student: That would be... -log(0.001) = 3?

Tutor: Perfect! You've got it. Now let's practice with a few more examples...`,
        topics: ['Acid-Base Chemistry', 'pH Calculations', 'Hydrogen Ion Concentration'],
        concepts: [
          { name: 'pH and Acidity', masteryLevel: 75, difficulty: 4 },
          { name: 'Molarity Calculations', masteryLevel: 60, difficulty: 6 },
        ],
      },
      {
        sessionDate: new Date('2025-10-20T14:00:00Z'),
        duration: 2700, // 45 minutes
        transcript: `Tutor: Today we're focusing on chemical bonding. Can you tell me what you know about ionic bonds?

Student: Ionic bonds form when electrons are transferred from one atom to another, right?

Tutor: Correct! And what about covalent bonds?

Student: Those are when atoms share electrons.

Tutor: Excellent! Now let's look at some examples. Sodium chloride is an ionic compound. Why?

Student: Because sodium gives an electron to chlorine, forming Na+ and Cl- ions.

Tutor: Perfect! And water, H2O, is covalent because oxygen and hydrogen share electrons. Let's practice identifying bond types in different compounds...`,
        topics: ['Chemical Bonding', 'Ionic Bonds', 'Covalent Bonds'],
        concepts: [
          { name: 'Chemical Bonding', masteryLevel: 80, difficulty: 6 },
        ],
      },
      {
        sessionDate: new Date('2025-11-01T09:00:00Z'),
        duration: 3600, // 1 hour
        transcript: `Tutor: Let's work on quadratic equations today. Do you remember the quadratic formula?

Student: Yes, it's x = (-b ± √(b² - 4ac)) / 2a

Tutor: Great! Now let's solve x² - 5x + 6 = 0. What are the values of a, b, and c?

Student: a = 1, b = -5, c = 6

Tutor: Perfect! Now plug them into the formula.

Student: x = (5 ± √(25 - 24)) / 2 = (5 ± 1) / 2, so x = 3 or x = 2

Tutor: Excellent work! Let's practice a few more problems...`,
        topics: ['Quadratic Equations', 'Algebra'],
        concepts: [
          { name: 'Quadratic Equations', masteryLevel: 70, difficulty: 5 },
          { name: 'Algebraic Expressions', masteryLevel: 65, difficulty: 3 },
        ],
      },
    ];

    const createdSessions = [];
    for (const session of sessionData) {
      const [newSession] = await db
        .insert(sessions)
        .values({
          studentId: student.id,
          tutorId: tutor.id,
          sessionDate: session.sessionDate,
          duration: session.duration,
          transcript: session.transcript,
          transcriptSource: 'manual_upload',
          transcriptFormat: 'plain_text',
          analysisStatus: 'completed',
          analysisData: {
            topics: session.topics,
            concepts: session.concepts.map(c => ({
              name: c.name,
              difficulty: c.difficulty,
              masteryLevel: c.masteryLevel,
            })),
            studentStrengths: ['Quick learner', 'Good problem-solving skills'],
            areasForImprovement: ['Needs more practice with calculations', 'Review foundational concepts'],
            actionItems: ['Complete practice problems on pH', 'Review bonding types'],
          },
        })
        .returning();
      createdSessions.push(newSession);
      console.log(`  ✅ Created session: ${session.topics[0]} (${new Date(session.sessionDate).toLocaleDateString()})`);
    }

    // 6. Create student concept mastery
    console.log('\n📊 Creating student concept mastery...');
    for (const session of sessionData) {
      for (const conceptData of session.concepts) {
        const concept = createdConcepts.find(c => c.name === conceptData.name);
        if (concept) {
          const existing = await db.query.studentConcepts.findFirst({
            where: (sc, { and, eq }) =>
              and(
                eq(sc.studentId, student.id),
                eq(sc.conceptId, concept.id)
              ),
          });

          if (!existing) {
            await db.insert(studentConcepts).values({
              studentId: student.id,
              conceptId: concept.id,
              masteryLevel: conceptData.masteryLevel,
              lastPracticed: session.sessionDate,
            });
            console.log(`  ✅ Created mastery: ${concept.name} (${conceptData.masteryLevel}%)`);
          } else {
            // Update if higher mastery
            if (conceptData.masteryLevel > existing.masteryLevel) {
              await db
                .update(studentConcepts)
                .set({
                  masteryLevel: conceptData.masteryLevel,
                  lastPracticed: session.sessionDate,
                })
                .where(eq(studentConcepts.id, existing.id));
              console.log(`  ✅ Updated mastery: ${concept.name} (${conceptData.masteryLevel}%)`);
            }
          }
        }
      }
    }

    // 7. Create practices
    console.log('\n📝 Creating practices...');
    const practiceData = [
      {
        sessionId: createdSessions[0]?.id,
        status: 'completed' as const,
        questions: [
          {
            id: uuidv4(),
            question: 'What is the pH of a solution with [H+] = 0.001 M?',
            type: 'multiple_choice',
            options: ['1', '2', '3', '4'],
            difficulty: 5,
            correctAnswer: '3',
            explanation: 'pH = -log[H+]. For [H+] = 0.001 M, pH = -log(0.001) = 3.',
          },
          {
            id: uuidv4(),
            question: 'What is the chemical formula for water?',
            type: 'short_answer',
            difficulty: 1,
            correctAnswer: 'H2O',
            explanation: 'Water is composed of two hydrogen atoms and one oxygen atom.',
          },
        ],
        score: 100,
        completedAt: new Date('2025-10-16'),
      },
      {
        sessionId: createdSessions[1]?.id,
        status: 'assigned' as const,
        questions: [
          {
            id: uuidv4(),
            question: 'Which type of bond forms between sodium and chlorine?',
            type: 'multiple_choice',
            options: ['Ionic', 'Covalent', 'Metallic', 'Hydrogen'],
            difficulty: 4,
            correctAnswer: 'Ionic',
            explanation: 'Sodium chloride forms an ionic bond because electrons are transferred from sodium to chlorine.',
          },
        ],
        dueAt: new Date('2025-11-15'),
      },
    ];

    for (const practice of practiceData) {
      // Format questions to match expected structure (with both id and questionId)
      const formattedQuestions = practice.questions.map((q) => ({
        id: q.id,
        questionId: q.id, // Include both for compatibility
        question: q.question,
        type: q.type,
        options: q.options,
        difficulty: q.difficulty,
        correctAnswer: q.correctAnswer,
        correct_answer: q.correctAnswer, // Include both for compatibility
        explanation: q.explanation,
        conceptId: createdConcepts[0]?.id || uuidv4(), // Assign to first concept
      }));

      // Create answers array with proper question IDs if practice is completed
      let answers = null;
      if (practice.status === 'completed' && formattedQuestions) {
        answers = formattedQuestions.map((q) => ({
          questionId: q.id,
          answer: q.correctAnswer,
          timestamp: practice.completedAt?.toISOString() || new Date().toISOString(),
        }));
      }

      await db.insert(practices).values({
        studentId: student.id,
        sessionId: practice.sessionId || null,
        status: practice.status,
        questions: formattedQuestions as any,
        answers: answers,
        score: practice.score || null,
        completedAt: practice.completedAt || null,
        dueAt: practice.dueAt || null,
      });
      console.log(`  ✅ Created practice: ${practice.status} (${formattedQuestions.length} questions)`);
    }

    console.log('\n✨ Seeding completed successfully!\n');
    console.log('📋 Summary:');
    console.log(`  - Tutor: ${tutor.email}`);
    console.log(`  - Student: ${student.email}`);
    console.log(`  - Concepts: ${createdConcepts.length}`);
    console.log(`  - Goals: ${goalData.length}`);
    console.log(`  - Sessions: ${createdSessions.length}`);
    console.log(`  - Practices: ${practiceData.length}`);
    console.log('\n💡 You can now:');
    console.log(`  - Login as student: ${TEST_STUDENT_EMAIL} / ${TEST_STUDENT_PASSWORD}`);
    console.log(`  - Login as tutor: ${TUTOR_EMAIL} / ${TUTOR_PASSWORD}`);
    console.log('  - View goals, sessions, and practices in the UI');
    console.log('  - Upload transcripts using tutor ID:', tutor.id);

  } catch (error) {
    console.error('\n❌ Error seeding data:', error);
    throw error;
  }
}

// Run the seed function
seed()
  .then(() => {
    console.log('\n✅ Seed script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Seed script failed:', error);
    process.exit(1);
  });

