'use client';

import React from 'react';
import { X, User } from 'lucide-react';

interface CandidateProfileModalProps {
  candidate: any;
  onClose: () => void;
}

export default function CandidateProfileModal({ candidate, onClose }: CandidateProfileModalProps) {
  if (!candidate) return null;

  const user = candidate.user || {};
  const course = user.course || {};

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-sm max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-black uppercase tracking-tighter">
            Candidate Profile
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center">
            {user.name ? (
              <span className="text-2xl font-bold text-slate-500">
                {user.name.charAt(0).toUpperCase()}
              </span>
            ) : (
              <User size={32} className="text-slate-400" />
            )}
          </div>
          <div>
            <h4 className="text-lg font-bold text-black">{user.name || 'Unknown'}</h4>
            <p className="text-sm text-slate-500">{user.studentId || 'N/A'}</p>
            <p className="text-sm text-slate-500">{course.name || 'N/A'}</p>
          </div>
        </div>

        {candidate.information && (
          <div className="mb-6">
            <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">
              Manifesto
            </h5>
            <div className="p-4 bg-slate-50 rounded-sm">
              <p className="text-sm text-black whitespace-pre-wrap">{candidate.information}</p>
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full bg-slate-100 hover:bg-slate-200 text-black px-6 py-3 rounded-sm text-[10px] font-black uppercase tracking-widest transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}