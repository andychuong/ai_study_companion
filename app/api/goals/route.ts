import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { goals } from '@/lib/db/schema';
import { requireStudent } from '@/lib/auth/middleware';
import { createApiHandler, parseJsonBody } from '@/lib/utils/api-handler';
import { inngest } from '@/lib/inngest';
import { logger } from '@/lib/utils/logger';
import { z } from 'zod';

const createGoalSchema = z.object({
  subject: z.string().min(1),
  description: z.string().min(1),
  targetDate: z.string().datetime().optional(),
});

async function handler(req: NextRequest) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const session = await requireStudent(req);
  const body = await parseJsonBody(req);
  const data = createGoalSchema.parse(body);

  const [goal] = await db
    .insert(goals)
    .values({
      studentId: session.user.id,
      subject: data.subject,
      description: data.description,
      targetDate: data.targetDate ? new Date(data.targetDate) : null,
      status: 'active',
      progress: 0,
    })
    .returning();

  // Trigger study suggestion generation (optional - skip if Inngest not configured)
  try {
    if (process.env.INNGEST_EVENT_KEY) {
      logger.info('Sending goal.created event to Inngest', { 
        goalId: goal.id, 
        studentId: session.user.id, 
        subject: goal.subject 
      });
      const result = await inngest.send({
        name: 'goal.created',
        data: {
          goalId: goal.id,
          studentId: session.user.id,
          subject: goal.subject,
          description: goal.description,
        },
      });
      logger.info('Inngest event sent successfully', { goalId: goal.id, eventIds: result.ids });
    } else {
      logger.warn('INNGEST_EVENT_KEY not set, skipping study suggestion generation', { goalId: goal.id });
    }
  } catch (error) {
    // Log but don't fail the request if Inngest is not configured
    logger.error('Failed to send Inngest event', { error, goalId: goal.id, studentId: session.user.id });
  }

  return NextResponse.json({
    id: goal.id,
    studentId: goal.studentId,
    subject: goal.subject,
    description: goal.description,
    status: goal.status,
    progress: goal.progress,
    createdAt: goal.createdAt,
    completedAt: goal.completedAt || undefined,
    targetDate: goal.targetDate || undefined,
  });
}

export const POST = createApiHandler(handler);

