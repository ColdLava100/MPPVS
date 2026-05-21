'use client';

import React, { useState } from 'react';
import { Vote, RotateCcw, UserCheck } from 'lucide-react';

interface VotingSimulationProps {
  users: any[];
  elections: any[];
  candidates: any[];
}

export default function VotingSimulation({ users, elections, candidates }: VotingSimulationProps) {
  const [selectedElectionId, setSelectedElectionId] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>([]);
  const [simulatedTallies, setSimulatedTallies] = useState<Record<string, number>>({});
  const [simulatedVoters, setSimulatedVoters] = useState<Record<string, string[]>>({});
  const [profileModalCandidate, setProfileModalCandidate] = useState<any | null>(null);

  const filteredCandidates = candidates.filter((c: any) => c.electionId === selectedElectionId);
  const studentUsers = users.filter((u: any) => u.role === 'STUDENT' || u.role === 'CANDIDATE');
  const activeElection = elections.find((e: any) => e.id === selectedElectionId);
  const settings = activeElection?.courseSettings || {};

  const currentSelectionsByPrefix: Record<string, number> = {};
  selectedCandidateIds.forEach(selectedId => {
    const candidate = filteredCandidates.find((c: any) => c.id === selectedId);
    if (candidate?.user?.course?.studentPrefix) {
      const prefix = candidate.user.course.studentPrefix;
      currentSelectionsByPrefix[prefix] = (currentSelectionsByPrefix[prefix] || 0) + 1;
    }
  });

  const remainingVotesByPrefix: Record<string, number> = {};
  Object.keys(settings).forEach(prefix => {
    const limit = settings[prefix];
    const current = currentSelectionsByPrefix[prefix] || 0;
    remainingVotesByPrefix[prefix] = limit - current;
  });

  const isBallotComplete = Object.keys(settings).length > 0 &&
    Object.values(remainingVotesByPrefix).every((rem: any) => rem === 0);

  const pastVoteHistory = selectedStudentId
    ? simulatedVoters[`${selectedStudentId}-${selectedElectionId}`]
    : undefined;

  const toggleCandidate = (candidateId: string) => {
    const candidate = filteredCandidates.find((c: any) => c.id === candidateId);
    const prefix = candidate?.user?.course?.studentPrefix;
    if (!prefix) return;
    if (!selectedCandidateIds.includes(candidateId)) {
      const remaining = remainingVotesByPrefix[prefix] || 0;
      if (remaining <= 0) {
        alert(`No more seats available for ${prefix}. Maximum is ${settings[prefix]}.`);
        return;
      }
    }
    setSelectedCandidateIds(prev =>
      prev.includes(candidateId) ? prev.filter(id => id !== candidateId) : [...prev, candidateId]
    );
  };

  const submitSimulatedVote = () => {
    if (!selectedElectionId || !selectedStudentId || selectedCandidateIds.length === 0) {
      alert('Please select election, student, and at least one candidate');
      return;
    }
    const voterKey = `${selectedStudentId}-${selectedElectionId}`;
    if (simulatedVoters[voterKey]) {
      alert('This student has already cast a simulated ballot for this election.');
      return;
    }
    const newTallies = { ...simulatedTallies };
    selectedCandidateIds.forEach(candidateId => {
      newTallies[candidateId] = (newTallies[candidateId] || 0) + 1;
    });
    setSimulatedTallies(newTallies);
    setSimulatedVoters(prev => ({
      ...prev,
      [`${selectedStudentId}-${selectedElectionId}`]: [...selectedCandidateIds]
    }));
    alert('Simulated vote cast successfully! (Sandbox mode - not saved to DB)');
    setSelectedCandidateIds([]);
    setSelectedStudentId('');
  };

  const handleReset = () => {
    setSelectedElectionId('');
    setSelectedStudentId('');
    setSelectedCandidateIds([]);
    setSimulatedTallies({});
    setSimulatedVoters({});
  };

  return (
    <div>
      {/* Sandbox Status */}
      {Object.keys(simulatedVoters).length > 0 && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-sm text-xs text-yellow-700 font-bold flex items-center gap-2">
          Sandbox: {Object.keys(simulatedVoters).length} voter(s), {Object.values(simulatedTallies).reduce((a: any, b: any) => a + b, 0)} simulated vote(s)
        </div>
      )}

      {/* Selection Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Select Election</label>
          <select value={selectedElectionId} onChange={e => { setSelectedElectionId(e.target.value); setSelectedCandidateIds([]); }}
            className="w-full bg-slate-50 border border-slate-200 rounded-sm px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#c5a021]">
            <option value="">-- Select Election --</option>
            {elections.map((e: any) => (
              <option key={e.id} value={e.id}>{e.title} [{e.status}]</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Select Student (Voter)</label>
          <select value={selectedStudentId} onChange={e => setSelectedStudentId(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-sm px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#c5a021]">
            <option value="">-- Select Student --</option>
            {studentUsers.map((u: any) => (
              <option key={u.id} value={u.id}>{u.name} ({u.studentId})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Dashboard */}
      {selectedElectionId && Object.keys(settings).length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          <div className="bg-slate-50 border border-slate-200 rounded-sm p-4">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Candidates</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{filteredCandidates.length}</p>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-sm p-4">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Chairs per Course</p>
            <div className="mt-1 space-y-0.5">
              {Object.entries(settings).map(([prefix, chairs]: [string, any]) => (
                <p key={prefix} className="text-sm text-slate-700">{prefix}: {chairs}</p>
              ))}
            </div>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-sm p-4">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Votes Remaining</p>
            <div className="mt-1 space-y-0.5">
              {Object.entries(remainingVotesByPrefix).map(([prefix, remaining]: [string, any]) => (
                <p key={prefix} className={`text-sm font-bold ${remaining <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {prefix}: {remaining} {remaining <= 0 ? '(Full)' : ''}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Action Bar */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <button onClick={submitSimulatedVote}
          disabled={!isBallotComplete || !selectedStudentId || !!pastVoteHistory}
          className="bg-[#16a34a] hover:bg-green-600 text-white px-5 py-2.5 rounded-sm text-[10px] font-black uppercase tracking-widest transition flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
          {pastVoteHistory ? 'Ballot Already Cast' : <><Vote size={14} /> Cast Simulated Vote</>}
        </button>
        <button onClick={handleReset}
          className="bg-slate-100 text-slate-700 px-4 py-2.5 rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition flex items-center gap-2">
          <RotateCcw size={14} /> Reset
        </button>
        {!isBallotComplete && selectedElectionId && !pastVoteHistory && (
          <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest">Allocate all remaining votes</span>
        )}
        {selectedCandidateIds.length > 0 && (
          <span className="text-[10px] font-bold text-slate-600">{selectedCandidateIds.length} selected</span>
        )}
      </div>

      {/* Candidate Grid with Live Tally */}
      {selectedElectionId && (
        <div>
          {filteredCandidates.length === 0 ? (
            <p className="text-slate-400 text-sm italic text-center py-6">No candidates registered for this election.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredCandidates.map((candidate: any) => {
                const realVotes = candidate._count?.votes || 0;
                const simVotes = simulatedTallies[candidate.id] || 0;
                const totalDisplay = realVotes + simVotes;
                const isSelected = selectedCandidateIds.includes(candidate.id);
                const alreadyVoted = pastVoteHistory?.includes(candidate.id);

                return (
                  <div key={candidate.id} className={`bg-slate-50 border rounded-sm p-4 relative ${isSelected ? 'border-[#16a34a] bg-green-50' : 'border-slate-200'}`}>
                    {/* Tally Badge */}
                    <div className="absolute top-2 right-2 bg-[#111827] text-white px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1">
                      {totalDisplay} vote{totalDisplay !== 1 ? 's' : ''}
                      {simVotes > 0 && <span className="text-green-400 text-[8px]">(+{simVotes})</span>}
                    </div>

                    <p className="text-sm font-bold text-slate-900 mb-1 pr-16">{candidate.user?.name}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">ID: {candidate.user?.studentId}</p>
                    <p className="text-[10px] text-slate-400">{candidate.election?.title} &bull; {candidate.status}</p>

                    <button onClick={() => setProfileModalCandidate(candidate)}
                      className="text-[#c5a021] hover:text-yellow-600 text-[10px] font-bold uppercase tracking-widest mt-2 transition">
                      View Profile
                    </button>

                    <label className={`flex items-center gap-2 mt-3 p-2.5 rounded-sm text-[10px] font-black uppercase tracking-widest cursor-pointer ${
                      pastVoteHistory ? 'bg-yellow-100 text-yellow-700' :
                      isSelected ? 'bg-[#16a34a] text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                      <input type="checkbox" checked={alreadyVoted || isSelected}
                        onChange={() => !pastVoteHistory && toggleCandidate(candidate.id)}
                        disabled={!!pastVoteHistory}
                        className="w-4 h-4" />
                      {pastVoteHistory ? 'Cast (Locked)' : isSelected ? 'Selected' : 'Select to Vote'}
                    </label>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Profile Modal */}
      {profileModalCandidate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setProfileModalCandidate(null)}>
          <div className="bg-white border border-slate-200 rounded-sm max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">{profileModalCandidate.user?.name}</h2>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{profileModalCandidate.election?.title} - {profileModalCandidate.status}</p>
              </div>
              <button onClick={() => setProfileModalCandidate(null)} className="text-slate-400 hover:text-slate-600 text-xl">✕</button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-[10px] font-black uppercase text-[#c5a021] tracking-widest mb-2">Basic Info</h3>
                <div className="bg-slate-50 border border-slate-200 rounded-sm p-3 space-y-1">
                  <p className="text-sm text-slate-700"><span className="font-bold">Student ID:</span> {profileModalCandidate.user?.studentId}</p>
                  <p className="text-sm text-slate-700"><span className="font-bold">Course:</span> {profileModalCandidate.user?.course?.name || 'N/A'}</p>
                  {profileModalCandidate.information && <p className="text-sm text-slate-700 mt-2">{profileModalCandidate.information}</p>}
                </div>
              </div>

              <div>
                <h3 className="text-[10px] font-black uppercase text-[#c5a021] tracking-widest mb-2">Qualifications</h3>
                {profileModalCandidate.qualification ? (
                  <div className="bg-slate-50 border border-slate-200 rounded-sm p-3 space-y-1">
                    <p className="text-sm text-slate-700"><span className="font-bold">Position:</span> {profileModalCandidate.qualification.positions?.join(', ')}</p>
                    <p className="text-sm text-slate-700"><span className="font-bold">CGPA:</span> {profileModalCandidate.qualification.cgpa}</p>
                    <p className="text-sm text-slate-700"><span className="font-bold">Justification:</span> {profileModalCandidate.qualification.justification}</p>
                  </div>
                ) : <p className="text-sm text-slate-400 italic">No qualifications added.</p>}
              </div>

              <div>
                <h3 className="text-[10px] font-black uppercase text-[#c5a021] tracking-widest mb-2">Manifestos</h3>
                {profileModalCandidate.manifestos?.length > 0 ? (
                  <div className="space-y-1">
                    {profileModalCandidate.manifestos.map((m: any) => (
                      <div key={m.id} className="bg-slate-50 border border-slate-200 rounded-sm p-3">
                        <p className="text-sm font-bold text-slate-900">{m.title}</p>
                        <p className="text-sm text-slate-600">{m.description}</p>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-sm text-slate-400 italic">No manifestos.</p>}
              </div>

              <div>
                <h3 className="text-[10px] font-black uppercase text-[#c5a021] tracking-widest mb-2">Videos</h3>
                {profileModalCandidate.videos?.length > 0 ? (
                  <div className="space-y-1">
                    {profileModalCandidate.videos.map((v: any) => (
                      <div key={v.id} className="bg-slate-50 border border-slate-200 rounded-sm p-3">
                        <a href={v.videoLink} target="_blank" rel="noreferrer" className="text-sm text-[#c5a021] hover:text-yellow-600 font-bold">{v.videoTitle}</a>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-sm text-slate-400 italic">No videos.</p>}
              </div>

              <div>
                <h3 className="text-[10px] font-black uppercase text-[#c5a021] tracking-widest mb-2">Slides</h3>
                {profileModalCandidate.slides?.length > 0 ? (
                  <div className="space-y-1">
                    {profileModalCandidate.slides.map((s: any) => (
                      <div key={s.id} className="bg-slate-50 border border-slate-200 rounded-sm p-3">
                        <a href={s.slideLink} target="_blank" rel="noreferrer" className="text-sm text-[#c5a021] hover:text-yellow-600 font-bold">{s.slideTitle}</a>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-sm text-slate-400 italic">No slides.</p>}
              </div>

              <div>
                <h3 className="text-[10px] font-black uppercase text-[#c5a021] tracking-widest mb-2">Posters</h3>
                {profileModalCandidate.posters?.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {profileModalCandidate.posters.map((p: any) => (
                      <div key={p.id} className="bg-slate-50 border border-slate-200 rounded-sm p-2">
                        <a href={p.posterLink} target="_blank" rel="noreferrer" className="text-[10px] text-[#c5a021] hover:text-yellow-600 font-bold">View Poster</a>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-sm text-slate-400 italic">No posters.</p>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
