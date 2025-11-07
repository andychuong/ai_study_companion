import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, students } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { createApiHandler, parseJsonBody } from '@/lib/utils/api-handler';
import { ValidationError } from '@/lib/utils/errors';
import { z } from 'zod';
import jwt from 'jsonwebtoken';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
  role: z.enum(['student', 'tutor']),
  grade: z.number().optional(),
});

async function handler(req: NextRequest) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const body = await parseJsonBody(req);
  const data = registerSchema.parse(body);

  // Check if user exists
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, data.email),
  });

  if (existingUser) {
    throw new ValidationError('User with this email already exists');
  }

  // Hash password
  const passwordHash = await bcrypt.hash(data.password, 10);

  // Create user
  const [user] = await db
    .insert(users)
    .values({
      email: data.email,
      passwordHash,
      name: data.name,
      role: data.role,
      grade: data.grade,
    })
    .returning();

  // Create student profile if role is student
  if (data.role === 'student' && data.grade) {
    await db.insert(students).values({
      userId: user.id,
      grade: data.grade,
    });
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

export const POST = createApiHandler(handler);

