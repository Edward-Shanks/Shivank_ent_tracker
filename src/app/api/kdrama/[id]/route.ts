import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { kdrama } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = '1';
    const result = await db.select().from(kdrama)
      .where(and(eq(kdrama.id, id), eq(kdrama.userId, userId))).limit(1);
    if (result.length === 0) {
      return NextResponse.json({ error: 'K-Drama not found' }, { status: 404 });
    }
    const item = result[0];
    return NextResponse.json({
      ...item,
      genres: JSON.parse(item.genres || '[]'),
      cast: item.cast ? JSON.parse(item.cast) : undefined,
    });
  } catch (error) {
    console.error('Error fetching k-drama:', error);
    return NextResponse.json({ error: 'Failed to fetch k-drama' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const userId = '1';
    const updateData: Record<string, unknown> = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.titleKorean !== undefined) updateData.titleKorean = body.titleKorean;
    if (body.posterImage !== undefined) updateData.posterImage = body.posterImage;
    if (body.episodes !== undefined) updateData.episodes = body.episodes;
    if (body.episodesWatched !== undefined) updateData.episodesWatched = body.episodesWatched;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.score !== undefined) updateData.score = body.score;
    if (body.genres !== undefined) updateData.genres = JSON.stringify(body.genres);
    if (body.synopsis !== undefined) updateData.synopsis = body.synopsis;
    if (body.network !== undefined) updateData.network = body.network;
    if (body.year !== undefined) updateData.year = body.year;
    if (body.cast !== undefined) updateData.cast = JSON.stringify(body.cast);
    if (body.notes !== undefined) updateData.notes = body.notes;
    updateData.updatedAt = new Date().toISOString();
    
    await db.update(kdrama).set(updateData)
      .where(and(eq(kdrama.id, id), eq(kdrama.userId, userId)));
    
    const updated = await db.select().from(kdrama)
      .where(and(eq(kdrama.id, id), eq(kdrama.userId, userId))).limit(1);
    
    if (updated.length === 0) {
      return NextResponse.json({ error: 'K-Drama not found' }, { status: 404 });
    }
    
    const item = updated[0];
    return NextResponse.json({
      ...item,
      genres: JSON.parse(item.genres || '[]'),
      cast: item.cast ? JSON.parse(item.cast) : undefined,
    });
  } catch (error) {
    console.error('Error updating k-drama:', error);
    return NextResponse.json({ error: 'Failed to update k-drama' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = '1';
    await db.delete(kdrama)
      .where(and(eq(kdrama.id, id), eq(kdrama.userId, userId)));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting k-drama:', error);
    return NextResponse.json({ error: 'Failed to delete k-drama' }, { status: 500 });
  }
}
