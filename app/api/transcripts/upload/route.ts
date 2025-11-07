import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sessions } from '@/lib/db/schema';
import { requireStudent } from '@/lib/auth/middleware';
import { createApiHandler, parseJsonBody } from '@/lib/utils/api-handler';
import { inngest } from '@/lib/inngest';
import { storeTranscript } from '@/lib/storage/blob';
import { logger } from '@/lib/utils/logger';
import { z } from 'zod';

const uploadSchema = z.object({
  tutorId: z.string().uuid(),
  sessionDate: z.string().datetime(),
  duration: z.number().positive(),
  transcript: z.string().min(1),
  transcriptSource: z.enum(['read_ai', 'manual_upload', 'api_import', 'other']),
  transcriptFormat: z.enum(['plain_text', 'json', 'csv', 'markdown']),
});

async function handler(req: NextRequest) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const session = await requireStudent(req);
  const body = await parseJsonBody(req);
  const data = uploadSchema.parse(body);

  // Store transcript in blob storage
  const transcriptUrl = await storeTranscript(`session-${Date.now()}`, data.transcript);

  // Create session record
  const [sessionRecord] = await db
    .insert(sessions)
    .values({
      studentId: session.user.id,
      tutorId: data.tutorId,
      sessionDate: new Date(data.sessionDate),
      duration: data.duration,
      transcript: data.transcript,
      transcriptSource: data.transcriptSource,
      transcriptFormat: data.transcriptFormat,
      analysisStatus: 'pending',
    })
    .returning();

  // Trigger transcript analysis job (optional - skip if Inngest not configured)
  try {
    if (process.env.INNGEST_EVENT_KEY) {
      await inngest.send({
        name: 'transcript.uploaded',
        data: {
          sessionId: sessionRecord.id,
          studentId: session.user.id,
          transcript: data.transcript,
          transcriptUrl,
        },
      });
    } else {
      logger.warn('Inngest not configured. Transcript analysis will not run automatically.');
    }
  } catch (error) {
    // Log but don't fail the request if Inngest is not configured
    logger.warn('Failed to send Inngest event (Inngest may not be configured)', { error, sessionId: sessionRecord.id });
  }

  return NextResponse.json({
    sessionId: sessionRecord.id,
    status: 'processing',
    message: 'Transcript uploaded, analysis in progress',
  });
}

export const POST = createApiHandler(handler);

