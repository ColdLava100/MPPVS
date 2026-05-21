'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Activity, UserCog, Clock, Users, UserPlus, BookOpen, Vote, Shield } from 'lucide-react';
import UniversalHeader from '@/components/ui/universal-header';
import Background from '@/components/ui/background';
import { AdminMetricsGrid, ElectionManager, VotingSessionManager, AccountManagement, CourseManagement, VotingSimulation } from './components';
import CandidateReviewGrid from '../srcadvisor/components/CandidateReviewGrid';
import CandidateDetailModal from '../srcadvisor/components/CandidateDetailModal';
import CandidateModal from '../srcadvisor/components/CandidateModal';

export default function AdminDashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'src' | 'ec' | 'accounts' | 'courses' | 'simulation'>('src');

  // Data state
  const [elections, setElections] = useState<any[]>([]);
  const [votingSessions, setVotingSessions] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  // SRC tab state
  const [selectedElectionId, setSelectedElectionId] = useState<string | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [showCandidateModal, setShowCandidateModal] = useState(false);

  // EC tab state
  const [ecSelectedElectionId, setEcSelectedElectionId] = useState<string | null>(null);

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
      const [eRes, vsRes, cRes, candRes, uRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/elections`, { credentials: 'include' }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/voting-sessions`, { credentials: 'include' }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses`, { credentials: 'include' }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/candidates`, { credentials: 'include' }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, { credentials: 'include' })
      ]);
      if (eRes.ok) setElections(await eRes.json());
      if (vsRes.ok) setVotingSessions(await vsRes.json());
      if (cRes.ok) setCourses(await cRes.json());
      if (candRes.ok) setCandidates(await candRes.json());
      if (uRes.ok) setUsers(await uRes.json());
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
        router.push('/dashboard/admin');
      }
    } catch (err: any) { alert(`Error: ${err.message}`); }
  };

  const handleViewDetails = (candidate: any) => {
    setSelectedCandidate(candidate);
  };

  const tabs = [
    { id: 'src' as const, label: 'SRC Advisor', icon: Users },
    { id: 'ec' as const, label: 'EC Operations', icon: Clock },
    { id: 'accounts' as const, label: 'Accounts', icon: UserCog },
    { id: 'courses' as const, label: 'Courses', icon: BookOpen },
    { id: 'simulation' as const, label: 'Simulation', icon: Vote },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen overflow-hidden relative font-sans text-white">
        <UniversalHeader role="admin" userName={currentUser?.name} />
        <main className="flex-grow flex items-center justify-center pt-[120px]">
          <p className="text-slate-400">Loading...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-hidden relative font-sans text-white">
      {currentUser?.isImpersonating && (
        <button
          onClick={handleStopImpersonation}
          className="bg-red-600 hover:bg-red-700 text-white w-full py-2 text-xs font-bold uppercase tracking-[0.2em] z-50 transition-colors"
        >
          Stop Impersonating
        </button>
      )}

      <UniversalHeader role="admin" userName={currentUser?.name} />

      <main className="flex-grow overflow-y-auto relative custom-scrollbar">
        <Background />

        <div className="relative z-10 p-4 md:p-12 max-w-7xl mx-auto w-full flex-grow flex flex-col gap-8">
          {/* Hero Section */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] mb-4 flex items-center gap-2">
                <Activity size={14} className="text-red-600 animate-pulse" /> Admin Control Panel
              </p>
              <h1 className="text-2xl md:text-6xl font-bold uppercase tracking-tighter leading-none text-white">
                Welcome, <span className="italic">{currentUser?.name || 'Admin'}</span>
              </h1>
            </div>
            <button
              onClick={() => router.push('/dashboard/admin/audit-logs')}
              className="bg-[#4c0519]/80 hover:bg-[#4c0519] text-white px-4 py-2.5 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 w-full md:w-auto justify-center"
            >
              <Shield size={14} /> Audit Logs
            </button>
          </div>

          {/* Single Large Card */}
          <div className="bg-white/95 backdrop-blur-xl border border-white/20 border-b-[6px] border-b-[#c5a021] shadow-2xl rounded-sm p-6 md:p-8">
            {/* Compact Metrics */}
            <AdminMetricsGrid
              elections={elections}
              votingSessions={votingSessions}
              candidates={candidates}
            />

            {/* Role Tabs */}
            <div className="flex flex-wrap gap-1.5 md:gap-2 mb-6">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded text-[10px] font-black uppercase tracking-widest transition ${
                      activeTab === tab.id
                        ? 'bg-[#c5a021] text-black'
                        : 'bg-[#4c0519]/10 text-[#4c0519] border border-[#4c0519]/20 hover:bg-[#4c0519]/20'
                    }`}
                  >
                    <Icon size={14} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Tab Content */}
            {activeTab === 'src' && (
              <div>
                {/* Election Selector + Add Candidate */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 pb-6 border-b border-slate-200">
                  <div className="flex-1">
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Select Election</label>
                    <div className="relative">
                      <select
                        value={selectedElectionId || ''}
                        onChange={(e) => setSelectedElectionId(e.target.value || null)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-sm px-4 py-3 text-slate-900 text-sm font-medium outline-none focus:border-[#c5a021] transition-colors appearance-none cursor-pointer"
                      >
                        <option value="">Select an election...</option>
                        {elections.map((e: any) => (
                          <option key={e.id} value={e.id}>
                            {e.title} ({e.status})
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowCandidateModal(true)}
                    disabled={!selectedElectionId}
                    className="bg-[#c5a021] hover:bg-yellow-400 text-black px-4 py-2.5 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 w-full md:w-auto justify-center disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <UserPlus size={14} /> Add Candidate
                  </button>
                </div>

                {/* Candidate Grid */}
                {selectedElectionId ? (
                  <CandidateReviewGrid
                    electionId={selectedElectionId}
                    candidates={candidates}
                    onViewDetails={handleViewDetails}
                    onRefresh={fetchActiveData}
                  />
                ) : (
                  <div className="text-center py-16">
                    <Users size={48} className="mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500 text-sm font-medium">Select an election above to review its candidates</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'ec' && (
              <div className="space-y-8">
                {/* Election Selector for Voting Sessions */}
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Select Election for Sessions</label>
                  <select
                    value={ecSelectedElectionId || ''}
                    onChange={(e) => setEcSelectedElectionId(e.target.value || null)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-sm px-4 py-3 text-slate-900 text-sm font-medium outline-none focus:border-[#c5a021] transition-colors"
                  >
                    <option value="">Select an election...</option>
                    {elections.map((e: any) => (
                      <option key={e.id} value={e.id}>{e.title} ({e.status})</option>
                    ))}
                  </select>
                </div>

                <ElectionManager
                  elections={elections}
                  courses={courses}
                  onRefresh={fetchActiveData}
                />
                <VotingSessionManager
                  votingSessions={votingSessions}
                  elections={elections}
                  courses={courses}
                  onRefresh={fetchActiveData}
                  selectedElectionId={ecSelectedElectionId || undefined}
                />
              </div>
            )}

            {activeTab === 'accounts' && (
              <AccountManagement
                courses={courses}
                users={users}
                onRefresh={fetchActiveData}
              />
            )}

            {activeTab === 'courses' && (
              <CourseManagement
                courses={courses}
                onRefresh={fetchActiveData}
              />
            )}

            {activeTab === 'simulation' && (
              <VotingSimulation
                users={users}
                elections={elections}
                candidates={candidates}
              />
            )}
          </div>
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

      {showCandidateModal && (
        <CandidateModal
          elections={elections}
          selectedElectionId={selectedElectionId}
          onClose={() => setShowCandidateModal(false)}
          onRefresh={fetchActiveData}
        />
      )}
    </div>
  );
}
