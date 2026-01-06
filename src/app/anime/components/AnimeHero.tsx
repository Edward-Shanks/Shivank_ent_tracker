'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface AnimeHeroProps {
  totalCount?: number;
  }

export default function AnimeHero({ totalCount }: AnimeHeroProps) {
  return (
    <div className="relative h-[50vh] min-h-[400px] max-h-[600px] overflow-hidden">
      {/* Background Gradient - Purple/Pink theme for Anime */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, #581c87 0%, #a855f7 50%, #ec4899 100%)',
        }}
      />
      {/* Background Image */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: 'url(/images/logo/animebg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'right center',
          backgroundRepeat: 'no-repeat',
        }}
      />
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

      {/* Content */}
      <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-end pb-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl"
        >
          {/* Collection Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            Your Anime Collection
          </h1>
          {totalCount !== undefined && (
            <p className="text-lg text-white/70 mb-4">
              {totalCount} Anime in your Collection List
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}

