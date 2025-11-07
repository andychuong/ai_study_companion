import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, sessions, practices, studentConcepts } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth/middleware';
import { createApiHandler } from '@/lib/utils/api-handler';
import { NotFoundError, ForbiddenError } from '@/lib/utils/errors';

async function handler(req: NextRequest, context: { params: { studentId: string } }) {
  if (req.method !== 'GET') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const session = await requireAuth(req);
  const { studentId } = await Promise.resolve(context.params);
  const { searchParams } = new URL(req.url);
  const topic = searchParams.get('topic');

  // Students can only access their own context
  if (session.user.role === 'student' && session.user.id !== studentId) {
    throw new ForbiddenError('Cannot access other student context');
  }

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
      date: s.sessionDate.toISOString(),
      topics: s.analysisData?.topics || [],
    })),
    currentChallenges: [...new Set(currentChallenges)],
    recommendedFocus: topic ? [topic] : currentChallenges.slice(0, 3),
    studentStrengths: [...new Set(studentStrengths)],
    practiceHistory: practicesList.map((p) => ({
      practiceId: p.id,
      score: p.score,
      completedAt: p.completedAt?.toISOString() || null,
    })),
  });
}

export const GET = createApiHandler(handler);


