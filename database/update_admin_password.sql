-- Script para actualizar la contraseña del usuario admin
-- Nueva contraseña: 1234
-- 
-- INSTRUCCIONES:
-- 1. Abrir pgAdmin o psql
-- 2. Conectarse a la base de datos: minerales_laguaira
-- 3. Ejecutar este script

UPDATE usuarios 
SET password_hash = '$2b$12$FHL/8aLTna7sNa1I6MqZy.jZf6uv43AlMrD87fNiNOrsk2fboBveq'
WHERE username = 'admin';

-- Verificar que se actualizó correctamente
SELECT username, role, created_at 
FROM usuarios 
WHERE username = 'admin';

-- Resultado esperado:
-- username: admin
-- role: master
-- Nueva contraseña: 1234
