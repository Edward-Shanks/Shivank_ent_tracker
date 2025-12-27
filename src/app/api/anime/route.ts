import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { anime } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { getCurrentUser } from '@/lib/auth';

// GET /api/anime - Get all anime for current user
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const allAnime = await db.select().from(anime).where(eq(anime.userId, user.id));
    
    // Parse JSON fields
    const parsedAnime = allAnime.map(item => ({
      ...item,
      genres: JSON.parse(item.genres || '[]'),
    }));
    
    return NextResponse.json(parsedAnime);
  } catch (error) {
    console.error('Error fetching anime:', error);
    return NextResponse.json(
      { error: 'Failed to fetch anime' },
      { status: 500 }
    );
  }
}

// POST /api/anime - Create new anime
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    const newAnime = {
      id: nanoid(),
      userId: user.id,
      title: body.title,
      titleJapanese: body.titleJapanese,
      animeOtherName: body.animeOtherName,
      animeType: body.animeType,
      airingStatus: body.airingStatus,
      watchStatus: body.watchStatus,
      websiteLink: body.websiteLink,
      episodeOn: body.episodeOn,
      coverImage: body.coverImage,
      bannerImage: body.bannerImage,
      episodes: body.episodes || 0,
      episodesWatched: body.episodesWatched || 0,
      status: body.status,
      score: body.score,
      genres: JSON.stringify(body.genres || []),
      synopsis: body.synopsis,
      season: body.season,
      year: body.year,
      startDate: body.startDate,
      endDate: body.endDate,
      notes: body.notes,
    };
    
    await db.insert(anime).values(newAnime);
    
    return NextResponse.json({
      ...newAnime,
      genres: body.genres || [],
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating anime:', error);
    return NextResponse.json(
      { error: 'Failed to create anime' },
      { status: 500 }
    );
  }
}
