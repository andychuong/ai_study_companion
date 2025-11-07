import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { goals } from '@/lib/db/schema';
import { requireStudent } from '@/lib/auth/middleware';
import { createApiHandler, parseJsonBody } from '@/lib/utils/api-handler';
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

