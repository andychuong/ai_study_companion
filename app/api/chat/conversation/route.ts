import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { conversations } from '@/lib/db/schema';
import { requireStudent } from '@/lib/auth/middleware';
import { createApiHandler } from '@/lib/utils/api-handler';

async function handler(req: NextRequest) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const session = await requireStudent(req);

  const [conversation] = await db
    .insert(conversations)
    .values({
      studentId: session.user.id,
    })
    .returning();

  return NextResponse.json({
    id: conversation.id,
    studentId: conversation.studentId,
    messages: [],
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
  });
}

export const POST = createApiHandler(handler);

