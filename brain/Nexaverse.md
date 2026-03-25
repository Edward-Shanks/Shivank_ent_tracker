# NexaVerse (Project Overview)

## What is NexaVerse?
NexaVerse is a personal entertainment tracker that helps you manage your entertainment “universe” in one place and see progress through unified dashboards and analytics.

Instead of keeping separate notes/spreadsheets for anime, shows, games, and web bookmarks, NexaVerse centralizes:
- Your collections (what you are watching/playing, what you completed, what is on-hold, etc.)
- Insights (charts + trends derived from your entries)
- Gamified progression (XP/levels, badges, goals, and a “wrap image” download)
- Export/import-style reporting tools (Excel/CSV based workflows)
- Specialized tracking for Genshin Impact (element-based insights and roster stats)

The goal is to make it easy to track consistently and share polished summaries (especially for Pro).

## Core Features

### Unified Dashboard (Home)
From your main dashboard (`src/app/page.tsx`), NexaVerse provides a unified view of your libraries (anime/shows/games/websites and your Genshin roster) and shows charts such as:
- Top genres across all tracked media
- Completion rates by collection
- Game platform distribution
- Score distribution (from anime and K-drama)
- Content consumption (episodes/titles estimated into a single view)
- Monthly activity (last 6 months)
- Collection comparison (active vs total by category)
- Status distribution across all collections

It also surfaces quick lists like “Continue watching/playing” and “Recently completed”.

### Per-Collection Tracking
Each collection page supports collection management with filtering, searching, sorting, and add/edit/delete flows.

Collections included:
- `Anime` (`/anime`)
- `Shows` (movies + K-drama unified under `/shows`)
- `Games` (`/games`)
- `Genshin Impact` roster tracking (`/genshin`)
- `Website Bookmarks` (`/websites`)

Common collection interactions:
- Status-based filtering (watch/play states)
- Search by title/metadata
- Edit and delete from the collection UI
- Grid/list views where applicable

### Collection Insights View (Charts + Trends)
Many pages support a dual-mode UI:
- `insights`: charts and analytics derived from your saved library data
- `collection`: your curated list/grid with management features

Examples:
- Anime insights + collection customization (including card field customization)
- Games backlog health + platform/status charts
- Shows insights across movies and K-drama

### Achievements / XP / Goals / Wrap Image
The achievements page (`/achievement`) adds a progression layer on top of tracking:
- XP calculation and level progression based on tracked entries and completion counts
- Longest streak calculation (based on tracked activity dates)
- Badges with unlock thresholds
- Personal goals with progress bars
- Shareable “wrap image” download (canvas -> PNG)

The “wrap image” is generated client-side and downloaded as `nexaverse-wrap.png`.

### Genshin Impact Insights (Element-based Analytics)
The Genshin module (`/genshin`) is built around:
- Element filtering and element summary cards (counts + owned counts)
- Roster “collection view” with cards showing rarity, level, and friendship
- An insights mode that renders element cards + `GenshinInsights`
- “Coach mode” (toggle for recommended next steps)
- Share integration: dispatches `CustomEvent('genshin-share-insight')` so other code can render/share an insight card
- Card customization stored in `localStorage` (`genshin_card_fields`)

### Reports (Export + Bulk Upload + Mass Delete)
The reports page (`/reports`) is a Pro/Premium-gated workflow focused on data portability and bulk maintenance:
- Export filtered records as Excel (`.xlsx`)
- Bulk import using Excel or CSV templates
- Filter-driven “records to export/delete” flow
- Optional mass delete for cleanup/migrations

It uses `xlsx` to convert data -> worksheets and writes files like:
- `<Category>_Report_<YYYY-MM-DD>.xlsx`

It also stores a limited export/upload history in `localStorage` for quick auditing.

### Profile + Notifications Preferences
The profile page (`/profile`) lets you manage:
- Username + avatar
- Plan indicator (Free/Pro/Premium)
- Notification preference toggles (saved for this browser)

The UI describes these preferences as a local browser-only setup in the current implementation.

## USP (Unique Selling Points)

### 1. One unified entertainment analytics surface
NexaVerse is designed around “one place” to track and see trends across multiple entertainment types (anime, shows, games, websites, and Genshin).

### 2. Analytics + gamification together
It doesn’t stop at lists: it turns your activity into XP/levels, badges, goals, streaks, and shareable wrap images.

### 3. Sharing-ready visuals (especially on Pro)
Pro pricing explicitly highlights:
- “My Statistics (Pro-only)”
- “Shareable statistics images (Pro-only)”

Even beyond the wrap image, the UI pattern emphasizes sharing polished stats/insights.

### 4. Portability with Excel/CSV templates
The Reports module is built around spreadsheet workflows:
- Templates
- Field mapping from uploaded files
- Excel exports for auditing and sharing

### 5. Genshin roster is truly roster/element aware
Instead of treating Genshin as a generic list, the module models:
- Element colors/icons
- Owned counts
- Element cards and roster cards with friendship/rarity/level info
- Coach mode and shareable insights integration points

## Color Palette (Design System)
The main palette is defined in `src/app/globals.css` using CSS variables and a light/dark theme switch.

