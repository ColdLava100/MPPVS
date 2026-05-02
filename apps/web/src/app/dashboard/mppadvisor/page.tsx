'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Activity } from 'lucide-react';
import UniversalHeader from '@/components/ui/universal-header';
import { AdvisorMetricsGrid, CandidateReviewGrid, ElectionMonitor } from './components';
import CandidateDetailModal from './components/CandidateDetailModal';

const bgImageUrl = "https://beranang.kpm.edu.my/kpmb/images/speasyimagegallery/albums/7/images/dewan-3.jpg";

export default function AdvisorDashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Data state
  const [elections, setElections] = useState<any[]>([]);
  const [votingSessions, setVotingSessions] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);

  // Tab state
  const [activeTab, setActiveTab] = useState<'overview' | 'candidates' | 'elections'>('overview');

  // Modal state
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);

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
      const [eRes, vsRes, cRes, candRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/elections`, { credentials: 'include' }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/voting-sessions`, { credentials: 'include' }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses`, { credentials: 'include' }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/candidates`, { credentials: 'include' })
      ]);
      if (eRes.ok) setElections(await eRes.json());
      if (vsRes.ok) setVotingSessions(await vsRes.json());
      if (cRes.ok) setCourses(await cRes.json());
      if (candRes.ok) setCandidates(await candRes.json());
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

  const handleViewDetails = (candidate: any) => {
    setSelectedCandidate(candidate);
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

      <UniversalHeader role="mpp_advisor" userName={currentUser?.name} />

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
                  <Activity size={14} className="text-red-600 animate-pulse" /> Advisor Dashboard
                </p>
                <h1 className="text-6xl font-bold uppercase tracking-tighter leading-none text-white">
                  Welcome, <span className="italic">{currentUser?.name || 'Advisor'}</span>
                </h1>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 border-b border-white/10 pb-4">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'candidates', label: 'Candidates' },
                { id: 'elections', label: 'Elections' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${
                    activeTab === tab.id 
                      ? 'bg-[#4c0519] text-white' 
                      : 'bg-white/5 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <AdvisorMetricsGrid 
                  elections={elections}
                  votingSessions={votingSessions}
                  candidates={candidates}
                />
              </div>
            )}

            {activeTab === 'candidates' && (
              <CandidateReviewGrid 
                candidates={candidates}
                onViewDetails={handleViewDetails}
                onRefresh={fetchActiveData}
              />
            )}

            {activeTab === 'elections' && (
              <ElectionMonitor 
                elections={elections}
                votingSessions={votingSessions}
              />
            )}
          </div>

          <div className="relative z-10 w-full mt-auto">
            <div className="h-24" />
          </div>
        </main>

        {selectedCandidate && (
          <CandidateDetailModal 
            candidate={selectedCandidate}
            onClose={() => setSelectedCandidate(null)}
            onRefresh={fetchActiveData}
          />
        )}
      </div>
    );
}