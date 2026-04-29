import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession()
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    const body = await req.json()
    const { status, adminNotes } = body

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status.' }, { status: 400 })
    }

    const request = await prisma.familyMemberRequest.findUnique({
      where: { id },
      include: { user: true },
    })

    if (!request) {
      return NextResponse.json({ error: 'Request not found.' }, { status: 404 })
    }

    if (status === 'APPROVED') {
      if (request.requestType === 'ADD') {
        // Create the family member
        await prisma.familyMember.create({
          data: {
            userId: request.userId,
            fullName: request.fullName!,
            birthDate: request.birthDate!,
          },
        })
      } else if (request.requestType === 'REMOVE') {
        // Delete the family member
        if (request.familyMemberId) {
          await prisma.familyMember.delete({
            where: { id: request.familyMemberId },
          })
        }
      }
    }

    // Update the request status
    const updated = await prisma.familyMemberRequest.update({
      where: { id },
      data: {
        status,
        adminNotes,
      },
    })

    return NextResponse.json(updated, { status: 200 })
  } catch (error) {
    console.error('[PATCH /api/admin/family-requests/:id]', error)
    return NextResponse.json({ error: 'An error occurred.' }, { status: 500 })
  }
}
