-- DropIndex
DROP INDEX "ActivityRecipient_activityId_userId_key";

-- CreateIndex
CREATE INDEX "ActivityRecipient_activityId_idx" ON "ActivityRecipient"("activityId");
