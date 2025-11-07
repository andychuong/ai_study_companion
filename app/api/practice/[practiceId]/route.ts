import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { practices } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth/middleware';
import { createApiHandler } from '@/lib/utils/api-handler';
import { NotFoundError, ForbiddenError } from '@/lib/utils/errors';

async function handler(req: NextRequest, context?: { params?: Promise<Record<string, string>> | Record<string, string> }) {
  if (req.method !== 'GET') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const session = await requireAuth(req);
  const params = context?.params ? await Promise.resolve(context.params) : {};
  const { practiceId } = params;
  
  if (!practiceId) {
    return NextResponse.json({ error: 'Practice ID required' }, { status: 400 });
  }

  const practice = await db.query.practices.findFirst({
    where: eq(practices.id, practiceId),
  });

  if (!practice) {
    throw new NotFoundError('Practice');
  }

  // Check authorization
  if (practice.studentId !== session.user.id && session.user.role !== 'admin' && session.user.role !== 'tutor') {
    throw new ForbiddenError('Cannot access this practice');
  }

  return NextResponse.json({
    id: practice.id,
    studentId: practice.studentId,
    conceptId: undefined,
    questions: (practice.questions as any[]).map((q) => ({
      id: q.questionId || q.id || Math.random().toString(),
      question: q.question,
      type: q.type,
      options: q.options,
      difficulty: q.difficulty,
      correctAnswer: q.correct_answer || q.correctAnswer,
      explanation: q.explanation,
    })),
    assignedAt: practice.assignedAt,
    completedAt: practice.completedAt || undefined,
    score: practice.score || undefined,
    status: practice.status,
  });
}

export const GET = createApiHandler(handler);

