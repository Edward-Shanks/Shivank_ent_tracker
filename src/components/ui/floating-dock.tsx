"use client";
/**
 * Note: Use position fixed according to your needs
 * Desktop navbar is better positioned at the bottom
 * Mobile navbar is better positioned at bottom right.
 **/

import { cn } from "@/lib/utils";
import { IconLayoutNavbarCollapse, IconSettings, IconUser, IconLanguage, IconLogout } from "@tabler/icons-react";
import {
  AnimatePresence,
  MotionValue,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";

import { useRef, useState } from "react";
import React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { languages } from "@/lib/translations";
import { Check } from "lucide-react";

export const FloatingDock = ({
  items,
  desktopClassName,
  mobileClassName,
}: {
  items: { title: string; icon: React.ReactNode; href: string; isActive?: boolean }[];
  desktopClassName?: string;
  mobileClassName?: string;
}) => {
  return (
    <>
      <FloatingDockDesktop items={items} className={desktopClassName} />
      <FloatingDockMobile items={items} className={mobileClassName} />
    </>
  );
};

const FloatingDockMobile = ({
  items,
  className,
}: {
  items: { title: string; icon: React.ReactNode; href: string; isActive?: boolean }[];
  className?: string;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={cn("relative block md:hidden", className)}>
      <AnimatePresence>
        {open && (
          <motion.div
            layoutId="nav"
            className="absolute inset-x-0 bottom-full mb-2 flex flex-col gap-2"
          >
            {items.map((item, idx) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: 10,
                  transition: {
                    delay: idx * 0.05,
                  },
                }}
                transition={{ delay: (items.length - 1 - idx) * 0.05 }}
              >
                <a
                  href={item.href}
                  key={item.title}
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300",
                    item.isActive
                      ? "bg-gradient-to-br from-cyan-400 to-blue-500 shadow-[0_0_20px_rgba(0,240,255,0.4)]"
                      : "bg-gray-50 dark:bg-neutral-900"
                  )}
                >
                  <div className={cn("h-4 w-4", item.isActive ? "text-white" : "text-neutral-700 dark:text-neutral-300")}>
                    {item.icon}
                  </div>
                </a>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={() => setOpen(!open)}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 dark:bg-neutral-800 shadow-lg"
      >
        <IconLayoutNavbarCollapse className="h-5 w-5 text-neutral-500 dark:text-neutral-400" />
      </button>
    </div>
  );
};

const FloatingDockDesktop = ({
  items,
  className,
}: {
  items: { title: string; icon: React.ReactNode; href: string; isActive?: boolean }[];
  className?: string;
}) => {
  let mouseX = useMotionValue(Infinity);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const router = useRouter();
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  // Settings menu items
  const planLabel = React.useMemo(() => {
    const plan = (user as any)?.plan;
    if (plan === 'pro') return 'Pro Plan';
    if (plan === 'premium') return 'Premium Plan';
    return 'Free Plan';
  }, [user]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
    setSettingsOpen(false);
  };

  return (
    <motion.div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={cn(
        "mx-auto hidden h-16 items-end gap-4 rounded-2xl bg-gray-50 px-4 pb-3 md:flex dark:bg-neutral-900",
        className,
      )}
    >
      {items.map((item) => (
        <IconContainer mouseX={mouseX} key={item.title} {...item} />
      ))}
      
      {/* Settings Icon with Dropdown */}
      <SettingsIconContainer
        mouseX={mouseX}
        settingsOpen={settingsOpen}
        setSettingsOpen={setSettingsOpen}
        user={user}
        planLabel={planLabel}
        language={language}
        languages={languages}
        setLanguage={setLanguage}
        t={t}
        handleLogout={handleLogout}
      />
    </motion.div>
  );
};

function IconContainer({
  mouseX,
  title,
  icon,
  href,
  isActive,
}: {
  mouseX: MotionValue;
  title: string;
  icon: React.ReactNode;
  href: string;
  isActive?: boolean;
}) {
  let ref = useRef<HTMLDivElement>(null);

  let distance = useTransform(mouseX, (val) => {
    let bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };

    return val - bounds.x - bounds.width / 2;
  });

  let widthTransform = useTransform(distance, [-150, 0, 150], [40, 80, 40]);
  let heightTransform = useTransform(distance, [-150, 0, 150], [40, 80, 40]);

  let widthTransformIcon = useTransform(distance, [-150, 0, 150], [20, 40, 20]);
  let heightTransformIcon = useTransform(
    distance,
    [-150, 0, 150],
    [20, 40, 20],
  );

  let width = useSpring(widthTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });
  let height = useSpring(heightTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  let widthIcon = useSpring(widthTransformIcon, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });
  let heightIcon = useSpring(heightTransformIcon, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  const [hovered, setHovered] = useState(false);

  return (
    <a href={href}>
      <motion.div
        ref={ref}
        style={{ width, height }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={cn(
          "relative flex aspect-square items-center justify-center rounded-full transition-all duration-300",
          isActive
            ? "bg-gradient-to-br from-cyan-400 via-blue-500 to-cyan-400 shadow-[0_0_30px_rgba(0,240,255,0.5),0_0_60px_rgba(0,240,255,0.2)]"
            : "bg-gray-200 dark:bg-neutral-800 hover:bg-gray-300 dark:hover:bg-neutral-700"
        )}
      >
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: 10, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: 2, x: "-50%" }}
              className={cn(
                "absolute -top-8 left-1/2 w-fit rounded-md border px-2 py-0.5 text-xs whitespace-pre backdrop-blur-xl",
                isActive
                  ? "border-cyan-400/50 bg-cyan-500/90 text-white shadow-[0_0_20px_rgba(0,240,255,0.3)]"
                  : "border-gray-200 bg-gray-100 text-neutral-700 dark:border-neutral-900 dark:bg-neutral-800 dark:text-white"
              )}
            >
              {title}
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div
          style={{ width: widthIcon, height: heightIcon }}
          className={cn("flex items-center justify-center", isActive ? "text-white" : "text-neutral-700 dark:text-neutral-300")}
        >
          {icon}
        </motion.div>
        
        {/* Active indicator glow ring */}
        {isActive && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute inset-0 rounded-full ring-2 ring-cyan-300/50"
          />
        )}
      </motion.div>
    </a>
  );
}

