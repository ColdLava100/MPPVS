'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield } from 'lucide-react';
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
  
  // Auth check state
  const [isLoading, setIsLoading] = useState(true);
  
  // Current user state
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Global data state
  const [courses, setCourses] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [elections, setElections] = useState<any[]>([]);
  const [votingSessions, setVotingSessions] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [activeRoleTab, setActiveRoleTab] = useState('SUPERADMIN');

  // Shared styles
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
      // Check for auth errors on any response
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
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <p>Loading...</p>
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

  const tabLabel = activeRoleTab === 'SUPERADMIN' ? 'Super Admin'
    : activeRoleTab === 'ADMIN' ? 'Admin'
    : activeRoleTab === 'ADVISOR' ? 'SRC Advisor'
    : activeRoleTab === 'CANDIDATE' ? 'Candidate'
    : 'Simulation';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', color: '#000000', fontFamily: 'sans-serif' }}>
      <Background />
      <div className="relative z-10" style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
      {/* Mobile top bar */}
      <div className="fixed top-0 left-0 right-0 z-50 flex md:hidden items-center justify-between px-4 py-3 bg-[#111827] text-white">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '0.25rem' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
        <span style={{ fontSize: '0.9rem', fontWeight: 'bold', letterSpacing: '0.1em' }}>Tracer Bullet — {tabLabel}</span>
        <div style={{ width: '20px' }} />
      </div>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden bg-black/50" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`
        fixed md:sticky top-0 z-50 md:z-auto
        ${sidebarOpen ? 'left-0' : '-left-full md:left-0'}
        transition-all duration-300
      `} style={{ width: '250px', backgroundColor: '#111827', color: '#fff', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: '100vh' }}>
        {/* Close button on mobile */}
        <div className="flex md:hidden justify-end mb-2">
          <button onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
        </div>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', borderBottom: '1px solid #374151', paddingBottom: '0.5rem' }}>Tracer Bullet</h2>
        <button onClick={() => { setActiveRoleTab('SUPERADMIN'); setSidebarOpen(false); }} style={{ padding: '0.75rem', textAlign: 'left', background: activeRoleTab === 'SUPERADMIN' ? '#374151' : 'transparent', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>Super Admin / System</button>
        <button onClick={() => { setActiveRoleTab('ADMIN'); setSidebarOpen(false); }} style={{ padding: '0.75rem', textAlign: 'left', background: activeRoleTab === 'ADMIN' ? '#374151' : 'transparent', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>Admin (Election Ops)</button>
        <button onClick={() => { setActiveRoleTab('ADVISOR'); setSidebarOpen(false); }} style={{ padding: '0.75rem', textAlign: 'left', background: activeRoleTab === 'ADVISOR' ? '#374151' : 'transparent', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>SRC Advisor</button>
        <button onClick={() => { setActiveRoleTab('CANDIDATE'); setSidebarOpen(false); }} style={{ padding: '0.75rem', textAlign: 'left', background: activeRoleTab === 'CANDIDATE' ? '#374151' : 'transparent', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>Candidate</button>
        
        <div style={{ borderTop: '1px solid #374151', margin: '0.5rem 0' }} />

        <button onClick={() => router.push('/dashboard/superadmin/audit-logs')} style={{ padding: '0.75rem', textAlign: 'left', background: 'transparent', color: '#c5a021', border: 'none', cursor: 'pointer', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Shield size={16} /> Audit Logs
        </button>

        <div style={{ borderTop: '1px solid #374151', margin: '0.5rem 0' }} />
        
        <button onClick={() => { setActiveRoleTab('SIMULATION'); setSidebarOpen(false); }} style={{ padding: '0.75rem', textAlign: 'left', background: activeRoleTab === 'SIMULATION' ? '#374151' : 'transparent', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>SIMULATION: Voting & Tally</button>
        
        <div style={{ borderTop: '1px solid #374151', margin: '0.5rem 0' }} />
        
        <button onClick={async () => { await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, { method: 'POST', credentials: 'include' }); router.push('/login'); }} style={{ padding: '0.75rem', textAlign: 'left', background: '#dc2626', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px', marginTop: 'auto' }}>Logout</button>
      </aside>

      <main className="flex-1 p-4 md:p-8 overflow-y-auto mt-14 md:mt-0">
        {activeRoleTab === 'SUPERADMIN' && <SuperadminTab {...commonProps} />}
        {activeRoleTab === 'ADMIN' && <AdminTab {...commonProps} />}
        {activeRoleTab === 'ADVISOR' && <AdvisorTab {...commonProps} />}
        {activeRoleTab === 'CANDIDATE' && <CandidateTab {...commonProps} />}
        {activeRoleTab === 'SIMULATION' && <VotingSimulationTab {...commonProps} />}
      </main>
      </div>
    </div>
  );
}
