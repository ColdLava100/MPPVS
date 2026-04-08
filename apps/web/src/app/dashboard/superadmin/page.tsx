'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SuperAdminDashboard() {
  const router = useRouter();
  const [courses, setCourses] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [elections, setElections] = useState<any[]>([]);
  const [votingSessions, setVotingSessions] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [activeRoleTab, setActiveRoleTab] = useState('SUPERADMIN');

  useEffect(() => {
    fetchActiveData();
  }, []);

  const fetchActiveData = async () => {
    try {
      const [cRes, uRes, eRes, vRes, candRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses`, { credentials: 'include' }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, { credentials: 'include' }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/elections`, { credentials: 'include' }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/voting-sessions`, { credentials: 'include' }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/candidates`, { credentials: 'include' })
      ]);
      if (cRes.ok) setCourses(await cRes.json());
      if (uRes.ok) setUsers(await uRes.json());
      if (eRes.ok) setElections(await eRes.json());
      if (vRes.ok) setVotingSessions(await vRes.json());
      if (candRes.ok) setCandidates(await candRes.json());
    } catch (err) {
      console.error("Failed to fetch dictionary sets", err);
    }
  };

  // 1. Election Form State
  const [electionTitle, setElectionTitle] = useState('');
  const [electionCourseConfig, setElectionCourseConfig] = useState<Record<string, { enabled: boolean, chairs: number }>>({});

  const [modElectionId, setModElectionId] = useState('');
  const [modElectionTitle, setModElectionTitle] = useState('');
  const [modElectionCourseConfig, setModElectionCourseConfig] = useState<Record<string, { enabled: boolean, chairs: number }>>({});

  useEffect(() => {
    if (courses.length > 0) {
      const initialConfig: Record<string, { enabled: boolean, chairs: number }> = {};
      courses.forEach(c => {
        initialConfig[c.studentPrefix] = { enabled: false, chairs: 1 };
      });
      setElectionCourseConfig(initialConfig);
    }
  }, [courses]);

  // 2. Voting Session Form State
  const [vsTitle, setVsTitle] = useState('');
  const [vsElectionId, setVsElectionId] = useState('');
  const [vsCourseId, setVsCourseId] = useState('');
  const [vsStartTime, setVsStartTime] = useState('');
  const [vsEndTime, setVsEndTime] = useState('');
  const [vsStudentIdStartBase, setVsStudentIdStartBase] = useState('');
  const [vsStudentIdEndBase, setVsStudentIdEndBase] = useState('');

  const [modVsId, setModVsId] = useState('');
  const [modVsTitle, setModVsTitle] = useState('');
  const [modVsElectionId, setModVsElectionId] = useState('');
  const [modVsCourseId, setModVsCourseId] = useState('');
  const [modVsStartTime, setModVsStartTime] = useState('');
  const [modVsEndTime, setModVsEndTime] = useState('');
  const [modVsStudentIdStartBase, setModVsStudentIdStartBase] = useState('');
  const [modVsStudentIdEndBase, setModVsStudentIdEndBase] = useState('');

  // 3. User Form State (Create)
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('SUPERADMIN');
  const [userIcNumber, setUserIcNumber] = useState('');
  const [userStudentIdPrefix, setUserStudentIdPrefix] = useState('');
  const [userStudentIdBase, setUserStudentIdBase] = useState('');

  // 4. Course Form State
  const [courseCode, setCourseCode] = useState('');
  const [courseStudentPrefix, setCourseStudentPrefix] = useState('');
  const [courseName, setCourseName] = useState('');

  // 5. User Form State (Modify)
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [modifyUserId, setModifyUserId] = useState('');
  const [modEmail, setModEmail] = useState('');
  const [modPassword, setModPassword] = useState('');
  const [modName, setModName] = useState('');
  const [modRole, setModRole] = useState('SUPERADMIN');
  const [modIcNumber, setModIcNumber] = useState('');
  const [modStudentIdPrefix, setModStudentIdPrefix] = useState('');
  const [modStudentIdBase, setModStudentIdBase] = useState('');

  // 6. Candidates Form State
  const [regElectionId, setRegElectionId] = useState('');
  const [regUserId, setRegUserId] = useState('');
  const [regInfo, setRegInfo] = useState('');
  const [regProfilePic, setRegProfilePic] = useState('');
  const [regBanner, setRegBanner] = useState('');

  const [matCandidateId, setMatCandidateId] = useState('');
  const [matType, setMatType] = useState('manifesto');
  const [matTitle, setMatTitle] = useState('');
  const [matDesc, setMatDesc] = useState('');
  const [matLink, setMatLink] = useState('');
  const [manifestoItems, setManifestoItems] = useState([{ title: '', description: '' }]);

  const [qualCandidateId, setQualCandidateId] = useState('');
  const [qualPositions, setQualPositions] = useState<string[]>(['']);
  const [qualCgpa, setQualCgpa] = useState('');
  const [qualJustification, setQualJustification] = useState('');

  const [advisorViewCandidateId, setAdvisorViewCandidateId] = useState('ALL');

  // 6b. Candidate Modify Form State
  const [modCandidateId, setModCandidateId] = useState('');

  // 7. Impersonate Form State
  const [impersonateUserId, setImpersonateUserId] = useState('');

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name?.toLowerCase().includes(userSearchQuery.toLowerCase()) || 
                          u.email?.toLowerCase().includes(userSearchQuery.toLowerCase());
    const matchesRole = userRoleFilter ? u.role === userRoleFilter : true;
    return matchesSearch && matchesRole;
  });

  const displayedCandidates = advisorViewCandidateId === 'ALL' 
    ? candidates 
    : candidates.filter((c: any) => c.id === advisorViewCandidateId);

  // ==============================
  // ELECTION LOGIC
  // ==============================
  const submitElection = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const courseSettings = Object.entries(electionCourseConfig)
      .filter(([_, config]) => config.enabled)
      .reduce((acc, [prefix, config]) => {
        acc[prefix] = config.chairs;
        return acc;
      }, {} as Record<string, number>);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/elections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title: electionTitle, courseSettings })
      });
      if (res.ok) {
        alert(`Election Created! ID: ${(await res.json()).id}`);
        fetchActiveData();
      } else {
        alert(`Failed: ${res.status} - ${await res.text()}`);
      }
    } catch (err: any) { alert(`Error: ${err.message}`); }
  };

  const deleteElection = async (id: string) => {
    if (!confirm("Delete election completely? This will cascade and delete all Voting Sessions connected to it!")) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/elections/${id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) { fetchActiveData(); if (modElectionId === id) setModElectionId(''); }
      else alert(`Failed: ${await res.text()}`);
    } catch (err: any) { alert(`Error: ${err.message}`); }
  };

  const toggleElectionStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'DRAFT' ? 'ACTIVE' : 'DRAFT';
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/elections/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) { fetchActiveData(); }
      else alert(`Failed: ${res.status} - ${await res.text()}`);
    } catch (err: any) { alert(`Error: ${err.message}`); }
  };

  const handleSelectElection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setModElectionId(id);
    if (!id) return;
    const el = elections.find(x => x.id === id);
    if (el) {
      setModElectionTitle(el.title);
      
      const loadedConfig: Record<string, { enabled: boolean, chairs: number }> = {};
      const savedSettings = el.courseSettings || {};
      
      courses.forEach(c => {
        const p = c.studentPrefix;
        if (savedSettings[p] !== undefined) {
          loadedConfig[p] = { enabled: true, chairs: Number(savedSettings[p]) };
        } else {
          loadedConfig[p] = { enabled: false, chairs: 1 };
        }
      });
      setModElectionCourseConfig(loadedConfig);
    }
  };

  const submitModifyElection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modElectionId) return;

    const courseSettings = Object.entries(modElectionCourseConfig)
      .filter(([_, config]) => config.enabled)
      .reduce((acc, [prefix, config]) => {
        acc[prefix] = config.chairs;
        return acc;
      }, {} as Record<string, number>);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/elections/${modElectionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title: modElectionTitle, courseSettings })
      });
      if (res.ok) { alert(`Election Modified!`); fetchActiveData(); }
      else alert(`Failed: ${res.status} - ${await res.text()}`);
    } catch (err: any) { alert(`Error: ${err.message}`); }
  };


  // ==============================
  // VOTING SESSION LOGIC
  // ==============================
  const extractIdSplit = (fullId: string | null) => {
    if (!fullId) return { prefix: '', base: '' };
    const match = fullId.match(/^[A-Za-z]+/);
    if (match) return { prefix: match[0], base: fullId.substring(match[0].length) };
    return { prefix: '', base: fullId };
  };

  const submitVotingSession = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedCourse = courses.find(c => c.id === vsCourseId);
    const prefix = selectedCourse ? selectedCourse.studentPrefix : '';
    const finalStart = vsStudentIdStartBase ? `${prefix}${vsStudentIdStartBase}` : undefined;
    const finalEnd = vsStudentIdEndBase ? `${prefix}${vsStudentIdEndBase}` : undefined;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/voting-sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          electionId: vsElectionId, title: vsTitle, courseId: vsCourseId,
          startTime: vsStartTime ? new Date(vsStartTime).toISOString() : null,
          endTime: vsEndTime ? new Date(vsEndTime).toISOString() : null,
          studentIdStart: finalStart, studentIdEnd: finalEnd
        })
      });
      if (res.ok) { alert(`Voting Session Created! ID: ${(await res.json()).id}`); fetchActiveData(); }
      else alert(`Failed: ${res.status} - ${await res.text()}`);
    } catch (err: any) { alert(`Error: ${err.message}`); }
  };

  const deleteVotingSession = async (id: string, fromModForm = false) => {
    if (!confirm("Delete voting session completely?")) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/voting-sessions/${id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) { fetchActiveData(); if (fromModForm) setModVsId(''); }
      else alert(`Failed: ${await res.text()}`);
    } catch (err: any) { alert(`Error: ${err.message}`); }
  };

  const handleSelectVotingSession = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setModVsId(id);
    if (!id) return;
    const vs = votingSessions.find(x => x.id === id);
    if (vs) {
      setModVsTitle(vs.title || '');
      setModVsElectionId(vs.electionId || '');
      // Try to find the matching course based on the courseCode inside exactly
      const crs = courses.find(c => c.code === vs.courseCode);
      setModVsCourseId(crs ? crs.id : '');

      setModVsStartTime(vs.startTime ? new Date(vs.startTime).toISOString().slice(0, 16) : '');
      setModVsEndTime(vs.endTime ? new Date(vs.endTime).toISOString().slice(0, 16) : '');

      const startObj = extractIdSplit(vs.studentIdStart);
      const endObj = extractIdSplit(vs.studentIdEnd);

      setModVsStudentIdStartBase(startObj.base);
      setModVsStudentIdEndBase(endObj.base);
    }
  };

  const submitModifyVotingSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modVsId) return;

    const selectedCourse = courses.find(c => c.id === modVsCourseId);
    const prefix = selectedCourse ? selectedCourse.studentPrefix : '';
    const finalStart = modVsStudentIdStartBase ? `${prefix}${modVsStudentIdStartBase}` : undefined;
    const finalEnd = modVsStudentIdEndBase ? `${prefix}${modVsStudentIdEndBase}` : undefined;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/voting-sessions/${modVsId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          electionId: modVsElectionId, title: modVsTitle, courseId: modVsCourseId,
          startTime: modVsStartTime ? new Date(modVsStartTime).toISOString() : null,
          endTime: modVsEndTime ? new Date(modVsEndTime).toISOString() : null,
          studentIdStart: finalStart, studentIdEnd: finalEnd
        })
      });
      if (res.ok) { alert(`Voting Session Modified!`); fetchActiveData(); }
      else alert(`Failed: ${res.status} - ${await res.text()}`);
    } catch (err: any) { alert(`Error: ${err.message}`); }
  };


  // ==============================
  // USER & COURSE LOGIC
  // ==============================
  const submitCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalStudentId = (userRole === 'STUDENT' || userRole === 'CANDIDATE')
      ? (userStudentIdPrefix && userStudentIdBase ? `${userStudentIdPrefix}${userStudentIdBase}` : undefined)
      : undefined;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: userEmail, password: userPassword, name: userName,
          role: userRole, icNumber: userIcNumber || undefined, studentId: finalStudentId,
        })
      });
      if (res.ok) { alert(`User Created!`); fetchActiveData(); }
      else alert(`Failed: ${res.status} - ${await res.text()}`);
    } catch (err: any) { alert(`Error: ${err.message}`); }
  };

  const handleSelectUserToModify = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setModifyUserId(id);
    if (!id) return;
    const u = users.find(x => x.id === id);
    if (u) {
      setModEmail(u.email || ''); setModName(u.name || '');
      setModRole(u.role || 'SUPERADMIN'); setModIcNumber(u.icNumber || '');
      setModPassword('');
      const spl = extractIdSplit(u.studentId);
      setModStudentIdPrefix(spl.prefix); setModStudentIdBase(spl.base);
    }
  };

  const submitModifyUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modifyUserId) return;
    const finalStudentId = (modRole === 'STUDENT' || modRole === 'CANDIDATE')
      ? (modStudentIdPrefix && modStudentIdBase ? `${modStudentIdPrefix}${modStudentIdBase}` : undefined) : undefined;

    const payload: any = { email: modEmail, name: modName, role: modRole, icNumber: modIcNumber || undefined, studentId: finalStudentId || null };
    if (modPassword.trim() !== '') payload.password = modPassword;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${modifyUserId}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify(payload)
      });
      if (res.ok) { alert(`User Modified!`); fetchActiveData(); }
      else alert(`Failed: ${res.status} - ${await res.text()}`);
    } catch (err: any) { alert(`Error: ${err.message}`); }
  };

  const deleteUser = async () => {
    if (!modifyUserId) return;
    if (!confirm("Delete user completely?")) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${modifyUserId}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) { alert("User deleted"); setModifyUserId(''); fetchActiveData(); }
      else alert(`Failed: ${await res.text()}`);
    } catch (err: any) { alert(`Error: ${err.message}`); }
  }

  const submitCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ code: courseCode, studentPrefix: courseStudentPrefix, name: courseName })
      });
      if (res.ok) { alert(`Course Created!`); fetchActiveData(); }
      else alert(`Failed: ${res.status} - ${await res.text()}`);
    } catch (err: any) { alert(`Error: ${err.message}`); }
  };

  const deleteCourse = async (id: string) => {
    if (!confirm("Delete course completely?")) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/${id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) fetchActiveData();
      else alert(`Failed: ${await res.text()}`);
    } catch (err: any) { alert(`Error: ${err.message}`); }
  };

  // ==============================
  // CANDIDATES & MATERIALS LOGIC
  // ==============================
  const submitRegisterCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/candidates`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ userId: regUserId, electionId: regElectionId, information: regInfo || undefined, profilePicture: regProfilePic || undefined, spotlightBanner: regBanner || undefined })
      });
      if (res.ok) { alert(`Candidate Registered!`); fetchActiveData(); }
      else alert(`Failed: ${res.status} - ${await res.text()}`);
    } catch (err: any) { alert(`Error: ${err.message}`); }
  };

  const submitAddMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matCandidateId) return;
    
    // Build payload according to material type
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

  const submitQualification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qualCandidateId) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/candidates/${qualCandidateId}/qualification`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ positions: qualPositions, cgpa: qualCgpa, justification: qualJustification })
      });
      if (res.ok) { 
        alert(`Qualifications Updated!`); 
        fetchActiveData(); 
        setQualPositions(['']);
        setQualCgpa('');
        setQualJustification('');
      }
      else alert(`Failed: ${res.status} - ${await res.text()}`);
    } catch (err: any) { alert(`Error: ${err.message}`); }
  };

  // ==============================
  // CANDIDATE MODIFY & DELETE LOGIC
  // ==============================
  const handleSelectCandidateToModify = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setModCandidateId(id);
    if (!id) return;
    const c = candidates.find((x: any) => x.id === id);
    if (c) {
      setModCandidateInfo(c.information || '');
      setModCandidateProfilePic(c.profilePicture || '');
      setModCandidateBanner(c.spotlightBanner || '');
      setModCandidateStatus(c.status || 'PENDING');
    }
  };

  const submitModifyCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modCandidateId) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/candidates/${modCandidateId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          information: modCandidateInfo || undefined,
          profilePicture: modCandidateProfilePic || undefined,
          spotlightBanner: modCandidateBanner || undefined,
          status: modCandidateStatus
        })
      });
      if (res.ok) { alert('Candidate Updated!'); fetchActiveData(); }
      else alert(`Failed: ${res.status} - ${await res.text()}`);
    } catch (err: any) { alert(`Error: ${err.message}`); }
  };

  const deleteCandidateById = async (id: string) => {
    if (!confirm('Delete candidate completely? This will cascade and delete all materials!')) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/candidates/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) { alert('Candidate Deleted'); fetchActiveData(); }
      else alert(`Failed: ${res.status} - ${await res.text()}`);
    } catch (err: any) { alert(`Error: ${err.message}`); }
  };

  const deleteQualificationById = async (id: string) => {
    if (!confirm('Delete qualification for this candidate?')) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/candidates/${id}/qualification`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) { alert('Qualification Deleted'); fetchActiveData(); }
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

  const bulkDeleteMaterials = async (candidateId: string, type: string) => {
    if (!confirm(`Delete ALL ${type} materials for this candidate?`)) return;
    const candidate = candidates.find((c: any) => c.id === candidateId);
    const items = candidate?.[type] || [];
    if (items.length === 0) { alert(`No ${type} materials to delete.`); return; }
    for (const item of items) {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/candidates/${candidateId}/materials/${type}/${item.id}`,
        { method: 'DELETE', credentials: 'include' }
      );
    }
    alert(`Deleted all ${type} materials`);
    fetchActiveData();
  };

  const submitImpersonate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!impersonateUserId) return;
    const targetUser = users.find(u => u.id === impersonateUserId);
    if (!targetUser) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/impersonate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ targetUserId: impersonateUserId })
      });
      if (res.ok) {
        alert('Impersonation successful!');
        let targetRolePath = targetUser.role.toLowerCase();
        if (targetUser.role === 'SUPER_ADMIN') targetRolePath = 'superadmin';
        if (targetUser.role === 'MPP_ADVISOR') targetRolePath = 'advisor';
        router.push(`/dashboard/${targetRolePath}`);
      } else {
        alert(`Failed: ${res.status} - ${await res.text()}`);
      }
    } catch (err: any) { alert(`Error: ${err.message}`); }
  };

  // Common input styling
  const inputStyle = { padding: '0.5rem', border: '1px solid #ccc' };
  const btnStyle = { padding: '0.5rem', marginTop: '0.5rem', background: '#000', color: '#fff', cursor: 'pointer', border: 'none' };
  const delBtnStyle = { ...btnStyle, background: '#dc2626' };
  const formStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: '400px', marginBottom: '2rem' };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#ffffff', color: '#000000', fontFamily: 'sans-serif' }}>
      <aside style={{ width: '250px', backgroundColor: '#111827', color: '#fff', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: '100vh' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', borderBottom: '1px solid #374151', paddingBottom: '0.5rem' }}>Tracer Bullet</h2>
        <button onClick={() => setActiveRoleTab('SUPERADMIN')} style={{ padding: '0.75rem', textAlign: 'left', background: activeRoleTab === 'SUPERADMIN' ? '#374151' : 'transparent', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>Super Admin / System</button>
        <button onClick={() => setActiveRoleTab('ADMIN')} style={{ padding: '0.75rem', textAlign: 'left', background: activeRoleTab === 'ADMIN' ? '#374151' : 'transparent', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>Admin (Election Ops)</button>
        <button onClick={() => setActiveRoleTab('ADVISOR')} style={{ padding: '0.75rem', textAlign: 'left', background: activeRoleTab === 'ADVISOR' ? '#374151' : 'transparent', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>MPP Advisor</button>
        <button onClick={() => setActiveRoleTab('CANDIDATE')} style={{ padding: '0.75rem', textAlign: 'left', background: activeRoleTab === 'CANDIDATE' ? '#374151' : 'transparent', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>Candidate</button>
      </aside>

      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
        {activeRoleTab === 'SUPERADMIN' && (
          <div>
            <h1>Super Admin System Operations</h1>

            <div style={{ marginTop: '2rem' }}>
              <h2>4. Users Database</h2>
              <form onSubmit={submitCreateUser} style={formStyle}>
                <label>Create System User</label>
                <input type="text" value={userName} onChange={e => setUserName(e.target.value)} placeholder="Name" required style={inputStyle} />
                <input type="email" value={userEmail} onChange={e => setUserEmail(e.target.value)} placeholder="Email" required style={inputStyle} />
                <input type="password" value={userPassword} onChange={e => setUserPassword(e.target.value)} placeholder="Password" required style={inputStyle} />
                <select value={userRole} onChange={e => setUserRole(e.target.value)} required style={inputStyle}>
                  <option value="SUPERADMIN">SUPERADMIN</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="MPP_ADVISOR">MPP_ADVISOR</option>
                  <option value="STUDENT">STUDENT</option>
                  <option value="CANDIDATE">CANDIDATE</option>
                </select>
                <input type="text" value={userIcNumber} onChange={e => setUserIcNumber(e.target.value)} placeholder="IC Number (Optional)" style={inputStyle} />

                {(userRole === 'STUDENT' || userRole === 'CANDIDATE') && (
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <select value={userStudentIdPrefix} onChange={e => setUserStudentIdPrefix(e.target.value)} style={{ ...inputStyle, flex: 1 }}>
                      <option value="">-- Course Prefix --</option>
                      {courses.map(c => <option key={c.id} value={c.studentPrefix}>{c.studentPrefix}</option>)}
                    </select>
                    <span style={{ fontWeight: 'bold', minWidth: '40px' }}>{userStudentIdPrefix}</span>
                    <input type="text" value={userStudentIdBase} onChange={e => setUserStudentIdBase(e.target.value)} placeholder="e.g. 2311-014" style={{ ...inputStyle, flex: 2 }} />
                  </div>
                )}
                <button type="submit" style={btnStyle}>Submit POST /users</button>
              </form>

              <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem', width: '400px' }}>
                <input 
                  type="text" 
                  placeholder="Search name or email..." 
                  value={userSearchQuery} 
                  onChange={e => setUserSearchQuery(e.target.value)} 
                  style={{ ...inputStyle, flex: 1 }} 
                />
                <select value={userRoleFilter} onChange={e => setUserRoleFilter(e.target.value)} style={inputStyle}>
                  <option value="">All Roles</option>
                  <option value="SUPERADMIN">SUPERADMIN</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="MPP_ADVISOR">MPP_ADVISOR</option>
                  <option value="STUDENT">STUDENT</option>
                  <option value="CANDIDATE">CANDIDATE</option>
                </select>
              </div>

              <select value={modifyUserId} onChange={handleSelectUserToModify} style={{ ...inputStyle, width: '400px', marginBottom: '1rem' }}>
                <option value="">-- Modify Existing User --</option>
                {filteredUsers.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.email}) - {u.role}</option>
                ))}
              </select>

              {modifyUserId && (
                <form onSubmit={submitModifyUser} style={formStyle}>
                  <input type="text" value={modName} onChange={e => setModName(e.target.value)} placeholder="Name" required style={inputStyle} />
                  <input type="email" value={modEmail} onChange={e => setModEmail(e.target.value)} placeholder="Email" required style={inputStyle} />
                  <input type="password" value={modPassword} onChange={e => setModPassword(e.target.value)} placeholder="Leave blank to preserve password" style={inputStyle} />

                  <select value={modRole} onChange={e => setModRole(e.target.value)} required style={inputStyle}>
                    <option value="SUPERADMIN">SUPERADMIN</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="MPP_ADVISOR">MPP_ADVISOR</option>
                    <option value="STUDENT">STUDENT</option>
                    <option value="CANDIDATE">CANDIDATE</option>
                  </select>

                  <input type="text" value={modIcNumber} onChange={e => setModIcNumber(e.target.value)} placeholder="IC Number" style={inputStyle} />

                  {(modRole === 'STUDENT' || modRole === 'CANDIDATE') && (
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <select value={modStudentIdPrefix} onChange={e => setModStudentIdPrefix(e.target.value)} style={{ ...inputStyle, flex: 1 }}>
                        <option value="">-- Course Prefix --</option>
                        {courses.map(c => <option key={c.id} value={c.studentPrefix}>{c.studentPrefix}</option>)}
                      </select>
                      <span style={{ fontWeight: 'bold', minWidth: '40px' }}>{modStudentIdPrefix}</span>
                      <input type="text" value={modStudentIdBase} onChange={e => setModStudentIdBase(e.target.value)} placeholder="e.g. 2311-014" style={{ ...inputStyle, flex: 2 }} />
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button type="submit" style={{ ...btnStyle, flex: 1 }}>Submit PATCH /users/:id</button>
                    <button type="button" onClick={deleteUser} style={{ ...delBtnStyle, flex: 1 }}>Delete User</button>
                  </div>
                </form>
              )}
            </div>

            <div style={{ marginTop: '2rem' }}>
              <h2>3. Course Dictionary</h2>
              <ul style={{ marginBottom: '1rem' }}>
                {courses.map(c => (
                  <li key={c.id}>
                    <strong>{c.code}</strong> - {c.name} <button type="button" onClick={() => deleteCourse(c.id)} style={{ color: 'red', marginLeft: '1rem', background: 'none', border: 'none', cursor: 'pointer' }}>✖</button>
                  </li>
                ))}
              </ul>
              <form onSubmit={submitCourse} style={formStyle}>
                <label>Add New Course</label>
                <input type="text" value={courseCode} onChange={e => setCourseCode(e.target.value)} placeholder="Code (e.g. DCS)" required style={inputStyle} />
                <input type="text" value={courseStudentPrefix} onChange={e => setCourseStudentPrefix(e.target.value)} placeholder="Student ID Prefix (e.g. BCS)" required style={inputStyle} />
                <input type="text" value={courseName} onChange={e => setCourseName(e.target.value)} placeholder="Name" required style={inputStyle} />
                <button type="submit" style={btnStyle}>Submit POST /courses</button>
              </form>
            </div>

            <div style={{ marginTop: '2rem' }}>
              <h2>6. Impersonate User</h2>
              <form onSubmit={submitImpersonate} style={formStyle}>
                <select value={impersonateUserId} onChange={e => setImpersonateUserId(e.target.value)} required style={{ ...inputStyle, width: '400px' }}>
                  <option value="">-- Select User to Impersonate --</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                  ))}
                </select>
                <button type="submit" style={{ ...btnStyle, background: '#4f46e5' }}>Impersonate</button>
              </form>
            </div>
          </div>
        )}

        {activeRoleTab === 'ADMIN' && (
          <div>
            <h1>Admin (Election Ops)</h1>

            <div style={{ marginTop: '2rem' }}>
              <h2>1. Elections</h2>
              <ul style={{ marginBottom: '1rem' }}>
                {elections.map(el => (
                  <li key={el.id} style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span><strong>{el.title}</strong> ({el.id}) - <span style={{ fontWeight: 'bold', color: el.status === 'DRAFT' ? '#ca8a04' : '#16a34a' }}>{el.status}</span></span>
                    
                    <button 
                      type="button" 
                      onClick={() => toggleElectionStatus(el.id, el.status)} 
                      style={{ 
                        padding: '0.25rem 0.5rem', 
                        background: el.status === 'DRAFT' ? '#16a34a' : '#ca8a04', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}>
                      {el.status === 'DRAFT' ? 'Publish' : 'Set to Draft'}
                    </button>

                    <button type="button" onClick={() => deleteElection(el.id)} style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer' }}>✖</button>
                  </li>
                ))}
              </ul>

              <form onSubmit={submitElection} style={formStyle}>
                <label>Create New Election</label>
                <input type="text" value={electionTitle} onChange={e => setElectionTitle(e.target.value)} placeholder="Title" required style={inputStyle} />
                
                <div style={{ padding: '1rem', border: '1px solid #ccc', borderRadius: '4px' }}>
                  <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Course Capacities (Chairs)</p>
                  {courses.map(c => (
                    <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, cursor: 'pointer' }}>
                        <input 
                          type="checkbox" 
                          checked={electionCourseConfig[c.studentPrefix]?.enabled || false}
                          onChange={e => setElectionCourseConfig(prev => ({
                            ...prev,
                            [c.studentPrefix]: { ...prev[c.studentPrefix], enabled: e.target.checked }
                          }))}
                        />
                        {c.code} ({c.studentPrefix})
                      </label>
                      {electionCourseConfig[c.studentPrefix]?.enabled && (
                        <input 
                          type="number" 
                          min="1"
                          value={electionCourseConfig[c.studentPrefix]?.chairs || 1}
                          onChange={e => setElectionCourseConfig(prev => ({
                            ...prev,
                            [c.studentPrefix]: { ...prev[c.studentPrefix], chairs: parseInt(e.target.value) || 1 }
                          }))}
                          style={{ width: '80px', padding: '0.25rem' }}
                        />
                      )}
                    </div>
                  ))}
                </div>

                <button type="submit" style={btnStyle}>Submit POST /elections</button>
              </form>

              <select value={modElectionId} onChange={handleSelectElection} style={{ ...inputStyle, width: '400px', marginBottom: '1rem' }}>
                <option value="">-- Modify Existing Election --</option>
                {elections.map(el => <option key={el.id} value={el.id}>{el.title}</option>)}
              </select>

              {modElectionId && (
                <form onSubmit={submitModifyElection} style={formStyle}>
                  <input type="text" value={modElectionTitle} onChange={e => setModElectionTitle(e.target.value)} placeholder="Title" required style={inputStyle} />
                  
                  <div style={{ padding: '1rem', border: '1px solid #ccc', borderRadius: '4px' }}>
                    <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Course Capacities (Chairs)</p>
                    {courses.map(c => (
                      <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, cursor: 'pointer' }}>
                          <input 
                            type="checkbox" 
                            checked={modElectionCourseConfig[c.studentPrefix]?.enabled || false}
                            onChange={e => setModElectionCourseConfig(prev => ({
                              ...prev,
                              [c.studentPrefix]: { ...prev[c.studentPrefix], enabled: e.target.checked }
                            }))}
                          />
                          {c.code} ({c.studentPrefix})
                        </label>
                        {modElectionCourseConfig[c.studentPrefix]?.enabled && (
                          <input 
                            type="number" 
                            min="1"
                            value={modElectionCourseConfig[c.studentPrefix]?.chairs || 1}
                            onChange={e => setModElectionCourseConfig(prev => ({
                              ...prev,
                              [c.studentPrefix]: { ...prev[c.studentPrefix], chairs: parseInt(e.target.value) || 1 }
                            }))}
                            style={{ width: '80px', padding: '0.25rem' }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <button type="submit" style={btnStyle}>Submit PATCH /elections</button>
                </form>
              )}
            </div>

            <div style={{ marginTop: '2rem' }}>
              <h2>2. Voting Sessions</h2>
              <ul style={{ marginBottom: '1rem' }}>
                {votingSessions.map(vs => (
                  <li key={vs.id}>
                    <strong>{vs.title}</strong> [{courses.find(c => c.id === vs.courseId)?.code || 'N/A'}]
                    <button type="button" onClick={() => deleteVotingSession(vs.id)} style={{ color: 'red', marginLeft: '1rem', background: 'none', border: 'none', cursor: 'pointer' }}>✖</button>
                  </li>
                ))}
              </ul>

              <form onSubmit={submitVotingSession} style={formStyle}>
                <label>Create Voting Session</label>
                <select value={vsElectionId} onChange={e => setVsElectionId(e.target.value)} required style={inputStyle}>
                  <option value="">-- Select Election --</option>
                  {elections.map(e => <option key={e.id} value={e.id}>{e.title || "Election"} ({e.id})</option>)}
                </select>

                <select value={vsCourseId} onChange={e => setVsCourseId(e.target.value)} required style={inputStyle}>
                  <option value="">-- Select Course --</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}
                </select>

                <input type="text" value={vsTitle} onChange={e => setVsTitle(e.target.value)} placeholder="Session Title (e.g. Session 1 DCS)" required style={inputStyle} />
                <input type="datetime-local" value={vsStartTime} onChange={e => setVsStartTime(e.target.value)} required style={inputStyle} />
                <input type="datetime-local" value={vsEndTime} onChange={e => setVsEndTime(e.target.value)} required style={inputStyle} />

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span style={{ fontWeight: 'bold', minWidth: '40px' }}>{courses.find(c => c.id === vsCourseId)?.studentPrefix || '---'}</span>
                  <input type="text" value={vsStudentIdStartBase} onChange={e => setVsStudentIdStartBase(e.target.value)} placeholder="Start Range (e.g. 2311-001)" style={{ ...inputStyle, flex: 2 }} />
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span style={{ fontWeight: 'bold', minWidth: '40px' }}>{courses.find(c => c.id === vsCourseId)?.studentPrefix || '---'}</span>
                  <input type="text" value={vsStudentIdEndBase} onChange={e => setVsStudentIdEndBase(e.target.value)} placeholder="End Range (e.g. 2311-100)" style={{ ...inputStyle, flex: 2 }} />
                </div>

                <button type="submit" style={btnStyle}>Submit POST /voting-sessions</button>
              </form>

              <select value={modVsId} onChange={handleSelectVotingSession} style={{ ...inputStyle, width: '400px', marginBottom: '1rem' }}>
                <option value="">-- Modify Existing Voting Session --</option>
                {votingSessions.map(vs => <option key={vs.id} value={vs.id}>{vs.title}</option>)}
              </select>

              {modVsId && (
                <form onSubmit={submitModifyVotingSession} style={formStyle}>
                  <select value={modVsElectionId} onChange={e => setModVsElectionId(e.target.value)} required style={inputStyle}>
                    <option value="">-- Select Election --</option>
                    {elections.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
                  </select>
                  <select value={modVsCourseId} onChange={e => setModVsCourseId(e.target.value)} required style={inputStyle}>
                    <option value="">-- Select Course --</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}
                  </select>
                  <input type="text" value={modVsTitle} onChange={e => setModVsTitle(e.target.value)} placeholder="Session Title" required style={inputStyle} />
                  <input type="datetime-local" value={modVsStartTime} onChange={e => setModVsStartTime(e.target.value)} required style={inputStyle} />
                  <input type="datetime-local" value={modVsEndTime} onChange={e => setModVsEndTime(e.target.value)} required style={inputStyle} />

                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{ fontWeight: 'bold', minWidth: '40px' }}>{courses.find(c => c.id === modVsCourseId)?.studentPrefix || '---'}</span>
                    <input type="text" value={modVsStudentIdStartBase} onChange={e => setModVsStudentIdStartBase(e.target.value)} placeholder="Start Range" style={{ ...inputStyle, flex: 2 }} />
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{ fontWeight: 'bold', minWidth: '40px' }}>{courses.find(c => c.id === modVsCourseId)?.studentPrefix || '---'}</span>
                    <input type="text" value={modVsStudentIdEndBase} onChange={e => setModVsStudentIdEndBase(e.target.value)} placeholder="End Range" style={{ ...inputStyle, flex: 2 }} />
                  </div>

                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button type="submit" style={{ ...btnStyle, flex: 1 }}>Submit PATCH /voting-sessions</button>
                    <button type="button" onClick={() => deleteVotingSession(modVsId, true)} style={{ ...delBtnStyle, flex: 1 }}>Delete Session</button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {activeRoleTab === 'ADVISOR' && (
          <div>
            <h1>Candidate Management</h1>
            <div style={{ marginTop: '2rem' }}>
              <h2>5. Manage Candidates</h2>
              <ul style={{ marginBottom: '1rem' }}>
                {candidates.map(c => (
                  <li key={c.id}>
                    <strong>{c.user?.name}</strong> - {c.election?.title} ({c.status})
                  </li>
                ))}
              </ul>
            </div>

            <div style={{ marginTop: '2rem' }}>
              <h3>Candidate Oversight & Review</h3>
              <select 
                value={advisorViewCandidateId} 
                onChange={e => setAdvisorViewCandidateId(e.target.value)} 
                style={{ ...inputStyle, marginBottom: '1rem' }}
              >
                <option value="ALL">-- View All Candidates --</option>
                {candidates.map(c => (
                  <option key={c.id} value={c.id}>{c.user?.name} ({c.election?.title})</option>
                ))}
              </select>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {displayedCandidates.map((c: any) => (
                  <div key={c.id} style={{ border: '1px solid #ccc', padding: '1.5rem', borderRadius: '8px' }}>
                    <h4 style={{ margin: '0 0 1rem 0', paddingBottom: '0.5rem', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{c.user?.name} <span style={{ fontWeight: 'normal', color: '#666' }}>— {c.election?.title} ({c.status})</span></span>
                      <button type="button" onClick={() => deleteCandidateById(c.id)} style={{ padding: '0.25rem 0.5rem', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8em' }}>[Delete Candidate]</button>
                    </h4>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                      <div>
                        <strong>Profile Assets</strong>
                        <p style={{ margin: '0.25rem 0', fontSize: '0.9em' }}>Picture: {c.profilePicture ? <a href={c.profilePicture} target="_blank" rel="noreferrer">View Image</a> : 'Not provided'}</p>
                        <p style={{ margin: '0.25rem 0', fontSize: '0.9em' }}>Banner: {c.spotlightBanner ? <a href={c.spotlightBanner} target="_blank" rel="noreferrer">View Banner</a> : 'Not provided'}</p>
                        <p style={{ margin: '0.25rem 0', fontSize: '0.9em' }}>Info: {c.information || 'Not provided'}</p>
                      </div>
                      <div>
                        <strong style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          Qualifications
                          {c.qualification && (
                            <button type="button" onClick={() => deleteQualificationById(c.id)} style={{ padding: '0.125rem 0.25rem', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '2px', cursor: 'pointer', fontSize: '0.7em' }}>Delete</button>
                          )}
                        </strong>
                        {c.qualification ? (
                          <>
                            <p style={{ margin: '0.25rem 0', fontSize: '0.9em' }}><strong>Positions:</strong> {c.qualification.position.join(', ')}</p>
                            <p style={{ margin: '0.25rem 0', fontSize: '0.9em' }}><strong>CGPA:</strong> {c.qualification.cgpa}</p>
                            <p style={{ margin: '0.25rem 0', fontSize: '0.9em' }}><strong>Justification:</strong> {c.qualification.justification}</p>
                          </>
                        ) : (
                          <p style={{ color: '#dc2626', margin: '0.25rem 0', fontSize: '0.9em' }}>No qualifications added.</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <strong style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        Manifestos
                        {c.manifestos && c.manifestos.length > 0 && (
                          <button type="button" onClick={() => bulkDeleteMaterials(c.id, 'manifestos')} style={{ padding: '0.125rem 0.25rem', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '2px', cursor: 'pointer', fontSize: '0.7em' }}>Delete All</button>
                        )}
                      </strong>
                      {c.manifestos && c.manifestos.length > 0 ? (
                        <ul style={{ paddingLeft: '1rem', marginTop: 0, fontSize: '0.9em' }}>
                          {c.manifestos.map((m: any) => (
                            <li key={m.id} style={{ marginBottom: '0.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span><strong>{m.title}</strong>: {m.description}</span>
                              <button type="button" onClick={() => deleteMaterialItem(c.id, 'manifesto', m.id)} style={{ padding: '0.125rem 0.25rem', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '2px', cursor: 'pointer', fontSize: '0.7em', marginLeft: '0.5rem' }}>X</button>
                            </li>
                          ))}
                        </ul>
                      ) : <p style={{ margin: '0 0 1rem 0', fontSize: '0.9em' }}>Manifesto doesn't exist.</p>}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #eee' }}>
                      <div>
                        <strong style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          Videos
                          {c.videos && c.videos.length > 0 && (
                            <button type="button" onClick={() => bulkDeleteMaterials(c.id, 'videos')} style={{ padding: '0.125rem 0.25rem', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '2px', cursor: 'pointer', fontSize: '0.7em' }}>Delete All</button>
                          )}
                        </strong>
                        {c.videos && c.videos.length > 0 ? (
                          <ul style={{ paddingLeft: '1rem', margin: '0.25rem 0', fontSize: '0.9em' }}>
                            {c.videos.map((v: any) => (
                              <li key={v.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                                <a href={v.videoLink} target="_blank" rel="noreferrer">{v.videoTitle}</a>
                                <button type="button" onClick={() => deleteMaterialItem(c.id, 'video', v.id)} style={{ padding: '0.125rem 0.25rem', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '2px', cursor: 'pointer', fontSize: '0.7em', marginLeft: '0.5rem' }}>X</button>
                              </li>
                            ))}
                          </ul>
                        ) : <p style={{ fontSize: '0.9em', color: '#666', margin: '0.25rem 0' }}>Doesn't exist.</p>}
                      </div>
                      <div>
                        <strong style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          Posters
                          {c.posters && c.posters.length > 0 && (
                            <button type="button" onClick={() => bulkDeleteMaterials(c.id, 'posters')} style={{ padding: '0.125rem 0.25rem', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '2px', cursor: 'pointer', fontSize: '0.7em' }}>Delete All</button>
                          )}
                        </strong>
                        {c.posters && c.posters.length > 0 ? (
                          <ul style={{ paddingLeft: '1rem', margin: '0.25rem 0', fontSize: '0.9em' }}>
                            {c.posters.map((p: any) => (
                              <li key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                                <a href={p.posterLink} target="_blank" rel="noreferrer">View Poster</a>
                                <button type="button" onClick={() => deleteMaterialItem(c.id, 'poster', p.id)} style={{ padding: '0.125rem 0.25rem', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '2px', cursor: 'pointer', fontSize: '0.7em', marginLeft: '0.5rem' }}>X</button>
                              </li>
                            ))}
                          </ul>
                        ) : <p style={{ fontSize: '0.9em', color: '#666', margin: '0.25rem 0' }}>Doesn't exist.</p>}
                      </div>
                      <div>
                        <strong style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          Slides
                          {c.slides && c.slides.length > 0 && (
                            <button type="button" onClick={() => bulkDeleteMaterials(c.id, 'slides')} style={{ padding: '0.125rem 0.25rem', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '2px', cursor: 'pointer', fontSize: '0.7em' }}>Delete All</button>
                          )}
                        </strong>
                        {c.slides && c.slides.length > 0 ? (
                          <ul style={{ paddingLeft: '1rem', margin: '0.25rem 0', fontSize: '0.9em' }}>
                            {c.slides.map((s: any) => (
                              <li key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                                <a href={s.slideLink} target="_blank" rel="noreferrer">{s.slideTitle}</a>
                                <button type="button" onClick={() => deleteMaterialItem(c.id, 'slide', s.id)} style={{ padding: '0.125rem 0.25rem', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '2px', cursor: 'pointer', fontSize: '0.7em', marginLeft: '0.5rem' }}>X</button>
                              </li>
                            ))}
                          </ul>
                        ) : <p style={{ fontSize: '0.9em', color: '#666', margin: '0.25rem 0' }}>Doesn't exist.</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: '2rem' }}>
              <h3>Register Candidate</h3>
              <form onSubmit={submitRegisterCandidate} style={formStyle}>
                <select value={regElectionId} onChange={e => setRegElectionId(e.target.value)} required style={inputStyle}>
                  <option value="">-- Select Election --</option>
                  {elections.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
                </select>
                <select value={regUserId} onChange={e => setRegUserId(e.target.value)} required style={inputStyle}>
                  <option value="">-- Select CANDIDATE User --</option>
                  {users.filter(u => u.role === 'CANDIDATE').map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                  ))}
                </select>
                <textarea rows={3} value={regInfo} onChange={e => setRegInfo(e.target.value)} placeholder="Information (Optional)" style={inputStyle} />
                <input type="url" value={regProfilePic} onChange={e => setRegProfilePic(e.target.value)} placeholder="Profile Picture URL (Optional)" style={inputStyle} />
                <input type="url" value={regBanner} onChange={e => setRegBanner(e.target.value)} placeholder="Spotlight Banner URL (Optional)" style={inputStyle} />
                <button type="submit" style={btnStyle}>Submit POST /candidates</button>
              </form>
            </div>

            <div style={{ marginTop: '2rem' }}>
              <h3 style={{ marginTop: '2rem' }}>Update Candidate Qualification</h3>
              <form onSubmit={submitQualification} style={formStyle}>
                <select value={qualCandidateId} onChange={e => setQualCandidateId(e.target.value)} required style={inputStyle}>
                  <option value="">-- Select Candidate --</option>
                  {candidates.map(c => (
                    <option key={c.id} value={c.id}>{c.user?.name} ({c.election?.title})</option>
                  ))}
                </select>
                {qualPositions.map((q, i) => (
                  <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', marginBottom: '1rem', border: '1px solid #ccc', padding: '1rem' }}>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <input type="text" value={q} onChange={e => { const n = [...qualPositions]; n[i] = e.target.value; setQualPositions(n); }} placeholder="Position (e.g. Presidential Chair)" required style={inputStyle} />
                    </div>
                    {qualPositions.length > 1 && (
                      <button type="button" onClick={() => { const n = [...qualPositions]; n.splice(i, 1); setQualPositions(n); }} style={{ padding: '0.5rem', background: '#dc2626', color: '#fff', border: 'none', cursor: 'pointer' }}>[-] Remove</button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={() => setQualPositions([...qualPositions, ''])} style={{ padding: '0.5rem', background: '#16a34a', color: '#fff', border: 'none', cursor: 'pointer', alignSelf: 'flex-start' }}>[+] Add Position</button>
                <input type="text" value={qualCgpa} onChange={e => setQualCgpa(e.target.value)} placeholder="CGPA (e.g. 3.85)" required style={{...inputStyle, marginTop: '1rem'}} />
                <textarea rows={4} value={qualJustification} onChange={e => setQualJustification(e.target.value)} placeholder="Justification..." required style={inputStyle} />
                <button type="submit" style={btnStyle}>Submit POST /candidates/:id/qualification</button>
              </form>
            </div>

            <div style={{ marginTop: '2rem' }}>
              <h3 style={{ marginTop: '2rem' }}>Modify Candidate</h3>
              <select value={modCandidateId} onChange={handleSelectCandidateToModify} style={{ ...inputStyle, width: '400px', marginBottom: '1rem' }}>
                <option value="">-- Select Candidate to Modify --</option>
                {candidates.map(c => (
                  <option key={c.id} value={c.id}>{c.user?.name} ({c.election?.title})</option>
                ))}
              </select>

              {modCandidateId && (
                <form onSubmit={submitModifyCandidate} style={formStyle}>
                  <input type="text" value={modCandidateInfo} onChange={e => setModCandidateInfo(e.target.value)} placeholder="Information" style={inputStyle} />
                  <input type="url" value={modCandidateProfilePic} onChange={e => setModCandidateProfilePic(e.target.value)} placeholder="Profile Picture URL" style={inputStyle} />
                  <input type="url" value={modCandidateBanner} onChange={e => setModCandidateBanner(e.target.value)} placeholder="Spotlight Banner URL" style={inputStyle} />
                  <select value={modCandidateStatus} onChange={e => setModCandidateStatus(e.target.value)} required style={inputStyle}>
                    <option value="PENDING">PENDING</option>
                    <option value="APPROVED">APPROVED</option>
                    <option value="REJECTED">REJECTED</option>
                  </select>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button type="submit" style={btnStyle}>Submit PATCH /candidates/:id</button>
                    <button type="button" onClick={() => deleteCandidateById(modCandidateId)} style={{ ...delBtnStyle, flex: 1 }}>Delete Candidate</button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {activeRoleTab === 'CANDIDATE' && (
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
          </div>
        )}
      </main>
    </div>
  );
}