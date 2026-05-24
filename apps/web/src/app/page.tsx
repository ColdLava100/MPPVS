"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  Cpu,
  Calculator,
  Leaf,
  Coins,
  ChevronRight,
  Activity,
  BarChart3,
  Users,
  Vote,
  Clock,
  TrendingUp,
  Award,
} from 'lucide-react';
import Header from '@/components/ui/header1';
import Footer from '@/components/ui/footer';

interface CourseMetric {
  course: string;
  votes: number;
  seats: number;
  candidateCount: number;
}

interface TopCandidate {
  id: string;
  name: string;
  coursePrefix: string;
  info: string;
  imageUrl: string | null;
  spotlightBanner: string | null;
  posters: string[];
  voteCount: number;
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

function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const duration = 1500;
    const start = performance.now();
    const from = 0;

    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.floor(from + (value - from) * eased));
      if (progress < 1) frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [value]);

  return <>{display.toLocaleString()}{suffix}</>;
}

function TurnoutRing({ pct }: { pct: number }) {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="flex items-center gap-4">
      <svg width="100" height="100" className="transform -rotate-90 shrink-0">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
        <circle
          cx="50" cy="50" r={radius}
          fill="none" stroke="#c5a021" strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000"
        />
      </svg>
      <div>
        <span className="block text-3xl font-black text-white">{pct.toFixed(1)}%</span>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Voter Turnout</span>
      </div>
    </div>
  );
}

