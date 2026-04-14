-- Migración: Agregar Usuario Tipo "Empresa Destinataria" y Sistema de Confirmaciones
-- Fecha: 2026-01-26
-- Descripción: Permite a empresas que reciben mineral confirmar llegadas con foto de guía

BEGIN;

-- 1. Modificar constraint de roles en tabla usuarios para incluir 'empresa_destinataria'
ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_role_check;
ALTER TABLE usuarios ADD CONSTRAINT usuarios_role_check 
    CHECK (role IN ('empresa', 'master', 'empresa_destinataria'));

-- 2. Modificar constraint empresa_user_check para permitir empresa_destinataria con empresa_destinataria_id
ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS empresa_user_check;

-- Primero agregamos la columna empresa_destinataria_id
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS empresa_destinataria_id UUID;

-- Nuevo constraint que permite tres escenarios:
-- - master: sin empresa_id ni empresa_destinataria_id
-- - empresa: con empresa_id, sin empresa_destinataria_id
-- - empresa_destinataria: con empresa_destinataria_id, sin empresa_id
ALTER TABLE usuarios ADD CONSTRAINT empresa_user_check CHECK (
    (role = 'master' AND empresa_id IS NULL AND empresa_destinataria_id IS NULL) OR
    (role = 'empresa' AND empresa_id IS NOT NULL AND empresa_destinataria_id IS NULL) OR
    (role = 'empresa_destinataria' AND empresa_destinataria_id IS NOT NULL AND empresa_id IS NULL)
);

-- 3. Crear tabla de Empresas Destinatarias (empresas que reciben el mineral)
CREATE TABLE IF NOT EXISTS empresas_destinatarias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    rif VARCHAR(20) UNIQUE NOT NULL,
    direccion TEXT,
    telefono VARCHAR(20),
    email VARCHAR(100),
    contacto_principal VARCHAR(255),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Agregar foreign key para la nueva columna
ALTER TABLE usuarios 
    ADD CONSTRAINT fk_empresa_destinataria 
    FOREIGN KEY (empresa_destinataria_id) 
    REFERENCES empresas_destinatarias(id) 
    ON DELETE CASCADE;

-- 5. Crear tabla de Confirmaciones de Llegada
CREATE TABLE IF NOT EXISTS confirmaciones_llegada (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guia_id UUID NOT NULL REFERENCES guias_movilizacion(id) ON DELETE RESTRICT,
    empresa_destinataria_id UUID NOT NULL REFERENCES empresas_destinatarias(id) ON DELETE RESTRICT,
    usuario_confirma_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    
    -- Datos del formulario
    hora_llegada TIMESTAMP NOT NULL,
    nombre_empresa_confirmante VARCHAR(255) NOT NULL,
    codigo_guia VARCHAR(100) NOT NULL,
    mineral_recibido VARCHAR(255) NOT NULL,
    
    -- Foto y validación
    foto_guia_url TEXT NOT NULL,
    foto_filename VARCHAR(500) NOT NULL,
    foto_size_bytes INTEGER,
    foto_mime_type VARCHAR(50),
    
    -- Validación automática
    foto_validada BOOLEAN DEFAULT false,
    validacion_resultado JSONB,  -- Almacena resultado completo de validación OCR
    validacion_confianza DECIMAL(5,2),  -- Nivel de confianza 0-100%
    texto_extraido TEXT,  -- Texto extraído por OCR
    coincidencia_numero_guia BOOLEAN,  -- ¿El número de guía coincide?
    
    -- Metadata
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_confirmaciones_guia ON confirmaciones_llegada(guia_id);
CREATE INDEX IF NOT EXISTS idx_confirmaciones_empresa_dest ON confirmaciones_llegada(empresa_destinataria_id);
CREATE INDEX IF NOT EXISTS idx_confirmaciones_fecha ON confirmaciones_llegada(created_at);
CREATE INDEX IF NOT EXISTS idx_confirmaciones_validada ON confirmaciones_llegada(foto_validada);
CREATE INDEX IF NOT EXISTS idx_empresas_dest_rif ON empresas_destinatarias(rif);
CREATE INDEX IF NOT EXISTS idx_empresas_dest_activo ON empresas_destinatarias(activo);

-- 7. Trigger para updated_at en nuevas tablas
CREATE TRIGGER update_empresas_destinatarias_updated_at 
    BEFORE UPDATE ON empresas_destinatarias
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_confirmaciones_updated_at 
    BEFORE UPDATE ON confirmaciones_llegada
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. Comentarios para documentación
COMMENT ON TABLE empresas_destinatarias IS 'Empresas que reciben minerales y confirman llegadas';
COMMENT ON TABLE confirmaciones_llegada IS 'Confirmaciones de llegada con foto de guía y validación OCR';
COMMENT ON COLUMN confirmaciones_llegada.validacion_resultado IS 'JSON con resultado completo de OCR y validación';
COMMENT ON COLUMN confirmaciones_llegada.texto_extraido IS 'Texto extraído de la foto por OCR (Tesseract)';
COMMENT ON COLUMN confirmaciones_llegada.validacion_confianza IS 'Porcentaje de confianza del OCR (0-100)';

-- 9. Datos de prueba (opcional - comentar en producción)
-- Empresa destinataria de ejemplo (para usuario destino)
INSERT INTO empresas_destinatarias (nombre, rif, direccion, telefono, email, contacto_principal) VALUES
('Empresa Destino Principal', 'J-00000001-0', 'La Guaira, Venezuela', '0212-0000001', 'destino@ejemplo.com', 'Usuario Destino')
ON CONFLICT (rif) DO NOTHING;

-- Usuario DESTINO para confirmar llegadas de mineral
-- Contraseña: 1234
INSERT INTO usuarios (username, password_hash, role, empresa_destinataria_id) 
SELECT 
    'destino', 
    '$2b$12$FHL/8aLTna7sNa1I6MqZy.jZf6uv43AlMrD87fNiNOrsk2fboBveq', 
    'empresa_destinataria', 
    id 
FROM empresas_destinatarias 
WHERE rif = 'J-00000001-0'
ON CONFLICT (username) DO NOTHING;

COMMIT;

-- Verificación
SELECT 'Migración completada exitosamente. Nuevas tablas creadas:' as mensaje;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('empresas_destinatarias', 'confirmaciones_llegada');
