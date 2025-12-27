import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { genshinCharacters, genshinAccounts } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

// PATCH /api/genshin/characters/[id] - Update character
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
    
    // Verify character belongs to user's account
    const character = await db.select().from(genshinCharacters)
      .where(eq(genshinCharacters.id, id)).limit(1);
    
    if (character.length === 0) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 });
    }
    
    const account = await db.select().from(genshinAccounts)
      .where(eq(genshinAccounts.id, character[0].accountId)).limit(1);
    
    if (account[0].userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    const updateData: Record<string, unknown> = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.element !== undefined) updateData.element = body.element;
    if (body.weapon !== undefined) updateData.weapon = body.weapon;
    if (body.rarity !== undefined) updateData.rarity = body.rarity;
    if (body.constellation !== undefined) updateData.constellation = body.constellation;
    if (body.level !== undefined) updateData.level = body.level;
    if (body.friendship !== undefined) updateData.friendship = body.friendship;
    if (body.image !== undefined) updateData.image = body.image;
    if (body.obtained !== undefined) updateData.obtained = body.obtained;
    if (body.tier !== undefined) updateData.tier = body.tier;
    if (body.type !== undefined) updateData.type = body.type;
    if (body.type2 !== undefined) updateData.type2 = body.type2;
    if (body.buildNotes !== undefined) updateData.buildNotes = body.buildNotes;
    updateData.updatedAt = new Date().toISOString();
    
    await db.update(genshinCharacters).set(updateData)
      .where(eq(genshinCharacters.id, id));
    
    const updated = await db.select().from(genshinCharacters)
      .where(eq(genshinCharacters.id, id)).limit(1);
    
    return NextResponse.json({
      ...updated[0],
      obtained: Boolean(updated[0].obtained),
    });
  } catch (error) {
    console.error('Error updating character:', error);
    return NextResponse.json({ error: 'Failed to update character' }, { status: 500 });
  }
}

// DELETE /api/genshin/characters/[id] - Delete character
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
    
    const character = await db.select().from(genshinCharacters)
      .where(eq(genshinCharacters.id, id)).limit(1);
    
    if (character.length === 0) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 });
    }
    
    const account = await db.select().from(genshinAccounts)
      .where(eq(genshinAccounts.id, character[0].accountId)).limit(1);
    
    if (account[0].userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    await db.delete(genshinCharacters).where(eq(genshinCharacters.id, id));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting character:', error);
    return NextResponse.json({ error: 'Failed to delete character' }, { status: 500 });
  }
}
