import { inngest } from '../client';
import { db } from '@/lib/db';
import { users, sessions, notifications } from '@/lib/db/schema';
import { eq, and, gte, lt, count } from 'drizzle-orm';
import { chatCompletion, extractJSON } from '@/lib/openai/client';
import { logger } from '@/lib/utils/logger';
import { subDays } from 'date-fns';

export const sendEngagementNudges = inngest.createFunction(
  { id: 'send-engagement-nudges' },
  { cron: '0 9 * * *' }, // Daily at 9 AM
  async ({ step }) => {
    // Step 1: Find students needing nudge (<3 sessions by Day 7)
    const studentsNeedingNudge = await step.run('find-students', async () => {
      const sevenDaysAgo = subDays(new Date(), 7);
      const now = new Date();

      // Get all students
      const allStudents = await db.query.users.findMany({
        where: eq(users.role, 'student'),
      });

      const studentsToNudge = [];

      for (const student of allStudents) {
        // Count sessions in first 7 days
        const firstSession = await db.query.sessions.findFirst({
          where: eq(sessions.studentId, student.id),
          orderBy: (sessions, { asc }) => [asc(sessions.sessionDate)],
        });

        if (!firstSession) continue;

        const sevenDaysAfterFirst = new Date(firstSession.sessionDate);
        sevenDaysAfterFirst.setDate(sevenDaysAfterFirst.getDate() + 7);

        if (sevenDaysAfterFirst > now) {
          // Still within first 7 days
          const sessionCount = await db.query.sessions.findMany({
            where: and(
              eq(sessions.studentId, student.id),
              gte(sessions.sessionDate, firstSession.sessionDate),
              lt(sessions.sessionDate, sevenDaysAfterFirst)
            ),
          });

          if (sessionCount.length < 3) {
            studentsToNudge.push({
              studentId: student.id,
              studentName: student.name,
              sessionCount: sessionCount.length,
              daysSinceFirst: Math.floor(
                (now.getTime() - firstSession.sessionDate.getTime()) / (1000 * 60 * 60 * 24)
              ),
            });
          }
        }
      }

      return studentsToNudge;
    });

    // Step 2: Generate and send nudges
    for (const studentData of studentsNeedingNudge) {
      await step.run(`nudge-${studentData.studentId}`, async () => {
        // Generate personalized nudge message
        const prompt = `Generate a personalized engagement nudge for ${studentData.studentName}:

Student context:
- Sessions completed: ${studentData.sessionCount}
- Days since first session: ${studentData.daysSinceFirst}

Create a personalized message that:
1. Acknowledges their progress
2. Highlights value of continuing
3. Includes specific value proposition
4. Encourages booking next session
5. Keeps tone friendly and supportive

Return JSON: {
  "message": string,
  "cta": string,
  "urgency": "low" | "medium" | "high"
}`;

        const completion = await chatCompletion(
          [{ role: 'user', content: prompt }],
          {
            model: 'gpt-4-turbo-preview',
            responseFormat: { type: 'json_object' },
          }
        );

        const nudge = extractJSON<{
          message: string;
          cta: string;
          urgency: 'low' | 'medium' | 'high';
        }>(completion);

        // Store notification in database
        await db.insert(notifications).values({
          studentId: studentData.studentId,
          type: 'engagement_nudge',
          title: 'Keep Your Learning Momentum Going!',
          message: nudge.message,
          cta: nudge.cta || 'Book Next Session',
          ctaUrl: '/sessions',
          urgency: nudge.urgency || 'medium',
          metadata: {
            sessionCount: studentData.sessionCount,
            daysSinceFirst: studentData.daysSinceFirst,
          },
        });

        logger.info('Engagement nudge generated and stored', {
          studentId: studentData.studentId,
          message: nudge.message,
          urgency: nudge.urgency,
        });

        // TODO: Integrate with email/SMS service for external notifications
        // await sendEmailNotification(studentData.studentId, nudge.message);
        // await sendSMSNotification(studentData.studentId, nudge.message);
      });
    }

    logger.info('Engagement nudges processed', {
      count: studentsNeedingNudge.length,
    });
  }
);

