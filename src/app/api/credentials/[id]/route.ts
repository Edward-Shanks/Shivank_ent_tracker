import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { credentials } from '@/lib/db/schema';
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
    const result = await db.select().from(credentials)
      .where(and(eq(credentials.id, id), eq(credentials.userId, user.id))).limit(1);
    if (result.length === 0) {
      return NextResponse.json({ error: 'Credential not found' }, { status: 404 });
    }
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error fetching credential:', error);
    return NextResponse.json({ error: 'Failed to fetch credential' }, { status: 500 });
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
    if (body.name !== undefined) updateData.name = body.name;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.username !== undefined) updateData.username = body.username;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.password !== undefined) updateData.password = body.password;
    if (body.url !== undefined) updateData.url = body.url;
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.icon !== undefined) updateData.icon = body.icon;
    updateData.lastUpdated = new Date().toISOString();
    
    await db.update(credentials).set(updateData)
      .where(and(eq(credentials.id, id), eq(credentials.userId, user.id)));
    
    const updated = await db.select().from(credentials)
      .where(and(eq(credentials.id, id), eq(credentials.userId, user.id))).limit(1);
    
    if (updated.length === 0) {
      return NextResponse.json({ error: 'Credential not found' }, { status: 404 });
    }
    
    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error('Error updating credential:', error);
    return NextResponse.json({ error: 'Failed to update credential' }, { status: 500 });
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
    await db.delete(credentials)
      .where(and(eq(credentials.id, id), eq(credentials.userId, user.id)));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting credential:', error);
    return NextResponse.json({ error: 'Failed to delete credential' }, { status: 500 });
  }
}
