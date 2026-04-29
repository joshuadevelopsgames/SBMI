import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const user = await getSession()
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const requests = await prisma.familyMemberRequest.findMany({
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
        familyMember: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(requests, { status: 200 })
  } catch (error) {
    console.error('[GET /api/admin/family-requests]', error)
    return NextResponse.json({ error: 'An error occurred.' }, { status: 500 })
  }
}
