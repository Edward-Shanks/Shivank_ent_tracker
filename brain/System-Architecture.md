# System architecture (as used by the UI)

This document captures **everything architecture/system-related** for:
- `src/app/genshin/page.tsx`
- `src/app/achievement/page.tsx`

It focuses on **dependencies**, **data flow**, **state management**, **side effects**, and **implicit contracts** (types, naming, storage keys).

---

## Shared application foundations used by both pages

### Runtime model
- Both files are **client components** (`'use client'`) and execute in the browser.
- Both rely on React hooks and browser APIs (localStorage, `window`, `<canvas>`).

### Context dependencies

#### `useAuth()` (Auth context)
- `src/app/genshin/page.tsx`
  - Reads `user?.username` to personalize the header.
- `src/app/achievement/page.tsx`
  - Reads `user?.username` for the shareable wrap image.

#### `useData()` (Data context)
- `src/app/genshin/page.tsx`
  - Reads `genshinAccount`
  - Calls mutations:
    - `updateGenshinCharacter(id, updates)`
    - `deleteGenshinCharacter(id)`
    - `updateGenshinAccount(updates)`
- `src/app/achievement/page.tsx`
  - Reads collections:
    - `anime`
    - `movies`
    - `kdrama`
    - `games`

#### `useLanguage()` (Language context)
- Used only in `src/app/genshin/page.tsx`
  - Reads `t()` for translations
  - Reads `language` to recompute memoized translations and force re-render via key.

---

## Genshin page architecture (`src/app/genshin/page.tsx`)

### Data model contracts
- Types imported:
  - `GenshinElement`, `GenshinWeapon`
  - `GenshinCharacter` is referenced via `import('@/types').GenshinCharacter`
- Assumed account shape (fallback default if missing):
  - `uid: string`
  - `adventureRank: number`
  - `worldLevel: number`
  - `characters: GenshinCharacter[]`
  - currency: `primogems`, `intertwined`, `acquaint`

### Element naming contract (important)
- The code normalizes element strings and maps to a union `GenshinElement`.
- The spelling **`Cyro`** is consistently used:
  - `elementColors` includes `Cyro`
  - `getElementImage()` maps `Cyro -> /images/logo/Cyro.png`
- Implication: upstream data (DB / seed / API) is expected to use `"Cyro"` rather than `"Cryo"`.

### Local state + persistence

#### View/UI state (React state)
- `viewMode: 'insights' | 'collection'`
- `selectedElement: GenshinElement | 'all'`
- `coachMode: boolean`
- Modal flags:
  - `isAddModalOpen`
  - `isDetailModalOpen`
  - `isEditModalOpen`
  - `isCustomizationModalOpen`
  - `isAccountEditModalOpen`
- `selectedCharacter: GenshinCharacter | null`
- `cardFields: CardField[]`

#### Persistent settings (localStorage)
- Key: `genshin_card_fields`
- Load strategy:
  - On mount, read and `JSON.parse` the value.
  - Accept only arrays where length is 3–4.
  - If parse fails or invalid, keep defaults.
- Save strategy:
  - On “save customization”, write JSON back.

### Derived data (memoization / computed)
- `filteredCharacters` (`useMemo`)
  - Filters by `selectedElement` (case-insensitive compare).
- `elementTranslations` (`useMemo`)
  - Builds `Record<GenshinElement, string>` by calling `t('element.<lowercase>')`
  - Uses fallback to the element name if translation is missing.

### Command/event side-effects
- **Share insight**
  - Dispatches `CustomEvent('genshin-share-insight')` on `window`.
  - This is an implicit integration point for other code to listen for and render/share a “card”.
- **Delete confirmation**
  - Uses `window.confirm` and `alert` for user feedback.

### Data mutations (writes) and UI consistency
- `deleteGenshinCharacter(id)`
  - On success: closes modal and clears selection.
  - On failure: logs error and alerts translated failure string.
- `updateGenshinCharacter(id, updates)`
  - On success: updates local `selectedCharacter` state with merged updates.
  - Assumes `useData()` will also update the backing list in context (not shown here).
- `updateGenshinAccount(updates)`
  - Called from `AccountEditModal` onSave.
  - On failure: logs error and uses a hardcoded alert message.

