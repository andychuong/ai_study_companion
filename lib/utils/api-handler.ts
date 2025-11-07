import { NextRequest, NextResponse } from 'next/server';
import { AppError } from './errors';
import { logger } from './logger';
import { rateLimit } from './rate-limit';

type ApiHandler = (
  req: NextRequest,
  context?: { params?: Promise<Record<string, string>> | Record<string, string> }
) => Promise<NextResponse>;

// Type for handlers that don't need params
type ApiHandlerWithoutParams = (req: NextRequest) => Promise<NextResponse>;

/**
 * Wrapper for API route handlers with error handling and rate limiting
 */
export function createApiHandler(
  handler: ApiHandler | ApiHandlerWithoutParams
) {
  return async (
    req: NextRequest,
    context?: { params?: Promise<Record<string, string>> | Record<string, string> }
  ) => {
    try {
      // Rate limiting
      const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
      const allowed = await rateLimit(ip);
      
      if (!allowed) {
        return NextResponse.json(
          { error: 'Too many requests' },
          { status: 429 }
        );
      }

      // Execute handler
      const response = await handler(req, context);
      return response;
    } catch (error) {
      logger.error('API error', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        path: req.url,
      });

      if (error instanceof AppError) {
        return NextResponse.json(
          { error: error.message, code: error.code },
          { status: error.statusCode }
        );
      }

      // Unknown error
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

/**
 * Parse JSON body with error handling
 */
export async function parseJsonBody<T>(req: NextRequest): Promise<T> {
  try {
    return await req.json();
  } catch (error) {
    throw new AppError('Invalid JSON body', 400);
  }
}

