import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

/** GET: list pending family change items.
 * SOW US87: Add/Edit/Delete requests appear as Active workflow items for Executive Committee users.
 */
export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const rows = await prisma.familyMember.findMany({
    where: {
      OR: [
        { status: "PENDING_APPROVAL" },
        { pendingDeletion: true },
        { pendingFullName: { not: null } },
        { pendingBirthDate: { not: null } },
        { pendingRelationship: { not: null } },
        { pendingMaritalStatus: { not: null } },
      ],
    },
    include: {
      member: {
        select: { id: true, firstName: true, lastName: true, memberNumber: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  function kind(fm: typeof rows[number]): "ADD" | "EDIT" | "DELETE" {
    if (fm.pendingDeletion) return "DELETE";
    if (fm.status === "PENDING_APPROVAL") return "ADD";
    return "EDIT";
  }

  return NextResponse.json(
    rows.map((fm) => ({
      id: fm.id,
      kind: kind(fm),
      member: fm.member,
      fullName: fm.fullName,
      birthDate: fm.birthDate,
      relationship: fm.relationship,
      maritalStatus: fm.maritalStatus,
      pendingFullName: fm.pendingFullName,
      pendingBirthDate: fm.pendingBirthDate,
      pendingRelationship: fm.pendingRelationship,
      pendingMaritalStatus: fm.pendingMaritalStatus,
      pendingDeletion: fm.pendingDeletion,
      requestedAt: fm.updatedAt,
    }))
  );
}
