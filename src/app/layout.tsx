import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { DataProvider } from '@/context/DataContext';
import { SidebarProvider } from '@/context/SidebarContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { ThemePaletteProvider } from '@/context/ThemePaletteContext';
import ConditionalLayout from '@/components/layout/ConditionalLayout';
import RouteGuard from '@/components/auth/RouteGuard';

const jakartaSans = Plus_Jakarta_Sans({
  variable: '--font-jakarta-sans',
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600', '700', '800'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'NexaVerse - Entertainment Tracking Hub',
  description: 'Track your anime, movies, K-dramas, games, and more in one beautiful dashboard',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Palette system: CSS variables are initialized by ThemePaletteProvider on the client. */}
      </head>
      <body
        className={`${jakartaSans.variable} antialiased bg-background text-foreground min-h-screen`}
      >
        <ThemePaletteProvider>
          <AuthProvider>
            <DataProvider>
              <RouteGuard>
                <SidebarProvider>
                  <LanguageProvider>
                    <ConditionalLayout>{children}</ConditionalLayout>
                  </LanguageProvider>
                </SidebarProvider>
              </RouteGuard>
            </DataProvider>
          </AuthProvider>
        </ThemePaletteProvider>
      </body>
    </html>
  );
}
