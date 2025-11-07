import { inngest } from '../client';
import { db } from '@/lib/db';
import { goals, subjectSuggestions, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { chatCompletion, extractJSON } from '@/lib/openai/client';
import { logger } from '@/lib/utils/logger';

export const generateSubjectSuggestions = inngest.createFunction(
  { id: 'generate-subject-suggestions' },
  { event: 'goal.completed' },
  async ({ event, step }) => {
    const { goalId, studentId, subject } = event.data;

    // Step 1: Get completed goal details
    const goal = await step.run('get-goal', async () => {
      const goalData = await db.query.goals.findFirst({
        where: eq(goals.id, goalId),
      });
      if (!goalData) {
        throw new Error(`Goal ${goalId} not found`);
      }
      return goalData;
    });

    // Step 2: Get student profile and history
    const student = await step.run('get-student', async () => {
      const studentData = await db.query.users.findFirst({
        where: eq(users.id, studentId),
      });
      if (!studentData) {
        throw new Error(`Student ${studentId} not found`);
      }
      return studentData;
    });

    const completedGoals = await step.run('get-completed-goals', async () => {
      return db.query.goals.findMany({
        where: and(eq(goals.studentId, studentId), eq(goals.status, 'completed')),
      });
    });

    // Step 3: Generate suggestions using GPT-4
    const suggestions = await step.run('generate-suggestions', async () => {
      const completedSubjects = completedGoals.map((g) => g.subject).join(', ');

      const prompt = `${student.name || 'A student'} has just completed their goal: ${goal.subject}

Student profile:
- Grade: ${student.grade || 'Unknown'}
- Completed subjects: ${completedSubjects}
- Learning style: ${student.grade ? 'Standard' : 'Unknown'}

Generate 5 related subject suggestions that:
1. Build on the completed goal naturally
2. Align with the student's academic level
3. Address potential future needs (e.g., college prep)
4. Include compelling value propositions
5. Are ranked by relevance

Use subject mapping logic:
- SAT Complete → College Essays, Study Skills, AP Prep, ACT Prep
- Chemistry → Physics, Biology, STEM Subjects
- Math → Advanced Math, Physics, Statistics
- English → Writing Skills, Literature Analysis

Return JSON array: [{
  "subject": string,
  "description": string,
  "relevance_score": number (0-10),
  "value_proposition": string,
  "related_concepts": string[]
}]`;

      const completion = await chatCompletion(
        [{ role: 'user', content: prompt }],
        {
          model: 'gpt-4-turbo-preview',
          responseFormat: { type: 'json_object' },
          maxTokens: 2000,
        }
      );

      const response = extractJSON<{
        suggestions: Array<{
          subject: string;
          description: string;
          relevance_score: number;
          value_proposition: string;
          related_concepts: string[];
        }>;
      }>(completion);

      return response.suggestions || [];
    });

    // Step 4: Store suggestions in database
    await step.run('store-suggestions', async () => {
      for (const suggestion of suggestions) {
        await db.insert(subjectSuggestions).values({
          studentId,
          completedGoalId: goalId,
          subject: suggestion.subject,
          description: suggestion.description,
          relevanceScore: suggestion.relevance_score,
          valueProposition: suggestion.value_proposition,
          status: 'pending',
        });
      }
    });

    logger.info('Subject suggestions generated', {
      studentId,
      goalId,
      suggestionCount: suggestions.length,
    });

    // TODO: Send notification to student
    // await sendNotification(studentId, 'New subject suggestions available!');
  }
);


