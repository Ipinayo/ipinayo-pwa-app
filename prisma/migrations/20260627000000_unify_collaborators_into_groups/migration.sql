-- Unify direct collaborators and groups into a single principal.
-- Every selection/draft points to exactly one CollaboratorGroup. Existing
-- per-entity collaborator rows become members of a per-entity ad-hoc group
-- (name = NULL) owned by the entity's creator.

-- CreateTable
CREATE TABLE "CollaboratorGroup" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CollaboratorGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CollaboratorGroupMember" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "CollaboratorRole" NOT NULL DEFAULT 'VIEWER',
    "invitedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CollaboratorGroupMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CollaboratorGroup_ownerId_idx" ON "CollaboratorGroup"("ownerId");

-- CreateIndex
CREATE INDEX "CollaboratorGroupMember_groupId_idx" ON "CollaboratorGroupMember"("groupId");

-- CreateIndex
CREATE INDEX "CollaboratorGroupMember_userId_idx" ON "CollaboratorGroupMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CollaboratorGroupMember_groupId_userId_key" ON "CollaboratorGroupMember"("groupId", "userId");

-- AddForeignKey
ALTER TABLE "CollaboratorGroup" ADD CONSTRAINT "CollaboratorGroup_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollaboratorGroupMember" ADD CONSTRAINT "CollaboratorGroupMember_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "CollaboratorGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollaboratorGroupMember" ADD CONSTRAINT "CollaboratorGroupMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddColumn (nullable first so existing rows can be backfilled)
ALTER TABLE "MassSelection" ADD COLUMN "groupId" TEXT;
ALTER TABLE "MassSelectionDraft" ADD COLUMN "groupId" TEXT;

-- Backfill: one ad-hoc group per selection, owned by its creator
INSERT INTO "CollaboratorGroup" ("id", "name", "ownerId", "createdAt", "updatedAt")
SELECT 'grp_s_' || s."id", NULL, s."createdById", s."createdAt", CURRENT_TIMESTAMP
FROM "MassSelection" s;
UPDATE "MassSelection" s SET "groupId" = 'grp_s_' || s."id";

-- Backfill: one ad-hoc group per draft, owned by its creator
INSERT INTO "CollaboratorGroup" ("id", "name", "ownerId", "createdAt", "updatedAt")
SELECT 'grp_d_' || d."id", NULL, d."createdById", d."createdAt", CURRENT_TIMESTAMP
FROM "MassSelectionDraft" d;
UPDATE "MassSelectionDraft" d SET "groupId" = 'grp_d_' || d."id";

-- Backfill: existing selection collaborators become members of the selection's ad-hoc group
INSERT INTO "CollaboratorGroupMember" ("id", "groupId", "userId", "role", "invitedById", "createdAt", "updatedAt")
SELECT 'mem_s_' || sc."id", 'grp_s_' || sc."selectionId", sc."userId", sc."role", sc."invitedById", sc."createdAt", sc."updatedAt"
FROM "SelectionCollaborator" sc;

-- Backfill: existing draft collaborators become members of the draft's ad-hoc group
INSERT INTO "CollaboratorGroupMember" ("id", "groupId", "userId", "role", "invitedById", "createdAt", "updatedAt")
SELECT 'mem_d_' || dc."id", 'grp_d_' || dc."draftId", dc."userId", dc."role", dc."invitedById", dc."createdAt", dc."updatedAt"
FROM "DraftCollaborator" dc;

-- Enforce NOT NULL now that every entity has a group
ALTER TABLE "MassSelection" ALTER COLUMN "groupId" SET NOT NULL;
ALTER TABLE "MassSelectionDraft" ALTER COLUMN "groupId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "MassSelection_groupId_idx" ON "MassSelection"("groupId");
CREATE INDEX "MassSelectionDraft_groupId_idx" ON "MassSelectionDraft"("groupId");

-- AddForeignKey (NO ACTION)
ALTER TABLE "MassSelection" ADD CONSTRAINT "MassSelection_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "CollaboratorGroup"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
ALTER TABLE "MassSelectionDraft" ADD CONSTRAINT "MassSelectionDraft_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "CollaboratorGroup"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- DropTable (old per-entity collaborator tables, now superseded by groups)
DROP TABLE "SelectionCollaborator";
DROP TABLE "DraftCollaborator";
