-- AlterTable Application: US4 address + proposed category
ALTER TABLE "Application" ADD COLUMN IF NOT EXISTS "address" TEXT;
ALTER TABLE "Application" ADD COLUMN IF NOT EXISTS "proposedCategory" TEXT;

-- AlterTable Member: post-approval category + PENDING_REGISTRATION status support
ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "membershipCategoryCode" TEXT;
