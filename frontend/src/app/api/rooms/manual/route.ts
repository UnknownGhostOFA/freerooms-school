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
      // Backend server not reachable
    }

    return NextResponse.json({
      success: true,
      week,
      studyRooms: [],
      source: 'frontend_fallback'
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    try {
      const serverRes = await fetch(`${BACKEND_URL}/api/rooms/manual`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (serverRes.ok) {
        const data = await serverRes.json();
        return NextResponse.json(data);
      }
    } catch {
      // Server not reachable
    }

    return NextResponse.json({
      success: true,
      message: 'Room saved locally in client',
      room: body,
      source: 'client_local'
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (id) {
      try {
        await fetch(`${BACKEND_URL}/api/rooms/manual/${id}`, {
          method: 'DELETE',
        });
      } catch {}
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
