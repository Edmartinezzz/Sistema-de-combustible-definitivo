-- 1. Eliminar los constraints anteriores para re-definirlos
ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_role_check;
ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS user_role_check;

-- 2. Añadir el nuevo constraint de lista de roles
ALTER TABLE usuarios ADD CONSTRAINT usuarios_role_check 
    CHECK (role IN ('empresa', 'master', 'empresa_destinataria', 'fiscalizador', 'contribuyente'));

-- 3. Añadir el nuevo constraint de relaciones por rol
ALTER TABLE usuarios ADD CONSTRAINT user_role_check CHECK (
    (role = 'master' AND empresa_id IS NULL AND empresa_destinataria_id IS NULL) OR
    (role = 'empresa' AND empresa_id IS NOT NULL AND empresa_destinataria_id IS NULL) OR
    (role = 'empresa_destinataria' AND empresa_id IS NULL AND empresa_destinataria_id IS NOT NULL) OR
    (role = 'fiscalizador' AND empresa_id IS NULL AND empresa_destinataria_id IS NULL) OR
    (role = 'contribuyente' AND empresa_id IS NOT NULL AND empresa_destinataria_id IS NULL)
);

COMMENT ON COLUMN usuarios.role IS 'Roles: master, empresa (cantera), empresa_destinataria (destino), fiscalizador (gobierno), contribuyente (mismas funciones que empresa)';
