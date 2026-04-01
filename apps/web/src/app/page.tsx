"use client";

import React from 'react';
// FIX: Added the missing import below
import Link from 'next/link';

export default function MPPVotingPortal() {
  return (
    <div className="min-h-screen">
      {/* 1. TOP NAV */}
      <nav className="flex justify-between items-center px-10 py-5 border-b border-slate-100 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#630d16] rounded flex items-center justify-center text-white text-xs">🏛️</div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">DevOps</span>
        </div>
        <div className="flex items-center gap-8">
          {['Elections', 'Candidates', 'Bylaws', 'Results'].map((link) => (
            <a key={link} href="#" className="text-[11px] font-bold uppercase tracking-wider text-slate-500 hover:text-[#630d16]">
              {link}
            </a>
          ))}
          {/* Link is now defined and will work */}
          <Link href="/login">
            <button className="bg-[#4c0519] text-white px-6 py-2 rounded text-[11px] font-bold uppercase tracking-widest ml-4 shadow-lg shadow-maroon-900/20">
              Login
            </button>
          </Link>
        </div>
      </nav>

      {/* 2. LIVE METRICS SECTION */}
      <main className="max-w-7xl mx-auto px-10 py-10">
        <div className="flex justify-between items-end mb-6">
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-ultra mb-1">MPP 2024 Live Metrics</p>
            <h1 className="text-3xl font-bold uppercase tracking-tight text-slate-800">Campus-Wide Election Pulse</h1>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
            <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Live Updates</span>
          </div>
        </div>

        {/* METRIC GRID */}
        <div className="grid grid-cols-5 gap-4 mb-8">
          <MetricBox code="DEG" votes="412" seats="3/5" color="border-red-900" />
          <MetricBox code="DOG" votes="284" seats="4/5" color="border-blue-700" />
          <MetricBox code="DIA" votes="198" seats="2/5" color="border-orange-600" />
          <MetricBox code="DLH" votes="106" seats="1/5" color="border-indigo-900" />
          <MetricBox code="CEAD" votes="324" seats="5/5" color="border-red-950" />
        </div>

        {/* TIME & STATS BAR */}
        <div className="grid grid-cols-4 bg-slate-50 rounded-lg border border-slate-100 mb-16">
          <StatItem label="Total Population" value="1,024" />
          <StatItem label="Votes Cast" value="842" color="text-red-900" />
          <StatItem label="Closed In" value="02 : 14 : 55" color="text-red-900" />
          <StatItem label="Next Update" value="00 : 15" color="text-blue-700" />
        </div>

        {/* 3. HERO BANNER */}
        <section className="hero-gradient rounded-xl p-16 text-white mb-20 relative overflow-hidden">
          <div className="relative z-10 max-w-xl">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-60 mb-4">Student Representative Council 2024</p>
            <h2 className="text-6xl font-black mb-6 leading-[0.9]">LEAD THE <br/> FUTURE</h2>
            <p className="text-sm opacity-80 leading-relaxed mb-8">
              Your vote is the cornerstone of academic excellence. Choose the visionaries who will shape the next era of our institutional governance.
            </p>
            <div className="flex gap-4">
              <button className="bg-[#c5a021] text-slate-900 px-8 py-3 rounded text-[10px] font-black uppercase tracking-widest hover:bg-yellow-400 transition">Vote Now</button>
              <button className="border border-white/30 px-8 py-3 rounded text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition">Learn More</button>
            </div>
          </div>
        </section>

        {/* 4. VISIONARY LEADERS */}
        <section className="mb-20">
          <h2 className="text-4xl font-bold uppercase tracking-tighter mb-12 border-b-4 border-red-900 w-fit pr-10 pb-2">Visionary Leaders</h2>
          <div className="grid grid-cols-3 gap-10">
            <LeaderCard 
              name="Ahmad Daniel" 
              dept="Computer Science" 
              quote="Proposing a digital-first governance model to streamline student feedback and faculty collaboration."
            />
            <LeaderCard 
              name="Sarah Alisya" 
              dept="Business Admin" 
              quote="Focused on sustainable student commerce initiatives and developing industry-standard leadership workshops."
            />
            <LeaderCard 
              name="Farhan Razak" 
              dept="Accounting" 
              quote="Advocating for financial transparency in student funds and a multi-year audit program."
            />
          </div>
        </section>
      </main>

      {/* 5. FOOTER */}
      <footer className="bg-slate-50 px-10 py-12 border-t border-slate-200">
        <div className="max-w-7xl mx-auto flex justify-between text-[9px] font-bold uppercase tracking-widest text-slate-400">
          <div>
            <p className="text-blue-900 mb-4">MPP Voting System</p>
            <p>© 2024 THE ACADEMIC VANGUARD. ALL RIGHTS RESERVED.</p>
            <p className="mt-1">DEVOPS @ ITA BUILD STUDIO | EST. 2024</p>
          </div>
          <div className="flex gap-12">
            <div className="flex flex-col gap-2">
              <span className="footer-link">University Home</span>
              <span className="footer-link">Contact Support</span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="footer-link">Dean of Students</span>
              <span className="footer-link">Privacy Policy</span>
            </div>
            <span className="footer-link">Election Board</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* Sub-components */
function MetricBox({ code, votes, seats, color }: any) {
  return (
    <div className={`metric-card ${color}`}>
      <div className="flex justify-between items-start mb-4">
        <div className="text-lg">📊</div>
        <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">{code}</span>
      </div>
      <div className="text-3xl font-bold mb-1">{votes}</div>
      <p className="text-[8px] font-bold text-slate-400 uppercase mb-4 tracking-tighter">Verified Ballots</p>
      <div className="flex justify-between text-[8px] font-black uppercase mb-1">
        <span className="text-blue-900">Seats Filled</span>
        <span>{seats}</span>
      </div>
      <div className="w-full h-[2px] bg-slate-100">
        <div className="h-full bg-slate-800 w-[60%]" />
      </div>
    </div>
  );
}

function StatItem({ label, value, color = "text-slate-900" }: any) {
  return (
    <div className="p-6 border-r border-slate-200 last:border-0">
      <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</span>
      <span className={`text-2xl font-mono-metrics font-bold ${color}`}>{value}</span>
    </div>
  );
}

function LeaderCard({ name, dept, quote }: any) {
  return (
    <div className="group cursor-pointer">
      <div className="leader-img-container mb-6">
        <div className="w-full h-full bg-slate-300" />
        <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/90 to-transparent">
          <p className="text-[9px] font-bold text-yellow-500 uppercase tracking-widest mb-1">{dept}</p>
          <h3 className="text-2xl font-bold text-white uppercase">{name}</h3>
        </div>
      </div>
      <p className="text-xs text-slate-500 italic leading-relaxed mb-4">"{quote}"</p>
      <div className="text-[9px] font-black uppercase tracking-widest flex items-center gap-2 group-hover:text-red-900">
        View Profile <span>→</span>
      </div>
    </div>
  );
}