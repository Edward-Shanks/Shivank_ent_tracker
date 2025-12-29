import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { movies } from '@/lib/db/schema';
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
    const result = await db
      .select({
        id: movies.id,
        userId: movies.userId,
        title: movies.title,
        posterImage: movies.posterImage,
        backdropImage: movies.backdropImage,
        releaseDate: movies.releaseDate,
        status: movies.status,
        genres: movies.genres,
        synopsis: movies.synopsis,
        notes: movies.notes,
        createdAt: movies.createdAt,
        updatedAt: movies.updatedAt,
        reviewType: movies.reviewType,
      })
      .from(movies)
      .where(and(eq(movies.id, id), eq(movies.userId, user.id)))
      .limit(1);
    if (result.length === 0) {
      return NextResponse.json({ error: 'Movie not found' }, { status: 404 });
    }
    const item = result[0];
    return NextResponse.json({
      ...item,
      genres: JSON.parse(item.genres || '[]'),
    });
  } catch (error: any) {
    // If review_type column doesn't exist, select without it
    if (error?.cause?.code === '42703' && error?.cause?.message?.includes('review_type')) {
      try {
        const user = await getCurrentUser();
        if (!user) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const { id } = await params;
        const result = await db
          .select({
            id: movies.id,
            userId: movies.userId,
            title: movies.title,
            posterImage: movies.posterImage,
            backdropImage: movies.backdropImage,
            releaseDate: movies.releaseDate,
            status: movies.status,
            genres: movies.genres,
            synopsis: movies.synopsis,
            notes: movies.notes,
            createdAt: movies.createdAt,
            updatedAt: movies.updatedAt,
          })
          .from(movies)
          .where(and(eq(movies.id, id), eq(movies.userId, user.id)))
          .limit(1);
        if (result.length === 0) {
          return NextResponse.json({ error: 'Movie not found' }, { status: 404 });
        }
        const item = result[0];
        return NextResponse.json({
          ...item,
          genres: JSON.parse(item.genres || '[]'),
          reviewType: null,
        });
      } catch (retryError) {
        console.error('Error fetching movie (retry):', retryError);
        return NextResponse.json({ error: 'Failed to fetch movie' }, { status: 500 });
      }
    }
    console.error('Error fetching movie:', error);
    return NextResponse.json({ error: 'Failed to fetch movie' }, { status: 500 });
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
    if (body.posterImage !== undefined) updateData.posterImage = body.posterImage;
    if (body.backdropImage !== undefined) updateData.backdropImage = body.backdropImage;
    if (body.releaseDate !== undefined) updateData.releaseDate = body.releaseDate;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.reviewType !== undefined) updateData.reviewType = body.reviewType;
    if (body.genres !== undefined) updateData.genres = JSON.stringify(body.genres);
    if (body.synopsis !== undefined) updateData.synopsis = body.synopsis;
    if (body.notes !== undefined) updateData.notes = body.notes;
    updateData.updatedAt = new Date().toISOString();
    
    await db.update(movies).set(updateData)
      .where(and(eq(movies.id, id), eq(movies.userId, user.id)));
    
    const updated = await db
      .select({
        id: movies.id,
        userId: movies.userId,
        title: movies.title,
        posterImage: movies.posterImage,
        backdropImage: movies.backdropImage,
        releaseDate: movies.releaseDate,
        status: movies.status,
        genres: movies.genres,
        synopsis: movies.synopsis,
        notes: movies.notes,
        createdAt: movies.createdAt,
        updatedAt: movies.updatedAt,
        reviewType: movies.reviewType,
      })
      .from(movies)
      .where(and(eq(movies.id, id), eq(movies.userId, user.id)))
      .limit(1);
    
    if (updated.length === 0) {
      return NextResponse.json({ error: 'Movie not found' }, { status: 404 });
    }
    
    const item = updated[0];
    return NextResponse.json({
      ...item,
      genres: JSON.parse(item.genres || '[]'),
    });
  } catch (error: any) {
    // If review_type column doesn't exist, handle gracefully
    if (error?.cause?.code === '42703' && error?.cause?.message?.includes('review_type')) {
      try {
        const user = await getCurrentUser();
        if (!user) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const { id } = await params;
        const body = await request.json();
        const updateData: Record<string, unknown> = {};
        if (body.title !== undefined) updateData.title = body.title;
        if (body.posterImage !== undefined) updateData.posterImage = body.posterImage;
        if (body.backdropImage !== undefined) updateData.backdropImage = body.backdropImage;
        if (body.releaseDate !== undefined) updateData.releaseDate = body.releaseDate;
        if (body.status !== undefined) updateData.status = body.status;
        // Skip reviewType if column doesn't exist
        if (body.genres !== undefined) updateData.genres = JSON.stringify(body.genres);
        if (body.synopsis !== undefined) updateData.synopsis = body.synopsis;
        if (body.notes !== undefined) updateData.notes = body.notes;
        updateData.updatedAt = new Date().toISOString();
        
        await db.update(movies).set(updateData)
          .where(and(eq(movies.id, id), eq(movies.userId, user.id)));
        
        const updated = await db
          .select({
            id: movies.id,
            userId: movies.userId,
            title: movies.title,
            posterImage: movies.posterImage,
            backdropImage: movies.backdropImage,
            releaseDate: movies.releaseDate,
            status: movies.status,
            genres: movies.genres,
            synopsis: movies.synopsis,
            notes: movies.notes,
            createdAt: movies.createdAt,
            updatedAt: movies.updatedAt,
          })
          .from(movies)
          .where(and(eq(movies.id, id), eq(movies.userId, user.id)))
          .limit(1);
        
        if (updated.length === 0) {
          return NextResponse.json({ error: 'Movie not found' }, { status: 404 });
        }
        
        const item = updated[0];
        return NextResponse.json({
          ...item,
          genres: JSON.parse(item.genres || '[]'),
          reviewType: null,
        });
      } catch (retryError) {
        console.error('Error updating movie (retry):', retryError);
        return NextResponse.json({ error: 'Failed to update movie' }, { status: 500 });
      }
    }
    console.error('Error updating movie:', error);
    return NextResponse.json({ error: 'Failed to update movie' }, { status: 500 });
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
    await db.delete(movies)
      .where(and(eq(movies.id, id), eq(movies.userId, user.id)));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting movie:', error);
    return NextResponse.json({ error: 'Failed to delete movie' }, { status: 500 });
  }
}
