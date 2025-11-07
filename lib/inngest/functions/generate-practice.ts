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
        .map((c) => `${c.name} (difficulty: ${c.difficulty}, mastery: ${c.masteryLevel}%)`)
        .join(', ');

      const prompt = `Generate adaptive practice problems for ${student.name || 'a student'}, a ${student.grade || 10}-grade student.

Concepts covered in recent session:
${conceptsText}

Student's current mastery level: ${targetDifficulty}/10
Difficulty target: ${targetDifficulty}

Generate 5 practice problems that:
1. Reinforce concepts from the session
2. Match the student's current ability level
3. Include varied question types (multiple_choice, short_answer, problem_solving)
4. Progress from easier to more challenging
5. Include detailed answer explanations

Return JSON array with fields: questionId, question, type, options (for multiple choice), difficulty, correct_answer, explanation, conceptId`;

      const completion = await chatCompletion(
        [{ role: 'user', content: prompt }],
        {
          model: 'gpt-4-turbo-preview',
          responseFormat: { type: 'json_object' },
          maxTokens: 3000,
        }
      );

      const response = extractJSON<{ problems: Array<{
        questionId: string;
        question: string;
        type: string;
        options?: string[];
        difficulty: number;
        correct_answer: string;
        explanation: string;
        conceptId: string;
      }> }>(completion);

      return response.problems || [];
    });

    // Step 6: Store practice
    await step.run('store-practice', async () => {
      // Get concept IDs for questions
      const questionsWithConceptIds = await Promise.all(
        practiceProblems.map(async (problem) => {
          let conceptId = problem.conceptId;
          
          // Find concept by name if ID not provided
          if (!conceptId || conceptId === '') {
            const concept = await db.query.concepts.findFirst({
              where: eq(concepts.name, problem.conceptId || ''),
            });
            conceptId = concept?.id || '';
          }

          return {
            questionId: problem.questionId,
            question: problem.question,
            type: problem.type,
            options: problem.options,
            difficulty: problem.difficulty,
            conceptId,
            correct_answer: problem.correct_answer,
            explanation: problem.explanation,
          };
        })
      );

      await db
        .update(practices)
        .set({
          questions: questionsWithConceptIds,
          status: 'assigned',
          dueAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        })
        .where(eq(practices.id, practiceId));
    });

    logger.info('Practice generated', { practiceId, studentId, questionCount: practiceProblems.length });
  }
);


