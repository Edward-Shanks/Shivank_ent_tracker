import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { anime, movies, kdrama, games } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

// GET /api/dashboard/stats - Get dashboard statistics
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const [allAnime, allMovies, allKDrama, allGames] = await Promise.all([
      db.select().from(anime).where(eq(anime.userId, user.id)),
      db.select().from(movies).where(eq(movies.userId, user.id)),
      db.select().from(kdrama).where(eq(kdrama.userId, user.id)),
      db.select().from(games).where(eq(games.userId, user.id)),
    ]);
    
    return NextResponse.json({
      anime: {
        total: allAnime.length,
        watching: allAnime.filter((a) => a.status === 'watching').length,
      },
      movies: {
        total: allMovies.length,
        watched: allMovies.filter((m) => m.status === 'watched').length,
      },
      kdrama: {
        total: allKDrama.length,
        watching: allKDrama.filter((k) => k.status === 'watching').length,
      },
      games: {
        total: allGames.length,
        playing: allGames.filter((g) => g.status === 'playing').length,
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
