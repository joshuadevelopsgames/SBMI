import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await verifyAuth(request);
    if (!auth || auth.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { decision } = await request.json();
    if (!['APPROVE', 'REJECT'].includes(decision)) {
      return NextResponse.json({ error: 'Invalid decision' }, { status: 400 });
    }

    const notification = await prisma.governanceNotification.findUnique({
      where: { id: params.id },
      include: { approvalVotes: true },
    });

    if (!notification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    if (notification.status === 'RESOLVED') {
      return NextResponse.json({ error: 'Notification already resolved' }, { status: 400 });
    }

    // Check if user already voted
    const existingVote = notification.approvalVotes.find(v => v.votedByUserId === auth.user.id);
    if (existingVote) {
      return NextResponse.json({ error: 'You have already voted on this notification' }, { status: 400 });
    }

    // Create the vote
    await prisma.governanceApprovalVote.create({
      data: {
        notificationId: params.id,
        votedByUserId: auth.user.id,
        decision,
      },
    });

    // Check if thresholds are met
    const config = await prisma.appConfig.findFirst();
    const updatedNotification = await prisma.governanceNotification.findUnique({
      where: { id: params.id },
      include: { approvalVotes: true },
    });

    if (!updatedNotification || !config) {
      return NextResponse.json({ error: 'Error processing vote' }, { status: 500 });
    }

    const approveCount = updatedNotification.approvalVotes.filter(v => v.decision === 'APPROVE').length;
    const rejectCount = updatedNotification.approvalVotes.filter(v => v.decision === 'REJECT').length;

    let shouldResolve = false;
    let outcome = '';

    if (notification.notificationType === 'ASSISTANCE_REQUEST') {
      if (approveCount >= config.assistanceApprovalThreshold) {
        shouldResolve = true;
        outcome = 'Approved';
      } else if (rejectCount >= config.assistanceRejectionThreshold) {
        shouldResolve = true;
        outcome = 'Declined';
      }
    } else if (notification.notificationType === 'SUPPORT_REQUEST') {
      if (approveCount >= config.supportRequestApprovalThreshold) {
        shouldResolve = true;
        outcome = 'Approved';
      } else if (rejectCount >= config.supportRequestRejectionThreshold) {
        shouldResolve = true;
        outcome = 'Declined';
      }
    }

    if (shouldResolve) {
      await prisma.governanceNotification.update({
        where: { id: params.id },
        data: {
          status: 'RESOLVED',
          resolvedAt: new Date(),
          outcome,
        },
      });
    }

    return NextResponse.json({ success: true, resolved: shouldResolve, outcome });
  } catch (error) {
    console.error('Error voting on notification:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
