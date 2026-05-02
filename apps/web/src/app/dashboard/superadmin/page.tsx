'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#ffffff', color: '#000000', fontFamily: 'sans-serif' }}>
      <aside style={{ width: '250px', backgroundColor: '#111827', color: '#fff', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: '100vh' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', borderBottom: '1px solid #374151', paddingBottom: '0.5rem' }}>Tracer Bullet</h2>
        <button onClick={() => setActiveRoleTab('SUPERADMIN')} style={{ padding: '0.75rem', textAlign: 'left', background: activeRoleTab === 'SUPERADMIN' ? '#374151' : 'transparent', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>Super Admin / System</button>
        <button onClick={() => setActiveRoleTab('ADMIN')} style={{ padding: '0.75rem', textAlign: 'left', background: activeRoleTab === 'ADMIN' ? '#374151' : 'transparent', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>Admin (Election Ops)</button>
        <button onClick={() => setActiveRoleTab('ADVISOR')} style={{ padding: '0.75rem', textAlign: 'left', background: activeRoleTab === 'ADVISOR' ? '#374151' : 'transparent', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>SRC Advisor</button>
        <button onClick={() => setActiveRoleTab('CANDIDATE')} style={{ padding: '0.75rem', textAlign: 'left', background: activeRoleTab === 'CANDIDATE' ? '#374151' : 'transparent', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>Candidate</button>
        
        <div style={{ borderTop: '1px solid #374151', margin: '0.5rem 0' }} />
        
        <button onClick={() => setActiveRoleTab('SIMULATION')} style={{ padding: '0.75rem', textAlign: 'left', background: activeRoleTab === 'SIMULATION' ? '#374151' : 'transparent', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>SIMULATION: Voting & Tally</button>
        
        <div style={{ borderTop: '1px solid #374151', margin: '0.5rem 0' }} />
        
        <button onClick={async () => { await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, { method: 'POST', credentials: 'include' }); router.push('/login'); }} style={{ padding: '0.75rem', textAlign: 'left', background: '#dc2626', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px', marginTop: 'auto' }}>Logout</button>
      </aside>

      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
        {activeRoleTab === 'SUPERADMIN' && <SuperadminTab {...commonProps} />}
        {activeRoleTab === 'ADMIN' && <AdminTab {...commonProps} />}
        {activeRoleTab === 'ADVISOR' && <AdvisorTab {...commonProps} />}
        {activeRoleTab === 'CANDIDATE' && <CandidateTab {...commonProps} />}
        {activeRoleTab === 'SIMULATION' && <VotingSimulationTab {...commonProps} />}
      </main>
    </div>
  );
}
