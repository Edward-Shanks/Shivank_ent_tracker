import { NextResponse } from 'next/server';
import { clearAuthCookies } from '@/lib/auth';

// POST /api/auth/logout - Logout user
export async function POST() {
  try {
    // Clear cookies (tokens are stateless JWTs, no need to revoke from database)
    await clearAuthCookies();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error logging out:', error);
    // Still clear cookies even if there's an error
    await clearAuthCookies();
    return NextResponse.json({ success: true });
  }
}

