# UI documentation (source-of-truth)

This document captures **everything UI-related** for:
- `src/app/genshin/page.tsx`
- `src/app/achievement/page.tsx`

It focuses on **what users see**, **what they can do**, and **which state drives what**.

---

## Genshin page UI (`src/app/genshin/page.tsx`)

### High-level layout
- **Page container**
  - Full-height page with animated/gradient backgrounds.
  - Uses `key={`genshin-${language}`}` to force a rerender when language changes.
- **Two main modes**
  - `viewMode: 'insights' | 'collection'`
  - The page conditionally renders a different hero + main content based on `viewMode`.

### Header controls (always present in main content)
- **View toggle** (segmented control)
  - Insights: icon `BarChart3`, label `t('view.insights')`
  - Collection: icon `LayoutGrid`, label `t('view.collection')`
- **Primary CTA**
  - “Add Character” (`t('genshin.addCharacter')`) opens `AddCharacterModal`
- **Insights-only tools**
  - **Coach mode** toggle button (lightbulb)
    - Toggles `coachMode` which is passed into `GenshinInsights`
  - **Share Insight Card**
    - Dispatches a browser event `genshin-share-insight` on `window`
- **Collection-only tool**
  - “Customize” opens `CardCustomizationModal`

### Insights view UI (`viewMode === 'insights'`)

#### Insights hero strip
- Large gradient strip with title `t('genshin.insights')`
- Subtitle: “Advanced Genshin analytics for your roster”
- Right-side quick identity chip:
  - `username` (from `useAuth()`, fallback “Traveler”)
  - Adventure Rank (AR)
  - Characters count

#### Element cards grid
- A 7-column (responsive) grid of element summary cards.
- Per element:
  - Element icon (legacy `elementIcons` mapping)
  - Total characters (count of `account.characters` matching element)
  - Owned count (filters `obtained`)
  - Progress bar based on `totalInGame = 7` (approx placeholder)
  - Hover glow based on element color

#### Insights module
- Renders `GenshinInsights coachMode={coachMode}`

### Collection view UI (`viewMode === 'collection'`)

#### Collection hero
- 50vh hero with:
  - Background gradient
  - Background image `/images/logo/Bluebg.png`
  - Overlay gradients (left-to-right, bottom-to-top)
- Content:
  - Title `t('genshin.collection')`
  - Count line `account.characters.length`
  - Two “chips”:
    - Adventure Rank (AR) with hover-revealed edit icon (opens account edit modal)
    - World Level with hover-revealed edit icon (opens account edit modal)

#### Sticky element filter bar
- Sticky container (`sticky top-4`) with buttons:
  - “All” → sets `selectedElement = 'all'`
  - One per element → sets `selectedElement = element`
- Selected state colors:
  - “All”: uses `var(--foreground)` + `var(--background)`
  - Element: background = element color

#### Scrollable characters grid
- Scroll area height: `max-h-[calc(100vh-320px)]`, with right padding.
- Grid is responsive (2→6 columns) and animated with `framer-motion`.
- Each character renders as a clickable `Card`:
  - **Image area** (aspect 3/4)
    - Gradient background based on element
    - Uses `character.image` if present; otherwise shows initial in a circle
    - **Rarity stars** (top-left) via `Array.from({ length: character.rarity })`
    - **Element badge** (top-right)
      - Prefer element image from `/images/logo/{Element}.png` if available
      - Otherwise show `ElementIcon`
    - **Level badge** (bottom-right): `Lv.{character.level}`
    - **Role/tier chip** (bottom-left)
      - Prominent label if `constellation >= 6 && friendship >= 10`
      - Subtle label otherwise if `tier` or `type` exists
  - **Info area**
    - Name (truncated)
    - Single row: weapon icon + “Lv.X · F Y/10”
    - Friendship progress bar (0–10)
- Clicking a card opens character detail flow:
  - `selectedCharacter` set
  - `isDetailModalOpen = true`

### Modals + UI flows

#### Add flow
- Trigger: “Add Character” button
- Component: `AddCharacterModal`
  - Controlled via `isAddModalOpen`

