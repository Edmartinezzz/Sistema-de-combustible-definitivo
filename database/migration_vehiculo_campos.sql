-- Migración: Agregar campos del vehículo a guias_movilizacion
-- Fecha: 2026-01-26
-- Descripción: Agrega marca, modelo, color y carrocería del vehículo

-- Agregar columnas para datos completos del vehículo
ALTER TABLE guias_movilizacion ADD COLUMN IF NOT EXISTS vehiculo_marca VARCHAR(100);
ALTER TABLE guias_movilizacion ADD COLUMN IF NOT EXISTS vehiculo_modelo VARCHAR(100);
ALTER TABLE guias_movilizacion ADD COLUMN IF NOT EXISTS vehiculo_color VARCHAR(50);
ALTER TABLE guias_movilizacion ADD COLUMN IF NOT EXISTS vehiculo_carroceria VARCHAR(100);

-- Comentarios
COMMENT ON COLUMN guias_movilizacion.vehiculo_marca IS 'Marca del vehículo (Ford, Chevrolet, etc.)';
COMMENT ON COLUMN guias_movilizacion.vehiculo_modelo IS 'Modelo del vehículo';
COMMENT ON COLUMN guias_movilizacion.vehiculo_color IS 'Color del vehículo';
COMMENT ON COLUMN guias_movilizacion.vehiculo_carroceria IS 'Tipo de carrocería (Volteo, Plataforma, etc.)';

SELECT 'Migración de campos de vehículo completada' as mensaje;
