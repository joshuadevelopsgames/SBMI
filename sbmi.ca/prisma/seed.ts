import "dotenv/config";
import { createHash } from "crypto";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

function hashEmail(email: string): string {
  const normalized = String(email).trim().toLowerCase();
  return createHash("sha256").update(normalized).digest("hex");
}

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is required for seed");
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });

async function main() {
  const memberRole = await prisma.role.upsert({
    where: { name: "MEMBER" },
    update: {},
    create: { name: "MEMBER" },
  });
  const adminRole = await prisma.role.upsert({
    where: { name: "ADMIN" },
    update: {},
    create: { name: "ADMIN" },
  });

  const adminHash = await bcrypt.hash("admin123", 10);
  const adminEmailHash = hashEmail("admin@sbmi.ca");
  await prisma.user.upsert({
    where: { emailHash: adminEmailHash },
    update: { email: "admin@sbmi.ca" },
    create: {
      email: "admin@sbmi.ca",
      emailHash: adminEmailHash,
      passwordHash: adminHash,
      roleId: adminRole.id,
    },
  });

  const household = await prisma.household.upsert({
    where: { id: "seed-household-demo" },
    update: {},
    create: {
      id: "seed-household-demo",
      name: "Demo Household",
      city: "Calgary",
    },
  });

  const member = await prisma.member.upsert({
    where: { id: "seed-member-demo" },
    update: {},
    create: {
      id: "seed-member-demo",
      firstName: "Demo",
      lastName: "Member",
      householdId: household.id,
      status: "ACTIVE",
      memberNumber: "DEMO001",
      joinedAt: new Date(),
    },
  });

  const memberHash = await bcrypt.hash("demo123", 10);
  const memberEmailHash = hashEmail("demo@sbmi.ca");
  await prisma.user.upsert({
    where: { emailHash: memberEmailHash },
    update: { email: "demo@sbmi.ca", memberId: member.id },
    create: {
      email: "demo@sbmi.ca",
      emailHash: memberEmailHash,
      passwordHash: memberHash,
      roleId: memberRole.id,
      memberId: member.id,
    },
  });

  console.log("Seeded: admin@sbmi.ca / admin123 (admin), demo@sbmi.ca / demo123 (member)");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
