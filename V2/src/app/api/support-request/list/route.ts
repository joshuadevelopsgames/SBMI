import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

const DEMO_REQUESTS = [
  {
    id: 'demo-sr-1',
    submittedByUserId: 'admin-1',
    targetUserId: 'demo-user-3',
    targetFamilyMemberId: null,
    description: 'Member requires medical assistance following hospitalization.',
    supportType: 'MEDICAL',
    amountRequested: 50000,
    status: 'PENDING',
    createdAt: new Date('2026-02-28T10:00:00').toISOString(),
  },
  {
    id: 'demo-sr-2',
    submittedByUserId: 'admin-2',
    targetUserId: 'demo-user-5',
    targetFamilyMemberId: null,
    description: "Funeral assistance for member's parent.",
    supportType: 'FUNERAL',
    amountRequested: 150000,
    status: 'APPROVED',
    createdAt: new Date('2026-02-15T09:00:00').toISOString(),
  },
  {
    id: 'demo-sr-3',
    submittedByUserId: 'admin-1',
    targetUserId: 'demo-user-7',
    targetFamilyMemberId: null,
    description: 'Emergency financial assistance requested.',
    supportType: 'EMERGENCY',
    amountRequested: 30000,
    status: 'DECLINED',
    createdAt: new Date('2026-02-01T14:00:00').toISOString(),
  },
];

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const isDemoAdmin = cookieStore.get('sbmi_demo_admin')?.value === '1';

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || 'PENDING';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');

  if (isDemoAdmin) {
    const filtered = status === 'ALL' ? DEMO_REQUESTS : DEMO_REQUESTS.filter(r => r.status === status);
    return NextResponse.json({ requests: filtered, pagination: { page: 1, limit, total: filtered.length, pages: 1 } });
  }

  const user = await getSession();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};
    if (status !== 'ALL') where.status = status;

    const [requests, total] = await Promise.all([
      prisma.supportRequest.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: limit }),
      prisma.supportRequest.count({ where }),
    ]);

    return NextResponse.json({ requests, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    console.error('Error fetching support requests:', error);
    const filtered = status === 'ALL' ? DEMO_REQUESTS : DEMO_REQUESTS.filter(r => r.status === status);
    return NextResponse.json({ requests: filtered, pagination: { page: 1, limit, total: filtered.length, pages: 1 } });
  }
}
