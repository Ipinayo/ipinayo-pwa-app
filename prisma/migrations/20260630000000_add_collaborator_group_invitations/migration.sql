-- Pending email invites to a collaborator group. Converted to a member row once
-- the invited email authenticates. Additive only — no data backfill needed.

-- CreateTable
CREATE TABLE "CollaboratorGroupInvitation" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "CollaboratorRole" NOT NULL DEFAULT 'VIEWER',
    "invitedById" TEXT,
    "acceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CollaboratorGroupInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CollaboratorGroupInvitation_email_idx" ON "CollaboratorGroupInvitation"("email");

-- CreateIndex
CREATE INDEX "CollaboratorGroupInvitation_groupId_idx" ON "CollaboratorGroupInvitation"("groupId");

-- CreateIndex
CREATE UNIQUE INDEX "CollaboratorGroupInvitation_groupId_email_key" ON "CollaboratorGroupInvitation"("groupId", "email");

-- AddForeignKey
ALTER TABLE "CollaboratorGroupInvitation" ADD CONSTRAINT "CollaboratorGroupInvitation_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "CollaboratorGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollaboratorGroupInvitation" ADD CONSTRAINT "CollaboratorGroupInvitation_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