### Light Theme (root variables)
- Background: `#f2f4f3`
- Background secondary: `#ffffff`
- Background tertiary: `#eef6f8`
- Foreground (primary text): `#012436`
- Foreground muted: `#5f7685`
- Primary (brand/CTA): `#f96900`
- Primary hover: `#d55b00`
- Primary muted: `#ff8c3a`
- Primary foreground: `#f2f4f3`
- Secondary accent: `#3b0d11`
- Success: `#f96900`
- Warning: `#ff8c3a`
- Error: `#7f1d1d`
- Info: `#9eb3c2`
- Glass background: `rgba(255, 255, 255, 0.85)`
- Glass border: `rgba(0, 0, 0, 0.06)`
- Charts (light):
  - chart-1: `#f96900`
  - chart-2: `#012436`
  - chart-3: `#3b0d11`
  - chart-4: `#9eb3c2`
  - chart-5: `#e6f1f5`
- Gradient primary: `linear-gradient(135deg, #f96900 0%, #d55b00 100%)`
- Gradient hero: `linear-gradient(90deg, #eef6f8 0%, transparent 50%, transparent 100%)`

### Dark Theme (.dark variables)
- Background: `#021824`
- Background secondary: `#052538`
- Background tertiary: `#073449`
- Foreground: `#f2f4f3`
- Foreground muted: `#9eb3c2`
- Primary: `#f96900`
- Primary foreground: `#f2f4f3`
- Secondary: `#3b0d11`
- Accent: `#3b0d11`
- Success: `#f96900`
- Warning: `#ff8c3a`
- Error: `#7f1d1d`
- Info: `#9eb3c2`
- Glass background: `rgba(11, 48, 68, 0.9)`
- Glass border: `rgba(158, 179, 194, 0.25)`
- Cards (dark): `#063044`
- Charts (dark):
  - chart-1: `#f96900`
  - chart-2: `#3b0d11`
  - chart-3: `#9eb3c2`
  - chart-4: `#f2f4f3`
  - chart-5: `#012436`
- Gradient dark: `linear-gradient(180deg, transparent 0%, rgba(5, 37, 56, 0.9) 50%, #021824 100%)`

### Primary UI Elements
Buttons and interactive elements are typically driven by:
- `--primary` / `--primary-hover` / `--primary-muted`
- Glass surfaces (`.glass`, `.glass-strong`, `.glass-card`)
- Glow/hover effects on cards
- Scrollbar theming using explicit hex values (e.g. orange scrollbar `#f96900` in Genshin/Games)

## Accent Palettes (Per Feature)

### Genshin Element Colors
Used in `src/app/genshin/page.tsx`:
- Pyro: `#EC4923`
- Hydro: `#00BFFF`
- Anemo: `#359697`
- Electro: `#945dc4`
- Dendro: `#608a00`
- Cryo: `#4682B4`
- Geo: `#debd6c`

### Website Category Colors
Used in `src/app/websites/page.tsx`:
- Anime: `#a855f7`
- Movies: `#a855f7`
- Gaming: `#a855f7`
- Productivity: `#3b82f6`
- News: `#3b82f6`
- Tools: `#3b82f6`
- Social: `#ec4899`
- Other: `#6b7280`

### Collection/Chart “Semantic” Colors (Examples)
These are used across chart fills, badges, and highlights:
- Orange/Brand: `#f97316` or `#f96900` depending on component
- Blue: `#3b82f6`
- Pink: `#ec4899`
- Purple: `#a855f7`
- Green: `#22c55e`
- Red: `#ef4444` / `#ef4444`
- Amber/Gold: `#fbbf24` / `#ffd700`

## Design Principles (How the UI Feels)
- Glassmorphism: translucent containers with blur, borders, and soft shadows
- Glow + motion: interactive elements have hover lift/scale and animated emphasis
- “Cards everywhere”: each module’s data is represented as media cards or stat tiles
- Dual-mode UX: `collection` for management, `insights` for analytics
- Shareable outputs: canvas-based wrap image generation and Pro-oriented export/sharing

## Key Modules Map (What to Look For)
- `src/app/page.tsx`: unified dashboard + “My Statistics” landing on top level
- `src/app/anime/page.tsx`: anime tracker with insights/collection mode + card customization
- `src/app/shows/page.tsx`: movies + K-drama unified library with filters + status badges
- `src/app/games/page.tsx`: games tracker with backlog health and insights
- `src/app/websites/page.tsx`: bookmark hub with favorites + category boards
- `src/app/genshin/page.tsx`: roster + element insights + coach/share/customize
- `src/app/achievement/page.tsx`: XP, level, badges, goals, charts, and wrap image download
- `src/app/reports/page.tsx`: Excel/CSV export/import + bulk delete + history
- `src/app/pricing/page.tsx`: plan gating and Pro/Premium feature list
- `src/app/profile/page.tsx`: plan indicator + avatar + notification preferences

## Notes / Current Implementation Details
- Several UI texts indicate Pro-only gating for advanced analytics and share-ready images.
- Notification preferences are saved for the browser in the current UI.
- The Genshin element card “progress” uses an approximate `totalInGame = 7` per element for the visualization.

