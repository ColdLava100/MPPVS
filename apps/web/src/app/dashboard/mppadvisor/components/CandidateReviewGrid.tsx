'use client';

import React, { useState } from 'react';
import { Users, Eye, FileText, Video, Presentation, Image } from 'lucide-react';

interface CandidateReviewGridProps {
  candidates: any[];
  onViewDetails: (candidate: any) => void;
}

export default function CandidateReviewGrid({ candidates, onViewDetails }: CandidateReviewGridProps) {
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');

  const filteredCandidates = filter === 'ALL' 
    ? candidates 
    : candidates.filter(c => c.status === filter);

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

  const getMaterialCount = (candidate: any) => {
    const manifestoCount = candidate.manifestos?.length || 0;
    const videoCount = candidate.videos?.length || 0;
    const slideCount = candidate.slides?.length || 0;
    const posterCount = candidate.posters?.length || 0;
    return { manifestoCount, videoCount, slideCount, posterCount };
  };

  return (
    <div className="bg-white/5 backdrop-blur-3xl rounded-sm border border-white/10 shadow-2xl p-8 text-black">
      <div className="flex items-center justify-between mb-6 text-white">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#4c0519]/20 rounded-lg border border-white/10">
            <Users size={20} className="text-white" />
          </div>
          <h3 className="text-2xl font-bold uppercase tracking-tighter">Candidate Review</h3>
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

              <div className="flex items-center gap-6">
                <div className="flex gap-4 text-slate-400">
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

                {getStatusBadge(candidate.status)}

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
            No candidates found{filter !== 'ALL' ? ` with status: ${filter}` : ''}.
          </p>
        )}
      </div>
    </div>
  );
}