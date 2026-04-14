-- Tabla para registrar las verificaciones de guías realizadas por fiscalizadores
CREATE TABLE IF NOT EXISTS verificaciones_guias (
    id SERIAL PRIMARY KEY,
    guia_id UUID NOT NULL,
    fiscalizador_id UUID NOT NULL,
    fecha_verificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ubicacion TEXT,
    comentarios TEXT,
    CONSTRAINT fk_guia FOREIGN KEY (guia_id) REFERENCES guias_movilizacion(id) ON DELETE CASCADE,
    CONSTRAINT fk_fiscalizador FOREIGN KEY (fiscalizador_id) REFERENCES usuarios(id)
);

-- Índices para mejorar el rendimiento de las consultas
CREATE INDEX IF NOT EXISTS idx_verificaciones_guia ON verificaciones_guias(guia_id);
CREATE INDEX IF NOT EXISTS idx_verificaciones_fiscalizador ON verificaciones_guias(fiscalizador_id);

COMMENT ON TABLE verificaciones_guias IS 'Historial de verificaciones de guías realizadas por funcionarios (fiscalizadores) mediante escaneo QR';
