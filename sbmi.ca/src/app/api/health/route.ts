import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/** Health check for AWS load balancer / App Runner. Verifies DB connectivity. */
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "ok" });
  } catch {
    return NextResponse.json({ status: "error" }, { status: 503 });
  }
}
