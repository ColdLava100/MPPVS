"use client";

import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  ChevronRight, 
  Briefcase, 
  Cpu, 
  Calculator, 
  Leaf, 
  Coins, 
  Users, 
  CheckCircle2, 
  Clock, 
  RefreshCcw 
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import UniversalSidebar from '@/components/ui/sidebar';
import StudentHeader from '@/components/ui/header2';
import Footer from '@/components/ui/footer';

export default function CandidateDashboard() {
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
  
  return (
    <div className="flex h-screen bg-black overflow-hidden relative font-sans text-white">
      {/* 1. SIDEBAR */}
      <UniversalSidebar role="candidate" />

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-grow flex flex-col relative overflow-hidden ml-24">
        <StudentHeader />

        <main className="flex-grow overflow-y-auto relative no-scrollbar flex flex-col">
          <div className="fixed inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: `url(${bgImageUrl})`, filter: 'blur(8px) brightness(0.25)' }} />

          <div className="relative z-10 p-12 max-w-7xl mx-auto w-full flex-grow flex flex-col gap-12">
            
            {/* Page Header */}
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] mb-3 flex items-center gap-2">
                  <Activity size={14} className="text-red-600 animate-pulse" /> Candidate Control Center
                </p>
                <h1 className="text-5xl font-bold uppercase tracking-tighter italic leading-none text-white">Campaign <br/> Intelligence</h1>
              </div>
            </div>

            {/* Faculty Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
              <MetricBox code="DBS" votes="412" seats="1/3" color="border-b-blue-600" icon={<Briefcase size={22}/>} />
              <MetricBox code="DCS" votes="284" seats="4/5" color="border-b-red-700" icon={<Cpu size={22}/>} />
              <MetricBox code="DIA" votes="198" seats="2/5" color="border-b-orange-600" icon={<Calculator size={22}/>} />
              <MetricBox code="DLH" votes="106" seats="1/3" color="border-b-green-700" icon={<Leaf size={22}/>} />
              <MetricBox code="CFAB" votes="324" seats="3/3" color="border-b-yellow-600" icon={<Coins size={22}/>} />
            </div>

            {/* Live Session Monitor */}
            <section>
               <div className="flex items-center gap-2 mb-4 px-2">
                  <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-ping" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-500">Live Session Monitor</span>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 bg-white/5 backdrop-blur-3xl rounded-xl border border-white/10 overflow-hidden shadow-2xl">
                 <SessionItem icon={<Cpu size={20} className="text-red-500" />} label="Active Slot" value="Computer Science" />
                 <SessionItem icon={<Users size={20} className="text-slate-400" />} label="Total Students" value="284" />
                 <SessionItem icon={<CheckCircle2 size={20} className="text-green-500" />} label="Amount Voted" value="212" />
                 <SessionItem icon={<Clock size={20} className="text-red-500" />} label="Closed In" value="00:45:12" />
                 <SessionItem icon={<RefreshCcw size={20} className="text-blue-400" />} label="Refresh In" value="00:59" />
               </div>
            </section>

            {/* Hero Card */}
            <section className="relative rounded-sm p-16 text-white overflow-hidden bg-gradient-to-br from-[#4c0519]/80 via-[#2d0a0a]/90 to-black/95 border border-white/5 backdrop-blur-md shadow-2xl">
              <div className="relative z-10 max-w-2xl">
                <p className="text-[11px] font-black uppercase tracking-[0.6em] text-yellow-500 mb-8">Nominee Management Dashboard</p>
                <h2 className="text-6xl font-bold mb-10 leading-[0.85] tracking-tighter italic uppercase">CRAFT THE <br/> VISION</h2>
                <button className="bg-[#c5a021] text-black px-10 py-4 text-[12px] font-black uppercase tracking-[0.25em] hover:bg-yellow-400 transition-all flex items-center gap-3">
                  Update Manifesto <ChevronRight size={16} />
                </button>
              </div>
            </section>

            {/* Campaign Team */}
            <section className="pb-12">
              <div className="flex items-center gap-8 mb-16">
                  <h2 className="text-5xl font-bold uppercase tracking-tighter italic leading-none text-white">Campaign Team</h2>
                  <div className="flex-grow h-[1px] bg-white/10" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                <LeaderCard name="Campaign Lead" dept="Computer Science" img="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=1974&auto=format&fit=crop" quote="Monitoring voter demographics and ensuring our digital reach covers all faculties efficiently." />
                <LeaderCard name="Creative Dir." dept="Computer Science" img="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1976&auto=format&fit=crop" quote="Finalizing the 'Lead the Future' poster series for physical distribution across campus wings." />
                <LeaderCard name="Secretary" dept="Computer Science" img="https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1974&auto=format&fit=crop" quote="Managing candidate communication channels and official responses to student inquiries." />
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

{/* REUSABLE UI SUB-COMPONENTS */}
function MetricBox({ code, votes, seats, color, icon }: any) {
  const [num, den] = seats.split('/').map(Number);
  const progress = (num / den) * 100;
  return (
    <div className={`p-7 bg-white/95 border border-white/20 border-b-[6px] ${color} shadow-xl group hover:-translate-y-1.5 transition-all duration-500 rounded-lg`}>
      <div className="flex justify-between items-start mb-8 text-black">
        <div className="text-slate-300 group-hover:text-[#4c0519] transition-colors">{icon}</div>
        <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{code}</span>
      </div>
      <div className="text-5xl font-bold mb-1 tracking-tighter text-slate-900 leading-none">{votes}</div>
      <p className="text-[9px] font-black text-slate-400 uppercase mb-8 tracking-[0.2em]">Verified Ballots</p>
      <div className="flex justify-between text-[10px] font-black uppercase mb-3 text-black">
        <span className="text-slate-400 text-[8px]">Seats Filled</span>
        <span className="text-[#4c0519] font-bold">{seats}</span>
      </div>
      <div className="w-full h-[3px] bg-slate-100 overflow-hidden rounded-full">
        <div className="h-full bg-slate-900 transition-all duration-1000" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}

function SessionItem({ icon, label, value }: any) {
  return (
    <div className="p-7 border-r border-white/5 last:border-0 flex items-center gap-5 hover:bg-white/5 transition-all group">
      <div className="p-3 bg-white/5 rounded-lg border border-white/10 group-hover:bg-[#4c0519]/20 transition-colors">
        {icon}
      </div>
      <div>
        <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1.5">{label}</span>
        <span className="text-[13px] font-bold tracking-tight text-white uppercase italic">{value}</span>
      </div>
    </div>
  );
}

function LeaderCard({ name, dept, quote, img }: any) {
  return (
    <div className="group">
      <div className="relative aspect-[4/5] overflow-hidden mb-8 bg-slate-200 grayscale hover:grayscale-0 transition-all duration-700 shadow-2xl group-hover:shadow-red-900/30 group-hover:-translate-y-3 rounded-xl border border-white/10">
        <img src={img} alt={name} className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-1000" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />
        <div className="absolute bottom-0 left-0 w-full p-10">
          <p className="text-[11px] font-black text-yellow-500 uppercase tracking-[0.4em] mb-3">{dept}</p>
          <h3 className="text-4xl font-bold text-white uppercase tracking-tighter italic leading-none">{name}</h3>
        </div>
      </div>
      <p className="text-sm text-slate-400 italic leading-relaxed mb-6 px-4 font-light border-l border-white/10">"{quote}"</p>
    </div>
  );
}