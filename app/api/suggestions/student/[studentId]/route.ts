import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { subjectSuggestions, goals } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth/middleware';
import { createApiHandler } from '@/lib/utils/api-handler';
import { ForbiddenError } from '@/lib/utils/errors';

async function handler(req: NextRequest, context?: { params?: Promise<Record<string, string>> | Record<string, string> }) {
  if (req.method !== 'GET') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const session = await requireAuth(req);
  const params = context?.params ? await Promise.resolve(context.params) : {};
  const { studentId } = params;
  
  if (!studentId) {
    return NextResponse.json({ error: 'Student ID required' }, { status: 400 });
  }

  // Check authorization
  if (session.user.id !== studentId && session.user.role !== 'admin') {
    throw new ForbiddenError('Cannot access other student suggestions');
  }

  // Get suggestions for active goals (study topic suggestions)
  // Only show suggestions linked to active goals (not completed goals)
  // This filters out old subject suggestions from the old system
  const allSuggestions = await db.query.subjectSuggestions.findMany({
    where: eq(subjectSuggestions.studentId, studentId),
    orderBy: (suggestions, { desc }) => [desc(suggestions.createdAt)],
  });

  // Get all active goal IDs for this student
  const activeGoals = await db.query.goals.findMany({
    where: and(
      eq(goals.studentId, studentId),
      eq(goals.status, 'active')
    ),
    columns: { id: true },
  });
  const activeGoalIds = new Set(activeGoals.map(g => g.id));

  // Filter suggestions to only show those linked to active goals
  // Also include suggestions that have the new metadata structure (practice_activities, difficulty, etc.)
  const suggestions = allSuggestions.filter((s) => {
    // Include if linked to an active goal (new system)
    if (s.completedGoalId && activeGoalIds.has(s.completedGoalId)) {
      return true;
    }
    // Include if it has new metadata structure (has practice_activities, difficulty, etc.)
    if (s.valueProposition) {
      try {
        const metadata = JSON.parse(s.valueProposition);
        if (metadata.practice_activities || metadata.difficulty || metadata.estimated_hours) {
          return true;
        }
      } catch (e) {
        // Not JSON, likely old suggestion
      }
    }
    // Exclude old suggestions (linked to completed goals or no metadata)
    return false;
  });

  return NextResponse.json({
    suggestions: suggestions.map((s) => {
      // Parse metadata from valueProposition (contains practice activities, difficulty, etc.)
      let metadata = null;
      try {
        if (s.valueProposition) {
          metadata = JSON.parse(s.valueProposition);
        }
      } catch (e) {
        // If parsing fails, treat as plain text
        metadata = { description: s.valueProposition };
      }

      return {
        suggestionId: s.id,
        topic: s.subject, // This is now the study topic
        description: s.description,
        relevanceScore: s.relevanceScore,
        status: s.status,
        goalId: s.completedGoalId, // This links to the active goal
        // Metadata from valueProposition
        practiceActivities: metadata?.practice_activities || [],
        difficulty: metadata?.difficulty || null,
        prerequisites: metadata?.prerequisites || [],
        estimatedHours: metadata?.estimated_hours || null,
        valueProposition: typeof metadata === 'string' ? metadata : null,
      };
    }),
  });
}

export const GET = createApiHandler(handler);

