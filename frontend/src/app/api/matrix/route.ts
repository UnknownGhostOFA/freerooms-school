import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL =
  process.env.BACKEND_API_URL ||
  process.env.NEXT_PUBLIC_SERVER_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://freeroom-server.onrender.com'
    : 'http://localhost:5000');

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const week = searchParams.get('week') || 'A';

    try {
      const serverRes = await fetch(`${BACKEND_URL}/api/matrix?week=${week}`, {
        cache: 'no-store',
      });
      if (serverRes.ok) {
        const data = await serverRes.json();
        return NextResponse.json(data);
      }
    } catch {
      // Backend not reachable
    }

    return NextResponse.json({
      success: true,
      week,
      source: 'frontend_cache',
      studyRooms: []
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
