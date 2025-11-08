import { inngest } from '../client';
import { db } from '@/lib/db';
import { practices, sessions, users, studentConcepts, concepts } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { chatCompletion, extractJSON } from '@/lib/openai/client';
import { logger } from '@/lib/utils/logger';

export const generatePractice = inngest.createFunction(
  { id: 'generate-practice' },
  { event: 'practice.generate' },
  async ({ event, step }) => {
    const { practiceId, sessionId, studentId, conceptIds } = event.data;

    // Step 0: Create practice record if not provided
    const practice = await step.run('create-practice', async () => {
      if (practiceId) {
        // Practice already exists, fetch it
        const existingPractice = await db.query.practices.findFirst({
          where: eq(practices.id, practiceId),
        });
        if (existingPractice) {
          return existingPractice;
        }
      }

      // Create new practice record
      const [newPractice] = await db
        .insert(practices)
        .values({
          studentId,
          sessionId,
          status: 'assigned',
          questions: [], // Will be populated by this function
        })
        .returning();
      
      return newPractice;
    });

    // Step 1: Get session data
    const session = await step.run('get-session', async () => {
      const sessionData = await db.query.sessions.findFirst({
        where: eq(sessions.id, sessionId),
      });
      if (!sessionData) {
        throw new Error(`Session ${sessionId} not found`);
      }
      return sessionData;
    });

    // Step 2: Get student profile
    const student = await step.run('get-student', async () => {
      const studentData = await db.query.users.findFirst({
        where: eq(users.id, studentId),
      });
      if (!studentData) {
        throw new Error(`Student ${studentId} not found`);
      }
      return studentData;
    });

    // Step 3: Get student mastery levels
    const masteryLevels = await step.run('get-mastery', async () => {
      const studentConceptsList = await db.query.studentConcepts.findMany({
        where: eq(studentConcepts.studentId, studentId),
      });
      return studentConceptsList;
    });

    // Step 4: Calculate target difficulty
    const targetDifficulty = await step.run('calculate-difficulty', async () => {
      const conceptsFromSession = session.analysisData?.concepts || [];
      if (conceptsFromSession.length === 0) return 5;

      const avgMastery = conceptsFromSession.reduce(
        (sum, c) => sum + (c.masteryLevel || 0),
        0
      ) / conceptsFromSession.length;

      // Target difficulty slightly above current mastery
      return Math.min(10, Math.max(1, Math.round(avgMastery / 10) + 1));
    });

    // Step 5: Generate practice problems
    const practiceProblems = await step.run('generate-practice', async () => {
      const conceptsList = session.analysisData?.concepts || [];
      const conceptsText = conceptsList
        .map((c) => {
          // Concepts from database always have name (normalized during storage)
          const conceptName = c.name || 'Unknown Concept';
          return `${conceptName} (difficulty: ${c.difficulty || 5}, mastery: ${c.masteryLevel || 50}%)`;
        })
        .join(', ');

      const prompt = `Generate adaptive practice problems for ${student.name || 'a student'}, a ${student.grade || 10}-grade student.

Concepts covered in recent session:
${conceptsText || 'General concepts'}

Student's current mastery level: ${targetDifficulty}/10
Difficulty target: ${targetDifficulty}

Generate 5 practice problems that:
1. Reinforce concepts from the session
2. Match the student's current ability level
3. Include varied question types (multiple_choice, short_answer, problem_solving)
4. Progress from easier to more challenging
5. Include detailed answer explanations

Return JSON with a "problems" array. Each problem must have:
- questionId: unique identifier (string)
- question: the question text (string)
- type: question type (string: "multiple_choice", "short_answer", or "problem_solving")
- options: array of options for multiple choice questions (optional, only for multiple_choice)
- difficulty: number between 1-10 (number)
- correct_answer: the correct answer (string)
- explanation: detailed explanation (string)
- conceptId: concept identifier or name (string)`;

      const completion = await chatCompletion(
        [{ role: 'user', content: prompt }],
        {
          model: 'gpt-4-turbo-preview',
          responseFormat: { type: 'json_object' },
          maxTokens: 3000,
        }
      );

      const response = extractJSON<{ problems: Array<{
        questionId?: string;
        question?: string;
        type?: string;
        options?: string[];
        difficulty?: number;
        correct_answer?: string;
        correctAnswer?: string;
        explanation?: string;
        conceptId?: string;
      }> }>(completion);

      return response.problems || [];
    });

    // Step 6: Store practice
    await step.run('store-practice', async () => {
      // Validate and normalize questions
      const questionResults = await Promise.all(
        practiceProblems.map(async (problem) => {
          // Validate required fields
          if (
            !problem ||
            typeof problem !== 'object' ||
            !problem.questionId ||
            typeof problem.questionId !== 'string' ||
            problem.questionId.trim().length === 0 ||
            !problem.question ||
            typeof problem.question !== 'string' ||
            problem.question.trim().length === 0 ||
            !problem.type ||
            typeof problem.type !== 'string' ||
            typeof problem.difficulty !== 'number' ||
            problem.difficulty < 1 ||
            problem.difficulty > 10
          ) {
            return null;
          }

          // Resolve concept ID
          let conceptId = problem.conceptId || '';
          
          // Helper function to check if a string is a valid UUID
          const isValidUUID = (str: string): boolean => {
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            return uuidRegex.test(str);
          };
          
          // If conceptId is provided, try to find the concept
          if (conceptId && conceptId.trim().length > 0) {
            let concept = null;
            
            // Only try to find by ID if it's a valid UUID
            if (isValidUUID(conceptId)) {
              concept = await db.query.concepts.findFirst({
                where: eq(concepts.id, conceptId),
              });
            }
            
            // If not found by ID (or not a UUID), try to find by name
            if (!concept) {
              concept = await db.query.concepts.findFirst({
                where: eq(concepts.name, conceptId),
              });
            }
            
            if (concept) {
              conceptId = concept.id;
            } else {
              // If concept not found, use the first concept from the session or create a placeholder
              const sessionConcepts = session.analysisData?.concepts || [];
              if (sessionConcepts.length > 0) {
                // Concepts from database always have name (normalized during storage)
                const sessionConceptName = sessionConcepts[0].name || '';
                const foundConcept = await db.query.concepts.findFirst({
                  where: eq(concepts.name, sessionConceptName),
                });
                conceptId = foundConcept?.id || '';
              }
            }
          }

          // If still no conceptId, use empty string (will be stored but not linked)
          if (!conceptId || conceptId.trim().length === 0) {
            conceptId = '';
          }

          return {
            questionId: problem.questionId.trim(),
            question: problem.question.trim(),
            type: problem.type.trim(),
            options: problem.options && Array.isArray(problem.options) ? problem.options : undefined,
            difficulty: problem.difficulty,
            conceptId: conceptId,
            correct_answer: problem.correct_answer || problem.correctAnswer || '',
            explanation: problem.explanation || '',
          };
        })
      );

      // Filter out null values
      const validQuestions = questionResults.filter((q): q is NonNullable<typeof q> => q !== null);

      if (validQuestions.length === 0) {
        logger.warn('No valid questions to store', { practiceId: practice.id, studentId, rawProblems: practiceProblems });
        throw new Error('No valid questions generated');
      }

      await db
        .update(practices)
        .set({
          questions: validQuestions,
          status: 'assigned',
          dueAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        })
        .where(eq(practices.id, practice.id));
    });

    logger.info('Practice generated', { practiceId: practice.id, studentId, questionCount: practiceProblems.length });
  }
);