// Settings Icon Container with Dropdown Menu
function SettingsIconContainer({
  mouseX,
  settingsOpen,
  setSettingsOpen,
  user,
  planLabel,
  language,
  languages,
  setLanguage,
  t,
  handleLogout,
}: {
  mouseX: MotionValue;
  settingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;
  user: any;
  planLabel: string;
  language: string;
  languages: any[];
  setLanguage: (code: any) => void;
  t: (key: string) => string;
  handleLogout: () => void;
}) {
  let ref = useRef<HTMLDivElement>(null);

  let distance = useTransform(mouseX, (val) => {
    let bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  let widthTransform = useTransform(distance, [-150, 0, 150], [40, 80, 40]);
  let heightTransform = useTransform(distance, [-150, 0, 150], [40, 80, 40]);

  let widthTransformIcon = useTransform(distance, [-150, 0, 150], [20, 40, 20]);
  let heightTransformIcon = useTransform(distance, [-150, 0, 150], [20, 40, 20]);

  let width = useSpring(widthTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });
  let height = useSpring(heightTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  let widthIcon = useSpring(widthTransformIcon, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });
  let heightIcon = useSpring(heightTransformIcon, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  const [hovered, setHovered] = useState(false);

  return (
    <div className="relative" ref={ref}>
      <motion.div
        style={{ width, height }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => {
          setHovered(false);
          if (!settingsOpen) return;
        }}
        onClick={() => setSettingsOpen(!settingsOpen)}
        className="relative flex aspect-square items-center justify-center rounded-full transition-all duration-300 bg-gray-200 dark:bg-neutral-800 hover:bg-gray-300 dark:hover:bg-neutral-700 cursor-pointer"
      >
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: 10, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: 2, x: "-50%" }}
              className="absolute -top-8 left-1/2 w-fit rounded-md border border-gray-200 bg-gray-100 px-2 py-0.5 text-xs whitespace-pre text-neutral-700 dark:border-neutral-900 dark:bg-neutral-800 dark:text-white"
            >
              Settings
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div
          style={{ width: widthIcon, height: heightIcon }}
          className="flex items-center justify-center text-neutral-700 dark:text-neutral-300"
        >
          <IconSettings className="w-full h-full" />
        </motion.div>
      </motion.div>

      {/* Settings Dropdown Menu */}
      <AnimatePresence>
        {settingsOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSettingsOpen(false)}
              className="fixed inset-0 z-40"
            />
            
            {/* Dropdown Menu */}
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-72 rounded-2xl shadow-2xl border border-white/20 dark:border-white/10 z-50 overflow-hidden"
              style={{
                background: 'rgba(20, 20, 20, 0.95)',
                backdropFilter: 'blur(20px)',
              }}
            >
              {/* User Info Section */}
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  {user?.avatar && user.avatar.trim() ? (
                    <img
                      src={user.avatar}
                      alt={user.username}
                      className="w-12 h-12 rounded-full ring-2 ring-cyan-400/50 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                      <IconUser className="w-6 h-6 text-cyan-400" />
                    </div>
                  )}
                  <div className="flex flex-col min-w-0">
                    <p className="font-medium text-white text-sm truncate">
                      {user?.username || 'User'}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {planLabel}
                    </p>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="p-2 space-y-1">
                {/* Profile Link */}
                <a
                  href="/profile"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <IconUser className="w-5 h-5" />
                  <span className="text-sm font-medium">Profile & Plan</span>
                </a>

                {/* Language Selector */}
                <div className="relative">
                  <button
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                    onClick={() => {
                      const currentIndex = languages.findIndex(lang => lang.code === language);
                      const nextIndex = (currentIndex + 1) % languages.length;
                      setLanguage(languages[nextIndex].code);
                    }}
                  >
                    <IconLanguage className="w-5 h-5" />
                    <span className="text-sm font-medium flex-1 text-left">Language</span>
                    <span className="text-xs text-gray-400">
                      {languages.find(lang => lang.code === language)?.nativeName}
                    </span>
                  </button>
                </div>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                >
                  <IconLogout className="w-5 h-5" />
                  <span className="text-sm font-medium">Sign Out</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
