import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import {
  hashPassword,
  generateAccessToken,
  generateRefreshToken,
  setAuthCookies,
} from '@/lib/auth';

// POST /api/auth/register - Register new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Check if user with email already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Generate username from email
    const username = email.split('@')[0];

    // Generate avatar URL using dicebear
    const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}`;

    // Create new user
    const userId = nanoid();
    await db.insert(users).values({
      id: userId,
      email,
      username,
      password: hashedPassword,
      avatar,
    });

    // Generate tokens
    const accessToken = await generateAccessToken({
      userId,
      email,
      username,
    });
    const refreshToken = await generateRefreshToken({ userId });

    // Set cookies
    await setAuthCookies(accessToken, refreshToken);

    // Return user data (without password)
    return NextResponse.json(
      {
        user: {
          id: userId,
          email,
          username,
          avatar,
          createdAt: new Date().toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error registering user:', error);
    return NextResponse.json(
      { error: 'Failed to register user' },
      { status: 500 }
    );
  }
}
