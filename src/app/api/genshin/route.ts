import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { genshinAccounts, genshinCharacters } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { getCurrentUser } from '@/lib/auth';

// GET /api/genshin - Get genshin account with characters
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const account = await db.select().from(genshinAccounts)
      .where(eq(genshinAccounts.userId, user.id)).limit(1);
    
    if (account.length === 0) {
      return NextResponse.json(null);
    }
    
    const characters = await db.select().from(genshinCharacters)
      .where(eq(genshinCharacters.accountId, account[0].id));
    
    return NextResponse.json({
      uid: account[0].uid,
      adventureRank: account[0].adventureRank,
      worldLevel: account[0].worldLevel,
      primogems: account[0].primogems,
      intertwined: account[0].intertwined,
      acquaint: account[0].acquaint,
      characters: characters.map(char => ({
        ...char,
        obtained: Boolean(char.obtained),
      })),
    });
  } catch (error) {
    console.error('Error fetching genshin account:', error);
    return NextResponse.json({ error: 'Failed to fetch genshin account' }, { status: 500 });
  }
}

// PATCH /api/genshin - Update genshin account
export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    const account = await db.select().from(genshinAccounts)
      .where(eq(genshinAccounts.userId, user.id)).limit(1);
    
    if (account.length === 0) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }
    
    const updateData: Record<string, unknown> = {};
    if (body.uid !== undefined) updateData.uid = body.uid;
    if (body.adventureRank !== undefined) updateData.adventureRank = body.adventureRank;
    if (body.worldLevel !== undefined) updateData.worldLevel = body.worldLevel;
    if (body.primogems !== undefined) updateData.primogems = body.primogems;
    if (body.intertwined !== undefined) updateData.intertwined = body.intertwined;
    if (body.acquaint !== undefined) updateData.acquaint = body.acquaint;
    updateData.updatedAt = new Date().toISOString();
    
    await db.update(genshinAccounts).set(updateData)
      .where(eq(genshinAccounts.id, account[0].id));
    
    const updated = await db.select().from(genshinAccounts)
      .where(eq(genshinAccounts.id, account[0].id)).limit(1);
    
    const characters = await db.select().from(genshinCharacters)
      .where(eq(genshinCharacters.accountId, account[0].id));
    
    return NextResponse.json({
      uid: updated[0].uid,
      adventureRank: updated[0].adventureRank,
      worldLevel: updated[0].worldLevel,
      primogems: updated[0].primogems,
      intertwined: updated[0].intertwined,
      acquaint: updated[0].acquaint,
      characters: characters.map(char => ({
        ...char,
        obtained: Boolean(char.obtained),
      })),
    });
  } catch (error) {
    console.error('Error updating genshin account:', error);
    return NextResponse.json({ error: 'Failed to update genshin account' }, { status: 500 });
  }
}
