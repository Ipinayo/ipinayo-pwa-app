/*
  Warnings:

  - The `keySignature` column on the `MassPart` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "public"."keySignature" AS ENUM ('C_MAJOR', 'G_MAJOR', 'D_MAJOR', 'A_MAJOR', 'E_MAJOR', 'B_MAJOR', 'F_SHARP_MAJOR', 'C_SHARP_MAJOR', 'A_FLAT_MAJOR', 'E_FLAT_MAJOR', 'B_FLAT_MAJOR', 'F_MAJOR', 'C_MINOR', 'G_MINOR', 'D_MINOR', 'A_MINOR', 'E_MINOR', 'B_MINOR', 'F_SHARP_MINOR', 'C_SHARP_MINOR', 'A_FLAT_MINOR', 'E_FLAT_MINOR', 'B_FLAT_MINOR', 'F_MINOR');

-- AlterTable
ALTER TABLE "public"."MassPart" DROP COLUMN "keySignature",
ADD COLUMN     "keySignature" "public"."keySignature";
