'use client';

import React from 'react';
import { Vote, Clock, Users, CheckCircle } from 'lucide-react';

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
  const pct = candidates.length > 0 ? ((approvedCandidates / candidates.length) * 100).toFixed(0) : '0';

  return (
    <div className="flex flex-wrap items-center gap-3 mb-6 pb-4 border-b border-slate-200">
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-sm">
        <Vote size={13} className="text-blue-600" />
        <span className="text-[10px] font-bold text-blue-700">{elections.length} Elections</span>
        {activeElections > 0 && <span className="text-[9px] text-blue-500">({activeElections} active)</span>}
      </div>
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-200 rounded-sm">
        <Clock size={13} className="text-red-600" />
        <span className="text-[10px] font-bold text-red-700">{votingSessions.length} Sessions</span>
        {activeSessions > 0 && <span className="text-[9px] text-red-500">({activeSessions} live)</span>}
      </div>
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 border border-orange-200 rounded-sm">
        <Users size={13} className="text-orange-600" />
        <span className="text-[10px] font-bold text-orange-700">{candidates.length} Candidates</span>
        {pendingCandidates > 0 && <span className="text-[9px] text-orange-500">({pendingCandidates} pending)</span>}
      </div>
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-200 rounded-sm">
        <CheckCircle size={13} className="text-green-600" />
        <span className="text-[10px] font-bold text-green-700">{approvedCandidates} Approved ({pct}%)</span>
      </div>
    </div>
  );
}
