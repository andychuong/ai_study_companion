import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { goals } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireStudent } from '@/lib/auth/middleware';
import { createApiHandler } from '@/lib/utils/api-handler';
import { NotFoundError, ForbiddenError } from '@/lib/utils/errors';
import { inngest } from '@/lib/inngest';
import { logger } from '@/lib/utils/logger';

async function handler(req: NextRequest, context?: { params?: Promise<Record<string, string>> | Record<string, string> }) {
  if (req.method !== 'PUT') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const session = await requireStudent(req);
  const params = context?.params ? await Promise.resolve(context.params) : {};
  const { goalId } = params;
  
  if (!goalId) {
    return NextResponse.json({ error: 'Goal ID required' }, { status: 400 });
  }

  const goal = await db.query.goals.findFirst({
    where: eq(goals.id, goalId),
  });

  if (!goal) {
    throw new NotFoundError('Goal');
  }

  if (goal.studentId !== session.user.id) {
    throw new ForbiddenError('Cannot complete this goal');
  }

  // Update goal
  await db
    .update(goals)
    .set({
      status: 'completed',
      progress: 100,
      completedAt: new Date(),
    })
    .where(eq(goals.id, goalId));

  // Note: Study suggestions are now generated when goals are created, not when completed
  // This allows students to get study topics and practice activities to help achieve their goals

  const updatedGoal = await db.query.goals.findFirst({
    where: eq(goals.id, goalId),
  });

  return NextResponse.json({
    id: updatedGoal!.id,
    studentId: updatedGoal!.studentId,
    subject: updatedGoal!.subject,
    description: updatedGoal!.description,
    status: updatedGoal!.status,
    progress: updatedGoal!.progress,
    createdAt: updatedGoal!.createdAt,
    completedAt: updatedGoal!.completedAt || undefined,
    targetDate: updatedGoal!.targetDate || undefined,
  });
}

export const PUT = createApiHandler(handler);

