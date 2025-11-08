import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { goals } from '@/lib/db/schema';
import { requireStudent } from '@/lib/auth/middleware';
import { createApiHandler, parseJsonBody } from '@/lib/utils/api-handler';
import { NotFoundError, ForbiddenError } from '@/lib/utils/errors';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const updateGoalSchema = z.object({
  subject: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  targetDate: z.string().datetime().optional().nullable(),
  progress: z.number().min(0).max(100).optional(),
});

async function handler(req: NextRequest, context?: { params?: Promise<Record<string, string>> | Record<string, string> }) {
  const session = await requireStudent(req);
  const params = context?.params ? await Promise.resolve(context.params) : {};
  const { goalId } = params;

  if (!goalId) {
    return NextResponse.json({ error: 'Goal ID required' }, { status: 400 });
  }

  // Get existing goal
  const goal = await db.query.goals.findFirst({
    where: eq(goals.id, goalId),
  });

  if (!goal) {
    throw new NotFoundError('Goal');
  }

  // Check authorization - only the goal owner can update it
  if (goal.studentId !== session.user.id) {
    throw new ForbiddenError('Cannot update this goal');
  }

  // Only allow updating active goals
  if (goal.status !== 'active') {
    return NextResponse.json(
      { error: 'Cannot update completed or paused goals' },
      { status: 400 }
    );
  }

  if (req.method === 'PUT') {
    const body = await parseJsonBody(req);
    const data = updateGoalSchema.parse(body);

    // Build update object with only provided fields
    const updateData: {
      subject?: string;
      description?: string;
      targetDate?: Date | null;
      progress?: number;
      updatedAt?: Date;
    } = {
      updatedAt: new Date(),
    };

    if (data.subject !== undefined) {
      updateData.subject = data.subject;
    }
    if (data.description !== undefined) {
      updateData.description = data.description;
    }
    if (data.targetDate !== undefined) {
      updateData.targetDate = data.targetDate ? new Date(data.targetDate) : null;
    }
    if (data.progress !== undefined) {
      updateData.progress = data.progress;
    }

    const [updatedGoal] = await db
      .update(goals)
      .set(updateData)
      .where(eq(goals.id, goalId))
      .returning();

    return NextResponse.json({
      id: updatedGoal.id,
      studentId: updatedGoal.studentId,
      subject: updatedGoal.subject,
      description: updatedGoal.description,
      status: updatedGoal.status,
      progress: updatedGoal.progress,
      createdAt: updatedGoal.createdAt,
      completedAt: updatedGoal.completedAt || undefined,
      targetDate: updatedGoal.targetDate || undefined,
    });
  }

  if (req.method === 'DELETE') {
    // Only allow deleting active goals
    if (goal.status !== 'active') {
      return NextResponse.json(
        { error: 'Cannot delete completed or paused goals' },
        { status: 400 }
      );
    }

    await db.delete(goals).where(eq(goals.id, goalId));

    return NextResponse.json({ message: 'Goal deleted successfully' });
  }

  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export const PUT = createApiHandler(handler);
export const DELETE = createApiHandler(handler);

