<<<<<<< Updated upstream
import Image from "next/image";
=======
"use client";

import Image from 'next/image';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const roles = ['STUDENT', 'CANDIDATE', 'OFFICIAL'];
  const adminRoles = [
    { id: 'ADMIN', label: 'ADMIN', icon: '🛡️' },
    { id: 'SUPERADMIN', label: 'SUPERADMIN', icon: '✅' },
    { id: 'ADVISOR', label: 'ADVISOR', icon: '🎓' },
  ];
  
  const [activeRole, setActiveRole] = useState('STUDENT');
  const router = useRouter();
>>>>>>> Stashed changes

  return (
<<<<<<< Updated upstream
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            To get started, edit the page.tsx file.
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Looking for a starting point or more instructions? Head over to{" "}
            <a
              href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-zinc-950 dark:text-zinc-50"
            >
              Templates
            </a>{" "}
            or the{" "}
            <a
              href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-zinc-950 dark:text-zinc-50"
            >
              Learning
            </a>{" "}
            center.
          </p>
        </div>
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <a
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[158px]"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={16}
              height={16}
            />
            Deploy Now
          </a>
          <a
            className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Documentation
          </a>
=======
    <div className="min-h-screen bg-[#0a1120] flex flex-col font-sans">
      
      {/* NAVBAR */}
      <nav className="flex items-center justify-between px-12 py-6 border-b border-white/5 bg-[#0a1120]">
        <div className="flex items-center gap-8">
          <span className="text-white font-black text-xl tracking-tight">MPP Voting Portal</span>
          <div className="hidden md:flex gap-6 text-sm font-semibold text-gray-400">
            <button className="text-white border-b-2 border-[#ffdc00] pb-1">Dashboard</button>
            <button className="hover:text-white transition-colors">Candidates</button>
            <button className="hover:text-white transition-colors">Elections</button>
            <button className="hover:text-white transition-colors">Results</button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-gray-400 hover:text-white"><span className="text-xl"></span></button>
          <button className="text-gray-400 hover:text-white"><span className="text-xl">🏛️</span></button>
          <button onClick={() => router.push('/login')} className="bg-[#0a1120] border border-white/20 text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-white/5 transition-all">Sign In</button>
          <button className="bg-white/5 text-white px-6 py-2 rounded-lg font-bold text-sm border border-white/10">Support</button>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col md:flex-row">
        
        {/* LEFT SECTION: BRANDING */}
        <div className="flex-1 flex flex-col justify-center px-20 relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]"></div>
          
          <div className="relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 bg-[#1a2436] border border-[#ffdc00]/30 px-4 py-1.5 rounded-full">
              <span className="text-[#ffdc00] text-[10px] font-black uppercase tracking-widest">✨ Official Portal: Kolej Profesional Mara</span>
            </div>
            
            <h1 className="text-8xl font-black text-white leading-[0.9] tracking-tighter">
              Voices United<br />
              <span className="text-[#ffdc00]">Future Ignited</span>
            </h1>
            
            <p className="text-gray-400 text-xl max-w-lg font-medium leading-relaxed">
              Experience the next generation of student governance. Secure, anonymous, and blockchain-verified voting for the future leaders of our institution.
            </p>

            <div className="flex gap-4 pt-4">
              <button onClick={() => router.push('/login')} className="bg-[#8b6e00] hover:bg-[#ffdc00] text-white hover:text-[#0a1120] px-8 py-4 rounded-xl font-bold transition-all flex items-center gap-3 group">
                VOTER LOGIN 
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </button>
              <button className="bg-white/5 border border-white/10 hover:bg-white/10 text-white px-8 py-4 rounded-xl font-bold transition-all">
                VIEW MANIFESTOS
              </button>
            </div>

            <div className="flex gap-12 pt-10 border-t border-white/5">
              <div>
                <p className="text-white text-3xl font-black">4.2k+</p>
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Registered Voters</p>
              </div>
              <div>
                <p className="text-white text-3xl font-black">100%</p>
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Immutable Audit</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SECTION: LOGIN CARD */}
        <div className="flex-1 flex items-center justify-center bg-[#0a1120]/50 p-12">
          <div className="bg-[#e2e8f0] w-full max-w-xl rounded-[2.5rem] p-12 shadow-2xl space-y-8">
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-[#0f172a]">Login</h2>
              <p className="text-[#64748b] font-medium">Please select your role</p>
            </div>

            {/* ROLE SELECTOR */}
            <div className="flex bg-[#cbd5e1] p-1.5 rounded-xl">
              {roles.map((role) => (
                <button
                  key={role}
                  onClick={() => setActiveRole(role)}
                  className={`flex-1 py-3 rounded-lg text-[11px] font-black tracking-widest transition-all ${
                    activeRole === role ? 'bg-white text-[#0f172a] shadow-sm' : 'text-[#64748b] hover:text-[#0f172a]'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>

            {/* FORM */}
            <form className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#475569] uppercase tracking-widest ml-1">Student ID</label>
                <input 
                  type="text" 
                  placeholder="e.g. BCSXXXX-XXX"
                  className="w-full px-6 py-5 bg-white border border-[#cbd5e1] rounded-xl outline-none focus:ring-2 focus:ring-[#0f172a]/10 transition-all text-[#0f172a] font-bold placeholder:text-[#94a3b8]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#475569] uppercase tracking-widest ml-1">Secure Password</label>
                <input 
                  type="password" 
                  className="w-full px-6 py-5 bg-white border border-[#cbd5e1] rounded-xl outline-none focus:ring-2 focus:ring-[#0f172a]/10 transition-all text-[#0f172a] font-bold placeholder:text-[#94a3b8]"
                />
              </div>

              <button className="w-full bg-[#0f172a] hover:bg-[#1e293b] text-white font-black py-5 rounded-xl shadow-lg transition-all transform active:scale-[0.99] uppercase tracking-widest text-sm">
                Login
              </button>
            </form>

            <p className="text-center text-[10px] text-[#94a3b8] font-bold italic tracking-wide">
              Restricted portal for administrative hierarchies
            </p>

            {/* ADMIN QUICK ACCESS */}
            <div className="flex justify-center gap-8 pt-4">
              {adminRoles.map((admin) => (
                <button key={admin.id} className="group flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-xl border-2 border-dotted border-[#cbd5e1] group-hover:border-[#0f172a] group-hover:bg-white transition-all flex items-center justify-center text-xl grayscale group-hover:grayscale-0">
                    {admin.icon}
                  </div>
                  <span className="text-[9px] font-black text-[#94a3b8] group-hover:text-[#0f172a] tracking-tighter uppercase">{admin.label}</span>
                </button>
              ))}
            </div>
          </div>
>>>>>>> Stashed changes
        </div>
      </main>

      {/* FOOTER */}
      <footer className="py-8 text-center bg-[#0a1120]">
        <span className="text-white/10 text-[11px] font-black uppercase tracking-[0.4em]">
          Kolej Profesional Mara — 2026
        </span>
      </footer>
    </div>
  );
}