-- Migración para agregar detalles del vehículo a la tabla guias_movilizacion
ALTER TABLE guias_movilizacion 
ADD COLUMN IF NOT EXISTS vehiculo_marca VARCHAR(100),
ADD COLUMN IF NOT EXISTS vehiculo_modelo VARCHAR(100),
ADD COLUMN IF NOT EXISTS vehiculo_color VARCHAR(50),
ADD COLUMN IF NOT EXISTS vehiculo_carroceria VARCHAR(100);

-- Actualizar registros existentes con valores por defecto si es necesario
UPDATE guias_movilizacion SET vehiculo_marca = 'N/A' WHERE vehiculo_marca IS NULL;
UPDATE guias_movilizacion SET vehiculo_modelo = 'N/A' WHERE vehiculo_modelo IS NULL;
UPDATE guias_movilizacion SET vehiculo_color = 'N/A' WHERE vehiculo_color IS NULL;
UPDATE guias_movilizacion SET vehiculo_carroceria = 'N/A' WHERE vehiculo_carroceria IS NULL;
