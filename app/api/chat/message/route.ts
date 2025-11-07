import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { conversations, messages } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireStudent } from '@/lib/auth/middleware';
import { createApiHandler, parseJsonBody } from '@/lib/utils/api-handler';
import { generateEmbedding } from '@/lib/openai/client';
import { queryVectors } from '@/lib/pinecone/client';
import { chatCompletion } from '@/lib/openai/client';
import { z } from 'zod';

const messageSchema = z.object({
  message: z.string().min(1),
  conversationId: z.string().uuid().optional(),
  studentId: z.string().uuid().optional(), // For backward compatibility, but not needed
});

async function handler(req: NextRequest) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const session = await requireStudent(req);
  const body = await parseJsonBody(req);
  const { message, conversationId } = messageSchema.parse(body);

  // Get or create conversation
  let convId = conversationId;
  if (!convId) {
    const [newConv] = await db
      .insert(conversations)
      .values({
        studentId: session.user.id,
      })
      .returning();
    convId = newConv.id;
  }

  // Save user message
  await db.insert(messages).values({
    conversationId: convId,
    role: 'user',
    content: message,
  });

  // RAG: Get relevant context
  const questionEmbedding = await generateEmbedding(message);
  const relevantChunks = await queryVectors(questionEmbedding, {
    topK: 5,
    filter: { studentId: session.user.id },
    includeMetadata: true,
  });

  // Get conversation history
  const conversationHistory = await db.query.messages.findMany({
    where: eq(messages.conversationId, convId),
    orderBy: (messages, { asc }) => [asc(messages.createdAt)],
    limit: 10,
  });

  // Build context for LLM
  const context = relevantChunks.matches
    .map((match) => match.metadata?.excerpt || '')
    .join('\n\n');

  const historyMessages = conversationHistory.map((msg) => ({
    role: msg.role as 'user' | 'assistant',
    content: msg.content,
  }));

  // Generate response
  const systemPrompt = `You are an AI Study Companion helping ${session.user.name || 'a student'}.

Context from previous sessions:
${context}

Instructions:
1. Answer the question conversationally and at an appropriate level
2. Reference previous lessons when relevant
3. If the question requires deep explanation or the student seems confused, suggest booking a tutor session
4. Keep responses concise (2-3 paragraphs max)
5. Use examples relevant to the student's grade level`;

  const completion = await chatCompletion([
    { role: 'system', content: systemPrompt },
    ...historyMessages,
    { role: 'user', content: message },
  ]);

  const response = completion.choices[0]?.message?.content || 'I apologize, but I could not generate a response.';

  // Save assistant message
  await db.insert(messages).values({
    conversationId: convId,
    role: 'assistant',
    content: response,
    metadata: {
      confidence: 0.95,
      sources: relevantChunks.matches.map((match) => ({
        sessionId: String(match.metadata?.sessionId || ''),
        relevance: match.score || 0,
        excerpt: String(match.metadata?.excerpt || ''),
      })),
      suggestTutor: response.toLowerCase().includes('tutor session'),
    },
  });

  // Get the last message (assistant message we just created)
  const assistantMessage = await db.query.messages.findFirst({
    where: eq(messages.conversationId, convId),
    orderBy: (messages, { desc }) => [desc(messages.createdAt)],
  });

  return NextResponse.json({
    message: {
      id: assistantMessage?.id || completion.id,
      role: 'assistant' as const,
      content: response,
      timestamp: assistantMessage?.createdAt || new Date(),
      sources: relevantChunks.matches.map((match) => ({
        sessionId: match.metadata?.sessionId || '',
        relevance: match.score || 0,
        excerpt: match.metadata?.excerpt || '',
      })),
      suggestTutor: response.toLowerCase().includes('tutor session'),
    },
    conversationId: convId,
  });
}

export const POST = createApiHandler(handler);

