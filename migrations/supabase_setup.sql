-- =============================================
-- SCRIPT DE MIGRACIÓN PARA SUPABASE
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- =============================================

-- 1. Crear tabla sistema_config si no existe
CREATE TABLE IF NOT EXISTS sistema_config (
    id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    retiros_bloqueados BOOLEAN DEFAULT FALSE,
    fecha_ultimo_reset DATE,
    fecha_actualizacion TIMESTAMP DEFAULT NOW()
);

-- 2. Insertar registro inicial si no existe
INSERT INTO sistema_config (id, retiros_bloqueados, fecha_ultimo_reset)
VALUES (1, FALSE, CURRENT_DATE)
ON CONFLICT (id) DO NOTHING;

-- 3. Agregar columna fecha_ultimo_reset si faltara en una tabla existente
ALTER TABLE sistema_config 
ADD COLUMN IF NOT EXISTS fecha_ultimo_reset DATE;

-- 4. Asegurarse de que clientes tiene consumo_gasolina y consumo_gasoil
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS consumo_gasolina REAL DEFAULT 0;
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS consumo_gasoil REAL DEFAULT 0;

-- 5. Asegurarse de que entidades tiene consumo_gasolina y consumo_gasoil
ALTER TABLE entidades ADD COLUMN IF NOT EXISTS consumo_gasolina REAL DEFAULT 0;
ALTER TABLE entidades ADD COLUMN IF NOT EXISTS consumo_gasoil REAL DEFAULT 0;

-- 6. Verificar resultado
SELECT 'sistema_config' as tabla, * FROM sistema_config;
