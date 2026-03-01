import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  try {
    const existing = await prisma.familyMember.findFirst({
      where: { id, userId: user.id },
    })
    if (!existing) return NextResponse.json({ error: 'Not found.' }, { status: 404 })

    const body = await req.json()
    const { fullName, birthDate } = body

    if (!fullName?.trim()) {
      return NextResponse.json({ error: 'Full name is required.' }, { status: 400 })
    }
    if (!birthDate) {
      return NextResponse.json({ error: 'Date of birth is required.' }, { status: 400 })
    }

    const birth = new Date(birthDate)
    if (isNaN(birth.getTime()) || birth > new Date()) {
      return NextResponse.json({ error: 'Invalid date of birth.' }, { status: 400 })
    }

    const updated = await prisma.familyMember.update({
      where: { id },
      data: { fullName: fullName.trim(), birthDate: birth },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('[PATCH /api/family/:id]', error)
    return NextResponse.json({ error: 'An error occurred.' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  try {
    const existing = await prisma.familyMember.findFirst({
      where: { id, userId: user.id },
    })
    if (!existing) return NextResponse.json({ error: 'Not found.' }, { status: 404 })

    // Create a removal request instead of directly deleting
    const request = await prisma.familyMemberRequest.create({
      data: {
        userId: user.id,
        familyMemberId: id,
        requestType: 'REMOVE',
        status: 'PENDING',
      },
    })

    return NextResponse.json(
      { 
        message: 'Family member removal request submitted for admin approval.',
        request 
      }
    )
  } catch (error) {
    console.error('[DELETE /api/family/:id]', error)
    return NextResponse.json({ error: 'An error occurred.' }, { status: 500 })
  }
}
