import type { Metadata } from 'next';
import { LoginClient } from '@/components/arbor/LoginClient';

export const metadata: Metadata = {
  title: "Sign In with Arbor",
  description: "Sign in to FreeRooms School using your school Arbor account to synchronize your 2-week timetable and free study rooms.",
  alternates: {
    canonical: '/login',
  },
};

export default function LoginPage() {
  return <LoginClient />;
}
