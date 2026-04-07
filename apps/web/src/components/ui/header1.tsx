"use client";

import React from 'react';
import Link from 'next/link';

export default function Header() {
  return (
    /* Changed bg-white to bg-[#4c0519] and border color to match */
    <nav className="flex justify-between items-center px-10 py-5 border-b border-red-950 bg-[#4c0519] sticky top-0 z-50 shadow-2xl">
      
      {/* Brand / Logo Section */}
      <div className="flex items-center gap-3">
        {/* Swapped to white background for the icon to pop against the red header */}
        <div className="w-8 h-8 bg-white rounded flex items-center justify-center text-[#4c0519] text-xs shadow-lg">
          🏛️
        </div>
        {/* Changed text color to white with high opacity */}
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/90">
          MPP Voting System
        </span>
      </div>

      {/* Navigation Links */}
      <div className="flex items-center gap-8">
        {['Candidates', 'Results'].map((link) => (
          <a 
            key={link} 
            href="#" 
            /* Changed text to white/70 and hover to pure white */
            className="text-[11px] font-bold uppercase tracking-widest text-white/70 hover:text-white transition-colors"
          >
            {link}
          </a>
        ))}
        
        {/* Login Button - Changed to white/yellow style to stand out on red */}
        <Link href="/login">
          <button className="bg-white text-[#4c0519] px-8 py-2.5 rounded-sm text-[11px] font-black uppercase tracking-[0.2em] ml-4 hover:bg-slate-100 transition-all shadow-xl active:scale-95">
            Login
          </button>
        </Link>
      </div>
    </nav>
  );
}