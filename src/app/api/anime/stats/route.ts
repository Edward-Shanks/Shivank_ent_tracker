import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { anime } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

// GET /api/anime/stats - Get anime statistics
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const allAnime = await db.select().from(anime).where(eq(anime.userId, user.id));
    
    const parsedAnime = allAnime.map(item => ({
      ...item,
      genres: JSON.parse(item.genres || '[]'),
    }));
    
    const totalEpisodes = parsedAnime.reduce((acc, a) => acc + (a.episodesWatched || 0), 0);
    const scoresArray = parsedAnime.filter((a) => a.score).map((a) => a.score!);
    const meanScore = scoresArray.length > 0
      ? scoresArray.reduce((a, b) => a + b, 0) / scoresArray.length
      : 0;

    const statusCounts = {
      watching: parsedAnime.filter((a) => a.status === 'watching').length,
      completed: parsedAnime.filter((a) => a.status === 'completed').length,
      planning: parsedAnime.filter((a) => a.status === 'planning').length,
      dropped: parsedAnime.filter((a) => a.status === 'dropped').length,
      onHold: parsedAnime.filter((a) => a.status === 'on-hold').length,
    };

    const genreMap = new Map<string, number>();
    parsedAnime.forEach((a) => {
      a.genres.forEach((genre: string) => {
        genreMap.set(genre, (genreMap.get(genre) || 0) + 1);
      });
    });
    const genreDistribution = Array.from(genreMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);

    const scoreDistribution = Array.from({ length: 10 }, (_, i) => ({
      score: i + 1,
      count: parsedAnime.filter((a) => a.score === i + 1).length,
    }));

    const monthlyActivity = [
      { month: 'Jan', count: 12 },
      { month: 'Feb', count: 8 },
      { month: 'Mar', count: 15 },
      { month: 'Apr', count: 10 },
      { month: 'May', count: 18 },
      { month: 'Jun', count: 14 },
    ];

    return NextResponse.json({
      totalAnime: parsedAnime.length,
      totalEpisodes,
      meanScore: Math.round(meanScore * 10) / 10,
      ...statusCounts,
      genreDistribution,
      scoreDistribution,
      monthlyActivity,
    });
  } catch (error) {
    console.error('Error fetching anime stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch anime stats' },
      { status: 500 }
    );
  }
}
