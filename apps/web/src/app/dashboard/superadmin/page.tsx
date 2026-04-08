"use client";

import React from 'react';
import { 
  Users, 
  Calendar, 
  ShieldCheck, 
  Bell, 
  FileText, 
  TrendingUp, 
  Settings, 
  PlusCircle 
} from 'lucide-react';
import UniversalSidebar from '@/components/ui/sidebar';
import Navbar from '@/components/ui/header';

export default function AdminDashboard() {
  return (
    <div className="relative min-h-screen font-sans text-white bg-[#1A0508] overflow-x-hidden">
      {/* 1. Deep Wine Gradient Background Layer */}
      <div className="fixed inset-0 z-0 bg-gradient-to-tr from-[#1A0508] via-[#2D0A10] to-[#450A11]" />
      
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        <div className="flex flex-grow relative">
          {/* Sidebar: Called with role="superadmin" to match our configuration. 
            Absolute positioning ensures it floats and doesn't push the center content.
          */}
          <div className="absolute left-0 top-0 h-full z-50">
            <UniversalSidebar role="superadmin" />
          </div>

          {/* Main Content: Center-aligned relative to the full viewport width */}
          <main className="flex-grow flex justify-center p-8 md:p-16 w-full">
            <div className="max-w-6xl w-full flex flex-col items-center">
              
              {/* Header Section: Centered text and branding buttons */}
              <div className="flex flex-col items-center mb-16 text-center">
                <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-[#C0A060] mb-3">
                  Management Console
                </p>
                <h1 className="text-5xl font-black uppercase tracking-tighter italic leading-none">
                  Superadmin <span className="text-[#C0A060]">Dashboard</span>
                </h1>
                <div className="h-1 w-24 bg-[#C0A060] mt-5 rounded-full" />
                
                <div className="flex gap-4 mt-10">
                  <button className="flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 px-8 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                    <FileText size={14} /> Audit Report
                  </button>
                  <button className="flex items-center gap-2 bg-[#C0A060] text-[#1A0508] px-8 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-lg shadow-black/40">
                    <PlusCircle size={14} /> New Announcement
                  </button>
                </div>
              </div>

              {/* 2. Centered Metrics Grid - Displays real-time election stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 w-full">
                <MetricCard 
                  title="Total Voters" 
                  value="2,840" 
                  icon={<Users size={20} />} 
                  trend="+12% Participation" 
                />
                <MetricCard 
                  title="Active Candidates" 
                  value="24" 
                  icon={<ShieldCheck size={20} />} 
                  trend="Verified Entries" 
                />
                <MetricCard 
                  title="Current Turnout" 
                  value="68%" 
                  icon={<TrendingUp size={20} />} 
                  trend="Goal: 85%" 
                />
                <MetricCard 
                  title="Time Remaining" 
                  value="04:22:10" 
                  icon={<Calendar size={20} />} 
                  trend="Live Election" 
                />
              </div>

              {/* 3. Balanced Action Hub - Grouped by Use Case logic */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
                <ActionSection title="Candidate Pipeline">
                  <AdminActionBtn 
                    title="Manage Qualifications" 
                    desc="Review & Approve" 
                    icon={<ShieldCheck size={18} />} 
                  />
                  <AdminActionBtn 
                    title="Interview Sessions" 
                    desc="Schedule & Results" 
                    icon={<Calendar size={18} />} 
                  />
                </ActionSection>

                <ActionSection title="Election Controls">
                  <AdminActionBtn 
                    title="Voting Slot Times" 
                    desc="Time per Course" 
                    icon={<Settings size={18} />} 
                  />
                  <AdminActionBtn 
                    title="Pop-up Announcements" 
                    desc="Direct Instructions" 
                    icon={<Bell size={18} />} 
                  />
                </ActionSection>

                <ActionSection title="Data & Logs">
                  <AdminActionBtn 
                    title="View Live Rankings" 
                    desc="Live Performance" 
                    icon={<TrendingUp size={18} />} 
                  />
                  <AdminActionBtn 
                    title="System Audit Logs" 
                    desc="Security Events" 
                    icon={<FileText size={18} />} 
                  />
                </ActionSection>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

// --- Sub-components for Layout Organization ---

function ActionSection({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/30 px-2 text-center lg:text-left">
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function MetricCard({ title, value, icon, trend }: any) {
  return (
    <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2rem] border border-white/10 text-center group hover:border-[#C0A060]/50 transition-all flex flex-col items-center">
      <div className="mb-4 text-[#C0A060] group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-3xl font-black mb-1 tracking-tighter">{value}</h3>
      <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">{title}</p>
      <p className="text-[8px] font-black text-[#C0A060] mt-5 uppercase tracking-widest">{trend}</p>
    </div>
  );
}

function AdminActionBtn({ title, desc, icon }: any) {
  return (
    <button className="w-full text-left bg-white/5 backdrop-blur-md border border-white/5 p-6 rounded-2xl hover:bg-[#C0A060] hover:text-[#1A0508] transition-all group shadow-sm">
      <div className="flex items-center gap-5">
        <div className="p-3 bg-white/5 rounded-xl group-hover:bg-black/10 transition-colors">
          {icon}
        </div>
        <div>
          <h3 className="text-[11px] font-black uppercase tracking-tight leading-none">{title}</h3>
          <p className="text-[9px] opacity-60 font-bold uppercase tracking-widest mt-2 leading-none">{desc}</p>
        </div>
      </div>
    </button>
  );
}