/** @type {import('next').NextConfig} */
// Last updated: 2025-11-21 16:38 - Dashboard UI changes
const nextConfig = {
  reactStrictMode: true,

  // Configuración de Turbopack
  experimental: {
    // Habilitar Server Actions
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },

  // Configuración de Webpack (Legacy)
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, 'src'),
    };
    return config;
  },

  // Configuración de Turbopack (Next.js 16+)
  turbopack: {
    resolveAlias: {
      '@': './src',
    },
  },

  // Configuración de imágenes
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },

  // Las rutas de la API se manejan ahora vía vercel.json para unificación total

  // Configuración de salida
  // output: 'standalone', // Deshabilitado para que "next start" funcione en Render sin Start Command personalizado

  // Configuración de paquetes para el servidor
  // Usamos solo serverExternalPackages para evitar conflictos
  serverExternalPackages: ['@prisma/client', 'prisma'],

  // Configuración de logging extendido (solo desarrollo)
  ...(process.env.NODE_ENV === 'development' && {
    logging: {
      fetches: {
        fullUrl: true,
      },
    },
  }),
};

module.exports = nextConfig;
