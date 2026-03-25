'use client';

import React from 'react';
import { GenshinElement } from '@/types';

interface ElementIconProps {
  element: GenshinElement;
  className?: string;
  size?: number;
  style?: React.CSSProperties;
}

export function ElementIcon({ element, className = '', size = 24, style }: ElementIconProps) {
  const iconSize = size;
  
  const elementIcons: Record<GenshinElement, React.ReactNode> = {
    // Pyro - Red flame symbol (heart-shaped base with upward flickering flames)
    Pyro: (
      <svg width={iconSize} height={iconSize} viewBox="0 0 100 100" className={className} style={style}>
        <path
          d="M50 95 Q45 85, 45 75 Q45 65, 50 55 Q55 65, 55 75 Q55 85, 50 95 Z"
          fill="currentColor"
        />
        <path
          d="M50 55 Q45 50, 45 40 Q45 30, 50 25 Q55 30, 55 40 Q55 50, 50 55 Z"
          fill="currentColor"
        />
        <path
          d="M50 25 Q48 20, 50 15 Q52 20, 50 25 Z"
          fill="currentColor"
        />
        <path
          d="M50 40 Q45 35, 42 30 Q45 35, 50 40 Z"
          fill="currentColor"
        />
        <path
          d="M50 40 Q55 35, 58 30 Q55 35, 50 40 Z"
          fill="currentColor"
        />
        <path
          d="M50 65 Q45 60, 42 55 Q45 60, 50 65 Z"
          fill="currentColor"
        />
        <path
          d="M50 65 Q55 60, 58 55 Q55 60, 50 65 Z"
          fill="currentColor"
        />
        <circle cx="50" cy="30" r="8" fill="currentColor" />
      </svg>
    ),
    // Hydro - Blue water droplets and waves
    Hydro: (
      <svg width={iconSize} height={iconSize} viewBox="0 0 100 100" className={className} style={style}>
        <path
          d="M20 50 Q30 30, 50 30 Q70 30, 80 50 Q70 70, 50 70 Q30 70, 20 50 Z"
          fill="currentColor"
        />
        <path
          d="M15 55 Q25 40, 50 40 Q75 40, 85 55 Q75 70, 50 70 Q25 70, 15 55 Z"
          fill="currentColor"
        />
        <circle cx="25" cy="45" r="6" fill="currentColor" />
        <circle cx="25" cy="60" r="5" fill="currentColor" />
      </svg>
    ),
    // Anemo - Teal wind/wings symbol (symmetrical wings)
    Anemo: (
      <svg width={iconSize} height={iconSize} viewBox="0 0 100 100" className={className} style={style}>
        <path
          d="M50 5 L55 25 L70 20 L60 40 L80 35 L60 50 L80 65 L60 60 L70 80 L55 75 L50 95 L45 75 L30 80 L40 60 L20 65 L40 50 L20 35 L40 40 L30 20 L45 25 Z"
          fill="currentColor"
        />
        <path
          d="M50 15 L52 30 L62 28 L56 42 L70 40 L56 50 L70 60 L56 58 L62 72 L52 70 L50 85 L48 70 L38 72 L44 58 L30 60 L44 50 L30 40 L44 42 L38 28 L48 30 Z"
          fill="currentColor"
        />
        <path
          d="M50 25 L51 38 L58 36 L54 48 L64 50 L54 52 L58 64 L51 62 L50 75 L49 62 L42 64 L46 52 L36 50 L46 48 L42 36 L49 38 Z"
          fill="currentColor"
        />
      </svg>
    ),
    // Electro - Purple triskelion/lightning (three-armed spiral)
    Electro: (
      <svg width={iconSize} height={iconSize} viewBox="0 0 100 100" className={className} style={style}>
        <path
          d="M50 10 L70 40 L50 40 L60 60 L30 30 L50 30 L40 10 Z"
          fill="currentColor"
        />
        <path
          d="M50 20 L62 40 L50 40 L56 55 L38 35 L50 35 L44 20 Z"
          fill="currentColor"
        />
        <path
          d="M50 45 L62 65 L50 65 L56 80 L38 60 L50 60 L44 45 Z"
          fill="currentColor"
        />
        <path
          d="M50 10 L40 30 L50 30 L44 50 L56 30 L50 30 L60 10 Z"
          fill="currentColor"
        />
        <path
          d="M50 20 L44 35 L50 35 L46 50 L54 35 L50 35 L56 20 Z"
          fill="currentColor"
        />
        <path
          d="M50 45 L44 60 L50 60 L46 75 L54 60 L50 60 L56 45 Z"
          fill="currentColor"
        />
        <path
          d="M50 10 L60 30 L50 30 L56 50 L44 30 L50 30 L40 10 Z"
          fill="currentColor"
        />
        <path
          d="M50 20 L56 35 L50 35 L54 50 L46 35 L50 35 L44 20 Z"
          fill="currentColor"
        />
        <path
          d="M50 45 L56 60 L50 60 L54 75 L46 60 L50 60 L44 45 Z"
          fill="currentColor"
        />
      </svg>
    ),
    // Dendro - Green leaf/heart shape
    Dendro: (
      <svg width={iconSize} height={iconSize} viewBox="0 0 100 100" className={className} style={style}>
        <path
          d="M50 5 L55 25 L70 20 L60 40 L80 35 L60 50 L80 65 L60 60 L70 80 L55 75 L50 95 L45 75 L30 80 L40 60 L20 65 L40 50 L20 35 L40 40 L30 20 L45 25 Z"
          fill="currentColor"
        />
        <path
          d="M50 15 L52 30 L62 28 L56 42 L70 40 L56 50 L70 60 L56 58 L62 72 L52 70 L50 85 L48 70 L38 72 L44 58 L30 60 L44 50 L30 40 L44 42 L38 28 L48 30 Z"
          fill="currentColor"
        />
        <path
          d="M50 25 L51 38 L58 36 L54 48 L64 50 L54 52 L58 64 L51 62 L50 75 L49 62 L42 64 L46 52 L36 50 L46 48 L42 36 L49 38 Z"
          fill="currentColor"
        />
      </svg>
    ),
    // Cryo - Cyan snowflake (six-pointed star)
    Cryo: (
      <svg width={iconSize} height={iconSize} viewBox="0 0 100 100" className={className} style={style}>
        <path
          d="M50 10 L60 30 L80 25 L65 45 L85 50 L65 55 L80 75 L60 70 L50 90 L40 70 L20 75 L35 55 L15 50 L35 45 L20 25 L40 30 Z"
          fill="currentColor"
        />
        <path
          d="M50 20 L55 35 L68 32 L58 48 L72 50 L58 52 L68 68 L55 65 L50 80 L45 65 L32 68 L42 52 L28 50 L42 48 L32 32 L45 35 Z"
          fill="currentColor"
        />
        <path
          d="M50 25 L52 38 L60 36 L54 48 L64 50 L54 52 L60 64 L52 62 L50 75 L48 62 L40 64 L46 52 L36 50 L46 48 L40 36 L48 38 Z"
          fill="currentColor"
        />
        <path
          d="M50 10 L40 30 L20 25 L35 45 L15 50 L35 55 L20 75 L40 70 L50 90 L60 70 L80 75 L65 55 L85 50 L65 45 L80 25 L60 30 Z"
          fill="currentColor"
        />
      </svg>
    ),
    // Geo - Golden diamond with internal maze pattern
    Geo: (
      <svg width={iconSize} height={iconSize} viewBox="0 0 100 100" className={className} style={style}>
        <path
          d="M50 10 L70 30 L70 50 L50 70 L30 50 L30 30 Z"
          fill="currentColor"
        />
        <path
          d="M50 20 L60 30 L60 40 L50 50 L40 40 L40 30 Z"
          fill="currentColor"
        />
        <path
          d="M50 25 L55 30 L55 35 L50 40 L45 35 L45 30 Z"
          fill="currentColor"
        />
        <path
          d="M50 35 L55 40 L55 45 L50 50 L45 45 L45 40 Z"
          fill="currentColor"
        />
        <path
          d="M50 30 L45 35 L50 40 L55 35 Z"
          fill="currentColor"
          opacity="0.3"
        />
        <path
          d="M50 15 L55 25 L50 30 L45 25 Z"
          fill="currentColor"
        />
        <path
          d="M50 30 L55 40 L50 45 L45 40 Z"
          fill="currentColor"
        />
        <path
          d="M50 45 L55 55 L50 60 L45 55 Z"
          fill="currentColor"
        />
        <path
          d="M50 30 L40 40 L50 50 L60 40 Z"
          fill="currentColor"
          opacity="0.2"
        />
        <path
          d="M50 20 L45 25 L50 30 L55 25 Z"
          fill="currentColor"
          opacity="0.4"
        />
        <path
          d="M50 40 L45 45 L50 50 L55 45 Z"
          fill="currentColor"
          opacity="0.4"
        />
      </svg>
    ),
  };

  return <>{elementIcons[element]}</>;
}
