import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth/middleware';
import { createApiHandler } from '@/lib/utils/api-handler';

async function handler(req: NextRequest) {
  if (req.method !== 'GET') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const session = await requireAuth(req);

  // Get all tutor users
  const tutors = await db.query.users.findMany({
    where: eq(users.role, 'tutor'),
  });

  return NextResponse.json(
    tutors.map((tutor) => ({
      id: tutor.id,
      email: tutor.email,
      name: tutor.name,
    }))
  );
}

export const GET = createApiHandler(handler);

