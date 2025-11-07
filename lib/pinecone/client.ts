import { Pinecone } from '@pinecone-database/pinecone';
import { logger } from '@/lib/utils/logger';

// Initialize Pinecone client lazily (initialize when needed, not at module load)
let pinecone: Pinecone | null = null;
let index: ReturnType<Pinecone['index']> | null = null;

/**
 * Initialize Pinecone client if not already initialized
 * This is called lazily to ensure environment variables are available
 */
function initializePinecone(): boolean {
  // If already initialized, return true
  if (index) {
    return true;
  }

  // Check if API key is available
  if (!process.env.PINECONE_API_KEY) {
    logger.warn('PINECONE_API_KEY is not set. RAG features will not work.');
    return false;
  }

  try {
    pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    } as any); // Type assertion to bypass type check
    
    const INDEX_NAME = process.env.PINECONE_INDEX_NAME || 'study-companion';
    index = pinecone.index(INDEX_NAME);
    logger.info('Pinecone client initialized', { indexName: INDEX_NAME });
    return true;
  } catch (error) {
    logger.error('Failed to initialize Pinecone', { error });
    pinecone = null;
    index = null;
    return false;
  }
}

/**
 * Upsert vectors to Pinecone
 */
export async function upsertVectors(
  vectors: Array<{
    id: string;
    values: number[];
    metadata: Record<string, any>;
  }>
) {
  // Initialize Pinecone if not already initialized
  if (!initializePinecone() || !index) {
    throw new Error('Pinecone is not configured. Please add PINECONE_API_KEY to your environment variables.');
  }
  await index.upsert(vectors);
}

/**
 * Query vectors from Pinecone
 */
export async function queryVectors(
  embedding: number[],
  options?: {
    topK?: number;
    filter?: Record<string, any>;
    includeMetadata?: boolean;
  }
) {
  // Initialize Pinecone if not already initialized
  if (!initializePinecone() || !index) {
    // Return empty results if Pinecone is not configured (for development)
    logger.warn('Pinecone not configured, returning empty results');
    return { matches: [] };
  }
  const topK = options?.topK ?? 5;
  const filter = options?.filter;
  const includeMetadata = options?.includeMetadata ?? true;

  return index.query({
    vector: embedding,
    topK,
    includeMetadata,
    filter,
  });
}

/**
 * Delete vectors by IDs
 */
export async function deleteVectors(ids: string[]) {
  // Initialize Pinecone if not already initialized
  if (!initializePinecone() || !index) {
    throw new Error('Pinecone is not configured');
  }
  await index.deleteMany(ids);
}

/**
 * Delete vectors by filter
 */
export async function deleteVectorsByFilter(filter: Record<string, any>) {
  // Initialize Pinecone if not already initialized
  if (!initializePinecone() || !index) {
    throw new Error('Pinecone is not configured');
  }
  await index.deleteMany(filter);
}

