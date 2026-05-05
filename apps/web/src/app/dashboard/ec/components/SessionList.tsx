'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, UserCheck, List, LayoutGrid, X } from 'lucide-react';

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

interface VoterInfo {
  userId: string;
  name: string;
  studentId: string;
  icNumber?: string;
  courseCode?: string;
  hasVoted: boolean;
  votedAt: string | null;
}

export default function SessionList({ electionId }: SessionListProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'card'>('list');

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [detailTab, setDetailTab] = useState<'roster' | 'candidates'>('roster');
  const [detailVoters, setDetailVoters] = useState<VoterInfo[]>([]);
  const [loadingDetailVoters, setLoadingDetailVoters] = useState(false);
  const [detailCandidates, setDetailCandidates] = useState<any[]>([]);
  const [loadingDetailCandidates, setLoadingDetailCandidates] = useState(false);
  const [rosterStatusFilter, setRosterStatusFilter] = useState('all');
  const [rosterCourseFilter, setRosterCourseFilter] = useState('all');

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

  const handleOpenDetail = async (session: Session) => {
    setSelectedSession(session);
    setDetailModalOpen(true);
    setDetailTab('roster');
    setLoadingDetailVoters(true);
    setLoadingDetailCandidates(true);
    setRosterStatusFilter('all');
    setRosterCourseFilter('all');

    const [vRes, cRes] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/voting-sessions/${session.id}/voters`, { credentials: 'include' }),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/voting-sessions/${session.id}/candidates`, { credentials: 'include' }),
    ]);
    if (vRes.ok) setDetailVoters(await vRes.json());
    if (cRes.ok) setDetailCandidates(await cRes.json());
    setLoadingDetailVoters(false);
    setLoadingDetailCandidates(false);
  };

  const closeDetailModal = () => {
    setDetailModalOpen(false);
    setSelectedSession(null);
    setDetailVoters([]);
    setDetailCandidates([]);
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
          Sessions can be created from the EC Dashboard workflow
        </p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-forwards">
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
        <div className="ml-auto flex items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">View</span>
          <div className="flex gap-1 bg-slate-100 p-1 rounded-md">
            <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-sm transition-colors ${viewMode === 'list' ? 'bg-white text-[#4c0519] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`} title="List view">
              <List size={16} />
            </button>
            <button onClick={() => setViewMode('card')} className={`p-1.5 rounded-sm transition-colors ${viewMode === 'card' ? 'bg-white text-[#4c0519] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`} title="Card view">
              <LayoutGrid size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Sessions */}
      {viewMode === 'card' ? (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sessions.map((session) => (
          <div
            key={session.id}
            onClick={() => handleOpenDetail(session)}
            className="p-6 bg-slate-50 border border-slate-200 rounded-sm hover:border-[#c5a021] hover:shadow-lg transition-all cursor-pointer"
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
                <span>{formatDateTime(session.startTime)} - {formatDateTime(session.endTime)}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <Users size={14} />
                <span>ID Range: {session.studentIdStart || 'All'} - {session.studentIdEnd || 'Open-ended'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <UserCheck size={14} />
                <span>{session.votedCount} / {session.totalVoters} voters</span>
              </div>
            </div>
            {session.totalVoters > 0 && (
              <div className="mt-4">
                <div className="flex items-center justify-between text-[9px] text-slate-500 mb-1">
                  <span>Voter Turnout</span>
                  <span>{((session.votedCount / session.totalVoters) * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full transition-all" style={{ width: `${(session.votedCount / session.totalVoters) * 100}%` }} />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      ) : (
      <div className="flex flex-col gap-3">
        {sessions.map((session) => (
          <div
            key={session.id}
            onClick={() => handleOpenDetail(session)}
            className="p-4 bg-slate-50 border border-slate-200 rounded-sm hover:border-[#c5a021] hover:shadow-lg transition-all cursor-pointer flex items-center justify-between gap-4"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h4 className="text-sm font-bold text-black truncate">{session.title}</h4>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider flex-shrink-0">{session.courseCode}</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                <span className="flex items-center gap-1"><Clock size={12} />{formatDateTime(session.startTime)}</span>
                <span className="flex items-center gap-1"><Users size={12} />{session.totalVoters} voters</span>
                <span className="flex items-center gap-1 text-green-600 font-bold"><UserCheck size={12} />{session.votedCount} voted</span>
              </div>
              {session.totalVoters > 0 && (
                <div className="mt-2 w-48">
                  <div className="w-full bg-slate-200 rounded-full h-1.5">
                    <div className="bg-green-500 h-1.5 rounded-full transition-all" style={{ width: `${(session.votedCount / session.totalVoters) * 100}%` }} />
                  </div>
                </div>
              )}
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-lg font-bold text-green-600">{session.votedCount}</p>
              <p className="text-[9px] text-slate-500 uppercase">voted</p>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* Session Detail Modal */}
      {detailModalOpen && selectedSession && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 p-10 flex items-center justify-center">
          <div className="bg-white rounded-sm max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <div>
                <h2 className="text-xl font-bold text-slate-800">{selectedSession.title}</h2>
                <p className="text-xs text-slate-500 mt-1">
                  {formatDateTime(selectedSession.startTime)} — {formatDateTime(selectedSession.endTime)}
                </p>
              </div>
              <button onClick={closeDetailModal} className="p-2 hover:bg-slate-100 rounded">
                <X size={24} className="text-slate-400" />
              </button>
            </div>
            <div className="flex gap-2 px-6 pt-4 border-b border-slate-100 pb-4">
              <button onClick={() => setDetailTab('roster')} className={`flex items-center gap-2 px-4 py-2 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all ${detailTab === 'roster' ? 'bg-[#4c0519] text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                <Users size={14} /> Voter Roster
              </button>
              <button onClick={() => setDetailTab('candidates')} className={`flex items-center gap-2 px-4 py-2 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all ${detailTab === 'candidates' ? 'bg-[#4c0519] text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                <UserCheck size={14} /> Candidate Performance
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {detailTab === 'roster' ? (
                loadingDetailVoters ? (
                  <div className="text-center py-12"><p className="text-slate-500">Loading voters...</p></div>
                ) : detailVoters.length === 0 ? (
                  <div className="text-center py-12"><p className="text-slate-500">No voters found for this session.</p></div>
                ) : (
                  <>
                    <div className="flex items-center gap-6 mb-4 text-sm flex-wrap">
                      <span className="text-slate-500">Total: <span className="font-bold text-black">{detailVoters.length}</span></span>
                      <span className="text-green-600">Voted: <span className="font-bold">{detailVoters.filter(v => v.hasVoted).length}</span> ({detailVoters.length > 0 ? ((detailVoters.filter(v => v.hasVoted).length / detailVoters.length) * 100).toFixed(1) : 0}%)</span>
                      <span className="text-slate-500">Not Voted: <span className="font-bold">{detailVoters.filter(v => !v.hasVoted).length}</span></span>
                      <select value={rosterStatusFilter} onChange={e => setRosterStatusFilter(e.target.value)} className="ml-auto bg-white border-b border-slate-300 px-3 py-1.5 text-xs text-black outline-none focus:border-[#4c0519] font-bold">
                        <option value="all">All Status</option>
                        <option value="voted">Voted</option>
                        <option value="notVoted">Not Voted</option>
                      </select>
                      <select value={rosterCourseFilter} onChange={e => setRosterCourseFilter(e.target.value)} className="bg-white border-b border-slate-300 px-3 py-1.5 text-xs text-black outline-none focus:border-[#4c0519] font-bold">
                        <option value="all">All Courses</option>
                        {[...new Set(detailVoters.map(v => v.courseCode).filter(Boolean))].map(c => <option key={c} value={c!}>{c}</option>)}
                      </select>
                    </div>
                    <div className="max-h-[50vh] overflow-y-auto">
                      <table className="w-full">
                        <thead className="bg-slate-50 sticky top-0">
                          <tr>
                            <th className="text-left text-[10px] font-black text-slate-500 uppercase tracking-widest px-3 py-2">Name</th>
                            <th className="text-left text-[10px] font-black text-slate-500 uppercase tracking-widest px-3 py-2">IC Number</th>
                            <th className="text-left text-[10px] font-black text-slate-500 uppercase tracking-widest px-3 py-2">Course</th>
                            <th className="text-left text-[10px] font-black text-slate-500 uppercase tracking-widest px-3 py-2">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {detailVoters
                            .filter(v => rosterStatusFilter === 'all' || (rosterStatusFilter === 'voted' ? v.hasVoted : !v.hasVoted))
                            .filter(v => rosterCourseFilter === 'all' || v.courseCode === rosterCourseFilter)
                            .map(voter => (
                            <tr key={voter.userId} className="border-b border-slate-100">
                              <td className="px-3 py-2 text-sm font-bold text-black">{voter.name}</td>
                              <td className="px-3 py-2 text-sm font-mono text-slate-600">{voter.icNumber || 'N/A'}</td>
                              <td className="px-3 py-2 text-sm text-slate-600">{voter.courseCode || 'N/A'}</td>
                              <td className="px-3 py-2">
                                {voter.hasVoted ? (
                                  <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-[10px] font-black uppercase">Voted</span>
                                ) : (
                                  <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full text-[10px] font-black uppercase">Not Voted</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )
              ) : (
                loadingDetailCandidates ? (
                  <div className="text-center py-12"><p className="text-slate-500">Loading candidates...</p></div>
                ) : detailCandidates.every(c => c.voteCount === 0) ? (
                  <div className="text-center py-12">
                    <UserCheck size={48} className="text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 font-bold">No votes have been cast in this session yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {detailCandidates
                      .sort((a, b) => b.voteCount - a.voteCount)
                      .map(c => {
                        const maxVotes = Math.max(...detailCandidates.map(x => x.voteCount), 1);
                        const pct = (c.voteCount / maxVotes) * 100;
                        return (
                          <div key={c.id} className="p-4 bg-slate-50 rounded-sm border border-slate-200">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <span className="text-sm font-bold text-slate-800">{c.name}</span>
                                <span className="text-[10px] text-slate-500 uppercase tracking-wider ml-2">{c.courseCode}</span>
                              </div>
                              <span className="text-lg font-bold text-[#c5a021]">{c.voteCount} votes</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2">
                              <div className="bg-[#c5a021] h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
