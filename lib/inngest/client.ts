import { Inngest } from 'inngest';

export const inngest = new Inngest({
  id: 'ai-study-companion',
  name: 'AI Study Companion',
  eventKey: process.env.INNGEST_EVENT_KEY,
});



