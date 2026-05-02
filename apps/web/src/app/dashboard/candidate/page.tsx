"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Activity, 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X,
  Video,
  FileText,
  Image,
  Presentation
} from 'lucide-react';
import UniversalHeader from '@/components/ui/universal-header';
import Footer from '@/components/ui/footer';

interface Qualification {
  id: string;
  positions: string[];
  cgpa: string;
  justification: string;
}

interface ManifestoItem {
  id: string;
  title: string;
  description: string;
}

interface VideoItem {
  id: string;
  title: string;
  videoDescription: string;
  videoLink: string;
}

interface SlideItem {
  id: string;
  title: string;
  slideLink: string;
}

interface PosterItem {
  id: string;
  title: string;
  posterLink: string;
}

interface CandidateProfile {
  id: string;
  status: string;
  userId: string;
  electionId: string;
  qualification: Qualification | null;
  manifestos: ManifestoItem[];
  videos: VideoItem[];
  slides: SlideItem[];
  posters: PosterItem[];
  user: { name: string; studentId: string };
  election: { title: string };
}

export default function CandidateDashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [candidateProfile, setCandidateProfile] = useState<CandidateProfile | null>(null);

  const bgImageUrl = "https://beranang.kpm.edu.my/kpmb/images/speasyimagegallery/albums/7/images/dewan-3.jpg";

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, { 
          credentials: 'include' 
        });
        if (authRes.status === 401 || authRes.status === 403) {
          router.push('/login');
          return;
        }
        const userData = await authRes.json();
        setCurrentUser(userData);
      } catch {
        router.push('/login');
        return;
      }
      setIsLoading(false);
    };
    checkAuth();
  }, [router]);

  useEffect(() => {
    if (!currentUser?.id) return;
    
    fetchCandidateProfile();
  }, [currentUser]);

  const fetchCandidateProfile = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/candidates`, { 
        credentials: 'include' 
      });
      if (res.ok) {
        const candidates = await res.json();
        const myCandidate = candidates.find((c: any) => c.userId === currentUser.id);
        if (myCandidate) {
          setCandidateProfile(myCandidate);
        }
      }
    } catch (err) {
      console.error('Failed to fetch candidate profile', err);
    }
  };

  const handleStopImpersonation = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/stop-impersonation`, {
        method: 'POST',
        credentials: 'include'
      });
      if (res.ok) {
        router.push('/dashboard/superadmin');
      } else {
        alert('Failed to return to superadmin.');
      }
    } catch (err: any) { alert(`Error: ${err.message}`); }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <p>Loading...</p>
      </div>
    );
  }

  const getStatusColor = (status: string | undefined) => {
    switch (status?.toUpperCase()) {
      case 'APPROVED': return 'bg-green-500';
      case 'REJECTED': return 'bg-red-600';
      case 'PENDING': return 'bg-yellow-500';
      default: return 'bg-yellow-500';
    }
  };

  const getCoursePrefix = (studentId: string | null | undefined) => {
    if (!studentId) return 'N/A';
    const match = studentId.match(/^[A-Za-z]+/);
    return match ? match[0] : 'N/A';
  };

  return (
    <div className="min-h-screen bg-black overflow-hidden relative font-sans text-white">
      {currentUser?.isImpersonating && (
        <button
          onClick={handleStopImpersonation}
          className="bg-red-600 hover:bg-red-700 text-white w-full py-2 text-xs font-bold uppercase tracking-[0.2em] z-50 transition-colors"
        >
          Stop Impersonating (Return to Superadmin)
        </button>
      )}

      <UniversalHeader role="candidate" userName={currentUser?.name} />

      <main className="flex-grow overflow-y-auto relative custom-scrollbar">
        <div 
          className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat transition-all duration-700"
          style={{ backgroundImage: `url(${bgImageUrl})`, filter: 'blur(10px) brightness(0.2)' }}
        />

        <div className="relative z-10 p-12 max-w-7xl mx-auto w-full flex-grow flex flex-col gap-12">
            {/* Hero Section */}
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] mb-4 flex items-center gap-2">
                  <Activity size={14} className="text-red-600 animate-pulse" /> Campaign Headquarters
                </p>
                <h1 className="text-6xl font-bold uppercase tracking-tighter leading-none text-white">
                  Welcome, <span className="italic">{currentUser?.name || 'Candidate'}</span>
                </h1>
              </div>
              <div className={`${getStatusColor(candidateProfile?.status)} text-black px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg`}>
                {candidateProfile?.status || 'PENDING'}
              </div>
            </div>

            {/* 3-Card Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-8 bg-white/95 backdrop-blur-xl border border-white/20 border-b-[6px] border-b-blue-600 shadow-2xl group hover:-translate-y-2 transition-all duration-500 rounded-sm">
                <div className="flex justify-between items-start mb-6">
                  <div className="text-slate-300"><Presentation size={24} /></div>
                </div>
                <div className="text-2xl font-bold mb-2 tracking-tighter text-slate-900">
                  {candidateProfile?.qualification?.positions?.join(', ') || 'No Position'}
                </div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Position(s)</p>
              </div>

              <div className="p-8 bg-white/95 backdrop-blur-xl border border-white/20 border-b-[6px] border-b-red-700 shadow-2xl group hover:-translate-y-2 transition-all duration-500 rounded-sm">
                <div className="flex justify-between items-start mb-6">
                  <div className="text-slate-300"><FileText size={24} /></div>
                </div>
                <div className="text-2xl font-bold mb-2 tracking-tighter text-slate-900">
                  {getCoursePrefix(candidateProfile?.user?.studentId)}
                </div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Course Prefix</p>
              </div>

              <div className="p-8 bg-white/95 backdrop-blur-xl border border-white/20 border-b-[6px] border-b-yellow-600 shadow-2xl group hover:-translate-y-2 transition-all duration-500 rounded-sm">
                <div className="flex justify-between items-start mb-6">
                  <div className="text-slate-300"><Activity size={24} /></div>
                </div>
                <div className="text-2xl font-bold mb-2 tracking-tighter text-slate-900">
                  {candidateProfile?.election?.title || 'No Election'}
                </div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Election</p>
              </div>
            </div>

            {/* Campaign Materials Section */}
            <section>
              <h2 className="text-5xl font-bold uppercase tracking-tighter italic leading-none text-white mb-12">
                Campaign Materials
              </h2>

              <MaterialList 
                candidateId={candidateProfile?.id}
                materials={candidateProfile?.manifestos || []}
                type="manifesto"
                icon={<FileText size={20} />}
                title="Manifestos"
                refreshData={fetchCandidateProfile}
              />

              <MaterialList 
                candidateId={candidateProfile?.id}
                materials={candidateProfile?.videos || []}
                type="video"
                icon={<Video size={20} />}
                title="Videos"
                refreshData={fetchCandidateProfile}
              />

              <MaterialList 
                candidateId={candidateProfile?.id}
                materials={candidateProfile?.slides || []}
                type="slide"
                icon={<Presentation size={20} />}
                title="Slides"
                refreshData={fetchCandidateProfile}
              />

              <MaterialList 
                candidateId={candidateProfile?.id}
                materials={candidateProfile?.posters || []}
                type="poster"
                icon={<Image size={20} />}
                title="Posters"
                refreshData={fetchCandidateProfile}
              />
            </section>
          </div>

          <div className="relative z-10 w-full mt-auto">
            <Footer />
          </div>
        </main>
      </div>
    );
}

