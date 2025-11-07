import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { subjectSuggestions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth/middleware';
import { createApiHandler } from '@/lib/utils/api-handler';
import { ForbiddenError } from '@/lib/utils/errors';

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
  if (session.user.id !== studentId && session.user.role !== 'admin') {
    throw new ForbiddenError('Cannot access other student suggestions');
  }

  const suggestions = await db.query.subjectSuggestions.findMany({
    where: eq(subjectSuggestions.studentId, studentId),
  });

  return NextResponse.json({
    suggestions: suggestions.map((s) => ({
      suggestionId: s.id,
      subject: s.subject,
      description: s.description,
      relevanceScore: s.relevanceScore,
      valueProposition: s.valueProposition,
      status: s.status,
    })),
  });
}

export const GET = createApiHandler(handler);