function MetricBox({ code, votes, seats, candidateCount, color, icon }: any) {
  const pct = seats > 0 ? Math.min((votes / seats) * 100, 100) : 0;
  return (
    <div className={`p-4 md:p-6 bg-white/95 backdrop-blur-sm border border-white/20 border-b-4 ${color} shadow-xl hover:shadow-2xl transition-all`}>
      <div className="flex justify-between items-start mb-4">
        <div className="text-slate-400">{icon || <BarChart3 size={20} />}</div>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{code}</span>
      </div>
      <div className="text-4xl font-medium mb-1 tracking-tighter text-slate-900">{votes}</div>
      <p className="text-[9px] font-black text-slate-400 uppercase mb-1 tracking-widest">Verified Ballots</p>
      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4">
        {candidateCount} candidate{candidateCount !== 1 ? 's' : ''} · {seats} seat{seats !== 1 ? 's' : ''}
      </p>
      <div className="flex justify-between text-[9px] font-black uppercase mb-2">
        <span className="text-slate-400">Seats Filled</span>
        <span className="text-slate-900">{Math.min(votes, seats)}/{seats}</span>
      </div>
      <div className="w-full h-[3px] bg-slate-100 overflow-hidden">
        <div className="h-full bg-slate-800 transition-all duration-1000" style={{ width: `${pct}%` }} />
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

function LeaderCard({ name, dept, quote, img, voteCount }: any) {
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
      <div className="flex items-center gap-2 mb-3">
        <Award size={14} className="text-[#c5a021]" />
        <span className="text-[10px] font-black text-[#c5a021] uppercase tracking-widest">{voteCount} votes</span>
      </div>
      <p className="text-sm text-slate-300 italic leading-relaxed px-2 font-light">"{quote}"</p>
    </div>
  );
}

export default function SRCVotingPortal() {
  const [electionData, setElectionData] = useState<ElectionData | null>(null);
  const [countdown, setCountdown] = useState('00 : 00 : 00');
  const [isMounted, setIsMounted] = useState(false);

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

  const hasData = isMounted && electionData;
  const activeElection = hasData ? electionData.activeElection : null;
  const metrics = hasData ? electionData.metrics : { totalVoters: 0, totalVotes: 0 };
  const courseMetrics = hasData ? electionData.courseMetrics : [];
  const topCandidates = hasData ? electionData.topCandidates : [];
  const activeTitle = activeElection?.title || 'Awaiting Next Election';
  const totalPop = metrics.totalVoters.toLocaleString();
  const totalVotesFmt = metrics.totalVotes.toLocaleString();
  const turnoutPct = metrics.totalVoters > 0 ? (metrics.totalVotes / metrics.totalVoters) * 100 : 0;
  const totalCandidates = courseMetrics.reduce((s, m) => s + m.candidateCount, 0);
  const totalSeats = courseMetrics.reduce((s, m) => s + m.seats, 0);

  const dynamicIcons = [
    <Briefcase key="1" size={20} />,
    <Cpu key="2" size={20} />,
    <Calculator key="3" size={20} />,
    <Leaf key="4" size={20} />,
    <Coins key="5" size={20} />,
  ];

  return (
    <div className="min-h-screen flex flex-col relative">
      <div className="fixed inset-0 z-[-1]">
        <div className="absolute inset-0 bg-gradient-to-b from-[#4c0519]/70 via-[#4c0519]/50 to-black/80" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.12) 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <Header />

      <main className="flex-grow max-w-7xl mx-auto px-4 md:px-10 py-4 md:py-10 w-full relative z-10">

        {/* 1. HERO — DYNAMIC ELECTION BANNER */}
        <section className="relative rounded-xl p-6 md:p-16 text-white mb-8 overflow-hidden shadow-2xl border border-white/5">
          <div className="absolute inset-0 bg-gradient-to-br from-[#4c0519]/90 via-[#2d0a0a]/90 to-black" />
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none hidden md:block">
            <div className="w-full h-full border-[40px] border-white/20 rounded-full -mr-40 mt-10" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="max-w-2xl">
              <p className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.5em] text-yellow-500 mb-3 flex items-center gap-2">
                <Activity size={12} className="text-red-500" /> {activeTitle}
              </p>
              <h1 className="text-4xl md:text-7xl font-bold leading-[0.9] tracking-tighter italic uppercase mb-2">
                {activeElection ? 'Your Vote, Your Voice' : 'Awaiting Next Election'}
              </h1>
              <p className="text-sm md:text-base opacity-80 leading-relaxed font-light max-w-lg mb-4">
                {activeElection
                  ? `Shape the future of KPM Beranang. ${totalCandidates} candidates are running for ${totalSeats} seats across ${courseMetrics.length} courses.`
                  : 'Stay tuned for the upcoming Student Representative Council election.'}
              </p>
              <div className="flex items-center gap-3 text-slate-300">
                <Clock size={14} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                  {activeElection ? `Polls close in ${countdown}` : 'No active election'}
                </span>
              </div>
            </div>

            {activeElection && (
              <Link href="/login">
                <button className="bg-[#c5a021] text-slate-900 px-8 md:px-12 py-3 md:py-4 rounded-sm text-[11px] font-black uppercase tracking-[0.2em] hover:bg-yellow-400 transition-all shadow-lg active:scale-95 flex items-center gap-2 shrink-0">
                  Vote Now <ChevronRight size={16} />
                </button>
              </Link>
            )}
          </div>
        </section>

        {/* 2. STATS BAR — WITH TURNOUT */}
        <div className="grid grid-cols-2 md:grid-cols-4 bg-gradient-to-br from-[#4c0519]/90 via-[#2d0a0a]/90 to-black rounded-sm border border-white/10 mb-6 overflow-hidden shadow-2xl">
          <StatItem label="Total Population" value={totalPop} light />
          <StatItem label="Votes Cast" value={totalVotesFmt} color="text-red-400" light />
          <StatItem label="Turnout" value={`${turnoutPct.toFixed(1)}%`} color="text-yellow-400" light />
          <StatItem label="Closed In" value={countdown} color="text-red-400" light />
        </div>

        {/* 3. CANDIDATE PIPELINE + TURNOUT RING */}
        {activeElection && totalCandidates > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-gradient-to-br from-[#4c0519]/90 via-[#2d0a0a]/90 to-black rounded-sm border border-white/10 p-6 md:p-8 shadow-2xl">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4 flex items-center gap-2">
                <TrendingUp size={12} /> Election Pipeline
              </p>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <span className="block text-3xl font-black text-white"><AnimatedCounter value={totalCandidates} /></span>
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Candidates</span>
                </div>
                <div className="text-white/20 text-2xl font-light">/</div>
                <div className="text-center">
                  <span className="block text-3xl font-black text-white">{totalSeats}</span>
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Seats</span>
                </div>
                <div className="text-white/20 text-2xl font-light">/</div>
                <div className="text-center">
                  <span className="block text-3xl font-black text-white">{courseMetrics.length}</span>
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Courses</span>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-[#4c0519]/90 via-[#2d0a0a]/90 to-black rounded-sm border border-white/10 p-6 md:p-8 shadow-2xl">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4 flex items-center gap-2">
                <Users size={12} /> Voter Engagement
              </p>
              <div className="flex items-center gap-6">
                <TurnoutRing pct={turnoutPct} />
                <div className="text-center">
                  <span className="block text-3xl font-black text-white"><AnimatedCounter value={metrics.totalVotes} /></span>
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">of <AnimatedCounter value={metrics.totalVoters} /> voted</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. METRIC GRID */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          {courseMetrics.length > 0 ? (
            courseMetrics.map((m, idx) => (
              <MetricBox
                key={m.course}
                code={m.course}
                votes={m.votes}
                seats={m.seats}
                candidateCount={m.candidateCount}
                color={['border-b-blue-600', 'border-b-red-900', 'border-b-orange-600', 'border-b-green-700', 'border-b-yellow-600'][idx % 5]}
                icon={dynamicIcons[idx % 5]}
              />
            ))
          ) : (
            <>
              <MetricBox code="DBS" votes={0} seats={0} candidateCount={0} color="border-b-blue-600" icon={<Briefcase size={20} />} />
              <MetricBox code="DCS" votes={0} seats={0} candidateCount={0} color="border-b-red-900" icon={<Cpu size={20} />} />
              <MetricBox code="DIA" votes={0} seats={0} candidateCount={0} color="border-b-orange-600" icon={<Calculator size={20} />} />
              <MetricBox code="DLH" votes={0} seats={0} candidateCount={0} color="border-b-green-700" icon={<Leaf size={20} />} />
              <MetricBox code="CFAB" votes={0} seats={0} candidateCount={0} color="border-b-yellow-600" icon={<Coins size={20} />} />
            </>
          )}
        </div>

        {/* 5. TOP CANDIDATES — REAL DATA */}
        {topCandidates.length > 0 && (
          <section className="mb-16 md:mb-20">
            <div className="flex items-center gap-4 md:gap-6 mb-10 md:mb-16">
              <h2 className="text-3xl md:text-5xl font-medium uppercase tracking-tighter italic text-white">Leading Candidates</h2>
              <div className="flex-grow h-[1px] bg-white/20" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
              {topCandidates.map((c) => (
                <LeaderCard
                  key={c.id}
                  name={c.name}
                  dept={c.coursePrefix}
                  img={c.posters?.[0] || c.imageUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop'}
                  quote={c.info || 'Committed to serving the student body with integrity and dedication.'}
                  voteCount={c.voteCount}
                />
              ))}
            </div>
          </section>
        )}

        {/* 6. NO ELECTION — FALLBACK MESSAGE */}
        {activeElection === null && isMounted && (
          <section className="text-center py-16 mb-8">
            <Vote size={48} className="mx-auto text-white/20 mb-4" />
            <h2 className="text-2xl font-medium uppercase tracking-tighter italic text-white/60 mb-2">No Active Election</h2>
            <p className="text-sm text-slate-400 font-light">
              There is no election currently running. Check back later for upcoming votes.
            </p>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
