import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create AppConfig
  const existingConfig = await prisma.appConfig.findFirst()
  if (!existingConfig) {
    await prisma.appConfig.create({
      data: {
        monthlyContributionCents: parseInt(process.env.MONTHLY_CONTRIBUTION_CENTS || '2000'),
        penaltyAmountCents: parseInt(process.env.PENALTY_AMOUNT_CENTS || '500'),
        bylawsPdfUrl: '/bylaws.pdf',
        adminEmail: process.env.ADMIN_EMAIL || 'admin@sbmi.ca',
      },
    })
    console.log('Created AppConfig')
  }

  // Create demo admin user
  const adminEmail = 'admin@sbmi.ca'
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } })
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash('Admin1234!', 12)
    await prisma.user.create({
      data: {
        email: adminEmail,
        firstName: 'SBMI',
        lastName: 'Administrator',
        role: Role.ADMIN,
        passwordHash,
        membershipStartDate: new Date('2020-01-01'),
      },
    })
    console.log('Created admin user: admin@sbmi.ca / Admin1234!')
  }

  // Create demo member user
  const memberEmail = 'member@sbmi.ca'
  const existingMember = await prisma.user.findUnique({ where: { email: memberEmail } })
  if (!existingMember) {
    const passwordHash = await bcrypt.hash('Member1234!', 12)
    const member = await prisma.user.create({
      data: {
        email: memberEmail,
        firstName: 'Abebe',
        lastName: 'Girma',
        role: Role.MEMBER,
        passwordHash,
        membershipStartDate: new Date('2022-03-15'),
      },
    })

    // Create member balance
    await prisma.memberBalance.create({
      data: {
        userId: member.id,
        paidThroughDate: new Date(new Date().getFullYear(), new Date().getMonth(), 0), // end of last month
        creditCents: 0,
        recurringActive: false,
      },
    })

    // Create a family member
    await prisma.familyMember.create({
      data: {
        userId: member.id,
        fullName: 'Tigist Girma',
        birthDate: new Date('2005-06-20'),
      },
    })

    console.log('Created member user: member@sbmi.ca / Member1234!')
  }

  console.log('Seeding complete.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
