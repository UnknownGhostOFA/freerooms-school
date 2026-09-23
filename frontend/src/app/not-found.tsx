'use client';

import React from 'react';

export default function NotFound() {
  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-white z-50">
      <iframe
        src="/game404/index.html"
        title="404 — Maxime Ducret Gravity Game"
        className="w-full h-full border-0 m-0 p-0 block"
        style={{ width: '100vw', height: '100dvh' }}
      />
    </div>
  );
}
