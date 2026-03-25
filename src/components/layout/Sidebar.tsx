'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import {
  IconDashboard,
  IconMovie,
  IconDeviceGamepad,
  IconSparkles,
  IconTrophy,
  IconWorld,
  IconFileReport,
  IconAtom,
} from '@tabler/icons-react';
import { useLanguage } from '@/context/LanguageContext';
import { FloatingDock } from '@/components/ui/floating-dock';

export default function Sidebar() {
  const pathname = usePathname();
  const { t } = useLanguage();

  // Helper to check if a path is active
  const isActivePath = (href: string) => {
    if (href === '/shows') {
      return pathname === '/shows' || pathname === '/movies' || pathname === '/kdrama';
    }
    return pathname === href;
  };

  // Navigation items for FloatingDock with active state
  const navItems = [
    {
      title: t('nav.dashboard'),
      icon: <IconDashboard className="h-full w-full" />,
      href: '/',
      isActive: isActivePath('/'),
    },
    {
      title: t('nav.anime'),
      icon: <IconAtom className="h-full w-full" />,
      href: '/anime',
      isActive: isActivePath('/anime'),
    },
    {
      title: t('nav.movies'),
      icon: <IconMovie className="h-full w-full" />,
      href: '/shows',
      isActive: isActivePath('/shows'),
    },
    {
      title: t('nav.games'),
      icon: <IconDeviceGamepad className="h-full w-full" />,
      href: '/games',
      isActive: isActivePath('/games'),
    },
    {
      title: t('nav.genshin'),
      icon: <IconSparkles className="h-full w-full" />,
      href: '/genshin',
      isActive: isActivePath('/genshin'),
    },
    {
      title: 'Achievements',
      icon: <IconTrophy className="h-full w-full" />,
      href: '/achievement',
      isActive: isActivePath('/achievement'),
    },
    {
      title: t('nav.websites'),
      icon: <IconWorld className="h-full w-full" />,
      href: '/websites',
      isActive: isActivePath('/websites'),
    },
    {
      title: t('nav.reports'),
      icon: <IconFileReport className="h-full w-full" />,
      href: '/reports',
      isActive: isActivePath('/reports'),
    },
  ];

  return (
    <>
      {/* FloatingDock Navigation - Bottom Centered for Desktop */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <FloatingDock
          items={navItems}
          desktopClassName="backdrop-blur-xl bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-cyan-500/10 dark:from-cyan-400/10 dark:via-blue-400/10 dark:to-cyan-400/10 border border-white/20 dark:border-white/10 shadow-[0_0_40px_rgba(0,240,255,0.15)]"
          mobileClassName="backdrop-blur-xl bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-cyan-500/10 dark:from-cyan-400/10 dark:via-blue-400/10 dark:to-cyan-400/10 border border-white/20 dark:border-white/10 shadow-[0_0_40px_rgba(0,240,255,0.15)]"
        />
      </div>
    </>
  );
}
