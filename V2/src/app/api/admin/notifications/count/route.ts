import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  const cookieStore = await cookies();
  const isDemoAdmin = cookieStore.get('sbmi_demo_admin')?.value === '1';

  if (isDemoAdmin) {
    return NextResponse.json({ count: 2 });
  }

  const user = await getSession();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ count: 0 });
  }

  try {
    const count = await prisma.governanceNotification.count({
      where: { status: 'ACTIVE' },
    });
    return NextResponse.json({ count });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}
