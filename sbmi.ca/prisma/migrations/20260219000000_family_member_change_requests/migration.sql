-- Family member add/remove requests requiring admin approval
CREATE TABLE IF NOT EXISTS "FamilyMemberChangeRequest" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "familyMemberId" TEXT,
    "action" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "fullName" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3) NOT NULL,
    "rejectionReason" TEXT,
    "processedById" TEXT,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FamilyMemberChangeRequest_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "FamilyMemberChangeRequest_memberId_status_idx" ON "FamilyMemberChangeRequest"("memberId", "status");
CREATE INDEX IF NOT EXISTS "FamilyMemberChangeRequest_status_createdAt_idx" ON "FamilyMemberChangeRequest"("status", "createdAt");

ALTER TABLE "FamilyMemberChangeRequest" DROP CONSTRAINT IF EXISTS "FamilyMemberChangeRequest_memberId_fkey";
ALTER TABLE "FamilyMemberChangeRequest"
  ADD CONSTRAINT "FamilyMemberChangeRequest_memberId_fkey"
  FOREIGN KEY ("memberId") REFERENCES "Member"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "FamilyMemberChangeRequest" DROP CONSTRAINT IF EXISTS "FamilyMemberChangeRequest_familyMemberId_fkey";
ALTER TABLE "FamilyMemberChangeRequest"
  ADD CONSTRAINT "FamilyMemberChangeRequest_familyMemberId_fkey"
  FOREIGN KEY ("familyMemberId") REFERENCES "FamilyMember"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
