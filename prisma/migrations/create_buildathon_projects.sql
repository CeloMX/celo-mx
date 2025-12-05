-- SQL para crear la tabla BuildathonProject en Supabase
-- Ejecuta este SQL en Supabase Dashboard -> SQL Editor

CREATE TABLE IF NOT EXISTS "BuildathonProject" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "teamName" TEXT NOT NULL,
    "teamMembers" TEXT NOT NULL,
    "githubRepo" TEXT,
    "karmaGapLink" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Crear función para actualizar updatedAt automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear trigger para actualizar updatedAt
CREATE TRIGGER update_buildathon_project_updated_at
    BEFORE UPDATE ON "BuildathonProject"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

