import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hashEmail, hashPassword } from "@/lib/auth";

const DEFAULT_TEMP_PASSWORD = "Welcome1";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const {
    firstName,
    lastName,
    phone,
    email,
    createAccount,
    householdName,
    householdAddress,
  } = body;

  if (!firstName?.trim() || !lastName?.trim()) {
    return NextResponse.json(
      { error: "firstName and lastName are required" },
      { status: 400 }
    );
  }

  if (createAccount && !email?.trim()) {
    return NextResponse.json(
      { error: "email required when creating account" },
      { status: 400 }
    );
  }

  const memberRole = await prisma.role.findFirst({
    where: { name: "MEMBER" },
  });
  if (!memberRole) {
    return NextResponse.json(
      { error: "MEMBER role not found" },
      { status: 500 }
    );
  }

  const household = await prisma.household.create({
    data: {
      name: householdName?.trim() || `Household of ${firstName} ${lastName}`,
      address: householdAddress?.trim() || null,
      city: "Calgary",
    },
  });

  const member = await prisma.member.create({
    data: {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone?.trim() || null,
      householdId: household.id,
      status: "ACTIVE",
      paymentSchedule: "MONTHLY",
    },
  });

  if (createAccount && email?.trim()) {
    const emailHash = hashEmail(email.trim());
    const existing = await prisma.user.findUnique({
      where: { emailHash },
    });
    if (existing) {
      await prisma.member.delete({ where: { id: member.id } });
      await prisma.household.delete({ where: { id: household.id } });
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 400 }
      );
    }
    const passwordHash = await hashPassword(DEFAULT_TEMP_PASSWORD);
    await prisma.user.create({
      data: {
        emailHash,
        passwordHash,
        roleId: memberRole.id,
        memberId: member.id,
      },
    });
  }

  await prisma.auditLog.create({
    data: {
      userId: session.userId,
      action: "MEMBER_CREATED",
      entity: "MEMBER",
      entityId: member.id,
      details: JSON.stringify({
        byAdmin: true,
        createAccount: !!createAccount,
      }),
    },
  });

  return NextResponse.json({
    ok: true,
    memberId: member.id,
    ...(createAccount && email && {
      message: `Member and login created. Email: ${email} / ${DEFAULT_TEMP_PASSWORD}`,
    }),
  });
}
