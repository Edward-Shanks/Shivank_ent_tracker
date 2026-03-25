export type PaletteId = 'midnight-slate' | 'onyx-sand' | 'burgundy-blush' | 'pelorous';

export const PALETTES: Array<{
  id: PaletteId;
  name: string;
  colors: {
    primary: string; // Deep brand/accent
    surface: string; // Card/container surface
    background: string; // Page background
    border: string; // Dividers / borders / chart gridlines
    textPrimary: string; // Main text + headings
    textSecondary: string; // Helper text + KPI labels
  };
}> = [
  {
    id: 'midnight-slate',
    name: 'Gossamer',
    colors: {
      // Tailwind gossamer scale:
      // 50  #eefbf6, 100 #d5f6e7, 200 #afebd4, 300 #7bdabb, 400 #45c29d,
      // 500 #22a784, 600 #169375, 700 #106c58, 800 #0f5647, 900 #0e463b, 950 #062822
      primary: '#22a784', // 500
      surface: '#0e463b', // 900
      background: '#062822', // 950
      border: '#106c58', // 700
      textPrimary: '#FFFFFF',
      textSecondary: '#d5f6e7', // 100
    },
  },
  {
    id: 'onyx-sand',
    name: 'Onyx Sand',
    colors: {
      primary: '#000000',
      surface: '#DBCAB9',
      background: '#F2F0ED',
      border: '#A8A39D',
      textPrimary: '#000000',
      textSecondary: '#8B7E74',
    },
  },
  {
    id: 'burgundy-blush',
    name: 'Burgundy Blush',
    colors: {
      primary: '#5F1928',
      surface: '#FDE2E6',
      background: '#FCF8F7',
      border: '#D49097',
      textPrimary: '#333333',
      textSecondary: '#5F1928',
    },
  },
  {
    id: 'pelorous',
    name: 'Pelorous',
    colors: {
      // Tailwind pelorous scale:
      // 50  #f0fafb, 100 #d9f0f4, 200 #b7e2ea, 300 #85ccdb, 400 #5eb5ca,
      // 500 #3091aa, 600 #2b758f, 700 #296075, 800 #295061, 900 #264453, 950 #142c38
      primary: '#3091aa', // 500
      surface: '#142c38', // 950
      background: '#142c38', // 950
      border: '#296075', // 700
      textPrimary: '#FFFFFF',
      textSecondary: '#d9f0f4', // 100
    },
  },
];

export const DEFAULT_PALETTE_ID: PaletteId = 'burgundy-blush';

