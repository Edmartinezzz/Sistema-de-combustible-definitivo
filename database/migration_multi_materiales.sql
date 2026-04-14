-- Migration to add materiales column for multi-material support
-- This will store an array of objects: [{ name, cantidad, unidad }]

-- 1. Add the JSONB column
ALTER TABLE guias_movilizacion ADD COLUMN materiales JSONB;

-- 2. Populate the column with existing data for backward compatibility
UPDATE guias_movilizacion 
SET materiales = jsonb_build_array(
    jsonb_build_object(
        'nombre', tipo_mineral,
        'cantidad', cantidad,
        'unidad', unidad
    )
)
WHERE materiales IS NULL;

-- 3. Add comment
COMMENT ON COLUMN guias_movilizacion.materiales IS 'Lista de materiales en formato JSONB: [{"nombre": "...", "cantidad": 0, "unidad": "..."}]';
