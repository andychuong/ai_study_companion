import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { practices } from '@/lib/db/schema';
import { eq, and, gte, lte } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth/middleware';
import { createApiHandler } from '@/lib/utils/api-handler';
import { ForbiddenError } from '@/lib/utils/errors';

async function handler(req: NextRequest, context: { params: { studentId: string } }) {
  if (req.method !== 'GET') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const session = await requireAuth();
  const { studentId } = context.params;

  // Check authorization
  if (session.user.id !== studentId && session.user.role !== 'admin' && session.user.role !== 'tutor') {
    throw new ForbiddenError('Cannot access other student analytics');
  }

  const { searchParams } = new URL(req.url);
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  const start = startDate ? new Date(startDate) : new Date(Date.now() - 45 * 24 * 60 * 60 * 1000); // 45 days ago
  const end = endDate ? new Date(endDate) : new Date();

  // Get practices in date range
  const practicesList = await db.query.practices.findMany({
    where: and(
      eq(practices.studentId, studentId),
      eq(practices.status, 'completed'),
      gte(practices.completedAt || practices.createdAt, start),
      lte(practices.completedAt || practices.createdAt, end)
    ),
  });

  // Split into before/after periods
  const midpoint = new Date(start.getTime() + (end.getTime() - start.getTime()) / 2);
  const beforePractices = practicesList.filter(
    (p) => (p.completedAt || p.createdAt) < midpoint
  );
  const afterPractices = practicesList.filter(
    (p) => (p.completedAt || p.createdAt) >= midpoint
  );

  const beforeAvg =
    beforePractices.length > 0
      ? beforePractices.reduce((sum, p) => sum + (p.score || 0), 0) / beforePractices.length
      : 0;
  const afterAvg =
    afterPractices.length > 0
      ? afterPractices.reduce((sum, p) => sum + (p.score || 0), 0) / afterPractices.length
      : 0;

  const improvement = beforeAvg > 0 ? Math.round(((afterAvg - beforeAvg) / beforeAvg) * 100) : 0;

  // Get practice scores over time
  const practiceScores = practicesList
    .sort((a, b) => (a.completedAt || a.createdAt).getTime() - (b.completedAt || b.createdAt).getTime())
    .map((p) => p.score || 0);

  const dates = practicesList
    .sort((a, b) => (a.completedAt || a.createdAt).getTime() - (b.completedAt || b.createdAt).getTime())
    .map((p) => (p.completedAt || p.createdAt).toISOString().split('T')[0]);

  return NextResponse.json({
    studentId,
    period: {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
    },
    metrics: {
      averagePracticeScore: {
        before: Math.round(beforeAvg),
        after: Math.round(afterAvg),
        improvement,
      },
      sessionsCompleted: practicesList.length,
      conceptsMastered: 0, // TODO: Calculate from studentConcepts
      engagementRate: 85, // TODO: Calculate from activity
    },
    trends: {
      practiceScores,
      dates,
    },
  });
}

export const GET = createApiHandler(handler);


