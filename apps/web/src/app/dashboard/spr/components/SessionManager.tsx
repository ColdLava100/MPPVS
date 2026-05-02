'use client';

import React, { useState } from 'react';
import { Clock, Plus, Save, Trash2, Edit2, X, CheckCircle, Layers, Eye, Users } from 'lucide-react';

interface SessionManagerProps {
  election: any;
  courses: any[];
  votingSessions: any[];
  onRefresh: () => void;
}

interface VoterInfo {
  userId: string;
  name: string;
  studentId: string;
  hasVoted: boolean;
  votedAt: string | null;
}

export default function SessionManager({ election, courses, votingSessions, onRefresh }: SessionManagerProps) {
  const [mode, setMode] = useState<'single' | 'bulk'>('single');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  
  const [showVotersModal, setShowVotersModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [voters, setVoters] = useState<VoterInfo[]>([]);
  const [loadingVoters, setLoadingVoters] = useState(false);

  const [title, setTitle] = useState('');
  const [courseId, setCourseId] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [studentIdStart, setStudentIdStart] = useState('');
  const [studentIdEnd, setStudentIdEnd] = useState('');

  const [bulkTitle, setBulkTitle] = useState('');
  const [bulkStartTime, setBulkStartTime] = useState('');
  const [bulkEndTime, setBulkEndTime] = useState('');
  const [bulkIdStart, setBulkIdStart] = useState('');
  const [bulkIdEnd, setBulkIdEnd] = useState('');
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);

  const [editTitle, setEditTitle] = useState('');
  const [editCourseId, setEditCourseId] = useState('');
  const [editStartTime, setEditStartTime] = useState('');
  const [editEndTime, setEditEndTime] = useState('');
  const [editStudentIdStart, setEditStudentIdStart] = useState('');
  const [editStudentIdEnd, setEditStudentIdEnd] = useState('');

  const electionSessions = votingSessions.filter(vs => vs.electionId === election?.id);

  const getCourseInfo = (courseId: string) => courses.find(c => c.id === courseId);

  const resetSingleForm = () => {
    setTitle('');
    setCourseId('');
    setStartTime('');
    setEndTime('');
    setStudentIdStart('');
    setStudentIdEnd('');
    setShowAddForm(false);
  };

  const resetBulkForm = () => {
    setBulkTitle('');
    setBulkStartTime('');
    setBulkEndTime('');
    setBulkIdStart('');
    setBulkIdEnd('');
    setSelectedCourses([]);
    setShowAddForm(false);
  };

  const handleAddSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!election) return;

    if (!courseId) {
      alert('Please select a course');
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/voting-sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          electionId: election.id,
          title,
          courseId,
          startTime: startTime ? new Date(startTime).toISOString() : null,
          endTime: endTime ? new Date(endTime).toISOString() : null,
          studentIdStart: studentIdStart || null,
          studentIdEnd: studentIdEnd || null,
        })
      });
      if (res.ok) {
        alert('Voting Session Created!');
        resetSingleForm();
        onRefresh();
      } else {
        const err = await res.text();
        alert(`Failed: ${res.status} - ${err}`);
      }
    } catch (err: any) { alert(`Error: ${err.message}`); }
  };

  const handleBulkCreate = async () => {
    if (!election || selectedCourses.length === 0) {
      alert('Please select at least one course');
      return;
    }

    const sessionsToCreate = selectedCourses.map(courseId => ({
      electionId: election.id,
      title: bulkTitle || `${getCourseInfo(courseId)?.studentPrefix} Session`,
      courseId,
      startTime: bulkStartTime ? new Date(bulkStartTime).toISOString() : null,
      endTime: bulkEndTime ? new Date(bulkEndTime).toISOString() : null,
      studentIdStart: bulkIdStart || null,
      studentIdEnd: bulkIdEnd || null,
    }));

    try {
      for (const session of sessionsToCreate) {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/voting-sessions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(session)
        });
        if (!res.ok) {
          const err = await res.text();
          alert(`Failed to create session for ${getCourseInfo(session.courseId)?.studentPrefix}: ${err}`);
          return;
        }
      }
      alert(`${sessionsToCreate.length} Voting Sessions Created!`);
      resetBulkForm();
      onRefresh();
    } catch (err: any) { alert(`Error: ${err.message}`); }
  };

  const getBulkPreview = () => {
    return selectedCourses.map(courseId => {
      const course = getCourseInfo(courseId);
      return {
        course: course?.studentPrefix,
        title: bulkTitle || `${course?.studentPrefix} Session`,
        startId: bulkIdStart || 'All',
        endId: bulkIdEnd || 'Open-ended',
      };
    });
  };

  const handleDeleteSession = async (id: string) => {
    if (!confirm('Delete this voting session?')) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/voting-sessions/${id}`, { 
        method: 'DELETE', 
        credentials: 'include' 
      });
      if (res.ok) { onRefresh(); }
      else alert(`Failed: ${res.status}`);
    } catch (err: any) { alert(`Error: ${err.message}`); }
  };

  const handleEditClick = (session: any) => {
    setEditingId(session.id);
    setEditTitle(session.title || '');
    const course = courses.find(c => c.code === session.courseCode);
    setEditCourseId(course ? course.id : '');
    setEditStartTime(session.startTime ? new Date(session.startTime).toISOString().slice(0, 16) : '');
    setEditEndTime(session.endTime ? new Date(session.endTime).toISOString().slice(0, 16) : '');
    setEditStudentIdStart(session.studentIdStart || '');
    setEditStudentIdEnd(session.studentIdEnd || '');
  };

  const handleSaveEdit = async (id: string) => {
    if (!editCourseId) {
      alert('Please select a course');
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/voting-sessions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          electionId: election.id,
          title: editTitle,
          courseId: editCourseId,
          startTime: editStartTime ? new Date(editStartTime).toISOString() : null,
          endTime: editEndTime ? new Date(editEndTime).toISOString() : null,
          studentIdStart: editStudentIdStart || null,
          studentIdEnd: editStudentIdEnd || null,
        })
      });
      if (res.ok) {
        alert('Voting Session Updated!');
        setEditingId(null);
        onRefresh();
      } else {
        alert(`Failed: ${res.status}`);
      }
    } catch (err: any) { alert(`Error: ${err.message}`); }
  };

  const getCourseName = (courseCode: string) => courses.find(c => c.code === courseCode)?.studentPrefix || courseCode;

  const isSessionLive = (session: any) => {
    const now = new Date();
    const start = session.startTime ? new Date(session.startTime) : null;
    const end = session.endTime ? new Date(session.endTime) : null;
    return start && end && now >= start && now <= end;
  };

  const handleShowVoters = async (session: any) => {
    setSelectedSession(session);
    setShowVotersModal(true);
    setLoadingVoters(true);
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/voting-sessions/${session.id}/voters`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setVoters(data);
      } else {
        alert('Failed to load voters');
        setVoters([]);
      }
    } catch (err: any) {
      console.error('Error loading voters:', err);
      alert('Error loading voters');
      setVoters([]);
    }
    setLoadingVoters(false);
  };

  const closeVotersModal = () => {
    setShowVotersModal(false);
    setSelectedSession(null);
    setVoters([]);
  };

  if (!election) {
    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-[#4c0519]/20 rounded-lg border border-white/10">
            <Clock size={20} className="text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold uppercase tracking-tighter text-[#4c0519]">Voting Sessions</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Define time slots and voter batches</p>
          </div>
        </div>
        <div className="text-center py-12 bg-slate-50 border border-dashed border-slate-300 rounded-sm">
          <p className="text-slate-500">Please complete Step 1 first to select an election.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#4c0519]/20 rounded-lg border border-white/10">
            <Clock size={20} className="text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold uppercase tracking-tighter text-[#4c0519]">Voting Sessions</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Define time slots for: {election.title}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => { setMode('single'); setShowAddForm(true); }}
            className={`px-4 py-2 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all ${
              mode === 'single' ? 'bg-[#c5a021] text-black' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
            }`}
          >
            <Plus size={14} className="inline mr-1" /> Single
          </button>
          <button 
            onClick={() => { setMode('bulk'); setShowAddForm(true); }}
            className={`px-4 py-2 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all ${
              mode === 'bulk' ? 'bg-[#c5a021] text-black' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
            }`}
          >
            <Layers size={14} className="inline mr-1" /> Bulk
          </button>
        </div>
      </div>

      {/* Single Session Form */}
      {showAddForm && mode === 'single' && (
        <form onSubmit={handleAddSession} className="mb-6 p-6 bg-black/5 border border-white/10 rounded-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Session Title</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Morning Session - BCS"
                className="w-full bg-white border-b border-slate-300 px-0 py-3 text-sm outline-none focus:border-[#4c0519] transition-colors font-bold text-black"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Course</label>
              <select 
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="w-full bg-white border-b border-slate-300 px-0 py-3 text-sm outline-none focus:border-[#4c0519] transition-colors font-bold text-black"
                required
              >
                <option value="" className="text-black">Select Course</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id} className="text-black">
                    {c.studentPrefix} - {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Start Time</label>
              <input 
                type="datetime-local" 
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-white border-b border-slate-300 px-0 py-3 text-sm outline-none focus:border-[#4c0519] transition-colors font-bold text-black"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">End Time</label>
              <input 
                type="datetime-local" 
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-white border-b border-slate-300 px-0 py-3 text-sm outline-none focus:border-[#4c0519] transition-colors font-bold text-black"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                Student ID Start (Full Format)
              </label>
              <input 
                type="text" 
                value={studentIdStart}
                onChange={(e) => setStudentIdStart(e.target.value)}
                placeholder="e.g., BCS2311-001"
                className="w-full bg-white border-b border-slate-300 px-0 py-3 text-sm outline-none focus:border-[#4c0519] transition-colors font-bold text-black"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                Student ID End (Full Format)
              </label>
              <input 
                type="text" 
                value={studentIdEnd}
                onChange={(e) => setStudentIdEnd(e.target.value)}
                placeholder="e.g., BCS2311-050"
                className="w-full bg-white border-b border-slate-300 px-0 py-3 text-sm outline-none focus:border-[#4c0519] transition-colors font-bold text-black"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-[#c5a021] text-black px-6 py-2 rounded text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
              <Save size={14} /> Create Session
            </button>
            <button type="button" onClick={resetSingleForm} className="bg-white/10 text-slate-600 px-6 py-2 rounded text-[10px] font-black uppercase tracking-widest">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Bulk Creation Form */}
      {showAddForm && mode === 'bulk' && (
        <div className="mb-6 p-6 bg-black/5 border border-white/10 rounded-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Session Title Pattern</label>
              <input 
                type="text" 
                value={bulkTitle}
                onChange={(e) => setBulkTitle(e.target.value)}
                placeholder="e.g., Morning Session"
                className="w-full bg-white border-b border-slate-300 px-0 py-3 text-sm outline-none focus:border-[#4c0519] transition-colors font-bold text-black"
              />
              <p className="text-[9px] text-slate-400 mt-1">Each course will have its prefix as suffix</p>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Start Time</label>
              <input 
                type="datetime-local" 
                value={bulkStartTime}
                onChange={(e) => setBulkStartTime(e.target.value)}
                className="w-full bg-white border-b border-slate-300 px-0 py-3 text-sm outline-none focus:border-[#4c0519] transition-colors font-bold text-black"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">End Time</label>
              <input 
                type="datetime-local" 
                value={bulkEndTime}
                onChange={(e) => setBulkEndTime(e.target.value)}
                className="w-full bg-white border-b border-slate-300 px-0 py-3 text-sm outline-none focus:border-[#4c0519] transition-colors font-bold text-black"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                Student ID Start (Full Format)
              </label>
              <input 
                type="text" 
                value={bulkIdStart}
                onChange={(e) => setBulkIdStart(e.target.value)}
                placeholder="e.g., BCS2311-001"
                className="w-full bg-white border-b border-slate-300 px-0 py-3 text-sm outline-none focus:border-[#4c0519] transition-colors font-bold text-black"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                Student ID End (Full Format)
              </label>
              <input 
                type="text" 
                value={bulkIdEnd}
                onChange={(e) => setBulkIdEnd(e.target.value)}
                placeholder="e.g., BCS2311-050"
                className="w-full bg-white border-b border-slate-300 px-0 py-3 text-sm outline-none focus:border-[#4c0519] transition-colors font-bold text-black"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Select Courses</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {courses.map(c => (
                <label 
                  key={c.id} 
                  className={`flex items-center gap-2 p-3 border rounded-sm cursor-pointer transition-all ${
                    selectedCourses.includes(c.id) 
                      ? 'border-[#4c0519] bg-[#4c0519]/5' 
                      : 'border-slate-200 bg-white/50'
                  }`}
                >
                  <input 
                    type="checkbox"
                    checked={selectedCourses.includes(c.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedCourses([...selectedCourses, c.id]);
                      } else {
                        setSelectedCourses(selectedCourses.filter(id => id !== c.id));
                      }
                    }}
                    className="w-4 h-4 accent-[#4c0519]"
                  />
                  <div>
                    <p className="text-sm font-bold text-black">{c.studentPrefix}</p>
                    <p className="text-[9px] text-slate-500">{c.name}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {selectedCourses.length > 0 && (
            <div className="flex gap-2 mb-4">
              <button 
                type="button" 
                onClick={() => setShowPreview(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
              >
                <Eye size={14} /> Preview
              </button>
              <button 
                type="button" 
                onClick={handleBulkCreate}
                className="bg-[#c5a021] text-black px-6 py-2 rounded text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
              >
                <Save size={14} /> Create {selectedCourses.length} Sessions
              </button>
              <button type="button" onClick={resetBulkForm} className="bg-white/10 text-slate-600 px-6 py-2 rounded text-[10px] font-black uppercase tracking-widest">
                Cancel
              </button>
            </div>
          )}

          {/* Preview Modal */}
          {showPreview && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-sm max-w-lg w-full mx-4">
                <h4 className="text-lg font-bold text-black mb-4 uppercase tracking-tighter">Preview Sessions</h4>
                <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
                  {getBulkPreview().map((preview, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-sm">
                      <p className="text-sm font-bold text-black">{preview.title}</p>
                      <p className="text-[10px] text-slate-500">Course: {preview.course}</p>
                      <p className="text-[10px] text-slate-500">ID Range: {preview.startId} - {preview.endId}</p>
                    </div>
                  ))}
                </div>
                <button 
                  onClick={() => setShowPreview(false)}
                  className="bg-slate-200 text-black px-6 py-2 rounded text-[10px] font-black uppercase tracking-widest"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sessions List */}
      <div className="space-y-4">
        {electionSessions.length > 0 ? (
          electionSessions.map(session => (
            <div key={session.id} className="p-6 bg-white/50 border border-slate-200 rounded-sm flex items-center justify-between">
              {editingId === session.id ? (
                <div className="flex-1 grid grid-cols-2 gap-4">
                  <input 
                    type="text" 
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="bg-white border-b border-slate-300 px-3 py-2 text-sm text-black"
                    placeholder="Title"
                  />
                  <select 
                    value={editCourseId}
                    onChange={(e) => setEditCourseId(e.target.value)}
                    className="bg-white border-b border-slate-300 px-3 py-2 text-sm text-black"
                  >
                    {courses.map(c => <option key={c.id} value={c.id} className="text-black">{c.studentPrefix}</option>)}
                  </select>
                  <input 
                    type="datetime-local" 
                    value={editStartTime}
                    onChange={(e) => setEditStartTime(e.target.value)}
                    className="bg-white border-b border-slate-300 px-3 py-2 text-sm text-black"
                  />
                  <input 
                    type="datetime-local" 
                    value={editEndTime}
                    onChange={(e) => setEditEndTime(e.target.value)}
                    className="bg-white border-b border-slate-300 px-3 py-2 text-sm text-black"
                  />
                  <input 
                    type="text"
                    value={editStudentIdStart}
                    onChange={(e) => setEditStudentIdStart(e.target.value)}
                    placeholder="e.g., BCS2311-001"
                    className="bg-white border-b border-slate-300 px-3 py-2 text-sm text-black"
                  />
                  <input 
                    type="text"
                    value={editStudentIdEnd}
                    onChange={(e) => setEditStudentIdEnd(e.target.value)}
                    placeholder="e.g., BCS2311-050"
                    className="bg-white border-b border-slate-300 px-3 py-2 text-sm text-black"
                  />
                  <div className="col-span-2 flex gap-2">
                    <button onClick={() => handleSaveEdit(session.id)} className="text-green-600"><CheckCircle size={18} /></button>
                    <button onClick={() => setEditingId(null)} className="text-red-500"><X size={18} /></button>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-bold text-black">{session.title}</p>
                      {isSessionLive(session) && (
                        <span className="bg-green-500 text-black px-2 py-0.5 rounded-full text-[9px] font-black uppercase">LIVE</span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">
                      {getCourseName(session.courseCode)} - ID: {session.studentIdStart || 'All'} {session.studentIdEnd ? `- ${session.studentIdEnd}` : ''}
                    </p>
                    <p className="text-[9px] text-slate-400 mt-1">
                      {session.startTime && new Date(session.startTime).toLocaleString()} - {session.endTime && new Date(session.endTime).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => handleShowVoters(session)} className="p-2 hover:bg-white/50 rounded transition" title="Show Voters">
                      <Users size={16} className="text-blue-500" />
                    </button>
                    <button onClick={() => handleEditClick(session)} className="p-2 hover:bg-white/50 rounded transition">
                      <Edit2 size={16} className="text-slate-400" />
                    </button>
                    <button onClick={() => handleDeleteSession(session.id)} className="p-2 hover:bg-white/50 rounded transition">
                      <Trash2 size={16} className="text-red-400" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8 bg-slate-50 border border-dashed border-slate-300 rounded-sm">
            <p className="text-slate-400">No voting sessions created yet.</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-2">Click "Single" or "Bulk" to create one</p>
          </div>
        )}
      </div>

{/* Summary */}
      {electionSessions. length > 0 && (
        <div className="mt-6 p-4 bg-5slate-50 border border-9slate-200 rounded-5sm">
          <p className="text-9sm text-9slate-600">
            <strong>Summary:</strong> {electionSessions.length} voting session(s) configured
          </p>
        </div>
      )}

      {/* Voters Modal */}
      {showVotersModal && selectedSession && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-sm max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-lg font-bold text-black uppercase tracking-tighter">Voters</h4>
                <p className="text-sm text-slate-500">{selectedSession.title}</p>
              </div>
              <button onClick={closeVotersModal} className="p-2 hover:bg-slate-100 rounded">
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            
            {loadingVoters ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-slate-500">Loading voters...</p>
              </div>
            ) : voters.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-slate-500">No voters found for this session.</p>
              </div>
            ) : (
              <>
                <div className="mb-4 flex items-center gap-4">
                  <span className="text-sm text-slate-600">
                    <strong>{voters.length}</strong> voter(s) total
                  </span>
                  <span className="text-sm text-green-600">
                    {voters.filter(v => v.hasVoted).length} voted
                  </span>
                  <span className="text-sm text-slate-500">
                    {voters.filter(v => !v.hasVoted).length} not voted
                  </span>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 sticky top-0">
                      <tr>
                        <th className="text-left text-[10px] font-black text-slate-500 uppercase tracking-widest px-3 py-2">Name</th>
                        <th className="text-left text-[10px] font-black text-slate-500 uppercase tracking-widest px-3 py-2">Student ID</th>
                        <th className="text-left text-[10px] font-black text-slate-500 uppercase tracking-widest px-3 py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {voters.map((voter) => (
                        <tr key={voter.userId} className="border-b border-slate-100">
                          <td className="px-3 py-2 text-sm font-bold text-black">{voter.name}</td>
                          <td className="px-3 py-2 text-sm font-mono text-slate-600">{voter.studentId}</td>
                          <td className="px-3 py-2">
                            {voter.hasVoted ? (
                              <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-[10px] font-black uppercase">Voted</span>
                            ) : (
                              <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full text-[10px] font-black uppercase">Not Voted</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}