"use client";

import React from 'react';
import Link from 'next/link';

export default function Header() {
  return (
    /* Changed bg-white to bg-[#4c0519] and border color to match */
    <nav className="flex justify-between items-center px-4 md:px-10 py-4 md:py-5 border-b border-red-950 bg-[#4c0519] sticky top-0 z-50 shadow-2xl">
      
      {/* Brand / Logo Section */}
      <div className="flex items-center gap-2 md:gap-3">
        <div className="w-7 h-7 md:w-8 md:h-8 bg-white rounded flex items-center justify-center text-[#4c0519] text-[10px] md:text-xs shadow-lg">
          🏛️
        </div>
        <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-white/90">
          SRC Voting System
        </span>
      </div>

      {/* Navigation Links */}
      <div className="flex items-center gap-4 md:gap-8">
        {['Candidates', 'Results'].map((link) => (
          <a 
            key={link} 
            href="#" 
            className="text-[10px] md:text-[11px] font-bold uppercase tracking-widest text-white/70 hover:text-white transition-colors"
          >
            {link}
          </a>
        ))}
        
        {/* Login Button */}
        <Link href="/login">
          <button className="bg-white text-[#4c0519] px-5 md:px-8 py-2 md:py-2.5 rounded-sm text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] ml-2 md:ml-4 hover:bg-slate-100 transition-all shadow-xl active:scale-95">
            Login
          </button>
        </Link>
      </div>
    </nav>
  );
}