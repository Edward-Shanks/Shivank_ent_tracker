'use client';

import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import MainContent from './MainContent';
import { CommandPalette } from './CommandPalette';

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublicPage = pathname === '/login' || pathname === '/register';

  if (isPublicPage) {
    return <>{children}</>;
  }

  return (
    <>
      <Sidebar />
      <CommandPalette />
      <MainContent>{children}</MainContent>
    </>
  );
}

