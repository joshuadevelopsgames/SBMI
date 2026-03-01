import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { firstName, lastName, email, phone, address, city, province, postalCode, message } = body

    // Basic validation
    if (!firstName || !lastName || !email || !phone || !address || !city || !province || !postalCode) {
      return NextResponse.json({ error: 'All required fields must be provided.' }, { status: 400 })
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 })
    }

    const application = await prisma.application.create({
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        address: address.trim(),
        city: city.trim(),
        province: province.trim(),
        postalCode: postalCode.trim().toUpperCase(),
        message: message?.trim() || null,
        status: 'PENDING',
      },
    })

    // Create a governance notification for this application
    await prisma.governanceNotification.create({
      data: {
        notificationType: 'APPLICATION_PENDING',
        status: 'ACTIVE',
        relatedEntityId: application.id,
        relatedEntityType: 'APPLICATION',
      },
    })

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/applications]', error)
    return NextResponse.json({ error: 'An error occurred. Please try again.' }, { status: 500 })
  }
}

export async function GET() {
  // Admin only — protected in admin routes
  return NextResponse.json({ error: 'Use admin API' }, { status: 403 })
}
