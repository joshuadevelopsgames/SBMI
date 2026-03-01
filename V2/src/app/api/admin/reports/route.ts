import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getSession();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || 'month';

    let dateFrom = new Date();
    const now = new Date();

    switch (range) {
      case 'week':
        dateFrom.setDate(now.getDate() - 7);
        break;
      case 'month':
        dateFrom.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        dateFrom.setFullYear(now.getFullYear() - 1);
        break;
      case 'all':
        dateFrom = new Date('2000-01-01');
        break;
    }

    // Get member statistics
    const [
      totalMembers,
      activeMembers,
      inactiveMembers,
      overdueMembers,
      recurringMembers,
      totalFamilyMembers,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'MEMBER' } }),
      prisma.user.count({ where: { role: 'MEMBER', status: 'ACTIVE' } }),
      prisma.user.count({ where: { role: 'MEMBER', status: 'INACTIVE' } }),
      prisma.memberBalance.count({
        where: {
          paidThroughDate: { lt: now },
        },
      }),
      prisma.memberBalance.count({
        where: {
          recurringActive: true,
        },
      }),
      prisma.familyMember.count(),
    ]);

    // Get payment statistics
    const payments = await prisma.payment.findMany({
      where: {
        paymentDate: { gte: dateFrom },
      },
    });

    const totalPaymentAmount = payments.reduce((sum, p) => sum + p.amount, 0);
    const averagePaymentAmount = payments.length > 0 ? totalPaymentAmount / payments.length : 0;

    // Get support request statistics
    const supportRequests = await prisma.supportRequest.findMany({
      where: {
        createdAt: { gte: dateFrom },
      },
    });

    const supportRequestsApproved = supportRequests.filter(r => r.status === 'APPROVED').length;
    const supportRequestsPending = supportRequests.filter(r => r.status === 'PENDING').length;
    const supportRequestsDeclined = supportRequests.filter(r => r.status === 'DECLINED').length;
    const totalSupportAmount = supportRequests.reduce((sum, r) => sum + r.amountRequested, 0);

    return NextResponse.json({
      totalMembers,
      activeMembers,
      inactiveMembers,
      totalFamilyMembers,
      totalPaymentAmount,
      averagePaymentAmount,
      overdueMembers,
      recurringMembers,
      supportRequestsApproved,
      supportRequestsPending,
      supportRequestsDeclined,
      totalSupportAmount,
    });
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
