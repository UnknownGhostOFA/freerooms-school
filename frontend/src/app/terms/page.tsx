'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, FileText, Lock, School } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#f4f6f5] dark:bg-[#121614] text-[#1b2129] dark:text-[#f0f4f1] flex flex-col font-sans transition-colors">
      {/* Header */}
      <header className="bg-[#7fb743] text-white px-4 py-3 sm:px-6 shadow-xs">
        <div className="mx-auto max-w-4xl flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-white hover:text-white/80 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Back to Matrix</span>
          </Link>
          <span className="text-xs font-semibold bg-white/20 text-white px-2.5 py-0.5 rounded border border-white/30">
            Terms & Conditions
          </span>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-8">
        <div className="bg-white dark:bg-[#1a201c] rounded-2xl border border-[#dbe1dd] dark:border-[#28332c] p-6 sm:p-10 shadow-sm space-y-6 transition-colors">
          <div className="border-b border-[#eaeeec] dark:border-[#28332c] pb-4">
            <div className="flex items-center gap-2 text-[#7fb743] font-bold text-xs uppercase tracking-wider mb-1">
              <FileText className="h-4 w-4" />
              <span>Legal Documentation</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#1b2129] dark:text-[#f0f4f1]">
              Terms and Conditions
            </h1>
            <p className="text-xs text-[#596560] dark:text-[#8b9c92] mt-1">
              Last updated: September 2026 • FreeRooms School
            </p>
          </div>

          <div className="space-y-5 text-xs sm:text-sm text-[#4d5954] dark:text-[#a0b0a6] leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-base font-bold text-[#1b2129] dark:text-[#f0f4f1] flex items-center gap-2">
                1. Independent Student Utility Disclaimer
              </h2>
              <p>
                <strong>FreeRooms School</strong> is an independent, student-developed open utility created solely to assist Sixth Form students at Wrenn School in discovering available private study classrooms.
              </p>
              <div className="rounded-lg bg-[#f2f5f3] dark:bg-[#222c25] border border-[#dbe1dd] dark:border-[#28332c] p-3 text-xs text-[#1b2129] dark:text-[#f0f4f1] font-medium">
                <em>Disclaimer: FreeRooms is not affiliated with, endorsed by, sponsored by, or officially associated with Wrenn School, Arbor Education, The Key Group, or any educational governing body.</em>
              </div>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-[#1b2129] dark:text-[#f0f4f1]">
                2. API Authorization & Automated Timetable Sync
              </h2>
              <p>
                By providing your school Arbor credentials to sign in, you grant FreeRooms explicit authorization to communicate on your behalf with Wrenn School&apos;s Arbor Management Information System (MIS) to retrieve your 2-week academic schedule (Week A & Week B).
              </p>
              <p>
                This authorization is used strictly and exclusively to identify free study periods and room numbers (such as 6B, 6D, 6F, 22). No personal academic, disciplinary, or attendance records are extracted or stored.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-[#1b2129] dark:text-[#f0f4f1]">
                3. Anonymous Crowdsourced Data Sharing
              </h2>
              <p>
                FreeRooms operates on an anonymous crowdsourcing model. When you log in, designated 6th form private study room allocations are synced to a shared cloud database so other students can see open study spaces.
              </p>
              <p>
                All room contributions are published anonymously without any personal attribution, names, or student email addresses.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-[#1b2129] dark:text-[#f0f4f1]">
                4. Academic & School Conduct
              </h2>
              <p>
                Users must follow all standard school rules, code of conduct, and Sixth Form private study guidelines when using classrooms. FreeRooms does not override staff instructions, classroom reservations, or school timetable modifications.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-[#1b2129] dark:text-[#f0f4f1]">
                5. Limitation of Liability
              </h2>
              <p>
                FreeRooms is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis without warranties of any kind. The developers are not liable for any timetable discrepancies, room booking conflicts, or network interruptions.
              </p>
            </section>
          </div>

          <div className="pt-6 border-t border-[#eaeeec] dark:border-[#28332c] flex flex-wrap items-center justify-between gap-4">
            <Link
              href="/privacy"
              className="text-xs font-bold text-[#7fb743] hover:underline"
            >
              Read our Privacy Policy →
            </Link>
            <Link
              href="/"
              className="rounded-xl bg-[#7fb743] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#689934] transition-colors"
            >
              Accept & Return Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
