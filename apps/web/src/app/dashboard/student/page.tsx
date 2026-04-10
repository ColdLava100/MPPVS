"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, Activity } from 'lucide-react';

import StudentHeader from '@/components/ui/header2';
import Footer from '@/components/ui/footer';
import UniversalSidebar from '@/components/ui/sidebar';
import { MetricBox, StatBar, VisionariesGrid } from './components';

const STATS_DATA = [
  { label: 'Total Population', value: '1,024' },
  { label: 'Votes Cast', value: '842', color: 'text-red-500' },
  { label: 'Closed In', value: '02 : 14 : 55', color: 'text-red-500' },
  { label: 'Next Update', value: '00 : 15', color: 'text-blue-400' },
];

const LEADERS_DATA = [
  {
    name: 'Ahmad Daniel',
    dept: 'DCS',
    img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974',
    quote: 'Proposing a digital-first governance model to streamline student feedback and faculty collaboration.',
  },
  {
    name: 'Sarah Alisya',
    dept: 'DBS',
    img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1974',
    quote: 'Focused on sustainable student commerce initiatives and developing industry-standard leadership workshops.',
  },
  {
    name: 'Farhan Razak',
    dept: 'DIA',
    img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1974',
    quote: 'Advocating for financial transparency in student funds and a multi-year audit program.',
  },
];

export default function StudentDashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/2fa/status`, { 
          credentials: 'include' 
        });
        if (res.status === 401 || res.status === 403) {
          router.push('/login');
          return;
        }
      } catch {
        router.push('/login');
        return;
      }
      setIsLoading(false);
    };
    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <p>Loading...</p>
      </div>
    );
  }

  const bgImageUrl = "https://beranang.kpm.edu.my/kpmb/images/speasyimagegallery/albums/7/images/dewan-3.jpg";

  const handleVoteNowClick = () => {
    router.push('/dashboard/student/ballot');
  };

  const handleStopImpersonation = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/stop-impersonation`, {
        method: 'POST',
        credentials: 'include'
      });
      if (res.ok) {
        router.push('/dashboard/superadmin');
      } else {
        alert('Failed to return to superadmin.');
      }
    } catch (err: any) { alert(`Error: ${err.message}`); }
  };

  return (
    <div className="flex h-screen bg-black overflow-hidden relative font-sans text-white">
      <UniversalSidebar role="student" />

      <div className="flex-grow flex flex-col relative overflow-hidden ml-24">
        <button
          onClick={handleStopImpersonation}
          className="bg-red-600 hover:bg-red-700 text-white w-full py-2 text-xs font-bold uppercase tracking-[0.2em] z-50 transition-colors"
        >
          Stop Impersonating (Return to Superadmin)
        </button>

        <StudentHeader onVoteClick={handleVoteNowClick} />

        <main className="flex-grow overflow-y-auto relative custom-scrollbar">
          <div
            className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat transition-all duration-700"
            style={{
              backgroundImage: `url(${bgImageUrl})`,
              filter: 'blur(10px) brightness(0.2)'
            }}
          />

          <div className="relative z-10 p-12 max-w-7xl mx-auto w-full">
            <div className="flex justify-between items-end mb-12">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] mb-4 flex items-center gap-2">
                  <Activity size={14} className="text-red-600 animate-pulse" />
                  MPP 2026 Live Metrics
                </p>
                <h1 className="text-6xl font-bold uppercase tracking-tighter text-white italic leading-none">
                  Campus-Wide <br /> Election Pulse
                </h1>
              </div>
              <div className="flex items-center gap-3 bg-white/5 backdrop-blur-xl px-6 py-3 rounded-full border border-white/10 shadow-2xl">
                <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse shadow-[0_0_12px_rgba(220,38,38,0.9)]" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white italic">Live Updates</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-12">
              <MetricBox code="DBS" votes="412" seats="3/5" color="border-b-blue-600" icon={<span>💼</span>} />
              <MetricBox code="DCS" votes="284" seats="4/5" color="border-b-red-700" icon={<span>💻</span>} />
              <MetricBox code="DIA" votes="198" seats="2/5" color="border-b-orange-600" icon={<span>🧮</span>} />
              <MetricBox code="DLH" votes="106" seats="1/5" color="border-b-green-700" icon={<span>🌿</span>} />
              <MetricBox code="CFAB" votes="324" seats="5/5" color="border-b-yellow-600" icon={<span>💰</span>} />
            </div>

            <StatBar stats={STATS_DATA} />

            <section className="relative rounded-sm p-24 text-white mb-32 overflow-hidden bg-gradient-to-br from-[#4c0519]/90 via-[#2d0a0a]/95 to-black shadow-2xl border border-white/5 backdrop-blur-md">
              <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
                <div className="w-full h-full border-[80px] border-white/10 rounded-full -mr-40 mt-10" />
              </div>
              <div className="relative z-10 max-w-2xl">
                <p className="text-[11px] font-black uppercase tracking-[0.6em] text-yellow-500 mb-10">Student Representative Council 2026</p>
                <h2 className="text-8xl font-bold mb-10 leading-[0.8] tracking-tighter italic uppercase">LEAD THE <br /> FUTURE</h2>
                <p className="text-lg opacity-60 leading-relaxed mb-14 font-light max-w-lg">
                  Your vote is the cornerstone of academic excellence. Choose the visionaries who will shape the next era of our institutional governance.
                </p>
                <button
                  onClick={handleVoteNowClick}
                  className="bg-[#c5a021] text-black px-14 py-6 rounded-sm text-[12px] font-black uppercase tracking-[0.3em] hover:bg-yellow-400 transition-all shadow-2xl active:scale-95 flex items-center gap-4 group"
                >
                  Cast Your Ballot <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </section>

            <VisionariesGrid leaders={LEADERS_DATA} />
          </div>

          <div className="relative z-10 w-full mt-auto">
            <Footer />
          </div>
        </main>
      </div>
    </div>
  );
}