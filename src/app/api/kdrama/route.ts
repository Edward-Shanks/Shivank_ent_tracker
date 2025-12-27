import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { kdrama } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const allKDrama = await db.select().from(kdrama).where(eq(kdrama.userId, user.id));
    const parsed = allKDrama.map(item => ({
      ...item,
      genres: JSON.parse(item.genres || '[]'),
      cast: item.cast ? JSON.parse(item.cast) : undefined,
    }));
    return NextResponse.json(parsed);
  } catch (error) {
    console.error('Error fetching k-drama:', error);
    return NextResponse.json({ error: 'Failed to fetch k-drama' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const newKDrama = {
      id: nanoid(),
      userId: user.id,
      title: body.title,
      titleKorean: body.titleKorean,
      posterImage: body.posterImage,
      episodes: body.episodes || 0,
      episodesWatched: body.episodesWatched || 0,
      status: body.status,
      score: body.score,
      genres: JSON.stringify(body.genres || []),
      synopsis: body.synopsis,
      network: body.network,
      year: body.year,
      cast: body.cast ? JSON.stringify(body.cast) : null,
      notes: body.notes,
    };
    await db.insert(kdrama).values(newKDrama);
    return NextResponse.json({
      ...newKDrama,
      genres: body.genres || [],
      cast: body.cast,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating k-drama:', error);
    return NextResponse.json({ error: 'Failed to create k-drama' }, { status: 500 });
  }
}
