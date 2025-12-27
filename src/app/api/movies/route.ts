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

    const allMovies = await db.select().from(movies).where(eq(movies.userId, user.id));
    const parsed = allMovies.map(item => ({
      ...item,
      genres: JSON.parse(item.genres || '[]'),
      cast: item.cast ? JSON.parse(item.cast) : undefined,
    }));
    return NextResponse.json(parsed);
  } catch (error) {
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
    const newMovie = {
      id: nanoid(),
      userId: user.id,
      title: body.title,
      posterImage: body.posterImage,
      backdropImage: body.backdropImage,
      releaseDate: body.releaseDate,
      runtime: body.runtime || 0,
      status: body.status,
      score: body.score,
      genres: JSON.stringify(body.genres || []),
      synopsis: body.synopsis,
      director: body.director,
      cast: body.cast ? JSON.stringify(body.cast) : null,
      notes: body.notes,
    };
    await db.insert(movies).values(newMovie);
    return NextResponse.json({
      ...newMovie,
      genres: body.genres || [],
      cast: body.cast,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating movie:', error);
    return NextResponse.json({ error: 'Failed to create movie' }, { status: 500 });
  }
}
