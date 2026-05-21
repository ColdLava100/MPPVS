'use client';

import React, { useState } from 'react';
import { BookOpen, Plus, Trash2, Loader2 } from 'lucide-react';

interface CourseManagementProps {
  courses: any[];
  onRefresh: () => void;
}

export default function CourseManagement({ courses, onRefresh }: CourseManagementProps) {
  const [courseCode, setCourseCode] = useState('');
  const [coursePrefixName, setCoursePrefixName] = useState('');
  const [courseName, setCourseName] = useState('');
  const [addingCourse, setAddingCourse] = useState(false);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseCode || !coursePrefixName || !courseName) { return; }
    setAddingCourse(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ code: courseCode, studentPrefix: coursePrefixName, name: courseName })
      });
      if (res.ok) {
        alert('Course created!');
        setCourseCode(''); setCoursePrefixName(''); setCourseName('');
        onRefresh();
      } else {
        alert(`Failed: ${res.status}`);
      }
    } catch (err: any) { alert(`Error: ${err.message}`); }
    setAddingCourse(false);
  };

  const handleDeleteCourse = async (id: string) => {
    if (!confirm('Delete this course?')) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/${id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) { onRefresh(); }
      else alert(`Failed: ${res.status}`);
    } catch (err: any) { alert(`Error: ${err.message}`); }
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-[#4c0519]/10 rounded-sm">
          <BookOpen size={16} className="text-[#4c0519]" />
        </div>
        <h3 className="text-base font-bold text-slate-900 uppercase tracking-tight">Manage Courses</h3>
      </div>

      {/* Create Course */}
      <form onSubmit={handleCreateCourse} className="flex flex-wrap items-end gap-3 mb-4 p-4 bg-slate-50 border border-slate-200 rounded-sm">
        <div className="flex-1 min-w-[120px]">
          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Code</label>
          <input type="text" value={courseCode} onChange={(e) => setCourseCode(e.target.value)} placeholder="e.g., DCS"
            className="w-full bg-white border border-slate-200 rounded-sm px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#c5a021] transition-colors placeholder:text-slate-400" required />
        </div>
        <div className="flex-1 min-w-[120px]">
          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Prefix</label>
          <input type="text" value={coursePrefixName} onChange={(e) => setCoursePrefixName(e.target.value)} placeholder="e.g., BCS"
            className="w-full bg-white border border-slate-200 rounded-sm px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#c5a021] transition-colors placeholder:text-slate-400" required />
        </div>
        <div className="flex-[2] min-w-[200px]">
          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Name</label>
          <input type="text" value={courseName} onChange={(e) => setCourseName(e.target.value)} placeholder="e.g., Diploma in Computer Science"
            className="w-full bg-white border border-slate-200 rounded-sm px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#c5a021] transition-colors placeholder:text-slate-400" required />
        </div>
        <button type="submit" disabled={addingCourse}
          className="bg-[#c5a021] text-black px-4 py-2 rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-yellow-400 transition-all flex items-center gap-2 disabled:opacity-50">
          {addingCourse ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
          Add
        </button>
      </form>

      {/* Course List */}
      <div className="space-y-1.5">
        {courses.map((course: any) => (
          <div key={course.id} className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-sm">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-900 bg-white border border-slate-200 px-2 py-0.5 rounded">{course.studentPrefix}</span>
              <span className="text-xs text-slate-600">{course.code}</span>
              <span className="text-xs text-slate-500">{course.name}</span>
            </div>
            <button onClick={() => handleDeleteCourse(course.id)} className="p-1 hover:bg-red-50 rounded transition">
              <Trash2 size={14} className="text-red-400 hover:text-red-600" />
            </button>
          </div>
        ))}
        {courses.length === 0 && <p className="text-slate-400 text-sm italic text-center py-4">No courses created yet.</p>}
      </div>
    </div>
  );
}
