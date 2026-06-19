-- CreateEnum
CREATE TYPE "CollaboratorRole" AS ENUM ('OWNER', 'EDITOR', 'COMMENTER', 'VIEWER');

-- CreateTable
CREATE TABLE "SelectionCollaborator" (
    "id" TEXT NOT NULL,
    "selectionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "CollaboratorRole" NOT NULL DEFAULT 'VIEWER',
    "invitedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SelectionCollaborator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DraftCollaborator" (
    "id" TEXT NOT NULL,
    "draftId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "CollaboratorRole" NOT NULL DEFAULT 'VIEWER',
    "invitedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DraftCollaborator_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SelectionCollaborator_selectionId_idx" ON "SelectionCollaborator"("selectionId");

-- CreateIndex
CREATE INDEX "SelectionCollaborator_userId_idx" ON "SelectionCollaborator"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SelectionCollaborator_selectionId_userId_key" ON "SelectionCollaborator"("selectionId", "userId");

-- CreateIndex
CREATE INDEX "DraftCollaborator_draftId_idx" ON "DraftCollaborator"("draftId");

-- CreateIndex
CREATE INDEX "DraftCollaborator_userId_idx" ON "DraftCollaborator"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DraftCollaborator_draftId_userId_key" ON "DraftCollaborator"("draftId", "userId");

-- AddForeignKey
ALTER TABLE "SelectionCollaborator" ADD CONSTRAINT "SelectionCollaborator_selectionId_fkey" FOREIGN KEY ("selectionId") REFERENCES "MassSelection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SelectionCollaborator" ADD CONSTRAINT "SelectionCollaborator_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DraftCollaborator" ADD CONSTRAINT "DraftCollaborator_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES "MassSelectionDraft"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DraftCollaborator" ADD CONSTRAINT "DraftCollaborator_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

