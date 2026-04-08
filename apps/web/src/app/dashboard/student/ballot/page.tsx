'use client';

import React, { useState, useEffect } from 'react';

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
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', backgroundColor: '#fff', color: '#000', minHeight: '100vh' }}>
      <h1>Ballot Tracer Bullet</h1>
      
      <div style={{ marginBottom: '1rem' }}>
        <p><strong>Status:</strong> {status}</p>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <label>Select Election: </label>
        <select 
          value={selectedElectionId} 
          onChange={e => {
            setSelectedElectionId(e.target.value);
            setSelectedCandidates([]);
          }}
        >
          <option value="">-- Choose Election --</option>
          {elections.map(e => (
            <option key={e.id} value={e.id}>{e.title}</option>
          ))}
        </select>
      </div>

      {selectedElectionId && (
        <div style={{ marginBottom: '2rem' }}>
          <h2>Candidates</h2>
          {relevantCandidates.length === 0 ? <p>No candidates for this election.</p> : (
            <ul>
              {relevantCandidates.map(c => (
                <li key={c.id} style={{ marginBottom: '0.5rem', listStyle: 'none' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input  
                      type="checkbox" 
                      checked={selectedCandidates.includes(c.id)}
                      onChange={() => handleCheckboxChange(c.id)}
                    />
                    {c.user?.name || c.id} (Position: {c.qualifications?.[0]?.position || 'N/A'})
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <button onClick={submitVote} style={{ padding: '0.5rem 1rem', background: '#000', color: '#fff', border: 'none', cursor: 'pointer' }}>
        Submit Vote
      </button>
    </div>
  );
}
