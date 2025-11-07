import { z } from 'zod';

/**
 * Common validation schemas
 */

export const uuidSchema = z.string().uuid();

export const emailSchema = z.string().email();

export const paginationSchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(10),
  offset: z.coerce.number().min(0).default(0),
});

export const dateRangeSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

/**
 * Validate UUID
 */
export function validateUUID(id: string): boolean {
  return uuidSchema.safeParse(id).success;
}

/**
 * Validate email
 */
export function validateEmail(email: string): boolean {
  return emailSchema.safeParse(email).success;
}


