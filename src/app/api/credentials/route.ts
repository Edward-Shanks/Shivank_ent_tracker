import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { credentials } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

export async function GET(request: NextRequest) {
  try {
    const userId = '1';
    const allCredentials = await db.select().from(credentials)
      .where(eq(credentials.userId, userId));
    return NextResponse.json(allCredentials);
  } catch (error) {
    console.error('Error fetching credentials:', error);
    return NextResponse.json({ error: 'Failed to fetch credentials' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = '1';
    const newCredential = {
      id: nanoid(),
      userId,
      name: body.name,
      category: body.category,
      username: body.username,
      email: body.email,
      password: body.password,
      url: body.url,
      notes: body.notes,
      icon: body.icon,
    };
    await db.insert(credentials).values(newCredential);
    return NextResponse.json(newCredential, { status: 201 });
  } catch (error) {
    console.error('Error creating credential:', error);
    return NextResponse.json({ error: 'Failed to create credential' }, { status: 500 });
  }
}

