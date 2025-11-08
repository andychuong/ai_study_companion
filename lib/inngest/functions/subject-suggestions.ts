import { inngest } from '../client';
import { db } from '@/lib/db';
import { goals, subjectSuggestions, users } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { chatCompletion, extractJSON } from '@/lib/openai/client';
import { logger } from '@/lib/utils/logger';

export const generateSubjectSuggestions = inngest.createFunction(
  { id: 'generate-subject-suggestions' },
  { event: 'goal.completed' },
  async ({ event, step }) => {
    logger.info('generateSubjectSuggestions function triggered', { event });
    const { goalId, studentId, subject } = event.data;
    
    if (!goalId || !studentId || !subject) {
      logger.error('Missing required event data', { goalId, studentId, subject });
      throw new Error('Missing required event data: goalId, studentId, or subject');
    }

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
      try {
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

You MUST return a valid JSON object with a "suggestions" array. The response must be valid JSON and include exactly this structure:

{
  "suggestions": [
    {
      "subject": "Subject Name",
      "description": "Description of the subject",
      "relevance_score": 8,
      "value_proposition": "Why this subject is valuable",
      "related_concepts": ["concept1", "concept2"]
    }
  ]
}

Return 5 suggestions in the array. Each suggestion must have all required fields: subject, description, relevance_score, value_proposition, and related_concepts.`;

        logger.info('Calling OpenAI to generate suggestions', { goalId, studentId, subject });
        
        const completion = await chatCompletion(
          [{ role: 'user', content: prompt }],
          {
            model: 'gpt-4-turbo-preview',
            responseFormat: { type: 'json_object' },
            maxTokens: 2000,
          }
        );

        logger.info('OpenAI response received', { 
          goalId,
          model: completion.model,
          usage: completion.usage,
          hasContent: !!completion.choices[0]?.message?.content,
        });

        // Log the raw content for debugging
        const rawContent = completion.choices[0]?.message?.content;
        if (rawContent) {
          logger.info('OpenAI raw response', { goalId, contentLength: rawContent.length, contentPreview: rawContent.substring(0, 500) });
        } else {
          logger.error('OpenAI response has no content', { goalId, completion });
          throw new Error('OpenAI response has no content');
        }

        let response: {
          suggestions: Array<{
            subject: string;
            description: string;
            relevance_score: number;
            value_proposition: string;
            related_concepts: string[];
          }>;
        };

        try {
          response = extractJSON<{
            suggestions: Array<{
              subject: string;
              description: string;
              relevance_score: number;
              value_proposition: string;
              related_concepts: string[];
            }>;
          }>(completion);
          
          logger.info('JSON parsed successfully', { goalId, hasSuggestions: !!response.suggestions, suggestionCount: response.suggestions?.length || 0 });
        } catch (error) {
          logger.error('Failed to parse OpenAI JSON response', { 
            error, 
            goalId, 
            rawContent: rawContent?.substring(0, 1000),
          });
          throw new Error(`Failed to parse OpenAI response: ${error instanceof Error ? error.message : String(error)}`);
        }

        const suggestions = response?.suggestions || [];
        
        if (suggestions.length === 0) {
          logger.warn('OpenAI returned empty suggestions array', { 
            goalId, 
            response,
            rawContent: rawContent?.substring(0, 1000),
          });
        }
        
        logger.info('Suggestions extracted', { goalId, count: suggestions.length });
        
        return suggestions;
      } catch (error) {
        logger.error('Error generating suggestions', { error, goalId, studentId });
        throw error;
      }
    });

    // Step 4: Store suggestions in database
    await step.run('store-suggestions', async () => {
      try {
        logger.info('Storing suggestions in database', { goalId, count: suggestions.length });
        
        for (const suggestion of suggestions) {
          await db.insert(subjectSuggestions).values({
            studentId,
            completedGoalId: goalId,
            subject: suggestion.subject,
            description: suggestion.description,
            relevanceScore: Math.round(suggestion.relevance_score), // Round to integer
            valueProposition: suggestion.value_proposition,
            status: 'pending',
          });
        }
        
        logger.info('Suggestions stored successfully', {
          studentId,
          goalId,
          suggestionCount: suggestions.length,
        });
      } catch (error) {
        logger.error('Error storing suggestions', { error, goalId, studentId });
        throw error;
      }
    });

    logger.info('Subject suggestions generated successfully', {
      studentId,
      goalId,
      suggestionCount: suggestions.length,
    });

    // TODO: Send notification to student
    // await sendNotification(studentId, 'New subject suggestions available!');
  }
);


