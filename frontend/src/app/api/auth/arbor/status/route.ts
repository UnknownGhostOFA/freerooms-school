import { NextRequest, NextResponse } from 'next/server';
import { getSessionStatus, fetchLiveArborData } from '@/lib/arborAuthService';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const schoolUrl = searchParams.get('schoolUrl');
    const username = searchParams.get('username');
    const refresh = searchParams.get('refresh') === 'true';

    if (!schoolUrl || !username) {
      return NextResponse.json({ isLoggedIn: false });
    }

    const status = getSessionStatus(schoolUrl, username);

    if (refresh && status.isLoggedIn) {
      const refreshedData = await fetchLiveArborData({
        schoolUrl,
        username,
      });

      return NextResponse.json({
        ...status,
        refreshed: true,
        rooms: refreshedData.rooms,
        bookings: refreshedData.bookings,
        syncTime: refreshedData.syncTime,
      });
    }

    return NextResponse.json(status);
  } catch (error: any) {
    return NextResponse.json({
      isLoggedIn: false,
      error: error?.message,
    });
  }
}
