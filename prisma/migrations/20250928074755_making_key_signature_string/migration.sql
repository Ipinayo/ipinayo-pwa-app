/*
  Warnings:

  - The `keySignature` column on the `MassPart` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "public"."MassPart" DROP COLUMN "keySignature",
ADD COLUMN     "keySignature" TEXT;

-- DropEnum
DROP TYPE "public"."KeySignature";
