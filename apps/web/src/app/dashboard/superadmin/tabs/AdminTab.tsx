'use client';

import React, { useState, useEffect } from 'react';

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

export default function AdminTab({
  courses,
  elections,
  votingSessions,
  fetchActiveData,
  inputStyle,
  btnStyle,
  delBtnStyle,
  formStyle
}: TabProps) {
  // Election Form State
  const [electionTitle, setElectionTitle] = useState('');
  const [electionCourseConfig, setElectionCourseConfig] = useState<Record<string, { enabled: boolean, chairs: number }>>({});

  const [modElectionId, setModElectionId] = useState('');
  const [modElectionTitle, setModElectionTitle] = useState('');
  const [modElectionCourseConfig, setModElectionCourseConfig] = useState<Record<string, { enabled: boolean, chairs: number }>>({});

  useEffect(() => {
    if (courses.length > 0) {
      const initialConfig: Record<string, { enabled: boolean, chairs: number }> = {};
      courses.forEach(c => {
        initialConfig[c.studentPrefix] = { enabled: false, chairs: 1 };
      });
      setElectionCourseConfig(initialConfig);
    }
  }, [courses]);

  // Voting Session Form State
  const [vsTitle, setVsTitle] = useState('');
  const [vsElectionId, setVsElectionId] = useState('');
  const [vsCourseId, setVsCourseId] = useState('');
  const [vsStartTime, setVsStartTime] = useState('');
  const [vsEndTime, setVsEndTime] = useState('');
  const [vsStudentIdStartBase, setVsStudentIdStartBase] = useState('');
  const [vsStudentIdEndBase, setVsStudentIdEndBase] = useState('');

  const [modVsId, setModVsId] = useState('');
  const [modVsTitle, setModVsTitle] = useState('');
  const [modVsElectionId, setModVsElectionId] = useState('');
  const [modVsCourseId, setModVsCourseId] = useState('');
  const [modVsStartTime, setModVsStartTime] = useState('');
  const [modVsEndTime, setModVsEndTime] = useState('');
  const [modVsStudentIdStartBase, setModVsStudentIdStartBase] = useState('');
  const [modVsStudentIdEndBase, setModVsStudentIdEndBase] = useState('');

  const extractIdSplit = (fullId: string | null) => {
    if (!fullId) return { prefix: '', base: '' };
    const match = fullId.match(/^[A-Za-z]+/);
    if (match) return { prefix: match[0], base: fullId.substring(match[0].length) };
    return { prefix: '', base: fullId };
  };

  const submitElection = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const courseSettings = Object.entries(electionCourseConfig)
      .filter(([_, config]) => config.enabled)
      .reduce((acc, [prefix, config]) => {
        acc[prefix] = config.chairs;
        return acc;
      }, {} as Record<string, number>);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/elections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title: electionTitle, courseSettings })
      });
      if (res.ok) {
        alert(`Election Created! ID: ${(await res.json()).id}`);
        fetchActiveData();
      } else {
        alert(`Failed: ${res.status} - ${await res.text()}`);
      }
    } catch (err: any) { alert(`Error: ${err.message}`); }
  };

  const deleteElection = async (id: string) => {
    if (!confirm("Delete election completely? This will cascade and delete all Voting Sessions connected to it!")) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/elections/${id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) { fetchActiveData(); if (modElectionId === id) setModElectionId(''); }
      else alert(`Failed: ${await res.text()}`);
    } catch (err: any) { alert(`Error: ${err.message}`); }
  };

  const toggleElectionStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'DRAFT' ? 'ACTIVE' : 'DRAFT';
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/elections/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) { fetchActiveData(); }
      else alert(`Failed: ${res.status} - ${await res.text()}`);
    } catch (err: any) { alert(`Error: ${err.message}`); }
  };

  const handleSelectElection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setModElectionId(id);
    if (!id) return;
    const el = elections.find(x => x.id === id);
    if (el) {
      setModElectionTitle(el.title);
      
      const loadedConfig: Record<string, { enabled: boolean, chairs: number }> = {};
      const savedSettings = el.courseSettings || {};
      
      courses.forEach(c => {
        const p = c.studentPrefix;
        if (savedSettings[p] !== undefined) {
          loadedConfig[p] = { enabled: true, chairs: Number(savedSettings[p]) };
        } else {
          loadedConfig[p] = { enabled: false, chairs: 1 };
        }
      });
      setModElectionCourseConfig(loadedConfig);
    }
  };

  const submitModifyElection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modElectionId) return;

    const courseSettings = Object.entries(modElectionCourseConfig)
      .filter(([_, config]) => config.enabled)
      .reduce((acc, [prefix, config]) => {
        acc[prefix] = config.chairs;
        return acc;
      }, {} as Record<string, number>);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/elections/${modElectionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title: modElectionTitle, courseSettings })
      });
      if (res.ok) { alert(`Election Modified!`); fetchActiveData(); }
      else alert(`Failed: ${res.status} - ${await res.text()}`);
    } catch (err: any) { alert(`Error: ${err.message}`); }
  };

  const submitVotingSession = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedCourse = courses.find(c => c.id === vsCourseId);
    const prefix = selectedCourse ? selectedCourse.studentPrefix : '';
    const finalStart = vsStudentIdStartBase ? `${prefix}${vsStudentIdStartBase}` : undefined;
    const finalEnd = vsStudentIdEndBase ? `${prefix}${vsStudentIdEndBase}` : undefined;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/voting-sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          electionId: vsElectionId, title: vsTitle, courseId: vsCourseId,
          startTime: vsStartTime ? new Date(vsStartTime).toISOString() : null,
          endTime: vsEndTime ? new Date(vsEndTime).toISOString() : null,
          studentIdStart: finalStart, studentIdEnd: finalEnd
        })
      });
      if (res.ok) { alert(`Voting Session Created! ID: ${(await res.json()).id}`); fetchActiveData(); }
      else alert(`Failed: ${res.status} - ${await res.text()}`);
    } catch (err: any) { alert(`Error: ${err.message}`); }
  };

  const deleteVotingSession = async (id: string, fromModForm = false) => {
    if (!confirm("Delete voting session completely?")) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/voting-sessions/${id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) { fetchActiveData(); if (fromModForm) setModVsId(''); }
      else alert(`Failed: ${await res.text()}`);
    } catch (err: any) { alert(`Error: ${err.message}`); }
  };

  const handleSelectVotingSession = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setModVsId(id);
    if (!id) return;
    const vs = votingSessions.find(x => x.id === id);
    if (vs) {
      setModVsTitle(vs.title || '');
      setModVsElectionId(vs.electionId || '');
      const crs = courses.find(c => c.code === vs.courseCode);
      setModVsCourseId(crs ? crs.id : '');

      setModVsStartTime(vs.startTime ? new Date(vs.startTime).toISOString().slice(0, 16) : '');
      setModVsEndTime(vs.endTime ? new Date(vs.endTime).toISOString().slice(0, 16) : '');

      const startObj = extractIdSplit(vs.studentIdStart);
      const endObj = extractIdSplit(vs.studentIdEnd);

      setModVsStudentIdStartBase(startObj.base);
      setModVsStudentIdEndBase(endObj.base);
    }
  };

  const submitModifyVotingSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modVsId) return;

    const selectedCourse = courses.find(c => c.id === modVsCourseId);
    const prefix = selectedCourse ? selectedCourse.studentPrefix : '';
    const finalStart = modVsStudentIdStartBase ? `${prefix}${modVsStudentIdStartBase}` : undefined;
    const finalEnd = modVsStudentIdEndBase ? `${prefix}${modVsStudentIdEndBase}` : undefined;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/voting-sessions/${modVsId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          electionId: modVsElectionId, title: modVsTitle, courseId: modVsCourseId,
          startTime: modVsStartTime ? new Date(modVsStartTime).toISOString() : null,
          endTime: modVsEndTime ? new Date(modVsEndTime).toISOString() : null,
          studentIdStart: finalStart, studentIdEnd: finalEnd
        })
      });
      if (res.ok) { alert(`Voting Session Modified!`); fetchActiveData(); }
      else alert(`Failed: ${res.status} - ${await res.text()}`);
    } catch (err: any) { alert(`Error: ${err.message}`); }
  };

  return (
    <div>
      <h1>Admin (Election Ops)</h1>

      <div style={{ marginTop: '2rem' }}>
        <h2>1. Elections</h2>
        <ul style={{ marginBottom: '1rem' }}>
          {elections.map(el => (
            <li key={el.id} style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span><strong>{el.title}</strong> ({el.id}) - <span style={{ fontWeight: 'bold', color: el.status === 'DRAFT' ? '#ca8a04' : '#16a34a' }}>{el.status}</span></span>
              
              <button 
                type="button" 
                onClick={() => toggleElectionStatus(el.id, el.status)} 
                style={{ 
                  padding: '0.25rem 0.5rem', 
                  background: el.status === 'DRAFT' ? '#16a34a' : '#ca8a04', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}>
                {el.status === 'DRAFT' ? 'Publish' : 'Set to Draft'}
              </button>

              <button type="button" onClick={() => deleteElection(el.id)} style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer' }}>✖</button>
            </li>
          ))}
        </ul>

        <form onSubmit={submitElection} style={formStyle}>
          <label>Create New Election</label>
          <input type="text" value={electionTitle} onChange={e => setElectionTitle(e.target.value)} placeholder="Title" required style={inputStyle} />
          
          <div style={{ padding: '1rem', border: '1px solid #ccc', borderRadius: '4px' }}>
            <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Course Capacities (Chairs)</p>
            {courses.map(c => (
              <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={electionCourseConfig[c.studentPrefix]?.enabled || false}
                    onChange={e => setElectionCourseConfig(prev => ({
                      ...prev,
                      [c.studentPrefix]: { ...prev[c.studentPrefix], enabled: e.target.checked }
                    }))}
                  />
                  {c.code} ({c.studentPrefix})
                </label>
                {electionCourseConfig[c.studentPrefix]?.enabled && (
                  <input 
                    type="number" 
                    min="1"
                    value={electionCourseConfig[c.studentPrefix]?.chairs || 1}
                    onChange={e => setElectionCourseConfig(prev => ({
                      ...prev,
                      [c.studentPrefix]: { ...prev[c.studentPrefix], chairs: parseInt(e.target.value) || 1 }
                    }))}
                    style={{ width: '80px', padding: '0.25rem' }}
                  />
                )}
              </div>
            ))}
          </div>

          <button type="submit" style={btnStyle}>Submit POST /elections</button>
        </form>

        <select value={modElectionId} onChange={handleSelectElection} style={{ ...inputStyle, width: '400px', marginBottom: '1rem' }}>
          <option value="">-- Modify Existing Election --</option>
          {elections.map(el => <option key={el.id} value={el.id}>{el.title}</option>)}
        </select>

        {modElectionId && (
          <form onSubmit={submitModifyElection} style={formStyle}>
            <input type="text" value={modElectionTitle} onChange={e => setModElectionTitle(e.target.value)} placeholder="Title" required style={inputStyle} />
            
            <div style={{ padding: '1rem', border: '1px solid #ccc', borderRadius: '4px' }}>
              <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Course Capacities (Chairs)</p>
              {courses.map(c => (
                <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={modElectionCourseConfig[c.studentPrefix]?.enabled || false}
                      onChange={e => setModElectionCourseConfig(prev => ({
                        ...prev,
                        [c.studentPrefix]: { ...prev[c.studentPrefix], enabled: e.target.checked }
                      }))}
                    />
                    {c.code} ({c.studentPrefix})
                  </label>
                  {modElectionCourseConfig[c.studentPrefix]?.enabled && (
                    <input 
                      type="number" 
                      min="1"
                      value={modElectionCourseConfig[c.studentPrefix]?.chairs || 1}
                      onChange={e => setModElectionCourseConfig(prev => ({
                        ...prev,
                        [c.studentPrefix]: { ...prev[c.studentPrefix], chairs: parseInt(e.target.value) || 1 }
                      }))}
                      style={{ width: '80px', padding: '0.25rem' }}
                    />
                  )}
                </div>
              ))}
            </div>
            
            <button type="submit" style={btnStyle}>Submit PATCH /elections</button>
          </form>
        )}
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h2>2. Voting Sessions</h2>
        <ul style={{ marginBottom: '1rem' }}>
          {votingSessions.map(vs => (
            <li key={vs.id}>
              <strong>{vs.title}</strong> [{courses.find(c => c.id === vs.courseId)?.code || 'N/A'}]
              <button type="button" onClick={() => deleteVotingSession(vs.id)} style={{ color: 'red', marginLeft: '1rem', background: 'none', border: 'none', cursor: 'pointer' }}>✖</button>
            </li>
          ))}
        </ul>

        <form onSubmit={submitVotingSession} style={formStyle}>
          <label>Create Voting Session</label>
          <select value={vsElectionId} onChange={e => setVsElectionId(e.target.value)} required style={inputStyle}>
            <option value="">-- Select Election --</option>
            {elections.map(e => <option key={e.id} value={e.id}>{e.title || "Election"} ({e.id})</option>)}
          </select>

          <select value={vsCourseId} onChange={e => setVsCourseId(e.target.value)} required style={inputStyle}>
            <option value="">-- Select Course --</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}
          </select>

          <input type="text" value={vsTitle} onChange={e => setVsTitle(e.target.value)} placeholder="Session Title (e.g. Session 1 DCS)" required style={inputStyle} />
          <input type="datetime-local" value={vsStartTime} onChange={e => setVsStartTime(e.target.value)} required style={inputStyle} />
          <input type="datetime-local" value={vsEndTime} onChange={e => setVsEndTime(e.target.value)} required style={inputStyle} />

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{ fontWeight: 'bold', minWidth: '40px' }}>{courses.find(c => c.id === vsCourseId)?.studentPrefix || '---'}</span>
            <input type="text" value={vsStudentIdStartBase} onChange={e => setVsStudentIdStartBase(e.target.value)} placeholder="Start Range (e.g. 2311-001)" style={{ ...inputStyle, flex: 2 }} />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{ fontWeight: 'bold', minWidth: '40px' }}>{courses.find(c => c.id === vsCourseId)?.studentPrefix || '---'}</span>
            <input type="text" value={vsStudentIdEndBase} onChange={e => setVsStudentIdEndBase(e.target.value)} placeholder="End Range (e.g. 2311-100)" style={{ ...inputStyle, flex: 2 }} />
          </div>

          <button type="submit" style={btnStyle}>Submit POST /voting-sessions</button>
        </form>

        <select value={modVsId} onChange={handleSelectVotingSession} style={{ ...inputStyle, width: '400px', marginBottom: '1rem' }}>
          <option value="">-- Modify Existing Voting Session --</option>
          {votingSessions.map(vs => <option key={vs.id} value={vs.id}>{vs.title}</option>)}
        </select>

        {modVsId && (
          <form onSubmit={submitModifyVotingSession} style={formStyle}>
            <select value={modVsElectionId} onChange={e => setModVsElectionId(e.target.value)} required style={inputStyle}>
              <option value="">-- Select Election --</option>
              {elections.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
            </select>
            <select value={modVsCourseId} onChange={e => setModVsCourseId(e.target.value)} required style={inputStyle}>
              <option value="">-- Select Course --</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}
            </select>
            <input type="text" value={modVsTitle} onChange={e => setModVsTitle(e.target.value)} placeholder="Session Title" required style={inputStyle} />
            <input type="datetime-local" value={modVsStartTime} onChange={e => setModVsStartTime(e.target.value)} required style={inputStyle} />
            <input type="datetime-local" value={modVsEndTime} onChange={e => setModVsEndTime(e.target.value)} required style={inputStyle} />

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ fontWeight: 'bold', minWidth: '40px' }}>{courses.find(c => c.id === modVsCourseId)?.studentPrefix || '---'}</span>
              <input type="text" value={modVsStudentIdStartBase} onChange={e => setModVsStudentIdStartBase(e.target.value)} placeholder="Start Range" style={{ ...inputStyle, flex: 2 }} />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ fontWeight: 'bold', minWidth: '40px' }}>{courses.find(c => c.id === modVsCourseId)?.studentPrefix || '---'}</span>
              <input type="text" value={modVsStudentIdEndBase} onChange={e => setModVsStudentIdEndBase(e.target.value)} placeholder="End Range" style={{ ...inputStyle, flex: 2 }} />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="submit" style={{ ...btnStyle, flex: 1 }}>Submit PATCH /voting-sessions</button>
              <button type="button" onClick={() => deleteVotingSession(modVsId, true)} style={{ ...delBtnStyle, flex: 1 }}>Delete Session</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
