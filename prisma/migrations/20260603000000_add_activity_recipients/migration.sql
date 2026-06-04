-- CreateTable
CREATE TABLE "ActivityRecipient" (
    "id" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "entityId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityRecipient_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ActivityRecipient_userId_idx" ON "ActivityRecipient"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ActivityRecipient_activityId_userId_key" ON "ActivityRecipient"("activityId", "userId");

-- AddForeignKey
ALTER TABLE "ActivityRecipient" ADD CONSTRAINT "ActivityRecipient_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityRecipient" ADD CONSTRAINT "ActivityRecipient_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- DropTable (old M2M join table, replaced by ActivityRecipient)
DROP TABLE "_ActivityTargets";
