import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { movies } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Select without reviewType initially to avoid errors if column doesn't exist
    // We'll try to get it separately if needed
    const allMovies = await db
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
      .where(eq(movies.userId, user.id));
    
    // Try to get reviewType separately if column exists
    let reviewTypes: Record<string, string | null> = {};
    try {
      const moviesWithReviewType = await db
        .select({
          id: movies.id,
          reviewType: movies.reviewType,
        })
        .from(movies)
        .where(eq(movies.userId, user.id));
      reviewTypes = Object.fromEntries(
        moviesWithReviewType.map(m => [m.id, m.reviewType])
      );
    } catch (e) {
      // Column doesn't exist, that's fine - reviewTypes will remain empty
      console.log('review_type column not available, skipping');
    }
    
    const parsed = allMovies.map(item => ({
      ...item,
      genres: JSON.parse(item.genres || '[]'),
      reviewType: reviewTypes[item.id] || null,
    }));
    return NextResponse.json(parsed);
  } catch (error: any) {
    // If review_type column doesn't exist, select without it
    const errorMessage = String(error?.message || error?.cause?.message || '');
    const errorCode = error?.cause?.code || error?.code || '';
    const errorString = JSON.stringify(error || {});
    
    if (errorCode === '42703' || 
        errorMessage.includes('review_type') || 
        errorMessage.includes('does not exist') ||
        errorMessage.includes('Failed query') ||
        errorString.includes('review_type')) {
      try {
        const user = await getCurrentUser();
        if (!user) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        const allMovies = await db
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
          .where(eq(movies.userId, user.id));
        
        const parsed = allMovies.map(item => ({
          ...item,
          genres: JSON.parse(item.genres || '[]'),
          reviewType: null, // Add default value
        }));
        return NextResponse.json(parsed);
      } catch (retryError) {
        console.error('Error fetching movies (retry):', retryError);
        return NextResponse.json({ error: 'Failed to fetch movies' }, { status: 500 });
      }
    }
    console.error('Error fetching movies:', error);
    return NextResponse.json({ error: 'Failed to fetch movies' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const newMovie: Record<string, unknown> = {
      id: nanoid(),
      userId: user.id,
      title: body.title,
      posterImage: body.posterImage,
      backdropImage: body.backdropImage || null,
      releaseDate: body.releaseDate,
      status: body.status,
      genres: JSON.stringify(body.genres || []),
      synopsis: body.synopsis || null,
      notes: body.notes || null,
    };
    
    // Only include reviewType if provided (column may not exist in DB)
    if (body.reviewType !== undefined) {
      newMovie.reviewType = body.reviewType;
    }
    
    await db.insert(movies).values(newMovie);
    return NextResponse.json({
      ...newMovie,
      genres: body.genres || [],
      reviewType: body.reviewType || null,
    }, { status: 201 });
  } catch (error: any) {
    // If review_type column doesn't exist, retry without it
    if (error?.cause?.code === '42703' && error?.cause?.message?.includes('review_type')) {
      try {
        const user = await getCurrentUser();
        if (!user) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const body = await request.json();
        const newMovie = {
          id: nanoid(),
          userId: user.id,
          title: body.title,
          posterImage: body.posterImage,
          backdropImage: body.backdropImage || null,
          releaseDate: body.releaseDate,
          status: body.status,
          genres: JSON.stringify(body.genres || []),
          synopsis: body.synopsis || null,
          notes: body.notes || null,
        };
        await db.insert(movies).values(newMovie);
        return NextResponse.json({
          ...newMovie,
          genres: body.genres || [],
          reviewType: null,
        }, { status: 201 });
      } catch (retryError) {
        console.error('Error creating movie (retry):', retryError);
        return NextResponse.json({ error: 'Failed to create movie' }, { status: 500 });
      }
    }
    console.error('Error creating movie:', error);
    return NextResponse.json({ error: 'Failed to create movie' }, { status: 500 });
  }
}
