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
    
    let allAnime, allMovies, allKDrama, allGames;
    
    // Fetch anime - select all columns explicitly
    try {
      allAnime = await db
        .select({
          id: anime.id,
          userId: anime.userId,
          title: anime.title,
          status: anime.status,
        })
        .from(anime)
        .where(eq(anime.userId, user.id));
    } catch (err: any) {
      console.error('Error fetching anime:', err);
      allAnime = [];
    }
    
    // Fetch movies - exclude review_type which might not exist
    try {
      allMovies = await db
        .select({
          id: movies.id,
          userId: movies.userId,
          title: movies.title,
          status: movies.status,
        })
        .from(movies)
        .where(eq(movies.userId, user.id));
    } catch (err: any) {
      console.error('Error fetching movies:', err);
      allMovies = [];
    }
    
    // Fetch kdrama
    try {
      allKDrama = await db
        .select({
          id: kdrama.id,
          userId: kdrama.userId,
          title: kdrama.title,
          status: kdrama.status,
        })
        .from(kdrama)
        .where(eq(kdrama.userId, user.id));
    } catch (err: any) {
      console.error('Error fetching kdrama:', err);
      allKDrama = [];
    }
    
    // Fetch games - exclude optional columns that might not exist
    try {
      allGames = await db
        .select({
          id: games.id,
          userId: games.userId,
          title: games.title,
          status: games.status,
        })
        .from(games)
        .where(eq(games.userId, user.id));
    } catch (err: any) {
      console.error('Error fetching games:', err);
      allGames = [];
    }
    
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
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch dashboard stats',
        details: error?.message || String(error),
        stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined
      },
      { status: 500 }
    );
  }
}
