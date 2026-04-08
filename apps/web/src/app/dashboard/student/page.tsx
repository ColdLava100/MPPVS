"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Briefcase,
  Cpu,
  Calculator,
  Leaf,
  Coins,
  ChevronRight,
  Activity,
  BarChart3
} from 'lucide-react';

import StudentHeader from '@/components/ui/header2';
import Footer from '@/components/ui/footer';
import UniversalSidebar from '@/components/ui/sidebar';

export default function StudentDashboard() {
  const router = useRouter();

  // Official KPM Beranang background
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

      {/* 1. UNIVERSAL SIDEBAR (Replaced manual code) */}
      <UniversalSidebar role="student" />

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-grow flex flex-col relative overflow-hidden ml-24">
        {/* Note: ml-24 accounts for the collapsed sidebar width */}

        <button
          onClick={handleStopImpersonation}
          className="bg-red-600 hover:bg-red-700 text-white w-full py-2 text-xs font-bold uppercase tracking-[0.2em] z-50 transition-colors"
        >
          Stop Impersonating (Return to Superadmin)
        </button>

        <StudentHeader onVoteClick={handleVoteNowClick} />

        <main className="flex-grow overflow-y-auto relative custom-scrollbar">
          {/* Background Image Layer */}
          <div
            className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat transition-all duration-700"
            style={{
              backgroundImage: `url(${bgImageUrl})`,
              filter: 'blur(10px) brightness(0.2)'
            }}
          />

          {/* Centered Content Container */}
          <div className="relative z-10 p-12 max-w-7xl mx-auto w-full">

            {/* Header Section */}
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

            {/* Metric Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-12">
              <MetricBox code="DBS" votes="412" seats="3/5" color="border-b-blue-600" icon={<Briefcase size={22} />} />
              <MetricBox code="DCS" votes="284" seats="4/5" color="border-b-red-700" icon={<Cpu size={22} />} />
              <MetricBox code="DIA" votes="198" seats="2/5" color="border-b-orange-600" icon={<Calculator size={22} />} />
              <MetricBox code="DLH" votes="106" seats="1/5" color="border-b-green-700" icon={<Leaf size={22} />} />
              <MetricBox code="CFAB" votes="324" seats="5/5" color="border-b-yellow-600" icon={<Coins size={22} />} />
            </div>

            {/* Stat Bar */}
            <div className="grid grid-cols-2 lg:grid-cols-4 bg-white/5 backdrop-blur-3xl rounded-sm border border-white/10 mb-24 overflow-hidden shadow-2xl">
              <StatItem label="Total Population" value="1,024" />
              <StatItem label="Votes Cast" value="842" color="text-red-500" />
              <StatItem label="Closed In" value="02 : 14 : 55" color="text-red-500" />
              <StatItem label="Next Update" value="00 : 15" color="text-blue-400" />
            </div>

            {/* Hero Section */}
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

            {/* Visionaries Grid */}
            <section className="pb-32">
              <div className="flex items-center gap-8 mb-24">
                <h2 className="text-7xl font-bold uppercase tracking-tighter italic text-white leading-none">Visionaries</h2>
                <div className="flex-grow h-[1px] bg-white/10" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
                <LeaderCard
                  name="Ahmad Daniel"
                  dept="DCS"
                  img="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974"
                  quote="Proposing a digital-first governance model to streamline student feedback and faculty collaboration."
                />
                <LeaderCard
                  name="Sarah Alisya"
                  dept="DBS"
                  img="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1974"
                  quote="Focused on sustainable student commerce initiatives and developing industry-standard leadership workshops."
                />
                <LeaderCard
                  name="Farhan Razak"
                  dept="DIA"
                  img="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1974"
                  quote="Advocating for financial transparency in student funds and a multi-year audit program."
                />
              </div>
            </section>
          </div>

          <div className="relative z-10 w-full mt-auto">
            <Footer />
          </div>
        </main>
      </div>
    </div>
  );
}

{/* REFINED HELPER COMPONENTS */ }

function MetricBox({ code, votes, seats, color, icon }: any) {
  return (
    <div className={`p-8 bg-white/95 backdrop-blur-xl border border-white/20 border-b-[6px] ${color} shadow-2xl group hover:-translate-y-2 transition-all duration-500 rounded-sm`}>
      <div className="flex justify-between items-start mb-10 text-black">
        <div className="text-slate-300 group-hover:text-[#4c0519] transition-colors duration-500">
          {icon || <BarChart3 size={24} />}
        </div>
        <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none">{code}</span>
      </div>
      <div className="text-5xl font-bold mb-2 tracking-tighter text-slate-900 leading-none">{votes}</div>
      <p className="text-[9px] font-black text-slate-400 uppercase mb-10 tracking-[0.2em]">Verified Ballots</p>
      <div className="flex justify-between text-[10px] font-black uppercase mb-4 text-black">
        <span className="text-slate-400">Seats Filled</span>
        <span className="text-[#4c0519]">{seats}</span>
      </div>
      <div className="w-full h-[4px] bg-slate-100 overflow-hidden rounded-full">
        <div className="h-full bg-slate-900 transition-all duration-1000 ease-out" style={{ width: '75%' }} />
      </div>
    </div>
  );
}

function StatItem({ label, value, color = "text-white" }: any) {
  return (
    <div className="p-12 border-r border-white/10 last:border-0 hover:bg-white/5 transition-all duration-300 group">
      <span className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4 group-hover:text-yellow-500 transition-colors">{label}</span>
      <span className={`text-4xl font-bold tracking-tighter ${color} drop-shadow-sm`}>{value}</span>
    </div>
  );
}

function LeaderCard({ name, dept, quote, img }: any) {
  return (
    <div className="group">
      <div className="relative aspect-[4/5] overflow-hidden mb-10 bg-slate-200 grayscale hover:grayscale-0 transition-all duration-1000 shadow-2xl group-hover:shadow-[#4c0519]/40 group-hover:-translate-y-4 rounded-sm border border-white/10">
        <img src={img} alt={name} className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-[1500ms]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90" />
        <div className="absolute bottom-0 left-0 w-full p-12">
          <p className="text-[11px] font-black text-yellow-500 uppercase tracking-[0.5em] mb-4">{dept}</p>
          <h3 className="text-5xl font-bold text-white uppercase tracking-tighter italic leading-none">{name}</h3>
        </div>
      </div>
      <p className="text-base text-slate-400 italic leading-relaxed mb-8 px-6 font-light border-l-2 border-[#4c0519]">"{quote}"</p>
    </div>
  );
}