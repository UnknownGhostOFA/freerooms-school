'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import confetti from 'canvas-confetti';

const SIZE = 13;

interface LevelData {
  par: number;
  label: string;
  grid: number[][];
}

const LEVELS: LevelData[] = [
  {
    par: 4,
    label: 'Tutorial',
    grid: [
      [1,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,1,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,3,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,2],
    ],
  },
  {
    par: 6,
    label: 'Level 1',
    grid: [
      [1,0,0,0,0,0,0,0,0,1,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,1,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,1,0,0],
      [1,1,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,3,0,0,0],
      [0,0,0,0,0,0,0,1,0,0,2,0,0],
      [0,0,0,0,0,0,0,0,0,0,1,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0],
    ],
  },
  {
    par: 8,
    label: 'Level 2',
    grid: [
      [1,0,0,1,0,0,0,0,0,1,0,0,0],
      [0,1,0,0,0,0,0,0,0,0,0,1,0],
      [0,0,3,0,0,0,0,0,0,0,0,0,0],
      [0,0,1,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,1,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,1,0,0],
      [1,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,1,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,2,0,0,0],
      [0,0,0,0,0,0,0,1,0,1,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,1,0,1],
      [0,0,0,1,0,0,0,0,0,0,0,0,0],
    ],
  },
  {
    par: 13,
    label: 'Level 3',
    grid: [
      [1,0,0,1,0,0,0,0,1,1,0,0,0],
      [0,1,0,0,0,0,1,0,0,0,0,1,0],
      [0,0,2,0,0,0,0,0,0,0,0,0,0],
      [0,0,1,0,0,0,0,1,0,0,0,0,0],
      [0,0,0,0,1,0,0,0,0,0,0,0,0],
      [0,1,0,0,0,0,0,0,0,0,1,0,0],
      [1,0,0,0,0,0,3,0,0,1,0,0,0],
      [0,0,0,1,0,0,1,0,0,0,0,0,1],
      [0,0,0,0,1,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,1,0,1,0,0,1],
      [0,0,0,0,0,0,0,0,0,0,1,0,1],
      [1,0,0,1,0,1,0,1,0,0,0,0,0],
    ],
  },
  {
    par: 12,
    label: 'Level 4',
    grid: [
      [1,0,0,1,0,0,0,0,1,1,0,0,0],
      [0,1,0,0,0,0,0,0,0,0,0,1,0],
      [0,0,0,0,0,1,1,0,1,0,0,0,0],
      [0,0,1,0,1,0,0,1,0,0,0,0,0],
      [0,0,0,0,1,0,0,0,0,0,0,0,0],
      [1,1,0,0,1,0,0,0,0,0,1,0,0],
      [0,0,0,1,0,0,2,0,0,1,0,0,0],
      [1,0,0,1,0,0,1,0,0,0,1,0,1],
      [0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,1,0,0,0,0,0,0,0],
      [1,0,0,0,0,0,0,1,0,1,0,0,1],
      [0,0,1,0,0,0,0,0,0,0,1,0,1],
      [1,0,0,1,0,1,3,1,0,0,0,0,1],
    ],
  },
  {
    par: 2,
    label: '404 Master',
    grid: [
      [0,1,0,0,1,1,1,0,0,0,0,0,0],
      [0,1,1,0,1,1,1,1,0,0,0,0,0],
      [0,1,1,1,0,1,3,0,0,0,0,0,0],
      [0,0,0,0,0,1,1,1,1,1,0,1,0],
      [0,1,0,0,2,1,1,0,0,0,0,0,0],
      [0,1,1,0,1,1,1,1,0,0,0,0,0],
      [0,1,1,1,0,1,0,1,0,0,0,0,0],
      [0,1,0,0,1,1,1,0,0,0,0,0,0],
      [0,1,0,0,0,1,0,0,0,0,0,0,0],
      [0,0,0,0,0,1,1,1,1,1,0,1,0],
      [0,0,0,0,0,0,0,1,0,1,1,0,0],
      [0,0,0,0,0,0,0,0,0,1,1,0,0],
      [0,0,0,0,0,0,0,1,0,1,1,0,0],
    ],
  },
];

