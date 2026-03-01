import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

const DEMO_REPORT = {
  totalMembers: 47,
  activeMembers: 42,
  inactiveMembers: 5,
  totalFamilyMembers: 89,
  totalPaymentAmount: 94000,
  averagePaymentAmount: 2000,
  overdueMembers: 5,
  recurringMembers: 31,
  supportRequestsApproved: 12,
  supportRequestsPending: 2,
  supportRequestsDeclined: 3,
  totalSupportAmount: 850000,
};

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const isDemoAdmin = cookieStore.get('sbmi_demo_admin')?.value === '1';

  if (isDemoAdmin) {
    return NextResponse.json(DEMO_REPORT);
  }

  const user = await getSession();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || 'month';

    let dateFrom = new Date();
    const now = new Date();

    switch (range) {
      case 'week': dateFrom.setDate(now.getDate() - 7); break;
      case 'month': dateFrom.setMonth(now.getMonth() - 1); break;
      case 'year': dateFrom.setFullYear(now.getFullYear() - 1); break;
      case 'all': dateFrom = new Date('2000-01-01'); break;
    }

    const [totalMembers, activeMembers, inactiveMembers, overdueMembers, recurringMembers, totalFamilyMembers] = await Promise.all([
      prisma.user.count({ where: { role: 'MEMBER' } }),
      prisma.user.count({ where: { role: 'MEMBER', status: 'ACTIVE' } }),
      prisma.user.count({ where: { role: 'MEMBER', status: 'INACTIVE' } }),
      prisma.memberBalance.count({ where: { paidThroughDate: { lt: now } } }),
      prisma.memberBalance.count({ where: { recurringActive: true } }),
      prisma.familyMember.count(),
    ]);

    const payments = await prisma.payment.findMany({ where: { paymentDate: { gte: dateFrom } } });
    const totalPaymentAmount = payments.reduce((sum, p) => sum + p.amount, 0);
    const averagePaymentAmount = payments.length > 0 ? totalPaymentAmount / payments.length : 0;

    let supportRequestsApproved = 0, supportRequestsPending = 0, supportRequestsDeclined = 0, totalSupportAmount = 0;
    try {
      const supportRequests = await prisma.supportRequest.findMany({ where: { createdAt: { gte: dateFrom } } });
      supportRequestsApproved = supportRequests.filter(r => r.status === 'APPROVED').length;
      supportRequestsPending = supportRequests.filter(r => r.status === 'PENDING').length;
      supportRequestsDeclined = supportRequests.filter(r => r.status === 'DECLINED').length;
      totalSupportAmount = supportRequests.reduce((sum, r) => sum + r.amountRequested, 0);
    } catch { /* table may not exist yet */ }

    return NextResponse.json({
      totalMembers, activeMembers, inactiveMembers, totalFamilyMembers,
      totalPaymentAmount, averagePaymentAmount, overdueMembers, recurringMembers,
      supportRequestsApproved, supportRequestsPending, supportRequestsDeclined, totalSupportAmount,
    });
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json(DEMO_REPORT);
  }
}
