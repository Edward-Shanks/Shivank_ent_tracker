import { NextRequest, NextResponse } from 'next/server';
import { db, client } from '@/lib/db';
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

    // Select core columns first - exclude optional ones that might not exist
    const allGames = await db
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
      .where(eq(games.userId, user.id));
    
    // Try to get optional columns separately if they exist
    let gameTypes: Record<string, string | null> = {};
    let downloadUrls: Record<string, string | null> = {};
    let releaseDates: Record<string, string | null> = {};
    
    // Try gameType and downloadUrl
    try {
      const gamesWithExtras = await db
        .select({
          id: games.id,
          gameType: games.gameType,
          downloadUrl: games.downloadUrl,
        })
        .from(games)
        .where(eq(games.userId, user.id));
      gameTypes = Object.fromEntries(
        gamesWithExtras.map(g => [g.id, g.gameType])
      );
      downloadUrls = Object.fromEntries(
        gamesWithExtras.map(g => [g.id, g.downloadUrl])
      );
    } catch (e) {
      console.log('game_type/download_url columns not available, skipping');
    }
    
    // Try releaseDate separately
    try {
      const gamesWithReleaseDate = await db
        .select({
          id: games.id,
          releaseDate: games.releaseDate,
        })
        .from(games)
        .where(eq(games.userId, user.id));
      releaseDates = Object.fromEntries(
        gamesWithReleaseDate.map(g => [g.id, g.releaseDate])
      );
    } catch (e) {
      console.log('release_date column not available, skipping');
    }
    
    const parsed = allGames.map(item => {
      // Safely parse platform and genres
      let platform: string[] = [];
      let genres: string[] = [];
      
      try {
        platform = typeof item.platform === 'string' 
          ? JSON.parse(item.platform || '[]') 
          : (Array.isArray(item.platform) ? item.platform : []);
      } catch (e) {
        console.error('Error parsing platform for game:', item.id, e);
        platform = [];
      }
      
      try {
        genres = typeof item.genres === 'string' 
          ? JSON.parse(item.genres || '[]') 
          : (Array.isArray(item.genres) ? item.genres : []);
      } catch (e) {
        console.error('Error parsing genres for game:', item.id, e);
        genres = [];
      }
      
      return {
      ...item,
        platform,
        genres,
        releaseDate: releaseDates[item.id] || null,
        gameType: gameTypes[item.id] || null,
        downloadUrl: downloadUrls[item.id] || null,
      };
    });
    
    console.log(`Returning ${parsed.length} games`);
    return NextResponse.json(parsed);
  } catch (error: any) {
    // If game_type column doesn't exist, select without it
    const errorMessage = String(error?.message || error?.cause?.message || '');
    const errorCode = error?.cause?.code || error?.code || '';
    const errorString = JSON.stringify(error || {});
    
    if (errorCode === '42703' || 
        errorMessage.includes('game_type') || 
        errorMessage.includes('download_url') || 
        errorMessage.includes('does not exist') ||
        errorMessage.includes('Failed query') ||
        errorString.includes('game_type') ||
        errorString.includes('download_url')) {
      try {
        const user = await getCurrentUser();
        if (!user) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        const allGames = await db
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
          .where(eq(games.userId, user.id));
        
        const parsed = allGames.map(item => {
          // Safely parse platform and genres
          let platform: string[] = [];
          let genres: string[] = [];
          
          try {
            platform = typeof item.platform === 'string' 
              ? JSON.parse(item.platform || '[]') 
              : (Array.isArray(item.platform) ? item.platform : []);
          } catch (e) {
            console.error('Error parsing platform for game:', item.id, e);
            platform = [];
          }
          
          try {
            genres = typeof item.genres === 'string' 
              ? JSON.parse(item.genres || '[]') 
              : (Array.isArray(item.genres) ? item.genres : []);
          } catch (e) {
            console.error('Error parsing genres for game:', item.id, e);
            genres = [];
          }
          
          return {
            ...item,
            platform,
            genres,
            releaseDate: null,
            gameType: null,
            downloadUrl: null,
          };
        });
        
        console.log(`Returning ${parsed.length} games (fallback)`);
        return NextResponse.json(parsed);
      } catch (retryError) {
        console.error('Error fetching games (retry):', retryError);
        return NextResponse.json({ error: 'Failed to fetch games' }, { status: 500 });
      }
    }
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

    // Build the game data
    const gameId = nanoid();
    const platformJson = JSON.stringify(body.platform || []);
    const genresJson = JSON.stringify(body.genres || []);
    const coverImage = body.coverImage || 'https://via.placeholder.com/300x400?text=No+Image';
    const status = body.status || body.playStatus || 'planning';
    const notes = body.notes ? String(body.notes) : null;
    
    // Use raw SQL to have full control over which columns to insert
    // This avoids Drizzle trying to include all schema columns
    try {
      // First, try with optional columns if they exist
      const hasOptionalFields = body.releaseDate || body.gameType || body.downloadUrl;
      
      if (hasOptionalFields) {
        // Try inserting with optional columns
        await client`
          INSERT INTO games (id, user_id, title, cover_image, platform, status, genres, notes, release_date, game_type, download_url)
          VALUES (${gameId}, ${user.id}, ${body.title}, ${coverImage}, ${platformJson}, ${status}, ${genresJson}, ${notes}, ${body.releaseDate || null}, ${body.gameType || null}, ${body.downloadUrl || null})
        `;
      } else {
        // Insert without optional columns
        await client`
          INSERT INTO games (id, user_id, title, cover_image, platform, status, genres, notes)
          VALUES (${gameId}, ${user.id}, ${body.title}, ${coverImage}, ${platformJson}, ${status}, ${genresJson}, ${notes})
        `;
      }
    } catch (sqlError: any) {
      // If optional columns don't exist, try without them
      const errorMessage = String(sqlError?.message || sqlError?.cause?.message || '');
      const errorCode = sqlError?.cause?.code || sqlError?.code || '';
      
      if (errorCode === '42703' || errorMessage.includes('does not exist')) {
        // Optional columns don't exist, insert without them
        await client`
          INSERT INTO games (id, user_id, title, cover_image, platform, status, genres, notes)
          VALUES (${gameId}, ${user.id}, ${body.title}, ${coverImage}, ${platformJson}, ${status}, ${genresJson}, ${notes})
        `;
      } else {
        throw sqlError;
      }
    }
    
    const insertedGame = {
      id: gameId,
      userId: user.id,
      title: body.title,
      coverImage,
      platform: platformJson,
      status,
      genres: genresJson,
      notes,
      releaseDate: body.releaseDate || null,
      gameType: body.gameType || null,
      downloadUrl: body.downloadUrl || null,
    };
    
    // Return the created game with parsed arrays
    return NextResponse.json({
      ...insertedGame,
      platform: body.platform || [],
      genres: body.genres || [],
      status: insertedGame.status,
      releaseDate: body.releaseDate || null,
      gameType: body.gameType || null,
      downloadUrl: body.downloadUrl || null,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating game:', error);
    const errorMessage = error?.message || error?.cause?.message || 'Failed to create game';
    return NextResponse.json({ 
      error: 'Failed to create game',
      details: errorMessage 
    }, { status: 500 });
  }
}
