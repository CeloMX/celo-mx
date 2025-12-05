-- CreateTable: BuildathonProject
-- This migration ONLY adds the BuildathonProject table
-- It does NOT modify or delete any existing tables or data

CREATE TABLE IF NOT EXISTS "BuildathonProject" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "teamName" TEXT NOT NULL,
    "teamMembers" TEXT NOT NULL,
    "githubRepo" TEXT,
    "karmaGapLink" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create function for auto-updating updatedAt (if it doesn't exist)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for auto-updating updatedAt
DROP TRIGGER IF EXISTS update_buildathon_project_updated_at ON "BuildathonProject";
CREATE TRIGGER update_buildathon_project_updated_at
    BEFORE UPDATE ON "BuildathonProject"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

