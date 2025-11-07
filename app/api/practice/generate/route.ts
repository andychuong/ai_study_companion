import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { practices, sessions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireStudent } from '@/lib/auth/middleware';
import { createApiHandler, parseJsonBody } from '@/lib/utils/api-handler';
import { inngest } from '@/lib/inngest';
import { logger } from '@/lib/utils/logger';
import { z } from 'zod';

const generateSchema = z.object({
  sessionId: z.string().uuid(),
  conceptIds: z.array(z.string().uuid()).optional(),
});

async function handler(req: NextRequest) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const session = await requireStudent(req);
  const body = await parseJsonBody(req);
  const { sessionId, conceptIds } = generateSchema.parse(body);

  // Verify session belongs to student
  const sessionRecord = await db.query.sessions.findFirst({
    where: eq(sessions.id, sessionId),
  });

  if (!sessionRecord || sessionRecord.studentId !== session.user.id) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  // Create practice record
  const [practice] = await db
    .insert(practices)
    .values({
      studentId: session.user.id,
      sessionId,
      status: 'assigned',
      questions: [], // Will be populated by background job
    })
    .returning();

  // Trigger practice generation job (optional - skip if Inngest not configured)
  try {
    if (process.env.INNGEST_EVENT_KEY) {
      await inngest.send({
        name: 'practice.generate',
        data: {
          practiceId: practice.id,
          sessionId,
          studentId: session.user.id,
          conceptIds: conceptIds || [],
        },
      });
    } else {
      logger.warn('Inngest not configured. Practice generation will not run automatically.');
    }
  } catch (error) {
    // Log but don't fail the request if Inngest is not configured
    logger.warn('Failed to send Inngest event (Inngest may not be configured)', { error, practiceId: practice.id });
  }

  return NextResponse.json({
    practiceId: practice.id,
    status: 'generating',
    message: 'Practice problems are being generated',
  });
}

export const POST = createApiHandler(handler);

