import { NextRequest, NextResponse } from 'next/server';
import { authenticateArbor, fetchLiveArborData } from '@/lib/arborAuthService';
import { Room, Booking } from '@/types';
import { cleanRoomCode, matchTimeToPeriod, isStudyLesson, DAYS_OF_WEEK } from '@/lib/crowdsourceEngine';

const BACKEND_URL =
  process.env.BACKEND_API_URL ||
  process.env.NEXT_PUBLIC_SERVER_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://freeroom-server.onrender.com'
    : 'http://localhost:5000');

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

    const studentName = username.split('@')[0].toUpperCase();

    // Ingest any discovered study rooms into MongoDB Atlas via backend server
    if (liveData.bookings && liveData.bookings.length > 0) {
      const studyBookings = liveData.bookings.filter(b => isStudyLesson(b.subject || ''));

      for (const b of studyBookings) {
        const clean = cleanRoomCode(b.roomId || '');
        if (!clean) continue;

        const period = matchTimeToPeriod(b.startTime);
        const dayNum = b.dayOfWeek || 1;
        const dayObj = DAYS_OF_WEEK.find(d => d.id === dayNum) || DAYS_OF_WEEK[0];

        try {
          await fetch(`${BACKEND_URL}/api/rooms/manual`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: `arbor-sync-${clean}-${dayNum}-${period.id}`,
              roomCode: clean,
              weekType: 'A',
              dayOfWeek: dayNum,
              dayName: dayObj.name,
              periodId: period.id,
              periodNumber: period.number || 1,
              lessonSubject: b.subject || '6th form study',
              supervisor: b.teacher || 'Study Supervisor',
              contributedBy: `${studentName} (Arbor Sync)`,
            }),
          });
        } catch (syncErr) {
          console.warn('Backend sync for booking failed:', syncErr);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Logged in to Arbor successfully! Timetable synced.',
      sessionInfo: {
        schoolUrl,
        username,
        studentName,
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
