import { serve } from 'inngest/next';
import { inngest } from '@/lib/inngest';
import { NextRequest, NextResponse } from 'next/server';

// Lazy load functions only when Inngest is configured
// This prevents importing Pinecone/OpenAI when not needed
async function getHandler() {
  // For local dev, allow functions to load even without INNGEST_EVENT_KEY
  // The dev server will work without it. For production, INNGEST_EVENT_KEY is required.
  const isLocalDev = process.env.NODE_ENV === 'development' || !process.env.INNGEST_EVENT_KEY;
  
  // Only block if we're in production and don't have the key
  if (!isLocalDev && !process.env.INNGEST_EVENT_KEY) {
    return null;
  }

  // Dynamic imports to avoid loading Pinecone/OpenAI when not needed
  const { analyzeTranscript } = await import('@/lib/inngest/functions/analyze-transcript');
  const { generatePractice } = await import('@/lib/inngest/functions/generate-practice');
  const { sendEngagementNudges } = await import('@/lib/inngest/functions/engagement-nudges');
  const { generateSubjectSuggestions } = await import('@/lib/inngest/functions/subject-suggestions');

  return serve({
    client: inngest,
    functions: [
      analyzeTranscript,
      generatePractice,
      sendEngagementNudges,
      generateSubjectSuggestions,
    ],
  });
}

// Cache the handler
let handlerCache: ReturnType<typeof serve> | null = null;

// Export handlers or return 503 if Inngest is not configured
export const GET = async (req: NextRequest) => {
  if (!handlerCache) {
    handlerCache = await getHandler();
  }
  if (!handlerCache) {
    return NextResponse.json({ error: 'Inngest is not configured' }, { status: 503 });
  }
  return handlerCache.GET(req);
};

export const POST = async (req: NextRequest) => {
  if (!handlerCache) {
    handlerCache = await getHandler();
  }
  if (!handlerCache) {
    return NextResponse.json({ error: 'Inngest is not configured' }, { status: 503 });
  }
  return handlerCache.POST(req);
};

export const PUT = async (req: NextRequest) => {
  if (!handlerCache) {
    handlerCache = await getHandler();
  }
  if (!handlerCache) {
    return NextResponse.json({ error: 'Inngest is not configured' }, { status: 503 });
  }
  return handlerCache.PUT(req);
};

