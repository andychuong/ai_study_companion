import { inngest } from '../client';
import { db } from '@/lib/db';
import { goals, subjectSuggestions, users } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { chatCompletion, extractJSON } from '@/lib/openai/client';
import { logger } from '@/lib/utils/logger';

/**
 * Generate study topic and practice suggestions when a goal is created
 * These suggestions help the student understand what to study and practice to achieve their goal
 */
export const generateGoalStudySuggestions = inngest.createFunction(
  { id: 'generate-goal-study-suggestions' },
  { event: 'goal.created' },
  async ({ event, step }) => {
    logger.info('generateGoalStudySuggestions function triggered', { event });
    const { goalId, studentId, subject, description } = event.data;
    
    if (!goalId || !studentId || !subject) {
      logger.error('Missing required event data', { goalId, studentId, subject });
      throw new Error('Missing required event data: goalId, studentId, or subject');
    }

    // Step 1-3: Parallelize database queries for speed
    const result = await step.run('fetch-data', async () => {
      const [goalData, studentData, otherGoalsData] = await Promise.all([
        db.query.goals.findFirst({
          where: eq(goals.id, goalId),
        }),
        db.query.users.findFirst({
          where: eq(users.id, studentId),
        }),
        db.query.goals.findMany({
          where: and(
            eq(goals.studentId, studentId),
            eq(goals.status, 'active')
          ),
        }),
      ]);

      if (!goalData) {
        throw new Error(`Goal ${goalId} not found`);
      }
      if (!studentData) {
        throw new Error(`Student ${studentId} not found`);
      }

      return {
        goal: goalData,
        student: studentData,
        otherGoals: otherGoalsData || [],
      };
    });

    const goal = result.goal;
    const student = result.student;
    const otherGoals = result.otherGoals;

    // Step 4: Generate study topic and practice suggestions using GPT-4
    const suggestions = await step.run('generate-suggestions', async () => {
      try {
        const otherSubjects = otherGoals
          .filter(g => g.id !== goalId)
          .map(g => g.subject)
          .join(', ') || 'None';

        // Optimized, more concise prompt for faster generation
        const prompt = `Generate 5-7 study topic suggestions for a student's goal:

Goal: ${goal.subject}
Description: ${description || 'No description'}
Grade: ${student.grade || 'Unknown'}
Other goals: ${otherSubjects || 'None'}

Return JSON with this structure:
{
  "suggestions": [
    {
      "topic": "Topic name",
      "description": "Why important for goal",
      "practice_activities": ["Activity 1", "Activity 2"],
      "difficulty": "beginner|intermediate|advanced",
      "prerequisites": ["Prereq 1"],
      "estimated_hours": 5,
      "relevance_score": 9
    }
  ]
}

Make suggestions specific, actionable, and appropriate for grade level. Include foundational and advanced topics. Return 5-7 suggestions.`;

        logger.info('Calling OpenAI to generate study suggestions', { goalId, studentId, subject });
        
        // Use faster model: gpt-4o is faster than gpt-4-turbo-preview
        // Try gpt-4o first, fallback to gpt-3.5-turbo for even faster generation if needed
        let completion;
        try {
          completion = await chatCompletion(
            [{ role: 'user', content: prompt }],
            {
              model: 'gpt-4o', // Faster than gpt-4-turbo-preview, maintains quality
              responseFormat: { type: 'json_object' },
              maxTokens: 2000, // Reduced from 3000 for faster generation
              temperature: 0.7,
            }
          );
        } catch (error: any) {
          // If gpt-4o fails or is unavailable, fallback to faster gpt-3.5-turbo
          logger.warn('gpt-4o failed, falling back to gpt-3.5-turbo for speed', { error, goalId });
          completion = await chatCompletion(
            [{ role: 'user', content: prompt }],
            {
              model: 'gpt-3.5-turbo', // Fastest option
              responseFormat: { type: 'json_object' },
              maxTokens: 2000,
              temperature: 0.7,
            }
          );
        }

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
            topic: string;
            description: string;
            practice_activities: string[];
            difficulty: 'beginner' | 'intermediate' | 'advanced';
            prerequisites: string[];
            estimated_hours: number;
            relevance_score: number;
          }>;
        };

        try {
          response = extractJSON<{
            suggestions: Array<{
              topic: string;
              description: string;
              practice_activities: string[];
              difficulty: 'beginner' | 'intermediate' | 'advanced';
              prerequisites: string[];
              estimated_hours: number;
              relevance_score: number;
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
        logger.error('Error generating study suggestions', { error, goalId, studentId });
        throw error;
      }
    });

    // Step 5: Store suggestions in database (batch insert for speed)
    await step.run('store-suggestions', async () => {
      try {
        logger.info('Storing study suggestions in database', { goalId, count: suggestions.length });
        
        // Batch insert all suggestions at once for better performance
        const valuesToInsert = suggestions.map((suggestion) => {
          const metadata = {
            difficulty: suggestion.difficulty,
            prerequisites: suggestion.prerequisites,
            estimated_hours: suggestion.estimated_hours,
            practice_activities: suggestion.practice_activities,
          };

          return {
            studentId,
            completedGoalId: goalId, // Using this field to link to the active goal
            subject: suggestion.topic,
            description: suggestion.description,
            relevanceScore: Math.round(suggestion.relevance_score),
            valueProposition: JSON.stringify(metadata),
            status: 'pending' as const,
          };
        });

        // Batch insert all at once instead of one-by-one
        if (valuesToInsert.length > 0) {
          await db.insert(subjectSuggestions).values(valuesToInsert);
        }
        
        logger.info('Study suggestions stored successfully', {
          studentId,
          goalId,
          suggestionCount: suggestions.length,
        });
      } catch (error) {
        logger.error('Error storing study suggestions', { error, goalId, studentId });
        throw error;
      }
    });

    logger.info('Goal study suggestions generated successfully', {
      studentId,
      goalId,
      suggestionCount: suggestions.length,
    });

    // TODO: Send notification to student
    // await sendNotification(studentId, 'Study suggestions for your new goal are ready!');
  }
);

