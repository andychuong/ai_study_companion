import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { goals } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth/middleware';
import { createApiHandler } from '@/lib/utils/api-handler';
import { ForbiddenError } from '@/lib/utils/errors';

async function handler(req: NextRequest, context: { params: { studentId: string } }) {
  if (req.method !== 'GET') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const session = await requireAuth(req);
  const { studentId } = context.params;

  // Check authorization
  if (session.user.id !== studentId && session.user.role !== 'admin' && session.user.role !== 'tutor') {
    throw new ForbiddenError('Cannot access other student goals');
  }

  const goalsList = await db.query.goals.findMany({
    where: eq(goals.studentId, studentId),
  });

  return NextResponse.json(
    goalsList.map((goal) => ({
      id: goal.id,
      studentId: goal.studentId,
      subject: goal.subject,
      description: goal.description,
      status: goal.status,
      progress: goal.progress,
      createdAt: goal.createdAt,
      completedAt: goal.completedAt || undefined,
      targetDate: goal.targetDate || undefined,
    }))
  );
}

export const GET = createApiHandler(handler);