interface MaterialItem {
  id: string;
  title?: string;
  description?: string;
  videoTitle?: string;
  videoDescription?: string;
  videoLink?: string;
  slideTitle?: string;
  slideLink?: string;
  posterLink?: string;
}

interface MaterialListProps {
  candidateId?: string;
  materials: MaterialItem[];
  type: 'manifesto' | 'video' | 'slide' | 'poster';
  icon: React.ReactNode;
  title: string;
  refreshData: () => void;
}

function MaterialList({ candidateId, materials, type, icon, title, refreshData }: MaterialListProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<{ id: string; type: string } | null>(null);
  
  // Add form state
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newLink, setNewLink] = useState('');
  const [manifestoItems, setManifestoItems] = useState([{ title: '', description: '' }]);

  // Edit form state
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editLink, setEditLink] = useState('');

  const resetAddForm = () => {
    setNewTitle('');
    setNewDesc('');
    setNewLink('');
    setManifestoItems([{ title: '', description: '' }]);
    setShowAddForm(false);
  };

  const handleAddMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateId) return;

    const payload: any = { type };
    
    if (type === 'manifesto') {
      payload.manifestos = manifestoItems.filter(m => m.title && m.description);
    } else if (type === 'video') {
      payload.title = newTitle;
      payload.description = newDesc;
      payload.link = newLink;
    } else if (type === 'slide') {
      payload.title = newTitle;
      payload.link = newLink;
    } else if (type === 'poster') {
      payload.title = newTitle;
      payload.link = newLink;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/candidates/${candidateId}/materials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        alert(`${title} Added!`);
        resetAddForm();
        refreshData();
      } else {
        alert(`Failed: ${res.status}`);
      }
    } catch (err: any) { alert(`Error: ${err.message}`); }
  };

  const handleDeleteMaterial = async (materialId: string) => {
    if (!candidateId || !confirm(`Delete this ${type}?`)) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/candidates/${candidateId}/materials/${type}/${materialId}`,
        { method: 'DELETE', credentials: 'include' }
      );
      if (res.ok) {
        alert('Material Deleted');
        refreshData();
      } else {
        alert(`Failed: ${res.status}`);
      }
    } catch (err: any) { alert(`Error: ${err.message}`); }
  };

  const handleEditClick = (item: MaterialItem) => {
    setEditingMaterial({ id: item.id, type });
    if (type === 'manifesto') {
      setEditTitle(item.title || '');
      setEditDesc(item.description || '');
      setEditLink('');
    } else if (type === 'video') {
      setEditTitle(item.videoTitle || '');
      setEditDesc(item.videoDescription || '');
      setEditLink(item.videoLink || '');
    } else if (type === 'slide') {
      setEditTitle(item.slideTitle || '');
      setEditDesc('');
      setEditLink(item.slideLink || '');
    } else if (type === 'poster') {
      setEditTitle('');
      setEditDesc('');
      setEditLink(item.posterLink || '');
    }
  };

  const handleSaveEdit = async (materialId: string) => {
    if (!candidateId) return;

    let payload: any;
    if (type === 'manifesto') {
      payload = { title: editTitle, description: editDesc };
    } else if (type === 'video') {
      payload = { videoTitle: editTitle, videoDescription: editDesc, videoLink: editLink };
    } else if (type === 'slide') {
      payload = { slideTitle: editTitle, slideLink: editLink };
    } else if (type === 'poster') {
      payload = { posterLink: editLink };
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/candidates/${candidateId}/materials/${type}/${materialId}`,
        { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(payload) }
      );
      if (res.ok) { 
        alert('Material Updated!'); 
        setEditingMaterial(null); 
        setEditTitle(''); 
        setEditDesc('');
        setEditLink('');
        refreshData(); 
      } else {
        alert(`Failed: ${res.status}`);
      }
    } catch (err: any) { alert(`Error: ${err.message}`); }
  };

  return (
    <div className="bg-white/5 backdrop-blur-3xl rounded-sm border border-white/10 shadow-2xl mb-8 p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#4c0519]/20 rounded-lg border border-white/10">
            {icon}
          </div>
          <h3 className="text-2xl font-bold uppercase tracking-tighter">{title}</h3>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">({materials.length})</span>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded text-[9px] font-black uppercase tracking-widest transition flex items-center gap-2"
        >
          <Plus size={14} /> Add New
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddMaterial} className="mb-6 p-6 bg-black/20 rounded-lg border border-white/10">
          {type === 'manifesto' ? (
            <>
              {manifestoItems.map((m, i) => (
                <div key={i} className="flex gap-4 mb-4 p-4 bg-white/5 rounded">
                  <input 
                    type="text" 
                    value={m.title}
                    onChange={(e) => { const n = [...manifestoItems]; n[i].title = e.target.value; setManifestoItems(n); }}
                    placeholder="Manifesto Title"
                    className="flex-1 bg-slate-50 border-b border-slate-200 px-0 py-2 text-xs outline-none focus:border-[#4c0519] transition-colors font-bold text-black"
                    required
                  />
                  <input 
                    type="text" 
                    value={m.description}
                    onChange={(e) => { const n = [...manifestoItems]; n[i].description = e.target.value; setManifestoItems(n); }}
                    placeholder="Description"
                    className="flex-1 bg-slate-50 border-b border-slate-200 px-0 py-2 text-xs outline-none focus:border-[#4c0519] transition-colors font-bold text-black"
                    required
                  />
                  {manifestoItems.length > 1 && (
                    <button type="button" onClick={() => setManifestoItems(manifestoItems.filter((_, idx) => idx !== i))} className="text-red-500">
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={() => setManifestoItems([...manifestoItems, { title: '', description: '' }])} className="text-[10px] font-black text-yellow-500 uppercase tracking-widest mb-4">
                + Add Manifesto Item
              </button>
            </>
          ) : (
            <>
              <input 
                type="text" 
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Title"
                className="w-full bg-slate-50 border-b border-slate-200 px-0 py-2 text-xs outline-none focus:border-[#4c0519] transition-colors font-bold text-black mb-4"
                required
              />
              {type === 'video' && (
                <textarea 
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Description"
                  className="w-full bg-slate-50 border-b border-slate-200 px-0 py-2 text-xs outline-none focus:border-[#4c0519] transition-colors font-bold text-black mb-4"
                  rows={2}
                />
              )}
              <input 
                type="url" 
                value={newLink}
                onChange={(e) => setNewLink(e.target.value)}
                placeholder={type === 'video' ? 'Video URL' : 'Image/Link URL'}
                className="w-full bg-slate-50 border-b border-slate-200 px-0 py-2 text-xs outline-none focus:border-[#4c0519] transition-colors font-bold text-black mb-4"
                required
              />
            </>
          )}
          <div className="flex gap-2">
            <button type="submit" className="bg-[#c5a021] text-black px-6 py-2 rounded text-[10px] font-black uppercase tracking-widest">
              <Save size={14} className="inline mr-2" /> Save
            </button>
            <button type="button" onClick={resetAddForm} className="bg-white/10 text-white px-6 py-2 rounded text-[10px] font-black uppercase tracking-widest">
              Cancel
            </button>
          </div>
        </form>
      )}

      {materials.length === 0 ? (
        <p className="text-slate-400 text-sm italic">No {title.toLowerCase()} added yet.</p>
      ) : (
        <div className="space-y-4">
          {materials.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="flex-1">
                <p className="text-sm font-bold text-white">{item.title || item.description}</p>
                {(item.videoLink || item.slideLink || item.posterLink) && (
                  <a href={item.videoLink || item.slideLink || item.posterLink} target="_blank" rel="noopener noreferrer" className="text-[10px] text-yellow-500 hover:underline">
                    {item.videoLink || item.slideLink || item.posterLink}
                  </a>
                )}
                {item.videoDescription && (
                  <p className="text-xs text-slate-400 mt-1">{item.videoDescription}</p>
                )}
              </div>
              
              {editingMaterial?.id === item.id ? (
                <div className="flex flex-col gap-2 w-full">
                  {type === 'manifesto' && (
                    <>
                      <input 
                        type="text" 
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        placeholder="Title"
                        className="bg-slate-50 border-b border-slate-200 px-2 py-1 text-xs text-black"
                      />
                      <input 
                        type="text" 
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        placeholder="Description"
                        className="bg-slate-50 border-b border-slate-200 px-2 py-1 text-xs text-black"
                      />
                    </>
                  )}
                  {type === 'video' && (
                    <>
                      <input 
                        type="text" 
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        placeholder="Video Title"
                        className="bg-slate-50 border-b border-slate-200 px-2 py-1 text-xs text-black"
                      />
                      <input 
                        type="text" 
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        placeholder="Video Description"
                        className="bg-slate-50 border-b border-slate-200 px-2 py-1 text-xs text-black"
                      />
                      <input 
                        type="url" 
                        value={editLink}
                        onChange={(e) => setEditLink(e.target.value)}
                        placeholder="Video URL"
                        className="bg-slate-50 border-b border-slate-200 px-2 py-1 text-xs text-black"
                      />
                    </>
                  )}
                  {type === 'slide' && (
                    <>
                      <input 
                        type="text" 
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        placeholder="Slide Title"
                        className="bg-slate-50 border-b border-slate-200 px-2 py-1 text-xs text-black"
                      />
                      <input 
                        type="url" 
                        value={editLink}
                        onChange={(e) => setEditLink(e.target.value)}
                        placeholder="Slide URL"
                        className="bg-slate-50 border-b border-slate-200 px-2 py-1 text-xs text-black"
                      />
                    </>
                  )}
                  {type === 'poster' && (
                    <input 
                      type="url" 
                      value={editLink}
                      onChange={(e) => setEditLink(e.target.value)}
                      placeholder="Poster URL"
                      className="bg-slate-50 border-b border-slate-200 px-2 py-1 text-xs text-black"
                    />
                  )}
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => handleSaveEdit(item.id)} className="text-green-500 flex items-center gap-1 text-xs font-bold uppercase">
                      <Save size={14} /> Save
                    </button>
                    <button onClick={() => setEditingMaterial(null)} className="text-red-500 flex items-center gap-1 text-xs font-bold uppercase">
                      <X size={14} /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button onClick={() => handleEditClick(item)} className="bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1 rounded text-[9px] font-black uppercase tracking-widest transition flex items-center gap-1">
                    <Edit2 size={12} /> Edit
                  </button>
                  <button onClick={() => handleDeleteMaterial(item.id)} className="bg-red-600/20 hover:bg-red-600/40 border border-red-600/30 px-3 py-1 rounded text-[9px] font-black uppercase tracking-widest transition flex items-center gap-1 text-red-400">
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}