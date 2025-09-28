/*
  Warnings:

  - The `keySignature` column on the `MassPart` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `season` on the `MassSelection` table. All the data in the column will be lost.
  - You are about to drop the column `templateType` on the `MassSelection` table. All the data in the column will be lost.
  - The `themes` column on the `MassSelection` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `songTitle` to the `MassPart` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."KeySignature" AS ENUM ('C_MAJOR', 'G_MAJOR', 'D_MAJOR', 'A_MAJOR', 'E_MAJOR', 'B_MAJOR', 'F_SHARP_MAJOR', 'C_SHARP_MAJOR', 'A_FLAT_MAJOR', 'E_FLAT_MAJOR', 'B_FLAT_MAJOR', 'F_MAJOR', 'C_MINOR', 'G_MINOR', 'D_MINOR', 'A_MINOR', 'E_MINOR', 'B_MINOR', 'F_SHARP_MINOR', 'C_SHARP_MINOR', 'A_FLAT_MINOR', 'E_FLAT_MINOR', 'B_FLAT_MINOR', 'F_MINOR');

-- AlterTable
ALTER TABLE "public"."MassPart" ADD COLUMN     "songTitle" TEXT NOT NULL,
DROP COLUMN "keySignature",
ADD COLUMN     "keySignature" "public"."KeySignature";

-- AlterTable
ALTER TABLE "public"."MassSelection" DROP COLUMN "season",
DROP COLUMN "templateType",
ADD COLUMN     "liturgicalSeason" TEXT,
DROP COLUMN "themes",
ADD COLUMN     "themes" TEXT[];
