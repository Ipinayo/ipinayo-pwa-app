/*
  Warnings:

  - Added the required column `updatedAt` to the `UserProfile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."MassSelection" ADD COLUMN     "choirName" TEXT,
ADD COLUMN     "parishLocationId" TEXT,
ADD COLUMN     "parishName" TEXT;

-- AlterTable
ALTER TABLE "public"."UserProfile" ADD COLUMN     "choirName" TEXT,
ADD COLUMN     "parishLocationId" TEXT,
ADD COLUMN     "parishName" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "public"."Location" (
    "id" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "countryCode" TEXT,
    "state" TEXT NOT NULL DEFAULT '',
    "stateCode" TEXT,
    "city" TEXT NOT NULL DEFAULT '',
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "timezone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Location_country_state_city_key" ON "public"."Location"("country", "state", "city");

-- CreateIndex
CREATE INDEX "MassSelection_parishLocationId_idx" ON "public"."MassSelection"("parishLocationId");

-- AddForeignKey
ALTER TABLE "public"."UserProfile" ADD CONSTRAINT "UserProfile_parishLocationId_fkey" FOREIGN KEY ("parishLocationId") REFERENCES "public"."Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MassSelection" ADD CONSTRAINT "MassSelection_parishLocationId_fkey" FOREIGN KEY ("parishLocationId") REFERENCES "public"."Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;
