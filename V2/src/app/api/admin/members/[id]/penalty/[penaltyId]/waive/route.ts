import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; penaltyId: string }> }
) {
  const user = await getSession()
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, penaltyId } = await params

  try {
    const penalty = await prisma.penalty.findFirst({
      where: { id: penaltyId, userId: id },
    })
    if (!penalty) return NextResponse.json({ error: 'Penalty not found.' }, { status: 404 })

    await prisma.penalty.update({
      where: { id: penaltyId },
      data: { paidAt: new Date(), notes: `Waived by admin ${user.firstName} ${user.lastName}` },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[POST /api/admin/members/:id/penalty/:penaltyId/waive]', error)
    return NextResponse.json({ error: 'An error occurred.' }, { status: 500 })
  }
}
