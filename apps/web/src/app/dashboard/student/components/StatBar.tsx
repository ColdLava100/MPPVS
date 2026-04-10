import React from 'react';

interface StatItemProps {
  label: string;
  value: string;
  color?: string;
}

interface StatBarProps {
  stats: StatItemProps[];
}

function StatItem({ label, value, color = "text-white" }: StatItemProps) {
  return (
    <div className="p-12 border-r border-white/10 last:border-0 hover:bg-white/5 transition-all duration-300 group">
      <span className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4 group-hover:text-yellow-500 transition-colors">{label}</span>
      <span className={`text-4xl font-bold tracking-tighter ${color} drop-shadow-sm`}>{value}</span>
    </div>
  );
}

export default function StatBar({ stats }: StatBarProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 bg-white/5 backdrop-blur-3xl rounded-sm border border-white/10 mb-24 overflow-hidden shadow-2xl">
      {stats.map((stat, index) => (
        <StatItem key={index} label={stat.label} value={stat.value} color={stat.color} />
      ))}
    </div>
  );
}