### UI composition boundaries (module architecture)
- Page is composed of:
  - `./components/GenshinInsights`
  - `./components/AddCharacterModal`
  - `./components/CharacterDetailModal`
  - `./components/EditCharacterModal`
  - `./components/CardCustomizationModal`
  - `./components/AccountEditModal`
- Shared UI primitives:
  - `Card`, `Badge`, `Button`
  - `ElementIcon`
- Animations via `framer-motion`.

---

## Achievements page architecture (`src/app/achievement/page.tsx`)

### Data model contracts (implicit)
- `useData()` provides arrays: `anime`, `movies`, `kdrama`, `games`.
- The page expects these fields to exist (or be optional) on items:
  - **Anime**
    - `episodesWatched?: number`
    - `genres?: string[]`
    - `watchStatus?: string` (expects `'Completed'`)
    - `score?: number`
    - dates: `updatedAt?`, `startDate?`, `endDate?`, `createdAt?`
  - **Movies**
    - `genres?: string[]`
    - dates: `updatedAt?`, `createdAt?`
  - **K-drama**
    - `genres?: string[]`
    - `status?: string` (expects `'completed'`)
    - `score?: number`
    - dates: `updatedAt?`, `startDate?`, `endDate?`, `createdAt?`
  - **Games**
    - `platform?: string[]`
    - `status?: string` (expects `'completed'`)
    - dates: `updatedAt?`, `releaseDate?`, `createdAt?`

### Derived analytics (all memoized)

#### Total entries
- `totalEntries = anime.length + movies.length + kdrama.length + games.length`

#### Time spent by genre
- Builds a `Map<string, number>` of minutes by genre:
  - Anime minutes = `(episodesWatched || 0) * 24`
  - Movies & kdrama minutes = `120` each (fixed estimate)
- Outputs top 8 genres as `{ name, hours }` sorted descending.

#### Platform preference
- Counts platform occurrences across `games[].platform[]`
- Outputs sorted list `{ name, count }`

#### Completion over time
- Aggregates completions by month key `YYYY-MM`
- Uses “completed” filters:
  - Anime: `watchStatus === 'Completed'`
  - K-drama: `status === 'completed'`
  - Games: `status === 'completed'`
- Chooses a date field per item:
  - Anime: `updatedAt || endDate`
  - K-drama: `updatedAt || endDate`
  - Games: `updatedAt || releaseDate`
- Returns cumulative series `{ month, completed }` for charting.

#### Score curve
- Groups scores by year string.
- Pushes only truthy `score` values (note: `0` is ignored).
- Date used: `updatedAt || startDate || now`.
- Returns per-year average `{ year, avgScore }`.

#### Streak calculation
- Collects a set of distinct ISO dates `YYYY-MM-DD` from `updatedAt || createdAt` across all collections.
- Sorts dates, then computes longest consecutive day streak.
- Returns:
  - `longestStreak`
  - `daysTracked` (# distinct days)

### Progression system (XP/level)
- XP formula:
  - `xp = totalEntries * 10 + animeCompleted * 5 + gamesCompleted * 5`
- Level formula:
  - `level = max(1, floor(xp / 250) + 1)`
  - `nextLevelXp = level * 250`
  - `levelProgress` computed but not currently displayed as a bar in this file.

### Badges system
- Badge list is computed in a single memoized block.
- Conditions:
  - animeCompleted ≥ 50 / 100
  - gamesCompleted ≥ 20
  - longest streak ≥ 7
  - totalEntries ≥ 500
  - “social-share” is hardcoded locked (coming soon)

### Side effect: share image download (canvas → file)
- Uses a DOM `<canvas>` via `useRef`.
- On click:
  - Draws a dark background.
  - Writes text stats (username + totals).
  - Converts canvas to `data:image/png` with `toDataURL`.
  - Creates a temporary `<a>` element and triggers a download.
- Filename: `nexaverse-wrap.png`

### Visualization stack
- Uses `recharts`:
  - `BarChart`, `LineChart`, `Tooltip`, `CartesianGrid`, etc.
- Uses `ResponsiveContainer` to fit cards.
- Assumes charts render only client-side (fits `'use client'`).

