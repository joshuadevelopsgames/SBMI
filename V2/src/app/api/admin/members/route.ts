import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth || auth.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'ACTIVE';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const skip = (page - 1) * limit;

    const where: any = { role: 'MEMBER' };
    if (status !== 'ALL') {
      where.status = status;
    }

    const [members, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          memberBalance: true,
          familyMembers: true,
          payments: { take: 1, orderBy: { paymentDate: 'desc' } },
        },
        orderBy: { lastName: 'asc' },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    const membersWithStatus = members.map(m => {
      const balance = m.memberBalance;
      const isOverdue = !balance?.paidThroughDate || balance.paidThroughDate < new Date();
      return {
        id: m.id,
        email: m.email,
        fullName: `${m.firstName} ${m.lastName}`,
        status: m.status,
        membershipStatus: isOverdue ? 'OVERDUE' : 'CURRENT',
        joinedAt: m.membershipStartDate?.toISOString() || new Date().toISOString(),
        lastActive: m.lastActive?.toISOString(),
        familyCount: m.familyMembers.length,
        paidThroughDate: balance?.paidThroughDate?.toISOString(),
        recurringActive: balance?.recurringActive || false,
      };
    });

    return NextResponse.json({
      members: membersWithStatus,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching members:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
