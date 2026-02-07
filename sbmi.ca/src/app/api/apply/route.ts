import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { full_name, email, phone, household_size, message } = body;

    if (!full_name || !email || !phone) {
      return NextResponse.json(
        { error: "full_name, email, and phone are required" },
        { status: 400 }
      );
    }

    await prisma.application.create({
      data: {
        fullName: String(full_name).trim(),
        email: String(email).trim().toLowerCase(),
        phone: String(phone).trim(),
        householdSize: household_size ? String(household_size).trim() : null,
        message: message ? String(message).trim() : null,
        status: "PENDING",
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}
