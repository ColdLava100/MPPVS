'use client';

import React, { useState } from 'react';

interface TabProps {
  users: any[];
  courses: any[];
  elections: any[];
  votingSessions: any[];
  candidates: any[];
  fetchActiveData: () => Promise<void>;
  inputStyle: React.CSSProperties;
  btnStyle: React.CSSProperties;
  delBtnStyle: React.CSSProperties;
  formStyle: React.CSSProperties;
}

export default function VotingSimulationTab({
  users,
  courses,
  elections,
  candidates,
  fetchActiveData,
  inputStyle,
  btnStyle,
  formStyle
}: TabProps) {
  const [selectedElectionId, setSelectedElectionId] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>([]);

  // Ephemeral sandbox state (does NOT persist to DB)
  const [simulatedTallies, setSimulatedTallies] = useState<Record<string, number>>({});
  const [simulatedVoters, setSimulatedVoters] = useState<Record<string, string[]>>({});
  const [profileModalCandidate, setProfileModalCandidate] = useState<any | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

  const filteredCandidates = candidates.filter((c: any) => c.electionId === selectedElectionId);
  
  const studentUsers = users.filter((u: any) => u.role === 'STUDENT' || u.role === 'CANDIDATE');

  // Derived calculations for segmented ballot
  const activeElection = elections.find((e: any) => e.id === selectedElectionId);
  const settings = activeElection?.courseSettings || {};
  const totalCandidates = filteredCandidates.length;

  // Calculate current selections by course prefix
  const currentSelectionsByPrefix: Record<string, number> = {};
  selectedCandidateIds.forEach(selectedId => {
    const candidate = filteredCandidates.find((c: any) => c.id === selectedId);
    if (candidate?.user?.course?.studentPrefix) {
      const prefix = candidate.user.course.studentPrefix;
      currentSelectionsByPrefix[prefix] = (currentSelectionsByPrefix[prefix] || 0) + 1;
    }
  });

  // Calculate remaining votes per course
  const remainingVotesByPrefix: Record<string, number> = {};
  Object.keys(settings).forEach(prefix => {
    const limit = settings[prefix];
    const current = currentSelectionsByPrefix[prefix] || 0;
    remainingVotesByPrefix[prefix] = limit - current;
  });

  // Full ballot validation
  const isBallotComplete = Object.keys(settings).length > 0 && 
    Object.values(remainingVotesByPrefix).every((rem: any) => rem === 0);

  // Check if current student has already voted in sandbox
  const pastVoteHistory = selectedStudentId 
    ? simulatedVoters[`${selectedStudentId}-${selectedElectionId}`] 
    : undefined;

  const toggleCandidate = (candidateId: string) => {
    const candidate = filteredCandidates.find((c: any) => c.id === candidateId);
    const prefix = candidate?.user?.course?.studentPrefix;

    if (!prefix) {
      alert('Error: This candidate does not have an assigned course prefix in the database.');
      return;
    }
    
    // Check if trying to select (not deselect) and enforce limit
    if (!selectedCandidateIds.includes(candidateId)) {
      const remaining = remainingVotesByPrefix[prefix] || 0;
      if (remaining <= 0) {
        alert(`No more seats available for ${prefix}. Maximum is ${settings[prefix]}.`);
        return;
      }
    }
    
    setSelectedCandidateIds(prev => {
      if (prev.includes(candidateId)) {
        return prev.filter(id => id !== candidateId);
      }
      return [...prev, candidateId];
    });
  };

  const submitSimulatedVote = () => {
    if (!selectedElectionId || !selectedStudentId || selectedCandidateIds.length === 0) {
      alert('Please select election, student, and at least one candidate');
      return;
    }

    // Check if student already voted in this sandbox session
    const voterKey = `${selectedStudentId}-${selectedElectionId}`;
    if (simulatedVoters[voterKey]) {
      alert('Sandbox Conflict: This student has already cast a simulated ballot for this election.');
      return;
    }

    // Process simulated votes locally
    const newTallies = { ...simulatedTallies };
    selectedCandidateIds.forEach(candidateId => {
      newTallies[candidateId] = (newTallies[candidateId] || 0) + 1;
    });

    // Update sandbox state
    setSimulatedTallies(newTallies);
    setSimulatedVoters(prev => ({ 
      ...prev, 
      [`${selectedStudentId}-${selectedElectionId}`]: [...selectedCandidateIds] 
    }));

    // Clear selections
    alert('Simulated vote cast successfully! (Sandbox mode - not saved to DB)');
    setSelectedCandidateIds([]);
    setSelectedStudentId('');
  };

  const handleReset = () => {
    setSelectedElectionId('');
    setSelectedStudentId('');
    setSelectedCandidateIds([]);
    // Clear sandbox memory
    setSimulatedTallies({});
    setSimulatedVoters({});
  };

  return (
    <div>
      <h1>Voting Simulation & Live Tally</h1>
      <p style={{ marginBottom: '1.5rem', color: '#666' }}>
        Simulate student votes and watch live tally updates. All validation rules apply. (Frontend Sandbox - not saved to DB)
      </p>

      {/* Sandbox Status Indicator */}
      {Object.keys(simulatedVoters).length > 0 && (
        <div style={{ marginBottom: '1rem', padding: '0.5rem', backgroundColor: '#fef3c7', borderRadius: '4px', fontSize: '0.875rem', border: '1px solid #f59e0b' }}>
          🔒 Sandbox Mode: {Object.keys(simulatedVoters).length} simulated voter(s), {Object.values(simulatedTallies).reduce((a: any, b: any) => a + b, 0)} simulated vote(s)
        </div>
      )}

      {/* Selection Controls */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '250px' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Select Election</label>
          <select 
            value={selectedElectionId} 
            onChange={e => { setSelectedElectionId(e.target.value); setSelectedCandidateIds([]); }}
            required 
            style={{ ...inputStyle, width: '100%' }}
          >
            <option value="">-- Select Election --</option>
            {elections.map((e: any) => (
              <option key={e.id} value={e.id}>{e.title} [{e.status}]</option>
            ))}
          </select>
        </div>

        <div style={{ flex: 1, minWidth: '250px' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Select Student (Voter)</label>
          <select 
            value={selectedStudentId} 
            onChange={e => setSelectedStudentId(e.target.value)}
            required 
            style={{ ...inputStyle, width: '100%' }}
          >
            <option value="">-- Select Student --</option>
            {studentUsers.map((u: any) => (
              <option key={u.id} value={u.id}>{u.name} ({u.studentId})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Statistics Dashboard */}
      {selectedElectionId && Object.keys(settings).length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          {/* Stat Box 1: Total Candidates */}
          <div style={{ padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.875rem', color: '#666' }}>Total Candidates</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{totalCandidates}</div>
          </div>
          
          {/* Stat Box 2: Chairs per Course */}
          <div style={{ padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.875rem', color: '#666' }}>Chairs per Course</div>
            <div style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
              {Object.entries(settings).map(([prefix, chairs]: [string, any]) => (
                <div key={prefix}>{prefix}: {chairs}</div>
              ))}
            </div>
          </div>
          
          {/* Stat Box 3: Remaining Votes (Dynamic) */}
          <div style={{ padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.875rem', color: '#666' }}>Votes Remaining</div>
            <div style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
              {Object.entries(remainingVotesByPrefix).map(([prefix, remaining]: [string, any]) => (
                <div 
                  key={prefix} 
                  style={{ 
                    color: remaining <= 0 ? '#dc2626' : '#16a34a', 
                    fontWeight: remaining <= 0 ? 'bold' : 'normal' 
                  }}
                >
                  {prefix}: {remaining} {remaining <= 0 && '(Max Reached)'}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div style={{ marginBottom: '2rem' }}>
        {!isBallotComplete && selectedElectionId && !pastVoteHistory && (
          <p style={{ color: '#dc2626', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            You must allocate all remaining votes to cast this ballot.
          </p>
        )}
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            onClick={submitSimulatedVote}
            disabled={!isBallotComplete || !selectedStudentId || !!pastVoteHistory}
            style={{ 
              ...btnStyle, 
              background: (!isBallotComplete || !selectedStudentId || pastVoteHistory) ? '#9ca3af' : '#16a34a',
              cursor: (!isBallotComplete || !selectedStudentId || pastVoteHistory) ? 'not-allowed' : 'pointer',
              padding: '0.75rem 1.5rem',
              fontSize: '1rem'
            }}
          >
            {pastVoteHistory ? 'Simulated Ballot Cast' : 'Cast Simulated Vote'}
          </button>
          
          <button 
            onClick={handleReset}
            style={{ 
              ...btnStyle, 
              background: '#fff', 
              color: '#dc2626',
              border: '1px solid #dc2626',
              padding: '0.75rem 1.5rem',
              fontSize: '1rem'
            }}
          >
            Reset Simulation
          </button>
          
          {selectedCandidateIds.length > 0 && (
            <span style={{ fontWeight: 'bold' }}>
              {selectedCandidateIds.length} candidate(s) selected
            </span>
          )}
        </div>
      </div>

      {/* Candidate Grid with Live Tally */}
      {selectedElectionId && (
        <div>
          <h2 style={{ marginBottom: '1rem' }}>Candidates & Live Tally</h2>
          {filteredCandidates.length === 0 ? (
            <p style={{ color: '#666' }}>No candidates registered for this election.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
              {filteredCandidates.map((candidate: any) => {
                const realVotes = candidate._count?.votes || 0;
                const simVotes = simulatedTallies[candidate.id] || 0;
                const totalDisplay = realVotes + simVotes;
                const isSelected = selectedCandidateIds.includes(candidate.id);
                
                return (
                  <div 
                    key={candidate.id} 
                    style={{ 
                      border: isSelected ? '2px solid #16a34a' : '1px solid #ccc', 
                      borderRadius: '8px', 
                      padding: '1rem',
                      backgroundColor: isSelected ? '#f0fdf4' : '#fff',
                      position: 'relative'
                    }}
                  >
                    {/* Live Tally Badge */}
                    <div style={{ 
                      position: 'absolute', 
                      top: '0.5rem', 
                      right: '0.5rem',
                      backgroundColor: '#111827',
                      color: '#fff',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontWeight: 'bold',
                      fontSize: '0.875rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}>
                      {totalDisplay} vote{totalDisplay !== 1 ? 's' : ''}
                      {simVotes > 0 && (
                        <span style={{ color: '#22c55e', fontSize: '0.625rem', fontWeight: 'normal' }}>
                          (+{simVotes} sim)
                        </span>
                      )}
                    </div>

                    {/* Candidate Info */}
                    <div style={{ marginBottom: '0.5rem' }}>
                      <strong style={{ fontSize: '1.1rem' }}>{candidate.user?.name}</strong>
                    </div>
                    
                    <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
                      <div>ID: {candidate.user?.studentId}</div>
                      <div>Election: {candidate.election?.title}</div>
                      <div>Status: {candidate.status}</div>
                    </div>

                    <button 
                      onClick={() => setProfileModalCandidate(candidate)} 
                      style={{ color: '#2563eb', fontSize: '0.875rem', marginTop: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      View Profile
                    </button>

                    {/* Checkbox */}
                    <label style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem', 
                      marginTop: '1rem',
                      cursor: pastVoteHistory ? 'not-allowed' : 'pointer',
                      padding: '0.5rem',
                      backgroundColor: pastVoteHistory ? '#fef3c7' : (isSelected ? '#16a34a' : '#f3f4f6'),
                      borderRadius: '4px',
                      color: pastVoteHistory ? '#92400e' : (isSelected ? '#fff' : '#000')
                    }}>
                      <input 
                        type="checkbox"
                        checked={pastVoteHistory 
                          ? pastVoteHistory.includes(candidate.id) 
                          : selectedCandidateIds.includes(candidate.id)}
                        onChange={() => !pastVoteHistory && toggleCandidate(candidate.id)}
                        disabled={!!pastVoteHistory}
                        style={{ width: '1.25rem', height: '1.25rem' }}
                      />
                      {pastVoteHistory 
                        ? 'Cast (Locked)' 
                        : isSelected ? 'Selected' : 'Select to Vote'}
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
        <div style={{ 
          position: 'fixed', 
          inset: 0, 
          backgroundColor: 'rgba(0,0,0,0.7)', 
          zIndex: 50, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{ 
            backgroundColor: '#fff', 
            borderRadius: '0.5rem', 
            padding: '1.5rem', 
            maxWidth: '48rem', 
            width: '100%', 
            maxHeight: '80vh', 
            overflowY: 'auto',
            position: 'relative'
          }}>
            {/* Close Button */}
            <button 
              onClick={() => setProfileModalCandidate(null)}
              style={{ 
                position: 'absolute', 
                top: '1rem', 
                right: '1rem', 
                background: 'none', 
                border: 'none', 
                fontSize: '1.5rem', 
                cursor: 'pointer',
                color: '#666'
              }}
            >
              ✕
            </button>

            {/* Header */}
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              {profileModalCandidate.user?.name}
            </h2>
            <p style={{ color: '#666', marginBottom: '1rem' }}>
              {profileModalCandidate.election?.title} - {profileModalCandidate.status}
            </p>

            {/* Basic Info */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Basic Info</h3>
              <p>Student ID: {profileModalCandidate.user?.studentId}</p>
              <p>Course: {profileModalCandidate.user?.course?.name || 'N/A'}</p>
              {profileModalCandidate.information && (
                <p style={{ marginTop: '0.5rem' }}>{profileModalCandidate.information}</p>
              )}
            </div>

            {/* Profile Assets */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Profile Assets</h3>
              <p>Picture: {profileModalCandidate.profilePicture ? <a href={profileModalCandidate.profilePicture} target="_blank" rel="noreferrer">View</a> : 'Not provided'}</p>
              <p>Banner: {profileModalCandidate.spotlightBanner ? <a href={profileModalCandidate.spotlightBanner} target="_blank" rel="noreferrer">View</a> : 'Not provided'}</p>
            </div>

            {/* Qualifications */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Qualifications</h3>
              {profileModalCandidate.qualification ? (
                <>
                  <p>Position: {profileModalCandidate.qualification.position?.join(', ')}</p>
                  <p>CGPA: {profileModalCandidate.qualification.cgpa}</p>
                  <p>Justification: {profileModalCandidate.qualification.justification}</p>
                </>
              ) : (
                <p style={{ color: '#666' }}>No qualifications added.</p>
              )}
            </div>

            {/* Materials */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Campaign Materials</h3>
              
              {/* Manifestos */}
              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Manifestos</h4>
                {profileModalCandidate.manifestos?.length > 0 ? (
                  <ul style={{ paddingLeft: '1rem' }}>
                    {profileModalCandidate.manifestos.map((m: any) => (
                      <li key={m.id}><strong>{m.title}</strong>: {m.description}</li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ color: '#666' }}>Doesn't exist.</p>
                )}
              </div>

              {/* Videos */}
              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Videos</h4>
                {profileModalCandidate.videos?.length > 0 ? (
                  <ul style={{ paddingLeft: '1rem' }}>
                    {profileModalCandidate.videos.map((v: any) => (
                      <li key={v.id}><a href={v.videoLink} target="_blank" rel="noreferrer">{v.videoTitle}</a></li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ color: '#666' }}>Doesn't exist.</p>
                )}
              </div>

              {/* Slides */}
              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Slides</h4>
                {profileModalCandidate.slides?.length > 0 ? (
                  <ul style={{ paddingLeft: '1rem' }}>
                    {profileModalCandidate.slides.map((s: any) => (
                      <li key={s.id}><a href={s.slideLink} target="_blank" rel="noreferrer">{s.slideTitle}</a></li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ color: '#666' }}>Doesn't exist.</p>
                )}
              </div>

              {/* Posters */}
              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Posters</h4>
                {profileModalCandidate.posters?.length > 0 ? (
                  <ul style={{ paddingLeft: '1rem' }}>
                    {profileModalCandidate.posters.map((p: any) => (
                      <li key={p.id}><a href={p.posterLink} target="_blank" rel="noreferrer">View Poster</a></li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ color: '#666' }}>Doesn't exist.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
