import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendApplicationApprovedEmail, sendApplicationRejectedEmail } from '@/lib/email'
import { generateToken } from '@/lib/auth'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession()
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  try {
    const body = await req.json()
    const { status, notes } = body

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status.' }, { status: 400 })
    }

    const application = await prisma.application.findUnique({ where: { id } })
    if (!application) return NextResponse.json({ error: 'Application not found.' }, { status: 404 })
    if (application.status !== 'PENDING') {
      return NextResponse.json({ error: 'Application has already been reviewed.' }, { status: 400 })
    }

    await prisma.application.update({
      where: { id },
      data: { status, notes: notes || null },
    })

    if (status === 'APPROVED') {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({ where: { email: application.email } })
      if (!existingUser) {
        // Create member account with temporary password
        const tempPassword = generateToken().slice(0, 12)
        const passwordHash = await bcrypt.hash(tempPassword, 12)

        const newUser = await prisma.user.create({
          data: {
            email: application.email,
            firstName: application.firstName,
            lastName: application.lastName,
            passwordHash,
            role: 'MEMBER',
            status: 'ACTIVE',
            membershipStartDate: new Date(),
          },
        })

        // Create initial member balance
        await prisma.memberBalance.create({
          data: {
            userId: newUser.id,
            recurringActive: false,
          },
        })

        await sendApplicationApprovedEmail(application.email, application.firstName, tempPassword)
      } else {
        await sendApplicationApprovedEmail(application.email, application.firstName, null)
      }
    } else {
      await sendApplicationRejectedEmail(application.email, application.firstName, notes)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[PATCH /api/admin/applications/:id]', error)
    return NextResponse.json({ error: 'An error occurred.' }, { status: 500 })
  }
}
