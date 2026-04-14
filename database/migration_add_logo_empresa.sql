-- Migración: Agregar logo a empresas
-- Fecha: 2026-01-29

ALTER TABLE empresas ADD COLUMN IF NOT EXISTS logo_url TEXT;

COMMENT ON COLUMN empresas.logo_url IS 'URL relativa del logo de la empresa';
