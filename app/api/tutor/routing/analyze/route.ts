import { NextRequest, NextResponse } from 'next/server';
import { requireStudent } from '@/lib/auth/middleware';
import { createApiHandler, parseJsonBody } from '@/lib/utils/api-handler';
import { chatCompletion, extractJSON } from '@/lib/openai/client';
import { z } from 'zod';

const analyzeSchema = z.object({
  context: z.object({
    recentConversations: z.array(z.string()).optional(),
    practiceResults: z.array(z.string()).optional(),
    currentQuestion: z.string().optional(),
  }),
});

async function handler(req: NextRequest) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const session = await requireStudent(req);
  const body = await parseJsonBody(req);
  const { context } = analyzeSchema.parse(body);

  // Use GPT-4 to analyze if tutor routing is needed
  const prompt = `Analyze if this student needs tutor intervention:

Student ID: ${session.user.id}
Recent conversations: ${context.recentConversations?.join(', ') || 'None'}
Practice results: ${context.practiceResults?.join(', ') || 'None'}
Current question: ${context.currentQuestion || 'None'}

Route to tutor if:
- Question is too complex for AI
- Student seems confused or frustrated
- Requires hands-on demonstration
- Student asks for tutor explicitly
- Repeated incorrect answers

Return JSON: {
  "shouldRoute": boolean,
  "reason": string,
  "recommendedTopic": string,
  "urgency": "low" | "medium" | "high",
  "tutorContext": {
    "summary": string,
    "focusAreas": string[],
    "studentStrengths": string[]
  }
}`;

  const completion = await chatCompletion(
    [{ role: 'user', content: prompt }],
    {
      model: 'gpt-4-turbo-preview',
      responseFormat: { type: 'json_object' },
    }
  );

  const analysis = extractJSON<{
    shouldRoute: boolean;
    reason: string;
    recommendedTopic: string;
    urgency: 'low' | 'medium' | 'high';
    tutorContext: {
      summary: string;
      focusAreas: string[];
      studentStrengths: string[];
    };
  }>(completion);

  return NextResponse.json({
    shouldRoute: analysis.shouldRoute,
    reason: analysis.reason,
    recommendedTopic: analysis.recommendedTopic,
    urgency: analysis.urgency,
    tutorContext: analysis.tutorContext,
  });
}

export const POST = createApiHandler(handler);

