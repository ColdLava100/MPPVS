import React from 'react';

interface LeaderCardProps {
  name: string;
  dept: string;
  quote: string;
  img: string;
}

function LeaderCard({ name, dept, quote, img }: LeaderCardProps) {
  return (
    <div className="group">
      <div className="relative aspect-[4/5] overflow-hidden mb-10 bg-slate-200 grayscale hover:grayscale-0 transition-all duration-1000 shadow-2xl group-hover:shadow-[#4c0519]/40 group-hover:-translate-y-4 rounded-sm border border-white/10">
        <img src={img} alt={name} className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-[1500ms]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90" />
        <div className="absolute bottom-0 left-0 w-full p-12">
          <p className="text-[11px] font-black text-yellow-500 uppercase tracking-[0.5em] mb-4">{dept}</p>
          <h3 className="text-5xl font-bold text-white uppercase tracking-tighter italic leading-none">{name}</h3>
        </div>
      </div>
      <p className="text-base text-slate-400 italic leading-relaxed mb-8 px-6 font-light border-l-2 border-[#4c0519]">"{quote}"</p>
    </div>
  );
}

interface VisionariesGridProps {
  leaders: LeaderCardProps[];
}

export default function VisionariesGrid({ leaders }: VisionariesGridProps) {
  return (
    <section className="pb-32">
      <div className="flex items-center gap-8 mb-24">
        <h2 className="text-7xl font-bold uppercase tracking-tighter italic text-white leading-none">Visionaries</h2>
        <div className="flex-grow h-[1px] bg-white/10" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
        {leaders.map((leader, index) => (
          <LeaderCard key={index} {...leader} />
        ))}
      </div>
    </section>
  );
}