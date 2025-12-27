import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { db } from './db';
import { users } from './db/schema';
import { eq } from 'drizzle-orm';

// Environment variables
const JWT_SECRET = process.env.JWT_SECRET || (() => {
  throw new Error('JWT_SECRET environment variable is required');
})();
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || (() => {
  throw new Error('JWT_REFRESH_SECRET environment variable is required');
})();
const ACCESS_TOKEN_EXPIRY = '15m'; // 15 minutes
const REFRESH_TOKEN_EXPIRY = '7d'; // 7 days

// Password utilities
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// JWT Token utilities
export interface TokenPayload {
  userId: string;
  email: string;
  username: string;
}

export interface RefreshTokenPayload {
  userId: string;
}

export async function generateAccessToken(payload: TokenPayload): Promise<string> {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
}

export async function generateRefreshToken(payload: RefreshTokenPayload): Promise<string> {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });
}

export async function verifyAccessToken(token: string): Promise<TokenPayload | null> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return decoded;
  } catch {
    return null;
  }
}

export async function verifyRefreshToken(token: string): Promise<RefreshTokenPayload | null> {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as RefreshTokenPayload;
    return decoded;
  } catch {
    return null;
  }
}

// Cookie utilities
export async function setAuthCookies(accessToken: string, refreshToken: string): Promise<void> {
  const cookieStore = await cookies();

  // Set access token cookie (short-lived, httpOnly)
  cookieStore.set('access_token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 15 * 60, // 15 minutes
  });

  // Set refresh token cookie (long-lived, httpOnly)
  cookieStore.set('refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
}

export async function clearAuthCookies(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('access_token');
  cookieStore.delete('refresh_token');
}

export async function getAuthCookies(): Promise<{ accessToken: string | undefined; refreshToken: string | undefined }> {
  const cookieStore = await cookies();
  return {
    accessToken: cookieStore.get('access_token')?.value,
    refreshToken: cookieStore.get('refresh_token')?.value,
  };
}

// Get current user from token
export async function getCurrentUser(): Promise<{
  id: string;
  email: string;
  username: string;
  avatar: string | null;
} | null> {
  const { accessToken, refreshToken } = await getAuthCookies();

  // Try access token first
  if (accessToken) {
    const payload = await verifyAccessToken(accessToken);
    if (payload) {
      const user = await db
        .select({
          id: users.id,
          email: users.email,
          username: users.username,
          avatar: users.avatar,
        })
        .from(users)
        .where(eq(users.id, payload.userId))
        .limit(1);

      if (user.length > 0) {
        return user[0];
      }
    }
  }

  // Try refresh token if access token is invalid/expired
  if (refreshToken) {
    const refreshPayload = await verifyRefreshToken(refreshToken);
    if (refreshPayload) {
      const user = await db
        .select({
          id: users.id,
          email: users.email,
          username: users.username,
          avatar: users.avatar,
        })
        .from(users)
        .where(eq(users.id, refreshPayload.userId))
        .limit(1);

      if (user.length > 0) {
        // Generate new access token
        const newAccessToken = await generateAccessToken({
          userId: user[0].id,
          email: user[0].email,
          username: user[0].username,
        });

        // Set new access token cookie
        const cookieStore = await cookies();
        cookieStore.set('access_token', newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 15 * 60, // 15 minutes
        });

        return user[0];
      }
    }
  }

  return null;
}
