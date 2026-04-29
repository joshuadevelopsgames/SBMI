import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getPaymentSummary } from "@/lib/payment-summary";

/** SOW Payments US1: Payment Information Summary for dashboard */
export async function GET() {
  const session = await getSession();
  if (!session?.memberId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const summary = await getPaymentSummary(session.memberId);
  if (!summary) {
    return NextResponse.json({ configRequired: true }, { status: 200 });
  }
  return NextResponse.json(summary);
}
