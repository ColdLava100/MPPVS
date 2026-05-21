'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Users, Calendar, Edit3, Shield } from 'lucide-react';
import UniversalHeader from '@/components/ui/universal-header';
import Background from '@/components/ui/background';
import VoterList from '../../components/VoterList';
import CandidatesList from '../../components/CandidatesList';
import SessionList from '../../components/SessionList';
import AuditLogTable from '@/components/ui/AuditLogTable';

type TabType = 'voters' | 'sessions' | 'candidates' | 'audit';

export default function ElectionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const electionId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [election, setElection] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<TabType>('voters');

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
    if (!isLoading && electionId) {
      fetchElectionData();
    }
  }, [isLoading, electionId]);

  const fetchElectionData = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/elections/${electionId}`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setElection(data);
      }
    } catch (err) {
      console.error('Failed to fetch election:', err);
    }
  };

  const handleEditElection = () => {
    router.push('/dashboard/ec?edit=' + electionId);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-700';
      case 'DRAFT':
        return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED':
        return 'bg-slate-100 text-slate-600';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };

  const formatDateOnly = (date: string | null) => {
    if (!date) return 'Not set';
    return new Date(date).toLocaleDateString();
  };

  const getCourseList = () => {
    if (!election?.courseSettings) return [];
    return Object.keys(election.courseSettings);
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!election) {
    return (
      <div className="min-h-screen overflow-hidden relative font-sans text-white">
        <UniversalHeader role="ec" />
        <main className="flex-grow overflow-y-auto relative custom-scrollbar pt-[120px]">
          <Background />
          <div className="relative z-10 p-12 max-w-7xl mx-auto w-full">
            <p className="text-slate-400">Election not found.</p>
            <button 
              onClick={() => router.push('/dashboard/ec')}
              className="mt-4 text-[#c5a021] hover:underline"
            >
              Back to Dashboard
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-hidden relative font-sans text-white">
      <UniversalHeader role="ec" />

      <main className="flex-grow overflow-y-auto relative custom-scrollbar pt-[120px]">
        <Background />

        <div className="relative z-10 p-12 max-w-7xl mx-auto w-full flex flex-col gap-8">
            {/* Header */}
            <div className="flex items-center justify-between">
              <button 
                onClick={() => router.push('/dashboard/ec')}
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft size={20} />
                <span className="text-[10px] font-black uppercase tracking-widest">Back to Dashboard</span>
              </button>
              <button 
                onClick={handleEditElection}
                className="bg-[#c5a021] hover:bg-yellow-400 text-black px-6 py-3 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
              >
                <Edit3 size={16} />
                Edit Election
              </button>
            </div>

            {/* Election Details Card */}
            <div className="p-8 bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-sm">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold uppercase tracking-tighter text-black">{election.title}</h1>
                  <span className={`inline-block mt-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${getStatusBadge(election.status)}`}>
                    {election.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-slate-50 rounded-sm">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Period</p>
                  <p className="text-sm font-bold text-black">
                    {formatDateOnly(election.startDate)} - {formatDateOnly(election.endDate)}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-sm">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Courses</p>
                  <p className="text-sm font-bold text-black">
                    {getCourseList().map(prefix => (
                      <span key={prefix} className="mr-2">
                        {prefix} ({election.courseSettings[prefix]} seats)
                      </span>
                    ))}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-sm">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Created</p>
                  <p className="text-sm font-bold text-black">
                    {new Date(election.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-sm p-1 w-fit">
              <button
                onClick={() => setActiveTab('voters')}
                className={`px-6 py-3 rounded-sm transition-all flex items-center gap-2 ${
                  activeTab === 'voters' 
                    ? 'bg-[#c5a021] text-black' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Users size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">Voters</span>
              </button>
              <button
                onClick={() => setActiveTab('sessions')}
                className={`px-6 py-3 rounded-sm transition-all flex items-center gap-2 ${
                  activeTab === 'sessions' 
                    ? 'bg-[#c5a021] text-black' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Calendar size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">Sessions</span>
              </button>
              <button
                onClick={() => setActiveTab('candidates')}
                className={`px-6 py-3 rounded-sm transition-all flex items-center gap-2 ${
                  activeTab === 'candidates' 
                    ? 'bg-[#c5a021] text-black' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Users size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">Candidates</span>
              </button>
              <button
                onClick={() => setActiveTab('audit')}
                className={`px-6 py-3 rounded-sm transition-all flex items-center gap-2 ${
                  activeTab === 'audit' 
                    ? 'bg-[#c5a021] text-black' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Shield size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">Audit Logs</span>
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-8 bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-sm">
              {activeTab === 'voters' && (
                <VoterList electionId={electionId} courses={getCourseList()} />
              )}
              {activeTab === 'sessions' && (
                <SessionList electionId={electionId} />
              )}
              {activeTab === 'candidates' && (
                <CandidatesList electionId={electionId} />
              )}
              {activeTab === 'audit' && (
                <AuditLogTable electionId={electionId} />
              )}
            </div>
          </div>
        </main>
      </div>
    );
}