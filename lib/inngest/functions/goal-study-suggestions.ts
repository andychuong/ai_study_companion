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

    // Step 1: Get goal details
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

    // Step 3: Get student's other goals for context
    const otherGoals = await step.run('get-other-goals', async () => {
      return db.query.goals.findMany({
        where: and(
          eq(goals.studentId, studentId),
          eq(goals.status, 'active')
        ),
      });
    });

    // Step 4: Generate study topic and practice suggestions using GPT-4
    const suggestions = await step.run('generate-suggestions', async () => {
      try {
        const otherSubjects = otherGoals
          .filter(g => g.id !== goalId)
          .map(g => g.subject)
          .join(', ') || 'None';

        const prompt = `${student.name || 'A student'} has created a new learning goal:

Goal: ${goal.subject}
Description: ${description || 'No description provided'}
Target Date: ${goal.targetDate ? new Date(goal.targetDate).toLocaleDateString() : 'Not set'}

Student profile:
- Grade: ${student.grade || 'Unknown'}
- Other active goals: ${otherSubjects || 'None'}
- Learning style: ${student.grade ? 'Standard' : 'Unknown'}

Generate 5-7 study topic and practice suggestions that will help this student achieve their goal. Each suggestion should include:

1. A specific study topic or concept to focus on
2. Why this topic is important for achieving the goal
3. Suggested practice activities or exercises
4. Estimated difficulty level
5. Prerequisites (if any)

The suggestions should:
- Be specific and actionable
- Build a logical learning path toward the goal
- Include both foundational concepts and advanced topics
- Suggest concrete practice activities (e.g., "Practice solving quadratic equations", "Read and analyze 3 sample essays")
- Be appropriate for the student's grade level
- Consider their other active goals for context

You MUST return a valid JSON object with a "suggestions" array. The response must be valid JSON and include exactly this structure:

{
  "suggestions": [
    {
      "topic": "Topic name (e.g., 'Quadratic Equations')",
      "description": "Why this topic is important for the goal",
      "practice_activities": ["Activity 1", "Activity 2", "Activity 3"],
      "difficulty": "beginner|intermediate|advanced",
      "prerequisites": ["Prerequisite 1", "Prerequisite 2"],
      "estimated_hours": 5,
      "relevance_score": 9
    }
  ]
}

Return 5-7 suggestions in the array. Each suggestion must have all required fields: topic, description, practice_activities, difficulty, prerequisites, estimated_hours, and relevance_score.`;

        logger.info('Calling OpenAI to generate study suggestions', { goalId, studentId, subject });
        
        const completion = await chatCompletion(
          [{ role: 'user', content: prompt }],
          {
            model: 'gpt-4-turbo-preview',
            responseFormat: { type: 'json_object' },
            maxTokens: 3000,
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

    // Step 5: Store suggestions in database
    // We'll repurpose the subjectSuggestions table to store study topic suggestions
    // Using the goalId (not completedGoalId) to link to the active goal
    await step.run('store-suggestions', async () => {
      try {
        logger.info('Storing study suggestions in database', { goalId, count: suggestions.length });
        
        for (const suggestion of suggestions) {
          // Store the topic as the "subject" field
          // Store practice activities in the description
          // Store difficulty and other metadata in valueProposition as JSON
          const metadata = {
            difficulty: suggestion.difficulty,
            prerequisites: suggestion.prerequisites,
            estimated_hours: suggestion.estimated_hours,
            practice_activities: suggestion.practice_activities,
          };

          await db.insert(subjectSuggestions).values({
            studentId,
            completedGoalId: goalId, // Using this field to link to the active goal
            subject: suggestion.topic,
            description: suggestion.description,
            relevanceScore: Math.round(suggestion.relevance_score),
            valueProposition: JSON.stringify(metadata),
            status: 'pending',
          });
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

