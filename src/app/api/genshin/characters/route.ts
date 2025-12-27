import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { genshinAccounts, genshinCharacters } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

// POST /api/genshin/characters - Add character
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = '1';
    
    const account = await db.select().from(genshinAccounts)
      .where(eq(genshinAccounts.userId, userId)).limit(1);
    
    if (account.length === 0) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
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
      image: body.image,
      obtained: body.obtained !== undefined ? body.obtained : true,
      tier: body.tier,
      type: body.type,
      type2: body.type2,
      buildNotes: body.buildNotes,
    };
    
    await db.insert(genshinCharacters).values(newCharacter);
    
    return NextResponse.json({
      ...newCharacter,
      obtained: Boolean(newCharacter.obtained),
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating character:', error);
    return NextResponse.json({ error: 'Failed to create character' }, { status: 500 });
  }
}

