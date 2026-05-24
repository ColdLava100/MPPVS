'use client';

import React, { useState } from 'react';
import { Clock, Plus, Save, Trash2, Edit2, X, CheckCircle, Layers, Eye, Users, List, LayoutGrid, UserCheck } from 'lucide-react';

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
  icNumber?: string;
  courseCode?: string;
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

  const [viewMode, setViewMode] = useState<'list' | 'card'>('list');
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailTab, setDetailTab] = useState<'roster' | 'candidates'>('roster');
  const [detailVoters, setDetailVoters] = useState<VoterInfo[]>([]);
  const [loadingDetailVoters, setLoadingDetailVoters] = useState(false);
  const [detailCandidates, setDetailCandidates] = useState<any[]>([]);
  const [loadingDetailCandidates, setLoadingDetailCandidates] = useState(false);
  const [rosterStatusFilter, setRosterStatusFilter] = useState('all');
  const [rosterCourseFilter, setRosterCourseFilter] = useState('all');

  const [title, setTitle] = useState('');
  const [courseId, setCourseId] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [studentIdStart, setStudentIdStart] = useState('');
  const [studentIdEnd, setStudentIdEnd] = useState('');

  const [bulkTitle, setBulkTitle] = useState('');
  const [bulkStartTime, setBulkStartTime] = useState('');
  const [bulkEndTime, setBulkEndTime] = useState('');
  const [courseRanges, setCourseRanges] = useState<Record<string, { start: string; end: string }>>({});
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
    setCourseRanges({});
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

    if (!bulkStartTime || !bulkEndTime) {
      alert('Start time and end time are required');
      return;
    }

    const sessionsToCreate = selectedCourses.map(courseId => ({
      electionId: election.id,
      title: bulkTitle || `${getCourseInfo(courseId)?.studentPrefix} Session`,
      courseId,
      startTime: new Date(bulkStartTime).toISOString(),
      endTime: new Date(bulkEndTime).toISOString(),
      studentIdStart: courseRanges[courseId]?.start || null,
      studentIdEnd: courseRanges[courseId]?.end || null,
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
      const range = courseRanges[courseId];
      return {
        course: course?.studentPrefix,
        title: bulkTitle || `${course?.studentPrefix} Session`,
        startId: range?.start || 'All',
        endId: range?.end || 'Open-ended',
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

  const handleOpenDetail = async (session: any) => {
    setSelectedSession(session);
    setDetailModalOpen(true);
    setDetailTab('roster');
    setLoadingDetailVoters(true);
    setLoadingDetailCandidates(true);
    setRosterStatusFilter('all');
    setRosterCourseFilter('all');

    const [vRes, cRes] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/voting-sessions/${session.id}/voters`, { credentials: 'include' }),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/voting-sessions/${session.id}/candidates`, { credentials: 'include' }),
    ]);
    if (vRes.ok) setDetailVoters(await vRes.json());
    if (cRes.ok) setDetailCandidates(await cRes.json());
    setLoadingDetailVoters(false);
    setLoadingDetailCandidates(false);
  };

  const closeDetailModal = () => {
    setDetailModalOpen(false);
    setSelectedSession(null);
    setDetailVoters([]);
    setDetailCandidates([]);
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
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-forwards">
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
      {electionSessions.length > 0 && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mr-auto">
            {electionSessions.length} session(s)
          </span>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">View</span>
          <div className="flex gap-1 bg-slate-100 p-1 rounded-md">
            <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-sm transition-colors ${viewMode === 'list' ? 'bg-white text-[#4c0519] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`} title="List view">
              <List size={16} />
            </button>
            <button onClick={() => setViewMode('card')} className={`p-1.5 rounded-sm transition-colors ${viewMode === 'card' ? 'bg-white text-[#4c0519] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`} title="Card view">
              <LayoutGrid size={16} />
            </button>
          </div>
        </div>
      )}

      {electionSessions.length > 0 ? (
        viewMode === 'list' ? (
        <div className="space-y-4">
          {electionSessions.map(session => (
            <div
              key={session.id}
              onClick={() => { if (!editingId) handleOpenDetail(session); }}
              className={`p-6 bg-white/50 border border-slate-200 rounded-sm flex items-center justify-between cursor-pointer hover:border-[#c5a021] hover:shadow-lg transition-all ${editingId === session.id ? '' : ''}`}
            >
              {editingId === session.id ? (
                <div className="flex-1 grid grid-cols-2 gap-4" onClick={e => e.stopPropagation()}>
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
                  <div className="flex items-center gap-3" onClick={e => e.stopPropagation()}>
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
          ))}
        </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {electionSessions.map(session => (
            <div
              key={session.id}
              onClick={() => { if (!editingId) handleOpenDetail(session); }}
              className="p-6 bg-white/50 border border-slate-200 rounded-sm cursor-pointer hover:border-[#c5a021] hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-black">{session.title}</h4>
                    {isSessionLive(session) && (
                      <span className="bg-green-500 text-black px-2 py-0.5 rounded-full text-[9px] font-black uppercase">LIVE</span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">{getCourseName(session.courseCode)}</p>
                </div>
                <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                  <button onClick={() => handleShowVoters(session)} className="p-1.5 hover:bg-white/50 rounded transition" title="Show Voters">
                    <Users size={14} className="text-blue-500" />
                  </button>
                  <button onClick={() => handleEditClick(session)} className="p-1.5 hover:bg-white/50 rounded transition">
                    <Edit2 size={14} className="text-slate-400" />
                  </button>
                  <button onClick={() => handleDeleteSession(session.id)} className="p-1.5 hover:bg-white/50 rounded transition">
                    <Trash2 size={14} className="text-red-400" />
                  </button>
                </div>
              </div>
              <div className="space-y-1 text-xs text-slate-500">
                <p>ID: {session.studentIdStart || 'All'} {session.studentIdEnd ? `- ${session.studentIdEnd}` : ''}</p>
                <p>{session.startTime && new Date(session.startTime).toLocaleString()}</p>
                <p>→ {session.endTime && new Date(session.endTime).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
        )
      ) : (
        <div className="text-center py-8 bg-slate-50 border border-dashed border-slate-300 rounded-sm">
          <p className="text-slate-400">No voting sessions created yet.</p>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-2">Click "Single" or "Bulk" to create one</p>
        </div>
      )}

{/* Summary */}
      {electionSessions. length > 0 && (
        <div className="mt-6 p-4 bg-5slate-50 border border-9slate-200 rounded-5sm">
          <p className="text-9sm text-9slate-600">
            <strong>Summary:</strong> {electionSessions.length} voting session(s) configured
          </p>
        </div>
      )}

      {/* Session Detail Modal */}
      {detailModalOpen && selectedSession && !showVotersModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 p-10 flex items-center justify-center">
          <div className="bg-white rounded-sm max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <div>
                <h2 className="text-xl font-bold text-slate-800">{selectedSession.title}</h2>
                <p className="text-xs text-slate-500 mt-1">
                  {selectedSession.startTime && new Date(selectedSession.startTime).toLocaleString()} — {selectedSession.endTime && new Date(selectedSession.endTime).toLocaleString()}
                </p>
              </div>
              <button onClick={closeDetailModal} className="p-2 hover:bg-slate-100 rounded">
                <X size={24} className="text-slate-400" />
              </button>
            </div>

            <div className="flex gap-2 px-6 pt-4 border-b border-slate-100 pb-4">
              <button onClick={() => setDetailTab('roster')} className={`flex items-center gap-2 px-4 py-2 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all ${detailTab === 'roster' ? 'bg-[#4c0519] text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                <Users size={14} /> Voter Roster
              </button>
              <button onClick={() => setDetailTab('candidates')} className={`flex items-center gap-2 px-4 py-2 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all ${detailTab === 'candidates' ? 'bg-[#4c0519] text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                <UserCheck size={14} /> Candidate Performance
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {detailTab === 'roster' ? (
                loadingDetailVoters ? (
                  <div className="text-center py-12"><p className="text-slate-500">Loading voters...</p></div>
                ) : detailVoters.length === 0 ? (
                  <div className="text-center py-12"><p className="text-slate-500">No voters found for this session.</p></div>
                ) : (
                  <>
                    <div className="flex items-center gap-6 mb-4 text-sm flex-wrap">
                      <span className="text-slate-500">Total: <span className="font-bold text-black">{detailVoters.length}</span></span>
                      <span className="text-green-600">Voted: <span className="font-bold">{detailVoters.filter(v => v.hasVoted).length}</span> ({detailVoters.length > 0 ? ((detailVoters.filter(v => v.hasVoted).length / detailVoters.length) * 100).toFixed(1) : 0}%)</span>
                      <span className="text-slate-500">Not Voted: <span className="font-bold">{detailVoters.filter(v => !v.hasVoted).length}</span></span>
                      <select value={rosterStatusFilter} onChange={e => setRosterStatusFilter(e.target.value)} className="ml-auto bg-white border-b border-slate-300 px-3 py-1.5 text-xs text-black outline-none focus:border-[#4c0519] font-bold">
                        <option value="all">All Status</option>
                        <option value="voted">Voted</option>
                        <option value="notVoted">Not Voted</option>
                      </select>
                      <select value={rosterCourseFilter} onChange={e => setRosterCourseFilter(e.target.value)} className="bg-white border-b border-slate-300 px-3 py-1.5 text-xs text-black outline-none focus:border-[#4c0519] font-bold">
                        <option value="all">All Courses</option>
                        {[...new Set(detailVoters.map(v => v.courseCode).filter(Boolean))].map(c => (
                          <option key={c} value={c!}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div className="max-h-[50vh] overflow-y-auto">
                      <table className="w-full">
                        <thead className="bg-slate-50 sticky top-0">
                          <tr>
                            <th className="text-left text-[10px] font-black text-slate-500 uppercase tracking-widest px-3 py-2">Name</th>
                            <th className="text-left text-[10px] font-black text-slate-500 uppercase tracking-widest px-3 py-2">IC Number</th>
                            <th className="text-left text-[10px] font-black text-slate-500 uppercase tracking-widest px-3 py-2">Course</th>
                            <th className="text-left text-[10px] font-black text-slate-500 uppercase tracking-widest px-3 py-2">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {detailVoters
                            .filter(v => rosterStatusFilter === 'all' || (rosterStatusFilter === 'voted' ? v.hasVoted : !v.hasVoted))
                            .filter(v => rosterCourseFilter === 'all' || v.courseCode === rosterCourseFilter)
                            .map(voter => (
                            <tr key={voter.userId} className="border-b border-slate-100">
                              <td className="px-3 py-2 text-sm font-bold text-black">{voter.name}</td>
                              <td className="px-3 py-2 text-sm font-mono text-slate-600">{voter.icNumber || 'N/A'}</td>
                              <td className="px-3 py-2 text-sm text-slate-600">{voter.courseCode || 'N/A'}</td>
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
                )
              ) : (
                loadingDetailCandidates ? (
                  <div className="text-center py-12"><p className="text-slate-500">Loading candidates...</p></div>
                ) : detailCandidates.every(c => c.voteCount === 0) ? (
                  <div className="text-center py-12">
                    <UserCheck size={48} className="text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 font-bold">No votes have been cast in this session yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {detailCandidates
                      .sort((a, b) => b.voteCount - a.voteCount)
                      .map(c => {
                        const maxVotes = Math.max(...detailCandidates.map(x => x.voteCount), 1);
                        const pct = (c.voteCount / maxVotes) * 100;
                        return (
                          <div key={c.id} className="p-4 bg-slate-50 rounded-sm border border-slate-200">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <span className="text-sm font-bold text-slate-800">{c.name}</span>
                                <span className="text-[10px] text-slate-500 uppercase tracking-wider ml-2">{c.courseCode}</span>
                              </div>
                              <span className="text-lg font-bold text-[#c5a021]">{c.voteCount} votes</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2">
                              <div className="bg-[#c5a021] h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )
              )}
            </div>
          </div>
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