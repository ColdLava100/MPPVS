'use client';

import React from 'react';
import Link from 'next/link';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import UniversalHeader from '@/components/ui/universal-header';
import Background from '@/components/ui/background';

export default function SuccessPage() {
  return (
    <div className="min-h-screen overflow-hidden relative font-sans text-white">
      <UniversalHeader role="student" />

      <main className="flex-grow overflow-y-auto relative custom-scrollbar">
        <Background />

        <div className="relative z-10 p-4 md:p-12 max-w-7xl mx-auto w-full flex-grow flex flex-col gap-8 min-h-[calc(100vh-100px)]">
          <div className="flex-grow flex items-center justify-center">
            <div className="bg-white/95 backdrop-blur-xl border border-white/20 border-b-[6px] border-b-green-600 shadow-2xl rounded-sm p-8 md:p-14 max-w-lg w-full text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-8">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h1 className="text-2xl md:text-6xl font-bold uppercase tracking-tighter leading-none text-slate-900 mb-4">
                Vote Recorded!
              </h1>
              <p className="text-sm text-slate-500 leading-relaxed mb-8">
                Your response has been securely logged. Thank you for participating in the election.
              </p>
              <div className="pt-6 border-t border-slate-200">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 bg-[#c5a021] hover:bg-yellow-400 text-black px-6 py-3 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
                >
                  <ArrowLeft size={14} /> Return to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
