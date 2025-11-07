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

  // Create new goal from suggestion
  const [goal] = await db
    .insert(goals)
    .values({
      studentId: session.user.id,
      subject: suggestion.subject,
      description: suggestion.description || `Master ${suggestion.subject}`,
      status: 'active',
      progress: 0,
    })
    .returning();

  return NextResponse.json({
    suggestionId: suggestion.id,
    goalId: goal.id,
    message: 'Suggestion accepted and goal created',
  });
}

export const POST = createApiHandler(handler);

