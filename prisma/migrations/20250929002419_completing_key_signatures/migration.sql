-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."KeySignature" ADD VALUE 'D_FLAT_MAJOR';
ALTER TYPE "public"."KeySignature" ADD VALUE 'G_FLAT_MAJOR';
ALTER TYPE "public"."KeySignature" ADD VALUE 'C_FLAT_MAJOR';
ALTER TYPE "public"."KeySignature" ADD VALUE 'G_SHARP_MINOR';
ALTER TYPE "public"."KeySignature" ADD VALUE 'D_SHARP_MINOR';
ALTER TYPE "public"."KeySignature" ADD VALUE 'A_SHARP_MINOR';
