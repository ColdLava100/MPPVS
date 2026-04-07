'use client';

import React, { useState, useEffect } from 'react';

export default function SuperAdminDashboard() {
  const [courses, setCourses] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [elections, setElections] = useState<any[]>([]);
  const [votingSessions, setVotingSessions] = useState<any[]>([]);

  useEffect(() => {
    fetchActiveData();
  }, []);

  const fetchActiveData = async () => {
    try {
      const [cRes, uRes, eRes, vRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses`, { credentials: 'include' }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, { credentials: 'include' }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/elections`, { credentials: 'include' }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/voting-sessions`, { credentials: 'include' })
      ]);
      if (cRes.ok) setCourses(await cRes.json());
      if (uRes.ok) setUsers(await uRes.json());
      if (eRes.ok) setElections(await eRes.json());
      if (vRes.ok) setVotingSessions(await vRes.json());
    } catch (err) {
      console.error("Failed to fetch dictionary sets", err);
    }
  };

  // 1. Election Form State
  const [electionTitle, setElectionTitle] = useState('');
  const [courseSettings, setCourseSettings] = useState('{"DCS": {"chairs": 3, "maxVotes": 3}}');
  
  const [modElectionId, setModElectionId] = useState('');
  const [modElectionTitle, setModElectionTitle] = useState('');
  const [modCourseSettings, setModCourseSettings] = useState('');

  // 2. Voting Session Form State
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

  // 3. User Form State (Create)
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('SUPERADMIN');
  const [userIcNumber, setUserIcNumber] = useState('');
  const [userStudentIdPrefix, setUserStudentIdPrefix] = useState('');
  const [userStudentIdBase, setUserStudentIdBase] = useState('');

  // 4. Course Form State
  const [courseCode, setCourseCode] = useState('');
  const [courseName, setCourseName] = useState('');

  // 5. User Form State (Modify)
  const [modifyUserId, setModifyUserId] = useState('');
  const [modEmail, setModEmail] = useState('');
  const [modPassword, setModPassword] = useState('');
  const [modName, setModName] = useState('');
  const [modRole, setModRole] = useState('SUPERADMIN');
  const [modIcNumber, setModIcNumber] = useState('');
  const [modStudentIdPrefix, setModStudentIdPrefix] = useState('');
  const [modStudentIdBase, setModStudentIdBase] = useState('');

  // ==============================
  // ELECTION LOGIC
  // ==============================
  const submitElection = async (e: React.FormEvent) => {
    e.preventDefault();
    let parsedSettings;
    try { parsedSettings = JSON.parse(courseSettings); } catch(err) { alert("Invalid JSON!"); return; }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/elections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title: electionTitle, courseSettings: parsedSettings })
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
    if(!confirm("Delete election completely? This will cascade and delete all Voting Sessions connected to it!")) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/elections/${id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) { fetchActiveData(); if (modElectionId === id) setModElectionId(''); }
      else alert(`Failed: ${await res.text()}`);
    } catch (err: any) { alert(`Error: ${err.message}`); }
  };

  const handleSelectElection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setModElectionId(id);
    if (!id) return;
    const el = elections.find(x => x.id === id);
    if (el) {
      setModElectionTitle(el.title);
      setModCourseSettings(JSON.stringify(el.courseSettings, null, 2));
    }
  };

  const submitModifyElection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modElectionId) return;
    let parsedSettings;
    try { parsedSettings = JSON.parse(modCourseSettings); } catch(err) { alert("Invalid JSON!"); return; }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/elections/${modElectionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title: modElectionTitle, courseSettings: parsedSettings })
      });
      if (res.ok) { alert(`Election Modified!`); fetchActiveData(); }
      else alert(`Failed: ${res.status} - ${await res.text()}`);
    } catch (err: any) { alert(`Error: ${err.message}`); }
  };


  // ==============================
  // VOTING SESSION LOGIC
  // ==============================
  const extractIdSplit = (fullId: string | null) => {
    if (!fullId) return { prefix: '', base: '' };
    const match = fullId.match(/^[A-Za-z]+/);
    if (match) return { prefix: match[0], base: fullId.substring(match[0].length) };
    return { prefix: '', base: fullId };
  };

  const submitVotingSession = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedCourse = courses.find(c => c.id === vsCourseId);
    const prefix = selectedCourse ? selectedCourse.code : '';
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
    if(!confirm("Delete voting session completely?")) return;
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
      // Try to find the matching course based on the courseCode inside exactly
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
    const prefix = selectedCourse ? selectedCourse.code : '';
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


  // ==============================
  // USER & COURSE LOGIC
  // ==============================
  const submitCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalStudentId = (userRole === 'STUDENT' || userRole === 'CANDIDATE') 
      ? (userStudentIdPrefix && userStudentIdBase ? `${userStudentIdPrefix}${userStudentIdBase}` : undefined)
      : undefined;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: userEmail, password: userPassword, name: userName,
          role: userRole, icNumber: userIcNumber || undefined, studentId: finalStudentId,
        })
      });
      if (res.ok) { alert(`User Created!`); fetchActiveData(); }
      else alert(`Failed: ${res.status} - ${await res.text()}`);
    } catch (err: any) { alert(`Error: ${err.message}`); }
  };

  const handleSelectUserToModify = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setModifyUserId(id);
    if (!id) return;
    const u = users.find(x => x.id === id);
    if (u) {
      setModEmail(u.email || ''); setModName(u.name || '');
      setModRole(u.role || 'SUPERADMIN'); setModIcNumber(u.icNumber || '');
      setModPassword(''); 
      const spl = extractIdSplit(u.studentId);
      setModStudentIdPrefix(spl.prefix); setModStudentIdBase(spl.base);
    }
  };

  const submitModifyUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!modifyUserId) return;
    const finalStudentId = (modRole === 'STUDENT' || modRole === 'CANDIDATE') 
      ? (modStudentIdPrefix && modStudentIdBase ? `${modStudentIdPrefix}${modStudentIdBase}` : undefined) : undefined;

    const payload: any = { email: modEmail, name: modName, role: modRole, icNumber: modIcNumber || undefined, studentId: finalStudentId || null};
    if (modPassword.trim() !== '') payload.password = modPassword;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${modifyUserId}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify(payload)
      });
      if (res.ok) { alert(`User Modified!`); fetchActiveData(); }
      else alert(`Failed: ${res.status} - ${await res.text()}`);
    } catch (err: any) { alert(`Error: ${err.message}`); }
  };

  const deleteUser = async () => {
    if(!modifyUserId) return;
    if(!confirm("Delete user completely?")) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${modifyUserId}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) { alert("User deleted"); setModifyUserId(''); fetchActiveData(); }
      else alert(`Failed: ${await res.text()}`);
    } catch (err: any) { alert(`Error: ${err.message}`); }
  }

  const submitCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ code: courseCode, name: courseName })
      });
      if (res.ok) { alert(`Course Created!`); fetchActiveData(); }
      else alert(`Failed: ${res.status} - ${await res.text()}`);
    } catch (err: any) { alert(`Error: ${err.message}`); }
  };

  const deleteCourse = async (id: string) => {
    if(!confirm("Delete course completely?")) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/${id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) fetchActiveData();
      else alert(`Failed: ${await res.text()}`);
    } catch (err: any) { alert(`Error: ${err.message}`); }
  };

  // Common input styling
  const inputStyle = { padding: '0.5rem', border: '1px solid #ccc' };
  const btnStyle = { padding: '0.5rem', marginTop: '0.5rem', background: '#000', color: '#fff', cursor: 'pointer', border: 'none' };
  const delBtnStyle = { ...btnStyle, background: '#dc2626' };
  const formStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: '400px', marginBottom: '2rem' };

  return (
    <div style={{ backgroundColor: '#ffffff', color: '#000000', minHeight: '100vh', padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>God Mode API Tester</h1>
      
      <div style={{ marginTop: '2rem' }}>
        <h2>1. Elections</h2>
        <ul style={{marginBottom: '1rem'}}>
          {elections.map(el => (
            <li key={el.id}>
              <strong>{el.title}</strong> ({el.id}) 
              <button type="button" onClick={() => deleteElection(el.id)} style={{color:'red', marginLeft: '1rem', background:'none', border:'none', cursor:'pointer'}}>✖</button>
            </li>
          ))}
        </ul>

        <form onSubmit={submitElection} style={formStyle}>
          <label>Create New Election</label>
          <input type="text" value={electionTitle} onChange={e => setElectionTitle(e.target.value)} placeholder="Title" required style={inputStyle} />
          <textarea rows={5} value={courseSettings} onChange={e => setCourseSettings(e.target.value)} required style={{ ...inputStyle, fontFamily: 'monospace' }} />
          <button type="submit" style={btnStyle}>Submit POST /elections</button>
        </form>

        <select value={modElectionId} onChange={handleSelectElection} style={{...inputStyle, width: '400px', marginBottom: '1rem'}}>
          <option value="">-- Modify Existing Election --</option>
          {elections.map(el => <option key={el.id} value={el.id}>{el.title}</option>)}
        </select>

        {modElectionId && (
          <form onSubmit={submitModifyElection} style={formStyle}>
            <input type="text" value={modElectionTitle} onChange={e => setModElectionTitle(e.target.value)} placeholder="Title" required style={inputStyle} />
            <textarea rows={5} value={modCourseSettings} onChange={e => setModCourseSettings(e.target.value)} required style={{ ...inputStyle, fontFamily: 'monospace' }} />
            <button type="submit" style={btnStyle}>Submit PATCH /elections</button>
          </form>
        )}
      </div>

      <hr style={{ margin: '2rem 0', borderColor: '#ccc' }} />

      <div>
        <h2>2. Voting Sessions</h2>
        <ul style={{marginBottom: '1rem'}}>
          {votingSessions.map(vs => (
            <li key={vs.id}>
              <strong>{vs.title}</strong> [{vs.courseCode}] 
              <button type="button" onClick={() => deleteVotingSession(vs.id)} style={{color:'red', marginLeft: '1rem', background:'none', border:'none', cursor:'pointer'}}>✖</button>
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
            <span style={{fontWeight: 'bold', minWidth: '40px'}}>{courses.find(c => c.id === vsCourseId)?.code || '---'}</span>
            <input type="text" value={vsStudentIdStartBase} onChange={e => setVsStudentIdStartBase(e.target.value)} placeholder="Start Range (e.g. 2311-001)" style={{...inputStyle, flex: 2}} />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{fontWeight: 'bold', minWidth: '40px'}}>{courses.find(c => c.id === vsCourseId)?.code || '---'}</span>
            <input type="text" value={vsStudentIdEndBase} onChange={e => setVsStudentIdEndBase(e.target.value)} placeholder="End Range (e.g. 2311-100)" style={{...inputStyle, flex: 2}} />
          </div>

          <button type="submit" style={btnStyle}>Submit POST /voting-sessions</button>
        </form>

        <select value={modVsId} onChange={handleSelectVotingSession} style={{...inputStyle, width: '400px', marginBottom: '1rem'}}>
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
              <span style={{fontWeight: 'bold', minWidth: '40px'}}>{courses.find(c => c.id === modVsCourseId)?.code || '---'}</span>
              <input type="text" value={modVsStudentIdStartBase} onChange={e => setModVsStudentIdStartBase(e.target.value)} placeholder="Start Range" style={{...inputStyle, flex: 2}} />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{fontWeight: 'bold', minWidth: '40px'}}>{courses.find(c => c.id === modVsCourseId)?.code || '---'}</span>
              <input type="text" value={modVsStudentIdEndBase} onChange={e => setModVsStudentIdEndBase(e.target.value)} placeholder="End Range" style={{...inputStyle, flex: 2}} />
            </div>

            <div style={{display: 'flex', gap: '1rem'}}>
              <button type="submit" style={{...btnStyle, flex: 1}}>Submit PATCH /voting-sessions</button>
              <button type="button" onClick={() => deleteVotingSession(modVsId, true)} style={{...delBtnStyle, flex: 1}}>Delete Session</button>
            </div>
          </form>
        )}
      </div>

      <hr style={{ margin: '2rem 0', borderColor: '#ccc' }} />

      <div>
        <h2>3. Course Dictionary</h2>
        <ul style={{marginBottom: '1rem'}}>
          {courses.map(c => (
            <li key={c.id}>
              <strong>{c.code}</strong> - {c.name} <button type="button" onClick={() => deleteCourse(c.id)} style={{color:'red', marginLeft: '1rem', background:'none', border:'none', cursor:'pointer'}}>✖</button>
            </li>
          ))}
        </ul>

        <form onSubmit={submitCourse} style={formStyle}>
          <label>Add New Course</label>
          <input type="text" value={courseCode} onChange={e => setCourseCode(e.target.value)} placeholder="Code (e.g. BCS)" required style={inputStyle} />
          <input type="text" value={courseName} onChange={e => setCourseName(e.target.value)} placeholder="Name" required style={inputStyle} />
          <button type="submit" style={btnStyle}>Submit POST /courses</button>
        </form>
      </div>

      <hr style={{ margin: '2rem 0', borderColor: '#ccc' }} />

      <div>
        <h2>4. Users Database</h2>
        <form onSubmit={submitCreateUser} style={formStyle}>
          <label>Create System User</label>
          <input type="text" value={userName} onChange={e => setUserName(e.target.value)} placeholder="Name" required style={inputStyle} />
          <input type="email" value={userEmail} onChange={e => setUserEmail(e.target.value)} placeholder="Email" required style={inputStyle} />
          <input type="password" value={userPassword} onChange={e => setUserPassword(e.target.value)} placeholder="Password" required style={inputStyle} />
          
          <select value={userRole} onChange={e => setUserRole(e.target.value)} required style={inputStyle}>
            <option value="SUPERADMIN">SUPERADMIN</option>
            <option value="ADMIN">ADMIN</option>
            <option value="MPP_ADVISOR">MPP_ADVISOR</option>
            <option value="STUDENT">STUDENT</option>
            <option value="CANDIDATE">CANDIDATE</option>
          </select>

          <input type="text" value={userIcNumber} onChange={e => setUserIcNumber(e.target.value)} placeholder="IC Number (Optional)" style={inputStyle} />

          {(userRole === 'STUDENT' || userRole === 'CANDIDATE') && (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <select value={userStudentIdPrefix} onChange={e => setUserStudentIdPrefix(e.target.value)} style={{...inputStyle, flex: 1}}>
                <option value="">-- Course --</option>
                {courses.map(c => <option key={c.id} value={c.code}>{c.code}</option>)}
              </select>
              <span style={{fontWeight: 'bold', minWidth: '40px'}}>{userStudentIdPrefix}</span>
              <input type="text" value={userStudentIdBase} onChange={e => setUserStudentIdBase(e.target.value)} placeholder="e.g. 2311-014" style={{...inputStyle, flex: 2}} />
            </div>
          )}
          <button type="submit" style={btnStyle}>Submit POST /users</button>
        </form>

        <select value={modifyUserId} onChange={handleSelectUserToModify} style={{...inputStyle, width: '400px', marginBottom: '1rem'}}>
          <option value="">-- Modify Existing User --</option>
          {users.map(u => (
            <option key={u.id} value={u.id}>{u.name} ({u.email}) - {u.role}</option>
          ))}
        </select>

        {modifyUserId && (
          <form onSubmit={submitModifyUser} style={formStyle}>
            <input type="text" value={modName} onChange={e => setModName(e.target.value)} placeholder="Name" required style={inputStyle} />
            <input type="email" value={modEmail} onChange={e => setModEmail(e.target.value)} placeholder="Email" required style={inputStyle} />
            <input type="password" value={modPassword} onChange={e => setModPassword(e.target.value)} placeholder="Leave blank to preserve password" style={inputStyle} />
            
            <select value={modRole} onChange={e => setModRole(e.target.value)} required style={inputStyle}>
              <option value="SUPERADMIN">SUPERADMIN</option>
              <option value="ADMIN">ADMIN</option>
              <option value="MPP_ADVISOR">MPP_ADVISOR</option>
              <option value="STUDENT">STUDENT</option>
              <option value="CANDIDATE">CANDIDATE</option>
            </select>

            <input type="text" value={modIcNumber} onChange={e => setModIcNumber(e.target.value)} placeholder="IC Number" style={inputStyle} />

            {(modRole === 'STUDENT' || modRole === 'CANDIDATE') && (
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <select value={modStudentIdPrefix} onChange={e => setModStudentIdPrefix(e.target.value)} style={{...inputStyle, flex: 1}}>
                  <option value="">-- Course --</option>
                  {courses.map(c => <option key={c.id} value={c.code}>{c.code}</option>)}
                </select>
                <span style={{fontWeight: 'bold', minWidth: '40px'}}>{modStudentIdPrefix}</span>
                <input type="text" value={modStudentIdBase} onChange={e => setModStudentIdBase(e.target.value)} placeholder="e.g. 2311-014" style={{...inputStyle, flex: 2}} />
              </div>
            )}

            <div style={{display: 'flex', gap: '1rem'}}>
              <button type="submit" style={{...btnStyle, flex: 1}}>Submit PATCH /users/:id</button>
              <button type="button" onClick={deleteUser} style={{...delBtnStyle, flex: 1}}>Delete User</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
