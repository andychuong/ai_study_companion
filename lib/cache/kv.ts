import { kv } from '@vercel/kv';

/**
 * Get cached value
 */
export async function getCached<T>(key: string): Promise<T | null> {
  try {
    const value = await kv.get<T>(key);
    return value;
  } catch (error) {
    console.error('Cache get error:', error);
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
    console.error('Cache set error:', error);
  }
}

/**
 * Delete cached value
 */
export async function deleteCached(key: string): Promise<void> {
  try {
    await kv.del(key);
  } catch (error) {
    console.error('Cache delete error:', error);
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



