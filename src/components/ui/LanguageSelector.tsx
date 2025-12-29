'use client';

import React, { useState } from 'react';
import { Languages, Check } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { languages, Language } from '@/lib/translations';
import { motion, AnimatePresence } from 'framer-motion';

interface LanguageSelectorProps {
  collapsed?: boolean;
  className?: string;
}

export default function LanguageSelector({ collapsed = false, className = '' }: LanguageSelectorProps) {
  const { language, setLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const currentLanguage = languages.find(lang => lang.code === language) || languages[0];

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-10 h-10 rounded-full flex items-center justify-center text-foreground-muted hover:text-foreground transition-all duration-200 border-2 ${
          isOpen 
            ? 'border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.6),0_0_30px_rgba(34,211,238,0.3)]' 
            : 'border-cyan-500/40 hover:border-cyan-400/60 hover:shadow-[0_0_10px_rgba(34,211,238,0.4),0_0_20px_rgba(34,211,238,0.2)]'
        }`}
        title={t('nav.language')}
      >
        <Languages className="w-5 h-5 flex-shrink-0" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40"
            />
            
            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 glass-strong rounded-lg shadow-xl border border-foreground/10 p-2 z-50"
            >
              <div className="space-y-1">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-all ${
                      language === lang.code
                        ? 'bg-primary/20 text-primary'
                        : 'text-foreground-muted hover:text-foreground hover:bg-foreground/5'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{lang.nativeName}</span>
                      <span className="text-xs opacity-60">({lang.name})</span>
                    </div>
                    {language === lang.code && (
                      <Check className="w-4 h-4 text-primary" />
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

