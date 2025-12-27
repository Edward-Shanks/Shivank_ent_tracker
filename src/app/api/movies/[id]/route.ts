import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { movies } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = '1';
    const result = await db
      .select()
      .from(movies)
      .where(and(eq(movies.id, id), eq(movies.userId, userId)))
      .limit(1);
    if (result.length === 0) {
      return NextResponse.json({ error: 'Movie not found' }, { status: 404 });
    }
    const item = result[0];
    return NextResponse.json({
      ...item,
      genres: JSON.parse(item.genres || '[]'),
      cast: item.cast ? JSON.parse(item.cast) : undefined,
    });
  } catch (error) {
    console.error('Error fetching movie:', error);
    return NextResponse.json({ error: 'Failed to fetch movie' }, { status: 500 });
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
    if (body.posterImage !== undefined) updateData.posterImage = body.posterImage;
    if (body.backdropImage !== undefined) updateData.backdropImage = body.backdropImage;
    if (body.releaseDate !== undefined) updateData.releaseDate = body.releaseDate;
    if (body.runtime !== undefined) updateData.runtime = body.runtime;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.score !== undefined) updateData.score = body.score;
    if (body.genres !== undefined) updateData.genres = JSON.stringify(body.genres);
    if (body.synopsis !== undefined) updateData.synopsis = body.synopsis;
    if (body.director !== undefined) updateData.director = body.director;
    if (body.cast !== undefined) updateData.cast = JSON.stringify(body.cast);
    if (body.notes !== undefined) updateData.notes = body.notes;
    updateData.updatedAt = new Date().toISOString();
    
    await db.update(movies).set(updateData)
      .where(and(eq(movies.id, id), eq(movies.userId, userId)));
    
    const updated = await db.select().from(movies)
      .where(and(eq(movies.id, id), eq(movies.userId, userId))).limit(1);
    
    if (updated.length === 0) {
      return NextResponse.json({ error: 'Movie not found' }, { status: 404 });
    }
    
    const item = updated[0];
    return NextResponse.json({
      ...item,
      genres: JSON.parse(item.genres || '[]'),
      cast: item.cast ? JSON.parse(item.cast) : undefined,
    });
  } catch (error) {
    console.error('Error updating movie:', error);
    return NextResponse.json({ error: 'Failed to update movie' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = '1';
    await db.delete(movies)
      .where(and(eq(movies.id, id), eq(movies.userId, userId)));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting movie:', error);
    return NextResponse.json({ error: 'Failed to delete movie' }, { status: 500 });
  }
}
