'use client';

import React from 'react';
import Link from 'next/link';
import {
  ExternalLink,
  ShieldCheck,
  Calendar,
  Sparkles,
  School
} from 'lucide-react';

function GithubIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

export function CustomFooter() {
  return (
    <footer className="border-t border-[#dbe1dd] dark:border-[#28332c] bg-white dark:bg-[#151b17] pt-12 sm:pt-16 pb-8 transition-colors">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* 1. Catchphrase / Quote Banner */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <p className="text-lg sm:text-2xl md:text-3xl font-serif italic text-[#1b2129] dark:text-[#f0f4f1] tracking-tight leading-snug px-4">
            &ldquo;Peeking through door windows and guessing isn&rsquo;t a study plan.&rdquo;
          </p>
          <div className="h-1.5 w-16 bg-[#7fb743] rounded-full mx-auto mt-4" />
        </div>

        {/* 2. Middle Info & Navigation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-[#eaeeec] dark:border-[#28332c]">
          {/* Col A: About */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-black text-xl tracking-tight text-[#7fb743]">
                FreeRooms School
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#edf6e4] dark:bg-[#233120] text-[#7fb743] border border-[#7fb743]/30">
                Wrenn 6th Form
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#596560] dark:text-[#8b9c92] leading-relaxed max-w-md">
              Real-time 2-week study room matrix and timetable aggregator. Eliminates collision guessing by cross-referencing Arbor timetabled classes with open sixth form study blocks.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#596560] dark:text-[#8b9c92] pt-1">
              <span className="h-2 w-2 rounded-full bg-[#7fb743] animate-pulse" />
              <span>Live Academic Matrix • Week A & Week B Synchronized</span>
            </div>
          </div>

          {/* Col B: Quick Links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#1b2129] dark:text-[#f0f4f1]">
              Navigation & Legal
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link
                  href="/"
                  className="text-[#596560] dark:text-[#8b9c92] hover:text-[#7fb743] dark:hover:text-[#94cb58] font-semibold transition-colors"
                >
                  Live Study Matrix
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-[#596560] dark:text-[#8b9c92] hover:text-[#7fb743] dark:hover:text-[#94cb58] font-semibold transition-colors"
                >
                  Terms and Conditions
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-[#596560] dark:text-[#8b9c92] hover:text-[#7fb743] dark:hover:text-[#94cb58] font-semibold transition-colors"
                >
                  Privacy Policy & Data
                </Link>
              </li>
              <li>
                <a
                  href="https://wrenn-school.uk.arbor.sc"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#596560] dark:text-[#8b9c92] hover:text-[#7fb743] dark:hover:text-[#94cb58] font-semibold transition-colors inline-flex items-center gap-1"
                >
                  <span>Wrenn Arbor Portal</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Col C: Open Source & Code Repository */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#1b2129] dark:text-[#f0f4f1]">
              Open Source
            </h4>
            <p className="text-xs text-[#596560] dark:text-[#8b9c92] leading-relaxed">
              Built openly for students. Inspect the source code, contribute improvements, or review our privacy policies on GitHub.
            </p>
            <div className="pt-1">
              <a
                href="https://github.com/UnknownGhostOFA/freerooms-school"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 rounded-xl bg-[#1b2129] dark:bg-[#222c25] hover:bg-[#2c3732] text-white px-4 py-2.5 text-xs sm:text-sm font-bold border border-[#dbe1dd]/30 dark:border-[#28332c] shadow-2xs transition-all active:scale-95 touch-manipulation"
              >
                <GithubIcon className="h-4 w-4" />
                <span>Source Code</span>
                <ExternalLink className="h-3 w-3 opacity-70" />
              </a>
            </div>
          </div>
        </div>

        {/* 3. Big Bold Branding Text */}
        <div className="pt-10 sm:pt-14 pb-4 text-center select-none overflow-hidden">
          <h2 className="text-[15vw] sm:text-[14vw] md:text-[12vw] lg:text-[140px] font-black tracking-tighter leading-none text-[#1b2129]/10 dark:text-[#f0f4f1]/10 hover:text-[#7fb743]/20 transition-colors duration-300 uppercase font-sans">
            FreeRooms
          </h2>
        </div>

        {/* 4. Bottom Disclaimer & Copyright */}
        <div className="pt-4 border-t border-[#eaeeec] dark:border-[#28332c] text-center space-y-1 text-[11px] sm:text-xs text-[#8c9692] dark:text-[#607066]">
          <p>
            Independent student utility. Not affiliated with, endorsed by, or officially associated with Wrenn School or Arbor Education / The Key Group.
          </p>
          <p>
            &copy; {new Date().getFullYear()} FreeRooms School • Built with Next.js & Arbor MIS API
          </p>
        </div>
      </div>
    </footer>
  );
}
