import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { websites } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const allWebsites = await db.select().from(websites)
      .where(eq(websites.userId, user.id));
    const parsed = allWebsites.map(item => ({
      ...item,
      isFavorite: Boolean(item.isFavorite),
    }));
    return NextResponse.json(parsed);
  } catch (error) {
    console.error('Error fetching websites:', error);
    return NextResponse.json({ error: 'Failed to fetch websites' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const newWebsite = {
      id: nanoid(),
      userId: user.id,
      name: body.name,
      url: body.url,
      category: body.category,
      description: body.description,
      favicon: body.favicon,
      isFavorite: body.isFavorite || false,
      lastVisited: body.lastVisited,
    };
    await db.insert(websites).values(newWebsite);
    return NextResponse.json({
      ...newWebsite,
      isFavorite: Boolean(newWebsite.isFavorite),
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating website:', error);
    return NextResponse.json({ error: 'Failed to create website' }, { status: 500 });
  }
}
