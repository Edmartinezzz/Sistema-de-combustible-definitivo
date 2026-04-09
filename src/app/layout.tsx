import './globals.css';
import type { Metadata } from 'next';
import React from 'react';
import SidebarWrapper from '../components/layout/SidebarWrapper';
import Topbar from '../components/layout/Topbar';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/contexts/AuthContext';
import { ClienteAuthProvider } from '@/contexts/ClienteAuthContext';
import { QueryProvider } from '@/providers/QueryProvider';
import { ThemeProvider } from '@/contexts/ThemeContext';
import ThemeToggleButton from '@/components/ui/ThemeToggleButton';
import { Toaster } from 'react-hot-toast';
import { Analytics } from '@vercel/analytics/next';

import BottomNav from '@/components/layout/BottomNav';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Despacho Gas+',
  description: 'Plataforma de Despacho Inteligente de Gas',
  manifest: '/manifest.json',
  themeColor: '#b91c1c',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Despacho Gas+',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <QueryProvider>
            <AuthProvider>
              <ClienteAuthProvider>
                <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300 relative flex flex-col">
                  {/* Contenido Principal - Sin barras laterales ni superiores redundantes */}
                  <main className="flex-1 mx-auto w-full max-w-7xl px-4 md:px-6 py-6 pb-32 md:pb-24 transition-all">
                    {children}
                  </main>

                  {/* Única Navegación Unificada (BottomNav) */}
                  <BottomNav />
                </div>
                <Toaster position="top-right" />
              </ClienteAuthProvider>
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}


