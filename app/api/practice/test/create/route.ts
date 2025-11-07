import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { practices } from '@/lib/db/schema';
import { requireStudent } from '@/lib/auth/middleware';
import { createApiHandler } from '@/lib/utils/api-handler';

async function handler(req: NextRequest) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const session = await requireStudent(req);

  const testQuestions = [
    {
      questionId: 'q1',
      question: 'What is the pH of a solution with [H+] = 0.001 M?',
      type: 'multiple_choice',
      options: ['1', '2', '3', '4'],
      difficulty: 5,
      conceptId: 'concept-1',
      correct_answer: '3',
      explanation: 'pH = -log[H+]. For [H+] = 0.001 M, pH = -log(0.001) = 3.',
    },
    {
      questionId: 'q2',
      question: 'What is the chemical formula for water?',
      type: 'short_answer',
      difficulty: 1,
      conceptId: 'concept-2',
      correct_answer: 'H2O',
      explanation: 'Water is composed of two hydrogen atoms and one oxygen atom.',
    },
    {
      questionId: 'q3',
      question: 'Which of the following is a strong acid?',
      type: 'multiple_choice',
      options: ['Acetic acid', 'Hydrochloric acid', 'Carbonic acid', 'Phosphoric acid'],
      difficulty: 4,
      conceptId: 'concept-3',
      correct_answer: 'Hydrochloric acid',
      explanation: 'Hydrochloric acid (HCl) is a strong acid because it completely dissociates in water.',
    },
    {
      questionId: 'q4',
      question: 'Calculate the molarity of a solution containing 0.5 moles of NaCl in 2 liters of water.',
      type: 'short_answer',
      difficulty: 6,
      conceptId: 'concept-4',
      correct_answer: '0.25 M',
      explanation: 'Molarity = moles / liters = 0.5 / 2 = 0.25 M',
    },
    {
      questionId: 'q5',
      question: 'What is the oxidation state of oxygen in H2O?',
      type: 'multiple_choice',
      options: ['-2', '-1', '0', '+1'],
      difficulty: 3,
      conceptId: 'concept-5',
      correct_answer: '-2',
      explanation: 'In most compounds, oxygen has an oxidation state of -2.',
    },
  ];

  const [practice] = await db
    .insert(practices)
    .values({
      studentId: session.user.id,
      status: 'assigned',
      questions: testQuestions as any,
    })
    .returning();

  return NextResponse.json({
    practiceId: practice.id,
    status: 'assigned',
    message: 'Test practice created successfully',
    questions: testQuestions.length,
  });
}

export const POST = createApiHandler(handler);

