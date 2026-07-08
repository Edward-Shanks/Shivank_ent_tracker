'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { PageSkeleton } from '@/components/skeletons';

export default function RouteGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Don't redirect if still loading or on public pages (login/register)
    if (isLoading || pathname === '/login' || pathname === '/register') {
      return;
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router, pathname]);

  // Show a page-shaped skeleton while checking auth or redirecting
  if (isLoading) {
    return <PageSkeleton pathname={pathname} />;
  }

  // Allow access to login and register pages when not authenticated
  if (!isAuthenticated && (pathname === '/login' || pathname === '/register')) {
    return <>{children}</>;
  }

  // Don't render protected content if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

