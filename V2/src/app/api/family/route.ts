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

    const member = await prisma.familyMember.create({
      data: {
        userId: user.id,
        fullName: fullName.trim(),
        birthDate: birth,
      },
    })

    return NextResponse.json(member, { status: 201 })
  } catch (error) {
    console.error('[POST /api/family]', error)
    return NextResponse.json({ error: 'An error occurred.' }, { status: 500 })
  }
}
