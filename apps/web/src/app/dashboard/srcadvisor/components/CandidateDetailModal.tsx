'use client';

import React, { useState } from 'react';
import { X, FileText, Video, Presentation, ImageIcon, User, Award, ExternalLink, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { getYouTubeEmbedUrl, detectSlideType, getSlideEmbedUrl } from '@/lib/embed-utils';

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
        return <span className="bg-green-100 text-green-700 border border-green-200 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Approved</span>;
      case 'REJECTED':
        return <span className="bg-red-100 text-red-600 border border-red-200 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Rejected</span>;
      case 'PENDING':
        return <span className="bg-yellow-100 text-yellow-700 border border-yellow-200 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Pending</span>;
      default:
        return <span className="bg-slate-100 text-slate-600 border border-slate-200 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{status}</span>;
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white border border-slate-200 shadow-2xl rounded-sm max-w-4xl w-full max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 p-4 md:p-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-10 h-10 md:w-14 md:h-14 bg-[#4c0519]/10 rounded-full flex items-center justify-center text-lg md:text-xl font-bold text-[#4c0519] flex-shrink-0">
              {candidate.user?.name?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="min-w-0">
              <h2 className="text-lg md:text-xl font-bold text-slate-900 truncate">{candidate.user?.name || 'Unknown'}</h2>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest truncate">{candidate.election?.title || 'No election'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
            {getStatusBadge(candidate.status)}
            {candidate.status === 'PENDING' && (
              <div className="hidden md:flex gap-2">
                <button
                  onClick={() => handleUpdateStatus('APPROVED')}
                  disabled={updating}
                  className="bg-green-100 text-green-700 border border-green-200 px-4 py-2 rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-green-200 transition flex items-center gap-2 disabled:opacity-50"
                >
                  {updating ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                  Approve
                </button>
                <button
                  onClick={() => handleUpdateStatus('REJECTED')}
                  disabled={updating}
                  className="bg-red-100 text-red-600 border border-red-200 px-4 py-2 rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-red-200 transition flex items-center gap-2 disabled:opacity-50"
                >
                  {updating ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                  Reject
                </button>
              </div>
            )}
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-sm transition">
              <X size={20} className="text-slate-500" />
            </button>
          </div>
        </div>

        {/* Mobile approve/reject (visible when PENDING) */}
        {candidate.status === 'PENDING' && (
          <div className="md:hidden flex gap-2 px-4 md:px-6 py-3 bg-slate-50 border-b border-slate-200">
            <button
              onClick={() => handleUpdateStatus('APPROVED')}
              disabled={updating}
              className="flex-1 bg-green-100 text-green-700 border border-green-200 py-2 rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-green-200 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {updating ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />}
              Approve
            </button>
            <button
              onClick={() => handleUpdateStatus('REJECTED')}
              disabled={updating}
              className="flex-1 bg-red-100 text-red-600 border border-red-200 py-2 rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-red-200 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {updating ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={12} />}
              Reject
            </button>
          </div>
        )}

        {/* Content */}
        <div className="p-4 md:p-6 space-y-6">
          {/* Contact Info */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <User size={16} className="text-[#c5a021]" />
              <h3 className="text-[10px] font-black uppercase text-[#c5a021] tracking-widest">Contact Information</h3>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-sm p-4 md:p-5 space-y-2">
              <p className="text-slate-700 text-sm"><span className="text-slate-500 font-bold">Email:</span> {candidate.user?.email || 'Not provided'}</p>
              <p className="text-slate-700 text-sm"><span className="text-slate-500 font-bold">Student ID:</span> {candidate.user?.studentId || 'Not provided'}</p>
            </div>
          </section>

          {/* Profile */}
          <section>
            <h3 className="text-[10px] font-black uppercase text-[#c5a021] tracking-widest mb-3">Profile</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-slate-50 border border-slate-200 rounded-sm p-4 md:p-5">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Profile Picture</p>
                {candidate.profilePicture ? (
                  <img src={candidate.profilePicture} alt="Profile" className="w-full max-w-[128px] h-32 object-cover rounded-sm" />
                ) : (
                  <p className="text-slate-400 italic text-sm">Not provided</p>
                )}
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-sm p-4 md:p-5">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Spotlight Banner</p>
                {candidate.spotlightBanner ? (
                  <img src={candidate.spotlightBanner} alt="Banner" className="w-full h-32 object-cover rounded-sm" />
                ) : (
                  <p className="text-slate-400 italic text-sm">Not provided</p>
                )}
              </div>
            </div>
            {candidate.information && (
              <div className="mt-3 bg-slate-50 border border-slate-200 rounded-sm p-4 md:p-5">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Information</p>
                <p className="text-slate-700 text-sm">{candidate.information}</p>
              </div>
            )}
          </section>

          {/* Qualification */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Award size={16} className="text-[#c5a021]" />
              <h3 className="text-[10px] font-black uppercase text-[#c5a021] tracking-widest">Qualification</h3>
            </div>
            {candidate.qualification ? (
              <div className="bg-slate-50 border border-slate-200 rounded-sm p-4 md:p-5 space-y-2">
                <p className="text-slate-700 text-sm"><span className="text-slate-500 font-bold">Positions:</span> {candidate.qualification.positions?.join(', ') || 'Not specified'}</p>
                <p className="text-slate-700 text-sm"><span className="text-slate-500 font-bold">CGPA:</span> {candidate.qualification.cgpa || 'Not specified'}</p>
                <p className="text-slate-700 text-sm"><span className="text-slate-500 font-bold">Justification:</span> {candidate.qualification.justification || 'Not provided'}</p>
              </div>
            ) : (
              <p className="text-slate-400 italic text-sm bg-slate-50 border border-slate-200 rounded-sm p-4 md:p-5">No qualifications added.</p>
            )}
          </section>

          {/* Manifestos */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <FileText size={16} className="text-[#c5a021]" />
              <h3 className="text-[10px] font-black uppercase text-[#c5a021] tracking-widest">Manifestos ({candidate.manifestos?.length || 0})</h3>
            </div>
            {candidate.manifestos && candidate.manifestos.length > 0 ? (
              <div className="space-y-2">
                {candidate.manifestos.map((m: any) => (
                  <div key={m.id} className="bg-slate-50 border border-slate-200 rounded-sm p-4">
                    <p className="font-bold text-slate-900 text-sm">{m.title}</p>
                    <p className="text-slate-600 text-sm mt-1">{m.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 italic text-sm bg-slate-50 border border-slate-200 rounded-sm p-4 md:p-5">No manifestos added.</p>
            )}
          </section>

          {/* Videos */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Video size={16} className="text-[#c5a021]" />
              <h3 className="text-[10px] font-black uppercase text-[#c5a021] tracking-widest">Videos ({candidate.videos?.length || 0})</h3>
            </div>
            {candidate.videos && candidate.videos.length > 0 ? (
              <div className="space-y-4">
                {candidate.videos.map((v: any) => {
                  const embedUrl = getYouTubeEmbedUrl(v.videoLink);
                  return (
                    <div key={v.id} className="bg-slate-50 border border-slate-200 rounded-sm p-4">
                      <p className="font-bold text-slate-900 text-sm">{v.videoTitle || 'Untitled'}</p>
                      {v.videoDescription && <p className="text-slate-600 text-sm mt-1">{v.videoDescription}</p>}
                      {embedUrl ? (
                        <div className="mt-3 rounded-sm overflow-hidden border border-slate-200">
                          <div className="aspect-video">
                            <iframe
                              src={embedUrl}
                              title={v.videoTitle || 'Video'}
                              className="w-full h-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        </div>
                      ) : v.videoLink ? (
                        <a href={v.videoLink} target="_blank" rel="noopener noreferrer" className="text-[#c5a021] hover:text-yellow-600 transition flex items-center gap-1 text-sm mt-2">
                          <ExternalLink size={14} /> View
                        </a>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-slate-400 italic text-sm bg-slate-50 border border-slate-200 rounded-sm p-4 md:p-5">No videos added.</p>
            )}
          </section>

          {/* Slides */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Presentation size={16} className="text-[#c5a021]" />
              <h3 className="text-[10px] font-black uppercase text-[#c5a021] tracking-widest">Slides ({candidate.slides?.length || 0})</h3>
            </div>
            {candidate.slides && candidate.slides.length > 0 ? (
              <div className="space-y-4">
                {candidate.slides.map((s: any) => {
                  const { embedUrl, warning } = getSlideEmbedUrl(s.slideLink);
                  const slideType = detectSlideType(s.slideLink);
                  return (
                    <div key={s.id} className="bg-slate-50 border border-slate-200 rounded-sm p-4">
                      <p className="font-bold text-slate-900 text-sm">{s.slideTitle || 'Untitled'}</p>
                      {warning ? (
                        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-sm">
                          <p className="text-xs text-yellow-700">{warning}</p>
                        </div>
                      ) : embedUrl ? (
                        <div className="mt-3 rounded-sm overflow-hidden border border-slate-200">
                          <div className={slideType === 'pdf' ? 'aspect-[3/4]' : 'aspect-video'}>
                            <iframe
                              src={embedUrl}
                              title={s.slideTitle || 'Slide'}
                              className="w-full h-full"
                              allowFullScreen
                            />
                          </div>
                        </div>
                      ) : s.slideLink ? (
                        <a href={s.slideLink} target="_blank" rel="noopener noreferrer" className="text-[#c5a021] hover:text-yellow-600 transition flex items-center gap-1 text-sm mt-2">
                          <ExternalLink size={14} /> View
                        </a>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-slate-400 italic text-sm bg-slate-50 border border-slate-200 rounded-sm p-4 md:p-5">No slides added.</p>
            )}
          </section>

          {/* Posters */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <ImageIcon size={16} className="text-[#c5a021]" />
              <h3 className="text-[10px] font-black uppercase text-[#c5a021] tracking-widest">Posters ({candidate.posters?.length || 0})</h3>
            </div>
            {candidate.posters && candidate.posters.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {candidate.posters.map((p: any) => (
                  <div key={p.id} className="bg-slate-50 border border-slate-200 rounded-sm p-3">
                    {p.posterLink && (
                      <img src={p.posterLink} alt="Poster" className="w-full max-h-48 object-contain rounded-sm mb-2" />
                    )}
                    {p.posterLink && (
                      <a href={p.posterLink} target="_blank" rel="noopener noreferrer" className="text-[#c5a021] hover:text-yellow-600 transition text-xs flex items-center gap-1">
                        <ExternalLink size={12} /> View Full
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 italic text-sm bg-slate-50 border border-slate-200 rounded-sm p-4 md:p-5">No posters added.</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
