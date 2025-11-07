import { Pinecone } from '@pinecone-database/pinecone';

if (!process.env.PINECONE_API_KEY) {
  console.warn('⚠️  PINECONE_API_KEY is not set. RAG features will not work.');
}

// Initialize Pinecone client (newer SDK only needs API key)
let pinecone: Pinecone | null = null;
let index: ReturnType<Pinecone['index']> | null = null;

if (process.env.PINECONE_API_KEY) {
  try {
    pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });
    
    const INDEX_NAME = process.env.PINECONE_INDEX_NAME || 'study-companion';
    index = pinecone.index(INDEX_NAME);
  } catch (error) {
    console.error('Failed to initialize Pinecone:', error);
    pinecone = null;
    index = null;
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
  if (!index) {
    throw new Error('Pinecone is not configured. Please add PINECONE_API_KEY to your .env.local file.');
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
  if (!index) {
    // Return empty results if Pinecone is not configured (for development)
    console.warn('Pinecone not configured, returning empty results');
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
  await index.deleteMany(ids);
}

/**
 * Delete vectors by filter
 */
export async function deleteVectorsByFilter(filter: Record<string, any>) {
  await index.deleteMany(filter);
}

