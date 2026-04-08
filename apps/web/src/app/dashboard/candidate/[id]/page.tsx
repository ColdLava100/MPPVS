"use client";

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ChevronLeft, 
  FileText, 
  Image as ImageIcon, 
  Presentation, 
  PlayCircle,
  Award,
  CheckCircle2
} from 'lucide-react';
import StudentHeader from '@/components/ui/header';

// 1. DYNAMIC DATA SIMULATION
// In a real scenario, this would be a fetch() call to your backend
const CANDIDATE_DATA: Record<string, any> = {
  "101": {
    name: "Muhammad Haziq Bin Razak",
    dept: "DCS",
    photo: "/candidates/handsome.jpeg", // Using your uploaded file
    manifesto: "Empowering KPM Beranang through digital transparency and a 24/7 AI-driven student support hub.",
    poster: "https://images.unsplash.com/photo-1540914124281-342587941389?q=80&w=1000&auto=format&fit=crop",
    slides: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    video: "https://www.w3schools.com/html/mov_bbb.mp4"
  },
  "102": {
    name: "Nurul Ain Binti Mansor",
    dept: "DCS",
    photo: "https://images.pexels.com/photos/1181682/pexels-photo-1181682.jpeg",
    manifesto: "Building a sustainable campus with green initiatives and enhanced club collaboration frameworks.",
    poster: "https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=1000&auto=format&fit=crop",
    slides: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    video: "https://www.w3schools.com/html/movie.mp4"
  }
};

export default function CandidateProfile() {
  const { id } = useParams();
  const router = useRouter();
  
  // Fallback to ID 101 if the ID isn't in our mock data
  const data = CANDIDATE_DATA[id as string] || CANDIDATE_DATA["101"];

  return (
    <div className="h-screen bg-black text-white overflow-y-scroll snap-y snap-mandatory scroll-smooth no-scrollbar selection:bg-[#c5a021] selection:text-black">
      <StudentHeader />

      {/* FIXED NAVIGATION CONTROLS */}
      <div className="fixed top-32 left-8 z-50 flex flex-col gap-4">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 bg-white/5 backdrop-blur-xl border border-white/10 px-5 py-3 rounded-full hover:bg-[#c5a021] hover:text-black transition-all group"
        >
          <ChevronLeft size={16} />
          <span className="text-[10px] font-black uppercase tracking-widest">Back to Ballot</span>
        </button>
      </div>

      {/* SECTION 1: HERO - IDENTITY */}
      <section className="snap-start h-screen w-full flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={data.photo} 
            alt={data.name} 
            className="w-full h-full object-cover opacity-60 grayscale hover:grayscale-0 transition-all duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
        </div>

        <div className="z-10 text-center px-6 animate-in fade-in zoom-in duration-1000">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Award className="text-[#c5a021]" size={20} />
            <span className="text-[10px] font-black text-[#c5a021] tracking-[0.5em] uppercase">Official Candidate Profile</span>
          </div>
          <h1 className="text-7xl md:text-9xl font-black italic uppercase tracking-tighter leading-none mb-4 drop-shadow-2xl">
            {data.name}
          </h1>
          <p className="text-xl font-bold text-white/60 tracking-[0.3em] uppercase italic">
            Dept of {data.dept} — Candidate #{id}
          </p>
        </div>

        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce opacity-40 z-10 text-center">
           <p className="text-[8px] font-black uppercase tracking-[0.2em] mb-4">Scroll to view mission</p>
           <div className="w-[1px] h-16 bg-white mx-auto" />
        </div>
      </section>

      {/* SECTION 2: THE MANIFESTO */}
      <section className="snap-start h-screen w-full flex items-center justify-center bg-[#050505] p-12 md:p-24">
        <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-[#c5a021]/10 rounded-full border border-[#c5a021]/20">
              <FileText className="text-[#c5a021]" size={18} />
              <span className="text-[10px] font-black text-[#c5a021] uppercase tracking-widest">The Manifesto</span>
            </div>
            <h2 className="text-5xl font-black italic uppercase tracking-tighter leading-tight">
              My vision for <br /><span className="text-[#c5a021]">KPM Beranang</span>
            </h2>
            <p className="text-3xl font-light text-white/80 italic leading-relaxed border-l-2 border-white/10 pl-8">
              "{data.manifesto}"
            </p>
          </div>
          <div className="aspect-[4/5] bg-white/5 rounded-[3rem] border border-white/10 overflow-hidden group p-8">
             <div className="w-full h-full rounded-2xl bg-[#c5a021]/5 border border-[#c5a021]/10 flex items-center justify-center relative">
                <CheckCircle2 size={120} className="text-[#c5a021]/10 group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute bottom-8 left-8">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40 italic">Integrity & Service</p>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: MEDIA HUB (POSTER & SLIDES) */}
      <section className="snap-start h-screen w-full bg-white text-black p-12 md:p-24 flex flex-col justify-center">
        <div className="flex justify-between items-end mb-16">
          <div>
            <h2 className="text-7xl font-black uppercase tracking-tighter italic leading-none">Campaign <br /> Visuals</h2>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mt-4">Review all campaign collateral</p>
          </div>
          <div className="flex gap-4">
            <div className="p-5 bg-black text-white rounded-2xl"><ImageIcon size={28} /></div>
            <div className="p-5 border border-black/10 rounded-2xl"><Presentation size={28} /></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 h-[50vh]">
          {/* POSTER VIEW */}
          <div className="md:col-span-1 bg-slate-100 rounded-[2.5rem] overflow-hidden group relative cursor-pointer">
            <img src={data.poster} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white text-[10px] font-black uppercase tracking-widest border border-white/40 px-6 py-3 rounded-full">View Poster</span>
            </div>
          </div>
          {/* SLIDES EMBED */}
          <div className="md:col-span-2 bg-slate-100 rounded-[2.5rem] overflow-hidden border border-slate-200 group relative">
             <iframe src={data.slides} className="w-full h-full border-none" title="Presentation Slides" />
             <div className="absolute top-6 right-6 p-4 bg-white shadow-xl rounded-xl">
                <Presentation size={20} className="text-slate-400" />
             </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: THE VIDEO PITCH */}
      <section className="snap-start h-screen w-full flex flex-col items-center justify-center p-12 bg-black relative">
        <div className="text-center mb-16 z-10">
          <PlayCircle className="text-blue-500 mx-auto mb-6" size={56} />
          <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-4">Official Video Pitch</h2>
          <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.4em]">Broadcasted Live from Student Hall</p>
        </div>
        
        <div className="aspect-video w-full max-w-6xl bg-white/5 border border-white/10 rounded-[4rem] overflow-hidden group cursor-pointer relative z-10 shadow-2xl">
          <video 
            src={data.video} 
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" 
            controls
          />
        </div>

        {/* Decorative Background Text */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden whitespace-nowrap opacity-[0.02] pointer-events-none select-none">
          <p className="text-[20vw] font-black uppercase italic leading-none tracking-tighter">
            VOTE FOR {data.name} — VOTE FOR {data.name}
          </p>
        </div>
      </section>
    </div>
  );
}