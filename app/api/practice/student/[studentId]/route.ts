import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { practices } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth/middleware';
import { createApiHandler } from '@/lib/utils/api-handler';
import { ForbiddenError } from '@/lib/utils/errors';

async function handler(req: NextRequest, context: { params: Promise<{ studentId: string }> | { studentId: string } }) {
  if (req.method !== 'GET') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const session = await requireAuth(req);
  const params = await Promise.resolve(context.params);
  const { studentId } = params;

  // Check authorization
  if (session.user.id !== studentId && session.user.role !== 'admin' && session.user.role !== 'tutor') {
    throw new ForbiddenError('Cannot access other student practices');
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const limit = parseInt(searchParams.get('limit') || '10');

  let practicesList = await db.query.practices.findMany({
    where: eq(practices.studentId, studentId),
    limit,
  });

  if (status) {
    practicesList = practicesList.filter((p) => p.status === status);
  }

  return NextResponse.json(
    practicesList.map((p) => ({
      id: p.id,
      studentId: p.studentId,
      conceptId: undefined,
      questions: p.questions as any[],
      assignedAt: p.assignedAt,
      completedAt: p.completedAt || undefined,
      score: p.score || undefined,
      status: p.status,
    }))
  );
}

export const GET = createApiHandler(handler);

