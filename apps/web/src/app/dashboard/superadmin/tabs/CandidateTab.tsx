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

export default function CandidateTab({
  candidates,
  fetchActiveData,
  inputStyle,
  btnStyle,
  delBtnStyle,
  formStyle
}: TabProps) {
  // Material Form State (upload new)
  const [matCandidateId, setMatCandidateId] = useState('');
  const [matType, setMatType] = useState('manifesto');
  const [matTitle, setMatTitle] = useState('');
  const [matDesc, setMatDesc] = useState('');
  const [matLink, setMatLink] = useState('');
  const [manifestoItems, setManifestoItems] = useState([{ title: '', description: '' }]);

  // Inline Edit State
  const [editingMaterial, setEditingMaterial] = useState<{ id: string, type: string, content: string } | null>(null);
  const [editingMaterialTitle, setEditingMaterialTitle] = useState('');
  const [editingMaterialDesc, setEditingMaterialDesc] = useState('');

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

  const handleEditMaterial = (item: any, type: string) => {
    const content = type === 'manifesto' ? item.description : 
                    type === 'video' ? item.videoLink :
                    type === 'slide' ? item.slideLink : item.posterLink;
    setEditingMaterial({ id: item.id, type, content });
    setEditingMaterialTitle(item.title || item.description || '');
    setEditingMaterialDesc(type === 'video' ? item.videoDescription : '');
  };

  const handleSaveMaterial = async (candidateId: string, type: string, item: any) => {
    const payload = type === 'manifesto' 
      ? { title: editingMaterialTitle, description: editingMaterialDesc }
      : type === 'video'
      ? { title: editingMaterialTitle, description: editingMaterialDesc, link: editingMaterial?.content }
      : { title: editingMaterialTitle, link: editingMaterial?.content };

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/candidates/${candidateId}/materials/${type}/${item.id}`,
        { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(payload) }
      );
      if (res.ok) { 
        alert('Material Updated!'); 
        setEditingMaterial(null); 
        setEditingMaterialTitle(''); 
        setEditingMaterialDesc('');
        fetchActiveData(); 
      } else {
        alert(`Failed: ${res.status} - ${await res.text()}`);
      }
    } catch (err: any) { alert(`Error: ${err.message}`); }
  };

  const handleCancelEdit = () => { 
    setEditingMaterial(null); 
    setEditingMaterialTitle(''); 
    setEditingMaterialDesc(''); 
  };

  return (
    <div>
      <h1>Candidate Form Actions</h1>
      <div style={{ marginTop: '2rem' }}>
        <h3 style={{ marginTop: '2rem' }}>Upload Campaign Material</h3>
        <form onSubmit={submitAddMaterial} style={formStyle}>
          <select value={matCandidateId} onChange={e => setMatCandidateId(e.target.value)} required style={inputStyle}>
            <option value="">-- Select Candidate --</option>
            {candidates.map(c => (
              <option key={c.id} value={c.id}>{c.user?.name} ({c.election?.title})</option>
            ))}
          </select>

          <select value={matType} onChange={e => setMatType(e.target.value)} required style={inputStyle}>
            <option value="manifesto">Manifesto</option>
            <option value="video">Video</option>
            <option value="slide">Slide</option>
            <option value="poster">Poster</option>
          </select>

          {matType === 'manifesto' ? (
            <>
              {manifestoItems.map((m, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', marginBottom: '1rem', border: '1px solid #ccc', padding: '1rem' }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <input type="text" value={m.title} onChange={e => { const n = [...manifestoItems]; n[i].title = e.target.value; setManifestoItems(n); }} placeholder="Manifesto Title" required style={inputStyle} />
                    <textarea rows={3} value={m.description} onChange={e => { const n = [...manifestoItems]; n[i].description = e.target.value; setManifestoItems(n); }} placeholder="Description" required style={inputStyle} />
                  </div>
                  {manifestoItems.length > 1 && (
                    <button type="button" onClick={() => { const n = [...manifestoItems]; n.splice(i, 1); setManifestoItems(n); }} style={{ padding: '0.5rem', background: '#dc2626', color: '#fff', border: 'none', cursor: 'pointer' }}>[-] Remove</button>
                  )}
                </div>
              ))}
              <button type="button" onClick={() => setManifestoItems([...manifestoItems, { title: '', description: '' }])} style={{ padding: '0.5rem', background: '#16a34a', color: '#fff', border: 'none', cursor: 'pointer', alignSelf: 'flex-start' }}>[+] Add Row</button>
            </>
          ) : (
            <>
              {(matType === 'video' || matType === 'slide') && (
                <input type="text" value={matTitle} onChange={e => setMatTitle(e.target.value)} placeholder="Title" required style={inputStyle} />
              )}
              {matType === 'video' && (
                <textarea rows={3} value={matDesc} onChange={e => setMatDesc(e.target.value)} placeholder="Description" required style={inputStyle} />
              )}
              <input type="url" value={matLink} onChange={e => setMatLink(e.target.value)} placeholder="Link (URL)" required style={inputStyle} />
            </>
          )}

          <button type="submit" style={btnStyle}>Submit POST /candidates/:id/materials</button>
        </form>
      </div>

      {/* My Campaign Profile Section */}
      {matCandidateId && (
        <div style={{ marginTop: '2rem', border: '2px solid #16a34a', padding: '1.5rem', borderRadius: '8px' }}>
          <h3 style={{ color: '#16a34a', marginTop: 0 }}>My Campaign Profile - Edit Materials</h3>
          {(() => {
            const myC = candidates.find((c: any) => c.id === matCandidateId);
            if (!myC) return null;
            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Manifestos */}
                <div>
                  <strong>Manifestos</strong>
                  {myC.manifestos && myC.manifestos.length > 0 ? (
                    myC.manifestos.map((m: any) => (
                      <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', border: '1px solid #eee', marginTop: '0.5rem' }}>
                        {editingMaterial?.id === m.id ? (
                          <div style={{ flex: 1, display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <input 
                              type="text" 
                              value={editingMaterialTitle} 
                              onChange={e => setEditingMaterialTitle(e.target.value)} 
                              placeholder="Title"
                              style={{ ...inputStyle, flex: 1 }} 
                            />
                            <input 
                              type="text" 
                              value={editingMaterialDesc} 
                              onChange={e => setEditingMaterialDesc(e.target.value)} 
                              placeholder="Description"
                              style={{ ...inputStyle, flex: 2 }} 
                            />
                            <button onClick={() => handleSaveMaterial(myC.id, 'manifesto', m)} style={{ padding: '0.25rem 0.5rem', background: '#16a34a', color: '#fff', border: 'none', cursor: 'pointer' }}>Save</button>
                            <button onClick={handleCancelEdit} style={{ padding: '0.25rem 0.5rem', background: '#666', color: '#fff', border: 'none', cursor: 'pointer' }}>Cancel</button>
                          </div>
                        ) : (
                          <>
                            <span><strong>{m.title}</strong>: {m.description}</span>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button type="button" onClick={() => handleEditMaterial(m, 'manifesto')} style={{ padding: '0.25rem 0.5rem', background: '#2563eb', color: '#fff', border: 'none', cursor: 'pointer' }}>Edit</button>
                              <button type="button" onClick={() => deleteMaterialItem(myC.id, 'manifesto', m.id)} style={{ padding: '0.25rem 0.5rem', background: '#dc2626', color: '#fff', border: 'none', cursor: 'pointer' }}>Delete</button>
                            </div>
                          </>
                        )}
                      </div>
                    ))
                  ) : <p style={{ fontSize: '0.9em', color: '#666' }}>No manifestos yet.</p>}
                </div>

                {/* Videos */}
                <div>
                  <strong>Videos</strong>
                  {myC.videos && myC.videos.length > 0 ? (
                    myC.videos.map((v: any) => (
                      <div key={v.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', border: '1px solid #eee', marginTop: '0.5rem' }}>
                        {editingMaterial?.id === v.id ? (
                          <div style={{ flex: 1, display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <input 
                              type="text" 
                              value={editingMaterialTitle} 
                              onChange={e => setEditingMaterialTitle(e.target.value)} 
                              placeholder="Title"
                              style={{ ...inputStyle, flex: 1 }} 
                            />
                            <input 
                              type="text" 
                              value={editingMaterialDesc} 
                              onChange={e => setEditingMaterialDesc(e.target.value)} 
                              placeholder="Description"
                              style={{ ...inputStyle, flex: 2 }} 
                            />
                            <input 
                              type="url" 
                              value={editingMaterial?.content || ''} 
                              onChange={e => { if (editingMaterial) setEditingMaterial({ ...editingMaterial, content: e.target.value }); }} 
                              placeholder="Video URL"
                              style={{ ...inputStyle, flex: 2 }} 
                            />
                            <button onClick={() => handleSaveMaterial(myC.id, 'video', v)} style={{ padding: '0.25rem 0.5rem', background: '#16a34a', color: '#fff', border: 'none', cursor: 'pointer' }}>Save</button>
                            <button onClick={handleCancelEdit} style={{ padding: '0.25rem 0.5rem', background: '#666', color: '#fff', border: 'none', cursor: 'pointer' }}>Cancel</button>
                          </div>
                        ) : (
                          <>
                            <span><a href={v.videoLink} target="_blank" rel="noreferrer">{v.videoTitle}</a> - {v.videoDescription}</span>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button type="button" onClick={() => handleEditMaterial(v, 'video')} style={{ padding: '0.25rem 0.5rem', background: '#2563eb', color: '#fff', border: 'none', cursor: 'pointer' }}>Edit</button>
                              <button type="button" onClick={() => deleteMaterialItem(myC.id, 'video', v.id)} style={{ padding: '0.25rem 0.5rem', background: '#dc2626', color: '#fff', border: 'none', cursor: 'pointer' }}>Delete</button>
                            </div>
                          </>
                        )}
                      </div>
                    ))
                  ) : <p style={{ fontSize: '0.9em', color: '#666' }}>No videos yet.</p>}
                </div>

                {/* Slides */}
                <div>
                  <strong>Slides</strong>
                  {myC.slides && myC.slides.length > 0 ? (
                    myC.slides.map((s: any) => (
                      <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', border: '1px solid #eee', marginTop: '0.5rem' }}>
                        {editingMaterial?.id === s.id ? (
                          <div style={{ flex: 1, display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <input 
                              type="text" 
                              value={editingMaterialTitle} 
                              onChange={e => setEditingMaterialTitle(e.target.value)} 
                              placeholder="Title"
                              style={{ ...inputStyle, flex: 1 }} 
                            />
                            <input 
                              type="url" 
                              value={editingMaterial?.content || ''} 
                              onChange={e => { if (editingMaterial) setEditingMaterial({ ...editingMaterial, content: e.target.value }); }} 
                              placeholder="Slide URL"
                              style={{ ...inputStyle, flex: 2 }} 
                            />
                            <button onClick={() => handleSaveMaterial(myC.id, 'slide', s)} style={{ padding: '0.25rem 0.5rem', background: '#16a34a', color: '#fff', border: 'none', cursor: 'pointer' }}>Save</button>
                            <button onClick={handleCancelEdit} style={{ padding: '0.25rem 0.5rem', background: '#666', color: '#fff', border: 'none', cursor: 'pointer' }}>Cancel</button>
                          </div>
                        ) : (
                          <>
                            <span><a href={s.slideLink} target="_blank" rel="noreferrer">{s.slideTitle}</a></span>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button type="button" onClick={() => handleEditMaterial(s, 'slide')} style={{ padding: '0.25rem 0.5rem', background: '#2563eb', color: '#fff', border: 'none', cursor: 'pointer' }}>Edit</button>
                              <button type="button" onClick={() => deleteMaterialItem(myC.id, 'slide', s.id)} style={{ padding: '0.25rem 0.5rem', background: '#dc2626', color: '#fff', border: 'none', cursor: 'pointer' }}>Delete</button>
                            </div>
                          </>
                        )}
                      </div>
                    ))
                  ) : <p style={{ fontSize: '0.9em', color: '#666' }}>No slides yet.</p>}
                </div>

                {/* Posters */}
                <div>
                  <strong>Posters</strong>
                  {myC.posters && myC.posters.length > 0 ? (
                    myC.posters.map((p: any) => (
                      <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', border: '1px solid #eee', marginTop: '0.5rem' }}>
                        {editingMaterial?.id === p.id ? (
                          <div style={{ flex: 1, display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <input 
                              type="url" 
                              value={editingMaterial?.content || ''} 
                              onChange={e => { if (editingMaterial) setEditingMaterial({ ...editingMaterial, content: e.target.value }); }} 
                              placeholder="Poster URL"
                              style={{ ...inputStyle, flex: 1 }} 
                            />
                            <button onClick={() => handleSaveMaterial(myC.id, 'poster', p)} style={{ padding: '0.25rem 0.5rem', background: '#16a34a', color: '#fff', border: 'none', cursor: 'pointer' }}>Save</button>
                            <button onClick={handleCancelEdit} style={{ padding: '0.25rem 0.5rem', background: '#666', color: '#fff', border: 'none', cursor: 'pointer' }}>Cancel</button>
                          </div>
                        ) : (
                          <>
                            <span><a href={p.posterLink} target="_blank" rel="noreferrer">View Poster</a></span>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button type="button" onClick={() => handleEditMaterial(p, 'poster')} style={{ padding: '0.25rem 0.5rem', background: '#2563eb', color: '#fff', border: 'none', cursor: 'pointer' }}>Edit</button>
                              <button type="button" onClick={() => deleteMaterialItem(myC.id, 'poster', p.id)} style={{ padding: '0.25rem 0.5rem', background: '#dc2626', color: '#fff', border: 'none', cursor: 'pointer' }}>Delete</button>
                            </div>
                          </>
                        )}
                      </div>
                    ))
                  ) : <p style={{ fontSize: '0.9em', color: '#666' }}>No posters yet.</p>}
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
