'use client';

import React, { useState } from 'react';


export default function SuperAdminDashboard() {
  // Election Form State
  const [electionTitle, setElectionTitle] = useState('');
  const [courseSettings, setCourseSettings] = useState('{"DCS": {"chairs": 3, "maxVotes": 3}}');
  
  // Election ID State
  const [electionId, setElectionId] = useState('');

  // Voting Session Form State
  const [vsTitle, setVsTitle] = useState('');
  const [vsCourseCode, setVsCourseCode] = useState('');
  const [vsStartTime, setVsStartTime] = useState('');
  const [vsEndTime, setVsEndTime] = useState('');
  const [vsStudentIdStart, setVsStudentIdStart] = useState('');
  const [vsStudentIdEnd, setVsStudentIdEnd] = useState('');

  const submitElection = async (e: React.FormEvent) => {
    e.preventDefault();
    let parsedSettings;
    
    try {
      parsedSettings = JSON.parse(courseSettings);
    } catch(err) {
      alert("Invalid JSON in courseSettings!");
      return;
    }

    try {
      const res = await fetch('http://localhost:3001/elections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          title: electionTitle,
          courseSettings: parsedSettings
        })
      });

      if (res.ok) {
        const data = await res.json();
        setElectionId(data.id);
        alert(`Election Created! ID: ${data.id}`);
      } else {
        const error = await res.text();
        alert(`Failed to create election: ${res.status} - ${error}`);
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const submitVotingSession = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch('http://localhost:3001/voting-sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          electionId,
          title: vsTitle,
          courseCode: vsCourseCode,
          startTime: vsStartTime ? new Date(vsStartTime).toISOString() : null,
          endTime: vsEndTime ? new Date(vsEndTime).toISOString() : null,
          studentIdStart: vsStudentIdStart,
          studentIdEnd: vsStudentIdEnd
        })
      });

      if (res.ok) {
        const data = await res.json();
        alert(`Voting Session Created! ID: ${data.id}`);
      } else {
        const error = await res.text();
        alert(`Failed to create voting session: ${res.status} - ${error}`);
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <div style={{ backgroundColor: '#ffffff', color: '#000000', minHeight: '100vh', padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>God Mode API Tester</h1>
      
      <div style={{ marginTop: '2rem' }}>
        <h2>1. Create Election (POST /elections)</h2>
        <form onSubmit={submitElection} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: '400px' }}>
          <label>Title</label>
          <input 
            type="text" 
            value={electionTitle} 
            onChange={e => setElectionTitle(e.target.value)} 
            required 
            style={{ padding: '0.5rem', border: '1px solid #ccc' }}
          />
          
          <label>Course Settings (JSON)</label>
          <textarea 
            rows={5} 
            value={courseSettings} 
            onChange={e => setCourseSettings(e.target.value)} 
            required 
            style={{ fontFamily: 'monospace', padding: '0.5rem', border: '1px solid #ccc' }}
          />
          
          <button type="submit" style={{ padding: '0.5rem', marginTop: '0.5rem', background: '#000', color: '#fff', cursor: 'pointer', border: 'none' }}>
            Submit POST /elections
          </button>
        </form>
      </div>

      <hr style={{ margin: '2rem 0', borderColor: '#ccc' }} />

      <div>
        <h2>2. Create Voting Session (POST /voting-sessions)</h2>
        <form onSubmit={submitVotingSession} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: '400px' }}>
          <label>electionId</label>
          <input 
            type="text" 
            value={electionId} 
            onChange={e => setElectionId(e.target.value)} 
            required 
            style={{ padding: '0.5rem', border: '1px solid #ccc' }}
          />
          
          <label>Title</label>
          <input 
            type="text" 
            value={vsTitle} 
            onChange={e => setVsTitle(e.target.value)} 
            required 
            style={{ padding: '0.5rem', border: '1px solid #ccc' }}
          />
          
          <label>courseCode</label>
          <input 
            type="text" 
            value={vsCourseCode} 
            onChange={e => setVsCourseCode(e.target.value)} 
            required 
            style={{ padding: '0.5rem', border: '1px solid #ccc' }}
          />
          
          <label>startTime (datetime-local)</label>
          <input 
            type="datetime-local" 
            value={vsStartTime} 
            onChange={e => setVsStartTime(e.target.value)} 
            required 
            style={{ padding: '0.5rem', border: '1px solid #ccc' }}
          />
          
          <label>endTime (datetime-local)</label>
          <input 
            type="datetime-local" 
            value={vsEndTime} 
            onChange={e => setVsEndTime(e.target.value)} 
            required 
            style={{ padding: '0.5rem', border: '1px solid #ccc' }}
          />
          
          <label>studentIdStart</label>
          <input 
            type="text" 
            value={vsStudentIdStart} 
            onChange={e => setVsStudentIdStart(e.target.value)} 
            required 
            style={{ padding: '0.5rem', border: '1px solid #ccc' }}
          />
          
          <label>studentIdEnd</label>
          <input 
            type="text" 
            value={vsStudentIdEnd} 
            onChange={e => setVsStudentIdEnd(e.target.value)} 
            required 
            style={{ padding: '0.5rem', border: '1px solid #ccc' }}
          />
          
          <button type="submit" style={{ padding: '0.5rem', marginTop: '0.5rem', background: '#000', color: '#fff', cursor: 'pointer', border: 'none' }}>
            Submit POST /voting-sessions
          </button>
        </form>
      </div>
    </div>
  );
}
