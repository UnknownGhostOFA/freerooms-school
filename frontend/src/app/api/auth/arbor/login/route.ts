import { NextRequest, NextResponse } from 'next/server';
import { authenticateArbor, fetchLiveArborData } from '@/lib/arborAuthService';
import { Room, Booking } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { schoolUrl, username, password, autoRenew } = body;

    if (!schoolUrl || !username || !password) {
      return NextResponse.json(
        { error: 'School URL, username/email, and password are required.' },
        { status: 400 }
      );
    }

    // Authenticate and acquire session
    const authResult = await authenticateArbor({
      schoolUrl,
      username,
      password,
      storePasswordForAutoRenewal: autoRenew !== false,
    });

    // Fetch initial timetable and room data
    let liveData: { rooms: Room[]; bookings: Booking[]; syncTime: string } = { 
      rooms: [], 
      bookings: [], 
      syncTime: new Date().toISOString() 
    };
    try {
      liveData = await fetchLiveArborData({
        schoolUrl,
        username,
      });
    } catch (e) {
      console.warn('Initial data pull failed after auth:', e);
    }

    return NextResponse.json({
      success: true,
      message: 'Logged in to Arbor successfully! Live session active.',
      sessionInfo: {
        schoolUrl,
        username,
        lastSync: liveData.syncTime,
        autoRenew: autoRenew !== false,
      },
      rooms: liveData.rooms,
      bookings: liveData.bookings,
    });
  } catch (error: any) {
    console.error('Arbor Login Route Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Login failed. Please check school URL and credentials.' },
      { status: 401 }
    );
  }
}
