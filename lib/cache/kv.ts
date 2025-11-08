import { kv } from '@vercel/kv';
import { logger } from '@/lib/utils/logger';

/**
 * Get cached value
 */
export async function getCached<T>(key: string): Promise<T | null> {
  try {
    const value = await kv.get<T>(key);
    return value;
  } catch (error) {
    logger.error('Cache get error', { error, key });
    return null;
  }
}

/**
 * Set cached value with TTL
 */
export async function setCached<T>(
  key: string,
  value: T,
  ttl: number = 3600 // 1 hour default
): Promise<void> {
  try {
    await kv.set(key, value, { ex: ttl });
  } catch (error) {
    logger.error('Cache set error', { error, key });
  }
}

/**
 * Delete cached value
 */
export async function deleteCached(key: string): Promise<void> {
  try {
    await kv.del(key);
  } catch (error) {
    logger.error('Cache delete error', { error, key });
  }
}

/**
 * Get or set cached value (cache-aside pattern)
 */
export async function getCachedOrSet<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 3600
): Promise<T> {
  const cached = await getCached<T>(key);
  if (cached !== null) {
    return cached;
  }

  const data = await fetcher();
  await setCached(key, data, ttl);
  return data;
}



