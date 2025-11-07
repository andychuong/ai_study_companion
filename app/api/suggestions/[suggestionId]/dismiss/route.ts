import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { subjectSuggestions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireStudent } from '@/lib/auth/middleware';
import { createApiHandler } from '@/lib/utils/api-handler';
import { NotFoundError, ForbiddenError } from '@/lib/utils/errors';

async function handler(req: NextRequest, context: { params: { suggestionId: string } }) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const session = await requireStudent(req);
  const { suggestionId } = await Promise.resolve(context.params);

  const suggestion = await db.query.subjectSuggestions.findFirst({
    where: eq(subjectSuggestions.id, suggestionId),
  });

  if (!suggestion) {
    throw new NotFoundError('Suggestion');
  }

  if (suggestion.studentId !== session.user.id) {
    throw new ForbiddenError('Cannot dismiss this suggestion');
  }

  // Update suggestion status to dismissed
  await db
    .update(subjectSuggestions)
    .set({ status: 'dismissed' })
    .where(eq(subjectSuggestions.id, suggestionId));

  return NextResponse.json({
    suggestionId: suggestion.id,
    message: 'Suggestion dismissed',
  });
}

export const POST = createApiHandler(handler);

