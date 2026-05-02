"use client";

import React from 'react';

// The interface allows the Student Dashboard to pass the navigation function down
interface HeaderProps {
  onVoteClick?: () => void;
}

export default function StudentHeader({ onVoteClick }: HeaderProps) {
  return (
    <header className="h-[100px] bg-[#4c0519] text-white flex items-center justify-between px-12 w-full sticky top-0 z-[100] shadow-2xl border-b border-white/5">
      
      {/* LEFT SIDE: LOGO & BRANDING */}
      <div className="flex items-center gap-6 shrink-0">
        <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all hover:scale-105 active:scale-95 my-2">
          <svg 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="#4c0519" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="w-8 h-8"
          >
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </div>
        
        <div className="flex flex-col">
          <span className="text-[13px] font-black uppercase tracking-[0.2em] leading-tight">
            SRC Voting System
          </span>
          <span className="text-[10px] font-bold opacity-40 uppercase tracking-[0.4em] mt-0.5">
            Official Student Portal
          </span>
        </div>
      </div>

      {/* RIGHT SIDE: NAVIGATION & VOTE BUTTON */}
      <div className="flex items-center gap-12">
        <nav className="hidden md:flex items-center gap-10">
          <a href="#" className="text-[11px] font-black uppercase tracking-[0.3em] hover:text-yellow-500 transition-all duration-300 relative group">
            Candidates
            <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-yellow-500 transition-all duration-300 group-hover:w-full"></span>
          </a>
          <a href="#" className="text-[11px] font-black uppercase tracking-[0.3em] hover:text-yellow-500 transition-all duration-300 relative group">
            Results
            <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-yellow-500 transition-all duration-300 group-hover:w-full"></span>
          </a>
        </nav>

        {/* This button now correctly calls the function passed from the dashboard */}
        <button 
          onClick={onVoteClick}
          className="bg-[#c5a021] hover:bg-yellow-500 text-black px-10 py-3.5 rounded-full text-[11px] font-black uppercase tracking-[0.25em] transition-all hover:shadow-[0_0_25px_rgba(197,160,33,0.3)] active:scale-95 shadow-lg"
        >
          Vote Now
        </button>
      </div>
    </header>
  );
}