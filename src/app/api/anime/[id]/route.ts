import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { anime } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

// GET /api/anime/[id] - Get single anime
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
      .select()
      .from(anime)
      .where(and(eq(anime.id, id), eq(anime.userId, user.id)))
      .limit(1);
    
    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Anime not found' },
        { status: 404 }
      );
    }
    
    const item = result[0];
    return NextResponse.json({
      ...item,
      genres: JSON.parse(item.genres || '[]'),
    });
  } catch (error) {
    console.error('Error fetching anime:', error);
    return NextResponse.json(
      { error: 'Failed to fetch anime' },
      { status: 500 }
    );
  }
}

// PATCH /api/anime/[id] - Update anime
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
    if (body.titleJapanese !== undefined) updateData.titleJapanese = body.titleJapanese || null;
    if (body.animeOtherName !== undefined) updateData.animeOtherName = body.animeOtherName || null;
    if (body.animeType !== undefined) updateData.animeType = body.animeType;
    if (body.airingStatus !== undefined) updateData.airingStatus = body.airingStatus;
    if (body.watchStatus !== undefined) updateData.watchStatus = body.watchStatus;
    if (body.websiteLink !== undefined) updateData.websiteLink = body.websiteLink || null;
    if (body.episodeOn !== undefined) updateData.episodeOn = body.episodeOn || null;
    if (body.coverImage !== undefined) updateData.coverImage = body.coverImage;
    if (body.bannerImage !== undefined) updateData.bannerImage = body.bannerImage || null;
    if (body.episodes !== undefined) updateData.episodes = body.episodes;
    if (body.episodesWatched !== undefined) updateData.episodesWatched = body.episodesWatched;
    if (body.score !== undefined) updateData.score = body.score || null;
    if (body.genres !== undefined) updateData.genres = JSON.stringify(body.genres || []);
    if (body.synopsis !== undefined) updateData.synopsis = body.synopsis || null;
    if (body.season !== undefined) updateData.season = body.season || null;
    if (body.year !== undefined) updateData.year = body.year || null;
    if (body.startDate !== undefined) updateData.startDate = body.startDate || null;
    if (body.endDate !== undefined) updateData.endDate = body.endDate || null;
    if (body.notes !== undefined) updateData.notes = body.notes || null;
    updateData.updatedAt = new Date();
    
    await db
      .update(anime)
      .set(updateData)
      .where(and(eq(anime.id, id), eq(anime.userId, user.id)));
    
    const updated = await db
      .select()
      .from(anime)
      .where(and(eq(anime.id, id), eq(anime.userId, user.id)))
      .limit(1);
    
    if (updated.length === 0) {
      return NextResponse.json(
        { error: 'Anime not found' },
        { status: 404 }
      );
    }
    
    const item = updated[0];
    return NextResponse.json({
      ...item,
      genres: JSON.parse(item.genres || '[]'),
    });
  } catch (error) {
    console.error('Error updating anime:', error);
    return NextResponse.json(
      { error: 'Failed to update anime' },
      { status: 500 }
    );
  }
}

// DELETE /api/anime/[id] - Delete anime
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
    
    await db
      .delete(anime)
      .where(and(eq(anime.id, id), eq(anime.userId, user.id)));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting anime:', error);
    return NextResponse.json(
      { error: 'Failed to delete anime' },
      { status: 500 }
    );
  }
}
