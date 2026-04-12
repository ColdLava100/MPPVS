'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, UserCheck } from 'lucide-react';

interface SessionListProps {
  electionId: string;
}

interface Session {
  id: string;
  title: string;
  courseCode: string;
  startTime: string;
  endTime: string;
  studentIdStart: string | null;
  studentIdEnd: string | null;
  totalVoters: number;
  votedCount: number;
}

export default function SessionList({ electionId }: SessionListProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/elections/${electionId}/sessions`,
          { credentials: 'include' }
        );

        if (res.ok) {
          const data = await res.json();
          setSessions(data);
        }
      } catch (err) {
        console.error('Failed to fetch sessions:', err);
      }
      setLoading(false);
    };

    fetchSessions();
  }, [electionId]);

  const formatDateTime = (dateStr: string | null) => {
    if (!dateStr) return 'Not set';
    return new Date(dateStr).toLocaleString();
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-500">Loading sessions...</p>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-50 border border-dashed border-slate-300 rounded-sm">
        <Calendar size={48} className="text-slate-300 mx-auto mb-4" />
        <p className="text-slate-500 text-lg font-bold">No voting sessions created</p>
        <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-2">
          Sessions can be created from the SPR Dashboard workflow
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Summary */}
      <div className="flex items-center gap-6 mb-6 text-sm">
        <span className="text-slate-500">
          Total: <span className="font-bold text-black">{sessions.length}</span> sessions
        </span>
        <span className="text-green-600 flex items-center gap-1">
          <UserCheck size={14} />
          <span className="font-bold">{sessions.reduce((sum, s) => sum + s.votedCount, 0)}</span> total votes
        </span>
        <span className="text-slate-500 flex items-center gap-1">
          <Users size={14} />
          <span className="font-bold">{sessions.reduce((sum, s) => sum + s.totalVoters, 0)}</span> total voters
        </span>
      </div>

      {/* Sessions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sessions.map((session) => (
          <div 
            key={session.id} 
            className="p-6 bg-slate-50 border border-slate-200 rounded-sm hover:border-[#4c0519] transition-colors"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="text-sm font-bold text-black">{session.title}</h4>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">{session.courseCode}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-green-600">{session.votedCount}</p>
                <p className="text-[9px] text-slate-500 uppercase">voted</p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-slate-500">
                <Clock size={14} />
                <span>
                  {formatDateTime(session.startTime)} - {formatDateTime(session.endTime)}
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-slate-500">
                <Users size={14} />
                <span>
                  ID Range: {session.studentIdStart || 'All'} - {session.studentIdEnd || 'Open-ended'}
                </span>
              </div>

              <div className="flex items-center gap-2 text-slate-500">
                <UserCheck size={14} />
                <span>
                  {session.votedCount} / {session.totalVoters} voters
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            {session.totalVoters > 0 && (
              <div className="mt-4">
                <div className="flex items-center justify-between text-[9px] text-slate-500 mb-1">
                  <span>Voter Turnout</span>
                  <span>{((session.votedCount / session.totalVoters) * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{ width: `${(session.votedCount / session.totalVoters) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}