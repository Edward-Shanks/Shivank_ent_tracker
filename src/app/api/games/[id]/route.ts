import { NextRequest, NextResponse } from 'next/server';
import { db, client } from '@/lib/db';
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
    // Select core columns first
    const result = await db
      .select({
        id: games.id,
        userId: games.userId,
        title: games.title,
        coverImage: games.coverImage,
        platform: games.platform,
        status: games.status,
        genres: games.genres,
        notes: games.notes,
        createdAt: games.createdAt,
        updatedAt: games.updatedAt,
      })
      .from(games)
      .where(and(eq(games.id, id), eq(games.userId, user.id)))
      .limit(1);
    
    // Try to get optional columns separately
    let gameType: string | null = null;
    let downloadUrl: string | null = null;
    let releaseDate: string | null = null;
    
    if (result.length > 0) {
      try {
        const gameWithExtras = await db
          .select({
            id: games.id,
            gameType: games.gameType,
            downloadUrl: games.downloadUrl,
            releaseDate: games.releaseDate,
          })
          .from(games)
          .where(and(eq(games.id, id), eq(games.userId, user.id)))
          .limit(1);
        
        if (gameWithExtras.length > 0) {
          gameType = gameWithExtras[0].gameType;
          downloadUrl = gameWithExtras[0].downloadUrl;
          releaseDate = gameWithExtras[0].releaseDate;
        }
      } catch (e) {
        // Optional columns don't exist, that's fine
        console.log('Optional columns not available for game:', id);
      }
    }
    if (result.length === 0) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }
    const item = result[0];
    
    // Safely parse platform and genres
    let platform: string[] = [];
    let genres: string[] = [];
    
    try {
      platform = typeof item.platform === 'string' 
        ? JSON.parse(item.platform || '[]') 
        : (Array.isArray(item.platform) ? item.platform : []);
    } catch (e) {
      console.error('Error parsing platform:', e);
      platform = [];
    }
    
    try {
      genres = typeof item.genres === 'string' 
        ? JSON.parse(item.genres || '[]') 
        : (Array.isArray(item.genres) ? item.genres : []);
    } catch (e) {
      console.error('Error parsing genres:', e);
      genres = [];
    }
    
    return NextResponse.json({
      ...item,
      platform,
      genres,
      releaseDate,
      gameType,
      downloadUrl,
    });
  } catch (error: any) {
    // If game_type column doesn't exist, select without it
    if (error?.cause?.code === '42703' && error?.cause?.message?.includes('game_type')) {
      try {
        const user = await getCurrentUser();
        if (!user) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const { id } = await params;
        const result = await db
          .select({
            id: games.id,
            userId: games.userId,
            title: games.title,
            coverImage: games.coverImage,
            platform: games.platform,
            status: games.status,
            genres: games.genres,
            notes: games.notes,
            createdAt: games.createdAt,
            updatedAt: games.updatedAt,
          })
          .from(games)
          .where(and(eq(games.id, id), eq(games.userId, user.id)))
          .limit(1);
        if (result.length === 0) {
          return NextResponse.json({ error: 'Game not found' }, { status: 404 });
        }
        const item = result[0];
        
        // Safely parse platform and genres
        let platform: string[] = [];
        let genres: string[] = [];
        
        try {
          platform = typeof item.platform === 'string' 
            ? JSON.parse(item.platform || '[]') 
            : (Array.isArray(item.platform) ? item.platform : []);
        } catch (e) {
          platform = [];
        }
        
        try {
          genres = typeof item.genres === 'string' 
            ? JSON.parse(item.genres || '[]') 
            : (Array.isArray(item.genres) ? item.genres : []);
        } catch (e) {
          genres = [];
        }
        
        return NextResponse.json({
          ...item,
          platform,
          genres,
          releaseDate: null,
          gameType: null,
          downloadUrl: null,
        });
      } catch (retryError) {
        console.error('Error fetching game (retry):', retryError);
        return NextResponse.json({ error: 'Failed to fetch game' }, { status: 500 });
      }
    }
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
    
    // Build update object - separate core and optional fields
    const coreUpdateData: Record<string, unknown> = {};
    const optionalUpdateData: Record<string, unknown> = {};
    
    if (body.title !== undefined) coreUpdateData.title = body.title;
    if (body.coverImage !== undefined) coreUpdateData.coverImage = body.coverImage;
    if (body.platform !== undefined) coreUpdateData.platform = JSON.stringify(body.platform);
    if (body.status !== undefined) coreUpdateData.status = body.status;
    if (body.genres !== undefined) coreUpdateData.genres = JSON.stringify(body.genres);
    if (body.notes !== undefined) coreUpdateData.notes = body.notes || null;
    
    // Optional columns
    if (body.releaseDate !== undefined) optionalUpdateData.releaseDate = body.releaseDate || null;
    if (body.gameType !== undefined) optionalUpdateData.gameType = body.gameType || null;
    if (body.downloadUrl !== undefined) optionalUpdateData.downloadUrl = body.downloadUrl || null;
    
    // Always update updated_at
    coreUpdateData.updatedAt = new Date();
    
    if (Object.keys(coreUpdateData).length === 0 && Object.keys(optionalUpdateData).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }
    
    // Try updating with optional columns first
    try {
      const allUpdateData = { ...coreUpdateData, ...optionalUpdateData };
      await db.update(games).set(allUpdateData)
        .where(and(eq(games.id, id), eq(games.userId, user.id)));
    } catch (updateError: any) {
      // If optional columns don't exist, try without them
      const errorMessage = String(updateError?.message || updateError?.cause?.message || '');
      const errorCode = updateError?.cause?.code || updateError?.code || '';
      
      if (errorCode === '42703' || errorMessage.includes('does not exist')) {
        // Optional columns don't exist, update without them
        await db.update(games).set(coreUpdateData)
          .where(and(eq(games.id, id), eq(games.userId, user.id)));
      } else {
        throw updateError;
      }
    }
    
    // Select core columns first
    const updated = await db
      .select({
        id: games.id,
        userId: games.userId,
        title: games.title,
        coverImage: games.coverImage,
        platform: games.platform,
        status: games.status,
        genres: games.genres,
        notes: games.notes,
        createdAt: games.createdAt,
        updatedAt: games.updatedAt,
      })
      .from(games)
      .where(and(eq(games.id, id), eq(games.userId, user.id)))
      .limit(1);
    
    // Try to get optional columns
    let gameType: string | null = null;
    let downloadUrl: string | null = null;
    let releaseDate: string | null = null;
    
    try {
      const gameWithExtras = await db
        .select({
          id: games.id,
          gameType: games.gameType,
          downloadUrl: games.downloadUrl,
          releaseDate: games.releaseDate,
        })
        .from(games)
        .where(and(eq(games.id, id), eq(games.userId, user.id)))
        .limit(1);
      
      if (gameWithExtras.length > 0) {
        gameType = gameWithExtras[0].gameType;
        downloadUrl = gameWithExtras[0].downloadUrl;
        releaseDate = gameWithExtras[0].releaseDate;
      }
    } catch (e) {
      // Optional columns don't exist
    }
    
    if (updated.length === 0) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }
    
    const item = updated[0];
    
    // Safely parse platform and genres
    let platform: string[] = [];
    let genres: string[] = [];
    
    try {
      platform = typeof item.platform === 'string' 
        ? JSON.parse(item.platform || '[]') 
        : (Array.isArray(item.platform) ? item.platform : []);
    } catch (e) {
      platform = [];
    }
    
    try {
      genres = typeof item.genres === 'string' 
        ? JSON.parse(item.genres || '[]') 
        : (Array.isArray(item.genres) ? item.genres : []);
    } catch (e) {
      genres = [];
    }
    
    return NextResponse.json({
      ...item,
      platform,
      genres,
      releaseDate,
      gameType,
      downloadUrl,
    });
  } catch (error: any) {
    // If game_type column doesn't exist, handle gracefully
    if (error?.cause?.code === '42703' && error?.cause?.message?.includes('game_type')) {
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
        // Skip gameType and downloadUrl if columns don't exist
        if (body.genres !== undefined) updateData.genres = JSON.stringify(body.genres);
        if (body.releaseDate !== undefined) updateData.releaseDate = body.releaseDate;
        if (body.notes !== undefined) updateData.notes = body.notes;
        updateData.updatedAt = new Date().toISOString();
        
        await db.update(games).set(updateData)
          .where(and(eq(games.id, id), eq(games.userId, user.id)));
        
        const updated = await db
          .select({
            id: games.id,
            userId: games.userId,
            title: games.title,
            coverImage: games.coverImage,
            platform: games.platform,
            status: games.status,
            genres: games.genres,
            notes: games.notes,
            createdAt: games.createdAt,
            updatedAt: games.updatedAt,
          })
          .from(games)
          .where(and(eq(games.id, id), eq(games.userId, user.id)))
          .limit(1);
        
        if (updated.length === 0) {
          return NextResponse.json({ error: 'Game not found' }, { status: 404 });
        }
        
        const item = updated[0];
        
        // Safely parse platform and genres
        let platform: string[] = [];
        let genres: string[] = [];
        
        try {
          platform = typeof item.platform === 'string' 
            ? JSON.parse(item.platform || '[]') 
            : (Array.isArray(item.platform) ? item.platform : []);
        } catch (e) {
          platform = [];
        }
        
        try {
          genres = typeof item.genres === 'string' 
            ? JSON.parse(item.genres || '[]') 
            : (Array.isArray(item.genres) ? item.genres : []);
        } catch (e) {
          genres = [];
        }
        
        return NextResponse.json({
          ...item,
          platform,
          genres,
          releaseDate: null,
          gameType: null,
          downloadUrl: null,
        });
      } catch (retryError) {
        console.error('Error updating game (retry):', retryError);
        return NextResponse.json({ error: 'Failed to update game' }, { status: 500 });
      }
    }
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
