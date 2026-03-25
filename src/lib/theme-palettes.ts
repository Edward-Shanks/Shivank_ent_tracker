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
    name: 'Midnight Slate',
    colors: {
      primary: '#0b3044',
      surface: '#0f82ab',
      background: '#d9d4ca',
      border: '#E5E7E9',
      textPrimary: '#0B3044',
      textSecondary: '#E5E7E9',
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

