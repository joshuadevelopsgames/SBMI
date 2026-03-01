import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST() {
  // ONLY allow this on the dev branch/environment
  if (process.env.NODE_ENV === 'production' && process.env.VERCEL_GIT_COMMIT_REF !== 'dev') {
    return NextResponse.json({ error: 'Not allowed in production' }, { status: 403 });
  }

  try {
    const email = 'admin@sbmi.ca';
    const password = 'AdminPassword123!';
    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        role: 'ADMIN',
        passwordHash,
        firstName: 'System',
        lastName: 'Administrator',
        status: 'ACTIVE',
      },
      create: {
        email,
        passwordHash,
        firstName: 'System',
        lastName: 'Administrator',
        role: 'ADMIN',
        status: 'ACTIVE',
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: `Admin user ${user.email} is ready.`,
      credentials: { email, password }
    });
  } catch (error) {
    console.error('Error setting up admin:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
