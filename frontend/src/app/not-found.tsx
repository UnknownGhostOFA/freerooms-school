'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Sparkles,
  Compass,
  RotateCcw,
  Volume2,
  VolumeX,
  School,
  Building2,
  BookOpen
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function NotFound() {
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const [isSquished, setIsSquished] = useState(false);
  const [quackCount, setQuackCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [currentQuackText, setCurrentQuackText] = useState("Quack! This room doesn't exist on the timetable.");
  const [floatingHearts, setFloatingHearts] = useState<{ id: number; x: number; y: number }[]>([]);

  const stageRef = useRef<HTMLDivElement>(null);

  // Smooth mouse tracking for 3D head tilt and eye gaze
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!stageRef.current) return;
      const rect = stageRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = (e.clientX - centerX) / (window.innerWidth / 2);
      const dy = (e.clientY - centerY) / (window.innerHeight / 2);

      setMouseOffset({
        x: Math.max(-1, Math.min(1, dx)),
        y: Math.max(-1, Math.min(1, dy)),
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Web Audio Synth for playful quack / pop sound effect
  const playQuackSound = () => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      // Fun bouncy cartoon synth pitch
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      const baseFreq = 420 + Math.random() * 80;
      osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.6, ctx.currentTime + 0.08);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.7, ctx.currentTime + 0.22);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.26);
    } catch {}
  };

  // Interactive Mascot Squeeze
  const handleMascotClick = (e: React.MouseEvent) => {
    setIsSquished(true);
    setQuackCount(prev => prev + 1);
    playQuackSound();

    const quotes = [
      "Quack! Looks like you took a wrong turn after Period 3.",
      "Sorry, we couldn't study that for you.",
      "Room 404 is vacant — only rubber ducks studying here!",
      "Head back to the matrix for free study rooms like 6B, 6D, 6F!",
      "Squeak! +10 luck for your next revision session.",
      "404: Timetable out of bounds!"
    ];
    setCurrentQuackText(quotes[Math.floor(Math.random() * quotes.length)]);

    // Pop floating heart / star particle
    const rect = stageRef.current?.getBoundingClientRect();
    if (rect) {
      const newParticle = {
        id: Date.now() + Math.random(),
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
      setFloatingHearts(prev => [...prev.slice(-6), newParticle]);
    }

    try {
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.55 },
        colors: ['#facc15', '#fbbf24', '#00875f', '#e3f5ec', '#38bdf8']
      });
    } catch {}

    setTimeout(() => {
      setIsSquished(false);
    }, 280);
  };

  return (
    <div
      ref={stageRef}
      className="min-h-screen bg-[#fcf9f2] text-[#1c1917] flex flex-col justify-between font-sans selection:bg-[#fde047] selection:text-black overflow-hidden relative"
    >
      {/* Background Soft Studio Ambient Rings */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#fef08a]/40 blur-3xl" />
        <div className="absolute top-1/3 -right-32 w-96 h-96 rounded-full bg-[#e3f5ec]/70 blur-3xl" />
        <div className="absolute -bottom-24 left-1/3 w-80 h-80 rounded-full bg-[#fed7aa]/30 blur-3xl" />
      </div>

      {/* Studio Header */}
      <header className="relative z-10 w-full px-6 py-5 max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#005047] text-white font-black text-lg shadow-sm transition-transform group-hover:scale-105 group-hover:rotate-3">
            W
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-[#1c1917]">
                FreeRooms School
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider bg-[#e3f5ec] text-[#005047] border border-[#00875f]/30 px-2 py-0.5 rounded-full">
                404 Studio
              </span>
            </div>
          </div>
        </Link>

        {/* Sound Toggle & Back Pill */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? "Mute audio" : "Enable sound"}
            className="flex items-center justify-center h-10 w-10 rounded-full bg-white border border-[#e7e5e4] text-[#78716c] hover:text-[#1c1917] hover:border-[#d6d3d1] shadow-2xs transition-all"
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4 text-[#a8a29e]" />}
          </button>

          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-[#1c1917] hover:bg-[#005047] text-white px-5 py-2.5 text-xs font-bold transition-all shadow-sm hover:shadow-md active:scale-95"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Go Home</span>
          </Link>
        </div>
      </header>

      {/* Main Showcase Hero */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8 text-center max-w-3xl mx-auto w-full">

        {/* Playful Floating Speech Bubble */}
        <div className="mb-4 inline-flex items-center gap-2 bg-white/90 backdrop-blur-md border border-[#e7e5e4] px-4 py-2 rounded-full shadow-sm animate-bounce">
          <span className="text-base">🦆</span>
          <span className="text-xs font-bold text-[#44403c]">
            {currentQuackText}
          </span>
        </div>

        {/* 3D-Shaded Playful Mascot (The FreeRooms Study Duck) */}
        <div
          onClick={handleMascotClick}
          className="relative cursor-pointer group select-none transition-transform duration-200 active:scale-90 my-2"
          style={{
            transform: `perspective(800px) rotateY(${mouseOffset.x * 12}deg) rotateX(${-mouseOffset.y * 12}deg) ${
              isSquished ? 'scale(1.15, 0.85)' : 'scale(1)'
            }`,
          }}
        >
          {/* Soft Drop Shadow under Mascot */}
          <div
            className="absolute bottom-1 left-1/2 -translate-x-1/2 w-48 h-10 bg-[#78716c]/20 rounded-full blur-md transition-all duration-300 group-hover:w-56 group-hover:bg-[#78716c]/30"
          />

          {/* SVG 3D-Shaded Rubber Duck with Glasses & Book */}
          <svg
            viewBox="0 0 240 220"
            className="h-56 sm:h-64 w-56 sm:w-64 drop-shadow-[0_20px_35px_rgba(202,138,4,0.25)] transition-all duration-300"
          >
            <defs>
              {/* Radial 3D Gradients */}
              <radialGradient id="duckBody" cx="40%" cy="35%" r="60%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="60%" stopColor="#facc15" />
                <stop offset="100%" stopColor="#ca8a04" />
              </radialGradient>

              <radialGradient id="duckHead" cx="40%" cy="30%" r="65%">
                <stop offset="0%" stopColor="#fef9c3" />
                <stop offset="55%" stopColor="#fde047" />
                <stop offset="100%" stopColor="#eab308" />
              </radialGradient>

              <radialGradient id="beakGrad" cx="30%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#fdba74" />
                <stop offset="60%" stopColor="#f97316" />
                <stop offset="100%" stopColor="#c2410c" />
              </radialGradient>

              <linearGradient id="glassesFrame" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#005047" />
                <stop offset="100%" stopColor="#00875f" />
              </linearGradient>

              <linearGradient id="bookCover" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#005047" />
                <stop offset="100%" stopColor="#002420" />
              </linearGradient>
            </defs>

            {/* Floating Mini School Book under Duck */}
            <g transform="translate(60, 158)">
              <rect x="0" y="0" width="120" height="22" rx="6" fill="url(#bookCover)" />
              <rect x="6" y="5" width="108" height="4" rx="2" fill="#e3f5ec" opacity="0.6" />
              <text x="60" y="15" textAnchor="middle" fill="#e3f5ec" fontSize="8" fontWeight="bold" fontFamily="monospace">
                TIMETABLE 404
              </text>
            </g>

            {/* Duck Body */}
            <path
              d="M 50 145 C 40 180, 160 185, 185 145 C 205 115, 175 90, 140 100 C 125 105, 70 110, 50 145 Z"
              fill="url(#duckBody)"
            />

            {/* Duck Tail Tip */}
            <path
              d="M 45 135 C 25 120, 35 150, 60 155 Z"
              fill="#eab308"
            />

            {/* Duck Wing */}
            <path
              d="M 95 125 C 90 145, 130 155, 145 130 C 150 120, 120 115, 95 125 Z"
              fill="#eab308"
              opacity="0.8"
            />

            {/* Duck Head */}
            <circle cx="145" cy="78" r="42" fill="url(#duckHead)" />

            {/* Cheeks */}
            <ellipse cx="122" cy="92" rx="6" ry="4" fill="#fb923c" opacity="0.5" />
            <ellipse cx="168" cy="92" rx="6" ry="4" fill="#fb923c" opacity="0.5" />

            {/* Beak */}
            <path
              d="M 175 76 C 215 76, 210 98, 170 94 Z"
              fill="url(#beakGrad)"
            />

            {/* Interactive Eyes (Look at Mouse Cursor) */}
            {/* Left Eye */}
            <circle cx="134" cy="72" r="10" fill="#ffffff" stroke="#eab308" strokeWidth="1" />
            <circle
              cx={134 + mouseOffset.x * 4}
              cy={72 + mouseOffset.y * 4}
              r="4.5"
              fill="#1c1917"
            />
            <circle
              cx={134 + mouseOffset.x * 4 - 1.5}
              cy={72 + mouseOffset.y * 4 - 1.5}
              r="1.5"
              fill="#ffffff"
            />

            {/* Right Eye */}
            <circle cx="158" cy="72" r="10" fill="#ffffff" stroke="#eab308" strokeWidth="1" />
            <circle
              cx={158 + mouseOffset.x * 4}
              cy={72 + mouseOffset.y * 4}
              r="4.5"
              fill="#1c1917"
            />
            <circle
              cx={158 + mouseOffset.x * 4 - 1.5}
              cy={72 + mouseOffset.y * 4 - 1.5}
              r="1.5"
              fill="#ffffff"
            />

            {/* Cute Study Glasses Frame */}
            <g stroke="url(#glassesFrame)" strokeWidth="3" fill="none" opacity="0.9">
              <circle cx="134" cy="72" r="12" />
              <circle cx="158" cy="72" r="12" />
              <line x1="146" y1="72" x2="146" y2="72" strokeWidth="4" />
              <path d="M 122 72 Q 110 65 105 70" />
            </g>

            {/* Small Graduation / Study Cap */}
            <g transform="translate(145, 38)">
              <polygon points="0,-12 28,0 0,12 -28,0" fill="#005047" stroke="#003d36" strokeWidth="1.5" />
              <rect x="-10" y="8" width="20" height="8" rx="2" fill="#003d36" />
              {/* Tassel */}
              <circle cx="0" cy="0" r="2.5" fill="#facc15" />
              <path d="M 0 0 Q 14 10 18 20" stroke="#facc15" strokeWidth="2" fill="none" />
              <circle cx="18" cy="20" r="2.5" fill="#facc15" />
            </g>
          </svg>

          {/* Squeeze Hint Badge */}
          <div className="absolute -bottom-2 right-4 bg-white/90 border border-[#e7e5e4] px-3 py-1 rounded-full text-[11px] font-extrabold text-[#005047] shadow-sm flex items-center gap-1 group-hover:scale-105 transition-transform">
            <Sparkles className="h-3 w-3 text-amber-500" />
            <span>Squeeze Me ({quackCount})</span>
          </div>

          {/* Floating particle burst on click */}
          {floatingHearts.map(p => (
            <span
              key={p.id}
              className="absolute text-xl pointer-events-none animate-out fade-out slide-out-to-top-12 duration-700 font-bold"
              style={{ left: p.x, top: p.y }}
            >
              ✨
            </span>
          ))}
        </div>

        {/* Big Bold Playful Studio Heading (Inspired by New Studio) */}
        <div className="mt-6 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#f5f5f4] border border-[#e7e5e4] text-xs font-black uppercase tracking-widest text-[#78716c]">
            Error 404 • Lost in Corridors
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-[#1c1917] leading-none">
            Sorry, we couldn&apos;t <span className="text-[#005047] underline decoration-[#facc15] decoration-wavy decoration-4">quack</span> that for you.
          </h1>

          <p className="text-sm sm:text-base text-[#78716c] max-w-lg mx-auto font-medium">
            This classroom or period doesn&apos;t exist on Wrenn School&apos;s active timetable. Let&apos;s get you back to your study rooms.
          </p>
        </div>

        {/* Action Hub Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 w-full max-w-md">
          <Link
            href="/"
            className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-[#005047] hover:bg-[#003d36] text-white px-7 py-4 text-sm font-extrabold transition-all shadow-lg hover:shadow-xl active:scale-95"
          >
            <Compass className="h-4 w-4" />
            <span>Back to Period Matrix</span>
          </Link>

          <button
            onClick={handleMascotClick}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-white border border-[#e7e5e4] hover:bg-[#fafaf9] hover:border-[#d6d3d1] text-[#1c1917] px-6 py-4 text-sm font-bold transition-all shadow-xs"
          >
            <span>Quack Mascot</span>
            <span className="text-xs bg-[#fef08a] px-2 py-0.5 rounded-full font-black text-[#854d0e]">
              {quackCount}
            </span>
          </button>
        </div>

        {/* Quick Period Links Bar */}
        <div className="mt-10 pt-6 border-t border-[#e7e5e4] w-full max-w-lg flex items-center justify-center gap-2 text-xs font-bold text-[#78716c]">
          <span className="text-[11px] font-semibold text-[#a8a29e] uppercase tracking-wider mr-1">
            Jump directly:
          </span>
          {['P1', 'P2', 'P3', 'P4', 'P5'].map(p => (
            <Link
              key={p}
              href="/"
              className="px-2.5 py-1 rounded-lg bg-white border border-[#e7e5e4] hover:border-[#00875f] hover:text-[#005047] transition-all shadow-2xs"
            >
              {p}
            </Link>
          ))}
        </div>

      </main>

      {/* Minimal Studio Footer */}
      <footer className="relative z-10 w-full py-4 text-center text-xs text-[#a8a29e] max-w-7xl mx-auto px-6 border-t border-[#f0ede6]">
        <span>Wrenn FreeRooms • Playful 404 Studio Edition • Periods 1 – 5</span>
      </footer>
    </div>
  );
}
