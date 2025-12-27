'use client';

import React from 'react';
import { useSidebar } from '@/context/SidebarContext';

export default function MainContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();

  return (
    <main
      className={`min-h-screen transition-all duration-300 ${
        isCollapsed ? 'pl-20' : 'pl-64'
      }`}
    >
      {children}
    </main>
  );
}

