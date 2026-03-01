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

    // Create a pre-verified admin user
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        role: 'ADMIN',
        passwordHash,
        firstName: 'System',
        lastName: 'Administrator',
        status: 'ACTIVE',
        twoFactorCode: '000000', // Set a static 2FA code for easy bypass
        twoFactorCodeAt: new Date(),
      },
      create: {
        email,
        passwordHash,
        firstName: 'System',
        lastName: 'Administrator',
        role: 'ADMIN',
        status: 'ACTIVE',
        twoFactorCode: '000000', // Set a static 2FA code for easy bypass
        twoFactorCodeAt: new Date(),
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: `Admin user ${user.email} is ready. Use code 000000 for 2FA.`,
      credentials: { email, password, code: '000000' }
    });
  } catch (error) {
    console.error('Error setting up admin:', error);
    return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
