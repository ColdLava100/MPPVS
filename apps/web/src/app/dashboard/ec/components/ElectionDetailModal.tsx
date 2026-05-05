'use client';

import React from 'react';
import { X, Calendar, Users, Clock, FileText, Edit3 } from 'lucide-react';

interface ElectionDetailModalProps {
  election: any;
  courses: any[];
  onClose: () => void;
  onEditElection?: (election: any) => void;
}

export default function ElectionDetailModal({ election, courses, onClose, onEditElection }: ElectionDetailModalProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-700';
      case 'DRAFT':
        return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED':
        return 'bg-slate-100 text-slate-600';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };

  const courseSettings = election.courseSettings || {};
  const courseKeys = Object.keys(courseSettings);

  const formatDate = (date: string | null) => {
    if (!date) return 'Not set';
    return new Date(date).toLocaleString();
  };

  const formatDateOnly = (date: string | null) => {
    if (!date) return 'Not set';
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-sm max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-black uppercase tracking-tighter">{election.title}</h3>
            <span className={`inline-block mt-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${getStatusBadge(election.status)}`}>
              {election.status}
            </span>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded">
            <X size={24} className="text-slate-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-6">
          {/* Date Information */}
          <div className="p-4 bg-slate-50 rounded-sm">
            <div className="flex items-center gap-2 mb-3">
              <Calendar size={16} className="text-[#4c0519]" />
              <h4 className="text-sm font-black text-[#4c0519] uppercase tracking-wider">Election Period</h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Start Date</p>
                <p className="text-sm font-bold text-black">{formatDateOnly(election.startDate)}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">End Date</p>
                <p className="text-sm font-bold text-black">{formatDateOnly(election.endDate)}</p>
              </div>
            </div>
          </div>

          {/* Course Configuration */}
          <div className="p-4 bg-slate-50 rounded-sm">
            <div className="flex items-center gap-2 mb-3">
              <Users size={16} className="text-[#4c0519]" />
              <h4 className="text-sm font-black text-[#4c0519] uppercase tracking-wider">Course Configuration</h4>
            </div>
            {courseKeys.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {courseKeys.map(prefix => {
                  const course = courses.find(c => c.studentPrefix === prefix);
                  return (
                    <div key={prefix} className="p-3 bg-white rounded border border-slate-200">
                      <p className="text-sm font-bold text-black">{prefix}</p>
                      <p className="text-[10px] text-slate-500">{courseSettings[prefix]} seat{courseSettings[prefix] !== 1 ? 's' : ''}</p>
                      {course && <p className="text-[9px] text-slate-400">{course.name}</p>}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic">No courses configured</p>
            )}
          </div>

          {/* Timestamps */}
          <div className="p-4 bg-slate-50 rounded-sm">
            <div className="flex items-center gap-2 mb-3">
              <Clock size={16} className="text-[#4c0519]" />
              <h4 className="text-sm font-black text-[#4c0519] uppercase tracking-wider">Timeline</h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Created</p>
                <p className="text-sm font-bold text-black">{formatDate(election.createdAt)}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Last Updated</p>
                <p className="text-sm font-bold text-black">{formatDate(election.updatedAt)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-200 flex gap-3">
          {onEditElection && (
            <button 
              onClick={() => { onEditElection(election); onClose(); }}
              className="flex-1 bg-[#c5a021] hover:bg-yellow-400 text-black px-6 py-3 rounded-sm text-[10px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
            >
              <Edit3 size={16} />
              Edit Election
            </button>
          )}
          <button 
            onClick={onClose}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-black px-6 py-3 rounded-sm text-[10px] font-black uppercase tracking-widest transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}