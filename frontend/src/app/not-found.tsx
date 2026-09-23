'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Sparkles,
  Gamepad2,
  Terminal,
  Volume2,
  VolumeX,
  Compass,
  RotateCcw,
  Zap,
  Coffee,
  Ghost
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function NotFound() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [catReaction, setCatReaction] = useState<'idle' | 'happy' | 'confused' | 'surprised'>('idle');
  const [dialogue, setDialogue] = useState<string>("Psst... you wandered into the forbidden 4th floor corridor.");
  const [miniGameActive, setMiniGameActive] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isJumping, setIsJumping] = useState(false);
  const [obstacleLeft, setObstacleLeft] = useState(100);
  const [gameOver, setGameOver] = useState(false);
  const [catMoodCount, setCatMoodCount] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const gameLoopRef = useRef<number | null>(null);

  // Mouse tracking for the staring eyes
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      setMousePos({
        x: Math.max(-1, Math.min(1, x)),
        y: Math.max(-1, Math.min(1, y)),
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Cat click interactions
  const handleCatClick = () => {
    const dialogues = [
      "Meow! That tickles. Are you lost after Period 5?",
      "Purrr... Room 404 is occupied by pixel phantoms!",
      "Looking for Room 6D or 6F? Head back to the Matrix!",
      "Fun fact: Cats have 9 lives, but only 5 periods today.",
      "★ Legendary Study Pet unlocked! +10 focus aura.",
      "Beep boop! You found the hidden corridor cat!"
    ];

    setCatReaction('happy');
    setCatMoodCount(prev => prev + 1);
    setDialogue(dialogues[Math.floor(Math.random() * dialogues.length)]);

    try {
      confetti({
        particleCount: 25,
        spread: 45,
        origin: { y: 0.6 },
        colors: ['#00875f', '#10b981', '#34d399', '#fef08a']
      });
    } catch {}

    setTimeout(() => {
      setCatReaction('idle');
    }, 2500);
  };

  // Mini Arcade Game Engine: Corridor Jumper
  const startGame = () => {
    setMiniGameActive(true);
    setGameOver(false);
    setScore(0);
    setObstacleLeft(100);
    setIsJumping(false);
    setDialogue("🎮 SPACE or CLICK to JUMP over flying textbooks!");
  };

  const handleJump = () => {
    if (isJumping || gameOver) return;
    setIsJumping(true);
    setTimeout(() => {
      setIsJumping(false);
    }, 550);
  };

  // Keyboard space bar handler for game
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (!miniGameActive || gameOver) {
          startGame();
        } else {
          handleJump();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [miniGameActive, gameOver, isJumping]);

  // Game loop
  useEffect(() => {
    if (!miniGameActive || gameOver) return;

    const interval = setInterval(() => {
      setObstacleLeft(prev => {
        if (prev <= -10) {
          setScore(s => {
            const next = s + 1;
            if (next > highScore) setHighScore(next);
            return next;
          });
          return 100;
        }

        // Collision detection
        if (prev > 15 && prev < 35 && !isJumping) {
          setGameOver(true);
          setDialogue("💥 Oof! Tripped by a Revision Guide. Press SPACE to retry!");
          return prev;
        }

        return prev - 2.8;
      });
    }, 25);

    return () => clearInterval(interval);
  }, [miniGameActive, gameOver, isJumping, highScore]);

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen bg-[#0d1514] text-[#e3f5ec] flex flex-col justify-between select-none overflow-x-hidden font-sans"
    >
      {/* Background Animated Pixel Dust & Ambient Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-[#005047]/30 to-[#00875f]/10 rounded-full blur-3xl" />
        <div className="absolute top-12 left-12 w-2 h-2 bg-emerald-400/40 rounded-full animate-ping" />
        <div className="absolute bottom-24 right-20 w-3 h-3 bg-teal-300/30 rounded-full animate-pulse" />
        <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 bg-yellow-200/40 rounded-full animate-bounce" />
      </div>

      {/* Top Navbar */}
      <header className="relative z-10 border-b border-[#1b2b28] bg-[#0d1514]/80 backdrop-blur-md px-6 py-4">
        <div className="mx-auto max-w-5xl flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#00875f] text-[#0d1514] font-black text-base shadow-[0_0_12px_rgba(0,135,95,0.4)] group-hover:scale-105 transition-transform">
              404
            </div>
            <span className="font-bold text-sm tracking-tight text-white group-hover:text-emerald-300 transition-colors">
              Wrenn FreeRooms
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (!miniGameActive) startGame();
                else setMiniGameActive(false);
              }}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold border transition-all ${
                miniGameActive
                  ? 'bg-emerald-500 text-black border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                  : 'bg-[#152320] text-emerald-300 border-[#233833] hover:border-emerald-500/60'
              }`}
            >
              <Gamepad2 className="h-3.5 w-3.5" />
              <span>{miniGameActive ? 'Exit Game' : 'Play Arcade'}</span>
            </button>

            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#00875f] hover:bg-[#00a372] px-3.5 py-1.5 text-xs font-extrabold text-black transition-all shadow-[0_0_12px_rgba(0,135,95,0.3)]"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Matrix</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Interactive Stage */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8 text-center">
        <div className="w-full max-w-2xl space-y-6">

          {/* Staring Pixel Cat & Interactive Arena */}
          <div className="relative mx-auto w-full max-w-md bg-[#13201d] rounded-2xl border border-[#233833] p-6 shadow-2xl overflow-hidden">

            {/* Top Retro Terminal Header */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#1f332e] text-[11px] font-mono text-emerald-400/80">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500/80 inline-block" />
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/80 inline-block" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80 inline-block" />
                <span className="ml-1 text-zinc-400">corridor_terminal.sh</span>
              </div>
              <span className="text-[10px] font-bold tracking-widest uppercase bg-emerald-950/80 text-emerald-300 border border-emerald-800/40 px-2 py-0.5 rounded">
                Room 404 • Null
              </span>
            </div>

            {/* Game Canvas Area OR Staring Cat Stage */}
            {miniGameActive ? (
              /* Mini Arcade Runner Screen */
              <div
                onClick={handleJump}
                className="relative h-48 w-full bg-[#0a100f] rounded-xl border border-[#243d36] overflow-hidden cursor-pointer flex flex-col justify-between p-3"
              >
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-emerald-400 font-bold">SCORE: {score}</span>
                  <span className="text-zinc-500">BEST: {highScore}</span>
                </div>

                {/* Ground */}
                <div className="absolute bottom-0 left-0 right-0 h-8 border-t-2 border-dashed border-emerald-900/60 bg-[#0e1716]" />

                {/* Player Cat */}
                <div
                  className={`absolute left-8 bottom-4 w-9 h-9 transition-transform duration-150 ${
                    isJumping ? '-translate-y-16 rotate-12' : 'translate-y-0'
                  }`}
                >
                  <div className="relative text-2xl">🐱</div>
                </div>

                {/* Flying / Sliding Textbook Obstacle */}
                <div
                  className="absolute bottom-4 w-7 h-7 text-xl transition-all duration-75"
                  style={{ left: `${obstacleLeft}%` }}
                >
                  📚
                </div>

                {gameOver && (
                  <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-2 animate-in fade-in">
                    <span className="text-red-400 font-mono font-bold text-sm">GAME OVER</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startGame();
                      }}
                      className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500 px-3 py-1 text-xs font-bold text-black hover:bg-emerald-400"
                    >
                      <RotateCcw className="h-3 w-3" />
                      <span>Retry (Space)</span>
                    </button>
                  </div>
                )}

                <div className="text-[10px] text-zinc-500 font-mono text-center">
                  TAP / CLICK TO JUMP
                </div>
              </div>
            ) : (
              /* Interactive Animated Staring Cat */
              <div
                onClick={handleCatClick}
                className="group relative h-48 w-full flex items-center justify-center cursor-pointer transition-transform active:scale-95"
              >
                {/* Glow ring under cat */}
                <div className="absolute w-36 h-36 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 transition-all" />

                {/* SVG Character: Staring Cat on Books */}
                <svg
                  viewBox="0 0 200 200"
                  className="h-44 w-44 drop-shadow-[0_8px_20px_rgba(0,135,95,0.3)] transition-transform duration-300 group-hover:-translate-y-1"
                >
                  {/* Floating Textbook Stack */}
                  <g>
                    {/* Bottom Book */}
                    <rect x="40" y="145" width="120" height="20" rx="4" fill="#005047" stroke="#00875f" strokeWidth="2" />
                    <rect x="45" y="150" width="110" height="4" fill="#e3f5ec" opacity="0.4" />

                    {/* Top Book */}
                    <rect x="52" y="130" width="96" height="18" rx="3" fill="#0d685d" stroke="#10b981" strokeWidth="2" />
                    <line x1="58" y1="139" x2="140" y2="139" stroke="#e3f5ec" strokeWidth="2" strokeDasharray="4 2" opacity="0.6" />
                  </g>

                  {/* Cat Body */}
                  <ellipse cx="100" cy="100" rx="36" ry="34" fill="#152421" stroke="#00875f" strokeWidth="3" />

                  {/* Cat Ears */}
                  <polygon points="72,74 84,40 94,70" fill="#1a2f2b" stroke="#00875f" strokeWidth="2.5" />
                  <polygon points="76,70 84,48 90,68" fill="#ec4899" opacity="0.6" />

                  <polygon points="128,74 116,40 106,70" fill="#1a2f2b" stroke="#00875f" strokeWidth="2.5" />
                  <polygon points="124,70 116,48 110,68" fill="#ec4899" opacity="0.6" />

                  {/* Cat Face / Cheeks */}
                  <ellipse cx="88" cy="108" rx="4" ry="2" fill="#ec4899" opacity="0.4" />
                  <ellipse cx="112" cy="108" rx="4" ry="2" fill="#ec4899" opacity="0.4" />

                  {/* Staring Interactive Eyes */}
                  {/* Left Eye */}
                  <circle cx="86" cy="94" r="10" fill="#fef08a" stroke="#ca8a04" strokeWidth="1.5" />
                  <circle
                    cx={86 + mousePos.x * 4.5}
                    cy={94 + mousePos.y * 4.5}
                    r="4.5"
                    fill="#0d1514"
                  />
                  <circle
                    cx={86 + mousePos.x * 4.5 - 1.5}
                    cy={94 + mousePos.y * 4.5 - 1.5}
                    r="1.5"
                    fill="#ffffff"
                  />

                  {/* Right Eye */}
                  <circle cx="114" cy="94" r="10" fill="#fef08a" stroke="#ca8a04" strokeWidth="1.5" />
                  <circle
                    cx={114 + mousePos.x * 4.5}
                    cy={94 + mousePos.y * 4.5}
                    r="4.5"
                    fill="#0d1514"
                  />
                  <circle
                    cx={114 + mousePos.x * 4.5 - 1.5}
                    cy={94 + mousePos.y * 4.5 - 1.5}
                    r="1.5"
                    fill="#ffffff"
                  />

                  {/* Nose & Mouth */}
                  <polygon points="100,103 97,99 103,99" fill="#ec4899" />
                  <path d="M96 107 Q100 111 100 106 Q100 111 104 107" stroke="#00875f" strokeWidth="2" fill="none" />

                  {/* Whiskers */}
                  <line x1="66" y1="102" x2="50" y2="99" stroke="#10b981" strokeWidth="1.5" opacity="0.7" />
                  <line x1="66" y1="107" x2="48" y2="109" stroke="#10b981" strokeWidth="1.5" opacity="0.7" />
                  <line x1="134" y1="102" x2="150" y2="99" stroke="#10b981" strokeWidth="1.5" opacity="0.7" />
                  <line x1="134" y1="107" x2="152" y2="109" stroke="#10b981" strokeWidth="1.5" opacity="0.7" />

                  {/* Tail Swish */}
                  <path
                    d="M136 115 Q165 110 155 85"
                    stroke="#00875f"
                    strokeWidth="4"
                    strokeLinecap="round"
                    fill="none"
                    className="animate-pulse"
                  />
                </svg>

                {/* Click me hint badge */}
                <div className="absolute top-2 right-2 text-[10px] font-mono text-emerald-400/80 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-full flex items-center gap-1 group-hover:border-emerald-400 transition-colors">
                  <Sparkles className="h-2.5 w-2.5" />
                  <span>Click pet</span>
                </div>
              </div>
            )}

            {/* Retro Dialogue Box */}
            <div className="mt-2 bg-[#0d1715] rounded-xl border border-[#1f332e] p-3 text-left">
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 font-bold mb-1">
                <Terminal className="h-3 w-3" />
                <span>Corridor Guide:</span>
              </div>
              <p className="text-xs font-mono text-emerald-200/90 leading-relaxed min-h-[36px]">
                {dialogue}
              </p>
            </div>
          </div>

          {/* Heading & Subtitle */}
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Lost in Room 404?
            </h1>
            <p className="text-xs sm:text-sm text-[#8caba2] max-w-md mx-auto">
              This classroom isn&apos;t on Wrenn School&apos;s Week A or Week B timetable. All active study rooms for Periods 1 to 5 are indexed on the main dashboard.
            </p>
          </div>

          {/* Navigation Action Hub */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl bg-[#00875f] hover:bg-[#00a372] px-6 py-3.5 text-xs sm:text-sm font-extrabold text-black active:scale-95 transition-all shadow-[0_0_20px_rgba(0,135,95,0.4)]"
            >
              <Compass className="h-4 w-4" />
              <span>Return to Period Matrix</span>
            </Link>

            <button
              onClick={handleCatClick}
              className="inline-flex items-center gap-2 rounded-xl border border-[#233833] bg-[#142320] hover:bg-[#1a2e2a] hover:border-emerald-500/60 px-5 py-3.5 text-xs sm:text-sm font-bold text-emerald-300 transition-all"
            >
              <Sparkles className="h-4 w-4 text-emerald-400" />
              <span>Pet the Cat ({catMoodCount})</span>
            </button>
          </div>

        </div>
      </main>

      {/* Retro Bottom Bar */}
      <footer className="relative z-10 border-t border-[#1b2b28] bg-[#0d1514] py-3 text-center text-[11px] text-[#597871] font-mono">
        <span>Wrenn FreeRooms • Status 404 • Zero Class Overlap Engine</span>
      </footer>
    </div>
  );
}
