'use client';

import React, { useState } from 'react';
import { Users, Eye, FileText, Video, Presentation, Image, CheckCircle, XCircle, EyeOff, Clock } from 'lucide-react';

interface CandidateReviewGridProps {
  electionId: string;
  candidates: any[];
  onViewDetails: (candidate: any) => void;
  onRefresh?: () => void;
}

export default function CandidateReviewGrid({ electionId, candidates, onViewDetails, onRefresh }: CandidateReviewGridProps) {
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [showCode, setShowCode] = useState<string | null>(null);

  const filteredCandidates = candidates
    .filter(c => c.electionId === electionId)
    .filter(c => filter === 'ALL' || c.status === filter);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <span className="bg-green-100 text-green-700 border border-green-200 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest whitespace-nowrap">Approved</span>;
      case 'REJECTED':
        return <span className="bg-red-100 text-red-600 border border-red-200 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest whitespace-nowrap">Rejected</span>;
      case 'PENDING':
        return <span className="bg-yellow-100 text-yellow-700 border border-yellow-200 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest whitespace-nowrap">Pending</span>;
      default:
        return <span className="bg-slate-100 text-slate-600 border border-slate-200 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest whitespace-nowrap">{status}</span>;
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
    <div>
      {/* Header + Filter Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-slate-900 uppercase tracking-tight">Candidates</h2>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">({filteredCandidates.length})</span>
        </div>

        {/* Filter Tabs — vertical on mobile, horizontal on desktop */}
        <div className="flex flex-col md:flex-row gap-1.5 md:gap-2">
          {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2.5 md:py-2 rounded text-[9px] font-black uppercase tracking-widest transition ${
                filter === f
                  ? 'bg-[#c5a021] text-black'
                  : 'bg-[#4c0519]/10 text-[#4c0519] border border-[#4c0519]/20 hover:bg-[#4c0519]/20'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Candidate List */}
      <div className="space-y-3">
        {filteredCandidates.map(candidate => {
          const counts = getMaterialCount(candidate);
          return (
            <div key={candidate.id} className="bg-slate-50 border border-slate-200 rounded-sm p-4 md:p-5">
              <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-0">
                {/* Left: Profile + Name + Status (mobile) */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {candidate.profilePicture ? (
                    <img src={candidate.profilePicture} alt={candidate.user?.name || 'Candidate'} className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border-2 border-[#c5a021]/30 flex-shrink-0" />
                  ) : (
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-[#4c0519]/10 rounded-full flex items-center justify-center text-[#4c0519] font-bold flex-shrink-0">
                      {candidate.user?.name?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{candidate.user?.name || 'Unknown'}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest truncate">
                      {candidate.election?.title || 'No election'}
                    </p>
                    <p className="text-[9px] text-slate-400 mt-0.5 truncate">
                      {candidate.user?.email || ''}
                    </p>
                  </div>
                  {/* Status badge — mobile only */}
                  <div className="flex-shrink-0 md:hidden">
                    {getStatusBadge(candidate.status)}
                  </div>
                </div>

                {/* Right: Materials + Security + Badge (desktop) + Actions */}
                <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-5 mt-3 md:mt-0 pl-0 md:pl-4 md:border-l md:border-slate-200">
                  {/* Material counts */}
                  <div className="flex gap-3 text-slate-500">
                    <div className="flex items-center gap-1" title="Manifestos">
                      <FileText size={13} />
                      <span className="text-[10px] font-medium">{counts.manifestoCount}</span>
                    </div>
                    <div className="flex items-center gap-1" title="Videos">
                      <Video size={13} />
                      <span className="text-[10px] font-medium">{counts.videoCount}</span>
                    </div>
                    <div className="flex items-center gap-1" title="Slides">
                      <Presentation size={13} />
                      <span className="text-[10px] font-medium">{counts.slideCount}</span>
                    </div>
                    <div className="flex items-center gap-1" title="Posters">
                      <Image size={13} />
                      <span className="text-[10px] font-medium">{counts.posterCount}</span>
                    </div>
                  </div>

                  {/* Security code toggle */}
                  <div className="flex items-center gap-2">
                    {candidate.user?.securityCode ? (
                      <>
                        <span className="font-mono text-xs text-slate-600">
                          {showCode === candidate.user?.id ? candidate.user.securityCode : '••••••'}
                        </span>
                        <button
                          onClick={() => setShowCode(showCode === candidate.user?.id ? null : candidate.user?.id)}
                          className="text-slate-400 hover:text-slate-600 transition-colors"
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

                  {/* Status badge — desktop only */}
                  <div className="hidden md:block">
                    {getStatusBadge(candidate.status)}
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    {candidate.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(candidate.id, 'APPROVED')}
                          disabled={updatingId === candidate.id}
                          className="bg-green-100 text-green-700 px-3 py-1.5 rounded text-[9px] font-black uppercase tracking-widest hover:bg-green-200 transition flex items-center gap-1 disabled:opacity-50"
                        >
                          <CheckCircle size={12} /> Approve
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(candidate.id, 'REJECTED')}
                          disabled={updatingId === candidate.id}
                          className="bg-red-100 text-red-600 px-3 py-1.5 rounded text-[9px] font-black uppercase tracking-widest hover:bg-red-200 transition flex items-center gap-1 disabled:opacity-50"
                        >
                          <XCircle size={12} /> Reject
                        </button>
                      </>
                    )}
                    {candidate.status !== 'PENDING' && (
                      <button
                        onClick={() => handleUpdateStatus(candidate.id, 'PENDING')}
                        disabled={updatingId === candidate.id}
                        className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded text-[9px] font-black uppercase tracking-widest hover:bg-slate-200 transition flex items-center gap-1 disabled:opacity-50"
                      >
                        <Clock size={12} /> Reset
                      </button>
                    )}
                    <button
                      onClick={() => onViewDetails(candidate)}
                      className="bg-[#4c0519]/10 text-[#4c0519] px-3 py-1.5 rounded text-[9px] font-black uppercase tracking-widest hover:bg-[#4c0519]/20 transition flex items-center gap-1"
                    >
                      <Eye size={12} /> View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {filteredCandidates.length === 0 && (
          <div className="text-center py-12">
            <Users size={36} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500 text-sm italic">
              No candidates found{filter !== 'ALL' ? ` with status: ${filter}` : ''}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
