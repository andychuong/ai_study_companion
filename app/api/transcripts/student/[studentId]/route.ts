import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sessions } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth/middleware';
import { createApiHandler } from '@/lib/utils/api-handler';
import { ForbiddenError } from '@/lib/utils/errors';

async function handler(req: NextRequest, context?: { params?: Promise<Record<string, string>> | Record<string, string> }) {
  if (req.method !== 'GET') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const session = await requireAuth(req);
  const params = context?.params ? await Promise.resolve(context.params) : {};
  const { studentId } = params;
  
  if (!studentId) {
    return NextResponse.json({ error: 'Student ID required' }, { status: 400 });
  }

  // Check authorization
  if (session.user.id !== studentId && session.user.role !== 'admin' && session.user.role !== 'tutor') {
    throw new ForbiddenError('Cannot access other student data');
  }

  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get('limit') || '10');
  const offset = parseInt(searchParams.get('offset') || '0');

  const sessionRecords = await db.query.sessions.findMany({
    where: eq(sessions.studentId, studentId),
    orderBy: [desc(sessions.sessionDate)],
    limit,
    offset,
  });

  const total = await db
    .select({ count: sessions.id })
    .from(sessions)
    .where(eq(sessions.studentId, studentId));

  return NextResponse.json(
    sessionRecords.map((s) => ({
      id: s.id,
      studentId: s.studentId,
      tutorId: s.tutorId,
      date: s.sessionDate,
      duration: s.duration,
      transcript: s.transcript,
      transcriptSource: s.transcriptSource as any,
      transcriptFormat: s.transcriptFormat as any,
      topics: s.analysisData?.topics || [],
      concepts: (s.analysisData?.concepts || []).map((c: any) => ({
        id: c.id || Math.random().toString(),
        name: c.name,
        subject: c.subject || s.analysisData?.topics?.[0] || 'Unknown',
        difficulty: c.difficulty || 5,
        masteryLevel: c.masteryLevel || 0,
      })),
      extractedAt: s.updatedAt,
      analysisStatus: s.analysisStatus,
    }))
  );
}

export const GET = createApiHandler(handler);

