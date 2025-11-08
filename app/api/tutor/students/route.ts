import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sessions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireTutor } from '@/lib/auth/middleware';
import { createApiHandler } from '@/lib/utils/api-handler';

async function handler(req: NextRequest) {
  if (req.method !== 'GET') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const session = await requireTutor(req);
  const tutorId = session.user.id;

  // Get all sessions with this tutor
  const allSessions = await db.query.sessions.findMany({
    where: eq(sessions.tutorId, tutorId),
    with: {
      student: true,
    },
    orderBy: (sessions, { desc }) => [desc(sessions.sessionDate)],
  });

  // Group by student and calculate stats
  const studentMap = new Map<string, {
    id: string;
    name: string;
    email: string;
    grade: number | null;
    sessions: typeof allSessions;
  }>();

  for (const session of allSessions) {
    const studentId = session.studentId;
    if (!studentMap.has(studentId)) {
      const student = session.student;
      if (student) {
        studentMap.set(studentId, {
          id: studentId,
          name: student.name,
          email: student.email,
          grade: student.grade,
          sessions: [],
        });
      }
    }
    const studentData = studentMap.get(studentId);
    if (studentData) {
      studentData.sessions.push(session);
    }
  }

  // Convert to array and format
  const studentsWithDetails = Array.from(studentMap.values()).map((studentData) => {
    const sortedSessions = studentData.sessions.sort(
      (a, b) => new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime()
    );
    const lastSession = sortedSessions[0];

    return {
      id: studentData.id,
      name: studentData.name,
      email: studentData.email,
      grade: studentData.grade || undefined,
      totalSessions: studentData.sessions.length,
      lastSessionDate: lastSession ? lastSession.sessionDate : new Date(),
      recentSessions: sortedSessions.slice(0, 5).map((s) => ({
        id: s.id,
        sessionDate: s.sessionDate,
        duration: s.duration,
        analysisStatus: s.analysisStatus,
      })),
    };
  });

  // Sort by last session date
  studentsWithDetails.sort(
    (a, b) => new Date(b.lastSessionDate).getTime() - new Date(a.lastSessionDate).getTime()
  );

  return NextResponse.json({
    students: studentsWithDetails,
  });
}

export const GET = createApiHandler(handler);

