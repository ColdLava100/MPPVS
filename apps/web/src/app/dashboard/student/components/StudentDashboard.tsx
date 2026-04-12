'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Clock, CheckCircle, XCircle, Users, Vote } from 'lucide-react';

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
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
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
            className={`px-8 py-4 rounded-sm text-[12px] font-black uppercase tracking-[0.3em] transition-all ${
              isBallotComplete
                ? 'bg-[#c5a021] text-black hover:bg-yellow-400'
                : 'bg-slate-600 text-slate-400 cursor-not-allowed'
            }`}
          >
            Review & Submit Vote
          </button>
        </div>
      )}

      {/* Candidates by Course */}
      {canVote && (
        <div>
          <h3 className="text-lg font-bold text-white uppercase tracking-tighter mb-4">
            Candidates
          </h3>

          {coursePrefixes.map(prefix => {
            const courseCandidates = candidates.filter(
              c => c.user?.course?.studentPrefix === prefix
            );
            if (courseCandidates.length === 0) return null;

            const seats = parseInt(courseSettings[prefix]);
            return (
              <div key={prefix} className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold text-[#c5a021] uppercase tracking-wider">
                    {prefix} Candidates
                  </h4>
                  <span className="text-xs text-slate-400">
                    {seats} seat{seats !== 1 ? 's' : ''} available
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {courseCandidates.map((candidate: any) => {
                    const isSelected = selectedCandidates.includes(candidate.id);
                    return (
                      <div
                        key={candidate.id}
                        onClick={() => onToggleCandidate(candidate.id)}
                        className={`p-4 border rounded-sm cursor-pointer transition-all ${
                          isSelected
                            ? 'border-green-500 bg-green-500/10'
                            : 'border-slate-200 bg-white/50 hover:border-[#4c0519]'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                isSelected
                                  ? 'border-green-500 bg-green-500'
                                  : 'border-slate-300'
                              }`}
                            >
                              {isSelected && <CheckCircle size={14} className="text-white" />}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-black">
                                {candidate.user?.name || 'Unknown'}
                              </p>
                              <p className="text-[10px] text-slate-500">
                                {candidate.user?.studentId || 'N/A'}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onViewProfile(candidate);
                            }}
                            className="text-[10px] text-[#4c0519] font-black uppercase hover:underline"
                          >
                            View
                          </button>
                        </div>
                        {candidate.information && (
                          <p className="text-[10px] text-slate-500 mt-2 line-clamp-2">
                            {candidate.information}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
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