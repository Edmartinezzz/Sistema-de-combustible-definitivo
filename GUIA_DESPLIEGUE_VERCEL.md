# Guía de Despliegue en Vercel - Despacho Gas+

Esta guía detalla los pasos para desplegar la plataforma **Despacho Gas+** en Vercel, conectándola con la base de datos de Supabase.

## ⚠️ Requisitos Previos
1. Una cuenta en [Vercel](https://vercel.com).
2. El repositorio subido a GitHub (preferiblemente).
3. Acceso a tu proyecto en Supabase para obtener las credenciales.

## 🚀 Pasos para el Despliegue

### 1. Importar el Proyecto
1. Ve a tu Dashboard de Vercel y haz clic en **"Add New..."** -> **"Project"**.
2. Selecciona tu repositorio de GitHub.
3. En la configuración del proyecto, Vercel detectará automáticamente que es un proyecto de **Next.js**.

### 2. Configurar Variables de Entorno
Antes de hacer clic en "Deploy", despliega la sección **"Environment Variables"** y añade las siguientes:

| Nombre de Variable | Valor |
|-------------------|-------|
| `DATABASE_URL` | La URL de conexión (Transaction Mode) de Supabase |
| `SUPABASE_URL` | Tu URL de Supabase |
| `SUPABASE_ANON_KEY` | Tu Anon Key (pública) |
| `SUPABASE_SERVICE_ROLE_KEY` | Tu Service Role Key (privada para el backend) |
| `SECRET_KEY` | Una cadena aleatoria larga para firmar JWT |
| `NEXT_PUBLIC_API_BASE_URL` | Dejar vacío o poner la URL de tu dominio en Vercel |

### 3. Ejecutar el Deploy
1. Haz clic en **"Deploy"**.
2. Vercel comenzará a compilar el proyecto. Esto incluye:
   - Instalación de dependencias.
   - Generación del build de Next.js.
   - Optimización de imágenes y rutas estáticas.

## 📱 Sincronización con Android (Capacitor)
Una vez que el sitio esté desplegado y tengas tu URL (ej. `https://despacho-gas.vercel.app`):
1. Asegúrate de que las llamadas a la API en el código usen rutas relativas o apunten a este dominio.
2. Si usas Deep Links, configura el dominio en `capacitor.config.ts`.

## 🛠️ Mantenimiento post-despliegue
- **Logs de Servidor:** Puedes ver los errores en tiempo real en la pestaña **"Logs"** de tu proyecto en Vercel. Esto es vital para depurar fallos en el login de clientes.
- **Redeploys:** Cada vez que hagas `git push` a la rama `main`, Vercel actualizará automáticamente el sitio.
