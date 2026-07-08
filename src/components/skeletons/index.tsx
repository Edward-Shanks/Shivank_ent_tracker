import { Skeleton } from '@/components/ui/skeleton';

/**
 * Page-shaped loading skeletons used by the App Router `loading.tsx` files and
 * by the auth `RouteGuard` (via `PageSkeleton`). These mirror the real page
 * layouts so route transitions and the initial auth/data resolve show
 * structure instead of a spinner. They are purely presentational and never
 * touch data, API, or page logic.
 */

const CONTENT_WRAPPER = 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8';

/** Poster-style card used by the media grids (anime, games, genshin, shows). */
function MediaCardSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      <Skeleton className="aspect-[3/4] w-full rounded-xl" />
      <Skeleton className="h-4 w-3/4 rounded-md" />
      <Skeleton className="h-3 w-1/2 rounded-md" />
    </div>
  );
}

/** Responsive grid of poster cards. */
function MediaGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <MediaCardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Row of filter / status pills. */
function FilterPillsSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="flex flex-wrap gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-9 w-24 rounded-full" />
      ))}
    </div>
  );
}

/** Gradient hero strip placeholder with a title/subtitle block. */
function HeroSkeleton({ height = 'h-48' }: { height?: string }) {
  return (
    <div className="relative overflow-hidden">
      <div className={`${height} bg-gradient-to-br from-background-secondary via-muted/40 to-background-secondary`} />
      <div className="absolute inset-0 bg-black/5" />
      <div className={`relative ${CONTENT_WRAPPER} ${height === 'h-48' ? '-mt-40' : '-mt-32'}`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-col gap-3">
            <Skeleton className="h-9 w-64 rounded-lg" />
            <Skeleton className="h-4 w-80 max-w-full rounded-md" />
          </div>
          <Skeleton className="h-10 w-48 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

/** Grid of stat / metric cards used by insights and dashboard views. */
export function StatCardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-border bg-card/40 p-5 flex flex-col gap-3">
          <Skeleton className="h-4 w-24 rounded-md" />
          <Skeleton className="h-8 w-16 rounded-lg" />
          <Skeleton className="h-3 w-20 rounded-md" />
        </div>
      ))}
    </div>
  );
}

/**
 * Media collection pages (anime, games, genshin, shows, websites): gradient
 * hero strip + header row + filter pills + poster grid.
 */
export function MediaPageSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background-tertiary/80 to-background">
      <HeroSkeleton />
      <div className={CONTENT_WRAPPER}>
        {/* Header: title + action buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <Skeleton className="h-8 w-40 rounded-lg" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-28 rounded-xl" />
            <Skeleton className="h-10 w-28 rounded-xl" />
          </div>
        </div>
        {/* Search + filters */}
        <div className="flex flex-col gap-4 mb-8">
          <Skeleton className="h-11 w-full max-w-md rounded-xl" />
          <FilterPillsSkeleton />
        </div>
        <MediaGridSkeleton />
      </div>
    </div>
  );
}

/** Home dashboard: hero + stat cards + category nav cards. */
export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background-tertiary/80 to-background">
      <HeroSkeleton height="h-40" />
      <section className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 space-y-8">
        <StatCardsSkeleton count={4} />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
      </section>
    </div>
  );
}

/** Achievement page: centered header + summary stats + content grids. */
export function AchievementSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center text-center gap-3 mb-8">
          <Skeleton className="h-8 w-40 rounded-full" />
          <Skeleton className="h-9 w-72 rounded-lg" />
          <Skeleton className="h-4 w-96 max-w-full rounded-md" />
        </div>
        <div className="mb-8">
          <StatCardsSkeleton count={4} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

/** Pricing page: centered header + two plan cards. */
export function PricingSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col items-center text-center gap-3 mb-10">
          <Skeleton className="h-8 w-36 rounded-full" />
          <Skeleton className="h-11 w-80 max-w-full rounded-lg" />
          <Skeleton className="h-4 w-96 max-w-full rounded-md" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card/40 p-6 flex flex-col gap-4">
              <Skeleton className="h-6 w-24 rounded-lg" />
              <Skeleton className="h-10 w-32 rounded-lg" />
              <div className="flex flex-col gap-3 mt-2">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Skeleton key={j} className="h-4 w-full rounded-md" />
                ))}
              </div>
              <Skeleton className="h-11 w-full rounded-xl mt-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Profile page: header + account card + side card. */
export function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <Skeleton className="h-8 w-56 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 rounded-2xl border border-border bg-card/40 p-6 flex flex-col gap-6">
            <Skeleton className="h-6 w-32 rounded-lg" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-24 w-24 rounded-full" />
              <div className="flex flex-col gap-2">
                <Skeleton className="h-5 w-40 rounded-md" />
                <Skeleton className="h-4 w-56 rounded-md" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <Skeleton className="h-3 w-24 rounded-md" />
                  <Skeleton className="h-11 w-full rounded-xl" />
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-4 rounded-2xl border border-border bg-card/40 p-6 flex flex-col gap-4">
            <Skeleton className="h-6 w-28 rounded-lg" />
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Reports page: header card + action cards. */
export function ReportsSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 space-y-6">
        <div className="rounded-2xl border border-border bg-card/40 p-5 sm:p-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-11 w-11 rounded-2xl" />
            <div className="flex flex-col gap-2 flex-1">
              <Skeleton className="h-7 w-40 rounded-lg" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-28 rounded-full" />
                <Skeleton className="h-6 w-28 rounded-full" />
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-56 w-full rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-72 w-full rounded-2xl" />
      </div>
    </div>
  );
}

/**
 * Dispatches to the skeleton that matches the current route, so the loading
 * state follows the layout of the page the user is opening. Used by the auth
 * `RouteGuard`, which renders before the per-route `loading.tsx` can.
 */
export function PageSkeleton({ pathname }: { pathname: string }) {
  if (pathname === '/') return <DashboardSkeleton />;
  if (pathname.startsWith('/achievement')) return <AchievementSkeleton />;
  if (pathname.startsWith('/pricing')) return <PricingSkeleton />;
  if (pathname.startsWith('/profile')) return <ProfileSkeleton />;
  if (pathname.startsWith('/reports')) return <ReportsSkeleton />;
  // anime, games, genshin, shows, websites, kdrama, movies → media layout
  return <MediaPageSkeleton />;
}

export { CONTENT_WRAPPER };
