"use client";

import React, { useState, useEffect, useRef } from 'react';
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
  Presentation,
  Camera,
  Upload,
  Loader2,
  Pencil,
  ExternalLink,
  File,
  Monitor
} from 'lucide-react';
import UniversalHeader from '@/components/ui/universal-header';
import Footer from '@/components/ui/footer';
import CropModal from '@/components/ui/crop-modal';
import ConfirmationModal from '@/components/ui/confirmation-modal';
import { getYouTubeEmbedUrl, detectSlideType, getSlideEmbedUrl } from '@/lib/embed-utils';

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
  profilePicture?: string | null;
  spotlightBanner?: string | null;
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

  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropTarget, setCropTarget] = useState<'profile' | 'banner' | null>(null);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [editMode, setEditMode] = useState<'profile' | 'banner' | null>(null);
  const profileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

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

  const handleFileSelect = (target: 'profile' | 'banner', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('File must be less than 5MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setCropTarget(target);
      setCropImageSrc(reader.result as string);
      setCropModalOpen(true);
    };
    reader.readAsDataURL(file);
    if (e.target) e.target.value = '';
  };

  const handleCropSave = async (croppedBlob: Blob) => {
    if (!cropTarget || !candidateProfile?.id) return;
    setIsUploading(true);
    setCropModalOpen(false);

    try {
      const formData = new FormData();
      formData.append('file', croppedBlob, 'crop.jpg');
      formData.append('upload_preset', 'mppvs_preset');

      const res = await fetch('https://api.cloudinary.com/v1_1/dkce1wxaw/image/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');

      const data = await res.json();
      const url = data.secure_url;

      const field = cropTarget === 'profile' ? 'profilePicture' : 'spotlightBanner';
      const patchRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/candidates/${candidateProfile.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ [field]: url }),
      });

      if (patchRes.ok) {
        await fetchCandidateProfile();
      } else {
        alert('Failed to update profile.');
      }
    } catch (err: any) {
      alert(`Upload error: ${err.message}`);
    } finally {
      setIsUploading(false);
      setCropTarget(null);
      setCropImageSrc(null);
    }
  };

  const promptRemoveImage = (target: 'profile' | 'banner') => {
    setConfirmModal({
      isOpen: true,
      title: `Remove ${target === 'profile' ? 'Profile Picture' : 'Banner'}`,
      message: `This will permanently remove your ${target === 'profile' ? 'profile picture' : 'spotlight banner'} from the server. This action cannot be undone.`,
      onConfirm: () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        removeImage(target);
      },
    });
  };

  const removeImage = async (target: 'profile' | 'banner') => {
    if (!candidateProfile?.id) return;
    setIsUploading(true);

    const endpoint = target === 'profile'
      ? `${process.env.NEXT_PUBLIC_API_URL}/candidates/${candidateProfile.id}/profile-picture`
      : `${process.env.NEXT_PUBLIC_API_URL}/candidates/${candidateProfile.id}/spotlight-banner`;

    try {
      const res = await fetch(endpoint, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        await fetchCandidateProfile();
      } else {
        alert('Failed to remove image.');
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsUploading(false);
      setEditMode(null);
    }
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

        <div className="relative z-10 p-4 md:p-12 max-w-7xl mx-auto w-full flex-grow flex flex-col gap-8 md:gap-12">
            {/* Hero Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] mb-4 flex items-center gap-2">
                  <Activity size={14} className="text-red-600 animate-pulse" /> Campaign Headquarters
                </p>
                <h1 className="text-3xl md:text-6xl font-bold uppercase tracking-tighter leading-none text-white">
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

            {/* Profile & Banner Section */}
            <section>
              <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-tighter italic leading-none text-white mb-8 md:mb-12">
                Profile & Banner
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Profile Picture Card */}
                <div className="md:col-span-1 p-6 md:p-8 bg-white/95 backdrop-blur-xl border border-white/20 border-b-[6px] border-b-[#4c0519] shadow-2xl rounded-sm">
                  <div className="flex flex-col items-center">
                    <div className="relative w-32 h-32 mb-6">
                      {candidateProfile?.profilePicture ? (
                        <img
                          src={candidateProfile.profilePicture}
                          alt="Profile"
                          className="w-full h-full rounded-full object-cover border-4 border-[#c5a021]/30"
                        />
                      ) : (
                        <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center border-4 border-slate-200">
                          <Camera size={40} className="text-slate-400" />
                        </div>
                      )}
                      {isUploading && cropTarget === 'profile' && (
                        <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                          <Loader2 size={24} className="text-white animate-spin" />
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 text-center">
                      Profile Picture
                    </p>
                    {editMode === 'profile' ? (
                      <div className="flex gap-2 w-full">
                        <button
                          onClick={() => profileInputRef.current?.click()}
                          disabled={isUploading}
                          className="flex-1 flex items-center justify-center gap-2 bg-[#c5a021] text-black py-2.5 rounded text-[9px] font-black uppercase tracking-widest hover:bg-yellow-400 transition-all disabled:opacity-50"
                        >
                          <Upload size={12} /> Update
                        </button>
                        {candidateProfile?.profilePicture && (
                          <button
                            onClick={() => promptRemoveImage('profile')}
                            disabled={isUploading}
                            className="flex items-center justify-center gap-1 bg-red-600/20 text-red-400 py-2.5 px-3 rounded text-[9px] font-black uppercase tracking-widest hover:bg-red-600/40 transition-all disabled:opacity-50"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                        <button
                          onClick={() => setEditMode(null)}
                          className="flex items-center justify-center gap-1 bg-white/10 text-white py-2.5 px-3 rounded text-[9px] font-black uppercase tracking-widest hover:bg-white/20 transition-all"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setEditMode('profile')}
                        className="w-full flex items-center justify-center gap-2 bg-[#4c0519]/80 hover:bg-[#4c0519] text-white py-2.5 rounded text-[9px] font-black uppercase tracking-widest transition-all border border-[#4c0519]"
                      >
                        <Edit2 size={12} /> Edit
                      </button>
                    )}
                    <input
                      ref={profileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileSelect('profile', e)}
                    />
                  </div>
                </div>

                {/* Spotlight Banner Card */}
                <div className="md:col-span-2 p-6 md:p-8 bg-white/95 backdrop-blur-xl border border-white/20 border-b-[6px] border-b-yellow-600 shadow-2xl rounded-sm">
                  <div className="flex flex-col items-center">
                    <div className="relative w-full aspect-[16/9] mb-6 bg-slate-100 rounded-sm overflow-hidden border-2 border-slate-200">
                      {candidateProfile?.spotlightBanner ? (
                        <img
                          src={candidateProfile.spotlightBanner}
                          alt="Banner"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center">
                          <Image size={40} className="text-slate-400 mb-2" />
                          <p className="text-[10px] text-slate-400 uppercase tracking-widest">No Banner</p>
                        </div>
                      )}
                      {isUploading && cropTarget === 'banner' && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <Loader2 size={24} className="text-white animate-spin" />
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 text-center">
                      Spotlight Banner (16:9)
                    </p>
                    {editMode === 'banner' ? (
                      <div className="flex gap-2 w-full max-w-xs">
                        <button
                          onClick={() => bannerInputRef.current?.click()}
                          disabled={isUploading}
                          className="flex-1 flex items-center justify-center gap-2 bg-[#c5a021] text-black py-2.5 rounded text-[9px] font-black uppercase tracking-widest hover:bg-yellow-400 transition-all disabled:opacity-50"
                        >
                          <Upload size={12} /> Update
                        </button>
                        {candidateProfile?.spotlightBanner && (
                          <button
                            onClick={() => promptRemoveImage('banner')}
                            disabled={isUploading}
                            className="flex items-center justify-center gap-1 bg-red-600/20 text-red-400 py-2.5 px-3 rounded text-[9px] font-black uppercase tracking-widest hover:bg-red-600/40 transition-all disabled:opacity-50"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                        <button
                          onClick={() => setEditMode(null)}
                          className="flex items-center justify-center gap-1 bg-white/10 text-white py-2.5 px-3 rounded text-[9px] font-black uppercase tracking-widest hover:bg-white/20 transition-all"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setEditMode('banner')}
                        className="w-full max-w-xs flex items-center justify-center gap-2 bg-[#4c0519]/80 hover:bg-[#4c0519] text-white py-2.5 rounded text-[9px] font-black uppercase tracking-widest transition-all border border-[#4c0519]"
                      >
                        <Edit2 size={12} /> Edit
                      </button>
                    )}
                    <input
                      ref={bannerInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileSelect('banner', e)}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Campaign Materials Section */}
            <section>
              <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-tighter italic leading-none text-white mb-8 md:mb-12">
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

        <CropModal
          isOpen={cropModalOpen}
          imageSrc={cropImageSrc}
          aspect={cropTarget === 'profile' ? 1 : 16 / 9}
          title={cropTarget === 'profile' ? 'Crop Profile Picture' : 'Crop Spotlight Banner'}
          onSave={handleCropSave}
          onClose={() => { setCropModalOpen(false); setCropTarget(null); setCropImageSrc(null); }}
        />

        <ConfirmationModal
          isOpen={confirmModal.isOpen}
          title={confirmModal.title}
          message={confirmModal.message}
          confirmLabel="Remove"
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        />
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
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newLink, setNewLink] = useState('');
  const [manifestoItems, setManifestoItems] = useState([{ title: '', description: '' }]);
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterPreview, setPosterPreview] = useState<string | null>(null);

  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editLink, setEditLink] = useState('');
  const [editPosterFile, setEditPosterFile] = useState<File | null>(null);
  const [editPosterPreview, setEditPosterPreview] = useState<string | null>(null);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  const resetAddForm = () => {
    setNewTitle('');
    setNewDesc('');
    setNewLink('');
    setManifestoItems([{ title: '', description: '' }]);
    setPosterFile(null);
    setPosterPreview(null);
    setShowAddForm(false);
  };

  const handlePosterFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('File must be less than 5MB.');
      return;
    }
    setPosterFile(file);
    const reader = new FileReader();
    reader.onload = () => setPosterPreview(reader.result as string);
    reader.readAsDataURL(file);
    if (e.target) e.target.value = '';
  };

  const handleAddMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateId) return;

    if (type === 'poster' && posterFile) {
      try {
        const formData = new FormData();
        formData.append('file', posterFile);
        formData.append('upload_preset', 'mppvs_preset');

        const res = await fetch('https://api.cloudinary.com/v1_1/dkce1wxaw/image/upload', {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) throw new Error('Upload failed');

        const data = await res.json();
        const url = data.secure_url;

        const matRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/candidates/${candidateId}/materials`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ type: 'poster', title: posterFile.name, link: url }),
        });

        if (matRes.ok) {
          resetAddForm();
          refreshData();
        } else {
          alert(`Failed: ${matRes.status}`);
        }
      } catch (err: any) {
        alert(`Upload error: ${err.message}`);
      }
      return;
    }

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
        resetAddForm();
        refreshData();
      } else {
        alert(`Failed: ${res.status}`);
      }
    } catch (err: any) { alert(`Error: ${err.message}`); }
  };

  const promptDelete = (materialId: string) => {
    setConfirmModal({
      isOpen: true,
      title: `Delete ${type}`,
      message: `Are you sure you want to delete this ${type}? This action cannot be undone.`,
      onConfirm: () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        handleDeleteMaterial(materialId);
      },
    });
  };

  const handleDeleteMaterial = async (materialId: string) => {
    if (!candidateId) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/candidates/${candidateId}/materials/${type}/${materialId}`,
        { method: 'DELETE', credentials: 'include' }
      );
      if (res.ok) {
        refreshData();
      } else {
        alert(`Failed: ${res.status}`);
      }
    } catch (err: any) { alert(`Error: ${err.message}`); }
  };

  const handleEditClick = (item: MaterialItem) => {
    setEditingId(item.id);
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
      setEditPosterFile(null);
      setEditPosterPreview(item.posterLink || null);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
    setEditDesc('');
    setEditLink('');
    setEditPosterFile(null);
    setEditPosterPreview(null);
  };

  const handleSaveEdit = async (materialId: string) => {
    if (!candidateId) return;

    if (type === 'poster' && editPosterFile) {
      try {
        const formData = new FormData();
        formData.append('file', editPosterFile);
        formData.append('upload_preset', 'mppvs_preset');

        const res = await fetch('https://api.cloudinary.com/v1_1/dkce1wxaw/image/upload', {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) throw new Error('Upload failed');

        const data = await res.json();
        const url = data.secure_url;

        const matRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/candidates/${candidateId}/materials/poster/${materialId}`,
          { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ link: url }) }
        );

        if (matRes.ok) {
          handleCancelEdit();
          refreshData();
        } else {
          alert(`Failed: ${matRes.status}`);
        }
      } catch (err: any) {
        alert(`Upload error: ${err.message}`);
      }
      return;
    }

    let payload: any;
    if (type === 'manifesto') {
      payload = { title: editTitle, description: editDesc };
    } else if (type === 'video') {
      payload = { title: editTitle, description: editDesc, link: editLink };
    } else if (type === 'slide') {
      payload = { title: editTitle, link: editLink };
    } else if (type === 'poster') {
      payload = { link: editLink };
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/candidates/${candidateId}/materials/${type}/${materialId}`,
        { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(payload) }
      );
      if (res.ok) { 
        handleCancelEdit();
        refreshData(); 
      } else {
        alert(`Failed: ${res.status}`);
      }
    } catch (err: any) { alert(`Error: ${err.message}`); }
  };

  const renderPreview = (item: MaterialItem) => {
    if (type === 'video' && item.videoLink) {
      const embedUrl = getYouTubeEmbedUrl(item.videoLink);
      if (embedUrl) {
        return (
          <div className="mt-3 rounded-lg overflow-hidden border border-white/10">
            <div className="aspect-video">
              <iframe
                src={embedUrl}
                title={item.videoTitle || 'Video'}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        );
      }
    }

    if (type === 'slide' && item.slideLink) {
      const { embedUrl, warning } = getSlideEmbedUrl(item.slideLink);
      if (warning) {
        return (
          <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="text-xs text-yellow-400">{warning}</p>
          </div>
        );
      }
      if (embedUrl) {
        const slideType = detectSlideType(item.slideLink);
        return (
          <div className="mt-3 rounded-lg overflow-hidden border border-white/10">
            <div className={slideType === 'pdf' ? 'aspect-[3/4]' : 'aspect-video'}>
              <iframe
                src={embedUrl}
                title={item.slideTitle || 'Slide'}
                className="w-full h-full"
                allowFullScreen
              />
            </div>
          </div>
        );
      }
    }

    if (type === 'poster' && item.posterLink) {
      return (
        <div className="mt-3 rounded-lg overflow-hidden border border-white/10">
          <img src={item.posterLink} alt={item.title || 'Poster'} className="w-full max-h-64 object-contain bg-black/20" />
        </div>
      );
    }

    return null;
  };

  const renderLink = (item: MaterialItem) => {
    const link = item.videoLink || item.slideLink || item.posterLink;
    if (!link) return null;
    
    if (type === 'slide') {
      const slideType = detectSlideType(link);
      const icon = slideType === 'canva-embed' || slideType === 'canva-view' ? <Monitor size={12} /> : slideType === 'pdf' ? <File size={12} /> : <ExternalLink size={12} />;
      return (
        <a href={link} target="_blank" rel="noopener noreferrer" className="text-[10px] text-yellow-500 hover:underline flex items-center gap-1 mt-1">
          {icon} {link}
        </a>
      );
    }

    return (
      <a href={link} target="_blank" rel="noopener noreferrer" className="text-[10px] text-yellow-500 hover:underline flex items-center gap-1 mt-1">
        <ExternalLink size={12} /> {link}
      </a>
    );
  };

  return (
    <div className="bg-white/5 backdrop-blur-3xl rounded-sm border border-white/10 shadow-2xl mb-8 p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#4c0519]/20 rounded-lg border border-white/10">
            {icon}
          </div>
          <h3 className="text-xl md:text-2xl font-bold uppercase tracking-tighter">{title}</h3>
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
                required={type !== 'poster'}
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
              {type === 'poster' ? (
                <>
                  {posterPreview ? (
                    <div className="mb-4">
                      <img src={posterPreview} alt="Preview" className="w-full max-h-48 object-contain rounded-lg border border-white/10" />
                      <button type="button" onClick={() => { setPosterFile(null); setPosterPreview(null); }} className="text-xs text-red-400 mt-2 hover:text-red-300">Remove</button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/20 rounded-lg cursor-pointer hover:border-white/40 hover:bg-white/5 transition-all mb-4">
                      <Upload size={24} className="text-white/50 mb-2" />
                      <span className="text-[10px] text-white/50 uppercase tracking-widest">Click to upload poster</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handlePosterFileSelect} />
                    </label>
                  )}
                </>
              ) : (
                <>
                  <input 
                    type="url" 
                    value={newLink}
                    onChange={(e) => setNewLink(e.target.value)}
                    placeholder={type === 'video' ? 'YouTube URL' : type === 'slide' ? 'Canva/PDF/Slide URL' : 'Image URL'}
                    className="w-full bg-slate-50 border-b border-slate-200 px-0 py-2 text-xs outline-none focus:border-[#4c0519] transition-colors font-bold text-black mb-4"
                    required
                  />
                </>
              )}
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
            <div key={item.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
              {editingId === item.id ? (
                <div className="space-y-3">
                  {type === 'manifesto' && (
                    <>
                      <input 
                        type="text" 
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        placeholder="Title"
                        className="w-full bg-slate-50 border-b border-slate-200 px-2 py-1.5 text-sm text-black"
                      />
                      <textarea 
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        placeholder="Description"
                        rows={2}
                        className="w-full bg-slate-50 border-b border-slate-200 px-2 py-1.5 text-sm text-black"
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
                        className="w-full bg-slate-50 border-b border-slate-200 px-2 py-1.5 text-sm text-black"
                      />
                      <textarea 
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        placeholder="Video Description"
                        rows={2}
                        className="w-full bg-slate-50 border-b border-slate-200 px-2 py-1.5 text-sm text-black"
                      />
                      <input 
                        type="url" 
                        value={editLink}
                        onChange={(e) => setEditLink(e.target.value)}
                        placeholder="YouTube URL"
                        className="w-full bg-slate-50 border-b border-slate-200 px-2 py-1.5 text-sm text-black"
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
                        className="w-full bg-slate-50 border-b border-slate-200 px-2 py-1.5 text-sm text-black"
                      />
                      <input 
                        type="url" 
                        value={editLink}
                        onChange={(e) => setEditLink(e.target.value)}
                        placeholder="Canva/PDF/Slide URL"
                        className="w-full bg-slate-50 border-b border-slate-200 px-2 py-1.5 text-sm text-black"
                      />
                    </>
                  )}
                  {type === 'poster' && (
                    <>
                      {editPosterPreview ? (
                        <div className="mb-2">
                          <img src={editPosterPreview} alt="Preview" className="w-full max-h-40 object-contain rounded-lg border border-white/10" />
                          <button type="button" onClick={() => { setEditPosterFile(null); setEditPosterPreview(null); setEditLink(''); }} className="text-xs text-red-400 mt-1 hover:text-red-300">Remove</button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-white/20 rounded-lg cursor-pointer hover:border-white/40 hover:bg-white/5 transition-all mb-2">
                          <Upload size={20} className="text-white/50 mb-1" />
                          <span className="text-[9px] text-white/50 uppercase tracking-widest">Upload new poster</span>
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            if (file.size > 5 * 1024 * 1024) { alert('File must be less than 5MB.'); return; }
                            setEditPosterFile(file);
                            const reader = new FileReader();
                            reader.onload = () => setEditPosterPreview(reader.result as string);
                            reader.readAsDataURL(file);
                            if (e.target) e.target.value = '';
                          }} />
                        </label>
                      )}
                    </>
                  )}
                  <div className="flex gap-2 pt-2">
                    <button onClick={() => handleSaveEdit(item.id)} className="bg-green-600/20 text-green-400 px-4 py-1.5 rounded text-[9px] font-black uppercase tracking-widest hover:bg-green-600/40 transition-all flex items-center gap-1">
                      <Save size={12} /> Save
                    </button>
                    <button onClick={handleCancelEdit} className="bg-white/10 text-white px-4 py-1.5 rounded text-[9px] font-black uppercase tracking-widest hover:bg-white/20 transition-all flex items-center gap-1">
                      <X size={12} /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">{item.title || item.description || 'Untitled'}</p>
                      {item.description && type !== 'video' && (
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">{item.description}</p>
                      )}
                      {item.videoDescription && (
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">{item.videoDescription}</p>
                      )}
                      {renderLink(item)}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => handleEditClick(item)} className="bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded text-[9px] font-black uppercase tracking-widest transition flex items-center gap-1">
                        <Edit2 size={12} /> Edit
                      </button>
                      <button onClick={() => promptDelete(item.id)} className="bg-red-600/20 hover:bg-red-600/40 border border-red-600/30 px-3 py-1.5 rounded text-[9px] font-black uppercase tracking-widest transition flex items-center gap-1 text-red-400">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                  {renderPreview(item)}
                </>
              )}
            </div>
          ))}
        </div>
      )}

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmLabel="Delete"
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
