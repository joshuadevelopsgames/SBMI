import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

const DEMO_NOTIFICATIONS = [
  {
    id: 'demo-notif-1',
    notificationType: 'ASSISTANCE_REQUEST',
    status: 'ACTIVE',
    relatedEntityId: 'demo-ar-1',
    relatedEntityType: 'ASSISTANCE_REQUEST',
    createdBy: 'demo-user-1',
    outcome: null,
    createdAt: new Date('2026-02-28T10:00:00').toISOString(),
    resolvedAt: null,
    approvalVotes: [
      { id: 'v1', decision: 'APPROVE', votedByUserId: 'admin-1' },
    ],
  },
  {
    id: 'demo-notif-2',
    notificationType: 'FAMILY_CHANGE_REQUEST',
    status: 'ACTIVE',
    relatedEntityId: 'demo-fcr-1',
    relatedEntityType: 'FAMILY_CHANGE',
    createdBy: 'demo-user-2',
    outcome: null,
    createdAt: new Date('2026-02-27T14:30:00').toISOString(),
    resolvedAt: null,
    approvalVotes: [],
  },
  {
    id: 'demo-notif-3',
    notificationType: 'APPLICATION_PENDING',
    status: 'RESOLVED',
    relatedEntityId: 'demo-app-1',
    relatedEntityType: 'APPLICATION',
    createdBy: null,
    outcome: 'Approved',
    createdAt: new Date('2026-02-20T09:00:00').toISOString(),
    resolvedAt: new Date('2026-02-22T11:00:00').toISOString(),
    approvalVotes: [
      { id: 'v2', decision: 'APPROVE', votedByUserId: 'admin-1' },
      { id: 'v3', decision: 'APPROVE', votedByUserId: 'admin-2' },
    ],
  },
];

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const isDemoAdmin = cookieStore.get('sbmi_demo_admin')?.value === '1';

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || 'ACTIVE';
  const type = searchParams.get('type');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');

  if (isDemoAdmin) {
    let filtered = DEMO_NOTIFICATIONS.filter(n => n.status === status);
    if (type) filtered = filtered.filter(n => n.notificationType === type);
    return NextResponse.json({ notifications: filtered, pagination: { page: 1, limit, total: filtered.length, pages: 1 } });
  }

  const user = await getSession();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = { status };
    if (type) where.notificationType = type;

    const [notifications, total] = await Promise.all([
      prisma.governanceNotification.findMany({
        where,
        include: { approvalVotes: true, supportRequest: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.governanceNotification.count({ where }),
    ]);

    return NextResponse.json({ notifications, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    // Fallback to demo data on DB error
    let filtered = DEMO_NOTIFICATIONS.filter(n => n.status === status);
    if (type) filtered = filtered.filter(n => n.notificationType === type);
    return NextResponse.json({ notifications: filtered, pagination: { page: 1, limit, total: filtered.length, pages: 1 } });
  }
}
