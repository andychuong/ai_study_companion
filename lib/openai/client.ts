import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  console.warn('⚠️  OPENAI_API_KEY is not set. AI features will not work.');
}

export const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  : null;

// Embedding model configuration
export const EMBEDDING_MODEL = 'text-embedding-3-large';
// Pinecone supports 3072, 1024, or 256 for text-embedding-3-large
// Using 3072 for best quality (can also use 1024 or 256)
export const EMBEDDING_DIMENSIONS = 3072;

// LLM model configuration
// gpt-4o is faster than gpt-4-turbo-preview while maintaining quality
export const PRIMARY_MODEL = 'gpt-4o';
export const FAST_MODEL = 'gpt-3.5-turbo'; // Fastest option for speed-critical operations
export const FALLBACK_MODEL = 'gpt-3.5-turbo';

/**
 * Generate embedding for text
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  if (!openai) {
    throw new Error('OpenAI API key is not configured. Please add OPENAI_API_KEY to your .env.local file.');
  }
  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text,
    dimensions: EMBEDDING_DIMENSIONS, // Specify dimensions to match Pinecone index
  });
  return response.data[0].embedding;
}

/**
 * Generate embeddings for multiple texts
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  if (!openai) {
    throw new Error('OpenAI API key is not configured. Please add OPENAI_API_KEY to your .env.local file.');
  }
  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: texts,
    dimensions: EMBEDDING_DIMENSIONS, // Specify dimensions to match Pinecone index
  });
  return response.data.map(item => item.embedding);
}

/**
 * Chat completion with error handling and fallback
 */
export async function chatCompletion(
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
  options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    responseFormat?: { type: 'json_object' } | { type: 'text' };
  }
): Promise<OpenAI.Chat.Completions.ChatCompletion> {
  if (!openai) {
    throw new Error('OpenAI API key is not configured. Please add OPENAI_API_KEY to your environment variables.');
  }
  const model = options?.model || PRIMARY_MODEL;
  
  try {
    return await openai.chat.completions.create({
      model,
      messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 500,
      response_format: options?.responseFormat,
    });
  } catch (error: any) {
    // Fallback to GPT-3.5 if GPT-4 fails
    if (error?.status === 429 || error?.status === 500) {
      if (model !== FALLBACK_MODEL) {
        return chatCompletion(messages, {
          ...options,
          model: FALLBACK_MODEL,
        });
      }
    }
    throw error;
  }
}

/**
 * Extract JSON from response
 */
export function extractJSON<T>(response: OpenAI.Chat.Completions.ChatCompletion): T {
  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No content in response');
  }
  
  try {
    // Try to parse the content directly
    const parsed = JSON.parse(content) as T;
    return parsed;
  } catch (error) {
    // If direct parsing fails, try to extract JSON from markdown code blocks
    const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      try {
        return JSON.parse(jsonMatch[1]) as T;
      } catch (e) {
        // Fall through to throw original error
      }
    }
    
    // Try to find JSON object in the content
    const jsonObjectMatch = content.match(/\{[\s\S]*\}/);
    if (jsonObjectMatch && jsonObjectMatch[0]) {
      try {
        return JSON.parse(jsonObjectMatch[0]) as T;
      } catch (e) {
        // Fall through to throw original error
      }
    }
    
    throw new Error(`Failed to parse JSON: ${error instanceof Error ? error.message : String(error)}. Content: ${content.substring(0, 500)}`);
  }
}

