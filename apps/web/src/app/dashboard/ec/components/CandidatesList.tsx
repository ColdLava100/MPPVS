'use client';

import React, { useState, useEffect } from 'react';
import { Users, UserX } from 'lucide-react';

interface CandidatesListProps {
  electionId: string;
}

interface Candidate {
  id: string;
  name: string;
  studentId: string;
  courseCode: string;
  courseName: string;
  voteCount: number;
}

export default function CandidatesList({ electionId }: CandidatesListProps) {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/elections/${electionId}/candidates`,
          { credentials: 'include' }
        );

        if (res.ok) {
          const data = await res.json();
          setCandidates(data);
        }
      } catch (err) {
        console.error('Failed to fetch candidates:', err);
      }
      setLoading(false);
    };

    fetchCandidates();
  }, [electionId]);

  const totalVotes = candidates.reduce((sum, c) => sum + c.voteCount, 0);

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-500">Loading candidates...</p>
      </div>
    );
  }

  if (candidates.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-50 border border-dashed border-slate-300 rounded-sm">
        <UserX size={48} className="text-slate-300 mx-auto mb-4" />
        <p className="text-slate-500 text-lg font-bold">No candidates registered yet</p>
        <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-2">
          Candidates can be added from the EC Dashboard
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Summary */}
      <div className="flex items-center gap-6 mb-6 text-sm">
        <span className="text-slate-500">
          Total: <span className="font-bold text-black">{candidates.length}</span> candidates
        </span>
        <span className="text-slate-500">
          Total Votes: <span className="font-bold text-black">{totalVotes}</span>
        </span>
      </div>

      {/* Candidates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {candidates.map((candidate) => (
          <div 
            key={candidate.id} 
            className="p-6 bg-slate-50 border border-slate-200 rounded-sm hover:border-[#4c0519] transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="text-sm font-bold text-black">{candidate.name}</h4>
                <p className="text-[10px] text-slate-500 font-mono">{candidate.studentId}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-[#4c0519]">{candidate.voteCount}</p>
                <p className="text-[9px] text-slate-500 uppercase tracking-wider">votes</p>
              </div>
            </div>
            
            <div className="pt-3 border-t border-slate-200">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Course</p>
              <p className="text-sm font-bold text-black">{candidate.courseCode} - {candidate.courseName}</p>
            </div>

            {totalVotes > 0 && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-[9px] text-slate-500 mb-1">
                  <span>Vote Share</span>
                  <span>{((candidate.voteCount / totalVotes) * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className="bg-[#c5a021] h-2 rounded-full transition-all"
                    style={{ width: `${(candidate.voteCount / totalVotes) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Leaderboard Table */}
      <div className="mt-8">
        <h4 className="text-sm font-black text-[#4c0519] uppercase tracking-widest mb-4">Leaderboard</h4>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left text-[10px] font-black text-slate-500 uppercase tracking-widest px-4 py-3">Rank</th>
                <th className="text-left text-[10px] font-black text-slate-500 uppercase tracking-widest px-4 py-3">Candidate</th>
                <th className="text-left text-[10px] font-black text-slate-500 uppercase tracking-widest px-4 py-3">Course</th>
                <th className="text-right text-[10px] font-black text-slate-500 uppercase tracking-widest px-4 py-3">Votes</th>
                <th className="text-right text-[10px] font-black text-slate-500 uppercase tracking-widest px-4 py-3">Percentage</th>
              </tr>
            </thead>
            <tbody>
              {candidates
                .sort((a, b) => b.voteCount - a.voteCount)
                .map((candidate, index) => (
                  <tr key={candidate.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <span className={`text-sm font-bold ${
                        index === 0 ? 'text-yellow-600' : 
                        index === 1 ? 'text-slate-400' : 
                        index === 2 ? 'text-orange-600' : 'text-slate-600'
                      }`}>
                        #{index + 1}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <span className="text-sm font-bold text-black">{candidate.name}</span>
                        <p className="text-[10px] text-slate-500">{candidate.studentId}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-slate-600">{candidate.courseCode}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-bold text-black">{candidate.voteCount}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm text-slate-600">
                        {totalVotes > 0 ? ((candidate.voteCount / totalVotes) * 100).toFixed(1) : 0}%
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}