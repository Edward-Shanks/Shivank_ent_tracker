import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { genshinAccounts, genshinCharacters } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { getCurrentUser } from '@/lib/auth';

// POST /api/genshin/characters - Add character
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    
    // Validate required fields
    if (!body.name) {
      return NextResponse.json({ error: 'Character name is required' }, { status: 400 });
    }
    if (!body.element) {
      return NextResponse.json({ error: 'Element is required' }, { status: 400 });
    }
    if (!body.weapon) {
      return NextResponse.json({ error: 'Weapon is required' }, { status: 400 });
    }
    if (!body.rarity) {
      return NextResponse.json({ error: 'Rarity is required' }, { status: 400 });
    }
    
    let account = await db.select().from(genshinAccounts)
      .where(eq(genshinAccounts.userId, user.id)).limit(1);
    
    // Create account if it doesn't exist
    if (account.length === 0) {
      const accountId = nanoid();
      await db.insert(genshinAccounts).values({
        id: accountId,
        userId: user.id,
        uid: '',
        adventureRank: 1,
        worldLevel: 0,
        primogems: 0,
        intertwined: 0,
        acquaint: 0,
      });
      
      account = await db.select().from(genshinAccounts)
        .where(eq(genshinAccounts.id, accountId)).limit(1);
    }
    
    const newCharacter = {
      id: nanoid(),
      accountId: account[0].id,
      name: body.name,
      element: body.element,
      weapon: body.weapon,
      rarity: body.rarity,
      constellation: body.constellation || 0,
      level: body.level || 1,
      friendship: body.friendship || 0,
      image: body.image || '',
      obtained: body.obtained !== undefined ? body.obtained : true,
      tier: body.tier || null,
      type: body.type || null,
      type2: body.type2 || null,
      buildNotes: body.buildNotes || null,
    };
    
    await db.insert(genshinCharacters).values(newCharacter);
    
    return NextResponse.json({
      ...newCharacter,
      obtained: Boolean(newCharacter.obtained),
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating character:', error);
    // Return more detailed error message
    const errorMessage = error?.message || 'Failed to create character';
    return NextResponse.json({ 
      error: 'Failed to create character',
      details: errorMessage 
    }, { status: 500 });
  }
}
