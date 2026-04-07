import React from 'react';
import { Shield, HelpCircle, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#4c0519] text-white p-6 mt-auto">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-4">
          {/* Brand and Copyright */}
          <div className="flex items-center gap-4">
            <div className="bg-[#c5a021] p-2 rounded-lg shadow-inner flex items-center justify-center">
              <Shield className="text-white w-6 h-6" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight uppercase leading-none mb-2">
                MPP Voting System
              </h2>
              <p className="text-[10px] text-slate-300 font-medium tracking-widest opacity-80 uppercase">
                © 2026 DevOps KitaBuild Studio
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button className="bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded text-[10px] font-black uppercase tracking-widest transition flex items-center gap-2 group">
              <HelpCircle className="w-3.5 h-3.5 text-white/60 group-hover:text-white transition-colors" /> 
              FAQ
            </button>
            <button className="bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded text-[10px] font-black uppercase tracking-widest transition flex items-center gap-2 group">
              <Phone className="w-3.5 h-3.5 text-white/60 group-hover:text-white transition-colors" /> 
              Contact Support
            </button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
          <div className="flex gap-2 items-center">
            <span className="text-slate-300">Kolej Professional Mara Beranang</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(234,179,8,0.5)]"></span>
            <span className="tracking-[0.1em]">Server Status: <span className="text-white">Optimal</span></span>
          </div>
        </div>
      </div>
    </footer>
  );
}