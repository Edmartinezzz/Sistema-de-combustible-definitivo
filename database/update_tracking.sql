-- Tabla para historial de rastreo GPS
CREATE TABLE IF NOT EXISTS tracking_historial (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guia_id UUID NOT NULL REFERENCES guias_movilizacion(id) ON DELETE CASCADE,
    lat DECIMAL(10, 8) NOT NULL,
    lng DECIMAL(11, 8) NOT NULL,
    velocidad DECIMAL(5, 2), -- Opcional, velocidad en km/h
    precision DECIMAL(8, 2), -- Precisión del GPS en metros
    reportado_por VARCHAR(50) DEFAULT 'chofer_app', -- 'chofer_app' o 'fiscal'
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tracking_guia ON tracking_historial(guia_id);
CREATE INDEX IF NOT EXISTS idx_tracking_time ON tracking_historial(timestamp);
