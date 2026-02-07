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

  const hash = await bcrypt.hash("admin123", 10);
  const adminEmailHash = hashEmail("admin@sbmi.ca");
  await prisma.user.upsert({
    where: { emailHash: adminEmailHash },
    update: { email: "admin@sbmi.ca" },
    create: {
      email: "admin@sbmi.ca",
      emailHash: adminEmailHash,
      passwordHash: hash,
      roleId: adminRole.id,
    },
  });

  console.log("Seeded roles and admin@sbmi.ca / admin123");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
