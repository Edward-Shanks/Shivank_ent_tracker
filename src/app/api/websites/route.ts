import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { websites } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

export async function GET(request: NextRequest) {
  try {
    const userId = '1';
    const allWebsites = await db.select().from(websites)
      .where(eq(websites.userId, userId));
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
    const body = await request.json();
    const userId = '1';
    const newWebsite = {
      id: nanoid(),
      userId,
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

