'use client';

import React, { useState } from 'react';
import { Users, CheckCircle, XCircle, Clock } from 'lucide-react';

interface CandidateApprovalProps {
  candidates: any[];
  onRefresh: () => void;
}

export default function CandidateApproval({ candidates, onRefresh }: CandidateApprovalProps) {
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');

  const filteredCandidates = filter === 'ALL' 
    ? candidates 
    : candidates.filter(c => c.status === filter);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/candidates/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        alert(`Candidate ${newStatus.toLowerCase()}!`);
        onRefresh();
      } else {
        alert(`Failed: ${res.status}`);
      }
    } catch (err: any) { alert(`Error: ${err.message}`); }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <span className="bg-green-500 text-black px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">Approved</span>;
      case 'REJECTED':
        return <span className="bg-red-600 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">Rejected</span>;
      case 'PENDING':
        return <span className="bg-yellow-500 text-black px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">Pending</span>;
      default:
        return <span className="bg-slate-500 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">{status}</span>;
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-3xl rounded-sm border border-white/10 shadow-2xl mb-8 p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#4c0519]/20 rounded-lg border border-white/10">
            <Users size={20} className="text-white" />
          </div>
          <h3 className="text-2xl font-bold uppercase tracking-tighter">Candidate Approval</h3>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">({candidates.length})</span>
        </div>
        <div className="flex gap-2">
          {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded text-[9px] font-black uppercase tracking-widest transition ${
                filter === f ? 'bg-[#4c0519] text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filteredCandidates.map(candidate => (
          <div key={candidate.id} className="p-6 bg-white/5 rounded-lg border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center">
                {candidate.user?.name?.[0]?.toUpperCase() || '?'}
              </div>
              <div>
                <p className="text-sm font-bold text-white">{candidate.user?.name || 'Unknown'}</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest">
                  {candidate.user?.email || 'No email'}
                </p>
                <p className="text-[9px] text-slate-500 mt-1">
                  {candidate.election?.title || 'No election'} • {candidate.qualification?.positions?.join(', ') || 'No position'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {getStatusBadge(candidate.status)}
              {candidate.status === 'PENDING' && (
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleUpdateStatus(candidate.id, 'APPROVED')}
                    className="bg-green-500/20 hover:bg-green-500/40 border border-green-500/30 px-4 py-2 rounded text-[9px] font-black uppercase tracking-widest transition flex items-center gap-1 text-green-400"
                  >
                    <CheckCircle size={14} /> Approve
                  </button>
                  <button 
                    onClick={() => handleUpdateStatus(candidate.id, 'REJECTED')}
                    className="bg-red-600/20 hover:bg-red-600/40 border border-red-600/30 px-4 py-2 rounded text-[9px] font-black uppercase tracking-widest transition flex items-center gap-1 text-red-400"
                  >
                    <XCircle size={14} /> Reject
                  </button>
                </div>
              )}
              {candidate.status !== 'PENDING' && (
                <button 
                  onClick={() => handleUpdateStatus(candidate.id, 'PENDING')}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded text-[9px] font-black uppercase tracking-widest transition flex items-center gap-1 text-slate-400"
                >
                  <Clock size={14} /> Reset
                </button>
              )}
            </div>
          </div>
        ))}
        {filteredCandidates.length === 0 && (
          <p className="text-slate-400 text-sm italic text-center py-8">
            No candidates found{filter !== 'ALL' ? ` with status: ${filter}` : ''}.
          </p>
        )}
      </div>
    </div>
  );
}