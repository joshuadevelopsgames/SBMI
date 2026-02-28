import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest) {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const { firstName, lastName } = body

    if (!firstName?.trim() || !lastName?.trim()) {
      return NextResponse.json({ error: 'First and last name are required.' }, { status: 400 })
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { firstName: firstName.trim(), lastName: lastName.trim() },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[PATCH /api/profile/name]', error)
    return NextResponse.json({ error: 'An error occurred.' }, { status: 500 })
  }
}
