import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
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

    // Block adding family members who are already 25 or older (US26)
    const today = new Date()
    const ageMs = today.getTime() - birth.getTime()
    const ageYears = ageMs / (1000 * 60 * 60 * 24 * 365.25)
    if (ageYears >= 25) {
      return NextResponse.json(
        { error: 'Family members who are 25 years of age or older cannot be added. Coverage is available for spouses and dependent children under 25.' },
        { status: 400 }
      )
    }

    // Create a request instead of directly adding the family member
    const request = await prisma.familyMemberRequest.create({
      data: {
        userId: user.id,
        requestType: 'ADD',
        fullName: fullName.trim(),
        birthDate: birth,
        status: 'PENDING',
      },
    })

    // Create a governance notification for this family change request
    await prisma.governanceNotification.create({
      data: {
        notificationType: 'FAMILY_CHANGE_REQUEST',
        status: 'ACTIVE',
        relatedEntityId: request.id,
        relatedEntityType: 'FAMILY_CHANGE',
        createdBy: user.id,
      },
    })

    return NextResponse.json(
      { 
        message: 'Family member request submitted for admin approval.',
        request 
      }, 
      { status: 201 }
    )
  } catch (error) {
    console.error('[POST /api/family]', error)
    return NextResponse.json({ error: 'An error occurred.' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const requests = await prisma.familyMemberRequest.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(requests, { status: 200 })
  } catch (error) {
    console.error('[GET /api/family]', error)
    return NextResponse.json({ error: 'An error occurred.' }, { status: 500 })
  }
}
