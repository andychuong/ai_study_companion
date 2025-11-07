export { inngest } from './client';

// Only export Inngest functions if Inngest is configured
// This prevents importing Pinecone/OpenAI when not needed
if (process.env.INNGEST_EVENT_KEY) {
  // Lazy load functions to avoid importing Pinecone/OpenAI when not needed
  // Functions will be imported when Inngest is actually used
}

