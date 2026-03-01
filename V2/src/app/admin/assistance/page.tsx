import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { getAdminSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AdminAssistanceClient from './AdminAssistanceClient'

type AssistanceRow = {
  id: string; memberName: string; memberEmail: string; requestType: string;
  familyMemberName: string | null; otherName: string | null; otherPhone: string | null;
  description: string; status: string; adminNotes: string | null; createdAt: string;
}

const DEMO_REQUESTS: AssistanceRow[] = [
  {
    id: 'demo-ar-1',
    memberName: 'Dawit Haile',
    memberEmail: 'dawit@example.com',
    requestType: 'MEDICAL',
    familyMemberName: null,
    otherName: null,
    otherPhone: null,
    description: 'Requesting assistance for hospitalization costs following emergency surgery.',
    status: 'PENDING',
    adminNotes: null,
    createdAt: new Date('2026-02-28').toISOString(),
  },
  {
    id: 'demo-ar-2',
    memberName: 'Yonas Alemu',
    memberEmail: 'yonas@example.com',
    requestType: 'FUNERAL',
    familyMemberName: 'Alemu Bekele (Father)',
    otherName: null,
    otherPhone: null,
    description: 'Funeral assistance for the passing of member\'s father.',
    status: 'APPROVED',
    adminNotes: 'Approved by executive committee on Feb 15.',
    createdAt: new Date('2026-02-14').toISOString(),
  },
  {
    id: 'demo-ar-3',
    memberName: 'Biruk Worku',
    memberEmail: 'biruk@example.com',
    requestType: 'EMERGENCY',
    familyMemberName: null,
    otherName: null,
    otherPhone: null,
    description: 'Emergency financial assistance following house fire.',
    status: 'PENDING',
    adminNotes: null,
    createdAt: new Date('2026-02-27').toISOString(),
  },
]

export default async function AdminAssistancePage() {
  const cookieStore = await cookies()
  const isDemoAdmin = cookieStore.get('sbmi_demo_admin')?.value === '1'

  const user = await getAdminSession()
  if (!user || user.role !== 'ADMIN') redirect('/login')

  let requests: AssistanceRow[] = DEMO_REQUESTS

  if (!isDemoAdmin) {
    try {
      const dbRequests = await prisma.assistanceRequest.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { firstName: true, lastName: true, email: true } },
          familyMember: true,
        },
      })
      requests = dbRequests.map((r) => ({
        id: r.id,
        memberName: `${r.user.firstName} ${r.user.lastName}`,
        memberEmail: r.user.email,
        requestType: r.requestType,
        familyMemberName: r.familyMember?.fullName || null,
        otherName: r.otherName || null,
        otherPhone: r.otherPhone || null,
        description: r.description,
        status: r.status,
        adminNotes: r.adminNotes || null,
        createdAt: r.createdAt.toISOString(),
      }))
    } catch {
      // DB unavailable — use demo data
    }
  }

  return <AdminAssistanceClient requests={requests} />
}
