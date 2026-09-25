'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArborMatrixProvider, useArborMatrix } from '@/context/ArborMatrixContext';
import { ArborLoginPage } from '@/components/arbor/ArborLoginPage';

function LoginScreen() {
  const { studentSession, isHydrated } = useArborMatrix();
  const router = useRouter();

  useEffect(() => {
    if (isHydrated && studentSession) {
      router.replace('/');
    }
  }, [isHydrated, studentSession, router]);

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-[#f4f6f5] dark:bg-[#121614] flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3 animate-pulse">
          <div className="h-10 w-10 rounded-xl bg-[#7fb743] text-white font-black text-xl flex items-center justify-center shadow-xs">
            A
          </div>
          <span className="text-xs font-bold text-[#596560] dark:text-[#8b9c92] tracking-wider uppercase font-mono">
            Loading FreeRooms...
          </span>
        </div>
      </div>
    );
  }

  return <ArborLoginPage />;
}

export function LoginClient() {
  return (
    <ArborMatrixProvider>
      <LoginScreen />
    </ArborMatrixProvider>
  );
}
