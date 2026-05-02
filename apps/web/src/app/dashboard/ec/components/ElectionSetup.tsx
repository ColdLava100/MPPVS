'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Vote, Save, Trash2 } from 'lucide-react';

interface ElectionSetupProps {
  elections: any[];
  courses: any[];
  activeElectionId: string | null;
  activeElection: any;
  onRefresh: () => void;
  onSelectElection: (election: any) => void;
  onBack: () => void;
  isEditMode?: boolean;
}

export default function ElectionSetup({
  elections,
  courses,
  activeElectionId,
  activeElection,
  onRefresh,
  onSelectElection,
  onBack,
  isEditMode = false
}: ElectionSetupProps) {
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('DRAFT');
  const [courseConfig, setCourseConfig] = useState<Record<string, { enabled: boolean, chairs: number }>>({});

  // Helper function to convert UTC ISO string to YYYY-MM-DDTHH:mm in local time
  const formatForDateTimeInput = (isoString: string) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  useEffect(() => {
    if (activeElection) {
      setTitle(activeElection.title || '');
      setStartDate(formatForDateTimeInput(activeElection.startDate));
      setEndDate(formatForDateTimeInput(activeElection.endDate));
      setStatus(activeElection.status || 'DRAFT');

      const settings: Record<string, { enabled: boolean, chairs: number }> = {};
      courses.forEach(c => {
        if (activeElection.courseSettings && activeElection.courseSettings[c.studentPrefix] !== undefined) {
          settings[c.studentPrefix] = {
            enabled: true,
            chairs: Number(activeElection.courseSettings[c.studentPrefix])
          };
        } else {
          settings[c.studentPrefix] = { enabled: false, chairs: 1 };
        }
      });
      setCourseConfig(settings);
    } else if (courses.length > 0 && Object.keys(courseConfig).length === 0) {
      const initial: Record<string, { enabled: boolean, chairs: number }> = {};
      courses.forEach(c => {
        initial[c.studentPrefix] = { enabled: false, chairs: 1 };
      });
      setCourseConfig(initial);
    }
  }, [activeElection, courses]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const courseSettings = Object.entries(courseConfig)
      .filter(([_, config]) => config.enabled)
      .reduce((acc, [prefix, config]) => {
        acc[prefix] = config.chairs;
        return acc;
      }, {} as Record<string, number>);

    const payload: any = {
      title,
      courseSettings,
      status,
      startDate: startDate || null,
      endDate: endDate || null,
    };

    try {
      let res;
      if (isEditMode && activeElectionId) {
        res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/elections/${activeElectionId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/elections`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        const election = await res.json();
        alert(isEditMode ? 'Election Updated!' : 'Election Created!');
        onRefresh();
        if (!isEditMode) {
          onSelectElection(election);
        }
      } else {
        alert(`Failed: ${res.status}`);
      }
    } catch (err: any) { alert(`Error: ${err.message}`); }
  };

  const handleDelete = async () => {
    if (!activeElectionId) return;
    if (!confirm('Are you sure you want to delete this election? This action cannot be undone.')) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/elections/${activeElectionId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        alert('Election deleted!');
        onRefresh();
        onBack();
      } else {
        alert(`Failed: ${res.status}`);
      }
    } catch (err: any) { alert(`Error: ${err.message}`); }
  };

  const resetForm = () => {
    setTitle('');
    setStartDate('');
    setEndDate('');
    setStatus('DRAFT');
    const initial: Record<string, { enabled: boolean, chairs: number }> = {};
    courses.forEach(c => {
      initial[c.studentPrefix] = { enabled: false, chairs: 1 };
    });
    setCourseConfig(initial);
  };

return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-[#4c0519]/20 rounded-lg border border-white/10">
          <Vote size={20} className="text-white" />
        </div>
        <div>
          <h3 className="text-2xl font-bold uppercase tracking-tighter text-[#4c0519]">
            {isEditMode ? `Edit: ${activeElection?.title}` : 'Election Setup'}
          </h3>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {isEditMode ? 'Modify election settings' : 'Create or select an election to begin'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Basic Info */}
        <div className="p-6 bg-white/95 border border-slate-200 rounded-sm">
          <h4 className="text-sm font-black text-[#4c0519] uppercase tracking-widest mb-4">Basic Information</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Election Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., SRC Election 2026"
                className="w-full bg-white border-b border-slate-300 px-0 py-3 text-sm outline-none focus:border-[#4c0519] transition-colors font-bold text-black"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-white border-b border-slate-300 px-0 py-3 text-sm outline-none focus:border-[#4c0519] transition-colors font-bold text-black"
              >
                <option value="DRAFT" className="text-black">Draft</option>
                <option value="ACTIVE" className="text-black">Active</option>
                <option value="COMPLETED" className="text-black">Completed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Start Date</label>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-white border-b border-slate-300 px-0 py-3 text-sm outline-none focus:border-[#4c0519] transition-colors font-bold text-black"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">End Date</label>
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-white border-b border-slate-300 px-0 py-3 text-sm outline-none focus:border-[#4c0519] transition-colors font-bold text-black"
              />
            </div>
          </div>
        </div>

        {/* Course Configuration */}
        <div className="p-6 bg-white/95 border border-slate-200 rounded-sm">
          <h4 className="text-sm font-black text-[#4c0519] uppercase tracking-widest mb-4">Course Configuration</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {courses.map(course => (
              <div key={course.id} className="p-3 bg-slate-50 rounded border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-black">{course.studentPrefix}</span>
                  <input
                    type="checkbox"
                    checked={courseConfig[course.studentPrefix]?.enabled || false}
                    onChange={(e) => setCourseConfig({
                      ...courseConfig,
                      [course.studentPrefix]: {
                        ...courseConfig[course.studentPrefix],
                        enabled: e.target.checked
                      }
                    })}
                    className="w-4 h-4 accent-[#4c0519]"
                  />
                </div>
                <input
                  type="number"
                  min="1"
                  value={courseConfig[course.studentPrefix]?.chairs || 1}
                  onChange={(e) => setCourseConfig({
                    ...courseConfig,
                    [course.studentPrefix]: {
                      ...courseConfig[course.studentPrefix],
                      chairs: Number(e.target.value)
                    }
                  })}
                  disabled={!courseConfig[course.studentPrefix]?.enabled}
                  className="w-full bg-white border-b border-slate-300 px-2 py-1 text-xs text-black text-center"
                />
                <p className="text-[9px] text-slate-500 mt-1">seats</p>
              </div>
            ))}
          </div>
        </div>

        {/* Standardized Action Footer */}
        <div className="mt-10 pt-6 border-t border-slate-200 flex items-center justify-end gap-4">
          <button type="button" onClick={resetForm} className="bg-slate-100 text-slate-600 px-6 py-3 rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">
            Reset
          </button>
          {isEditMode && (
            <button type="button" onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-sm text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all">
              <Trash2 size={16} /> Delete Election
            </button>
          )}
          <button type="submit" className="bg-[#c5a021] text-black px-6 py-3 rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-yellow-400 transition-all flex items-center gap-2">
            <Save size={16} /> {isEditMode ? 'Save Changes' : 'Create Election'}
          </button>
        </div>
      </form>
    </div>
  );
}