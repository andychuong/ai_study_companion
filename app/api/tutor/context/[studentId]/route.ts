import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, sessions, practices, studentConcepts } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireTutor } from '@/lib/auth/middleware';
import { createApiHandler } from '@/lib/utils/api-handler';
import { NotFoundError } from '@/lib/utils/errors';

async function handler(req: NextRequest, context?: { params?: Promise<Record<string, string>> | Record<string, string> }) {
  if (req.method !== 'GET') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  await requireTutor(req);
  const params = context?.params ? await Promise.resolve(context.params) : {};
  const { studentId } = params;
  
  if (!studentId) {
    return NextResponse.json({ error: 'Student ID required' }, { status: 400 });
  }
  const { searchParams } = new URL(req.url);
  const topic = searchParams.get('topic');

  const student = await db.query.users.findFirst({
    where: eq(users.id, studentId),
  });

  if (!student) {
    throw new NotFoundError('Student');
  }

  // Get recent sessions
  const recentSessions = await db.query.sessions.findMany({
    where: eq(sessions.studentId, studentId),
    limit: 5,
  });

  // Get practices
  const practicesList = await db.query.practices.findMany({
    where: eq(practices.studentId, studentId),
    limit: 10,
  });

  // Get concepts
  const conceptsList = await db.query.studentConcepts.findMany({
    where: eq(studentConcepts.studentId, studentId),
  });

  // Extract challenges from recent sessions
  const currentChallenges: string[] = [];
  recentSessions.forEach((s) => {
    if (s.analysisData?.areasForImprovement) {
      currentChallenges.push(...s.analysisData.areasForImprovement);
    }
  });

  // Extract strengths
  const studentStrengths: string[] = [];
  recentSessions.forEach((s) => {
    if (s.analysisData?.studentStrengths) {
      studentStrengths.push(...s.analysisData.studentStrengths);
    }
  });

  return NextResponse.json({
    studentId: student.id,
    studentProfile: {
      name: student.name,
      grade: student.grade,
      learningStyle: 'visual', // TODO: Get from students table
    },
    recentSessions: recentSessions.map((s) => ({
      sessionId: s.id,
      date: s.sessionDate,
      topics: s.analysisData?.topics || [],
    })),
    currentChallenges: [...new Set(currentChallenges)],
    recommendedFocus: topic ? [topic] : currentChallenges.slice(0, 3),
    studentStrengths: [...new Set(studentStrengths)],
    practiceHistory: practicesList.map((p) => ({
      practiceId: p.id,
      score: p.score,
      completedAt: p.completedAt,
    })),
  });
}

export const GET = createApiHandler(handler);

