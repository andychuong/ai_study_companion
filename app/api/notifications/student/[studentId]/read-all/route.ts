import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { notifications } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth/middleware';
import { createApiHandler } from '@/lib/utils/api-handler';
import { ForbiddenError } from '@/lib/utils/errors';

async function handler(req: NextRequest, context: { params: { studentId: string } }) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const session = await requireAuth(req);
  const { studentId } = await Promise.resolve(context.params);

  // Check authorization
  if (session.user.id !== studentId && session.user.role !== 'admin') {
    throw new ForbiddenError('Cannot mark notifications as read for other students');
  }

  // Mark all notifications as read
  await db
    .update(notifications)
    .set({ read: true, readAt: new Date() })
    .where(and(eq(notifications.studentId, studentId), eq(notifications.read, false)));

  return NextResponse.json({
    message: 'All notifications marked as read',
  });
}

export const POST = createApiHandler(handler);

