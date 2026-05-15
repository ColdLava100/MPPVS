'use client';

import React, { useState } from 'react';
import { Users, Eye, FileText, Video, Presentation, Image, CheckCircle, XCircle, EyeOff } from 'lucide-react';

interface CandidateReviewGridProps {
  candidates: any[];
  elections: any[];
  selectedElectionId: string | null;
  onElectionChange: (electionId: string | null) => void;
  onViewDetails: (candidate: any) => void;
  onRefresh?: () => void;
}

export default function CandidateReviewGrid({ candidates, elections, selectedElectionId, onElectionChange, onViewDetails, onRefresh }: CandidateReviewGridProps) {
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [showCode, setShowCode] = useState<string | null>(null);

  const electionFiltered = selectedElectionId
    ? candidates.filter(c => c.electionId === selectedElectionId)
    : candidates;

  const filteredCandidates = filter === 'ALL'
    ? electionFiltered
    : electionFiltered.filter(c => c.status === filter);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <span className="bg-green-500/20 text-green-400 border border-green-500/30 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">Approved</span>;
      case 'REJECTED':
        return <span className="bg-red-600/20 text-red-400 border border-red-600/30 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">Rejected</span>;
      case 'PENDING':
        return <span className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">Pending</span>;
      default:
        return <span className="bg-slate-500/20 text-slate-400 border border-slate-500/30 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">{status}</span>;
    }
  };

  const getMaterialCount = (candidate: any) => {
    const manifestoCount = candidate.manifestos?.length || 0;
    const videoCount = candidate.videos?.length || 0;
    const slideCount = candidate.slides?.length || 0;
    const posterCount = candidate.posters?.length || 0;
    return { manifestoCount, videoCount, slideCount, posterCount };
  };

  const handleUpdateStatus = async (candidateId: string, newStatus: string) => {
    if (!confirm(`Are you sure you want to ${newStatus.toLowerCase()} this candidate?`)) return;

    setUpdatingId(candidateId);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/candidates/${candidateId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        alert(`Candidate ${newStatus.toLowerCase()} successfully!`);
        if (onRefresh) onRefresh();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(`Failed: ${data.message || res.status}`);
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
    setUpdatingId(null);
  };

  const generateCode = async (userId: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/security-code`, {
        method: 'POST',
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        alert(`Security code generated: ${data.securityCode}`);
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      console.error('Failed to generate code:', err);
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-3xl rounded-sm border border-white/10 shadow-2xl p-8">
      <div className="flex items-center justify-between mb-6 text-white">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#4c0519]/20 rounded-lg border border-white/10">
            <Users size={20} className="text-white" />
          </div>
          <h3 className="text-2xl font-bold uppercase tracking-tighter">Candidate Review</h3>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">({filteredCandidates.length})</span>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedElectionId || ''}
            onChange={(e) => onElectionChange(e.target.value || null)}
            className="bg-white/10 border border-white/10 rounded-sm px-3 py-1.5 text-xs text-white outline-none focus:border-white/30"
          >
            <option value="" className="bg-slate-800">All Elections</option>
            {elections.map((e: any) => (
              <option key={e.id} value={e.id} className="bg-slate-800">{e.title}</option>
            ))}
          </select>
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
      </div>

      <div className="space-y-4">
        {filteredCandidates.map(candidate => {
          const counts = getMaterialCount(candidate);
          return (
            <div key={candidate.id} className="p-6 bg-white/5 rounded-lg border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center text-white font-bold">
                  {candidate.user?.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{candidate.user?.name || 'Unknown'}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest">
                    {candidate.election?.title || 'No election'}
                  </p>
                  <p className="text-[9px] text-slate-500 mt-1">
                    {candidate.user?.email || 'No email'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-5">
                <div className="flex gap-3 text-slate-400">
                  <div className="flex items-center gap-1">
                    <FileText size={14} />
                    <span className="text-[10px]">{counts.manifestoCount}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Video size={14} />
                    <span className="text-[10px]">{counts.videoCount}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Presentation size={14} />
                    <span className="text-[10px]">{counts.slideCount}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Image size={14} />
                    <span className="text-[10px]">{counts.posterCount}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 min-w-[90px]">
                  {candidate.user?.securityCode ? (
                    <>
                      <span className="font-mono text-xs text-slate-300">
                        {showCode === candidate.user?.id ? candidate.user.securityCode : '••••••'}
                      </span>
                      <button
                        onClick={() => setShowCode(showCode === candidate.user?.id ? null : candidate.user?.id)}
                        className="text-slate-400 hover:text-white transition-colors"
                        title={showCode === candidate.user?.id ? 'Hide Code' : 'Show Code'}
                      >
                        {showCode === candidate.user?.id ? <EyeOff size={12} /> : <Eye size={12} />}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => generateCode(candidate.user?.id)}
                      className="text-[9px] font-black uppercase text-[#c5a021] hover:underline flex items-center gap-1"
                    >
                      Generate
                    </button>
                  )}
                </div>

                {getStatusBadge(candidate.status)}

                {candidate.status === 'PENDING' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdateStatus(candidate.id, 'APPROVED')}
                      disabled={updatingId === candidate.id}
                      className="bg-green-500/20 text-green-400 px-3 py-1.5 rounded text-[9px] font-black uppercase tracking-widest hover:bg-green-500/30 transition flex items-center gap-1 disabled:opacity-50"
                    >
                      <CheckCircle size={12} /> Approve
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(candidate.id, 'REJECTED')}
                      disabled={updatingId === candidate.id}
                      className="bg-red-600/20 text-red-400 px-3 py-1.5 rounded text-[9px] font-black uppercase tracking-widest hover:bg-red-600/30 transition flex items-center gap-1 disabled:opacity-50"
                    >
                      <XCircle size={12} /> Reject
                    </button>
                  </div>
                )}

                <button
                  onClick={() => onViewDetails(candidate)}
                  className="bg-[#c5a021] text-black px-4 py-2 rounded text-[9px] font-black uppercase tracking-widest hover:bg-yellow-400 transition flex items-center gap-2"
                >
                  <Eye size={14} /> View Details
                </button>
              </div>
            </div>
          );
        })}
        {filteredCandidates.length === 0 && (
          <p className="text-slate-400 text-sm italic text-center py-8">
            No candidates found{filter !== 'ALL' ? ` with status: ${filter}` : ''}{selectedElectionId ? ' for this election' : ''}.
          </p>
        )}
      </div>
    </div>
  );
}
