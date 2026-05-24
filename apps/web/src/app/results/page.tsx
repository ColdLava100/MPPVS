"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Header from '@/components/ui/header1';
import Link from 'next/link';
import { Medal, Users, Vote, BarChart3, CalendarX, FileText, Image as ImageIcon, Award, ExternalLink, Video, Play } from 'lucide-react';

interface Manifesto {
  id: string;
  title: string;
  description: string;
}

interface Poster {
  id: string;
  posterLink: string;
}

interface Video {
  id: string;
  videoTitle: string;
  videoDescription: string;
  videoLink: string;
}

interface Slide {
  id: string;
  slideTitle: string;
  slideLink: string;
}

interface Qualification {
  cgpa: string;
  positions: string[];
  justification: string;
}

interface CandidateData {
  id: string;
  name: string;
  studentId: string;
  courseCode: string;
  courseName: string;
  voteCount: number;
  profilePicture: string | null;
  information: string | null;
  manifestos: Manifesto[];
  posters: Poster[];
  videos: Video[];
  slides: Slide[];
  qualification: Qualification | null;
}

interface ActiveElection {
  id: string;
  title: string;
  endDate: string;
  courseSettings: Record<string, number>;
}

interface MetricsData {
  activeElection: ActiveElection | null;
  metrics: { totalVoters: number; totalVotes: number };
  courseMetrics: { course: string; votes: number; seats: number; candidateCount: number }[];
}

function AnimatedCounter({ value, className }: { value: number; className?: string }) {
  const [display, setDisplay] = useState(0);
  const prevRef = useRef(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const start = prevRef.current;
    const diff = value - start;
    if (diff === 0) { setDisplay(value); return; }

    const duration = 800;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + diff * eased));
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };

    prevRef.current = value;
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value]);

  return <span className={className}>{display}</span>;
}

