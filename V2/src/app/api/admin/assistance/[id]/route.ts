import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession()
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  try {
    const body = await req.json()
    const { status, adminNotes } = body

    if (!['REVIEWED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status.' }, { status: 400 })
    }

    const request = await prisma.assistanceRequest.findUnique({ where: { id } })
    if (!request) return NextResponse.json({ error: 'Request not found.' }, { status: 404 })

    await prisma.assistanceRequest.update({
      where: { id },
      data: { status, adminNotes: adminNotes || null },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[PATCH /api/admin/assistance/:id]', error)
    return NextResponse.json({ error: 'An error occurred.' }, { status: 500 })
  }
}
