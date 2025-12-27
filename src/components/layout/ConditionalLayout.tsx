'use client';

import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import MainContent from './MainContent';

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublicPage = pathname === '/login' || pathname === '/register';

  if (isPublicPage) {
    return <>{children}</>;
  }

  return (
    <>
      <Sidebar />
      <MainContent>{children}</MainContent>
    </>
  );
}

