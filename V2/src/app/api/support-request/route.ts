import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await getSession();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { targetUserId, targetFamilyMemberId, description, supportType, amountRequested } = await request.json();

    if (!targetUserId || !description || !supportType || !amountRequested) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create the support request
    const supportRequest = await prisma.supportRequest.create({
      data: {
        submittedByUserId: user.id,
        targetUserId,
        targetFamilyMemberId: targetFamilyMemberId || undefined,
        description,
        supportType,
        amountRequested: Math.round(Number(amountRequested)),
        status: 'PENDING',
      },
    });

    // Create a governance notification for this support request
    const notification = await prisma.governanceNotification.create({
      data: {
        notificationType: 'SUPPORT_REQUEST',
        status: 'ACTIVE',
        relatedEntityId: supportRequest.id,
        relatedEntityType: 'SUPPORT_REQUEST',
        createdBy: user.id,
        supportRequestId: supportRequest.id,
      },
    });

    return NextResponse.json({
      supportRequest,
      notification,
    });
  } catch (error) {
    console.error('Error creating support request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
