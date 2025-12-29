# Images Directory

This directory contains images and assets used throughout the NexaVerse project.

## Directory Structure

```
images/
├── elements/          # Element symbols (Genshin Impact elements)
│   ├── anemo.svg     # Anemo (Wind) element - Teal/Mint Green
│   ├── dendro.svg    # Dendro (Nature) element - Teal/Emerald Green
│   ├── electro.svg   # Electro (Lightning) element - Purple
│   ├── cryo.svg      # Cryo (Ice) element - Teal Six-Pointed Star
│   ├── geo.svg       # Geo (Earth) element - Golden Orange Diamond
│   └── hydro.svg     # Hydro (Water) element - Blue Water/Wave
└── logo/             # Brand logos
    └── nexaverse-logo.svg  # NexaVerse main logo with hexagon
```

## Usage

These images can be imported and used in components:

```tsx
// In React components
import AnemoIcon from '@/public/images/elements/anemo.svg';
import NexaVerseLogo from '@/public/images/logo/nexaverse-logo.svg';

// Or use in img tags
<img src="/images/elements/anemo.svg" alt="Anemo Element" />
```

## Notes

- All element symbols are SVG format for scalability
- Colors match the original Genshin Impact element colors
- Logo includes gradient from teal to golden yellow
- All images are optimized for web use

