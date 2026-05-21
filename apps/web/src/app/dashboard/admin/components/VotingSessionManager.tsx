'use client';

import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Save, X, Clock } from 'lucide-react';

interface VotingSessionManagerProps {
  votingSessions: any[];
  elections: any[];
  courses: any[];
  onRefresh: () => void;
  selectedElectionId?: string;
}

export default function VotingSessionManager({ votingSessions, elections, courses, onRefresh, selectedElectionId }: VotingSessionManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Add form state
  const [title, setTitle] = useState('');
  const [electionId, setElectionId] = useState('');
  const [courseId, setCourseId] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [studentIdStart, setStudentIdStart] = useState('');
  const [studentIdEnd, setStudentIdEnd] = useState('');

  // Edit form state
  const [editTitle, setEditTitle] = useState('');
  const [editElectionId, setEditElectionId] = useState('');
  const [editCourseId, setEditCourseId] = useState('');
  const [editStartTime, setEditStartTime] = useState('');
  const [editEndTime, setEditEndTime] = useState('');
  const [editStudentIdStart, setEditStudentIdStart] = useState('');
  const [editStudentIdEnd, setEditStudentIdEnd] = useState('');

  const resetAddForm = () => {
    setTitle(''); setElectionId(''); setCourseId('');
    setStartTime(''); setEndTime(''); setStudentIdStart(''); setStudentIdEnd('');
    setShowAddForm(false);
  };

  const extractPrefix = (courseId: string) => courses.find(c => c.id === courseId)?.studentPrefix || '';

  const handleAddSession = async (e: React.FormEvent) => {
    e.preventDefault();
    const prefix = extractPrefix(courseId);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/voting-sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          electionId, title, courseId,
          startTime: startTime ? new Date(startTime).toISOString() : null,
          endTime: endTime ? new Date(endTime).toISOString() : null,
          studentIdStart: studentIdStart ? `${prefix}${studentIdStart}` : undefined,
          studentIdEnd: studentIdEnd ? `${prefix}${studentIdEnd}` : undefined,
        })
      });
      if (res.ok) { alert('Voting Session Created!'); resetAddForm(); onRefresh(); }
      else { alert(`Failed: ${res.status}`); }
    } catch (err: any) { alert(`Error: ${err.message}`); }
  };

  const handleDeleteSession = async (id: string) => {
    if (!confirm('Delete this voting session?')) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/voting-sessions/${id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) { onRefresh(); }
      else alert(`Failed: ${res.status}`);
    } catch (err: any) { alert(`Error: ${err.message}`); }
  };

  const handleEditClick = (session: any) => {
    setEditingId(session.id);
    setEditTitle(session.title || '');
    setEditElectionId(session.electionId || '');
    const course = courses.find(c => c.code === session.courseCode);
    setEditCourseId(course ? course.id : '');
    setEditStartTime(session.startTime ? new Date(session.startTime).toISOString().slice(0, 16) : '');
    setEditEndTime(session.endTime ? new Date(session.endTime).toISOString().slice(0, 16) : '');
    setEditStudentIdStart(session.studentIdStart?.replace(/^[A-Za-z]+/, '') || '');
    setEditStudentIdEnd(session.studentIdEnd?.replace(/^[A-Za-z]+/, '') || '');
  };

  const handleSaveEdit = async (id: string) => {
    const prefix = extractPrefix(editCourseId);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/voting-sessions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          electionId: editElectionId, title: editTitle, courseId: editCourseId,
          startTime: editStartTime ? new Date(editStartTime).toISOString() : null,
          endTime: editEndTime ? new Date(editEndTime).toISOString() : null,
          studentIdStart: editStudentIdStart ? `${prefix}${editStudentIdStart}` : undefined,
          studentIdEnd: editStudentIdEnd ? `${prefix}${editStudentIdEnd}` : undefined,
        })
      });
      if (res.ok) { alert('Voting Session Updated!'); setEditingId(null); onRefresh(); }
      else { alert(`Failed: ${res.status}`); }
    } catch (err: any) { alert(`Error: ${err.message}`); }
  };

  const getCourseName = (courseCode: string) => courses.find(c => c.code === courseCode)?.studentPrefix || courseCode;
  const getElectionName = (electionId: string) => elections.find(e => e.id === electionId)?.title || 'Unknown';

  // Pre-select election in add form if selectedElectionId is set
  React.useEffect(() => {
    if (selectedElectionId && !editingId) {
      setElectionId(selectedElectionId);
    }
  }, [selectedElectionId]);

  const filteredVotingSessions = selectedElectionId
    ? votingSessions.filter(vs => vs.electionId === selectedElectionId)
    : votingSessions;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#4c0519]/10 rounded-sm">
            <Clock size={16} className="text-[#4c0519]" />
          </div>
          <h3 className="text-base font-bold text-slate-900 uppercase tracking-tight">Voting Sessions</h3>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">({filteredVotingSessions.length})</span>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-[#c5a021] text-black px-4 py-2 rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-yellow-400 transition-all flex items-center gap-2"
        >
          <Plus size={14} /> New
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddSession} className="mb-4 p-5 bg-slate-50 border border-slate-200 rounded-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Session Title</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Morning Session" required
                className="w-full bg-white border border-slate-200 rounded-sm px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#c5a021] transition-colors placeholder:text-slate-400" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Election</label>
              <select value={electionId} onChange={(e) => setElectionId(e.target.value)} required
                className="w-full bg-white border border-slate-200 rounded-sm px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#c5a021] transition-colors">
                <option value="">Select</option>
                {elections.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Course</label>
              <select value={courseId} onChange={(e) => setCourseId(e.target.value)} required
                className="w-full bg-white border border-slate-200 rounded-sm px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#c5a021] transition-colors">
                <option value="">Select</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.studentPrefix} - {c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Student ID Range</label>
              <div className="flex gap-2">
                <input type="text" value={studentIdStart} onChange={(e) => setStudentIdStart(e.target.value)} placeholder="Start (e.g., 001)"
                  className="w-full bg-white border border-slate-200 rounded-sm px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#c5a021] transition-colors placeholder:text-slate-400 font-mono" />
                <input type="text" value={studentIdEnd} onChange={(e) => setStudentIdEnd(e.target.value)} placeholder="End (e.g., 050)"
                  className="w-full bg-white border border-slate-200 rounded-sm px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#c5a021] transition-colors placeholder:text-slate-400 font-mono" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Start Time</label>
              <input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-sm px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#c5a021] transition-colors" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">End Time</label>
              <input type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-sm px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#c5a021] transition-colors" />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-[#c5a021] text-black px-5 py-2 rounded text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-yellow-400 transition-all">
              <Save size={14} /> Create
            </button>
            <button type="button" onClick={resetAddForm} className="bg-slate-100 text-slate-700 px-5 py-2 rounded text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">
              Cancel
            </button>
          </div>
        </form>
      )}

      {!selectedElectionId ? (
        <div className="text-center py-12">
          <Clock size={36} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500 text-sm italic">Select an election from the dropdown above to view its voting sessions</p>
        </div>
      ) : filteredVotingSessions.length === 0 ? (
        <p className="text-slate-400 text-sm italic text-center py-6">No voting sessions found for this election.</p>
      ) : (
      <div className="space-y-2">
        {filteredVotingSessions.map(session => (
          <div key={session.id} className="bg-slate-50 border border-slate-200 rounded-sm p-4">
            {editingId === session.id ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)}
                    className="bg-white border border-slate-200 rounded-sm px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#c5a021]" />
                  <select value={editElectionId} onChange={(e) => setEditElectionId(e.target.value)}
                    className="bg-white border border-slate-200 rounded-sm px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#c5a021]">
                    {elections.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
                  </select>
                  <input type="datetime-local" value={editStartTime} onChange={(e) => setEditStartTime(e.target.value)}
                    className="bg-white border border-slate-200 rounded-sm px-3 py-2 text-sm text-slate-900" />
                  <input type="datetime-local" value={editEndTime} onChange={(e) => setEditEndTime(e.target.value)}
                    className="bg-white border border-slate-200 rounded-sm px-3 py-2 text-sm text-slate-900" />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleSaveEdit(session.id)} className="bg-green-100 text-green-700 px-4 py-1.5 rounded text-[10px] font-black uppercase tracking-widest hover:bg-green-200 transition flex items-center gap-1"><Save size={12} /> Save</button>
                  <button onClick={() => setEditingId(null)} className="bg-red-100 text-red-600 px-4 py-1.5 rounded text-[10px] font-black uppercase tracking-widest hover:bg-red-200 transition flex items-center gap-1"><X size={12} /> Cancel</button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-900">{session.title}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">
                    {getElectionName(session.electionId)} &bull; {getCourseName(session.courseCode)}
                  </p>
                  <p className="text-[9px] text-slate-400 mt-0.5">
                    {session.startTime && new Date(session.startTime).toLocaleString()} - {session.endTime && new Date(session.endTime).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleEditClick(session)} className="p-1.5 hover:bg-slate-200 rounded transition">
                    <Edit2 size={14} className="text-slate-500" />
                  </button>
                  <button onClick={() => handleDeleteSession(session.id)} className="p-1.5 hover:bg-slate-200 rounded transition">
                    <Trash2 size={14} className="text-red-500" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      )}
    </div>
  );
}
