/*
  Warnings:

  - You are about to drop the column `profileId` on the `MassSelection` table. All the data in the column will be lost.
  - Added the required column `createdById` to the `MassSelection` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."MassSelection" DROP CONSTRAINT "MassSelection_profileId_fkey";

-- DropIndex
DROP INDEX "public"."MassSelection_profileId_idx";

-- AlterTable
ALTER TABLE "public"."MassSelection" DROP COLUMN "profileId",
ADD COLUMN     "createdById" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "MassSelection_createdById_idx" ON "public"."MassSelection"("createdById");

-- AddForeignKey
ALTER TABLE "public"."MassSelection" ADD CONSTRAINT "MassSelection_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
