-- Rename the assignable manage-capable role from OWNER to MANAGER.
-- The creator is the implicit owner (no row), so OWNER was never assignable.
ALTER TYPE "CollaboratorRole" RENAME VALUE 'OWNER' TO 'MANAGER';
