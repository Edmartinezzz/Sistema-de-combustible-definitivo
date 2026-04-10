# Guía: Cómo Ejecutar el Fix de Base de Datos (Supabase)

Esta guía explica cómo corregir el problema de **reseteo repetido de litros** asegurando que la fecha del último reset sea la correcta en Supabase.

## Opción 1: Usar el Dashboard de Supabase (Recomendado)

### Paso 1: Acceder al Editor SQL
1. Ve a tu proyecto en [supabase.com](https://supabase.com/dashboard)
2. En el menú lateral izquierdo, haz clic en **"SQL Editor"** (icono `>_`)
3. Haz clic en **"New query"**

### Paso 2: Ejecutar la Consulta SQL
Pega y ejecuta el siguiente código:

```sql
-- Verificar el estado actual
SELECT id, fecha_ultimo_reset FROM sistema_config WHERE id = 1;

-- Corregir a la fecha de hoy si es necesario
UPDATE sistema_config
SET fecha_ultimo_reset = CURRENT_DATE
WHERE id = 1;

-- Verificar la corrección
SELECT id, fecha_ultimo_reset FROM sistema_config WHERE id = 1;
```

---

## Opción 2: Usar el Script de Python Local

### Paso 1: Configurar Variables de Entorno
Asegúrate de tener la `DATABASE_URL` de Supabase en tu archivo `.env` o configurada en tu terminal.

### Paso 2: Ejecutar Inspección
```bash
python inspect_supabase.py
```

### Paso 3: Ejecutar el Fix
Si el script `ejecutar_fix_db.py` está configurado para Supabase, ejecútalo:
```bash
python ejecutar_fix_db.py
```

---

## Verificación del Funcionamiento

Después de aplicar el fix, realiza estas pruebas:

1. **Login de Cliente:** Inicia sesión con una cédula de prueba. Los litros disponibles NO deben cambiar.
2. **Consultar Web:** Recarga el dashboard y verifica que el consumo siga en los valores esperados.
3. **Múltiples Logins:** Entra y sale varias veces; la fecha `fecha_ultimo_reset` en la base de datos debe impedir que se ejecute el script de limpieza más de una vez al día.

---

## ¿Qué hacer si sigue fallando?
Si los litros se siguen reseteando:
1. Verifica que la zona horaria del servidor de Vercel y tu base de datos coincidan o no tengan un desfase que cause un cambio de día prematuro.
2. Asegúrate de que el registro con `id = 1` existe realmente en la tabla `sistema_config`. Si no existe, créalo con:
   ```sql
   INSERT INTO sistema_config (id, fecha_ultimo_reset) VALUES (1, CURRENT_DATE);
   ```
