import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sessions, practices, goals, studentConcepts, concepts } from '@/lib/db/schema';
import { eq, and, gte } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth/middleware';
import { createApiHandler } from '@/lib/utils/api-handler';
import { ForbiddenError } from '@/lib/utils/errors';
import { subDays } from 'date-fns';

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
    throw new ForbiddenError('Cannot access other student progress');
  }

  // Get sessions count
  const sessionsList = await db.query.sessions.findMany({
    where: eq(sessions.studentId, studentId),
  });

  // Get practices
  const practicesList = await db.query.practices.findMany({
    where: eq(practices.studentId, studentId),
  });

  const completedPractices = practicesList.filter((p) => p.status === 'completed');
  const averageScore =
    completedPractices.length > 0
      ? Math.round(
          completedPractices.reduce((sum, p) => sum + (p.score || 0), 0) /
            completedPractices.length
        )
      : 0;

  // Get goals
  const goalsList = await db.query.goals.findMany({
    where: eq(goals.studentId, studentId),
  });

  // Get concepts
  const conceptsList = await db.query.studentConcepts.findMany({
    where: eq(studentConcepts.studentId, studentId),
  });

  // Calculate improvement rate (last 30 days vs previous 30 days)
  const now = new Date();
  const thirtyDaysAgo = subDays(now, 30);
  const sixtyDaysAgo = subDays(now, 60);

  const recentPractices = completedPractices.filter(
    (p) => p.completedAt && p.completedAt >= thirtyDaysAgo
  );
  const olderPractices = completedPractices.filter(
    (p) => p.completedAt && p.completedAt >= sixtyDaysAgo && p.completedAt < thirtyDaysAgo
  );

  const recentAvg =
    recentPractices.length > 0
      ? recentPractices.reduce((sum, p) => sum + (p.score || 0), 0) / recentPractices.length
      : 0;
  const olderAvg =
    olderPractices.length > 0
      ? olderPractices.reduce((sum, p) => sum + (p.score || 0), 0) / olderPractices.length
      : 0;

  const improvementRate = olderAvg > 0 ? Math.round(((recentAvg - olderAvg) / olderAvg) * 100) : 0;

  // Get this month's sessions
  const thisMonth = new Date();
  thisMonth.setDate(1);
  const sessionsThisMonth = sessionsList.filter((s) => s.sessionDate >= thisMonth).length;

  // Get active goals
  const activeGoals = goalsList.filter((g) => g.status === 'active').length;
  
  // Calculate per-goal progress metrics
  const goalsProgress = goalsList.map((goal) => {
    // Get sessions related to this goal (by subject match)
    const goalSessions = sessionsList.filter((s) => {
      const sessionSubject = s.analysisData?.topics?.[0] || '';
      return sessionSubject.toLowerCase().includes(goal.subject.toLowerCase()) ||
             goal.subject.toLowerCase().includes(sessionSubject.toLowerCase());
    });
    
    // Get practices related to this goal (by session subject match)
    const goalPractices = practicesList.filter((p) => {
      // Match practices by session subject if sessionId exists
      if (p.sessionId) {
        const relatedSession = sessionsList.find((s) => s.id === p.sessionId);
        if (relatedSession) {
          const sessionSubject = relatedSession.analysisData?.topics?.[0] || '';
          return sessionSubject.toLowerCase().includes(goal.subject.toLowerCase()) ||
                 goal.subject.toLowerCase().includes(sessionSubject.toLowerCase());
        }
      }
      return false;
    });
    
    const completedGoalPractices = goalPractices.filter((p) => p.status === 'completed');
    const goalAverageScore = completedGoalPractices.length > 0
      ? Math.round(completedGoalPractices.reduce((sum, p) => sum + (p.score || 0), 0) / completedGoalPractices.length)
      : 0;
    
    // Calculate days until target (if target date exists)
    const daysUntilTarget = goal.targetDate
      ? Math.max(0, Math.ceil((goal.targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
      : null;
    
    // Determine if goal is nearing completion (within 10% or 7 days)
    const isNearingCompletion = goal.progress >= 90 || (daysUntilTarget !== null && daysUntilTarget <= 7 && goal.progress >= 50);
    
    return {
      goalId: goal.id,
      subject: goal.subject,
      description: goal.description,
      status: goal.status,
      progress: goal.progress,
      sessionsCount: goalSessions.length,
      practicesCount: completedGoalPractices.length,
      averageScore: goalAverageScore,
      targetDate: goal.targetDate?.toISOString() || null,
      createdAt: goal.createdAt.toISOString(),
      completedAt: goal.completedAt?.toISOString() || null,
      daysUntilTarget,
      isNearingCompletion,
    };
  });

  // Calculate learning progress (last 30 days)
  const learningProgress = completedPractices
    .filter((p) => p.completedAt && p.completedAt >= thirtyDaysAgo)
    .map((p) => ({
      date: p.completedAt!.toISOString().split('T')[0],
      score: p.score || 0,
    }));

  // Subject distribution from sessions
  const subjectMap = new Map<string, number>();
  sessionsList.forEach((s) => {
    const subject = s.analysisData?.topics?.[0] || 'Unknown';
    subjectMap.set(subject, (subjectMap.get(subject) || 0) + 1);
  });
  const subjectDistribution = Array.from(subjectMap.entries()).map(([subject, count]) => ({
    subject,
    count,
  }));

  // Concept mastery - join with concepts table to get names
  const conceptMastery = await Promise.all(
    conceptsList.map(async (c) => {
      const concept = await db.query.concepts.findFirst({
        where: eq(concepts.id, c.conceptId),
      });
      return {
        concept: concept?.name || c.conceptId,
        masteryLevel: c.masteryLevel,
      };
    })
  );

  return NextResponse.json({
    studentId,
    activeGoals,
    sessionsThisMonth,
    practicesCompleted: completedPractices.length,
    averageScore,
    improvementRate,
    learningProgress,
    subjectDistribution,
    conceptMastery,
    goalsProgress, // Multi-goal progress breakdown
  });
}

export const GET = createApiHandler(handler);

