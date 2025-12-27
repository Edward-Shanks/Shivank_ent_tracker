import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { games } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const allGames = await db.select().from(games).where(eq(games.userId, user.id));
    const parsed = allGames.map(item => ({
      ...item,
      platform: JSON.parse(item.platform || '[]'),
      genres: JSON.parse(item.genres || '[]'),
    }));
    return NextResponse.json(parsed);
  } catch (error) {
    console.error('Error fetching games:', error);
    return NextResponse.json({ error: 'Failed to fetch games' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const newGame = {
      id: nanoid(),
      userId: user.id,
      title: body.title,
      coverImage: body.coverImage,
      platform: JSON.stringify(body.platform || []),
      status: body.status,
      hoursPlayed: body.hoursPlayed || 0,
      score: body.score,
      genres: JSON.stringify(body.genres || []),
      developer: body.developer,
      publisher: body.publisher,
      releaseDate: body.releaseDate,
      notes: body.notes,
    };
    await db.insert(games).values(newGame);
    return NextResponse.json({
      ...newGame,
      platform: body.platform || [],
      genres: body.genres || [],
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating game:', error);
    return NextResponse.json({ error: 'Failed to create game' }, { status: 500 });
  }
}
