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

    // Calculate watch status counts
    const watchStatusCounts = {
      ytw: parsedAnime.filter((a) => a.watchStatus === 'YTW').length,
      watching: parsedAnime.filter((a) => a.watchStatus === 'Watching').length,
      watchLater: parsedAnime.filter((a) => a.watchStatus === 'Watch Later').length,
      completed: parsedAnime.filter((a) => a.watchStatus === 'Completed').length,
      onHold: parsedAnime.filter((a) => a.watchStatus === 'On Hold').length,
      dropped: parsedAnime.filter((a) => a.watchStatus === 'Dropped').length,
    };

    // Calculate airing status counts
    const airingStatusCounts = {
      yta: parsedAnime.filter((a) => a.airingStatus === 'YTA').length,
      airing: parsedAnime.filter((a) => a.airingStatus === 'Airing').length,
      completed: parsedAnime.filter((a) => a.airingStatus === 'Completed').length,
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

    // Calculate monthly activity from actual data
    const monthlyActivityMap = new Map<string, number>();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Get last 6 months
    const now = new Date();
    const last6Months: { month: string; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      last6Months.push({
        month: monthNames[date.getMonth()],
        count: 0,
      });
      monthlyActivityMap.set(monthKey, 0);
    }
    
    // Count anime added in each month
    parsedAnime.forEach((a) => {
      if (a.createdAt) {
        const date = new Date(a.createdAt);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const current = monthlyActivityMap.get(monthKey) || 0;
        monthlyActivityMap.set(monthKey, current + 1);
      }
    });
    
    // Map to the last 6 months array
    const monthlyActivity = last6Months.map((item, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      return {
        month: item.month,
        count: monthlyActivityMap.get(monthKey) || 0,
      };
    });

    return NextResponse.json({
      totalAnime: parsedAnime.length,
      totalEpisodes,
      meanScore: Math.round(meanScore * 10) / 10,
      ...statusCounts,
      watchStatusCounts,
      airingStatusCounts,
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
