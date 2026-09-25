import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, FileText, Lock, School } from 'lucide-react';

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description: "Terms and conditions for using FreeRooms School live timetable aggregator and study room utility.",
  alternates: {
    canonical: '/terms',
  },
};

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
              <h2 className="text-base font-bold text-[#1b2129] dark:text-[#f0f4f1]">
                1. Purpose of the Platform
              </h2>
              <p>
                FreeRooms School is an independent, open student-built utility designed exclusively to assist Sixth Form students and staff at Wrenn School in identifying vacant study classrooms during designated free periods and independent study blocks.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-[#1b2129] dark:text-[#f0f4f1]">
                2. Disclaimer & Official Independence
              </h2>
              <p>
                FreeRooms School is <strong>not</strong> an official service of, endorsed by, or operated by Wrenn School, The Key Group, or Arbor Education Ltd. All trademarks and brand names are the property of their respective owners.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-[#1b2129] dark:text-[#f0f4f1]">
                3. User Accounts & Arbor Timetable Sync
              </h2>
              <p>
                When connecting your Arbor account, authentication occurs directly and securely with your school&apos;s Arbor MIS server. FreeRooms acts as an ephemeral client proxy.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-[#1b2129] dark:text-[#f0f4f1]">
                4. Anonymous Crowdsourcing
              </h2>
              <p>
                All room contributions are published anonymously without any personal attribution, names, or student email addresses.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-[#1b2129] dark:text-[#f0f4f1]">
                5. Acceptable Use
              </h2>
              <p>
                Users agree not to submit false room availability data, disrupt school operations, or attempt unauthorized access to infrastructure.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
