import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Lock, EyeOff, Server, Cookie } from 'lucide-react';

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy and data transparency commitment for FreeRooms School timetable utility.",
  alternates: {
    canonical: '/privacy',
  },
};

export default function PrivacyPage() {
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
            Privacy Policy
          </span>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-8">
        <div className="bg-white dark:bg-[#1a201c] rounded-2xl border border-[#dbe1dd] dark:border-[#28332c] p-6 sm:p-10 shadow-sm space-y-6 transition-colors">
          <div className="border-b border-[#eaeeec] dark:border-[#28332c] pb-4">
            <div className="flex items-center gap-2 text-[#7fb743] font-bold text-xs uppercase tracking-wider mb-1">
              <ShieldCheck className="h-4 w-4" />
              <span>Data & Privacy Protection</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#1b2129] dark:text-[#f0f4f1]">
              Privacy Policy & Data Transparency
            </h1>
            <p className="text-xs text-[#596560] dark:text-[#8b9c92] mt-1">
              Last updated: September 2026 • FreeRooms School
            </p>
          </div>

          <div className="space-y-5 text-xs sm:text-sm text-[#4d5954] dark:text-[#a0b0a6] leading-relaxed">
            {/* Zero Credential Storage Highlight */}
            <div className="rounded-xl bg-[#edf6e4] dark:bg-[#233120] border border-[#7fb743]/40 p-4 flex items-start gap-3">
              <Lock className="h-5 w-5 text-[#7fb743] shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-[#59862b] dark:text-[#94cb58] text-sm">
                  Zero Credential & Zero PII Storage Policy
                </h3>
                <p className="text-xs text-[#1b2129] dark:text-[#f0f4f1] mt-0.5">
                  FreeRooms <strong>never</strong> stores your Arbor password, your personal school email, your real name, or your private academic records on our servers or databases.
                </p>
              </div>
            </div>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-[#1b2129] dark:text-[#f0f4f1] flex items-center gap-2">
                <EyeOff className="h-4 w-4 text-[#7fb743]" />
                <span>1. What Data We Collect & Store</span>
              </h2>
              <p>
                When you connect your Arbor account, the application extracts room numbers and study period times for Week A and Week B.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-[#1b2129] dark:text-[#f0f4f1] flex items-center gap-2">
                <Server className="h-4 w-4 text-[#7fb743]" />
                <span>2. How Data Is Processed</span>
              </h2>
              <p>
                Room numbers (e.g. &ldquo;6D&rdquo;) and period blocks are combined with data from other students to build a real-time vacancy matrix. No personal data is attached to rooms.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-[#1b2129] dark:text-[#f0f4f1] flex items-center gap-2">
                <Cookie className="h-4 w-4 text-[#7fb743]" />
                <span>3. Essential Cookies & Local Storage</span>
              </h2>
              <p>
                We use browser localStorage strictly for retaining your session state locally on your device.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
