'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Clock, CheckCircle, XCircle, Users, Vote, User, ChevronRight, Check } from 'lucide-react';

interface StudentDashboardProps {
  election: any;
  session: any;
  canVote: boolean;
  reason: string | null;
  user: any;
  candidates: any[];
  selectedCandidates: string[];
  onToggleCandidate: (id: string) => void;
  onViewProfile: (candidate: any) => void;
  onSubmitVote: () => void;
  hasVoted: boolean;
  votedAt: string | null;
}

export default function StudentDashboard({
  election,
  session,
  canVote,
  reason,
  user,
  candidates,
  selectedCandidates,
  onToggleCandidate,
  onViewProfile,
  onSubmitVote,
  hasVoted,
  votedAt,
}: StudentDashboardProps) {
  const router = useRouter();
  const [showSuccess, setShowSuccess] = useState(false);

  const courseSettings = election?.courseSettings || {};
  const coursePrefixes = Object.keys(courseSettings);

  const getSelectedCount = (prefix: string) => {
    return selectedCandidates.filter(id => {
      const candidate = candidates.find(c => c.id === id);
      return candidate?.user?.course?.studentPrefix === prefix;
    }).length;
  };

  const handleLogout = async () => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    router.push('/login');
  };

  const handleReviewSubmit = () => {
    localStorage.setItem('studentVoteSelection', JSON.stringify({
      election,
      selectedCandidates,
      candidates,
    }));
    router.push('/dashboard/student/confirm');
  };

  const selectedCount = selectedCandidates.length;
  const totalRequired = Object.values(courseSettings).reduce((a: number, b: any) => a + parseInt(b as string, 10), 0);
  const isBallotComplete = selectedCount === totalRequired;

  if (hasVoted) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <div className="bg-white p-12 rounded-sm max-w-md w-full mx-4 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-black uppercase tracking-tighter mb-4">
            Vote Submitted
          </h2>
          <p className="text-slate-600 mb-2">
            Your vote has been cast successfully.
          </p>
          {votedAt && (
            <p className="text-sm text-slate-500 mb-8">
              Voted on: {new Date(votedAt).toLocaleString()}
            </p>
          )}
          <button
            onClick={handleLogout}
            className="bg-[#4c0519] text-white px-8 py-4 rounded-sm text-[12px] font-black uppercase tracking-[0.3em] hover:bg-[#6b1324] transition-all w-full"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Welcome, Student
          </p>
          <h1 className="text-3xl font-bold uppercase tracking-tighter text-white">
            {user?.name || 'Student'}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            ID: {user?.studentId} | Course: {user?.course || 'N/A'}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-sm text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>

      {/* Election Info Card */}
      <div className="p-6 bg-white/95 border border-white/20 rounded-sm mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-black uppercase tracking-tighter">
              {election?.title || 'No Active Election'}
            </h2>
            {session && (
              <div className="flex items-center gap-2 mt-2 text-slate-600">
                <Clock size={14} />
                <span className="text-sm">
                  Your Session: {session.title} ({new Date(session.startTime).toLocaleTimeString()} - {new Date(session.endTime).toLocaleTimeString()})
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {canVote ? (
              <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-[10px] font-black uppercase">
                Active
              </span>
            ) : (
              <span className="bg-red-100 text-red-700 px-4 py-2 rounded-full text-[10px] font-black uppercase">
                Inactive
              </span>
            )}
          </div>
        </div>
        {!canVote && reason && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-sm">
            <p className="text-sm text-red-700">{reason}</p>
          </div>
        )}
      </div>

      {/* Ballot Status */}
      {canVote && (
        <div className="p-6 bg-[#4c0519]/10 border border-[#4c0519]/20 rounded-sm mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white uppercase tracking-tighter">
              Your Ballot
            </h3>
            <span className="text-sm text-slate-400">
              {selectedCount} / {totalRequired} votes cast
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {coursePrefixes.map(prefix => {
              const selected = getSelectedCount(prefix);
              const total = parseInt(courseSettings[prefix]);
              const isComplete = selected === total;
              return (
                <div key={prefix} className="p-4 bg-white/10 rounded-sm">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                    {prefix}
                  </p>
                  <p className={`text-2xl font-bold ${isComplete ? 'text-green-400' : 'text-white'}`}>
                    {selected}/{total}
                  </p>
                  <p className="text-[9px] text-slate-400 uppercase">
                    seats
                  </p>
                </div>
              );
            })}
          </div>

          {!isBallotComplete && (
            <p className="text-sm text-red-400 mb-4">
              You must select all required candidates to submit your vote.
            </p>
          )}

          <button
            onClick={handleReviewSubmit}
            disabled={!isBallotComplete}
            className={`px-14 py-6 rounded-sm text-[12px] font-black uppercase tracking-[0.3em] transition-all shadow-2xl flex items-center gap-4 group ${
              isBallotComplete
                ? 'bg-[#c5a021] text-black hover:bg-yellow-400 active:scale-95'
                : 'bg-slate-600 text-slate-400 cursor-not-allowed'
            }`}
          >
            Review & Submit Vote
            <ChevronRight size={18} className={`transition-transform ${isBallotComplete ? 'group-hover:translate-x-1' : ''}`} />
          </button>
        </div>
      )}

      {/* Candidates by Course */}
      {canVote && (
        <div>
          <h3 className="text-lg font-bold text-white uppercase tracking-tighter mb-4">
            Candidates
          </h3>

          {/* Show ALL candidates regardless of courseSettings */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-sm font-bold text-[#c5a021] uppercase tracking-wider">
                Select Your Candidates
              </h4>
              <span className="text-xs text-slate-400">
                {selectedCount} / {totalRequired} selected
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {candidates.map((candidate: any) => {
                const isSelected = selectedCandidates.includes(candidate.id);
                return (
                  <div
                    key={candidate.id}
                    onClick={() => onToggleCandidate(candidate.id)}
                    className={`relative overflow-hidden p-6 rounded-xl border transition-all duration-300 cursor-pointer group ${
                      isSelected
                        ? 'border-green-500 bg-green-900/20 shadow-[0_0_20px_rgba(34,197,94,0.15)]'
                        : 'border-white/10 bg-white/5 hover:border-[#c5a021]/50 hover:bg-white/10'
                    }`}
                  >
                    {/* Selection Status Badge */}
                    <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      isSelected
                        ? 'bg-green-500 text-black'
                        : 'bg-white/10 text-slate-400'
                    }`}>
                      {isSelected ? 'SELECTED' : 'CLICK TO SELECT'}
                    </div>

                    {/* Candidate Info */}
                    <div className="flex items-start gap-4 mt-2">
                      {/* Circular Checkbox */}
                      <div
                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                          isSelected
                            ? 'border-green-500 bg-green-500'
                            : 'border-white/20 bg-white/5'
                        }`}
                      >
                        {isSelected && <Check size={16} className="text-black font-bold" />}
                      </div>
                      
                      <div className="flex-1">
                        <h5 className="text-lg font-bold text-white group-hover:text-[#c5a021] transition-colors">
                          {candidate.user?.name || 'Unknown'}
                        </h5>
                        <p className="text-xs text-slate-400 mt-1">
                          {candidate.user?.course?.studentPrefix || candidate.courseCode || 'N/A'} • {candidate.user?.studentId || candidate.studentId || 'N/A'}
                        </p>
                      </div>
                    </div>

                    {/* Information Preview */}
                    {candidate.information && (
                      <p className="text-xs text-slate-400 mt-4 line-clamp-2">
                        {candidate.information}
                      </p>
                    )}

                    {/* View Profile Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewProfile(candidate);
                      }}
                      className="mt-4 w-full bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded text-[10px] font-black uppercase tracking-widest transition flex items-center justify-center gap-2"
                    >
                      <User size={14} />
                      View Profile
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {candidates.length === 0 && (
            <div className="text-center py-12 bg-slate-800/50 rounded-sm">
              <p className="text-slate-400">No candidates available yet.</p>
              <p className="text-[10px] text-slate-500 mt-2">Please check back later.</p>
            </div>
          )}
        </div>
      )}

      {/* Not eligible state */}
      {!canVote && (
        <div className="text-center py-16">
          <XCircle size={64} className="text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Voting Not Available</h3>
          <p className="text-slate-400">{reason}</p>
        </div>
      )}
    </div>
  );
}