import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { goals } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireStudent } from '@/lib/auth/middleware';
import { createApiHandler } from '@/lib/utils/api-handler';
import { NotFoundError, ForbiddenError } from '@/lib/utils/errors';
import { inngest } from '@/lib/inngest';

async function handler(req: NextRequest, context: { params: { goalId: string } }) {
  if (req.method !== 'PUT') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const session = await requireStudent(req);
  const { goalId } = context.params;

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

  // Trigger subject suggestion generation (optional - skip if Inngest not configured)
  try {
    if (process.env.INNGEST_EVENT_KEY) {
      await inngest.send({
        name: 'goal.completed',
        data: {
          goalId,
          studentId: session.user.id,
          subject: goal.subject,
        },
      });
    }
  } catch (error) {
    // Log but don't fail the request if Inngest is not configured
    console.warn('Failed to send Inngest event (Inngest may not be configured):', error);
  }

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

