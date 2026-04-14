-- Migración: Añadir campo para control de recargos por mora
ALTER TABLE guias_movilizacion 
ADD COLUMN IF NOT EXISTS recargo_aplicado BOOLEAN DEFAULT false;

-- Comentario para documentación
COMMENT ON COLUMN guias_movilizacion.recargo_aplicado IS 'Indica si ya se aplicó el recargo del 10% por mora de 24h';
