import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { games } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

export async function GET(request: NextRequest) {
  try {
    const userId = '1';
    const allGames = await db.select().from(games).where(eq(games.userId, userId));
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
    const body = await request.json();
    const userId = '1';
    const newGame = {
      id: nanoid(),
      userId,
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

