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
    
    // Validate required fields
    if (!body.title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    if (!body.status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }
    if (!body.platform || (Array.isArray(body.platform) && body.platform.length === 0)) {
      return NextResponse.json({ error: 'At least one platform is required' }, { status: 400 });
    }

    const newGame = {
      id: nanoid(),
      userId: user.id,
      title: body.title,
      coverImage: body.coverImage || 'https://via.placeholder.com/300x400?text=No+Image',
      platform: JSON.stringify(body.platform || []),
      status: body.status || body.playStatus || 'planning', // Support both status and playStatus
      gameType: body.gameType || null,
      downloadUrl: body.downloadUrl || null,
      genres: JSON.stringify(body.genres || []),
      releaseDate: body.releaseDate || null,
      notes: body.notes || null,
    };
    
    await db.insert(games).values(newGame);
    
    return NextResponse.json({
      ...newGame,
      platform: body.platform || [],
      genres: body.genres || [],
      status: newGame.status, // Return status in response
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating game:', error);
    // Return more detailed error message
    const errorMessage = error?.message || 'Failed to create game';
    return NextResponse.json({ 
      error: 'Failed to create game',
      details: errorMessage 
    }, { status: 500 });
  }
}
