'use client';

import React from 'react';
import { Vote, Clock, Users, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface AdminMetricsGridProps {
  elections: any[];
  votingSessions: any[];
  candidates: any[];
}

export default function AdminMetricsGrid({ elections, votingSessions, candidates }: AdminMetricsGridProps) {
  const activeElections = elections.filter(e => e.status === 'ACTIVE').length;
  const activeSessions = votingSessions.filter(vs => {
    const now = new Date();
    const start = vs.startTime ? new Date(vs.startTime) : null;
    const end = vs.endTime ? new Date(vs.endTime) : null;
    return start && end && now >= start && now <= end;
  }).length;
  const pendingCandidates = candidates.filter(c => c.status === 'PENDING').length;
  const approvedCandidates = candidates.filter(c => c.status === 'APPROVED').length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
      <div className="p-8 bg-white/95 backdrop-blur-xl border border-white/20 border-b-[6px] border-b-blue-600 shadow-2xl group hover:-translate-y-2 transition-all duration-500 rounded-sm">
        <div className="flex justify-between items-start mb-6">
          <div className="text-slate-300 group-hover:text-[#4c0519] transition-colors duration-500">
            <Vote size={24} />
          </div>
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">ELECTION</span>
        </div>
        <div className="text-5xl font-bold mb-2 tracking-tighter text-slate-900">{elections.length}</div>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Elections</p>
        <div className="mt-4 pt-4 border-t border-slate-100">
          <span className="text-[10px] font-bold text-green-600">{activeElections} Active</span>
        </div>
      </div>

      <div className="p-8 bg-white/95 backdrop-blur-xl border border-white/20 border-b-[6px] border-b-red-700 shadow-2xl group hover:-translate-y-2 transition-all duration-500 rounded-sm">
        <div className="flex justify-between items-start mb-6">
          <div className="text-slate-300 group-hover:text-[#4c0519] transition-colors duration-500">
            <Clock size={24} />
          </div>
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">SESSION</span>
        </div>
        <div className="text-5xl font-bold mb-2 tracking-tighter text-slate-900">{votingSessions.length}</div>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Sessions</p>
        <div className="mt-4 pt-4 border-t border-slate-100">
          <span className="text-[10px] font-bold text-red-600">{activeSessions} Live Now</span>
        </div>
      </div>

      <div className="p-8 bg-white/95 backdrop-blur-xl border border-white/20 border-b-[6px] border-b-orange-600 shadow-2xl group hover:-translate-y-2 transition-all duration-500 rounded-sm">
        <div className="flex justify-between items-start mb-6">
          <div className="text-slate-300 group-hover:text-[#4c0519] transition-colors duration-500">
            <Users size={24} />
          </div>
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">CANDIDATE</span>
        </div>
        <div className="text-5xl font-bold mb-2 tracking-tighter text-slate-900">{candidates.length}</div>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Candidates</p>
        <div className="mt-4 pt-4 border-t border-slate-100">
          <span className="text-[10px] font-bold text-orange-600">{pendingCandidates} Pending</span>
        </div>
      </div>

      <div className="p-8 bg-white/95 backdrop-blur-xl border border-white/20 border-b-[6px] border-b-green-700 shadow-2xl group hover:-translate-y-2 transition-all duration-500 rounded-sm">
        <div className="flex justify-between items-start mb-6">
          <div className="text-slate-300 group-hover:text-[#4c0519] transition-colors duration-500">
            <CheckCircle size={24} />
          </div>
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">APPROVED</span>
        </div>
        <div className="text-5xl font-bold mb-2 tracking-tighter text-slate-900">{approvedCandidates}</div>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Active Candidates</p>
        <div className="mt-4 pt-4 border-t border-slate-100">
          <span className="text-[10px] font-bold text-green-600">{((approvedCandidates / (candidates.length || 1)) * 100).toFixed(0)}% Approved</span>
        </div>
      </div>
    </div>
  );
}