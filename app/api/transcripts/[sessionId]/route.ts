import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sessions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth/middleware';
import { createApiHandler } from '@/lib/utils/api-handler';
import { NotFoundError } from '@/lib/utils/errors';
import type { TranscriptSource, TranscriptFormat } from '@/types/database';

async function handler(req: NextRequest, context?: { params?: Promise<Record<string, string>> | Record<string, string> }) {
  if (req.method !== 'GET') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const session = await requireAuth(req);
  const params = context?.params ? await Promise.resolve(context.params) : {};
  const { sessionId } = params;
  
  if (!sessionId) {
    return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
  }

  const sessionRecord = await db.query.sessions.findFirst({
    where: eq(sessions.id, sessionId),
  });

  if (!sessionRecord) {
    throw new NotFoundError('Session');
  }

  // Check authorization (student or tutor)
  if (
    sessionRecord.studentId !== session.user.id &&
    sessionRecord.tutorId !== session.user.id &&
    session.user.role !== 'admin'
  ) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return NextResponse.json({
    id: sessionRecord.id,
    studentId: sessionRecord.studentId,
    tutorId: sessionRecord.tutorId,
    date: sessionRecord.sessionDate,
    duration: sessionRecord.duration,
    transcript: sessionRecord.transcript,
    transcriptSource: sessionRecord.transcriptSource as TranscriptSource,
    transcriptFormat: sessionRecord.transcriptFormat as TranscriptFormat,
    topics: sessionRecord.analysisData?.topics || [],
    concepts: (sessionRecord.analysisData?.concepts || []).map((c: any) => ({
      id: c.id || Math.random().toString(),
      name: c.name,
      subject: c.subject || sessionRecord.analysisData?.topics?.[0] || 'Unknown',
      difficulty: c.difficulty || 5,
      masteryLevel: c.masteryLevel || 0,
    })),
    extractedAt: sessionRecord.updatedAt,
    analysisStatus: sessionRecord.analysisStatus,
  });
}

export const GET = createApiHandler(handler);

