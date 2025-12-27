import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { websites } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = '1';
    const result = await db.select().from(websites)
      .where(and(eq(websites.id, params.id), eq(websites.userId, userId))).limit(1);
    if (result.length === 0) {
      return NextResponse.json({ error: 'Website not found' }, { status: 404 });
    }
    return NextResponse.json({
      ...result[0],
      isFavorite: Boolean(result[0].isFavorite),
    });
  } catch (error) {
    console.error('Error fetching website:', error);
    return NextResponse.json({ error: 'Failed to fetch website' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const userId = '1';
    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.url !== undefined) updateData.url = body.url;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.favicon !== undefined) updateData.favicon = body.favicon;
    if (body.isFavorite !== undefined) updateData.isFavorite = body.isFavorite;
    if (body.lastVisited !== undefined) updateData.lastVisited = body.lastVisited;
    updateData.updatedAt = new Date().toISOString();
    
    await db.update(websites).set(updateData)
      .where(and(eq(websites.id, params.id), eq(websites.userId, userId)));
    
    const updated = await db.select().from(websites)
      .where(and(eq(websites.id, params.id), eq(websites.userId, userId))).limit(1);
    
    if (updated.length === 0) {
      return NextResponse.json({ error: 'Website not found' }, { status: 404 });
    }
    
    return NextResponse.json({
      ...updated[0],
      isFavorite: Boolean(updated[0].isFavorite),
    });
  } catch (error) {
    console.error('Error updating website:', error);
    return NextResponse.json({ error: 'Failed to update website' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = '1';
    await db.delete(websites)
      .where(and(eq(websites.id, params.id), eq(websites.userId, userId)));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting website:', error);
    return NextResponse.json({ error: 'Failed to delete website' }, { status: 500 });
  }
}

