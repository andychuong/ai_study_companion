import { inngest } from '../client';
import { db } from '@/lib/db';
import { sessions, concepts, studentConcepts } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { chatCompletion, extractJSON, generateEmbedding } from '@/lib/openai/client';
import { upsertVectors } from '@/lib/pinecone/client';
import { logger } from '@/lib/utils/logger';

export const analyzeTranscript = inngest.createFunction(
  { id: 'analyze-transcript' },
  { event: 'transcript.uploaded' },
  async ({ event, step }) => {
    const { sessionId, studentId, transcript, transcriptUrl } = event.data;

    // Step 1: Parse and extract insights
    const insights = await step.run('extract-insights', async () => {
      const prompt = `Extract key information from this tutoring session transcript:

${transcript}

Extract and return JSON with:
- topics_covered: [list of topics covered in the session]
- concepts_taught: [list of specific concepts taught, each with:
  - name: a clear, descriptive name for the concept (e.g., "Factoring Quadratics", "Quadratic Formula", "Discriminant Analysis")
  - difficulty: number between 1-10 indicating concept difficulty
  - masteryLevel: number between 0-100 indicating student's mastery level]
- student_strengths: [identified strengths]
- areas_for_improvement: [areas needing work]
- action_items: [practice recommendations]
- suggested_follow_up: [next session topics]

IMPORTANT: Each concept in concepts_taught must have a descriptive "name" field (not just an ID or subject).`;

      const completion = await chatCompletion(
        [{ role: 'user', content: prompt }],
        {
          model: 'gpt-4-turbo-preview',
          responseFormat: { type: 'json_object' },
          maxTokens: 2000,
        }
      );

      return extractJSON<{
        topics_covered: string[];
        concepts_taught: Array<{
          name?: string;
          id?: string;
          subject?: string;
          difficulty: number;
          masteryLevel: number;
        }>;
        student_strengths: string[];
        areas_for_improvement: string[];
        action_items: string[];
        suggested_follow_up: string[];
      }>(completion);
    });

    // Step 2: Chunk transcript and generate embeddings
    const chunks = await step.run('generate-embeddings', async () => {
      // Simple chunking: split by paragraphs, max 500 tokens per chunk
      const paragraphs = transcript.split('\n\n').filter((p: string) => p.trim().length > 0);
      const chunks: string[] = [];
      let currentChunk = '';

      for (const para of paragraphs) {
        const words: string[] = para.split(' ');
        if (currentChunk.split(' ').length + words.length > 500) {
          if (currentChunk) chunks.push(currentChunk);
          currentChunk = para;
        } else {
          currentChunk += (currentChunk ? '\n\n' : '') + para;
        }
      }
      if (currentChunk) chunks.push(currentChunk);

      // Generate embeddings
      const embeddings = await Promise.all(
        chunks.map((chunk) => generateEmbedding(chunk))
      );

      return { chunks, embeddings };
    });

    // Step 3: Store in vector DB (optional - skip if Pinecone not configured)
    await step.run('store-vectors', async () => {
      try {
        const vectors = chunks.chunks.map((chunk, index) => ({
          id: `${sessionId}-chunk-${index}`,
          values: chunks.embeddings[index],
          metadata: {
            studentId,
            sessionId,
            date: new Date().toISOString(),
            topics: insights.topics_covered || [],
            concepts: (insights.concepts_taught || [])
              .filter((c) => c && c.name && typeof c.name === 'string')
              .map((c) => c.name),
          },
        }));

        await upsertVectors(vectors);
        logger.info('Stored vectors in Pinecone', { sessionId, count: vectors.length });
      } catch (error) {
        // Log but don't fail the entire analysis if Pinecone fails
        logger.warn('Failed to store vectors in Pinecone (continuing without RAG)', { 
          error, 
          sessionId,
          message: error instanceof Error ? error.message : 'Unknown error'
        });
        // Continue without failing - analysis can complete without vector storage
      }
    });

    // Step 4: Update session with analysis
    await step.run('store-insights', async () => {
      await db
        .update(sessions)
        .set({
          analysisStatus: 'completed',
          analysisData: {
            topics: insights.topics_covered,
            concepts: insights.concepts_taught,
            studentStrengths: insights.student_strengths,
            areasForImprovement: insights.areas_for_improvement,
            actionItems: insights.action_items,
          },
        })
        .where(eq(sessions.id, sessionId));
    });

    // Step 5: Update student concept mastery levels
    await step.run('update-mastery', async () => {
      // Validate and normalize concepts (handle both name and id formats)
      const validConcepts = insights.concepts_taught
        .map((conceptData) => {
          // Normalize concept data - handle both formats
          if (!conceptData || typeof conceptData !== 'object') {
            return null;
          }

          // Get concept name - prefer name, fallback to id, or generate from subject
          const conceptName = 
            (conceptData.name && typeof conceptData.name === 'string' && conceptData.name.trim())
            || (conceptData.id && typeof conceptData.id === 'string' && conceptData.id.trim())
            || (conceptData.subject && typeof conceptData.subject === 'string' && conceptData.subject.trim())
            || null;

          // Validate required fields
          if (
            !conceptName ||
            typeof conceptData.difficulty !== 'number' ||
            conceptData.difficulty < 1 ||
            conceptData.difficulty > 10 ||
            typeof conceptData.masteryLevel !== 'number' ||
            conceptData.masteryLevel < 0 ||
            conceptData.masteryLevel > 100
          ) {
            return null;
          }

          return {
            name: conceptName,
            difficulty: conceptData.difficulty,
            masteryLevel: conceptData.masteryLevel,
            subject: conceptData.subject || insights.topics_covered?.[0] || 'General',
          };
        })
        .filter((concept): concept is NonNullable<typeof concept> => concept !== null);

      if (validConcepts.length === 0) {
        logger.warn('No valid concepts to update mastery for', { 
          sessionId, 
          studentId,
          rawConcepts: insights.concepts_taught 
        });
        return;
      }

      for (const conceptData of validConcepts) {
        try {
          // Find or create concept
          let concept = await db.query.concepts.findFirst({
            where: eq(concepts.name, conceptData.name),
          });

          if (!concept) {
            const [newConcept] = await db
              .insert(concepts)
              .values({
                name: conceptData.name,
                subject: conceptData.subject,
                difficulty: conceptData.difficulty,
              })
              .returning();
            concept = newConcept;
          }

          // Update student concept mastery
          const existing = await db.query.studentConcepts.findFirst({
            where: and(
              eq(studentConcepts.studentId, studentId),
              eq(studentConcepts.conceptId, concept.id)
            ),
          });

          if (existing) {
            await db
              .update(studentConcepts)
              .set({
                masteryLevel: Math.max(existing.masteryLevel, conceptData.masteryLevel),
                lastPracticed: new Date(),
              })
              .where(eq(studentConcepts.id, existing.id));
          } else {
            await db.insert(studentConcepts).values({
              studentId,
              conceptId: concept.id,
              masteryLevel: conceptData.masteryLevel,
              lastPracticed: new Date(),
            });
          }
        } catch (error) {
          logger.error('Failed to update mastery for concept', {
            error,
            sessionId,
            studentId,
            conceptName: conceptData?.name,
            message: error instanceof Error ? error.message : 'Unknown error',
          });
          // Continue with next concept instead of failing entire step
        }
      }
    });

    // Step 6: Trigger practice generation
    await step.sendEvent('practice.generate', {
      name: 'practice.generate',
      data: {
        sessionId,
        studentId,
      },
    });

    logger.info('Transcript analysis completed', { sessionId, studentId });
  }
);

