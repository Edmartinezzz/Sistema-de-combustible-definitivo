-- Create system configuration table
CREATE TABLE IF NOT EXISTS config_sistema (
    clave TEXT PRIMARY KEY,
    valor TEXT NOT NULL,
    ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial BCV rate (fallback value)
INSERT INTO config_sistema (clave, valor) VALUES ('tasa_bcv', '36.50') ON CONFLICT (clave) DO NOTHING;

-- Add columns to guias_movilizacion to support currency conversion and history
ALTER TABLE guias_movilizacion ADD COLUMN IF NOT EXISTS monto_usd NUMERIC(12, 2);
ALTER TABLE guias_movilizacion ADD COLUMN IF NOT EXISTS tasa_bcv NUMERIC(12, 4);

-- Update existing records: assume previous monto_pagar was in Bs. and tasa was 1.0 if not known, 
-- but actually let's just keep them as is for now.
