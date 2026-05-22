'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, UserCog, Users, UserPlus, Vote } from 'lucide-react';
import UniversalHeader from '@/components/ui/universal-header';
import Background from '@/components/ui/background';
import SuperadminTab from './tabs/SuperadminTab';
import AdminTab from './tabs/AdminTab';
import AdvisorTab from './tabs/AdvisorTab';
import CandidateTab from './tabs/CandidateTab';
import VotingSimulationTab from './tabs/VotingSimulationTab';

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
  currentUser: any;
}

export default function SuperAdminDashboard() {
  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  const [courses, setCourses] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [elections, setElections] = useState<any[]>([]);
  const [votingSessions, setVotingSessions] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [activeRoleTab, setActiveRoleTab] = useState('SUPERADMIN');

  const inputStyle = { padding: '0.5rem', border: '1px solid #ccc' };
  const btnStyle = { padding: '0.5rem', marginTop: '0.5rem', background: '#000', color: '#fff', cursor: 'pointer', border: 'none' };
  const delBtnStyle = { ...btnStyle, background: '#dc2626' };
  const formStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: '400px', marginBottom: '2rem' };

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
      fetchActiveData();
    };
    checkAuth();
  }, [router]);

  const fetchActiveData = async () => {
    try {
      const [cRes, uRes, eRes, vRes, candRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses`, { credentials: 'include' }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, { credentials: 'include' }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/elections`, { credentials: 'include' }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/voting-sessions`, { credentials: 'include' }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/candidates`, { credentials: 'include' })
      ]);
      if (uRes.status === 401 || uRes.status === 403) {
        router.push('/login');
        return;
      }
      if (cRes.ok) setCourses(await cRes.json());
      if (uRes.ok) setUsers(await uRes.json());
      if (eRes.ok) setElections(await eRes.json());
      if (vRes.ok) setVotingSessions(await vRes.json());
      if (candRes.ok) setCandidates(await candRes.json());
    } catch (err) {
      console.error("Failed to fetch dictionary sets", err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen overflow-hidden relative font-sans text-white">
        <UniversalHeader role="superadmin" userName={currentUser?.name} />
        <main className="flex-grow flex items-center justify-center pt-[120px]">
          <p className="text-slate-400">Loading...</p>
        </main>
      </div>
    );
  }

  const commonProps: TabProps = {
    users,
    courses,
    elections,
    votingSessions,
    candidates,
    fetchActiveData,
    inputStyle,
    btnStyle,
    delBtnStyle,
    formStyle,
    currentUser
  };

  const tabs = [
    { id: 'SUPERADMIN', label: 'Super Admin', icon: Shield },
    { id: 'ADMIN', label: 'Admin', icon: UserCog },
    { id: 'ADVISOR', label: 'SRC Advisor', icon: Users },
    { id: 'CANDIDATE', label: 'Candidate', icon: UserPlus },
    { id: 'SIMULATION', label: 'Simulation', icon: Vote },
  ];

  const extraNavItems = [
    ...tabs.map(t => ({
      label: t.label,
      icon: t.icon,
      onClick: () => setActiveRoleTab(t.id),
      isActive: activeRoleTab === t.id,
    })),
    {
      label: 'Audit Logs',
      icon: Shield,
      onClick: () => router.push('/dashboard/superadmin/audit-logs'),
      isActive: false,
    },
  ];

  const activeTabLabel = tabs.find(t => t.id === activeRoleTab)?.label || activeRoleTab;

  return (
    <div className="min-h-screen overflow-hidden relative font-sans text-white">
      <UniversalHeader role="superadmin" userName={currentUser?.name} extraNavItems={extraNavItems} />

      <main className="flex-grow overflow-y-auto relative custom-scrollbar">
        <Background />

        <div className="relative z-10 p-4 md:p-12 max-w-7xl mx-auto w-full flex-grow flex flex-col gap-8">
          {/* Hero Section */}
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] mb-4 flex items-center gap-2">
              <Shield size={14} className="text-red-600 animate-pulse" /> Super Admin Panel
            </p>
            <h1 className="text-2xl md:text-6xl font-bold uppercase tracking-tighter leading-none text-white">
              Welcome, <span className="italic">{currentUser?.name || 'Super Admin'}</span>
            </h1>
            <span className="inline-block mt-3 text-[11px] md:text-[12px] font-black uppercase tracking-[0.2em] text-[#c5a021]/80">
              {activeTabLabel}
            </span>
          </div>

          {/* Tab Content Card */}
          <div className="bg-white/95 backdrop-blur-xl border border-white/20 border-b-[6px] border-b-[#c5a021] shadow-2xl rounded-sm p-6 md:p-8 text-slate-900">
            {activeRoleTab === 'SUPERADMIN' && <SuperadminTab {...commonProps} />}
            {activeRoleTab === 'ADMIN' && <AdminTab {...commonProps} />}
            {activeRoleTab === 'ADVISOR' && <AdvisorTab {...commonProps} />}
            {activeRoleTab === 'CANDIDATE' && <CandidateTab {...commonProps} />}
            {activeRoleTab === 'SIMULATION' && <VotingSimulationTab {...commonProps} />}
          </div>
        </div>
      </main>
    </div>
  );
}
