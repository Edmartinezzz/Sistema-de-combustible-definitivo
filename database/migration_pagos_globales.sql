-- Migración para permitir pagos globales (sin guía específica inicial)
ALTER TABLE pagos ALTER COLUMN guia_id DROP NOT NULL;

-- Agregar comentario para claridad
COMMENT ON COLUMN pagos.guia_id IS 'ID de la guía asociada. Puede ser NULL para pagos globales de deuda total.';
