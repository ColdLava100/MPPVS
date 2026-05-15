'use client';

import React from 'react';
import { Users, AlertCircle, CheckCircle, Vote } from 'lucide-react';

interface AdvisorMetricsGridProps {
  elections: any[];
  votingSessions: any[];
  candidates: any[];
  electionId?: string | null;
}

export default function AdvisorMetricsGrid({ elections, votingSessions, candidates, electionId }: AdvisorMetricsGridProps) {
  const scopedCandidates = electionId
    ? candidates.filter((c: any) => c.electionId === electionId)
    : candidates;

  const activeElections = elections.filter((e: any) => e.status === 'ACTIVE').length;
  const pendingCandidates = scopedCandidates.filter((c: any) => c.status === 'PENDING').length;
  const approvedCandidates = scopedCandidates.filter((c: any) => c.status === 'APPROVED').length;
  const activeSessions = votingSessions.filter((vs: any) => {
    const now = new Date();
    const start = vs.startTime ? new Date(vs.startTime) : null;
    const end = vs.endTime ? new Date(vs.endTime) : null;
    return start && end && now >= start && now <= end;
  }).length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <div className="bg-white/5 border border-white/10 backdrop-blur-xl border-b-2 border-b-blue-600 rounded-sm p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Users size={18} className="text-blue-400" />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</span>
        </div>
        <span className="text-2xl font-bold text-white tabular-nums">{scopedCandidates.length}</span>
      </div>

      <div className="bg-white/5 border border-white/10 backdrop-blur-xl border-b-2 border-b-yellow-600 rounded-sm p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <AlertCircle size={18} className="text-yellow-400" />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pending</span>
        </div>
        <span className="text-2xl font-bold text-white tabular-nums">{pendingCandidates}</span>
      </div>

      <div className="bg-white/5 border border-white/10 backdrop-blur-xl border-b-2 border-b-green-700 rounded-sm p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <CheckCircle size={18} className="text-green-400" />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Approved</span>
        </div>
        <span className="text-2xl font-bold text-white tabular-nums">{approvedCandidates}</span>
      </div>

      <div className="bg-white/5 border border-white/10 backdrop-blur-xl border-b-2 border-b-red-700 rounded-sm p-4 flex flex-col justify-center gap-1">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Vote size={18} className="text-red-400" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Elections</span>
          </div>
          <span className="text-2xl font-bold text-white tabular-nums">{activeElections}</span>
        </div>
        <p className="text-[10px] font-bold text-red-400">{activeSessions} sessions live</p>
      </div>
    </div>
  );
}
