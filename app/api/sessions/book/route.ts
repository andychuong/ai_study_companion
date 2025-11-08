import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sessions, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireStudent } from '@/lib/auth/middleware';
import { createApiHandler, parseJsonBody } from '@/lib/utils/api-handler';
import { NotFoundError } from '@/lib/utils/errors';
import { z } from 'zod';

const bookSessionSchema = z.object({
  tutorId: z.string().uuid(),
  sessionDate: z.string().datetime(),
  duration: z.number().positive().int(),
});

async function handler(req: NextRequest) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const session = await requireStudent(req);
  const body = await parseJsonBody(req);
  const data = bookSessionSchema.parse(body);

  // Verify tutor exists
  const tutor = await db.query.users.findFirst({
    where: eq(users.id, data.tutorId),
  });

  if (!tutor) {
    throw new NotFoundError('Tutor');
  }

  if (tutor.role !== 'tutor') {
    return NextResponse.json({ error: 'User is not a tutor' }, { status: 400 });
  }

  // Create session record with placeholder transcript
  // The transcript will be updated when the actual session occurs
  const [sessionRecord] = await db
    .insert(sessions)
    .values({
      studentId: session.user.id,
      tutorId: data.tutorId,
      sessionDate: new Date(data.sessionDate),
      duration: data.duration,
      transcript: `Session booked for ${new Date(data.sessionDate).toLocaleString()}. Transcript will be available after the session.`,
      transcriptSource: 'manual_upload',
      transcriptFormat: 'plain_text',
      analysisStatus: 'pending',
    })
    .returning();

  return NextResponse.json({
    sessionId: sessionRecord.id,
    tutorId: sessionRecord.tutorId,
    tutorName: tutor.name,
    sessionDate: sessionRecord.sessionDate,
    duration: sessionRecord.duration,
    message: 'Session booked successfully',
  });
}

export const POST = createApiHandler(handler);

