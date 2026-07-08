'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Home,
  Tv,
  Film,
  Gamepad2,
  Sparkles,
  Trophy,
  Globe,
  FileText,
  Search,
  ExternalLink,
  Clapperboard,
} from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';
import { useData } from '@/context/DataContext';

const pages = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/anime', label: 'Anime', icon: Tv },
  { href: '/shows', label: 'Movies & K-Drama', icon: Film },
  { href: '/games', label: 'Games', icon: Gamepad2 },
  { href: '/genshin', label: 'Genshin', icon: Sparkles },
  { href: '/achievement', label: 'Achievements', icon: Trophy },
  { href: '/websites', label: 'Websites', icon: Globe },
  { href: '/reports', label: 'Reports', icon: FileText },
];

// Cap per-group results so a large library stays scannable in the palette.
const MAX_RESULTS = 6;

/**
 * Global search / quick-navigation palette (Cmd+K / Ctrl+K).
 * Searches every collection from DataContext and jumps to pages.
 */
export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const router = useRouter();
  const { anime, movies, kdrama, games, websites } = useData();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const go = useCallback(
    (href: string) => {
      setOpen(false);
      setQuery('');
      router.push(href);
    },
    [router]
  );

  const q = query.trim().toLowerCase();
  const hasQuery = q.length >= 2;

  const match = (...fields: (string | undefined)[]) =>
    fields.some((f) => f && f.toLowerCase().includes(q));

  const animeResults = hasQuery
    ? anime.filter((a) => match(a.title, a.titleJapanese, a.animeOtherName)).slice(0, MAX_RESULTS)
    : [];
  const movieResults = hasQuery
    ? movies.filter((m) => match(m.title)).slice(0, MAX_RESULTS)
    : [];
  const kdramaResults = hasQuery
    ? kdrama.filter((k) => match(k.title, k.titleKorean)).slice(0, MAX_RESULTS)
    : [];
  const gameResults = hasQuery
    ? games.filter((g) => match(g.title)).slice(0, MAX_RESULTS)
    : [];
  const websiteResults = hasQuery
    ? websites.filter((w) => match(w.name, w.url)).slice(0, MAX_RESULTS)
    : [];

  const totalResults =
    animeResults.length +
    movieResults.length +
    kdramaResults.length +
    gameResults.length +
    websiteResults.length;

  return (
    <>
      {/* Floating trigger, top-right */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Search everything (Cmd+K)"
        className="fixed top-4 right-4 z-40 flex items-center gap-2 px-3 py-2 rounded-full glass border border-white/10 text-foreground-muted hover:text-foreground hover:border-white/25 transition-all duration-200 backdrop-blur-xl shadow-lg"
      >
        <Search className="w-4 h-4" />
        <span className="hidden sm:inline text-sm">Search</span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white/10 text-[10px] font-mono text-foreground-muted">
          ⌘K
        </kbd>
      </button>

      <CommandDialog
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) setQuery('');
        }}
        title="Search everything"
        description="Search your collections or jump to a page"
        commandProps={{ shouldFilter: false }}
      >
        <CommandInput
          placeholder="Search anime, movies, games, websites…"
          value={query}
          onValueChange={setQuery}
        />
        <CommandList className="max-h-[400px]">
          <CommandEmpty>
            {hasQuery ? 'No results found.' : 'Type at least 2 characters to search your library.'}
          </CommandEmpty>

          <>
              {animeResults.length > 0 && (
                <CommandGroup heading="Anime">
                  {animeResults.map((a) => (
                    <CommandItem key={`anime-${a.id}`} value={`anime-${a.id}`} onSelect={() => go('/anime')}>
                      <Tv />
                      <span className="truncate">{a.title}</span>
                      <CommandShortcut>{a.watchStatus}</CommandShortcut>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {movieResults.length > 0 && (
                <CommandGroup heading="Movies">
                  {movieResults.map((m) => (
                    <CommandItem key={`movie-${m.id}`} value={`movie-${m.id}`} onSelect={() => go('/shows')}>
                      <Clapperboard />
                      <span className="truncate">{m.title}</span>
                      <CommandShortcut>{m.status}</CommandShortcut>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {kdramaResults.length > 0 && (
                <CommandGroup heading="K-Drama">
                  {kdramaResults.map((k) => (
                    <CommandItem key={`kdrama-${k.id}`} value={`kdrama-${k.id}`} onSelect={() => go('/shows')}>
                      <Film />
                      <span className="truncate">{k.title}</span>
                      <CommandShortcut>{k.status}</CommandShortcut>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {gameResults.length > 0 && (
                <CommandGroup heading="Games">
                  {gameResults.map((g) => (
                    <CommandItem key={`game-${g.id}`} value={`game-${g.id}`} onSelect={() => go('/games')}>
                      <Gamepad2 />
                      <span className="truncate">{g.title}</span>
                      <CommandShortcut>{g.status}</CommandShortcut>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {websiteResults.length > 0 && (
                <CommandGroup heading="Websites">
                  {websiteResults.map((w) => (
                    <CommandItem
                      key={`site-${w.id}`}
                      value={`site-${w.id}`}
                      onSelect={() => {
                        setOpen(false);
                        setQuery('');
                        window.open(w.url, '_blank', 'noopener,noreferrer');
                      }}
                    >
                      <ExternalLink />
                      <span className="truncate">{w.name}</span>
                      <CommandShortcut>{w.category}</CommandShortcut>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {hasQuery && totalResults > 0 && <CommandSeparator />}

              {(() => {
                const pageMatches = hasQuery
                  ? pages.filter((p) => p.label.toLowerCase().includes(q))
                  : pages;
                if (pageMatches.length === 0) return null;
                return (
                  <CommandGroup heading="Go to page">
                    {pageMatches.map((p) => {
                      const Icon = p.icon;
                      return (
                        <CommandItem key={p.href} value={`page-${p.href}`} onSelect={() => go(p.href)}>
                          <Icon />
                          <span>{p.label}</span>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                );
              })()}
          </>
        </CommandList>
      </CommandDialog>
    </>
  );
}
