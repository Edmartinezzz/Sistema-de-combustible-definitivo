-- Crear tabla de tipos de minerales
CREATE TABLE IF NOT EXISTS tipos_minerales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(100) UNIQUE NOT NULL,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar datos iniciales basados en los que estaban fijos en el HTML
INSERT INTO tipos_minerales (nombre) VALUES
('Piedra Picada'),
('Arrocillo'),
('Arena 2"'),
('Arena 2/4'),
('Arena 5"'),
('Agregado 4/8'),
('Agregado 8/15'),
('Agregado 5/15'),
('Agregado 15/25'),
('Arena Integral'),
('Granzón'),
('P100'),
('P3000'),
('Coraza'),
('Arena Cernida'),
('Canto Rodado'),
('Polvillo'),
('Arena Amarilla')
ON CONFLICT (nombre) DO NOTHING;

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_tipos_minerales_updated_at ON tipos_minerales;
CREATE TRIGGER update_tipos_minerales_updated_at BEFORE UPDATE ON tipos_minerales
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE tipos_minerales IS 'Tipos de minerales disponibles para las guías de movilización';
