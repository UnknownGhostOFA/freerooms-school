import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL =
  process.env.BACKEND_API_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://freeroom-server.onrender.com'
    : 'http://localhost:5000');

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { schoolUrl, username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username/email and password are required.' },
        { status: 400 }
      );
    }

    // 1. Delegate Authentication & Scraper Engine to Backend Server
    try {
      const serverRes = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schoolUrl: schoolUrl || 'https://wrenn-school.uk.arbor.sc',
          username: username.trim(),
          password
        }),
      });

      const data = await serverRes.json().catch(() => ({}));

      if (!serverRes.ok || !data.success) {
        return NextResponse.json(
          { error: data.error || 'Arbor authentication failed. Check credentials.' },
          { status: serverRes.status || 401 }
        );
      }

      return NextResponse.json({
        success: true,
        message: data.message || 'Logged in to Arbor successfully! Timetable updated in DB.',
        sessionInfo: {
          schoolUrl: schoolUrl || 'https://wrenn-school.uk.arbor.sc',
          username: username.trim(),
          studentName: data.user?.displayName || username.split('@')[0].toUpperCase(),
          studentId: data.user?.studentId || 10433,
          userType: data.user?.userType || 'student',
          lastSync: new Date().toISOString()
        }
      });
    } catch (backendErr: any) {
      console.warn('Backend server connection failed, checking fallback:', backendErr.message);
      return NextResponse.json(
        { error: 'Backend server is temporarily waking up. Please retry in a few seconds.' },
        { status: 503 }
      );
    }
  } catch (error: any) {
    console.error('Arbor Login Route Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Login failed.' },
      { status: 500 }
    );
  }
}
