import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import {
  getAuthCookies,
  verifyRefreshToken,
  generateAccessToken,
  generateRefreshToken,
  setAuthCookies,
  clearAuthCookies,
} from '@/lib/auth';

// POST /api/auth/refresh - Refresh access token
export async function POST() {
  try {
    const { refreshToken } = await getAuthCookies();

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'No refresh token provided' },
        { status: 401 }
      );
    }

    // Verify refresh token
    const payload = await verifyRefreshToken(refreshToken);
    if (!payload) {
      await clearAuthCookies();
      return NextResponse.json(
        { error: 'Invalid or expired refresh token' },
        { status: 401 }
      );
    }

    // Get user
    const result = await db
      .select()
      .from(users)
      .where(eq(users.id, payload.userId))
      .limit(1);

    if (result.length === 0) {
      await clearAuthCookies();
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      );
    }

    const user = result[0];

    // Generate new tokens (refresh token rotation - old one is automatically invalidated by expiry)
    const newAccessToken = await generateAccessToken({
      userId: user.id,
      email: user.email,
      username: user.username,
    });
    const newRefreshToken = await generateRefreshToken({ userId: user.id });

    // Set new cookies
    await setAuthCookies(newAccessToken, newRefreshToken);

    // Return user data
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
    console.error('Error refreshing token:', error);
    return NextResponse.json(
      { error: 'Failed to refresh token' },
      { status: 500 }
    );
  }
}

