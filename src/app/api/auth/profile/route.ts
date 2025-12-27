import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

// GET /api/auth/profile - Get current user's profile
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userData = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        avatar: users.avatar,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);

    if (userData.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user: userData[0] });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

// PATCH /api/auth/profile - Update current user's profile
export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const updateData: Record<string, unknown> = {};

    // Validate and update username
    if (body.username !== undefined) {
      const trimmedUsername = body.username.trim();
      if (!trimmedUsername) {
        return NextResponse.json(
          { error: 'Username cannot be empty' },
          { status: 400 }
        );
      }
      if (trimmedUsername.length > 50) {
        return NextResponse.json(
          { error: 'Username must be less than 50 characters' },
          { status: 400 }
        );
      }
      updateData.username = trimmedUsername;
    }

    // Update avatar (can be null to remove)
    if (body.avatar !== undefined) {
      if (body.avatar === null || body.avatar === '') {
        updateData.avatar = null;
      } else if (typeof body.avatar === 'string') {
        // Validate base64 image string
        if (body.avatar.length > 5 * 1024 * 1024) {
          return NextResponse.json(
            { error: 'Avatar image is too large' },
            { status: 400 }
          );
        }
        updateData.avatar = body.avatar;
      }
    }

    // Update the user
    await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, user.id));

    // Fetch updated user
    const updatedUser = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        avatar: users.avatar,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);

    return NextResponse.json({ user: updatedUser[0] });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}

