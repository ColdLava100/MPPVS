'use client';

import React from 'react';
import { Vote, Clock, CheckCircle, XCircle } from 'lucide-react';

interface ElectionMonitorProps {
  elections: any[];
  votingSessions: any[];
}

export default function ElectionMonitor({ elections, votingSessions }: ElectionMonitorProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="bg-green-500 text-black px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">Active</span>;
      case 'DRAFT':
        return <span className="bg-slate-500 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">Draft</span>;
      case 'COMPLETED':
        return <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">Completed</span>;
      default:
        return <span className="bg-slate-500 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">{status}</span>;
    }
  };

  const isSessionLive = (vs: any) => {
    const now = new Date();
    const start = vs.startTime ? new Date(vs.startTime) : null;
    const end = vs.endTime ? new Date(vs.endTime) : null;
    return start && end && now >= start && now <= end;
  };

  const getSessionStatus = (vs: any) => {
    const now = new Date();
    const start = vs.startTime ? new Date(vs.startTime) : null;
    const end = vs.endTime ? new Date(vs.endTime) : null;
    
    if (!start || !end) return { status: 'N/A', color: 'text-slate-400' };
    if (now < start) return { status: 'Upcoming', color: 'text-yellow-500' };
    if (now > end) return { status: 'Ended', color: 'text-slate-400' };
    return { status: 'Live', color: 'text-green-500' };
  };

  return (
    <div className="space-y-8">
      {/* Elections Section */}
      <div className="bg-white/5 backdrop-blur-3xl rounded-sm border border-white/10 shadow-2xl p-8 text-black">
        <div className="flex items-center gap-3 mb-6 text-white">
          <div className="p-3 bg-[#4c0519]/20 rounded-lg border border-white/10">
            <Vote size={20} className="text-white" />
          </div>
          <h3 className="text-2xl font-bold uppercase tracking-tighter">Election Overview</h3>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">({elections.length})</span>
        </div>

        <div className="space-y-4">
          {elections.map(election => (
            <div key={election.id} className="p-6 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-bold text-white">{election.title}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest">
                    {Object.keys(election.courseSettings || {}).join(', ') || 'No courses configured'}
                  </p>
                </div>
                {getStatusBadge(election.status)}
              </div>

              {/* Voting Sessions for this election */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Voting Sessions</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {votingSessions
                    .filter(vs => vs.electionId === election.id)
                    .map(vs => {
                      const sessionStatus = getSessionStatus(vs);
                      const isLive = isSessionLive(vs);
                      return (
                        <div key={vs.id} className="p-4 bg-white/5 rounded border border-white/10 flex items-center justify-between">
                          <div>
                            <p className="text-xs font-bold text-white">{vs.title}</p>
                            <p className="text-[9px] text-slate-400 mt-1">
                              {vs.startTime && new Date(vs.startTime).toLocaleString()} - {vs.endTime && new Date(vs.endTime).toLocaleString()}
                            </p>
                            <p className="text-[9px] text-slate-500 mt-1">Course: {vs.courseCode || 'N/A'}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {isLive ? (
                              <span className="flex items-center gap-1 text-green-500 text-[10px] font-bold">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> Live
                              </span>
                            ) : (
                              <span className={`text-[10px] font-bold ${sessionStatus.color}`}>
                                {sessionStatus.status}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  {votingSessions.filter(vs => vs.electionId === election.id).length === 0 && (
                    <p className="text-slate-400 text-xs italic col-span-2">No voting sessions configured.</p>
                  )}
                </div>
              </div>
            </div>
          ))}
          {elections.length === 0 && (
            <p className="text-slate-400 text-sm italic text-center py-8">No elections found.</p>
          )}
        </div>
      </div>

      {/* Active Sessions Summary */}
      <div className="bg-white/5 backdrop-blur-3xl rounded-sm border border-white/10 shadow-2xl p-8 text-black">
        <div className="flex items-center gap-3 mb-6 text-white">
          <div className="p-3 bg-[#4c0519]/20 rounded-lg border border-white/10">
            <Clock size={20} className="text-white" />
          </div>
          <h3 className="text-2xl font-bold uppercase tracking-tighter">Session Timeline</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-green-500/10 rounded-lg border border-green-500/30">
            <p className="text-3xl font-bold text-green-500">
              {votingSessions.filter(vs => isSessionLive(vs)).length}
            </p>
            <p className="text-[10px] font-black text-green-400 uppercase tracking-widest mt-2">Live Now</p>
          </div>
          <div className="p-6 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
            <p className="text-3xl font-bold text-yellow-500">
              {votingSessions.filter(vs => {
                const now = new Date();
                const start = vs.startTime ? new Date(vs.startTime) : null;
                return start && now < start;
              }).length}
            </p>
            <p className="text-[10px] font-black text-yellow-400 uppercase tracking-widest mt-2">Upcoming</p>
          </div>
          <div className="p-6 bg-slate-500/10 rounded-lg border border-slate-500/30">
            <p className="text-3xl font-bold text-slate-400">
              {votingSessions.filter(vs => {
                const now = new Date();
                const end = vs.endTime ? new Date(vs.endTime) : null;
                return end && now > end;
              }).length}
            </p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Completed</p>
          </div>
        </div>
      </div>
    </div>
  );
}