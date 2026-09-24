'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Lock, EyeOff, Server, Cookie } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#f4f6f5] text-[#1b2129] flex flex-col font-sans">
      {/* Header */}
      <header className="bg-[#005047] text-white px-4 py-3 sm:px-6 shadow-xs">
        <div className="mx-auto max-w-4xl flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-white hover:text-emerald-200 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Back to Matrix</span>
          </Link>
          <span className="text-xs font-semibold bg-[#0d685d] text-emerald-100 px-2.5 py-0.5 rounded border border-emerald-500/30">
            Privacy Policy
          </span>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-8">
        <div className="bg-white rounded-2xl border border-[#dbe1dd] p-6 sm:p-10 shadow-sm space-y-6">
          <div className="border-b border-[#eaeeec] pb-4">
            <div className="flex items-center gap-2 text-[#005047] font-bold text-xs uppercase tracking-wider mb-1">
              <ShieldCheck className="h-4 w-4" />
              <span>Data & Privacy Protection</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#1b2129]">
              Privacy Policy & Data Transparency
            </h1>
            <p className="text-xs text-[#596560] mt-1">
              Last updated: September 2026 • FreeRooms School
            </p>
          </div>

          <div className="space-y-5 text-xs sm:text-sm text-[#4d5954] leading-relaxed">
            {/* Zero Credential Storage Highlight */}
            <div className="rounded-xl bg-[#e3f5ec] border border-[#00875f]/40 p-4 flex items-start gap-3">
              <Lock className="h-5 w-5 text-[#005047] shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-[#005047] text-sm">
                  Zero Credential & Zero PII Storage Policy
                </h3>
                <p className="text-xs text-[#1b2129] mt-0.5">
                  FreeRooms <strong>never</strong> stores your Arbor password, your personal school email, your real name, or your private academic records on our servers or databases.
                </p>
              </div>
            </div>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-[#1b2129] flex items-center gap-2">
                <Lock className="h-4 w-4 text-[#005047]" />
                1. How Login Information is Handled
              </h2>
              <p>
                When you sign in with your Arbor school credentials:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Your username and password are sent directly over an encrypted HTTPS connection to Wrenn School&apos;s Arbor authentication endpoint.</li>
                <li>Once authentication succeeds and temporary session cookies are issued, your password is <strong>immediately purged from active memory</strong>.</li>
                <li>No credentials are committed to databases, logged to server output, or shared with third parties.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-[#1b2129] flex items-center gap-2">
                <Server className="h-4 w-4 text-[#005047]" />
                2. What Data is Saved on MongoDB Atlas
              </h2>
              <p>
                To provide the crowdsourced matrix for other Sixth Form students, FreeRooms only synchronizes non-personal room and period schedule records:
              </p>
              <div className="bg-[#fafbfc] border border-[#dbe1dd] rounded-lg p-3 font-mono text-xs text-[#1b2129]">
                ✓ Room Codes (e.g. 6B, 6D, 6F, 22)<br />
                ✓ Period Numbers (Periods 1 to 5)<br />
                ✓ Day of the Week (Mon – Fri) & Week Type (Week A / Week B)<br />
                ✗ Zero Student Real Names<br />
                ✗ Zero Student Email Addresses<br />
                ✗ Zero Behavior / Attendance / Grade Data
              </div>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-[#1b2129] flex items-center gap-2">
                <EyeOff className="h-4 w-4 text-[#005047]" />
                3. Complete Platform Anonymity
              </h2>
              <p>
                FreeRooms is an anonymous utility. All room submissions and study allocations are published as <em>&quot;Anonymous Submission&quot;</em>. There are no public user profiles, leaderboards, or visible authorship markers.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-[#1b2129] flex items-center gap-2">
                <Cookie className="h-4 w-4 text-[#005047]" />
                4. Cookies & Local Storage
              </h2>
              <p>
                We use browser <code className="bg-[#eaeeec] px-1.5 py-0.5 rounded text-xs font-bold text-[#005047]">localStorage</code> strictly for functional purposes:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Remembering your selected academic week (Week A vs Week B).</li>
                <li>Holding your active login token so you don&apos;t have to log in on every single page navigation.</li>
                <li>Caching room schedules offline for fast loading.</li>
              </ul>
            </section>
          </div>

          <div className="pt-6 border-t border-[#eaeeec] flex flex-wrap items-center justify-between gap-4">
            <Link
              href="/terms"
              className="text-xs font-bold text-[#005047] hover:underline"
            >
              ← View Terms and Conditions
            </Link>
            <Link
              href="/"
              className="rounded-xl bg-[#005047] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#003630] transition-colors"
            >
              I Understand & Return Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
