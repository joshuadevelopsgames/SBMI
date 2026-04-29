import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isMembershipCategoryCode } from "@/lib/membership-categories";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      full_name,
      email,
      phone,
      address,
      household_size,
      proposed_category,
      message,
    } = body;

    if (!full_name || !email || !phone) {
      return NextResponse.json(
        { error: "full_name, email, and phone are required" },
        { status: 400 }
      );
    }

    const addr = typeof address === "string" ? address.trim() : "";
    if (!addr) {
      return NextResponse.json({ error: "address is required" }, { status: 400 });
    }

    const hsize = household_size != null ? String(household_size).trim() : "";
    if (!hsize) {
      return NextResponse.json({ error: "household_size is required" }, { status: 400 });
    }

    const cat =
      typeof proposed_category === "string" ? proposed_category.trim() : "";
    if (!cat || !isMembershipCategoryCode(cat)) {
      return NextResponse.json(
        { error: "proposed_category is required and must be a valid option" },
        { status: 400 }
      );
    }

    await prisma.application.create({
      data: {
        fullName: String(full_name).trim(),
        email: String(email).trim().toLowerCase(),
        phone: String(phone).trim(),
        address: addr,
        householdSize: hsize,
        proposedCategory: cat,
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
