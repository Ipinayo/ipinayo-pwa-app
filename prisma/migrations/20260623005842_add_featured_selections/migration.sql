-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'FEATURED_AUTHOR';

-- AlterTable
ALTER TABLE "MassSelection" ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "MassSelection_isFeatured_idx" ON "MassSelection"("isFeatured");
