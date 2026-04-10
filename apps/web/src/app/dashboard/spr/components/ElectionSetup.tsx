'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Vote, CheckCircle, Save } from 'lucide-react';

interface ElectionSetupProps {
  elections: any[];
  courses: any[];
  activeElectionId: string | null;
  onRefresh: () => void;
  onSelectElection: (election: any) => void;
}

export default function ElectionSetup({ elections, courses, activeElectionId, onRefresh, onSelectElection }: ElectionSetupProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [courseConfig, setCourseConfig] = useState<Record<string, { enabled: boolean, chairs: number }>>({});

  useEffect(() => {
    if (courses.length > 0 && Object.keys(courseConfig).length === 0) {
      const initial: Record<string, { enabled: boolean, chairs: number }> = {};
      courses.forEach(c => {
        initial[c.studentPrefix] = { enabled: false, chairs: 1 };
      });
      setCourseConfig(initial);
    }
  }, [courses]);

  const draftElections = elections.filter(e => e.status === 'DRAFT');
  const activeElectionsList = elections.filter(e => e.status === 'ACTIVE');

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
        const newElection = await res.json();
        alert('Election Created!');
        resetAddForm();
        onRefresh();
        onSelectElection(newElection);
      } else {
        alert(`Failed: ${res.status}`);
      }
    } catch (err: any) { alert(`Error: ${err.message}`); }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-[#4c0519]/20 rounded-lg border border-white/10">
          <Vote size={20} className="text-white" />
        </div>
        <div>
          <h3 className="text-2xl font-bold uppercase tracking-tighter text-[#4c0519]">Election Setup</h3>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Create or select an election to begin</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-sm">
          <p className="text-[10px] font-black text-yellow-600 uppercase tracking-widest">Draft Elections</p>
          <p className="text-3xl font-bold text-yellow-700">{draftElections.length}</p>
        </div>
        <div className="p-4 bg-green-50 border border-green-200 rounded-sm">
          <p className="text-[10px] font-black text-green-600 uppercase tracking-widest">Active Elections</p>
          <p className="text-3xl font-bold text-green-700">{activeElectionsList.length}</p>
        </div>
      </div>

      {/* Create New Election */}
      <div className="mb-8">
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-[#c5a021] text-black px-6 py-3 rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-yellow-400 transition-all flex items-center gap-2"
        >
          <Plus size={16} /> Create New Election
        </button>

        {showAddForm && (
          <form onSubmit={handleAddElection} className="mt-4 p-6 bg-black/5 border border-white/10 rounded-sm">
            <div className="mb-4">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Election Title</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., MPP Election 2026"
                className="w-full bg-white border-b border-slate-300 px-0 py-3 text-sm outline-none focus:border-[#4c0519] transition-colors font-bold text-black"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Course Configuration</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {courses.map(course => (
                  <div key={course.id} className="p-3 bg-white/50 rounded border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-black">{course.studentPrefix}</span>
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
              <button type="button" onClick={resetAddForm} className="bg-white/10 text-slate-600 px-6 py-2 rounded text-[10px] font-black uppercase tracking-widest">
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Draft Elections List */}
      <div>
        <h4 className="text-lg font-bold uppercase tracking-tighter text-[#4c0519] mb-4">Select Draft Election</h4>
        {draftElections.length > 0 ? (
          <div className="space-y-3">
            {draftElections.map(election => (
              <div 
                key={election.id}
                onClick={() => onSelectElection(election)}
                className={`p-4 border rounded-sm cursor-pointer transition-all flex items-center justify-between ${
                  activeElectionId === election.id 
                    ? 'border-[#4c0519] bg-[#4c0519]/5' 
                    : 'border-slate-200 hover:border-[#4c0519]'
                }`}
              >
                <div>
                  <p className="text-sm font-bold text-black">{election.title}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest">
                    {Object.keys(election.courseSettings || {}).join(', ') || 'No courses configured'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {activeElectionId === election.id && (
                    <CheckCircle size={20} className="text-green-600" />
                  )}
                  <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-[9px] font-black uppercase">
                    DRAFT
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400 text-sm italic">No draft elections. Create one above to get started.</p>
        )}
      </div>
    </div>
  );
}