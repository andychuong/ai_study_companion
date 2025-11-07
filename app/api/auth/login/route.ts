import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { createApiHandler, parseJsonBody } from '@/lib/utils/api-handler';
import { ValidationError } from '@/lib/utils/errors';
import { z } from 'zod';
import jwt from 'jsonwebtoken';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

async function handler(req: NextRequest) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const body = await parseJsonBody(req);
  const data = loginSchema.parse(body);

  // Find user
  const user = await db.query.users.findFirst({
    where: eq(users.email, data.email),
  });

  if (!user) {
    throw new ValidationError('Invalid email or password');
  }

  // Verify password
  const isValid = await bcrypt.compare(data.password, user.passwordHash);

  if (!isValid) {
    throw new ValidationError('Invalid email or password');
  }

  // Generate JWT token
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.NEXTAUTH_SECRET || 'fallback-secret-change-in-production',
    { expiresIn: '7d' }
  );

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      grade: user.grade || undefined,
    },
    token,
  });
}

export async function POST(req: NextRequest) {
  return createApiHandler(handler)(req);
}

