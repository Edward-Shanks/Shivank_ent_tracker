'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Tv,
  Film,
  Gamepad2,
  Sparkles,
  KeyRound,
  Globe,
  ChevronLeft,
  ChevronRight,
  User,
  Settings,
  LogOut,
  FileText,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useSidebar } from '@/context/SidebarContext';
import { AnimatedThemeToggler } from '@/components/ui/ThemeToggler';

const navItems = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/anime', label: 'Anime', icon: Tv },
  { href: '/shows', label: 'Movies & K-Drama', icon: Film },
  { href: '/games', label: 'Games', icon: Gamepad2 },
  { href: '/genshin', label: 'Genshin', icon: Sparkles },
  { href: '/credentials', label: 'Credentials', icon: KeyRound },
  { href: '/websites', label: 'Websites', icon: Globe },
  { href: '/reports', label: 'Reports', icon: FileText },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { isCollapsed, toggleSidebar } = useSidebar();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-screen glass-strong z-50 flex flex-col transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-foreground/10">
        <Link href="/" className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center flex-shrink-0 shadow-lg">
            <span className="text-white font-bold text-xl">E</span>
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="text-xl font-bold text-foreground overflow-hidden whitespace-nowrap"
              >
                EntTracker
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
        <button
          onClick={toggleSidebar}
          className="ml-2 p-2 rounded-lg text-foreground-muted hover:text-foreground hover:bg-foreground/10 active:bg-foreground/15 transition-all duration-200 flex-shrink-0"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <motion.div
            animate={{ rotate: isCollapsed ? 0 : 180 }}
            transition={{ duration: 0.3, ease: 'easeInOut' as const }}
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
          </motion.div>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href === '/shows' && (pathname === '/movies' || pathname === '/kdrama'));
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg font-medium transition-all duration-200 group ${
                    isActive
                      ? 'text-white'
                      : 'text-foreground-muted hover:text-foreground hover:bg-foreground/5'
                  }`}
                  style={isActive ? {
                    background: 'linear-gradient(135deg, #00f0ff 0%, #0ea5e9 100%)',
                    boxShadow: '0 0 20px rgba(0, 240, 255, 0.4)',
                  } : undefined}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? '' : 'group-hover:scale-110 transition-transform'}`} />
                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        className="overflow-hidden whitespace-nowrap"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Section */}
      <div className="border-t border-foreground/10 px-4 py-4">
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 mb-4'}`}>
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.username}
              className="w-10 h-10 rounded-full ring-2 ring-primary/50 flex-shrink-0 shadow-md"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 shadow-md">
              <User className="w-5 h-5 text-primary" />
            </div>
          )}
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden flex-1 min-w-0"
              >
                <p className="font-medium text-foreground truncate">
                  {user?.username || 'Guest'}
                </p>
                <p className="text-xs text-foreground-muted truncate">
                  {user?.email || 'Not logged in'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Settings, Theme Toggler & Logout */}
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2"
            >
              <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground-muted hover:text-foreground hover:bg-foreground/10 active:bg-foreground/15 transition-all duration-200">
                <Settings className="w-4 h-4" />
                Settings
              </button>
              <div className="flex-1">
                <AnimatedThemeToggler className="w-full" />
              </div>
              <button 
                onClick={handleLogout}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground-muted hover:text-red-500 hover:bg-red-500/10 active:bg-red-500/15 transition-all duration-200"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Theme Toggler - Collapsed State */}
        {isCollapsed && (
          <div className="flex justify-center">
            <AnimatedThemeToggler />
          </div>
        )}
      </div>
    </aside>
  );
}

