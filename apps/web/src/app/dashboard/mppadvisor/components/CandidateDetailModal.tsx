'use client';

import React, { useState } from 'react';
import { X, FileText, Video, Presentation, Image, User, Award, ExternalLink, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface CandidateDetailModalProps {
  candidate: any;
  onClose: () => void;
  onRefresh?: () => void;
}

export default function CandidateDetailModal({ candidate, onClose, onRefresh }: CandidateDetailModalProps) {
  const [updating, setUpdating] = useState(false);

  if (!candidate) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <span className="bg-green-500 text-black px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Approved</span>;
      case 'REJECTED':
        return <span className="bg-red-600 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Rejected</span>;
      case 'PENDING':
        return <span className="bg-yellow-500 text-black px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Pending</span>;
      default:
        return <span className="bg-slate-500 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{status}</span>;
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!confirm(`Are you sure you want to ${newStatus.toLowerCase()} this candidate?`)) return;
    
    setUpdating(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/candidates/${candidate.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (res.ok) {
        alert(`Candidate ${newStatus.toLowerCase()} successfully!`);
        if (onRefresh) onRefresh();
        onClose();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(`Failed: ${data.message || res.status}`);
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
    setUpdating(false);
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-white/95 backdrop-blur-xl border border-white/20 rounded-sm max-w-4xl w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-[#4c0519] text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
              {candidate.user?.name?.[0]?.toUpperCase() || '?'}
            </div>
            <div>
              <h2 className="text-2xl font-bold uppercase tracking-tighter">{candidate.user?.name || 'Unknown'}</h2>
              <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">{candidate.election?.title || 'No election'}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {getStatusBadge(candidate.status)}
            {candidate.status === 'PENDING' && (
              <div className="flex gap-2">
                <button 
                  onClick={() => handleUpdateStatus('APPROVED')}
                  disabled={updating}
                  className="bg-green-500 text-black px-4 py-2 rounded text-[10px] font-black uppercase tracking-widest hover:bg-green-400 transition flex items-center gap-2 disabled:opacity-50"
                >
                  {updating ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                  Approve
                </button>
                <button 
                  onClick={() => handleUpdateStatus('REJECTED')}
                  disabled={updating}
                  className="bg-red-600 text-white px-4 py-2 rounded text-[10px] font-black uppercase tracking-widest hover:bg-red-500 transition flex items-center gap-2 disabled:opacity-50"
                >
                  {updating ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                  Reject
                </button>
              </div>
            )}
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded transition"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Contact Info */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <User size={18} className="text-[#4c0519]" />
              <h3 className="text-lg font-bold uppercase tracking-tighter text-[#4c0519]">Contact Information</h3>
            </div>
            <div className="bg-white/50 p-4 rounded-lg border border-slate-200">
              <p className="text-sm"><span className="font-bold">Email:</span> {candidate.user?.email || 'Not provided'}</p>
              <p className="text-sm mt-2"><span className="font-bold">Student ID:</span> {candidate.user?.studentId || 'Not provided'}</p>
            </div>
          </section>

          {/* Profile */}
          <section>
            <h3 className="text-lg font-bold uppercase tracking-tighter text-[#4c0519] mb-4">Profile</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/50 p-4 rounded-lg border border-slate-200">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Profile Picture</p>
                {candidate.profilePicture ? (
                  <img src={candidate.profilePicture} alt="Profile" className="w-32 h-32 object-cover rounded-lg" />
                ) : (
                  <p className="text-slate-400 italic">Not provided</p>
                )}
              </div>
              <div className="bg-white/50 p-4 rounded-lg border border-slate-200">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Spotlight Banner</p>
                {candidate.spotlightBanner ? (
                  <img src={candidate.spotlightBanner} alt="Banner" className="w-full h-32 object-cover rounded-lg" />
                ) : (
                  <p className="text-slate-400 italic">Not provided</p>
                )}
              </div>
            </div>
            {candidate.information && (
              <div className="mt-4 bg-white/50 p-4 rounded-lg border border-slate-200">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Information</p>
                <p className="text-sm">{candidate.information}</p>
              </div>
            )}
          </section>

          {/* Qualification */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Award size={18} className="text-[#4c0519]" />
              <h3 className="text-lg font-bold uppercase tracking-tighter text-[#4c0519]">Qualification</h3>
            </div>
            {candidate.qualification ? (
              <div className="bg-white/50 p-4 rounded-lg border border-slate-200 space-y-3">
                <p className="text-sm"><span className="font-bold">Positions:</span> {candidate.qualification.positions?.join(', ') || 'Not specified'}</p>
                <p className="text-sm"><span className="font-bold">CGPA:</span> {candidate.qualification.cgpa || 'Not specified'}</p>
                <p className="text-sm"><span className="font-bold">Justification:</span> {candidate.qualification.justification || 'Not provided'}</p>
              </div>
            ) : (
              <p className="text-slate-400 italic bg-white/50 p-4 rounded-lg border border-slate-200">No qualifications added.</p>
            )}
          </section>

          {/* Manifestos */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <FileText size={18} className="text-[#4c0519]" />
              <h3 className="text-lg font-bold uppercase tracking-tighter text-[#4c0519]">Manifestos ({candidate.manifestos?.length || 0})</h3>
            </div>
            {candidate.manifestos && candidate.manifestos.length > 0 ? (
              <div className="space-y-3">
                {candidate.manifestos.map((m: any) => (
                  <div key={m.id} className="bg-white/50 p-4 rounded-lg border border-slate-200">
                    <p className="font-bold text-sm">{m.title}</p>
                    <p className="text-sm text-slate-600 mt-1">{m.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 italic bg-white/50 p-4 rounded-lg border border-slate-200">No manifestos added.</p>
            )}
          </section>

          {/* Videos */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Video size={18} className="text-[#4c0519]" />
              <h3 className="text-lg font-bold uppercase tracking-tighter text-[#4c0519]">Videos ({candidate.videos?.length || 0})</h3>
            </div>
            {candidate.videos && candidate.videos.length > 0 ? (
              <div className="space-y-3">
                {candidate.videos.map((v: any) => (
                  <div key={v.id} className="bg-white/50 p-4 rounded-lg border border-slate-200 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm">{v.videoTitle || 'Untitled'}</p>
                      {v.videoDescription && <p className="text-sm text-slate-600 mt-1">{v.videoDescription}</p>}
                    </div>
                    {v.videoLink && (
                      <a href={v.videoLink} target="_blank" rel="noopener noreferrer" className="text-[#4c0519] hover:underline flex items-center gap-1 text-sm">
                        <ExternalLink size={14} /> View
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 italic bg-white/50 p-4 rounded-lg border border-slate-200">No videos added.</p>
            )}
          </section>

          {/* Slides */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Presentation size={18} className="text-[#4c0519]" />
              <h3 className="text-lg font-bold uppercase tracking-tighter text-[#4c0519]">Slides ({candidate.slides?.length || 0})</h3>
            </div>
            {candidate.slides && candidate.slides.length > 0 ? (
              <div className="space-y-3">
                {candidate.slides.map((s: any) => (
                  <div key={s.id} className="bg-white/50 p-4 rounded-lg border border-slate-200 flex items-center justify-between">
                    <p className="font-bold text-sm">{s.slideTitle || 'Untitled'}</p>
                    {s.slideLink && (
                      <a href={s.slideLink} target="_blank" rel="noopener noreferrer" className="text-[#4c0519] hover:underline flex items-center gap-1 text-sm">
                        <ExternalLink size={14} /> View
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 italic bg-white/50 p-4 rounded-lg border border-slate-200">No slides added.</p>
            )}
          </section>

          {/* Posters */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Image size={18} className="text-[#4c0519]" />
              <h3 className="text-lg font-bold uppercase tracking-tighter text-[#4c0519]">Posters ({candidate.posters?.length || 0})</h3>
            </div>
            {candidate.posters && candidate.posters.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {candidate.posters.map((p: any) => (
                  <div key={p.id} className="bg-white/50 p-4 rounded-lg border border-slate-200">
                    {p.posterLink && (
                      <img src={p.posterLink} alt="Poster" className="w-full h-32 object-cover rounded mb-2" />
                    )}
                    {p.posterLink && (
                      <a href={p.posterLink} target="_blank" rel="noopener noreferrer" className="text-[#4c0519] hover:underline text-xs flex items-center gap-1">
                        <ExternalLink size={12} /> View Full
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 italic bg-white/50 p-4 rounded-lg border border-slate-200">No posters added.</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}