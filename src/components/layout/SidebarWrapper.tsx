"use client";
import React from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';

export default function SidebarWrapper() {
  const pathname = usePathname() || '/';

  // hide sidebar on login and public pages
  const hideOn = ['/login', '/', '/cliente/login', '/portal-beneficiario', '/cliente/dashboard'];
  if (hideOn.includes(pathname || '')) return null;


  return <Sidebar />;
}