export default function NotFound() {
  const [levelIndex, setLevelIndex] = useState(0);
  const [moves, setMoves] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const [isBusy, setIsBusy] = useState(false);

  // Ball animated pixel position in percentage (0 to 100)
  const [ballPos, setBallPos] = useState({ r: 0, c: 0 });
  const [holePos, setHolePos] = useState({ r: 0, c: 0 });
  const [boardRotation, setBoardRotation] = useState(0);

  // Dynamic grid state
  const gridRef = useRef<number[][]>([]);
  const pionRef = useRef<{ r: number; c: number }>({ r: 0, c: 0 });
  const holeRef = useRef<{ r: number; c: number }>({ r: 0, c: 0 });
  const boardElRef = useRef<HTMLDivElement>(null);
  const currentLevel = LEVELS[levelIndex] || LEVELS[0];

  // Load level cleanly
  const initLevel = useCallback((idx: number) => {
    const lvl = LEVELS[idx] || LEVELS[0];
    const newGrid = lvl.grid.map(row => [...row]);

    let pion = { r: 0, c: 0 };
    let hole = { r: 0, c: 0 };

    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (newGrid[r][c] === 3) {
          pion = { r, c };
          newGrid[r][c] = 0; // Pawn tracked separately for continuous smooth animation
        }
        if (newGrid[r][c] === 2) {
          hole = { r, c };
        }
      }
    }

    gridRef.current = newGrid;
    pionRef.current = pion;
    holeRef.current = hole;

    setLevelIndex(idx);
    setMoves(0);
    setIsWon(false);
    setIsBusy(false);
    setBoardRotation(0);
    setBallPos(pion);
    setHolePos(hole);
  }, []);

  useEffect(() => {
    initLevel(0);
  }, [initLevel]);

  // Rotate Matrix internally
  const rotateGridMatrix = (dir: 'left' | 'right') => {
    const old = gridRef.current;
    const next = Array.from({ length: SIZE }, () => new Array(SIZE).fill(0));

    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (dir === 'right') {
          next[c][SIZE - 1 - r] = old[r][c];
        } else {
          next[SIZE - 1 - c][r] = old[r][c];
        }
      }
    }

    const p = pionRef.current;
    const h = holeRef.current;

    const nextPion = dir === 'right'
      ? { r: p.c, c: SIZE - 1 - p.r }
      : { r: SIZE - 1 - p.c, c: p.r };

    const nextHole = dir === 'right'
      ? { r: h.c, c: SIZE - 1 - h.r }
      : { r: SIZE - 1 - h.c, c: h.r };

    gridRef.current = next;
    pionRef.current = nextPion;
    holeRef.current = nextHole;
    setHolePos(nextHole);
  };

  // Animate ball drop with cubic ease-in gravity (t^3)
  const animateBallGravity = () => {
    const { r: fromR, c } = pionRef.current;
    let destR = fromR;

    for (let row = fromR + 1; row < SIZE; row++) {
      const val = gridRef.current[row][c];
      if (val === 1) break; // Hits a wall
      destR = row;
      if (row === holeRef.current.r && c === holeRef.current.c) break; // Hits exit
    }

    if (destR === fromR) {
      // Check if won
      if (fromR === holeRef.current.r && c === holeRef.current.c) {
        triggerVictory();
      }
      setIsBusy(false);
      return;
    }

    const distance = destR - fromR;
    const duration = Math.min(90 + distance * 36, 450); // Fluid gravity timing
    const startTs = performance.now();

    const frameStep = (now: number) => {
      const elapsed = now - startTs;
      const progress = Math.min(elapsed / duration, 1);
      const easedGravity = progress * progress * progress; // Real gravity acceleration!

      const currentR = fromR + (destR - fromR) * easedGravity;
      setBallPos({ r: currentR, c });

      if (progress < 1) {
        requestAnimationFrame(frameStep);
      } else {
        pionRef.current = { r: destR, c };
        setBallPos({ r: destR, c });
        setIsBusy(false);

        if (destR === holeRef.current.r && c === holeRef.current.c) {
          triggerVictory();
        }
      }
    };

    requestAnimationFrame(frameStep);
  };

  // Trigger Victory State
  const triggerVictory = () => {
    setIsWon(true);
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#000000', '#444444', '#888888']
      });
    } catch {}
  };

  // Trigger Rotation with smooth transition & subsequent gravity drop
  const rotate = (dir: 'left' | 'right') => {
    if (isBusy || isWon) return;

    setIsBusy(true);
    setMoves(m => m + 1);

    const board = boardElRef.current;
    if (!board) return;

    const angleChange = dir === 'right' ? 90 : -90;

    // 1. Smoothly animate visual rotation
    board.style.transition = 'transform 0.38s cubic-bezier(0.65, 0, 0.35, 1)';
    board.style.transform = `rotate(${angleChange}deg)`;

    const handleTransitionEnd = () => {
      board.removeEventListener('transitionend', handleTransitionEnd);

      // 2. Instantly reset transform angle while rotating the underlying matrix
      board.style.transition = 'none';
      board.style.transform = 'rotate(0deg)';

      rotateGridMatrix(dir);
      setBallPos(pionRef.current);

      // Force synchronous DOM reflow so resetting to 0deg doesn't flash
      void board.offsetWidth;

      // 3. Drop the ball with smooth physics acceleration
      animateBallGravity();
    };

    board.addEventListener('transitionend', handleTransitionEnd, { once: true });
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        rotate('left');
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        rotate('right');
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        initLevel(levelIndex);
      } else if ((e.key === 'Enter' || e.key === ' ') && isWon) {
        e.preventDefault();
        const next = (levelIndex + 1) % LEVELS.length;
        initLevel(next);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isBusy, isWon, levelIndex]);

  // Touch Swipe navigation
  const touchStartX = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diffX = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(diffX) > 40) {
      if (diffX > 0) rotate('right');
      else rotate('left');
    }
    touchStartX.current = null;
  };

  return (
    <div
      className="min-h-screen w-full bg-[#ffffff] text-[#000000] flex flex-col justify-between items-center box-border p-4 sm:p-6 select-none font-sans"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top Header */}
      <div className="w-full flex items-center justify-between max-w-[520px] pt-1 font-mono">
        <span className="text-xs sm:text-sm font-semibold tracking-widest text-[#000000]">
          Moves: {moves}
        </span>
        <span className="text-xs sm:text-sm font-black tracking-[0.2em] uppercase text-[#000000]">
          404
        </span>
        <span className="text-xs sm:text-sm font-medium tracking-widest text-[#000000]/50">
          {currentLevel.label}
        </span>
      </div>

      {/* Main Game Core */}
      <div className="flex flex-col items-center w-full max-w-[520px] my-auto">
        {/* 13x13 Game Board Container */}
        <div className="relative w-[min(88vw,68vh,460px)] h-[min(88vw,68vh,460px)]">
          {/* Rotating Board */}
          <div
            ref={boardElRef}
            className="w-full h-full border-2 border-[#000000] grid bg-white relative box-border overflow-hidden"
            style={{
              gridTemplateColumns: `repeat(${SIZE}, 1fr)`,
              gridTemplateRows: `repeat(${SIZE}, 1fr)`,
              transformOrigin: 'center center',
            }}
          >
            {/* Grid Cells (Walls and Empty slots) */}
            {gridRef.current.length > 0 &&
              gridRef.current.map((row, r) =>
                row.map((val, c) => (
                  <div
                    key={`${r}-${c}`}
                    className={`box-border ${val === 1 ? 'bg-[#000000]' : 'bg-transparent'}`}
                  />
                ))
              )}

            {/* Exit Goal Portal */}
            <div
              className="absolute pointer-events-none transition-all duration-75"
              style={{
                width: `${100 / SIZE}%`,
                height: `${100 / SIZE}%`,
                top: `${holePos.r * (100 / SIZE)}%`,
                left: `${holePos.c * (100 / SIZE)}%`,
              }}
            >
              <div className="absolute inset-[14%] rounded-full border-2 border-dashed border-[#000000] flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-[#000000]/30" />
              </div>
            </div>

            {/* Continuous Smooth Player Ball */}
            <div
              className="absolute pointer-events-none z-10 will-change-transform"
              style={{
                width: `${100 / SIZE}%`,
                height: `${100 / SIZE}%`,
                top: `${ballPos.r * (100 / SIZE)}%`,
                left: `${ballPos.c * (100 / SIZE)}%`,
              }}
            >
              <div className="absolute inset-[15%] rounded-full bg-[#000000] shadow-sm" />
            </div>
          </div>

          {/* Victory Overlay */}
          {isWon && (
            <div className="absolute inset-0 bg-white/95 backdrop-blur-2xs flex flex-col items-center justify-center gap-3 animate-in fade-in zoom-in-95 duration-200 border-2 border-[#000000]">
              <div className="text-xl sm:text-2xl font-black uppercase tracking-widest text-[#000000]">
                Level complete
              </div>
              <div className="text-xs sm:text-sm font-mono text-[#000000]/70">
                Completed in {moves} moves (Par: {currentLevel.par})
              </div>
              <button
                onClick={() => {
                  const next = (levelIndex + 1) % LEVELS.length;
                  initLevel(next);
                }}
                className="mt-2 inline-flex items-center gap-2 rounded-full bg-[#000000] text-white px-6 py-2.5 text-xs font-bold hover:bg-[#262626] active:scale-95 transition-all shadow-sm"
              >
                <span>Next level →</span>
              </button>
            </div>
          )}
        </div>

        {/* Game Controls */}
        <div className="flex items-center justify-center gap-2.5 mt-4 w-full">
          <button
            onClick={() => rotate('left')}
            disabled={isBusy}
            className="flex-1 py-2.5 px-3 rounded-full border border-[#000000] text-xs font-bold text-[#000000] hover:bg-[#000000] hover:text-white active:scale-95 transition-all disabled:opacity-40"
          >
            ← Left
          </button>

          <button
            onClick={() => initLevel(levelIndex)}
            disabled={isBusy}
            className="py-2.5 px-4 rounded-full border border-[#000000]/30 text-xs font-bold text-[#000000]/70 hover:border-[#000000] hover:text-[#000000] active:scale-95 transition-all disabled:opacity-40"
          >
            Restart
          </button>

          <button
            onClick={() => rotate('right')}
            disabled={isBusy}
            className="flex-1 py-2.5 px-3 rounded-full border border-[#000000] text-xs font-bold text-[#000000] hover:bg-[#000000] hover:text-white active:scale-95 transition-all disabled:opacity-40"
          >
            Right →
          </button>
        </div>
      </div>

      {/* Hints & Home Footer */}
      <div className="flex flex-col items-center gap-2 text-center pb-2 max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-full border border-[#000000]/20 hover:border-[#000000] px-5 py-1.5 text-xs font-bold text-[#000000] transition-all hover:scale-105 active:scale-95"
        >
          <span>Home</span>
        </Link>
        <p className="text-[11px] font-mono text-[#000000]/40">
          Rotate the board. Let it fall. Find the exit.
        </p>
      </div>
    </div>
  );
}
