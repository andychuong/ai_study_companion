import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { subjectSuggestions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
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
  const suggestions = await db.query.subjectSuggestions.findMany({
    where: eq(subjectSuggestions.studentId, studentId),
    orderBy: (suggestions, { desc }) => [desc(suggestions.createdAt)],
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

