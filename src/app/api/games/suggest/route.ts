import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import type { GamePlatform } from '@/types';

const RAWG_API_KEY = process.env.RAWG_API_KEY || process.env.NEXT_PUBLIC_RAWG_API_KEY || '';

function mapToOurPlatform(name: string): GamePlatform {
  const n = (name || '').toLowerCase();
  if (n.includes('pc') || n === 'linux' || n === 'mac') return 'PC';
  if (n.includes('playstation') || n.includes('ps ')) return 'PlayStation';
  if (n.includes('xbox')) return 'Xbox';
  if (n.includes('nintendo') || n.includes('switch')) return 'Nintendo';
  if (n.includes('ios') || n.includes('android') || n.includes('mobile')) return 'Mobile';
  return 'Other';
}

export async function GET(request: NextRequest) {
  try {
    await getCurrentUser();
    const q = request.nextUrl.searchParams.get('q')?.trim();
    if (!q || q.length < 2) {
      return NextResponse.json({ error: 'Query too short' }, { status: 400 });
    }
    if (!RAWG_API_KEY) {
      return NextResponse.json({ coverImage: null, releaseDate: null, genres: [], platform: [], suggestDisabled: true });
    }
    const res = await fetch(
      `https://api.rawg.io/api/games?key=${encodeURIComponent(RAWG_API_KEY)}&search=${encodeURIComponent(q)}&page_size=1`
    );
    if (!res.ok) {
      return NextResponse.json({ coverImage: null, releaseDate: null, genres: [], platform: [], suggestDisabled: false });
    }
    const data = await res.json();
    const first = data?.results?.[0];
    if (!first) {
      return NextResponse.json({ coverImage: null, releaseDate: null, genres: [], platform: [] });
    }
    const platforms: GamePlatform[] = [];
    const seen = new Set<GamePlatform>();
    for (const p of first.platforms || []) {
      const name = p?.platform?.name;
      if (name) {
        const mapped = mapToOurPlatform(name);
        if (!seen.has(mapped)) {
          seen.add(mapped);
          platforms.push(mapped);
        }
      }
    }
    if (platforms.length === 0) platforms.push('Other');
    const genres = (first.genres || []).map((g: { name?: string }) => g?.name).filter(Boolean);
    const releaseDate = first.released || null;
    const coverImage = first.background_image || null;
    return NextResponse.json({ coverImage, releaseDate, genres, platform: platforms });
  } catch {
    return NextResponse.json({ coverImage: null, releaseDate: null, genres: [], platform: [], suggestDisabled: true });
  }
}
