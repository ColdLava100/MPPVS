'use client';

import React, { useState, useEffect } from 'react';
import { Activity, Vote } from 'lucide-react';
import UniversalHeader from '@/components/ui/universal-header';
import Background from '@/components/ui/background';

export default function BallotTracerBullet() {
  const [elections, setElections] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [selectedElectionId, setSelectedElectionId] = useState('');
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [status, setStatus] = useState('');

  useEffect(() => {
    fetchActiveData();
  }, []);

  const fetchActiveData = async () => {
    try {
      const [eRes, cRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/elections`, { credentials: 'include' }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/candidates`, { credentials: 'include' })
      ]);
      if (eRes.ok) setElections(await eRes.json());
      if (cRes.ok) setCandidates(await cRes.json());
    } catch (err) {
      console.error("Failed to fetch data", err);
    }
  };

  const handleCheckboxChange = (candidateId: string) => {
    setSelectedCandidates(prev => {
      if (prev.includes(candidateId)) {
        return prev.filter(id => id !== candidateId);
      } else {
        return [...prev, candidateId];
      }
    });
  };

  const submitVote = async () => {
    if (!selectedElectionId) {
      setStatus('Error: Please select an election first.');
      return;
    }
    if (selectedCandidates.length === 0) {
      setStatus('Error: Please select at least one candidate.');
      return;
    }

    try {
      setStatus('Submitting ballot...');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/votes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          electionId: selectedElectionId,
          candidateIds: selectedCandidates
        })
      });

      if (res.ok) {
        setStatus('Success! Ballot cast successfully.');
        setSelectedCandidates([]);
      } else {
        const errText = await res.text();
        setStatus(`Failed: ${res.status} - ${errText}`);
      }
    } catch (err: any) {
      setStatus(`Error: ${err.message}`);
    }
  };

  const relevantCandidates = candidates.filter(c => c.electionId === selectedElectionId);

  return (
    <div className="min-h-screen overflow-hidden relative font-sans text-white">
      <UniversalHeader role="student" />

      <main className="flex-grow overflow-y-auto relative custom-scrollbar">
        <Background />

        <div className="relative z-10 p-4 md:p-12 max-w-7xl mx-auto w-full flex-grow flex flex-col gap-8">
          {/* Hero Section */}
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] mb-4 flex items-center gap-2">
              <Activity size={14} className="text-red-600 animate-pulse" /> Ballot
            </p>
            <h1 className="text-2xl md:text-6xl font-bold uppercase tracking-tighter leading-none text-white">
              Cast Your Vote
            </h1>
          </div>

          {/* Main Card */}
          <div className="bg-white/95 backdrop-blur-xl border border-white/20 border-b-[6px] border-b-[#c5a021] shadow-2xl rounded-sm p-6 md:p-8 text-slate-900">
            <div className="mb-6 pb-6 border-b border-slate-200">
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">
                Select Election
              </label>
              <div className="relative">
                <select
                  value={selectedElectionId}
                  onChange={e => {
                    setSelectedElectionId(e.target.value);
                    setSelectedCandidates([]);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-sm px-4 py-3 text-slate-900 text-sm font-medium outline-none focus:border-[#c5a021] transition-colors appearance-none cursor-pointer"
                >
                  <option value="">-- Choose Election --</option>
                  {elections.map(e => (
                    <option key={e.id} value={e.id}>{e.title}</option>
                  ))}
                </select>
              </div>
            </div>

            {selectedElectionId && (
              <div className="mb-6">
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4">
                  Candidates
                </h2>
                {relevantCandidates.length === 0 ? (
                  <p className="text-sm text-slate-400">No candidates for this election.</p>
                ) : (
                  <div className="space-y-2">
                    {relevantCandidates.map(c => (
                      <label
                        key={c.id}
                        className="flex items-center gap-3 p-3 rounded-sm border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedCandidates.includes(c.id)}
                          onChange={() => handleCheckboxChange(c.id)}
                          className="accent-[#c5a021] w-4 h-4"
                        />
                        <span className="text-sm font-medium text-slate-900">
                          {c.user?.name || c.id}
                          <span className="text-slate-400 ml-2 text-xs">
                            (Position: {c.qualifications?.[0]?.position || 'N/A'})
                          </span>
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-4 pt-4 border-t border-slate-200">
              <button
                onClick={submitVote}
                className="bg-[#c5a021] hover:bg-yellow-400 text-black px-6 py-3 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 active:scale-95"
              >
                <Vote size={14} /> Submit Vote
              </button>
              {status && (
                <span className={`text-xs font-bold uppercase tracking-wider ${status.startsWith('Success') ? 'text-green-600' : status.startsWith('Error') || status.startsWith('Failed') ? 'text-red-600' : 'text-slate-500'}`}>
                  {status}
                </span>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