#### Detail → edit/delete flow
- Detail modal: `CharacterDetailModal`
  - Props include `character`, `onEdit`, `onDelete`, `elementColors`
- Edit flow:
  - `onEdit` closes detail and opens `EditCharacterModal`
- Delete flow:
  - Uses `window.confirm` with translated prompt
  - On success: closes detail + clears `selectedCharacter`
  - On failure: `alert(t('msg.failedDelete'))`

#### Card customization (collection only)
- Component: `CardCustomizationModal`
- Stores selection in `localStorage` key `genshin_card_fields`
  - Default: `['weapon', 'constellation', 'friendship']`
  - Restored on mount if array length is 3–4
- Note: In this file, `cardFields` is persisted and passed to the modal, but **the visible card UI currently renders weapon + level + friendship regardless**.

#### Account edit modal
- Component: `AccountEditModal`
- Opened from hero chips edit icon buttons.
- Saving calls `updateGenshinAccount(updates)`, and on error shows a hardcoded alert string (“Failed to update account...”).

### UI-dependent helpers (presentation correctness)
- `normalizeElement(element: string): GenshinElement`
  - Capitalizes input to match `GenshinElement` union
  - Fallback default `'Pyro'`
- `getElementColor(element: string): string`
  - Safe color lookup with fallback `Pyro`
- `getElementImage(element: string): string | null`
  - Maps normalized element to `/images/logo/*.png`
  - Note: uses `"Cryo"` key (matches DB spelling) and maps to `/images/logo/Cryo.png`

---

## Achievements page UI (`src/app/achievement/page.tsx`)

### High-level layout
- Full-height page with `bg-animated`.
- Single view that focuses on:
  - Summary stats
  - Cross-collection analytics charts
  - Goals + badges
  - Shareable “wrap image” generator (canvas → PNG download)

### Header section
- Animated entrance (`framer-motion`)
- Badge-like chip: trophy icon + “My Achievements”
- Title: “Advanced analytics & XP”
- Subtitle describing cross-domain view (anime/shows/games/etc.)

### Top stats row (4 cards)
Uses `StatCard` components with icon + label + numeric value:
- Level (purple)
- XP (orange)
- Best streak (green)
- Total entries (blue)

### Analytics sections (cards with charts)

#### Time spent by genre
- Vertical bar chart (`recharts` `BarChart layout="vertical"`)
- Data derived from:
  - Anime minutes: `episodesWatched * 24`
  - Movies + K-drama: fixed 120 minutes each
  - Aggregated by `genres[]`
- Empty state text when no data

#### Platform preference
- Bar chart of game platform counts
- Data derived from `games[].platform[]`
- Empty state text when no data

#### Completion rate over time
- Line chart of cumulative completions by month
- Data derived from completed items in:
  - Anime (`watchStatus === 'Completed'`)
  - K-drama (`status === 'completed'`)
  - Games (`status === 'completed'`)
- Date sources: `updatedAt || endDate` (or `releaseDate` for games)
- Empty state text when no data

#### Score curve
- Line chart of average score grouped by year
- Data derived from:
  - Anime + K-drama scores
  - Date sources: `updatedAt || startDate`, default to now if absent
- Empty state text when no data

### Personal goals section
- Two preset goals displayed with progress bars:
  - “Finish 10 anime this quarter”
  - “Complete 3 backlog games”
- Each goal shows a fraction `current/target` and a progress bar (capped at 100%)

### Badges section
- Grid of badge “tiles”
  - Styles differ between unlocked (yellow accent) vs locked (muted opacity)
- Badge list is computed and includes:
  - Anime Enthusiast (50)
  - Anime Veteran (100)
  - Backlog Slayer (20)
  - Weekly Streak (7 days)
  - Collection Keeper (500 entries)
  - “Show & Tell” (coming soon, always locked)

### Year-in-review / shareable image section
- Card describing feature + CTA button
- CTA: “Download wrap image (PNG)”
- Hidden implementation surface:
  - A `<canvas>` rendered in the DOM (600×260) and filled on click
  - The canvas is converted to `data:image/png` and downloaded as `nexaverse-wrap.png`

