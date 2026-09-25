import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'FreeRooms School — Live Timetable & Study Room Finder',
    short_name: 'FreeRooms',
    description: 'Wrenn School real-time 6th form study space matrix & 2-week timetable aggregator.',
    start_url: '/',
    display: 'standalone',
    background_color: '#121614',
    theme_color: '#7fb743',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
