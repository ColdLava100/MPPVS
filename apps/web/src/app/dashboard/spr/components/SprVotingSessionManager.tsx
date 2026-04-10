'use client';

import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Save, X, Clock, Calendar } from 'lucide-react';

interface SprVotingSessionManagerProps {
  votingSessions: any[];
  elections: any[];
  courses: any[];
  onRefresh: () => void;
}

export default function SprVotingSessionManager({ votingSessions, elections, courses, onRefresh }: SprVotingSessionManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [title, setTitle] = useState('');
  const [electionId, setElectionId] = useState('');
  const [courseId, setCourseId] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [studentIdStart, setStudentIdStart] = useState('');
  const [studentIdEnd, setStudentIdEnd] = useState('');
  
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

  const extractPrefix = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    return course ? course.studentPrefix : '';
  };

  const handleAddSession = async (e: React.FormEvent) => {
    e.preventDefault();
    const prefix = extractPrefix(courseId);
    const finalStart = studentIdStart ? `${prefix}${studentIdStart}` : undefined;
    const finalEnd = studentIdEnd ? `${prefix}${studentIdEnd}` : undefined;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/voting-sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          electionId, title, courseId,
          startTime: startTime ? new Date(startTime).toISOString() : null,
          endTime: endTime ? new Date(endTime).toISOString() : null,
          studentIdStart: finalStart, studentIdEnd: finalEnd
        })
      });
      if (res.ok) { alert('Voting Session Created!'); resetAddForm(); onRefresh(); }
      else alert(`Failed: ${res.status}`);
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
    const startObj = session.studentIdStart ? session.studentIdStart.match(/^[A-Za-z]+/)?.[0] : '';
    const endObj = session.studentIdEnd ? session.studentIdEnd.match(/^[A-Za-z]+/)?.[0] : '';
    setEditStudentIdStart(startObj || '');
    setEditStudentIdEnd(endObj || '');
  };

  const handleSaveEdit = async (id: string) => {
    const prefix = extractPrefix(editCourseId);
    const finalStart = editStudentIdStart ? `${prefix}${editStudentIdStart}` : undefined;
    const finalEnd = editStudentIdEnd ? `${prefix}${editStudentIdEnd}` : undefined;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/voting-sessions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          electionId: editElectionId, title: editTitle, courseId: editCourseId,
          startTime: editStartTime ? new Date(editStartTime).toISOString() : null,
          endTime: editEndTime ? new Date(editEndTime).toISOString() : null,
          studentIdStart: finalStart, studentIdEnd: finalEnd
        })
      });
      if (res.ok) { alert('Voting Session Updated!'); setEditingId(null); onRefresh(); }
      else alert(`Failed: ${res.status}`);
    } catch (err: any) { alert(`Error: ${err.message}`); }
  };

  const getCourseName = (courseCode: string) => courses.find(c => c.code === courseCode)?.studentPrefix || courseCode;
  const getElectionName = (electionId: string) => elections.find(e => e.id === electionId)?.title || 'Unknown';

  return (
    <div className="bg-white/5 backdrop-blur-3xl rounded-sm border border-white/10 shadow-2xl mb-8 p-8 text-black">
      <div className="flex items-center justify-between mb-6 text-white">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#4c0519]/20 rounded-lg border border-white/10">
            <Clock size={20} className="text-white" />
          </div>
          <h3 className="text-2xl font-bold uppercase tracking-tighter">Voting Sessions</h3>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">({votingSessions.length})</span>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-[#c5a021] text-black px-6 py-3 rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-yellow-400 transition-all flex items-center gap-2"
        >
          <Plus size={16} /> New Session
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddSession} className="mb-6 p-6 bg-black/20 rounded-lg border border-white/10 text-black">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Session Title</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Morning Session"
                className="w-full bg-white border-b border-slate-300 px-0 py-3 text-sm outline-none focus:border-[#4c0519] transition-colors font-bold text-black"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Election</label>
              <select 
                value={electionId}
                onChange={(e) => setElectionId(e.target.value)}
                className="w-full bg-white border-b border-slate-300 px-0 py-3 text-sm outline-none focus:border-[#4c0519] transition-colors font-bold text-black"
                required
              >
                <option value="" className="text-black">Select Election</option>
                {elections.map(e => <option key={e.id} value={e.id} className="text-black">{e.title}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Course</label>
              <select 
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="w-full bg-white border-b border-slate-300 px-0 py-3 text-sm outline-none focus:border-[#4c0519] transition-colors font-bold text-black"
                required
              >
                <option value="" className="text-black">Select Course</option>
                {courses.map(c => <option key={c.id} value={c.id} className="text-black">{c.studentPrefix} - {c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Student ID Range (Base)</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={studentIdStart}
                  onChange={(e) => setStudentIdStart(e.target.value)}
                  placeholder="Start (e.g., 001)"
                  className="w-full bg-white border-b border-slate-300 px-0 py-3 text-sm outline-none focus:border-[#4c0519] transition-colors font-bold text-black"
                />
                <input 
                  type="text" 
                  value={studentIdEnd}
                  onChange={(e) => setStudentIdEnd(e.target.value)}
                  placeholder="End (e.g., 050)"
                  className="w-full bg-white border-b border-slate-300 px-0 py-3 text-sm outline-none focus:border-[#4c0519] transition-colors font-bold text-black"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Start Time</label>
              <input 
                type="datetime-local" 
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-white border-b border-slate-300 px-0 py-3 text-sm outline-none focus:border-[#4c0519] transition-colors font-bold text-black"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">End Time</label>
              <input 
                type="datetime-local" 
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-white border-b border-slate-300 px-0 py-3 text-sm outline-none focus:border-[#4c0519] transition-colors font-bold text-black"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-[#c5a021] text-black px-6 py-2 rounded text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
              <Save size={14} /> Create Session
            </button>
            <button type="button" onClick={resetAddForm} className="bg-white/10 text-white px-6 py-2 rounded text-[10px] font-black uppercase tracking-widest">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {votingSessions.map(session => (
          <div key={session.id} className="p-6 bg-white/5 rounded-lg border border-white/10 flex items-center justify-between">
            {editingId === session.id ? (
              <div className="flex-1 grid grid-cols-2 gap-4">
                <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="bg-white border-b border-slate-300 px-3 py-2 text-sm text-black" />
                <select value={editElectionId} onChange={(e) => setEditElectionId(e.target.value)} className="bg-white border-b border-slate-300 px-3 py-2 text-sm text-black">
                  {elections.map(e => <option key={e.id} value={e.id} className="text-black">{e.title}</option>)}
                </select>
                <input type="datetime-local" value={editStartTime} onChange={(e) => setEditStartTime(e.target.value)} className="bg-white border-b border-slate-300 px-3 py-2 text-sm text-black" />
                <input type="datetime-local" value={editEndTime} onChange={(e) => setEditEndTime(e.target.value)} className="bg-white border-b border-slate-300 px-3 py-2 text-sm text-black" />
                <div className="col-span-2 flex gap-2">
                  <button onClick={() => handleSaveEdit(session.id)} className="text-green-500"><Save size={18} /></button>
                  <button onClick={() => setEditingId(null)} className="text-red-500"><X size={18} /></button>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <p className="text-sm font-bold text-white">{session.title}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest">
                    {getElectionName(session.electionId)} • {getCourseName(session.courseCode)}
                  </p>
                  <p className="text-[9px] text-slate-500 mt-1">
                    {session.startTime && new Date(session.startTime).toLocaleString()} - {session.endTime && new Date(session.endTime).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => handleEditClick(session)} className="p-2 hover:bg-white/10 rounded transition">
                    <Edit2 size={16} className="text-slate-400" />
                  </button>
                  <button onClick={() => handleDeleteSession(session.id)} className="p-2 hover:bg-white/10 rounded transition">
                    <Trash2 size={16} className="text-red-400" />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
        {votingSessions.length === 0 && (
          <p className="text-slate-400 text-sm italic text-center py-8">No voting sessions created yet.</p>
        )}
      </div>
    </div>
  );
}