'use client';

import React, { useState } from 'react';
import { Users, CheckCircle, XCircle, Clock, X, UserPlus, Loader2 } from 'lucide-react';

interface CandidateApprovalProps {
  candidates: any[];
  elections: any[];
  onRefresh: () => void;
}

function RegisterCandidateModal({ elections, onClose, onRefresh }: { elections: any[]; onClose: () => void; onRefresh: () => void }) {
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [icNumber, setIcNumber] = useState('');
  const [coursePrefix, setCoursePrefix] = useState('');
  const [electionId, setElectionId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const selectedElection = elections.find((e: any) => e.id === electionId);
  const courseKeys = selectedElection?.courseSettings ? Object.keys(selectedElection.courseSettings) : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !studentId || !icNumber || !coursePrefix || !electionId) {
      setError('All fields are required.'); return;
    }
    setError(''); setSubmitting(true);
    try {
      const email = `${studentId.toLowerCase().replace(/[^a-z0-9]/g, '')}@student.edu.my`;
      const userRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ name, email, studentId, icNumber, coursePrefix, role: 'CANDIDATE' })
      });
      if (!userRes.ok) { const err = await userRes.json().catch(() => ({})); setError(err.message || 'Failed to create user'); setSubmitting(false); return; }
      const newUser = await userRes.json();
      const regRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/voter-registrations/import`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ electionId, voters: [{ name, email, studentId, icNumber, course: coursePrefix }] })
      });
      if (!regRes.ok) { setError('User created but voter registration failed.'); setSubmitting(false); return; }
      const candidateRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/candidates`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ userId: newUser.id, electionId })
      });
      if (!candidateRes.ok) { setError('User created but candidate registration failed.'); setSubmitting(false); return; }
      let codeMsg = '';
      if (selectedElection?.requireSecurityCode) {
        const codeRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${newUser.id}/security-code`, { method: 'POST', credentials: 'include' });
        if (codeRes.ok) { const codeData = await codeRes.json(); codeMsg = `\n\nSecurity Code: ${codeData.securityCode}\nShare this with the candidate.`; }
      }
      alert(`Candidate "${name}" registered successfully.${codeMsg}`);
      onRefresh(); onClose();
    } catch (err: any) { setError(`Error: ${err.message}`); }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white border border-slate-200 border-t-[4px] border-t-[#c5a021] shadow-2xl rounded-sm max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <UserPlus size={18} className="text-[#c5a021]" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">Register Candidate</h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-sm transition"><X size={18} className="text-slate-400" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && <div className="bg-red-50 border border-red-200 rounded-sm p-3 text-red-700 text-xs font-bold uppercase tracking-widest">{error}</div>}
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Student Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., John Doe"
              className="w-full bg-slate-50 border border-slate-200 rounded-sm px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#c5a021] transition-colors placeholder:text-slate-400" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Student ID</label>
            <input type="text" value={studentId} onChange={(e) => setStudentId(e.target.value)} placeholder="e.g., BCS2311-001"
              className="w-full bg-slate-50 border border-slate-200 rounded-sm px-3 py-2 text-sm text-slate-900 uppercase outline-none focus:border-[#c5a021] transition-colors placeholder:text-slate-400 font-mono" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">IC Number</label>
            <input type="text" value={icNumber} onChange={(e) => setIcNumber(e.target.value)} placeholder="e.g., 010101-01-0001"
              className="w-full bg-slate-50 border border-slate-200 rounded-sm px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#c5a021] transition-colors placeholder:text-slate-400" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Election</label>
            <select value={electionId} onChange={(e) => { setElectionId(e.target.value); setCoursePrefix(''); }}
              className="w-full bg-slate-50 border border-slate-200 rounded-sm px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#c5a021] transition-colors">
              <option value="">Select election...</option>
              {elections.map((e: any) => <option key={e.id} value={e.id}>{e.title}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Course</label>
            <select value={coursePrefix} onChange={(e) => setCoursePrefix(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-sm px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#c5a021] transition-colors"
              disabled={!electionId}>
              <option value="">Select course...</option>
              {courseKeys.map((c: string) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <button type="submit" disabled={submitting}
            className="w-full bg-[#c5a021] hover:bg-yellow-400 text-black py-3 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-50">
            {submitting ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
            {submitting ? 'Registering...' : 'Register Candidate'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function CandidateApproval({ candidates, elections, onRefresh }: CandidateApprovalProps) {
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  const filteredCandidates = filter === 'ALL' ? candidates : candidates.filter(c => c.status === filter);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/candidates/${id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) { alert(`Candidate ${newStatus.toLowerCase()}!`); onRefresh(); }
      else { alert(`Failed: ${res.status}`); }
    } catch (err: any) { alert(`Error: ${err.message}`); }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED': return <span className="bg-green-100 text-green-700 border border-green-200 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">Approved</span>;
      case 'REJECTED': return <span className="bg-red-100 text-red-600 border border-red-200 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">Rejected</span>;
      case 'PENDING': return <span className="bg-yellow-100 text-yellow-700 border border-yellow-200 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">Pending</span>;
      default: return <span className="bg-slate-100 text-slate-600 border border-slate-200 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">{status}</span>;
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#4c0519]/10 rounded-sm">
            <Users size={16} className="text-[#4c0519]" />
          </div>
          <h3 className="text-base font-bold text-slate-900 uppercase tracking-tight">Candidates</h3>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">({candidates.length})</span>
        </div>
        <div className="flex flex-col md:flex-row gap-2">
          <button onClick={() => setShowRegisterModal(true)}
            className="bg-[#4c0519]/80 hover:bg-[#4c0519] text-white px-4 py-2 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2">
            <UserPlus size={14} /> Register
          </button>
          <div className="flex flex-col md:flex-row gap-1.5">
            {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded text-[9px] font-black uppercase tracking-widest transition ${
                  filter === f ? 'bg-[#c5a021] text-black' : 'bg-[#4c0519]/10 text-[#4c0519] border border-[#4c0519]/20 hover:bg-[#4c0519]/20'
                }`}>
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {filteredCandidates.map(candidate => (
          <div key={candidate.id} className="bg-slate-50 border border-slate-200 rounded-sm p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#4c0519]/10 rounded-full flex items-center justify-center text-[#4c0519] font-bold flex-shrink-0">
                {candidate.user?.name?.[0]?.toUpperCase() || '?'}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">{candidate.user?.name || 'Unknown'}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest">{candidate.user?.email || 'No email'}</p>
                <p className="text-[9px] text-slate-400 mt-0.5">{candidate.election?.title || 'No election'} &bull; {candidate.qualification?.positions?.join(', ') || 'No position'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(candidate.status)}
              {candidate.status === 'PENDING' && (
                <div className="flex gap-1.5">
                  <button onClick={() => handleUpdateStatus(candidate.id, 'APPROVED')}
                    className="bg-green-100 text-green-700 px-3 py-1.5 rounded text-[9px] font-black uppercase tracking-widest hover:bg-green-200 transition flex items-center gap-1">
                    <CheckCircle size={12} /> Approve
                  </button>
                  <button onClick={() => handleUpdateStatus(candidate.id, 'REJECTED')}
                    className="bg-red-100 text-red-600 px-3 py-1.5 rounded text-[9px] font-black uppercase tracking-widest hover:bg-red-200 transition flex items-center gap-1">
                    <XCircle size={12} /> Reject
                  </button>
                </div>
              )}
              {candidate.status !== 'PENDING' && (
                <button onClick={() => handleUpdateStatus(candidate.id, 'PENDING')}
                  className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded text-[9px] font-black uppercase tracking-widest hover:bg-slate-200 transition flex items-center gap-1">
                  <Clock size={12} /> Reset
                </button>
              )}
            </div>
          </div>
        ))}
        {filteredCandidates.length === 0 && (
          <p className="text-slate-400 text-sm italic text-center py-6">No candidates found{filter !== 'ALL' ? ` with status: ${filter}` : ''}.</p>
        )}
      </div>

      {showRegisterModal && (
        <RegisterCandidateModal elections={elections} onClose={() => setShowRegisterModal(false)} onRefresh={onRefresh} />
      )}
    </div>
  );
}
