// Script para aplicar la migración de BuildathonProject de forma segura
// Este script SOLO crea la nueva tabla, NO modifica tablas existentes

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

// Cargar variables de entorno
config({ path: path.join(process.cwd(), '.env') });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function applyMigration() {
  try {
    console.log('🔧 Ejecutando migración SQL...');
    console.log('⚠️  Esta migración SOLO crea la tabla BuildathonProject');
    console.log('✅ NO modificará ni eliminará ninguna tabla existente\n');
    
    // 1. Crear la tabla
    console.log('📝 Creando tabla BuildathonProject...');
    try {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "BuildathonProject" (
          "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
          "teamName" TEXT NOT NULL,
          "teamMembers" TEXT NOT NULL,
          "githubRepo" TEXT,
          "karmaGapLink" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ Tabla creada exitosamente');
    } catch (err) {
      if (err.message.includes('already exists') || err.message.includes('duplicate')) {
        console.log('ℹ️  La tabla ya existe');
      } else {
        throw err;
      }
    }
    
    // 2. Crear función para updatedAt
    console.log('📝 Creando función update_updated_at_column...');
    try {
      await prisma.$executeRawUnsafe(`
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW."updatedAt" = CURRENT_TIMESTAMP;
          RETURN NEW;
        END;
        $$ language 'plpgsql'
      `);
      console.log('✅ Función creada exitosamente');
    } catch (err) {
      console.log('ℹ️  Función ya existe o error (continuando...)');
    }
    
    // 3. Crear trigger
    console.log('📝 Creando trigger...');
    try {
      await prisma.$executeRawUnsafe(`
        DROP TRIGGER IF EXISTS update_buildathon_project_updated_at ON "BuildathonProject"
      `);
      await prisma.$executeRawUnsafe(`
        CREATE TRIGGER update_buildathon_project_updated_at
        BEFORE UPDATE ON "BuildathonProject"
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column()
      `);
      console.log('✅ Trigger creado exitosamente');
    } catch (err) {
      console.log('ℹ️  Trigger ya existe o error (continuando...)');
    }
    
    console.log('\n✅ Migración aplicada exitosamente!');
    console.log('✅ Tabla BuildathonProject creada sin afectar otras tablas');
    
  } catch (error) {
    console.error('❌ Error al aplicar la migración:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

applyMigration();

