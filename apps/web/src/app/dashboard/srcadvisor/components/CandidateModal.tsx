'use client';

import React, { useState } from 'react';
import { X, UserPlus, Loader2 } from 'lucide-react';

interface CandidateModalProps {
  elections: any[];
  selectedElectionId: string | null;
  onClose: () => void;
  onRefresh: () => void;
}

export default function CandidateModal({ elections, selectedElectionId, onClose, onRefresh }: CandidateModalProps) {
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [icNumber, setIcNumber] = useState('');
  const [coursePrefix, setCoursePrefix] = useState('');
  const [electionId, setElectionId] = useState(selectedElectionId || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const selectedElection = elections.find((e: any) => e.id === electionId);
  const courseKeys = selectedElection?.courseSettings
    ? Object.keys(selectedElection.courseSettings)
    : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !studentId || !icNumber || !coursePrefix || !electionId) {
      setError('All fields are required.');
      return;
    }
    setError('');
    setSubmitting(true);

    try {
      const email = `${studentId.toLowerCase().replace(/[^a-z0-9]/g, '')}@student.edu.my`;

      const userRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name,
          email,
          studentId,
          icNumber,
          coursePrefix,
          role: 'CANDIDATE',
        }),
      });

      if (!userRes.ok) {
        const err = await userRes.json().catch(() => ({}));
        setError(err.message || 'Failed to create user');
        setSubmitting(false);
        return;
      }

      const newUser = await userRes.json();
      const userId = newUser.id;

      const regRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/voter-registrations/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          electionId,
          voters: [{ name, email, studentId, icNumber, course: coursePrefix }],
        }),
      });

      if (!regRes.ok) {
        setError('User created but voter registration failed.');
        setSubmitting(false);
        return;
      }

      const candidateRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/candidates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId, electionId }),
      });

      if (!candidateRes.ok) {
        setError('User created but candidate registration failed.');
        setSubmitting(false);
        return;
      }

      let codeMsg = '';
      if (selectedElection?.requireSecurityCode) {
        const codeRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/security-code`, {
          method: 'POST',
          credentials: 'include',
        });
        if (codeRes.ok) {
          const codeData = await codeRes.json();
          codeMsg = `\n\nSecurity Code: ${codeData.securityCode}\nShare this with the candidate.`;
        }
      }

      alert(`Candidate "${name}" registered successfully.${codeMsg}`);
      onRefresh();
      onClose();
    } catch (err: any) {
      setError(`Error: ${err.message}`);
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-black/90 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-sm max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <UserPlus size={18} className="text-[#c5a021]" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">Register Candidate</h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-sm transition">
            <X size={18} className="text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-sm p-3 text-red-400 text-xs font-bold uppercase tracking-widest">{error}</div>
          )}

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Student Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              placeholder="e.g., John Doe"
              className="w-full bg-white/5 border border-white/10 rounded-sm px-3 py-2 text-sm text-white outline-none focus:border-[#c5a021] placeholder:text-slate-600" />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Student ID</label>
            <input type="text" value={studentId} onChange={(e) => setStudentId(e.target.value)}
              placeholder="e.g., BCS2311-001"
              className="w-full bg-white/5 border border-white/10 rounded-sm px-3 py-2 text-sm text-white uppercase outline-none focus:border-[#c5a021] placeholder:text-slate-600 font-mono" />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">IC Number</label>
            <input type="text" value={icNumber} onChange={(e) => setIcNumber(e.target.value)}
              placeholder="e.g., 010101-01-0001"
              className="w-full bg-white/5 border border-white/10 rounded-sm px-3 py-2 text-sm text-white outline-none focus:border-[#c5a021] placeholder:text-slate-600" />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Election</label>
            <select value={electionId} onChange={(e) => { setElectionId(e.target.value); setCoursePrefix(''); }}
              className="w-full bg-white/5 border border-white/10 rounded-sm px-3 py-2 text-sm text-white outline-none focus:border-[#c5a021]">
              <option value="" className="bg-slate-800">Select election...</option>
              {elections.map((e: any) => (
                <option key={e.id} value={e.id} className="bg-slate-800">{e.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Course</label>
            <select value={coursePrefix} onChange={(e) => setCoursePrefix(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-sm px-3 py-2 text-sm text-white outline-none focus:border-[#c5a021]"
              disabled={!electionId}>
              <option value="" className="bg-slate-800">Select course...</option>
              {courseKeys.map((c: string) => (
                <option key={c} value={c} className="bg-slate-800">{c}</option>
              ))}
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
