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

export default function AdvisorTab({
  users,
  elections,
  candidates,
  fetchActiveData,
  inputStyle,
  btnStyle,
  delBtnStyle,
  formStyle
}: TabProps) {
  const [advisorViewCandidateId, setAdvisorViewCandidateId] = useState('ALL');

  // Register Candidate Form State
  const [regElectionId, setRegElectionId] = useState('');
  const [regUserId, setRegUserId] = useState('');
  const [regInfo, setRegInfo] = useState('');
  const [regProfilePic, setRegProfilePic] = useState('');
  const [regBanner, setRegBanner] = useState('');

  // Material Form State
  const [matCandidateId, setMatCandidateId] = useState('');
  const [matType, setMatType] = useState('manifesto');
  const [matTitle, setMatTitle] = useState('');
  const [matDesc, setMatDesc] = useState('');
  const [matLink, setMatLink] = useState('');
  const [manifestoItems, setManifestoItems] = useState([{ title: '', description: '' }]);

  // Qualification Form State
  const [qualCandidateId, setQualCandidateId] = useState('');
  const [qualPositions, setQualPositions] = useState<string[]>(['']);
  const [qualCgpa, setQualCgpa] = useState('');
  const [qualJustification, setQualJustification] = useState('');

  // Modify Candidate Form State
  const [modCandidateId, setModCandidateId] = useState('');
  const [modCandidateInfo, setModCandidateInfo] = useState('');
  const [modCandidateProfilePic, setModCandidateProfilePic] = useState('');
  const [modCandidateBanner, setModCandidateBanner] = useState('');
  const [modCandidateStatus, setModCandidateStatus] = useState('PENDING');

  const displayedCandidates = advisorViewCandidateId === 'ALL' 
    ? candidates 
    : candidates.filter((c: any) => c.id === advisorViewCandidateId);

  const submitRegisterCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/candidates`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ userId: regUserId, electionId: regElectionId, information: regInfo || undefined, profilePicture: regProfilePic || undefined, spotlightBanner: regBanner || undefined })
      });
      if (res.ok) { alert(`Candidate Registered!`); fetchActiveData(); }
      else alert(`Failed: ${res.status} - ${await res.text()}`);
    } catch (err: any) { alert(`Error: ${err.message}`); }
  };

  const submitAddMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matCandidateId) return;
    
    const payload: any = { type: matType };
    
    if (matType === 'manifesto') {
      payload.manifestos = manifestoItems;
    } else {
      payload.title = matTitle;
      payload.description = matDesc;
      payload.link = matLink;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/candidates/${matCandidateId}/materials`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify(payload)
      });
      if (res.ok) { 
        alert(`Material Added!`); 
        fetchActiveData(); 
        setMatTitle(''); setMatDesc(''); setMatLink(''); 
        setManifestoItems([{ title: '', description: '' }]);
      }
      else alert(`Failed: ${res.status} - ${await res.text()}`);
    } catch (err: any) { alert(`Error: ${err.message}`); }
  };

  const submitQualification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qualCandidateId) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/candidates/${qualCandidateId}/qualification`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ positions: qualPositions, cgpa: qualCgpa, justification: qualJustification })
      });
      if (res.ok) { 
        alert(`Qualifications Updated!`); 
        fetchActiveData(); 
        setQualPositions(['']);
        setQualCgpa('');
        setQualJustification('');
      }
      else alert(`Failed: ${res.status} - ${await res.text()}`);
    } catch (err: any) { alert(`Error: ${err.message}`); }
  };

  const handleSelectCandidateToModify = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setModCandidateId(id);
    if (!id) return;
    const c = candidates.find((x: any) => x.id === id);
    if (c) {
      setModCandidateInfo(c.information || '');
      setModCandidateProfilePic(c.profilePicture || '');
      setModCandidateBanner(c.spotlightBanner || '');
      setModCandidateStatus(c.status || 'PENDING');
    }
  };

  const submitModifyCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modCandidateId) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/candidates/${modCandidateId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          information: modCandidateInfo || undefined,
          profilePicture: modCandidateProfilePic || undefined,
          spotlightBanner: modCandidateBanner || undefined,
          status: modCandidateStatus
        })
      });
      if (res.ok) { alert('Candidate Updated!'); fetchActiveData(); }
      else alert(`Failed: ${res.status} - ${await res.text()}`);
    } catch (err: any) { alert(`Error: ${err.message}`); }
  };

  const deleteCandidateById = async (id: string) => {
    if (!confirm('Delete candidate completely? This will cascade and delete all materials!')) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/candidates/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) { alert('Candidate Deleted'); fetchActiveData(); }
      else alert(`Failed: ${res.status} - ${await res.text()}`);
    } catch (err: any) { alert(`Error: ${err.message}`); }
  };

  const deleteQualificationById = async (id: string) => {
    if (!confirm('Delete qualification for this candidate?')) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/candidates/${id}/qualification`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) { alert('Qualification Deleted'); fetchActiveData(); }
      else alert(`Failed: ${res.status} - ${await res.text()}`);
    } catch (err: any) { alert(`Error: ${err.message}`); }
  };

  const deleteMaterialItem = async (candidateId: string, type: string, materialId: string) => {
    if (!confirm(`Delete this ${type}?`)) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/candidates/${candidateId}/materials/${type}/${materialId}`,
        { method: 'DELETE', credentials: 'include' }
      );
      if (res.ok) { alert('Material Deleted'); fetchActiveData(); }
      else alert(`Failed: ${res.status} - ${await res.text()}`);
    } catch (err: any) { alert(`Error: ${err.message}`); }
  };

  const bulkDeleteMaterials = async (candidateId: string, type: string) => {
    if (!confirm(`Delete ALL ${type} materials for this candidate?`)) return;
    const candidate = candidates.find((c: any) => c.id === candidateId);
    const items = candidate?.[type] || [];
    if (items.length === 0) { alert(`No ${type} materials to delete.`); return; }
    for (const item of items) {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/candidates/${candidateId}/materials/${type}/${item.id}`,
        { method: 'DELETE', credentials: 'include' }
      );
    }
    alert(`Deleted all ${type} materials`);
    fetchActiveData();
  };

  return (
    <div>
      <h1>Candidate Management</h1>
      <div style={{ marginTop: '2rem' }}>
        <h2>5. Manage Candidates</h2>
        <ul style={{ marginBottom: '1rem' }}>
          {candidates.map(c => (
            <li key={c.id}>
              <strong>{c.user?.name}</strong> - {c.election?.title} ({c.status})
            </li>
          ))}
        </ul>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h3>Candidate Oversight & Review</h3>
        <select 
          value={advisorViewCandidateId} 
          onChange={e => setAdvisorViewCandidateId(e.target.value)} 
          style={{ ...inputStyle, marginBottom: '1rem' }}
        >
          <option value="ALL">-- View All Candidates --</option>
          {candidates.map(c => (
            <option key={c.id} value={c.id}>{c.user?.name} ({c.election?.title})</option>
          ))}
        </select>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {displayedCandidates.map((c: any) => (
            <div key={c.id} style={{ border: '1px solid #ccc', padding: '1.5rem', borderRadius: '8px' }}>
              <h4 style={{ margin: '0 0 1rem 0', paddingBottom: '0.5rem', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{c.user?.name} <span style={{ fontWeight: 'normal', color: '#666' }}>— {c.election?.title} ({c.status})</span></span>
                <button type="button" onClick={() => deleteCandidateById(c.id)} style={{ padding: '0.25rem 0.5rem', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8em' }}>[Delete Candidate]</button>
              </h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <strong>Profile Assets</strong>
                  <p style={{ margin: '0.25rem 0', fontSize: '0.9em' }}>Picture: {c.profilePicture ? <a href={c.profilePicture} target="_blank" rel="noreferrer">View Image</a> : 'Not provided'}</p>
                  <p style={{ margin: '0.25rem 0', fontSize: '0.9em' }}>Banner: {c.spotlightBanner ? <a href={c.spotlightBanner} target="_blank" rel="noreferrer">View Banner</a> : 'Not provided'}</p>
                  <p style={{ margin: '0.25rem 0', fontSize: '0.9em' }}>Info: {c.information || 'Not provided'}</p>
                </div>
                <div>
                  <strong style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    Qualifications
                    {c.qualification && (
                      <button type="button" onClick={() => deleteQualificationById(c.id)} style={{ padding: '0.125rem 0.25rem', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '2px', cursor: 'pointer', fontSize: '0.7em' }}>Delete</button>
                    )}
                  </strong>
                  {c.qualification ? (
                    <>
                      <p style={{ margin: '0.25rem 0', fontSize: '0.9em' }}><strong>Positions:</strong> {c.qualification.position.join(', ')}</p>
                      <p style={{ margin: '0.25rem 0', fontSize: '0.9em' }}><strong>CGPA:</strong> {c.qualification.cgpa}</p>
                      <p style={{ margin: '0.25rem 0', fontSize: '0.9em' }}><strong>Justification:</strong> {c.qualification.justification}</p>
                    </>
                  ) : (
                    <p style={{ color: '#dc2626', margin: '0.25rem 0', fontSize: '0.9em' }}>No qualifications added.</p>
                  )}
                </div>
              </div>

              <div>
                <strong style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  Manifestos
                  {c.manifestos && c.manifestos.length > 0 && (
                    <button type="button" onClick={() => bulkDeleteMaterials(c.id, 'manifestos')} style={{ padding: '0.125rem 0.25rem', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '2px', cursor: 'pointer', fontSize: '0.7em' }}>Delete All</button>
                  )}
                </strong>
                {c.manifestos && c.manifestos.length > 0 ? (
                  <ul style={{ paddingLeft: '1rem', marginTop: 0, fontSize: '0.9em' }}>
                    {c.manifestos.map((m: any) => (
                      <li key={m.id} style={{ marginBottom: '0.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span><strong>{m.title}</strong>: {m.description}</span>
                        <button type="button" onClick={() => deleteMaterialItem(c.id, 'manifesto', m.id)} style={{ padding: '0.125rem 0.25rem', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '2px', cursor: 'pointer', fontSize: '0.7em', marginLeft: '0.5rem' }}>X</button>
                      </li>
                    ))}
                  </ul>
                ) : <p style={{ margin: '0 0 1rem 0', fontSize: '0.9em' }}>Manifesto doesn't exist.</p>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #eee' }}>
                <div>
                  <strong style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    Videos
                    {c.videos && c.videos.length > 0 && (
                      <button type="button" onClick={() => bulkDeleteMaterials(c.id, 'videos')} style={{ padding: '0.125rem 0.25rem', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '2px', cursor: 'pointer', fontSize: '0.7em' }}>Delete All</button>
                    )}
                  </strong>
                  {c.videos && c.videos.length > 0 ? (
                    <ul style={{ paddingLeft: '1rem', margin: '0.25rem 0', fontSize: '0.9em' }}>
                      {c.videos.map((v: any) => (
                        <li key={v.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                          <a href={v.videoLink} target="_blank" rel="noreferrer">{v.videoTitle}</a>
                          <button type="button" onClick={() => deleteMaterialItem(c.id, 'video', v.id)} style={{ padding: '0.125rem 0.25rem', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '2px', cursor: 'pointer', fontSize: '0.7em', marginLeft: '0.5rem' }}>X</button>
                        </li>
                      ))}
                    </ul>
                  ) : <p style={{ fontSize: '0.9em', color: '#666', margin: '0.25rem 0' }}>Doesn't exist.</p>}
                </div>
                <div>
                  <strong style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    Posters
                    {c.posters && c.posters.length > 0 && (
                      <button type="button" onClick={() => bulkDeleteMaterials(c.id, 'posters')} style={{ padding: '0.125rem 0.25rem', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '2px', cursor: 'pointer', fontSize: '0.7em' }}>Delete All</button>
                    )}
                  </strong>
                  {c.posters && c.posters.length > 0 ? (
                    <ul style={{ paddingLeft: '1rem', margin: '0.25rem 0', fontSize: '0.9em' }}>
                      {c.posters.map((p: any) => (
                        <li key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                          <a href={p.posterLink} target="_blank" rel="noreferrer">View Poster</a>
                          <button type="button" onClick={() => deleteMaterialItem(c.id, 'poster', p.id)} style={{ padding: '0.125rem 0.25rem', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '2px', cursor: 'pointer', fontSize: '0.7em', marginLeft: '0.5rem' }}>X</button>
                        </li>
                      ))}
                    </ul>
                  ) : <p style={{ fontSize: '0.9em', color: '#666', margin: '0.25rem 0' }}>Doesn't exist.</p>}
                </div>
                <div>
                  <strong style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    Slides
                    {c.slides && c.slides.length > 0 && (
                      <button type="button" onClick={() => bulkDeleteMaterials(c.id, 'slides')} style={{ padding: '0.125rem 0.25rem', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '2px', cursor: 'pointer', fontSize: '0.7em' }}>Delete All</button>
                    )}
                  </strong>
                  {c.slides && c.slides.length > 0 ? (
                    <ul style={{ paddingLeft: '1rem', margin: '0.25rem 0', fontSize: '0.9em' }}>
                      {c.slides.map((s: any) => (
                        <li key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                          <a href={s.slideLink} target="_blank" rel="noreferrer">{s.slideTitle}</a>
                          <button type="button" onClick={() => deleteMaterialItem(c.id, 'slide', s.id)} style={{ padding: '0.125rem 0.25rem', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '2px', cursor: 'pointer', fontSize: '0.7em', marginLeft: '0.5rem' }}>X</button>
                        </li>
                      ))}
                    </ul>
                  ) : <p style={{ fontSize: '0.9em', color: '#666', margin: '0.25rem 0' }}>Doesn't exist.</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h3>Register Candidate</h3>
        <form onSubmit={submitRegisterCandidate} style={formStyle}>
          <select value={regElectionId} onChange={e => setRegElectionId(e.target.value)} required style={inputStyle}>
            <option value="">-- Select Election --</option>
            {elections.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
          </select>
          <select value={regUserId} onChange={e => setRegUserId(e.target.value)} required style={inputStyle}>
            <option value="">-- Select CANDIDATE User --</option>
            {users.filter(u => u.role === 'CANDIDATE').map(u => (
              <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
            ))}
          </select>
          <textarea rows={3} value={regInfo} onChange={e => setRegInfo(e.target.value)} placeholder="Information (Optional)" style={inputStyle} />
          <input type="url" value={regProfilePic} onChange={e => setRegProfilePic(e.target.value)} placeholder="Profile Picture URL (Optional)" style={inputStyle} />
          <input type="url" value={regBanner} onChange={e => setRegBanner(e.target.value)} placeholder="Spotlight Banner URL (Optional)" style={inputStyle} />
          <button type="submit" style={btnStyle}>Submit POST /candidates</button>
        </form>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h3 style={{ marginTop: '2rem' }}>Update Candidate Qualification</h3>
        <form onSubmit={submitQualification} style={formStyle}>
          <select value={qualCandidateId} onChange={e => setQualCandidateId(e.target.value)} required style={inputStyle}>
            <option value="">-- Select Candidate --</option>
            {candidates.map(c => (
              <option key={c.id} value={c.id}>{c.user?.name} ({c.election?.title})</option>
            ))}
          </select>
          {qualPositions.map((q, i) => (
            <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', marginBottom: '1rem', border: '1px solid #ccc', padding: '1rem' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <input type="text" value={q} onChange={e => { const n = [...qualPositions]; n[i] = e.target.value; setQualPositions(n); }} placeholder="Position (e.g. Presidential Chair)" required style={inputStyle} />
              </div>
              {qualPositions.length > 1 && (
                <button type="button" onClick={() => { const n = [...qualPositions]; n.splice(i, 1); setQualPositions(n); }} style={{ padding: '0.5rem', background: '#dc2626', color: '#fff', border: 'none', cursor: 'pointer' }}>[-] Remove</button>
              )}
            </div>
          ))}
          <button type="button" onClick={() => setQualPositions([...qualPositions, ''])} style={{ padding: '0.5rem', background: '#16a34a', color: '#fff', border: 'none', cursor: 'pointer', alignSelf: 'flex-start' }}>[+] Add Position</button>
          <input type="text" value={qualCgpa} onChange={e => setQualCgpa(e.target.value)} placeholder="CGPA (e.g. 3.85)" required style={{...inputStyle, marginTop: '1rem'}} />
          <textarea rows={4} value={qualJustification} onChange={e => setQualJustification(e.target.value)} placeholder="Justification..." required style={inputStyle} />
          <button type="submit" style={btnStyle}>Submit POST /candidates/:id/qualification</button>
        </form>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h3 style={{ marginTop: '2rem' }}>Modify Candidate</h3>
        <select value={modCandidateId} onChange={handleSelectCandidateToModify} style={{ ...inputStyle, width: '400px', marginBottom: '1rem' }}>
          <option value="">-- Select Candidate to Modify --</option>
          {candidates.map(c => (
            <option key={c.id} value={c.id}>{c.user?.name} ({c.election?.title})</option>
          ))}
        </select>

        {modCandidateId && (
          <form onSubmit={submitModifyCandidate} style={formStyle}>
            <input type="text" value={modCandidateInfo} onChange={e => setModCandidateInfo(e.target.value)} placeholder="Information" style={inputStyle} />
            <input type="url" value={modCandidateProfilePic} onChange={e => setModCandidateProfilePic(e.target.value)} placeholder="Profile Picture URL" style={inputStyle} />
            <input type="url" value={modCandidateBanner} onChange={e => setModCandidateBanner(e.target.value)} placeholder="Spotlight Banner URL" style={inputStyle} />
            <select value={modCandidateStatus} onChange={e => setModCandidateStatus(e.target.value)} required style={inputStyle}>
              <option value="PENDING">PENDING</option>
              <option value="APPROVED">APPROVED</option>
              <option value="REJECTED">REJECTED</option>
            </select>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="submit" style={btnStyle}>Submit PATCH /candidates/:id</button>
              <button type="button" onClick={() => deleteCandidateById(modCandidateId)} style={{ ...delBtnStyle, flex: 1 }}>Delete Candidate</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
