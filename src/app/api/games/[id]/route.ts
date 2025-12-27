import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { games } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const result = await db.select().from(games)
      .where(and(eq(games.id, id), eq(games.userId, user.id))).limit(1);
    if (result.length === 0) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }
    const item = result[0];
    return NextResponse.json({
      ...item,
      platform: JSON.parse(item.platform || '[]'),
      genres: JSON.parse(item.genres || '[]'),
    });
  } catch (error) {
    console.error('Error fetching game:', error);
    return NextResponse.json({ error: 'Failed to fetch game' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const updateData: Record<string, unknown> = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.coverImage !== undefined) updateData.coverImage = body.coverImage;
    if (body.platform !== undefined) updateData.platform = JSON.stringify(body.platform);
    if (body.status !== undefined) updateData.status = body.status;
    if (body.hoursPlayed !== undefined) updateData.hoursPlayed = body.hoursPlayed;
    if (body.score !== undefined) updateData.score = body.score;
    if (body.genres !== undefined) updateData.genres = JSON.stringify(body.genres);
    if (body.developer !== undefined) updateData.developer = body.developer;
    if (body.publisher !== undefined) updateData.publisher = body.publisher;
    if (body.releaseDate !== undefined) updateData.releaseDate = body.releaseDate;
    if (body.notes !== undefined) updateData.notes = body.notes;
    updateData.updatedAt = new Date().toISOString();
    
    await db.update(games).set(updateData)
      .where(and(eq(games.id, id), eq(games.userId, user.id)));
    
    const updated = await db.select().from(games)
      .where(and(eq(games.id, id), eq(games.userId, user.id))).limit(1);
    
    if (updated.length === 0) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }
    
    const item = updated[0];
    return NextResponse.json({
      ...item,
      platform: JSON.parse(item.platform || '[]'),
      genres: JSON.parse(item.genres || '[]'),
    });
  } catch (error) {
    console.error('Error updating game:', error);
    return NextResponse.json({ error: 'Failed to update game' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await db.delete(games)
      .where(and(eq(games.id, id), eq(games.userId, user.id)));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting game:', error);
    return NextResponse.json({ error: 'Failed to delete game' }, { status: 500 });
  }
}
