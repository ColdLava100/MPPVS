'use client';

import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Save, X, Vote, CheckCircle, XCircle } from 'lucide-react';

interface ElectionManagerProps {
  elections: any[];
  courses: any[];
  onRefresh: () => void;
}

export default function ElectionManager({ elections, courses, onRefresh }: ElectionManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Add form state
  const [title, setTitle] = useState('');
  const [courseConfig, setCourseConfig] = useState<Record<string, { enabled: boolean, chairs: number }>>({});

  // Edit form state
  const [editTitle, setEditTitle] = useState('');
  const [editCourseConfig, setEditCourseConfig] = useState<Record<string, { enabled: boolean, chairs: number }>>({});

  React.useEffect(() => {
    if (courses.length > 0 && Object.keys(courseConfig).length === 0) {
      const initial: Record<string, { enabled: boolean, chairs: number }> = {};
      courses.forEach(c => { initial[c.studentPrefix] = { enabled: false, chairs: 1 }; });
      setCourseConfig(initial);
    }
  }, [courses]);

  const resetAddForm = () => {
    setTitle('');
    const initial: Record<string, { enabled: boolean, chairs: number }> = {};
    courses.forEach(c => { initial[c.studentPrefix] = { enabled: false, chairs: 1 }; });
    setCourseConfig(initial);
    setShowAddForm(false);
  };

  const handleAddElection = async (e: React.FormEvent) => {
    e.preventDefault();
    const courseSettings = Object.entries(courseConfig)
      .filter(([_, config]) => config.enabled)
      .reduce((acc, [prefix, config]) => { acc[prefix] = config.chairs; return acc; }, {} as Record<string, number>);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/elections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title, courseSettings })
      });
      if (res.ok) { alert('Election Created!'); resetAddForm(); onRefresh(); }
      else { alert(`Failed: ${res.status}`); }
    } catch (err: any) { alert(`Error: ${err.message}`); }
  };

  const handleDeleteElection = async (id: string) => {
    if (!confirm('Delete election? This will cascade delete all connected voting sessions!')) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/elections/${id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) { onRefresh(); }
      else alert(`Failed: ${res.status}`);
    } catch (err: any) { alert(`Error: ${err.message}`); }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'DRAFT' ? 'ACTIVE' : 'DRAFT';
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/elections/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) { onRefresh(); }
      else alert(`Failed: ${res.status}`);
    } catch (err: any) { alert(`Error: ${err.message}`); }
  };

  const handleEditClick = (election: any) => {
    setEditingId(election.id);
    setEditTitle(election.title);
    const loaded: Record<string, { enabled: boolean, chairs: number }> = {};
    const savedSettings = election.courseSettings || {};
    courses.forEach(c => {
      const p = c.studentPrefix;
      loaded[p] = savedSettings[p] !== undefined
        ? { enabled: true, chairs: Number(savedSettings[p]) }
        : { enabled: false, chairs: 1 };
    });
    setEditCourseConfig(loaded);
  };

  const handleSaveEdit = async (id: string) => {
    const courseSettings = Object.entries(editCourseConfig)
      .filter(([_, config]) => config.enabled)
      .reduce((acc, [prefix, config]) => { acc[prefix] = config.chairs; return acc; }, {} as Record<string, number>);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/elections/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title: editTitle, courseSettings })
      });
      if (res.ok) { alert('Election Updated!'); setEditingId(null); onRefresh(); }
      else { alert(`Failed: ${res.status}`); }
    } catch (err: any) { alert(`Error: ${err.message}`); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#4c0519]/10 rounded-sm">
            <Vote size={16} className="text-[#4c0519]" />
          </div>
          <h3 className="text-base font-bold text-slate-900 uppercase tracking-tight">Elections</h3>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">({elections.length})</span>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-[#c5a021] text-black px-4 py-2 rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-yellow-400 transition-all flex items-center gap-2"
        >
          <Plus size={14} /> New
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddElection} className="mb-4 p-5 bg-slate-50 border border-slate-200 rounded-sm">
          <div className="mb-3">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Election Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., SRC Election 2026" required
              className="w-full bg-white border border-slate-200 rounded-sm px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#c5a021] transition-colors placeholder:text-slate-400" />
          </div>
          <div className="mb-3">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Course Configuration</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {courses.map(course => (
                <div key={course.id} className="p-3 bg-white border border-slate-200 rounded-sm">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-900">{course.studentPrefix}</span>
                    <input type="checkbox" checked={courseConfig[course.studentPrefix]?.enabled || false}
                      onChange={(e) => setCourseConfig({ ...courseConfig, [course.studentPrefix]: { ...courseConfig[course.studentPrefix], enabled: e.target.checked } })}
                      className="w-3.5 h-3.5" />
                  </div>
                  <input type="number" min="1"
                    value={courseConfig[course.studentPrefix]?.chairs || 1}
                    onChange={(e) => setCourseConfig({ ...courseConfig, [course.studentPrefix]: { ...courseConfig[course.studentPrefix], chairs: Number(e.target.value) } })}
                    disabled={!courseConfig[course.studentPrefix]?.enabled}
                    className="w-full bg-white border border-slate-200 rounded-sm px-2 py-1 text-xs text-slate-900 text-center disabled:opacity-40" />
                </div>
              ))}
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

      <div className="space-y-2">
        {elections.map(election => (
          <div key={election.id} className="bg-slate-50 border border-slate-200 rounded-sm p-4">
            {editingId === election.id ? (
              <div className="space-y-3">
                <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-sm px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#c5a021]" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {courses.map(course => (
                    <div key={course.id} className="p-2 bg-white border border-slate-200 rounded-sm">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-slate-900">{course.studentPrefix}</span>
                        <input type="checkbox" checked={editCourseConfig[course.studentPrefix]?.enabled || false}
                          onChange={(e) => setEditCourseConfig({ ...editCourseConfig, [course.studentPrefix]: { ...editCourseConfig[course.studentPrefix], enabled: e.target.checked } })} />
                      </div>
                      <input type="number" min="1"
                        value={editCourseConfig[course.studentPrefix]?.chairs || 1}
                        onChange={(e) => setEditCourseConfig({ ...editCourseConfig, [course.studentPrefix]: { ...editCourseConfig[course.studentPrefix], chairs: Number(e.target.value) } })}
                        disabled={!editCourseConfig[course.studentPrefix]?.enabled}
                        className="w-full bg-white border border-slate-200 rounded-sm px-2 py-1 text-xs text-center disabled:opacity-40" />
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleSaveEdit(election.id)} className="bg-green-100 text-green-700 px-4 py-1.5 rounded text-[10px] font-black uppercase tracking-widest hover:bg-green-200 transition flex items-center gap-1"><Save size={12} /> Save</button>
                  <button onClick={() => setEditingId(null)} className="bg-red-100 text-red-600 px-4 py-1.5 rounded text-[10px] font-black uppercase tracking-widest hover:bg-red-200 transition flex items-center gap-1"><X size={12} /> Cancel</button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-900">{election.title}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">
                    {Object.keys(election.courseSettings || {}).join(', ') || 'No courses'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                    election.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {election.status}
                  </span>
                  <button onClick={() => handleToggleStatus(election.id, election.status)}
                    className="p-1.5 hover:bg-slate-200 rounded transition"
                    title={election.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}>
                    {election.status === 'ACTIVE' ? <XCircle size={14} className="text-red-500" /> : <CheckCircle size={14} className="text-green-600" />}
                  </button>
                  <button onClick={() => handleEditClick(election)} className="p-1.5 hover:bg-slate-200 rounded transition">
                    <Edit2 size={14} className="text-slate-500" />
                  </button>
                  <button onClick={() => handleDeleteElection(election.id)} className="p-1.5 hover:bg-slate-200 rounded transition">
                    <Trash2 size={14} className="text-red-500" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        {elections.length === 0 && (
          <p className="text-slate-400 text-sm italic text-center py-6">No elections created yet.</p>
        )}
      </div>
    </div>
  );
}
