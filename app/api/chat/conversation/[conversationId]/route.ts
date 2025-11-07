import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { conversations, messages } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth/middleware';
import { createApiHandler } from '@/lib/utils/api-handler';
import { NotFoundError, ForbiddenError } from '@/lib/utils/errors';

async function handler(req: NextRequest, context?: { params?: Promise<Record<string, string>> | Record<string, string> }) {
  if (req.method !== 'GET') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const session = await requireAuth(req);
  const params = context?.params ? await Promise.resolve(context.params) : {};
  const { conversationId } = params;
  
  if (!conversationId) {
    return NextResponse.json({ error: 'Conversation ID required' }, { status: 400 });
  }

  const conversation = await db.query.conversations.findFirst({
    where: eq(conversations.id, conversationId),
  });

  if (!conversation) {
    throw new NotFoundError('Conversation');
  }

  // Check authorization
  if (conversation.studentId !== session.user.id && session.user.role !== 'admin') {
    throw new ForbiddenError('Cannot access this conversation');
  }

  const messageList = await db.query.messages.findMany({
    where: eq(messages.conversationId, conversationId),
    orderBy: (messages, { asc }) => [asc(messages.createdAt)],
  });

  return NextResponse.json({
    id: conversation.id,
    studentId: conversation.studentId,
    messages: messageList.map((msg) => ({
      id: msg.id,
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
      timestamp: msg.createdAt,
      sources: msg.metadata?.sources,
      suggestTutor: msg.metadata?.suggestTutor,
    })),
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
  });
}

export const GET = createApiHandler(handler);

