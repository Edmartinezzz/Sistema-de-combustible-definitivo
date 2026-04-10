# Documentación de Base de Datos - Supabase

Este documento detalla la estructura y el mantenimiento de la base de datos de **Despacho Gas+** alojada en Supabase.

## 📊 Arquitectura
- **Motor**: PostgreSQL 15+
- **Alojamiento**: Supabase
- **Acceso**: Supabase JS SDK (Backend) y Conexión Directa (Scripts de Mantenimiento).

## 🗄️ Esquema Principal de Tablas

### `clientes`
Almacena la información de los beneficiarios del sistema.
- `id`: Identificador único.
- `cedula`: Cédula de identidad (clave de acceso).
- `nombre`: Nombre completo.
- `password`: Hash bcrypt de la contraseña.
- `litros_mes_gasolina` / `litros_mes_gasoil`: Límite mensual asignado.
- `consumo_gasolina` / `consumo_gasoil`: Consumo acumulado en el día actual.

### `sistema_config`
Configuraciones globales del sistema.
- `id`: Siempre 1.
- `fecha_ultimo_reset`: Fecha en la que se ejecutó el último reinicio de litros (formato `YYYY-MM-DD`).
- `limite_diario_gasolina`: Límite global si aplica.

### `retiros`
Historial de despachos realizados.
- `id`: Identificador.
- `cliente_id`: Relación con el beneficiario.
- `litros`: Cantidad despachada.
- `tipo_combustible`: 'gasolina' o 'gasoil'.

## 🔄 Lógica de Reinicio Diario (Reset)
Para evitar que los beneficiarios excedan su cuota diaria, el sistema reinicia los contadores de consumo a las 00:00 (hora del servidor/Vercel).
- **Activador**: El primer login exitoso de cualquier cliente después de la medianoche dispara la función `ejecutarResetDiario()`.
- **Validación**: Se compara `CURRENT_DATE` con `fecha_ultimo_reset` en `sistema_config`.

## 🛠️ Mantenimiento y Scripts
Disponemos de varios scripts de Python en la raíz para tareas rápidas:
- `inspect_supabase.py`: Muestra un resumen del estado actual de la base de datos.
- `corregir_saldos.py`: Script para ajustes manuales en caso de discrepancias.

## 🔐 Seguridad (RLS)
Las políticas de **Row Level Security** están configuradas en Supabase para proteger los datos. El backend usa `supabaseAdmin` (Service Role) para realizar operaciones críticas que requieren saltar estas restricciones (como el reset global o validación de hashes).
