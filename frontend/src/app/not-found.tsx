'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  const [grid, setGrid] = useState<number[][]>(() =>
    LEVELS[0].grid.map(row => [...row])
  );
  const [pionPos, setPionPos] = useState<{ r: number; c: number }>({ r: 0, c: 0 });
  const [holePos, setHolePos] = useState<{ r: number; c: number }>({ r: 0, c: 0 });
  const [moves, setMoves] = useState(0);
  const [isRotating, setIsRotating] = useState(false);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const [isFalling, setIsFalling] = useState(false);

  const boardRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);

  // Initialize level
  const loadLevel = useCallback((idx: number) => {
    const lvl = LEVELS[idx] || LEVELS[0];
    const initialGrid = lvl.grid.map(row => [...row]);

    let pion = { r: 0, c: 0 };
    let hole = { r: 0, c: 0 };

    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (initialGrid[r][c] === 3) pion = { r, c };
        if (initialGrid[r][c] === 2) hole = { r, c };
      }
    }

    setLevelIndex(idx);
    setGrid(initialGrid);
    setPionPos(pion);
    setHolePos(hole);
    setMoves(0);
    setIsWon(false);
    setIsRotating(false);
    setRotationAngle(0);
    setIsFalling(false);
  }, []);

  useEffect(() => {
    loadLevel(0);
  }, [loadLevel]);

  // Apply gravity: drop player straight down
  const applyGravity = useCallback(
    (currentGrid: number[][], currentPion: { r: number; c: number }, currentHole: { r: number; c: number }) => {
      const { r: fromR, c } = currentPion;
      let destR = fromR;

      for (let row = fromR + 1; row < SIZE; row++) {
        const val = currentGrid[row][c];
        if (val === 1) break; // Hits wall
        destR = row;
        if (row === currentHole.r && c === currentHole.c) break; // Hits goal
      }

      if (destR === fromR) {
        // Did not move; check if on hole
        if (fromR === currentHole.r && c === currentHole.c) {
          setIsWon(true);
          try {
            confetti({
              particleCount: 50,
              spread: 60,
              origin: { y: 0.6 },
              colors: ['#000000', '#555555', '#aaaaaa']
            });
          } catch {}
        }
        setIsRotating(false);
        setIsFalling(false);
        return;
      }

      setIsFalling(true);
      const newGrid = currentGrid.map(row => [...row]);
      newGrid[fromR][c] = 0;
      newGrid[destR][c] = 3;

      // Animate fall duration
      setTimeout(() => {
        setGrid(newGrid);
        setPionPos({ r: destR, c });
        setIsFalling(false);
        setIsRotating(false);

        if (destR === currentHole.r && c === currentHole.c) {
          setIsWon(true);
          try {
            confetti({
              particleCount: 60,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#000000', '#333333', '#888888']
            });
          } catch {}
        }
      }, 160);
    },
    []
  );

  // Rotate board
  const handleRotate = useCallback(
    (dir: 'left' | 'right') => {
      if (isRotating || isWon) return;

      setIsRotating(true);
      setMoves(m => m + 1);

      const angleDelta = dir === 'right' ? 90 : -90;
      setRotationAngle(prev => prev + angleDelta);

      // Perform matrix rotation after visual turn
      setTimeout(() => {
        const nextGrid = Array.from({ length: SIZE }, () => new Array(SIZE).fill(0));

        for (let r = 0; r < SIZE; r++) {
          for (let c = 0; c < SIZE; c++) {
            if (dir === 'right') {
              nextGrid[c][SIZE - 1 - r] = grid[r][c];
            } else {
              nextGrid[SIZE - 1 - c][r] = grid[r][c];
            }
          }
        }

        let nextPion: { r: number; c: number };
        let nextHole: { r: number; c: number };

        if (dir === 'right') {
          nextPion = { r: pionPos.c, c: SIZE - 1 - pionPos.r };
          nextHole = { r: holePos.c, c: SIZE - 1 - holePos.r };
        } else {
          nextPion = { r: SIZE - 1 - pionPos.c, c: pionPos.r };
          nextHole = { r: SIZE - 1 - holePos.c, c: holePos.r };
        }

        setGrid(nextGrid);
        setPionPos(nextPion);
        setHolePos(nextHole);

        // Reset visual rotation transform instantly without transition
        setRotationAngle(0);

        // Immediately drop pawn downward with gravity
        applyGravity(nextGrid, nextPion, nextHole);
      }, 380);
    },
    [isRotating, isWon, grid, pionPos, holePos, applyGravity]
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        handleRotate('left');
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        handleRotate('right');
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        loadLevel(levelIndex);
      } else if ((e.key === 'Enter' || e.key === ' ') && isWon) {
        e.preventDefault();
        const next = (levelIndex + 1) % LEVELS.length;
        loadLevel(next);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleRotate, loadLevel, levelIndex, isWon]);

  // Touch Swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diffX = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(diffX) > 40) {
      if (diffX > 0) handleRotate('right');
      else handleRotate('left');
    }
    touchStartX.current = null;
  };

  const currentLevel = LEVELS[levelIndex] || LEVELS[0];

  return (
    <div
      className="min-h-screen w-full bg-[#ffffff] text-[#000000] flex flex-col justify-between items-center box-border p-4 sm:p-6 select-none font-sans"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top Spacer */}
      <div className="w-full" />

      {/* Center Game Core */}
      <div className="flex flex-col items-center w-full max-w-[520px]">
        {/* Header: Score / 404 / Level */}
        <div className="flex items-center justify-between w-full mb-3.5 px-1 font-mono">
          <span className="text-xs sm:text-sm font-semibold tracking-widest text-[#000000]">
            Moves: {moves}
          </span>
          <span className="text-xs sm:text-sm font-extrabold tracking-[0.2em] uppercase text-[#000000]">
            404
          </span>
          <span className="text-xs sm:text-sm font-medium tracking-widest text-[#000000]/50">
            {currentLevel.label}
          </span>
        </div>

        {/* 13x13 Game Board Container */}
        <div className="relative w-[min(88vw,70vh,460px)] h-[min(88vw,70vh,460px)]">
          {/* Rotating Board */}
          <div
            ref={boardRef}
            className="w-full h-full border-2 border-[#000000] grid bg-white relative box-border"
            style={{
              gridTemplateColumns: `repeat(${SIZE}, 1fr)`,
              gridTemplateRows: `repeat(${SIZE}, 1fr)`,
              transform: `rotate(${rotationAngle}deg)`,
              transition: isRotating ? 'transform 0.38s cubic-bezier(0.65, 0, 0.35, 1)' : 'none',
              transformOrigin: 'center center',
            }}
          >
            {grid.map((row, r) =>
              row.map((val, c) => {
                const isWall = val === 1;
                const isGoal = r === holePos.r && c === holePos.c;
                const isPion = val === 3;

                return (
                  <div
                    key={`${r}-${c}`}
                    className={`relative box-border ${isWall ? 'bg-[#000000]' : 'bg-transparent'}`}
                  >
                    {/* Goal Exit Hole */}
                    {isGoal && (
                      <div className="absolute inset-[15%] rounded-full border-2 border-dashed border-[#000000] flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#000000]/30" />
                      </div>
                    )}

                    {/* Player Pawn (Black Disk) */}
                    {isPion && (
                      <div className="absolute inset-[15%] rounded-full bg-[#000000] transition-all duration-150 shadow-xs" />
                    )}
                  </div>
                );
              })
            )}
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
                  loadLevel(next);
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
            onClick={() => handleRotate('left')}
            disabled={isRotating}
            className="flex-1 py-2.5 px-3 rounded-full border border-[#000000] text-xs font-bold text-[#000000] hover:bg-[#000000] hover:text-white active:scale-95 transition-all disabled:opacity-50"
          >
            ← Left
          </button>

          <button
            onClick={() => loadLevel(levelIndex)}
            disabled={isRotating}
            className="py-2.5 px-4 rounded-full border border-[#000000]/30 text-xs font-bold text-[#000000]/70 hover:border-[#000000] hover:text-[#000000] active:scale-95 transition-all disabled:opacity-50"
          >
            Restart
          </button>

          <button
            onClick={() => handleRotate('right')}
            disabled={isRotating}
            className="flex-1 py-2.5 px-3 rounded-full border border-[#000000] text-xs font-bold text-[#000000] hover:bg-[#000000] hover:text-white active:scale-95 transition-all disabled:opacity-50"
          >
            Right →
          </button>
        </div>
      </div>

      {/* Hints & Home Footer */}
      <div className="flex flex-col items-center gap-2 text-center my-2 max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-full border border-[#000000]/20 hover:border-[#000000] px-5 py-1.5 text-xs font-bold text-[#000000] transition-all hover:scale-105 active:scale-95"
        >
          <span>Home</span>
        </Link>
        <p className="text-[11px] font-mono text-[#000000]/40 mt-1">
          Rotate the board. Let it fall. Find the exit.
        </p>
      </div>
    </div>
  );
}
