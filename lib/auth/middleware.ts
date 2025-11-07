import { UnauthorizedError, ForbiddenError } from '@/lib/utils/errors';
import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

interface AuthUser {
  id: string;
  email: string;
  role: string;
}

interface AuthSession {
  user: AuthUser;
}

/**
 * Get authenticated session from JWT token
 * Note: NextAuth v5 beta API may differ, so we primarily use JWT tokens
 */
export async function getSession(req?: NextRequest): Promise<AuthSession | null> {
  // Try NextAuth session (if available)
  try {
    // For NextAuth v5, we'll use the auth() helper if available
    // But for now, we'll rely on JWT tokens primarily
  } catch (error) {
    // NextAuth not available, continue to JWT
  }

  // If no NextAuth session and request provided, try JWT token
  if (req) {
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const decoded = jwt.verify(
          token,
          process.env.NEXTAUTH_SECRET || 'fallback-secret-change-in-production'
        ) as { id: string; email: string; role: string };

        // Verify user still exists
        const user = await db.query.users.findFirst({
          where: eq(users.id, decoded.id),
        });

        if (user) {
          return {
            user: {
              id: user.id,
              email: user.email,
              role: user.role,
            },
          };
        }
      } catch (error) {
        // Token invalid, continue to return null
      }
    }
  }

  return null;
}

/**
 * Require authentication - throws if not authenticated
 * Can be used in API routes with or without request
 */
export async function requireAuth(req?: NextRequest): Promise<AuthSession> {
  const session = await getSession(req);
  if (!session) {
    throw new UnauthorizedError('Authentication required');
  }
  return session;
}

/**
 * Require specific role - throws if not authorized
 */
export async function requireRole(allowedRoles: string[], req?: NextRequest) {
  const session = await requireAuth(req);
  if (!allowedRoles.includes(session.user.role)) {
    throw new ForbiddenError('Insufficient permissions');
  }
  return session;
}

/**
 * Require student role
 */
export async function requireStudent(req?: NextRequest) {
  return requireRole(['student'], req);
}

/**
 * Require tutor role
 */
export async function requireTutor(req?: NextRequest) {
  return requireRole(['tutor', 'admin'], req);
}

/**
 * Require admin role
 */
export async function requireAdmin(req?: NextRequest) {
  return requireRole(['admin'], req);
}
