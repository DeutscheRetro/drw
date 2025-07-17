import { NextRequest, NextResponse } from 'next/server';
import { authStore } from '@/lib/auth-store';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { message: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Check credentials
    const currentCredentials = authStore.getAdminCredentials();
    if (username === currentCredentials.username && password === currentCredentials.password) {
      // Create a simple session token (in production, use proper JWT)
      const sessionToken = Buffer.from(`${username}:${Date.now()}`).toString('base64');

      // Create response with session cookie
      const response = NextResponse.json(
        {
          message: 'Login successful',
          user: { username: username }
        },
        { status: 200 }
      );

      // Set httpOnly cookie for session
      response.cookies.set('admin-session', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/'
      });

      return response;
    } else {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { message: 'Login failed' },
      { status: 500 }
    );
  }
}
