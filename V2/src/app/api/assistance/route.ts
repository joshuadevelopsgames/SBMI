import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getAppConfig } from '@/lib/payments'
import { sendAssistanceRequestNotification } from '@/lib/email'

export async function POST(req: NextRequest) {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const { requestType, familyMemberId, otherName, otherPhone, description } = body

    if (!['SELF', 'OTHER'].includes(requestType)) {
      return NextResponse.json({ error: 'Invalid request type.' }, { status: 400 })
    }

    if (!description?.trim()) {
      return NextResponse.json({ error: 'Description is required.' }, { status: 400 })
    }

    if (requestType === 'SELF' && !familyMemberId) {
      return NextResponse.json({ error: 'Family member is required.' }, { status: 400 })
    }

    if (requestType === 'OTHER' && (!otherName?.trim() || !otherPhone?.trim())) {
      return NextResponse.json({ error: 'Name and phone are required for other requests.' }, { status: 400 })
    }

    // Verify family member belongs to user
    if (familyMemberId) {
      const fm = await prisma.familyMember.findFirst({
        where: { id: familyMemberId, userId: user.id },
      })
      if (!fm) return NextResponse.json({ error: 'Invalid family member.' }, { status: 400 })
    }

    const request = await prisma.assistanceRequest.create({
      data: {
        userId: user.id,
        requestType,
        familyMemberId: requestType === 'SELF' ? familyMemberId : null,
        otherName: requestType === 'OTHER' ? otherName.trim() : null,
        otherPhone: requestType === 'OTHER' ? otherPhone.trim() : null,
        description: description.trim(),
      },
      include: { familyMember: true },
    })

    // Send notification to admin
    const config = await getAppConfig()
    await sendAssistanceRequestNotification(config.adminEmail, {
      memberName: `${user.firstName} ${user.lastName}`,
      requestType,
      familyMemberName: request.familyMember?.fullName,
      otherName: request.otherName || undefined,
      otherPhone: request.otherPhone || undefined,
      description: request.description,
    })

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/assistance]', error)
    return NextResponse.json({ error: 'An error occurred.' }, { status: 500 })
  }
}
