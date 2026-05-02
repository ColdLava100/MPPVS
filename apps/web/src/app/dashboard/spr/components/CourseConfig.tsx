'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, Save, CheckCircle } from 'lucide-react';

interface CourseConfigProps {
  election: any;
  courses: any[];
  onRefresh: () => void;
}

export default function CourseConfig({ election, courses, onRefresh }: CourseConfigProps) {
  const [courseSettings, setCourseSettings] = useState<Record<string, { enabled: boolean, chairs: number }>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (election?.courseSettings) {
      const loaded: Record<string, { enabled: boolean, chairs: number }> = {};
      courses.forEach(c => {
        const p = c.studentPrefix;
        if (election.courseSettings[p] !== undefined) {
          loaded[p] = { enabled: true, chairs: Number(election.courseSettings[p]) };
        } else {
          loaded[p] = { enabled: false, chairs: 1 };
        }
      });
      setCourseSettings(loaded);
    } else if (courses.length > 0) {
      const initial: Record<string, { enabled: boolean, chairs: number }> = {};
      courses.forEach(c => {
        initial[c.studentPrefix] = { enabled: false, chairs: 1 };
      });
      setCourseSettings(initial);
    }
  }, [election, courses]);

  const handleSave = async () => {
    setIsSaving(true);
    const settings = Object.entries(courseSettings)
      .filter(([_, config]) => config.enabled)
      .reduce((acc, [prefix, config]) => {
        acc[prefix] = config.chairs;
        return acc;
      }, {} as Record<string, number>);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/elections/${election.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ courseSettings: settings })
      });
      if (res.ok) {
        setSaved(true);
        onRefresh();
        setTimeout(() => setSaved(false), 2000);
      } else {
        alert(`Failed: ${res.status}`);
      }
    } catch (err: any) { alert(`Error: ${err.message}`); }
    setIsSaving(false);
  };

  if (!election) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-400">Please select an election in Step 1 first.</p>
      </div>
    );
  }

return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-[#4c0519]/20 rounded-lg border border-white/10">
          <BookOpen size={20} className="text-white" />
        </div>
        <div>
          <h3 className="text-2xl font-bold uppercase tracking-tighter text-[#4c0519]">Course Configuration</h3>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Configure seats for: {election.title}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {courses.map(course => (
          <div 
            key={course.id} 
            className={`p-4 border rounded-sm transition-all ${
              courseSettings[course.studentPrefix]?.enabled 
                ? 'border-[#4c0519] bg-[#4c0519]/5' 
                : 'border-slate-200 bg-white/50'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-bold text-black">{course.studentPrefix}</p>
                <p className="text-[9px] text-slate-500">{course.name}</p>
              </div>
              <input 
                type="checkbox"
                checked={courseSettings[course.studentPrefix]?.enabled || false}
                onChange={(e) => setCourseSettings({
                  ...courseSettings,
                  [course.studentPrefix]: { 
                    ...courseSettings[course.studentPrefix], 
                    enabled: e.target.checked 
                  }
                })}
                className="w-5 h-5 accent-[#4c0519]"
              />
            </div>
            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                Number of Seats
              </label>
              <input 
                type="number"
                min="1"
                max="20"
                value={courseSettings[course.studentPrefix]?.chairs || 1}
                onChange={(e) => setCourseSettings({
                  ...courseSettings,
                  [course.studentPrefix]: { 
                    ...courseSettings[course.studentPrefix], 
                    chairs: Number(e.target.value) 
                  }
                })}
                disabled={!courseSettings[course.studentPrefix]?.enabled}
                className="w-full bg-white border-b border-slate-300 px-2 py-2 text-sm text-black text-center font-bold"
              />
            </div>
          </div>
        ))}
      </div>

      {courses.length === 0 && (
        <div className="text-center py-8">
          <p className="text-slate-400">No courses available. Please create courses first.</p>
        </div>
      )}

      <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-sm">
        <p className="text-sm text-slate-600">
          <strong>Summary:</strong> {Object.values(courseSettings).filter(c => c.enabled).length} courses selected with{' '}
          {Object.entries(courseSettings).filter(([_, c]) => c.enabled).reduce((acc, [_, c]) => acc + c.chairs, 0)} total seats
        </p>
      </div>

      {/* Standardized Action Footer */}
      <div className="mt-10 pt-6 border-t border-slate-200 flex items-center justify-end gap-4">
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-[#c5a021] text-black px-6 py-3 rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-yellow-400 transition-all flex items-center gap-2"
        >
          {saved ? <CheckCircle size={16} /> : <Save size={16} />}
          {isSaving ? 'Saving...' : saved ? 'Saved!' : 'Save Configuration'}
        </button>
      </div>
    </div>
  );
}