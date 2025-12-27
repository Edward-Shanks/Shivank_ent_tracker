import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { anime, movies, kdrama, games } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// GET /api/dashboard/stats - Get dashboard statistics
export async function GET(request: NextRequest) {
  try {
    const userId = '1';
    
    const [allAnime, allMovies, allKDrama, allGames] = await Promise.all([
      db.select().from(anime).where(eq(anime.userId, userId)),
      db.select().from(movies).where(eq(movies.userId, userId)),
      db.select().from(kdrama).where(eq(kdrama.userId, userId)),
      db.select().from(games).where(eq(games.userId, userId)),
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

