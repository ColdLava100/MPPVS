'use client';

import React from 'react';
import { X, Award, FileText, ImageIcon, ExternalLink } from 'lucide-react';

interface CandidateProfileModalProps {
  candidate: any;
  onClose: () => void;
}

export default function CandidateProfileModal({ candidate, onClose }: CandidateProfileModalProps) {
  if (!candidate) return null;

  const user = candidate.user || {};
  const course = user.course || {};
  const qualification = candidate.qualification;
  const manifestos = candidate.manifestos || [];
  const posters = candidate.posters || [];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white border border-slate-200 border-t-[4px] border-t-[#c5a021] shadow-2xl rounded-sm max-w-2xl w-full max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 p-4 md:p-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-4 min-w-0">
            {candidate.profilePicture ? (
              <img src={candidate.profilePicture} alt={candidate.name || 'Candidate'} className="w-12 h-12 md:w-14 md:h-14 rounded-full object-cover border-2 border-[#c5a021]/30 flex-shrink-0" />
            ) : (
              <div className="w-12 h-12 md:w-14 md:h-14 bg-[#4c0519]/10 rounded-full flex items-center justify-center text-lg md:text-xl font-bold text-[#4c0519] flex-shrink-0">
                {candidate.name?.[0]?.toUpperCase() || '?'}
              </div>
            )}
            <div className="min-w-0">
              <h2 className="text-lg md:text-xl font-bold text-slate-900 truncate">{candidate.name || 'Unknown'}</h2>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{user.studentId || 'N/A'}</p>
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <p className="text-[10px] text-slate-500">{course.name || candidate.courseName || 'N/A'}</p>
              </div>
              {candidate.election?.title && (
                <p className="text-[9px] text-slate-400 mt-0.5">Candidate for: {candidate.election.title}</p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-sm transition flex-shrink-0 ml-2">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 md:p-6 space-y-6">
          {/* Qualification */}
          {qualification && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Award size={16} className="text-[#c5a021]" />
                <h3 className="text-[10px] font-black uppercase text-[#c5a021] tracking-widest">Qualification</h3>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-sm p-4 md:p-5 space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  {qualification.cgpa && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-[10px] font-black uppercase tracking-wider border border-green-200">
                      CGPA: {qualification.cgpa}
                    </span>
                  )}
                  {qualification.positions?.length > 0 && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#4c0519]/5 text-[#4c0519] rounded-full text-[10px] font-black uppercase tracking-wider border border-[#4c0519]/20">
                      {qualification.positions.length} position{qualification.positions.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                {qualification.positions?.length > 0 && (
                  <p className="text-slate-700 text-sm">
                    <span className="text-slate-500 font-bold">Positions:</span> {qualification.positions.join(', ')}
                  </p>
                )}
                {qualification.justification && (
                  <div className="pt-3 border-t border-slate-200">
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-wider mb-1">Justification</p>
                    <p className="text-slate-700 text-sm leading-relaxed">{qualification.justification}</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Manifestos */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <FileText size={16} className="text-[#c5a021]" />
              <h3 className="text-[10px] font-black uppercase text-[#c5a021] tracking-widest">Manifestos ({manifestos.length})</h3>
            </div>
            {manifestos.length > 0 ? (
              <div className="space-y-3">
                {manifestos.map((m: any) => (
                  <div key={m.id} className="bg-slate-50 border border-slate-200 border-l-2 border-l-[#c5a021] rounded-sm p-4">
                    <p className="font-bold text-slate-900 text-sm">{m.title}</p>
                    {m.description && <p className="text-slate-600 text-sm mt-1.5 leading-relaxed">{m.description}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 italic text-sm bg-slate-50 border border-slate-200 rounded-sm p-4 md:p-5">No manifestos available.</p>
            )}
          </section>

          {/* Posters */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <ImageIcon size={16} className="text-[#c5a021]" />
              <h3 className="text-[10px] font-black uppercase text-[#c5a021] tracking-widest">Posters ({posters.length})</h3>
            </div>
            {posters.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {posters.map((p: any) => (
                  <div key={p.id} className="bg-slate-50 border border-slate-200 rounded-sm overflow-hidden group">
                    <div className="aspect-[4/3] overflow-hidden">
                      {p.posterLink && (
                        <img src={p.posterLink} alt="Poster" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                      )}
                    </div>
                    {p.posterLink && (
                      <div className="p-2 border-t border-slate-200">
                        <a href={p.posterLink} target="_blank" rel="noopener noreferrer" className="text-[#c5a021] hover:text-yellow-600 transition text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1">
                          <ExternalLink size={11} /> View Full
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 italic text-sm bg-slate-50 border border-slate-200 rounded-sm p-4 md:p-5">No posters available.</p>
            )}
          </section>
        </div>

        <div className="p-4 md:p-6 pt-0">
          <button
            onClick={onClose}
            className="w-full bg-[#4c0519]/10 text-[#4c0519] hover:bg-[#4c0519]/20 px-6 py-3 rounded-sm text-[10px] font-black uppercase tracking-widest transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
