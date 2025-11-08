import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { practices } from '@/lib/db/schema';
import { requireStudent } from '@/lib/auth/middleware';
import { createApiHandler, parseJsonBody } from '@/lib/utils/api-handler';
import { NotFoundError, ForbiddenError } from '@/lib/utils/errors';
import { eq } from 'drizzle-orm';
import { chatCompletion } from '@/lib/openai/client';
import { logger } from '@/lib/utils/logger';
import { z } from 'zod';

const explainRequestSchema = z.object({
  questionId: z.string().min(1),
  studentAnswer: z.string().optional(),
});

async function handler(req: NextRequest, context?: { params?: Promise<Record<string, string>> | Record<string, string> }) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const session = await requireStudent(req);
  const params = context?.params ? await Promise.resolve(context.params) : {};
  const { practiceId } = params;

  if (!practiceId) {
    return NextResponse.json({ error: 'Practice ID required' }, { status: 400 });
  }

  const body = await parseJsonBody(req);
  const { questionId, studentAnswer } = explainRequestSchema.parse(body);

  // Get practice
  const practice = await db.query.practices.findFirst({
    where: eq(practices.id, practiceId),
  });

  if (!practice) {
    throw new NotFoundError('Practice');
  }

  // Check authorization
  if (practice.studentId !== session.user.id) {
    throw new ForbiddenError('Cannot access this practice');
  }

  // Find the question
  const questions = practice.questions as Array<{
    questionId: string;
    question: string;
    type: string;
    options?: string[];
    difficulty: number;
    correct_answer?: string;
    correctAnswer?: string;
    explanation?: string;
  }>;

  const question = questions.find((q) => q.questionId === questionId);

  if (!question) {
    return NextResponse.json({ error: 'Question not found' }, { status: 404 });
  }

  // Generate explanation using AI
  try {
    if (!process.env.OPENAI_API_KEY) {
      logger.warn('OPENAI_API_KEY not configured', { studentId: session.user.id });
      return NextResponse.json(
        { error: 'AI service is not configured' },
        { status: 503 }
      );
    }

    const correctAnswer = question.correct_answer || question.correctAnswer || 'Not provided';
    const hasStudentAnswer = studentAnswer && studentAnswer.trim().length > 0;

    const prompt = `You are a helpful tutor. A student is working on this practice question:

Question: ${question.question}
Type: ${question.type}
Difficulty: ${question.difficulty}/10

${question.type === 'multiple_choice' && question.options
  ? `Options:\n${question.options.map((opt, i) => `${i + 1}. ${opt}`).join('\n')}`
  : ''}

Correct Answer: ${correctAnswer}

${hasStudentAnswer ? `Student's Answer: ${studentAnswer}` : ''}

${question.explanation ? `Original Explanation: ${question.explanation}` : ''}

Generate a clear, comprehensive explanation that:
1. Explains why the correct answer is correct
2. ${hasStudentAnswer ? "Addresses the student's answer and explains why it's correct or incorrect" : 'Helps the student understand the concept'}
3. Breaks down the reasoning step-by-step
4. Is appropriate for difficulty level ${question.difficulty}/10
5. Is educational and helps the student learn
6. Is 3-5 sentences long

Return only the explanation text, no additional formatting or labels.`;

    const completion = await chatCompletion(
      [{ role: 'user', content: prompt }],
      {
        model: 'gpt-4-turbo-preview',
        temperature: 0.7,
        maxTokens: 300,
      }
    );

    const explanation = completion.choices[0]?.message?.content || 
      (question.explanation || 'Unable to generate explanation at this time.');

    return NextResponse.json({
      explanation,
      questionId,
      correctAnswer,
    });
  } catch (error: any) {
    logger.error('Failed to generate explanation', {
      error: error?.message || String(error),
      studentId: session.user.id,
      practiceId,
      questionId,
    });

    // Fallback to stored explanation if available
    if (question.explanation) {
      return NextResponse.json({
        explanation: question.explanation,
        questionId,
        correctAnswer: question.correct_answer || question.correctAnswer || undefined,
      });
    }

    return NextResponse.json(
      { error: 'Failed to generate explanation. Please try again.' },
      { status: 500 }
    );
  }
}

export const POST = createApiHandler(handler);

