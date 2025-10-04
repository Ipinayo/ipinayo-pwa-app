/*
  Warnings:

  - You are about to drop the column `themes` on the `MassSelection` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."MassSelection" DROP COLUMN "themes";

-- CreateTable
CREATE TABLE "public"."Theme" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Theme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_MassSelectionToTheme" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_MassSelectionToTheme_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_MassSelectionToTheme_B_index" ON "public"."_MassSelectionToTheme"("B");

-- AddForeignKey
ALTER TABLE "public"."_MassSelectionToTheme" ADD CONSTRAINT "_MassSelectionToTheme_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."MassSelection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_MassSelectionToTheme" ADD CONSTRAINT "_MassSelectionToTheme_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Theme"("id") ON DELETE CASCADE ON UPDATE CASCADE;
