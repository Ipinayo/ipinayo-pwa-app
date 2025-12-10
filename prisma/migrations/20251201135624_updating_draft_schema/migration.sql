/*
  Warnings:

  - You are about to drop the column `massSelectionDraftId` on the `Theme` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."MassSelectionDraft" DROP CONSTRAINT "MassSelectionDraft_parishLocationId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Theme" DROP CONSTRAINT "Theme_massSelectionDraftId_fkey";

-- AlterTable
ALTER TABLE "MassSelectionDraft" ADD COLUMN     "parishLocation" JSONB,
ADD COLUMN     "themes" TEXT[];

-- AlterTable
ALTER TABLE "Theme" DROP COLUMN "massSelectionDraftId";
