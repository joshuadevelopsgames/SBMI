import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession()
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  try {
    const body = await req.json()
    const { status } = body

    if (!['ACTIVE', 'INACTIVE', 'SUSPENDED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status.' }, { status: 400 })
    }

    await prisma.user.update({
      where: { id },
      data: { status },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[PATCH /api/admin/members/:id/status]', error)
    return NextResponse.json({ error: 'An error occurred.' }, { status: 500 })
  }
}
