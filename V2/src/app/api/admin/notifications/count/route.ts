import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth || auth.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const count = await prisma.governanceNotification.count({
      where: { status: 'ACTIVE' },
    });

    return NextResponse.json({ count });
  } catch (error) {
    console.error('Error fetching notification count:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
