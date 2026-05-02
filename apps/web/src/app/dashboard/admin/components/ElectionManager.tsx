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

  // Initialize course config when courses change
  React.useEffect(() => {
    if (courses.length > 0 && Object.keys(courseConfig).length === 0) {
      const initial: Record<string, { enabled: boolean, chairs: number }> = {};
      courses.forEach(c => {
        initial[c.studentPrefix] = { enabled: false, chairs: 1 };
      });
      setCourseConfig(initial);
    }
  }, [courses]);

  const resetAddForm = () => {
    setTitle('');
    const initial: Record<string, { enabled: boolean, chairs: number }> = {};
    courses.forEach(c => {
      initial[c.studentPrefix] = { enabled: false, chairs: 1 };
    });
    setCourseConfig(initial);
    setShowAddForm(false);
  };

  const handleAddElection = async (e: React.FormEvent) => {
    e.preventDefault();
    const courseSettings = Object.entries(courseConfig)
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
        body: JSON.stringify({ title, courseSettings })
      });
      if (res.ok) {
        alert('Election Created!');
        resetAddForm();
        onRefresh();
      } else {
        alert(`Failed: ${res.status}`);
      }
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
      if (savedSettings[p] !== undefined) {
        loaded[p] = { enabled: true, chairs: Number(savedSettings[p]) };
      } else {
        loaded[p] = { enabled: false, chairs: 1 };
      }
    });
    setEditCourseConfig(loaded);
  };

  const handleSaveEdit = async (id: string) => {
    const courseSettings = Object.entries(editCourseConfig)
      .filter(([_, config]) => config.enabled)
      .reduce((acc, [prefix, config]) => {
        acc[prefix] = config.chairs;
        return acc;
      }, {} as Record<string, number>);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/elections/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title: editTitle, courseSettings })
      });
      if (res.ok) {
        alert('Election Updated!');
        setEditingId(null);
        onRefresh();
      } else {
        alert(`Failed: ${res.status}`);
      }
    } catch (err: any) { alert(`Error: ${err.message}`); }
  };

  return (
    <div className="bg-white/5 backdrop-blur-3xl rounded-sm border border-white/10 shadow-2xl mb-8 p-8 text-black">
      <div className="flex items-center justify-between mb-6 text-white">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#4c0519]/20 rounded-lg border border-white/10">
            <Vote size={20} className="text-white" />
          </div>
          <h3 className="text-2xl font-bold uppercase tracking-tighter">Election Management</h3>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">({elections.length})</span>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-[#c5a021] text-black px-6 py-3 rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-yellow-400 transition-all flex items-center gap-2"
        >
          <Plus size={16} /> New Election
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddElection} className="mb-6 p-6 bg-black/20 rounded-lg border border-white/10 text-black">
          <div className="mb-4">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Election Title</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., SRC Election 2026"
              className="w-full bg-white border-b border-slate-300 px-0 py-3 text-sm outline-none focus:border-[#4c0519] transition-colors font-bold text-black"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Course Configuration</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {courses.map(course => (
                <div key={course.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white">{course.studentPrefix}</span>
                    <input 
                      type="checkbox"
                      checked={courseConfig[course.studentPrefix]?.enabled || false}
                      onChange={(e) => setCourseConfig({
                        ...courseConfig,
                        [course.studentPrefix]: { ...courseConfig[course.studentPrefix], enabled: e.target.checked }
                      })}
                      className="w-4 h-4"
                    />
                  </div>
                  <input 
                    type="number"
                    min="1"
                    value={courseConfig[course.studentPrefix]?.chairs || 1}
                    onChange={(e) => setCourseConfig({
                      ...courseConfig,
                      [course.studentPrefix]: { ...courseConfig[course.studentPrefix], chairs: Number(e.target.value) }
                    })}
                    disabled={!courseConfig[course.studentPrefix]?.enabled}
                    className="w-full bg-white border-b border-slate-300 px-2 py-1 text-xs text-black text-center"
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-[#c5a021] text-black px-6 py-2 rounded text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
              <Save size={14} /> Create Election
            </button>
            <button type="button" onClick={resetAddForm} className="bg-white/10 text-white px-6 py-2 rounded text-[10px] font-black uppercase tracking-widest">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {elections.map(election => (
          <div key={election.id} className="p-6 bg-white/5 rounded-lg border border-white/10 flex items-center justify-between">
            {editingId === election.id ? (
              <div className="flex-1 flex gap-4 items-center">
                <input 
                  type="text" 
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="bg-slate-50 border-b border-slate-200 px-3 py-2 text-sm text-black flex-1"
                />
                <button onClick={() => handleSaveEdit(election.id)} className="text-green-500"><Save size={18} /></button>
                <button onClick={() => setEditingId(null)} className="text-red-500"><X size={18} /></button>
              </div>
            ) : (
              <>
                <div>
                  <p className="text-sm font-bold text-white">{election.title}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest">
                    {Object.keys(election.courseSettings || {}).join(', ') || 'No courses'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                    election.status === 'ACTIVE' ? 'bg-green-500 text-black' : 'bg-yellow-500 text-black'
                  }`}>
                    {election.status}
                  </span>
                  <button 
                    onClick={() => handleToggleStatus(election.id, election.status)}
                    className="p-2 hover:bg-white/10 rounded transition"
                    title={election.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                  >
                    {election.status === 'ACTIVE' ? <XCircle size={16} className="text-red-400" /> : <CheckCircle size={16} className="text-green-400" />}
                  </button>
                  <button onClick={() => handleEditClick(election)} className="p-2 hover:bg-white/10 rounded transition">
                    <Edit2 size={16} className="text-slate-400" />
                  </button>
                  <button onClick={() => handleDeleteElection(election.id)} className="p-2 hover:bg-white/10 rounded transition">
                    <Trash2 size={16} className="text-red-400" />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
        {elections.length === 0 && (
          <p className="text-slate-400 text-sm italic text-center py-8">No elections created yet.</p>
        )}
      </div>
    </div>
  );
}