"use client";

import React, { useState } from 'react';
import Link from 'next/link';

const ROLES = [
  { id: 'admin', label: 'ADMIN', icon: '👤', inputLabel: 'Email Address', placeholder: 'admin@university.edu' },
  { id: 'superadmin', label: 'SUPERADMIN', icon: '🛡️', inputLabel: 'System Email', placeholder: 'root@university.edu' },
  { id: 'advisor', label: 'MPP ADVISOR', icon: '🏛️', inputLabel: 'Official Email', placeholder: 'advisor@mpp.edu' },
  { id: 'student', label: 'STUDENT', icon: '🎓', inputLabel: 'Student ID', placeholder: 'BCSXXXX-XXX' },
  { id: 'candidate', label: 'CANDIDATE', icon: '📢', inputLabel: 'Student ID', placeholder: 'BCSXXXX-XXX' },
];

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState('advisor');
  const [hoveredRole, setHoveredRole] = useState<string | null>(null);

  // Determine which role info to show (hover takes priority for visual feedback)
  const activeRoleInfo = ROLES.find(r => r.id === (hoveredRole || selectedRole)) || ROLES[2];

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex flex-col font-sans selection:bg-red-200">
      {/* TOP HEADER */}
      <header className="p-6 flex justify-between items-center bg-white border-b border-gray-100">
        {/* Modernized font style (not Times New Roman) */}
        <h1 className="text-2xl font-semibold tracking-tight text-slate-800 font-[family-name:var(--font-serif)]">
          MPP <span className="font-light text-slate-400">Voting Portal</span>
        </h1>
        <div className="flex gap-4 text-slate-400">
          <span className="cursor-pointer hover:text-blue-500 transition">🛡️</span>
          <span className="cursor-pointer hover:text-red-500 transition">❓</span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-5xl bg-white shadow-2xl flex overflow-hidden min-h-[650px] rounded-sm border border-gray-200">
          
          {/* LEFT SIDE: HERO */}
          <div className="hidden md:flex w-1/2 relative bg-[#2D0A0A]">
            <img 
              src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop" 
              alt="Governance" 
              className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-luminosity"
            />
            <div className="relative z-10 p-12 flex flex-col justify-end h-full text-white">
              <div className="flex items-center gap-2 mb-4 bg-white/10 w-fit px-3 py-1 rounded backdrop-blur-md">
                <span className="text-[10px]">🔒</span>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Secure Gateway</span>
              </div>
              <h2 className="text-4xl font-medium mb-6 leading-tight italic">
                Institutional <br /> Governance for a <br /> Digital Era.
              </h2>
              <p className="text-sm opacity-60 leading-relaxed max-w-xs font-light">
                Authenticate your credentials to manage sovereign electoral processes with integrity.
              </p>
            </div>
          </div>

          {/* RIGHT SIDE: FORM */}
          <div className="w-full md:w-1/2 p-12 flex flex-col justify-center bg-white">
            <h3 className="text-5xl font-medium text-slate-900 mb-2 tracking-tighter italic">Login</h3>
            <p className="text-sm text-slate-400 mb-10">Select your role and enter credentials.</p>

            <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
              {/* ROLE SELECTION */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Select Access Role</label>
                <div className="grid grid-cols-5 gap-2">
                  {ROLES.map((role) => (
                    <button
                      key={role.id}
                      type="button"
                      onMouseEnter={() => setHoveredRole(role.id)}
                      onMouseLeave={() => setHoveredRole(null)}
                      onClick={() => setSelectedRole(role.id)}
                      className={`flex flex-col items-center justify-center py-4 border transition-all duration-300 ${
                        selectedRole === role.id 
                        ? 'border-slate-900 bg-white shadow-md z-10 scale-105' 
                        : hoveredRole === role.id 
                          ? 'border-slate-300 bg-slate-50 opacity-100 scale-105 shadow-sm' // "Lights up" on hover
                          : 'border-transparent bg-slate-50 opacity-40 grayscale'
                      }`}
                    >
                      <span className="text-xl mb-2">{role.icon}</span>
                      <span className="text-[8px] font-black text-center">{role.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* DYNAMIC ID/EMAIL INPUT */}
              <div className="space-y-2 group">
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 transition-colors group-focus-within:text-red-900">
                  {activeRoleInfo.inputLabel}
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20 text-xs transition-opacity group-focus-within:opacity-100">
                    {activeRoleInfo.id === 'student' || activeRoleInfo.id === 'candidate' ? '🆔' : '✉️'}
                  </span>
                  <input
                    type="text"
                    placeholder={activeRoleInfo.placeholder}
                    className="w-full bg-slate-50 border border-transparent px-12 py-4 text-sm outline-none focus:bg-white focus:border-slate-200 focus:ring-4 focus:ring-slate-50 transition-all rounded-sm"
                  />
                </div>
              </div>

              {/* PASSWORD INPUT */}
              <div className="space-y-2 group">
                <div className="flex justify-between items-center">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500">Password</label>
                  <button type="button" className="text-[9px] font-black uppercase tracking-widest text-red-900 hover:text-red-700 transition">Reset Code</button>
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20 text-xs transition-opacity group-focus-within:opacity-100">🔑</span>
                  <input
                    type="password"
                    placeholder="••••••••••••"
                    className="w-full bg-slate-50 border border-transparent px-12 py-4 text-sm outline-none focus:bg-white focus:border-slate-200 focus:ring-4 focus:ring-slate-50 transition-all rounded-sm"
                  />
                </div>
              </div>

              <Link href="/ballot">
                <button className="w-full bg-[#2D0A0A] text-white py-5 flex items-center justify-center gap-3 hover:bg-[#441212] active:scale-[0.98] transition-all shadow-xl shadow-red-950/20 uppercase text-[10px] font-black tracking-[0.3em]">
                  Secure Authorization <span>→</span>
                </button>
              </Link>
            </form>

            {/* STATUS BAR */}
            <div className="mt-12 pt-8 border-t border-slate-100 flex justify-between items-center text-[9px] font-bold uppercase tracking-widest text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Status: System Online
              </div>
              <div>Port: 443</div>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="p-8 flex flex-col items-center bg-white border-t border-gray-100 space-y-6">
        <div className="w-full flex flex-col md:flex-row justify-between items-center text-[9px] font-bold uppercase tracking-widest text-slate-400">
          <p>© 2024 Institutional Voting Authority. Protocol V4.2</p>
          <div className="flex gap-8 mt-4 md:mt-0">
            <a href="#" className="hover:text-slate-900 transition">Privacy Policy</a>
            <a href="#" className="hover:text-slate-900 transition">Terms of Service</a>
            <a href="#" className="hover:text-slate-900 transition">Audit Logs</a>
          </div>
        </div>
        
        {/* DEVELOPER COPYRIGHT SECTION */}
        <div className="pt-6 border-t border-gray-50 w-full text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">
            Developed by <span className="text-slate-900">DevOps KitaBuild Studio</span>
          </p>
        </div>
      </footer>
    </div>
  );
}