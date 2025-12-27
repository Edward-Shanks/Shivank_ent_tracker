import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import {
  verifyPassword,
  generateAccessToken,
  generateRefreshToken,
  setAuthCookies,
} from '@/lib/auth';

// POST /api/auth/login - Login user
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

    // Find user by email
    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const user = result[0];

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Generate tokens
    const accessToken = await generateAccessToken({
      userId: user.id,
      email: user.email,
      username: user.username,
    });
    const refreshToken = await generateRefreshToken({ userId: user.id });

    // Set cookies
    await setAuthCookies(accessToken, refreshToken);

    // Return user data (without password)
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Error logging in:', error);
    return NextResponse.json(
      { error: 'Failed to login' },
      { status: 500 }
    );
  }
}

