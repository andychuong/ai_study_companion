import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { subjectSuggestions, goals } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireStudent } from '@/lib/auth/middleware';
import { createApiHandler } from '@/lib/utils/api-handler';
import { NotFoundError, ForbiddenError } from '@/lib/utils/errors';

async function handler(req: NextRequest, context?: { params?: Promise<Record<string, string>> | Record<string, string> }) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const session = await requireStudent(req);
  const params = context?.params ? await Promise.resolve(context.params) : {};
  const { suggestionId } = params;
  
  if (!suggestionId) {
    return NextResponse.json({ error: 'Suggestion ID required' }, { status: 400 });
  }

  const suggestion = await db.query.subjectSuggestions.findFirst({
    where: eq(subjectSuggestions.id, suggestionId),
  });

  if (!suggestion) {
    throw new NotFoundError('Suggestion');
  }

  if (suggestion.studentId !== session.user.id) {
    throw new ForbiddenError('Cannot accept this suggestion');
  }

  // Update suggestion status
  await db
    .update(subjectSuggestions)
    .set({ status: 'accepted' })
    .where(eq(subjectSuggestions.id, suggestionId));

  // For study topic suggestions, we just mark them as accepted
  // They're linked to an existing goal (via completedGoalId field)
  // The user can use these suggestions to study for their goal
  
  return NextResponse.json({
    suggestionId: suggestion.id,
    goalId: suggestion.completedGoalId || null,
    message: 'Study topic suggestion accepted! Use these practice activities to work toward your goal.',
  });
}

export const POST = createApiHandler(handler);

