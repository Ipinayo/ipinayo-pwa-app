-- AlterTable
ALTER TABLE "Theme" ADD COLUMN     "massSelectionDraftId" TEXT;

-- CreateTable
CREATE TABLE "MassSelectionDraft" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "date" DATE,
    "liturgicalYear" "LiturgicalYear",
    "liturgicalSeason" "LiturgicalSeason",
    "liturgy" TEXT,
    "pastoralFocus" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "parishName" TEXT,
    "choirName" TEXT,
    "parishLocationId" TEXT,
    "createdById" TEXT NOT NULL,
    "parts" JSONB NOT NULL DEFAULT '[]',

    CONSTRAINT "MassSelectionDraft_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MassSelectionDraft_createdById_idx" ON "MassSelectionDraft"("createdById");

-- AddForeignKey
ALTER TABLE "Theme" ADD CONSTRAINT "Theme_massSelectionDraftId_fkey" FOREIGN KEY ("massSelectionDraftId") REFERENCES "MassSelectionDraft"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MassSelectionDraft" ADD CONSTRAINT "MassSelectionDraft_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MassSelectionDraft" ADD CONSTRAINT "MassSelectionDraft_parishLocationId_fkey" FOREIGN KEY ("parishLocationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;
