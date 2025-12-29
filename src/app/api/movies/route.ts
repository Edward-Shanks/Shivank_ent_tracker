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
      backdropImage: body.backdropImage || null,
      releaseDate: body.releaseDate,
      status: body.status,
      reviewType: body.reviewType || null,
      genres: JSON.stringify(body.genres || []),
      synopsis: body.synopsis || null,
      notes: body.notes || null,
    };
    await db.insert(movies).values(newMovie);
    return NextResponse.json({
      ...newMovie,
      genres: body.genres || [],
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating movie:', error);
    return NextResponse.json({ error: 'Failed to create movie' }, { status: 500 });
  }
}
