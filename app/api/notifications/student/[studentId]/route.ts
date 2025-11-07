import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { notifications } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth/middleware';
import { createApiHandler } from '@/lib/utils/api-handler';
import { ForbiddenError } from '@/lib/utils/errors';

async function handler(req: NextRequest, context: { params: { studentId: string } }) {
  if (req.method !== 'GET') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const session = await requireAuth(req);
  const { studentId } = await Promise.resolve(context.params);

  // Check authorization
  if (session.user.id !== studentId && session.user.role !== 'admin') {
    throw new ForbiddenError('Cannot access other student notifications');
  }

  const notificationsList = await db.query.notifications.findMany({
    where: eq(notifications.studentId, studentId),
    orderBy: [desc(notifications.createdAt)],
    limit: 50, // Get last 50 notifications
  });

  return NextResponse.json({
    notifications: notificationsList.map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      cta: n.cta,
      ctaUrl: n.ctaUrl,
      urgency: n.urgency,
      read: n.read,
      readAt: n.readAt?.toISOString() || null,
      createdAt: n.createdAt.toISOString(),
      metadata: n.metadata,
    })),
    unreadCount: notificationsList.filter((n) => !n.read).length,
  });
}

export const GET = createApiHandler(handler);

