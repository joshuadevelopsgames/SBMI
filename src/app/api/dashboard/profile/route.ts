import { NextResponse } from "next/server";

/** SOW US55: profile name changes are NOT instant; they go through Executive Committee approval.
 * The legacy PATCH path is intentionally disabled. Use POST /api/dashboard/profile/request-name-change instead.
 */
export async function PATCH() {
  return NextResponse.json(
    { error: "Name changes require Executive Committee approval. Submit via the Request change action." },
    { status: 405 }
  );
}
