'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Activity, Settings, BookOpen, Users, Clock, Vote } from 'lucide-react';
import UniversalHeader from '@/components/ui/universal-header';
import Footer from '@/components/ui/footer';
import ElectionOverview from './components/ElectionOverview';
import ElectionSetup from './components/ElectionSetup';
import CourseConfig from './components/CourseConfig';
import VoterImport from './components/VoterImport';
import SessionManager from './components/SessionManager';
import ElectionSetupButton from './components/ElectionSetupButton';

const bgImageUrl = "https://beranang.kpm.edu.my/kpmb/images/speasyimagegallery/albums/7/images/dewan-3.jpg";

const STEPS = [
  { id: 1, label: 'Election Setup' },
  { id: 2, label: 'Course Config' },
  { id: 3, label: 'Voter Import' },
  { id: 4, label: 'Voting Sessions' },
];

type ViewMode = 'overview' | 'workflow';

export default function SprDashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [currentStep, setCurrentStep] = useState(1);
  const [activeElectionId, setActiveElectionId] = useState<string | null>(null);
  const [activeElection, setActiveElection] = useState<any>(null);

  const [elections, setElections] = useState<any[]>([]);
  const [votingSessions, setVotingSessions] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);

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

  const fetchActiveData = async () => {
    try {
      const [eRes, vsRes, cRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/elections`, { credentials: 'include' }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/voting-sessions`, { credentials: 'include' }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses`, { credentials: 'include' })
      ]);
      if (eRes.ok) setElections(await eRes.json());
      if (vsRes.ok) setVotingSessions(await vsRes.json());
      if (cRes.ok) setCourses(await cRes.json());
    } catch (err) {
      console.error('Failed to fetch data', err);
    }
  };

  useEffect(() => {
    if (!isLoading) {
      fetchActiveData();
    }
  }, [isLoading]);

  const handleStopImpersonation = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/stop-impersonation`, {
        method: 'POST',
        credentials: 'include'
      });
      if (res.ok) {
        router.push('/dashboard/superadmin');
      }
    } catch (err: any) { alert(`Error: ${err.message}`); }
  };

  const handleElectionSelect = (election: any) => {
    setActiveElectionId(election.id);
    setActiveElection(election);
  };

  const handleCreateNew = () => {
    setActiveElectionId(null);
    setActiveElection(null);
    setCurrentStep(1);
    setViewMode('workflow');
  };

  const handleEditExisting = (election: any) => {
    setActiveElectionId(election.id);
    setActiveElection(election);
    setCurrentStep(1);
    setViewMode('workflow');
  };

  const handleBackToOverview = () => {
    setViewMode('overview');
    setActiveElectionId(null);
    setActiveElection(null);
    setCurrentStep(1);
    fetchActiveData();
  };

  const handleNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    if (!activeElectionId) {
      alert('No election selected');
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/elections/${activeElectionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'DRAFT' })
      });

      if (res.ok) {
        alert('Election completed and saved as Draft!');
        handleBackToOverview();
      } else {
        alert(`Failed: ${res.status}`);
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const canProceed = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!activeElectionId;
      case 2:
        return !!activeElectionId;
      case 3:
        return true;
      case 4:
        return true;
      default:
        return false;
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <p>Loading...</p>
      </div>
    );
  }

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

      <UniversalHeader role="spr" userName={currentUser?.name} />

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
                  <Activity size={14} className="text-red-600 animate-pulse" /> SPR Operations
                </p>
                <h1 className="text-6xl font-bold uppercase tracking-tighter leading-none text-white">
                  Welcome, <span className="italic">{currentUser?.name || 'SPR'}</span>
                </h1>
              </div>
              
              {viewMode === 'overview' && (
                <ElectionSetupButton 
                  elections={elections}
                  onCreateNew={handleCreateNew}
                  onEditExisting={handleEditExisting}
                />
              )}
            </div>

            {viewMode === 'overview' ? (
              /* Main Overview View */
              <div className="p-8 bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-sm">
                <ElectionOverview 
                  elections={elections}
                  courses={courses}
                  onEditElection={handleEditExisting}
                  onRefresh={fetchActiveData}
                />
              </div>
            ) : (
              /* Workflow View */
              <div className="flex flex-col gap-6">
                
                {/* CREATE MODE: Numbered Stepper Pipeline */}
                {!activeElectionId && (
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-sm p-6">
                    <div className="flex items-center justify-between">
                      {STEPS.map((step, index) => (
                        <React.Fragment key={step.id}>
                          <div className="flex flex-col items-center">
                            <div
                              className={`w-12 h-12 rounded-full flex items-center justify-center text-[12px] font-black uppercase tracking-widest transition-all ${
                                step.id === currentStep || step.id < currentStep
                                  ? 'bg-[#c5a021] text-black'
                                  : 'bg-white/5 text-slate-500 border border-white/5'
                              }`}
                            >
                              {step.id}
                            </div>
                            <span className={`mt-3 text-[10px] font-black uppercase tracking-widest ${
                              step.id === currentStep || step.id < currentStep ? 'text-white' : 'text-slate-500'
                            }`}>
                              {step.label}
                            </span>
                          </div>
                          {index < STEPS.length - 1 && (
                            <div className={`flex-1 h-1 mx-4 transition-all ${step.id < currentStep ? 'bg-[#c5a021]' : 'bg-white/5'}`} />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                )}

{/* Main Content Card (Unified for Edit and Create modes) */}
                <div className="p-8 bg-white/95 backdrop-blur-5xl border border-white/20 shadow-2xl rounded-sm">
                  
                  {/* Back to Overview - Global for Edit Mode (hoisted above Tab Bar) */}
                  {activeElectionId && (
                    <button onClick={handleBackToOverview} className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors text-[10px] font-black uppercase tracking-widest">
                      ← Back to Overview
                    </button>
                  )}

                  {/* Integrated Tab Bar - ONLY IN EDIT MODE */}
                  {activeElectionId && (
                    <div className="flex items-center justify-start gap-2 pb-4 mb-6 border-b border-slate-200">
                      <button onClick={() => setCurrentStep(1)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[12px] font-medium uppercase tracking-wide transition-all ${currentStep === 1 ? 'bg-[#4c0519] text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}><Settings size={14} />Settings</button>
                      <button onClick={() => setCurrentStep(2)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[12px] font-medium uppercase tracking-wide transition-all ${currentStep === 2 ? 'bg-[#4c0519] text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}><BookOpen size={14} />Courses</button>
                      <button onClick={() => setCurrentStep(3)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[12px] font-medium uppercase tracking-wide transition-all ${currentStep === 3 ? 'bg-[#4c0519] text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}><Users size={14} />Voters</button>
                      <button onClick={() => setCurrentStep(4)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[12px] font-medium uppercase tracking-wide transition-all ${currentStep === 4 ? 'bg-[#4c0519] text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}><Clock size={14} />Sessions</button>
                    </div>
                  )}

                  {/* Step content */}
                  {currentStep === 1 && (
                    <ElectionSetup elections={elections} courses={courses} activeElectionId={activeElectionId} activeElection={activeElection} onRefresh={fetchActiveData} onSelectElection={handleElectionSelect} onBack={handleBackToOverview} isEditMode={!!activeElectionId} />
                  )}
                  {currentStep === 2 && activeElectionId && (
                    <CourseConfig election={activeElection} courses={courses} onRefresh={fetchActiveData} />
                  )}
                  {currentStep === 3 && (
                    <VoterImport electionId={activeElectionId} onRefresh={fetchActiveData} />
                  )}
                  {currentStep === 4 && (
                    <SessionManager election={activeElection} courses={courses} votingSessions={votingSessions} onRefresh={fetchActiveData} />
                  )}
                </div>

                {/* Navigation Buttons - ONLY IN CREATE MODE */}
                {!activeElectionId && (
                  <div className="flex justify-between">
                    <button onClick={currentStep === 1 ? handleBackToOverview : handlePrevStep} className={`bg-white/5 hover:bg-white/10 border border-white/10 px-6 py-3 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2`}>
                      ← {currentStep === 1 ? 'Back to Overview' : 'Back'}
                    </button>
                    {currentStep < 4 ? (
                      <button onClick={handleNextStep} disabled={!canProceed(currentStep)} className={`bg-[#c5a021] text-black px-14 py-6 rounded-sm text-[12px] font-black uppercase tracking-[0.3em] hover:bg-yellow-400 transition-all shadow-2xl flex items-center gap-4 ${!canProceed(currentStep) ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        Next Step →
                      </button>
                    ) : (
                      <button onClick={handleComplete} disabled={!activeElectionId} className={`bg-[#c5a021] text-black px-14 py-6 rounded-sm text-[12px] font-black uppercase tracking-[0.3em] hover:bg-yellow-400 transition-all shadow-2xl flex items-center gap-4 ${!activeElectionId ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        Complete
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="relative z-10 w-full mt-auto">
            <Footer />
          </div>
        </main>
      </div>
    );
}