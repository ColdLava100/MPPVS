"use client";

import React, { useState, useEffect } from 'react';
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
import Header from '@/components/ui/header1';
import Footer from '@/components/ui/footer';

interface CourseMetric {
  course: string;
  votes: number;
  seats: number;
}

interface TopCandidate {
  name: string;
  coursePrefix: string;
  info: string;
  imageUrl: string | null;
}

interface ElectionData {
  activeElection: {
    id: string;
    title: string;
    endDate: string;
    courseSettings: Record<string, number>;
  } | null;
  metrics: {
    totalVoters: number;
    totalVotes: number;
  };
  courseMetrics: CourseMetric[];
  topCandidates: TopCandidate[];
}

export default function SRCVotingPortal() {
  const [electionData, setElectionData] = useState<ElectionData | null>(null);
  const [countdown, setCountdown] = useState('00 : 00 : 00');
  const [isMounted, setIsMounted] = useState(false);
  const bgImageUrl = "https://beranang.kpm.edu.my/kpmb/images/speasyimagegallery/albums/7/images/dewan-3.jpg";

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const fetchData = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/elections/public/metrics`);
        if (res.ok) {
          const data = await res.json();
          setElectionData(data);
        }
      } catch (err) {
        console.error('Failed to fetch election metrics:', err);
      }
    };
    fetchData();
  }, [isMounted]);

  useEffect(() => {
    if (!electionData?.activeElection?.endDate || !isMounted) return;
    const endDate = electionData.activeElection.endDate;
    const interval = setInterval(() => {
      const end = new Date(endDate).getTime();
      const now = Date.now();
      const diff = end - now;
      if (diff > 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        setCountdown(`${String(hours).padStart(2, '0')} : ${String(mins).padStart(2, '0')} : ${String(secs).padStart(2, '0')}`);
      } else {
        setCountdown('CLOSED');
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [electionData, isMounted]);

  const activeTitle = isMounted && electionData?.activeElection?.title ? electionData.activeElection.title : 'Awaiting Next Election';
  const totalPop = (isMounted && electionData?.metrics?.totalVoters) ? electionData.metrics.totalVoters.toLocaleString() : '0';
  const totalVotes = (isMounted && electionData?.metrics?.totalVotes) ? electionData.metrics.totalVotes.toLocaleString() : '0';
  const courseMetrics = (isMounted && electionData?.courseMetrics) ? electionData.courseMetrics : [];

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* BACKGROUND LAYER WITH BLUR */}
      <div
        className="fixed inset-0 z-[-1] bg-cover bg-center bg-no-repeat transition-all duration-700"
        style={{
          backgroundImage: `url(${bgImageUrl})`,
          filter: 'blur(8px) brightness(0.4)'
        }}
      />

      <Header />

      <main className="flex-grow max-w-7xl mx-auto px-4 md:px-10 py-4 md:py-10 w-full relative z-10">

        {/* 1. LIVE METRICS SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
          <div>
            <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em] mb-2 flex items-center gap-2">
              <Activity size={12} className="text-red-500" /> {activeTitle} Live Metrics
            </p>
            <h1 className="text-4xl font-bold uppercase tracking-tighter text-white italic">
              Campus-Wide Election Pulse
            </h1>
          </div>
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 shadow-sm">
            <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-white">Live Updates</span>
          </div>
        </div>

        {/* METRIC GRID - DYNAMIC */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          {courseMetrics.length > 0 ? (
            courseMetrics.map((m, idx) => {
              // Pre-render the icons so React knows they are valid HTML elements
              const dynamicIcons = [
                <Briefcase key="1" size={20} />,
                <Cpu key="2" size={20} />,
                <Calculator key="3" size={20} />,
                <Leaf key="4" size={20} />,
                <Coins key="5" size={20} />
              ];

              return (
                <MetricBox
                  key={m.course}
                  code={m.course}
                  votes={m.votes.toString()}
                  seats={`${Math.min(m.votes, m.seats)}/${m.seats}`}
                  color={['border-b-blue-600', 'border-b-red-900', 'border-b-orange-600', 'border-b-green-700', 'border-b-yellow-600'][idx % 5]}
                  icon={dynamicIcons[idx % 5]}
                />
              );
            })
          ) : (
            <>
              <MetricBox code="DBS" votes="0" seats="0/0" color="border-b-blue-600" icon={<Briefcase size={20} />} />
              <MetricBox code="DCS" votes="0" seats="0/0" color="border-b-red-900" icon={<Cpu size={20} />} />
              <MetricBox code="DIA" votes="0" seats="0/0" color="border-b-orange-600" icon={<Calculator size={20} />} />
              <MetricBox code="DLH" votes="0" seats="0/0" color="border-b-green-700" icon={<Leaf size={20} />} />
              <MetricBox code="CFAB" votes="0" seats="0/0" color="border-b-yellow-600" icon={<Coins size={20} />} />
            </>
          )}
        </div>

        {/* TIME & STATS BAR */}
        <div className="grid grid-cols-2 md:grid-cols-4 bg-white/5 backdrop-blur-lg rounded-sm border border-white/10 mb-16 overflow-hidden shadow-2xl">
          <StatItem label="Total Population" value={totalPop} light />
          <StatItem label="Votes Cast" value={totalVotes} color="text-red-400" light />
          <StatItem label="Closed In" value={countdown} color="text-red-400" light />
          <StatItem label="Next Update" value="00 : 15" color="text-blue-400" light />
        </div>

        {/* 2. HERO BANNER */}
        <section className="relative rounded-xl p-6 md:p-20 text-white mb-16 md:mb-24 overflow-hidden bg-gradient-to-br from-[#4c0519]/90 via-[#2d0a0a]/90 to-black shadow-2xl border border-white/5 backdrop-blur-sm">
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none hidden md:block">
            <div className="w-full h-full border-[40px] border-white/20 rounded-full -mr-40 mt-10" />
          </div>

          <div className="relative z-10 max-w-2xl">
            <p className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.5em] text-yellow-500 mb-4 md:mb-6">Student Representative Council 2024</p>
            <h2 className="text-4xl md:text-7xl font-bold mb-6 md:mb-8 leading-[0.85] tracking-tighter italic uppercase">LEAD THE <br /> FUTURE</h2>
            <p className="text-sm md:text-base opacity-80 leading-relaxed mb-8 md:mb-10 font-light max-w-lg">
              Your vote is the cornerstone of academic excellence. Choose the visionaries who will shape the next era of our institutional governance.
            </p>
            <div className="flex gap-4 md:gap-6">
              <button className="bg-[#c5a021] text-slate-900 px-6 md:px-10 py-3 md:py-4 rounded-sm text-[11px] font-black uppercase tracking-[0.2em] hover:bg-yellow-400 transition-all shadow-lg active:scale-95 flex items-center gap-2">
                Vote Now <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </section>

        {/* 3. VISIONARY LEADERS */}
        <section className="mb-16 md:mb-20">
          <div className="flex items-center gap-4 md:gap-6 mb-10 md:mb-16">
            <h2 className="text-3xl md:text-5xl font-medium uppercase tracking-tighter italic text-white">Visionary Leaders</h2>
            <div className="flex-grow h-[1px] bg-white/20" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            <LeaderCard
              name="Ahmad Daniel"
              dept="Computer Science"
              img="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop"
              quote="Proposing a digital-first governance model to streamline student feedback and faculty collaboration."
            />
            <LeaderCard
              name="Sarah Alisya"
              dept="Business Admin"
              img="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1974&auto=format&fit=crop"
              quote="Focused on sustainable student commerce initiatives and developing industry-standard leadership workshops."
            />
            <LeaderCard
              name="Farhan Razak"
              dept="Accounting"
              img="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1974&auto=format&fit=crop"
              quote="Advocating for financial transparency in student funds and a multi-year audit program."
            />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

/* Sub-components */
function MetricBox({ code, votes, seats, color, icon }: any) {
  return (
    <div className={`p-4 md:p-6 bg-white/95 backdrop-blur-sm border border-white/20 border-b-4 ${color} shadow-xl hover:shadow-2xl transition-all`}>
      <div className="flex justify-between items-start mb-6">
        <div className="text-slate-400 group-hover:text-slate-900 transition-colors">
          {icon || <BarChart3 size={20} />}
        </div>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{code}</span>
      </div>
      <div className="text-4xl font-medium mb-1 tracking-tighter text-slate-900">{votes}</div>
      <p className="text-[9px] font-black text-slate-400 uppercase mb-6 tracking-widest">Verified Ballots</p>

      <div className="flex justify-between text-[9px] font-black uppercase mb-2">
        <span className="text-slate-400">Seats Filled</span>
        <span className="text-slate-900">{seats}</span>
      </div>
      <div className="w-full h-[3px] bg-slate-100 overflow-hidden">
        <div className={`h-full bg-slate-800 transition-all duration-1000`} style={{ width: '70%' }} />
      </div>
    </div>
  );
}

function StatItem({ label, value, color = "text-white", light = false }: any) {
  return (
    <div className="p-4 md:p-8 border-r border-white/10 last:border-0 hover:bg-white/5 transition-colors">
      <span className={`block text-[10px] font-black ${light ? 'text-slate-300' : 'text-slate-400'} uppercase tracking-[0.2em] mb-2`}>{label}</span>
      <span className={`text-2xl font-bold tracking-tighter ${color}`}>{value}</span>
    </div>
  );
}

function LeaderCard({ name, dept, quote, img }: any) {
  return (
    <div className="group">
      <div className="relative aspect-[4/5] overflow-hidden mb-6 bg-slate-200 grayscale hover:grayscale-0 transition-all duration-500 shadow-2xl group-hover:shadow-red-900/20 group-hover:-translate-y-2 rounded-sm border border-white/10">
        <img src={img} alt={name} className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-700" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-transparent to-transparent opacity-90" />
        <div className="absolute bottom-0 left-0 w-full p-8">
          <p className="text-[10px] font-black text-yellow-500 uppercase tracking-[0.3em] mb-2">{dept}</p>
          <h3 className="text-3xl font-medium text-white uppercase tracking-tighter italic leading-none">{name}</h3>
        </div>
      </div>
      <p className="text-sm text-slate-300 italic leading-relaxed mb-6 px-2 font-light">"{quote}"</p>
    </div>
  );
}