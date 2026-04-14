-- Migración: Numeración de Guías Independiente por Empresa
-- Este script quita la secuencia global y permite que cada empresa tenga su propio conteo

-- 1. Eliminar el valor por defecto (la secuencia global)
ALTER TABLE guias_movilizacion ALTER COLUMN numero_guia DROP DEFAULT;

-- 2. Asegurar que no existan duplicados antes de agregar la restricción
-- (Nota: Como era un SERIAL global, no debería haber duplicados por empresa_id + numero_guia)
ALTER TABLE guias_movilizacion ADD CONSTRAINT unique_empresa_guia_numero UNIQUE (empresa_id, numero_guia);

-- 3. Opcional: El SERIAL original habrá dejado una secuencia. Podemos dejarla o borrarla después.
-- DROP SEQUENCE IF EXISTS guias_movilizacion_numero_guia_seq;
