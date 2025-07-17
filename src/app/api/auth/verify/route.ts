import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('admin-session')?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    try {
      // Decode the session token (in production, verify JWT properly)
      const decoded = Buffer.from(sessionToken, 'base64').toString('utf-8');
      const [username, timestamp] = decoded.split(':');

      if (!username || !timestamp) {
        return NextResponse.json(
          { authenticated: false },
          { status: 401 }
        );
      }

      // Check if session is expired (7 days)
      const sessionAge = Date.now() - parseInt(timestamp);
      const maxAge = 60 * 60 * 24 * 7 * 1000; // 7 days in milliseconds

      if (sessionAge > maxAge) {
        return NextResponse.json(
          { authenticated: false, message: 'Session expired' },
          { status: 401 }
        );
      }

      return NextResponse.json(
        {
          authenticated: true,
          user: { username }
        },
        { status: 200 }
      );
    } catch (decodeError) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { authenticated: false },
      { status: 500 }
    );
  }
}
