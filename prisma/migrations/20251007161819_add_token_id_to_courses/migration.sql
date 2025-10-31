-- Recreated locally to match the already-applied production migration.
-- Non-destructive: adds the column only if it does not exist.

ALTER TABLE "Course" ADD COLUMN IF NOT EXISTS "tokenId" TEXT;