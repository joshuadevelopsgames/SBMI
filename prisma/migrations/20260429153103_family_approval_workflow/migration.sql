-- AlterTable
ALTER TABLE "FamilyMember" ADD COLUMN     "decidedAt" TIMESTAMP(3),
ADD COLUMN     "decidedById" TEXT,
ADD COLUMN     "maritalStatus" TEXT NOT NULL DEFAULT 'UNMARRIED',
ADD COLUMN     "pendingBirthDate" TIMESTAMP(3),
ADD COLUMN     "pendingDeletion" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pendingFullName" TEXT,
ADD COLUMN     "pendingMaritalStatus" TEXT,
ADD COLUMN     "pendingRelationship" TEXT,
ADD COLUMN     "rejectionReason" TEXT,
ADD COLUMN     "relationship" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'PENDING_APPROVAL';

-- Backfill: existing FamilyMember rows pre-date the approval workflow; treat them as already approved
UPDATE "FamilyMember" SET "status" = 'APPROVED', "decidedAt" = "createdAt" WHERE "status" = 'PENDING_APPROVAL';

-- AlterTable
ALTER TABLE "Member" ALTER COLUMN "joinedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "cardBrand" TEXT,
ADD COLUMN     "cardLast4" TEXT,
ADD COLUMN     "method" TEXT NOT NULL DEFAULT 'CARD';

-- CreateTable
CREATE TABLE "ProfileChangeRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fieldName" TEXT NOT NULL,
    "oldValue" TEXT NOT NULL,
    "newValue" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "decidedAt" TIMESTAMP(3),
    "decidedById" TEXT,
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProfileChangeRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProfileChangeRequest_userId_idx" ON "ProfileChangeRequest"("userId");

-- CreateIndex
CREATE INDEX "ProfileChangeRequest_status_idx" ON "ProfileChangeRequest"("status");

-- CreateIndex
CREATE INDEX "FamilyMember_status_idx" ON "FamilyMember"("status");

-- AddForeignKey
ALTER TABLE "ProfileChangeRequest" ADD CONSTRAINT "ProfileChangeRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
