/*
  Warnings:

  - The `liturgicalYear` column on the `MassSelection` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `liturgicalSeason` column on the `MassSelection` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "public"."LiturgicalYear" AS ENUM ('A', 'B', 'C');

-- CreateEnum
CREATE TYPE "public"."LiturgicalSeason" AS ENUM ('ADVENT', 'CHRISTMAS', 'ORDINARY_TIME', 'LENT', 'EASTER', 'PENTECOST');

-- AlterTable
ALTER TABLE "public"."MassSelection" DROP COLUMN "liturgicalYear",
ADD COLUMN     "liturgicalYear" "public"."LiturgicalYear",
DROP COLUMN "liturgicalSeason",
ADD COLUMN     "liturgicalSeason" "public"."LiturgicalSeason";
