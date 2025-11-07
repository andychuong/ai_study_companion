import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { notifications } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth/middleware';
import { createApiHandler } from '@/lib/utils/api-handler';
import { NotFoundError, ForbiddenError } from '@/lib/utils/errors';

async function handler(req: NextRequest, context?: { params?: Promise<Record<string, string>> | Record<string, string> }) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const session = await requireAuth(req);
  const params = context?.params ? await Promise.resolve(context.params) : {};
  const { notificationId } = params;
  
  if (!notificationId) {
    return NextResponse.json({ error: 'Notification ID required' }, { status: 400 });
  }

  const notification = await db.query.notifications.findFirst({
    where: eq(notifications.id, notificationId),
  });

  if (!notification) {
    throw new NotFoundError('Notification');
  }

  if (notification.studentId !== session.user.id) {
    throw new ForbiddenError('Cannot mark this notification as read');
  }

  // Mark as read
  await db
    .update(notifications)
    .set({ read: true, readAt: new Date() })
    .where(eq(notifications.id, notificationId));

  return NextResponse.json({
    id: notification.id,
    read: true,
    message: 'Notification marked as read',
  });
}

export const POST = createApiHandler(handler);