function CandidateCard({ candidate, rank, isSelected, onSelect }: { candidate: CandidateData; rank: number; isSelected: boolean; onSelect: () => void }) {
  const initials = candidate.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const rankMedal = rank === 1 ? 'text-yellow-400' : rank === 2 ? 'text-gray-300' : rank === 3 ? 'text-amber-600' : 'text-white/60';

  return (
    <button
      onClick={onSelect}
      className={`group bg-gradient-to-b from-[#4c0519]/90 via-[#2d0a0a]/90 to-black rounded-sm border text-left w-full transition-all duration-200 overflow-hidden cursor-pointer focus:outline-none ${
        isSelected ? 'ring-2 ring-yellow-500 border-yellow-500' : 'border-red-950/50 hover:border-red-900'
      }`}
    >
      <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/50 px-2 py-1 rounded-sm z-10">
        <Medal size={12} className={rankMedal} />
        <span className={`text-[10px] font-black ${rankMedal}`}>#{rank}</span>
      </div>

      <div className="p-5 flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-full overflow-hidden bg-[#2d0a0a] border-2 border-red-900/50 mb-4 flex items-center justify-center shrink-0">
          {candidate.profilePicture ? (
            <img
              src={candidate.profilePicture}
              alt={candidate.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <span className={`text-lg font-black text-white/40 ${candidate.profilePicture ? 'hidden' : ''}`}>
            {initials}
          </span>
        </div>

        <h3 className="text-sm font-bold text-white mb-0.5">{candidate.name}</h3>
        <p className="text-[9px] font-bold uppercase tracking-widest text-yellow-500/80 mb-1">
          {candidate.courseCode}
        </p>
        <p className="text-[8px] font-medium text-white/30 tracking-wider mb-3">
          {candidate.studentId}
        </p>

        <div className="w-full pt-3 border-t border-red-950/50">
          <div className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-1">Votes</div>
          <div className="text-2xl font-black text-yellow-400">
            <AnimatedCounter value={candidate.voteCount} />
          </div>
        </div>
      </div>
    </button>
  );
}

function CandidateDetail({ candidate, rank, onClose }: { candidate: CandidateData; rank: number; onClose: () => void }) {
  const initials = candidate.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="bg-gradient-to-b from-[#4c0519]/90 via-[#2d0a0a]/90 to-black rounded-sm border border-yellow-500/30 overflow-hidden">
      <div className="flex items-center justify-between p-4 md:p-6 border-b border-red-950/50">
        <h3 className="text-sm md:text-base font-black text-white uppercase tracking-wider">Candidate Profile</h3>
        <button
          onClick={onClose}
          className="text-white/40 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5"
        >
          Close <span className="text-lg leading-none">&times;</span>
        </button>
      </div>

      <div className="p-4 md:p-6 space-y-6">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden bg-[#1a0505] border-2 border-red-900/50 flex items-center justify-center shrink-0">
            {candidate.profilePicture ? (
              <img src={candidate.profilePicture} alt={candidate.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-black text-white/40">{initials}</span>
            )}
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-xl md:text-3xl font-black text-white tracking-tighter">{candidate.name}</h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-yellow-500/80 mt-1">{candidate.courseCode} · {candidate.studentId}</p>
            <div className="flex items-center justify-center md:justify-start gap-3 mt-2">
              <span className="text-[9px] font-black text-white/40">Rank #{rank}</span>
              <span className="text-white/20">|</span>
              <span className="text-[9px] font-black text-yellow-400"><AnimatedCounter value={candidate.voteCount} /> votes</span>
            </div>
          </div>
        </div>

        {candidate.information && (
          <p className="text-sm text-white/70 leading-relaxed italic border-l-2 border-yellow-500/30 pl-4">
            {candidate.information}
          </p>
        )}

        {candidate.qualification && (
          <div>
            <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-yellow-500/70 mb-2 flex items-center gap-2">
              <Award size={12} /> Qualification
            </h4>
            <div className="bg-black/30 rounded-sm p-3 md:p-4 space-y-1">
              <p className="text-sm font-bold text-white">{candidate.qualification.cgpa} CGPA</p>
              {candidate.qualification.positions && candidate.qualification.positions.length > 0 && (
                <p className="text-xs text-white/60">{candidate.qualification.positions.join(', ')}</p>
              )}
              {candidate.qualification.justification && (
                <p className="text-xs text-white/40 mt-2 leading-relaxed">{candidate.qualification.justification}</p>
              )}
            </div>
          </div>
        )}

        {candidate.manifestos.length > 0 && (
          <div>
            <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-yellow-500/70 mb-2 flex items-center gap-2">
              <FileText size={12} /> Manifesto{candidate.manifestos.length > 1 ? 's' : ''}
            </h4>
            <div className="space-y-3">
              {candidate.manifestos.map((m) => (
                <div key={m.id} className="bg-black/30 rounded-sm p-3 md:p-4">
                  <p className="text-sm font-bold text-white mb-1">{m.title}</p>
                  <p className="text-xs text-white/60 leading-relaxed">{m.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {candidate.posters.length > 0 && (
          <div>
            <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-yellow-500/70 mb-2 flex items-center gap-2">
              <ImageIcon size={12} /> Poster{candidate.posters.length > 1 ? 's' : ''}
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {candidate.posters.map((p) => (
                <a
                  key={p.id}
                  href={p.posterLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block aspect-[3/4] bg-black/50 rounded-sm overflow-hidden border border-red-950/30 hover:border-yellow-500/50 transition-colors group relative"
                >
                  <img
                    src={p.posterLink}
                    alt="Poster"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const el = e.target as HTMLImageElement;
                      el.style.display = 'none';
                      el.parentElement!.classList.add('flex', 'items-center', 'justify-center');
                      el.parentElement!.innerHTML = '<span class="text-[8px] text-white/30 font-black uppercase tracking-widest">No Preview</span>';
                    }}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <ExternalLink size={16} className="text-white/0 group-hover:text-white/80 transition-all" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {candidate.videos.length > 0 && (
          <div>
            <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-yellow-500/70 mb-2 flex items-center gap-2">
              <Video size={12} /> Video{candidate.videos.length > 1 ? 's' : ''}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {candidate.videos.map((v) => (
                <a
                  key={v.id}
                  href={v.videoLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-black/30 rounded-sm p-4 border border-red-950/30 hover:border-yellow-500/50 transition-colors group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded bg-red-950/50 flex items-center justify-center shrink-0 group-hover:bg-red-900/50 transition-colors">
                      <Play size={16} className="text-yellow-500/60 group-hover:text-yellow-400 transition-colors ml-0.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white mb-0.5 group-hover:text-yellow-400 transition-colors truncate">{v.videoTitle}</p>
                      {v.videoDescription && <p className="text-xs text-white/50 leading-relaxed line-clamp-2">{v.videoDescription}</p>}
                      <div className="flex items-center gap-1.5 mt-2">
                        <ExternalLink size={10} className="text-yellow-500/60 shrink-0" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-yellow-500/60">Watch Video</span>
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {candidate.slides.length > 0 && (
          <div>
            <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-yellow-500/70 mb-2 flex items-center gap-2">
              <FileText size={12} /> Slide{candidate.slides.length > 1 ? 's' : ''}
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {candidate.slides.map((s) => (
                <a
                  key={s.id}
                  href={s.slideLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-black/50 rounded-sm overflow-hidden border border-red-950/30 hover:border-yellow-500/50 transition-colors group relative p-5 flex flex-col items-center justify-center aspect-[4/3]"
                >
                  <FileText size={28} className="text-white/20 group-hover:text-yellow-500/50 transition-colors mb-2" />
                  <span className="text-[10px] font-bold text-white/40 group-hover:text-white/70 text-center transition-colors leading-tight line-clamp-2">{s.slideTitle}</span>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <ExternalLink size={16} className="text-white/0 group-hover:text-white/80 transition-all" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {!candidate.information && !candidate.qualification && candidate.manifestos.length === 0 && candidate.posters.length === 0 && candidate.videos.length === 0 && candidate.slides.length === 0 && (
          <p className="text-sm text-white/30 text-center py-8">No additional information available for this candidate.</p>
        )}
      </div>
    </div>
  );
}

export default function ResultsPage() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [candidates, setCandidates] = useState<CandidateData[]>([]);
  const [filterCourse, setFilterCourse] = useState('ALL');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateData | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const metricsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/elections/public/metrics`);
      if (!metricsRes.ok) throw new Error('Failed to fetch election data');
      const metricsData: MetricsData = await metricsRes.json();
      setMetrics(metricsData);

      if (metricsData.activeElection) {
        const candidatesRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/elections/${metricsData.activeElection.id}/candidates`);
        if (candidatesRes.ok) {
          const candidatesData: CandidateData[] = await candidatesRes.json();
          const sorted = candidatesData.sort((a, b) => b.voteCount - a.voteCount);
          setCandidates(sorted);
        }
      } else {
        setCandidates([]);
      }
      setError(null);
    } catch (err) {
      setError('Unable to load results. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const courses = candidates
    .map((c) => c.courseCode)
    .filter((v, i, a) => a.indexOf(v) === i)
    .sort();

  const filtered = filterCourse === 'ALL'
    ? candidates
    : candidates.filter((c) => c.courseCode === filterCourse);

  const turnout = metrics?.metrics.totalVoters
    ? Math.round((metrics.metrics.totalVotes / metrics.metrics.totalVoters) * 100)
    : 0;

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden font-sans">
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#4c0519]/70 via-[#4c0519]/50 to-black/80" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.12) 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      <Header />

      <main className="relative z-10 flex-grow">
        {isLoading ? (
          <div className="flex items-center justify-center h-full min-h-[60vh]">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Loading Results</span>
            </div>
          </div>
        ) : error || !metrics?.activeElection ? (
          <div className="flex items-center justify-center h-full min-h-[60vh] p-6">
            <div className="text-center max-w-md">
              <CalendarX size={48} className="text-white/10 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white/50 mb-2">No Active Election</h2>
              <p className="text-sm text-white/20">
                Results will appear here once an election is active.
              </p>
              <Link
                href="/"
                className="inline-block mt-6 bg-white/5 hover:bg-white/10 border border-white/10 px-6 py-3 rounded-sm text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-white transition-all"
              >
                Back to Home
              </Link>
            </div>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 bg-white/5 border border-red-950/50 px-3 py-1 rounded-sm mb-3">
                <BarChart3 size={10} className="text-yellow-500" />
                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-yellow-500/80">Live Results</span>
              </div>
              <h1 className="text-2xl md:text-5xl font-black text-white tracking-tighter mb-2">
                {metrics.activeElection.title}
              </h1>
              <p className="text-[10px] font-medium text-white/30 tracking-wider">
                Votes update automatically every 10 seconds
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 md:gap-4 mb-10 max-w-lg mx-auto">
              <div className="bg-gradient-to-b from-[#4c0519]/90 via-[#2d0a0a]/90 to-black border border-red-950/50 rounded-sm p-4 text-center">
                <Users size={16} className="text-white/30 mx-auto mb-2" />
                <div className="text-xl md:text-2xl font-black text-white">{metrics.metrics.totalVoters}</div>
                <div className="text-[8px] font-black uppercase tracking-widest text-white/30 mt-1">Voters</div>
              </div>
              <div className="bg-gradient-to-b from-[#4c0519]/90 via-[#2d0a0a]/90 to-black border border-red-950/50 rounded-sm p-4 text-center">
                <Vote size={16} className="text-yellow-500/60 mx-auto mb-2" />
                <div className="text-xl md:text-2xl font-black text-yellow-400">
                  <AnimatedCounter value={metrics.metrics.totalVotes} />
                </div>
                <div className="text-[8px] font-black uppercase tracking-widest text-white/30 mt-1">Votes Cast</div>
              </div>
              <div className="bg-gradient-to-b from-[#4c0519]/90 via-[#2d0a0a]/90 to-black border border-red-950/50 rounded-sm p-4 text-center">
                <BarChart3 size={16} className="text-white/30 mx-auto mb-2" />
                <div className="text-xl md:text-2xl font-black text-white">{turnout}%</div>
                <div className="text-[8px] font-black uppercase tracking-widest text-white/30 mt-1">Turnout</div>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
              <button
                onClick={() => setFilterCourse('ALL')}
                className={`px-4 py-2 rounded-sm text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  filterCourse === 'ALL'
                    ? 'bg-yellow-500 text-black'
                    : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white border border-red-950/30'
                }`}
              >
                All ({candidates.length})
              </button>
              {courses.map((course) => {
                const count = candidates.filter((c) => c.courseCode === course).length;
                return (
                  <button
                    key={course}
                    onClick={() => setFilterCourse(course)}
                    className={`px-4 py-2 rounded-sm text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                      filterCourse === course
                        ? 'bg-yellow-500 text-black'
                        : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white border border-red-950/30'
                    }`}
                  >
                    {course} ({count})
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((candidate, index) => (
                <React.Fragment key={candidate.id}>
                  <CandidateCard
                    candidate={candidate}
                    rank={index + 1}
                    isSelected={selectedCandidate?.id === candidate.id}
                    onSelect={() => setSelectedCandidate(selectedCandidate?.id === candidate.id ? null : candidate)}
                  />
                  {selectedCandidate?.id === candidate.id && (
                    <div className="col-span-full mt-4">
                      <CandidateDetail
                        candidate={candidate}
                        rank={index + 1}
                        onClose={() => setSelectedCandidate(null)}
                      />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-16">
                <p className="text-sm text-white/20">No candidates found for this course.</p>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="hidden md:block relative z-50 bg-[#4c0519] text-white px-10 py-5 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-4">
              <div className="bg-[#c5a021] p-2 rounded shadow-lg flex items-center justify-center">
                <img src="/logo/shortenlogo.svg" alt="MPP" className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[9px] text-slate-400 font-medium tracking-[0.15em] uppercase opacity-80">
                  © 2026 DevOps KitaBuild Studio
                </p>
              </div>
            </div>
            <div className="hidden lg:block h-6 w-px bg-white/10" />
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-300">
              Kolej Professional Mara Beranang
            </span>
          </div>
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded text-[9px] font-black uppercase tracking-widest transition"
              >
                Back to Home
              </Link>
            </div>
            <div className="hidden md:flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.25em] text-slate-400">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.6)]"></span>
              <span>Live: <span className="text-white font-bold">Auto-Update</span></span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
