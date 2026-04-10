'use client';

import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Save, X, BookOpen } from 'lucide-react';

interface SprCourseManagerProps {
  courses: any[];
  onRefresh: () => void;
}

export default function SprCourseManager({ courses, onRefresh }: SprCourseManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Add form state
  const [code, setCode] = useState('');
  const [studentPrefix, setStudentPrefix] = useState('');
  const [name, setName] = useState('');
  
  // Edit form state
  const [editCode, setEditCode] = useState('');
  const [editStudentPrefix, setEditStudentPrefix] = useState('');
  const [editName, setEditName] = useState('');

  const resetAddForm = () => {
    setCode('');
    setStudentPrefix('');
    setName('');
    setShowAddForm(false);
  };

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ code, studentPrefix, name })
      });
      if (res.ok) {
        alert('Course Created!');
        resetAddForm();
        onRefresh();
      } else {
        alert(`Failed: ${res.status}`);
      }
    } catch (err: any) { alert(`Error: ${err.message}`); }
  };

  const handleDeleteCourse = async (id: string) => {
    if (!confirm('Delete this course?')) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/${id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) { onRefresh(); }
      else alert(`Failed: ${res.status}`);
    } catch (err: any) { alert(`Error: ${err.message}`); }
  };

  const handleEditClick = (course: any) => {
    setEditingId(course.id);
    setEditCode(course.code || '');
    setEditStudentPrefix(course.studentPrefix || '');
    setEditName(course.name || '');
  };

  const handleSaveEdit = async (id: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ code: editCode, studentPrefix: editStudentPrefix, name: editName })
      });
      if (res.ok) {
        alert('Course Updated!');
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
            <BookOpen size={20} className="text-white" />
          </div>
          <h3 className="text-2xl font-bold uppercase tracking-tighter">Course Management</h3>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">({courses.length})</span>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-[#c5a021] text-black px-6 py-3 rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-yellow-400 transition-all flex items-center gap-2"
        >
          <Plus size={16} /> New Course
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddCourse} className="mb-6 p-6 bg-black/20 rounded-lg border border-white/10 text-black">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Course Code</label>
              <input 
                type="text" 
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g., DCS"
                className="w-full bg-white border-b border-slate-300 px-0 py-3 text-sm outline-none focus:border-[#4c0519] transition-colors font-bold text-black"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Student Prefix</label>
              <input 
                type="text" 
                value={studentPrefix}
                onChange={(e) => setStudentPrefix(e.target.value)}
                placeholder="e.g., BCS"
                className="w-full bg-white border-b border-slate-300 px-0 py-3 text-sm outline-none focus:border-[#4c0519] transition-colors font-bold text-black"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Course Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Diploma in Computer Science"
                className="w-full bg-white border-b border-slate-300 px-0 py-3 text-sm outline-none focus:border-[#4c0519] transition-colors font-bold text-black"
                required
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button type="submit" className="bg-[#c5a021] text-black px-6 py-2 rounded text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
              <Save size={14} /> Create Course
            </button>
            <button type="button" onClick={resetAddForm} className="bg-white/10 text-white px-6 py-2 rounded text-[10px] font-black uppercase tracking-widest">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {courses.map(course => (
          <div key={course.id} className="p-6 bg-white/5 rounded-lg border border-white/10 flex items-center justify-between">
            {editingId === course.id ? (
              <div className="flex-1 flex gap-4 items-center">
                <input 
                  type="text" 
                  value={editCode}
                  onChange={(e) => setEditCode(e.target.value)}
                  className="bg-white border-b border-slate-300 px-3 py-2 text-sm text-black flex-1"
                  placeholder="Code"
                />
                <input 
                  type="text" 
                  value={editStudentPrefix}
                  onChange={(e) => setEditStudentPrefix(e.target.value)}
                  className="bg-white border-b border-slate-300 px-3 py-2 text-sm text-black flex-1"
                  placeholder="Prefix"
                />
                <input 
                  type="text" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="bg-white border-b border-slate-300 px-3 py-2 text-sm text-black flex-2"
                  placeholder="Name"
                />
                <button onClick={() => handleSaveEdit(course.id)} className="text-green-500"><Save size={18} /></button>
                <button onClick={() => setEditingId(null)} className="text-red-500"><X size={18} /></button>
              </div>
            ) : (
              <>
                <div>
                  <p className="text-sm font-bold text-white">{course.code}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest">
                    Prefix: {course.studentPrefix} | {course.name}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => handleEditClick(course)} className="p-2 hover:bg-white/10 rounded transition">
                    <Edit2 size={16} className="text-slate-400" />
                  </button>
                  <button onClick={() => handleDeleteCourse(course.id)} className="p-2 hover:bg-white/10 rounded transition">
                    <Trash2 size={16} className="text-red-400" />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
        {courses.length === 0 && (
          <p className="text-slate-400 text-sm italic text-center py-8">No courses created yet.</p>
        )}
      </div>
    </div>
  );
}