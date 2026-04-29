-- Add receiptUrl to Payment (SOW US5)
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "receiptUrl" TEXT;

-- FamilyMember (SOW Family Management)
CREATE TABLE IF NOT EXISTS "FamilyMember" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FamilyMember_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "FamilyMember_memberId_idx" ON "FamilyMember"("memberId");

ALTER TABLE "FamilyMember" DROP CONSTRAINT IF EXISTS "FamilyMember_memberId_fkey";
ALTER TABLE "FamilyMember" ADD CONSTRAINT "FamilyMember_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
