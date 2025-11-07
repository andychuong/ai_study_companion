import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { practices } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireStudent } from '@/lib/auth/middleware';
import { createApiHandler, parseJsonBody } from '@/lib/utils/api-handler';
import { NotFoundError, ForbiddenError } from '@/lib/utils/errors';
import { z } from 'zod';

const submitSchema = z.object({
  answers: z.array(z.object({
    questionId: z.string(),
    answer: z.string(),
  })),
});

async function handler(req: NextRequest, context: { params: { practiceId: string } }) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const session = await requireStudent(req);
  const { practiceId } = context.params;
  const body = await parseJsonBody(req);
  const { answers } = submitSchema.parse(body);

  const practice = await db.query.practices.findFirst({
    where: eq(practices.id, practiceId),
  });

  if (!practice) {
    throw new NotFoundError('Practice');
  }

  if (practice.studentId !== session.user.id) {
    throw new ForbiddenError('Cannot submit this practice');
  }

  // Calculate score
  const questions = practice.questions as Array<{
    questionId: string;
    correct_answer: string;
  }>;

  let correctCount = 0;
  const feedback = answers.map((answer) => {
    const question = questions.find((q) => q.questionId === answer.questionId);
    const isCorrect = question?.correct_answer === answer.answer;
    if (isCorrect) correctCount++;
    
    return {
      questionId: answer.questionId,
      correct: isCorrect,
      feedback: isCorrect
        ? 'Great job! You correctly identified the answer.'
        : `The correct answer is: ${question?.correct_answer}`,
    };
  });

  const score = Math.round((correctCount / questions.length) * 100);

  // Update practice
  await db
    .update(practices)
    .set({
      answers: answers.map((a) => ({
        ...a,
        timestamp: new Date().toISOString(),
      })),
      score,
      status: 'completed',
      completedAt: new Date(),
    })
    .where(eq(practices.id, practiceId));

  return NextResponse.json({
    score,
    feedback: feedback.map((f) => ({
      questionId: f.questionId,
      correct: f.correct,
      explanation: f.feedback,
    })),
    conceptMasteryUpdates: [], // Can be populated based on performance
  });
}

export const POST = createApiHandler(handler);

