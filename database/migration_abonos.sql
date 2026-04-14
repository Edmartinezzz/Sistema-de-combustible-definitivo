-- Migración para permitir pagos fraccionados (abonos)
ALTER TABLE guias_movilizacion 
ADD COLUMN IF NOT EXISTS monto_pagado DECIMAL(12, 2) DEFAULT 0;

COMMENT ON COLUMN guias_movilizacion.monto_pagado IS 'Monto total ya verificado y abonado a esta guía';
