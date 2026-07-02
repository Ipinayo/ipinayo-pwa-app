-- Invitations are now deleted on claim (the membership row is the source of
-- truth), so the accepted-marker column is no longer used.
ALTER TABLE "CollaboratorGroupInvitation" DROP COLUMN "acceptedAt";
