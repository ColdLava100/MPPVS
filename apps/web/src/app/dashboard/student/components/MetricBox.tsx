import React from 'react';
import { BarChart3 } from 'lucide-react';

interface MetricBoxProps {
  code: string;
  votes: string;
  seats: string;
  color: string;
  icon?: React.ReactNode;
}

export default function MetricBox({ code, votes, seats, color, icon }: MetricBoxProps) {
  return (
    <div className={`p-8 bg-white/95 backdrop-blur-xl border border-white/20 border-b-[6px] ${color} shadow-2xl group hover:-translate-y-2 transition-all duration-500 rounded-sm`}>
      <div className="flex justify-between items-start mb-10 text-black">
        <div className="text-slate-300 group-hover:text-[#4c0519] transition-colors duration-500">
          {icon || <BarChart3 size={24} />}
        </div>
        <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none">{code}</span>
      </div>
      <div className="text-5xl font-bold mb-2 tracking-tighter text-slate-900 leading-none">{votes}</div>
      <p className="text-[9px] font-black text-slate-400 uppercase mb-10 tracking-[0.2em]">Verified Ballots</p>
      <div className="flex justify-between text-[10px] font-black uppercase mb-4 text-black">
        <span className="text-slate-400">Seats Filled</span>
        <span className="text-[#4c0519]">{seats}</span>
      </div>
      <div className="w-full h-[4px] bg-slate-100 overflow-hidden rounded-full">
        <div className="h-full bg-slate-900 transition-all duration-1000 ease-out" style={{ width: '75%' }} />
      </div>
    </div>
  );
}