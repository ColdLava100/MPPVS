"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, HelpCircle, Phone, UserCog, Building2, GraduationCap, Mic, Users, ClipboardCheck, AlertTriangle, Calendar, Clock, Timer } from 'lucide-react';

const CATEGORIES = [
  { id: 'Staff', roles: ['SUPERADMIN', 'ADMIN'] },
  { id: 'Advisor', roles: ['SRC_ADVISOR', 'EC_ADVISOR'] },
  { id: 'EC', roles: ['EC_VOLUNTEER'] },
  { id: 'Student', roles: ['CANDIDATE', 'STUDENT'] },
];

const ROLES = [
  { id: 'SUPERADMIN', label: 'SUPERADMIN', icon: Shield, inputLabel: 'System Email', placeholder: 'root@university.edu' },
  { id: 'ADMIN', label: 'ADMIN', icon: UserCog, inputLabel: 'Email Address', placeholder: 'admin@university.edu' },
  { id: 'SRC_ADVISOR', label: 'SRC ADVISOR', icon: Building2, inputLabel: 'Official Email', placeholder: 'advisor@src.edu' },
  { id: 'EC_ADVISOR', label: 'EC ADVISOR', icon: ClipboardCheck, inputLabel: 'Official Email', placeholder: 'advisor@ec.edu' },
  { id: 'EC_VOLUNTEER', label: 'EC VOLUNTEER', icon: Users, inputLabel: 'Volunteer ID', placeholder: 'ECXXX' },
  { id: 'STUDENT', label: 'STUDENT', icon: GraduationCap, inputLabel: 'Student ID', placeholder: 'BCSXXXX-XXX' },
  { id: 'CANDIDATE', label: 'CANDIDATE', icon: Mic, inputLabel: 'Candidate ID', placeholder: 'BCSXXXX-XXX' },
];

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState('STUDENT');
  const [activeCategory, setActiveCategory] = useState('Student');
  const [studentId, setStudentId] = useState('');
  const [icNumber, setIcNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Session error state for structured session info
  const [sessionError, setSessionError] = useState<{
    date: string;
    startTime: string;
    timeUntilStart: string;
    nextSessionStart: string;
  } | null>(null);

  // 2FA state
  const [needs2FA, setNeeds2FA] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');

  const router = useRouter();

  // Updated Login Logic to actually hit authentication endpoints
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSessionError(null);

    const isStudentRole = selectedRole === 'STUDENT' || selectedRole === 'CANDIDATE';
    const endpoint = isStudentRole
      ? `${process.env.NEXT_PUBLIC_API_URL}/auth/student/login`
      : `${process.env.NEXT_PUBLIC_API_URL}/auth/staff/login`;

    const payload = isStudentRole
      ? { studentId, icNumber }
      : { email, password };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include', // Ensures HttpOnly cookie is saved automatically
      });

      if (response.ok) {
        const data = await response.json();

        // Check if 2FA is required
        if (data.requires2FA && !isStudentRole) {
          setNeeds2FA(true);
          setPendingEmail(data.email);
          setStep(2);
          setIsLoading(false);
          return;
        }

        // Normalizing role to match folder names (e.g., SRC_ADVISOR -> srcadvisor)
        // Special case: EC_ADVISOR and EC_VOLUNTEER both go to /dashboard/ec
        const folderName = (selectedRole === 'EC_ADVISOR' || selectedRole === 'EC_VOLUNTEER')
          ? 'ec'
          : selectedRole.toLowerCase().replace('_', '');
        router.push(`/dashboard/${folderName}`);
      } else {
        const data = await response.json().catch(() => ({}));

        // Check for structured session error
        if (data.error === 'SESSION_NOT_ACTIVE' && data.sessionInfo) {
          setSessionError(data.sessionInfo);
          setIsLoading(false);
          return;
        }

        // For student login, the backend returns detailed error messages
        const errorMessage = data.message || data.error || data.reason || 'Invalid credentials. Please try again.';
        setError(errorMessage);
        setIsLoading(false);
      }
    } catch (err: any) {
      setError('Network error. Ensure the server is running.');
      setIsLoading(false);
    }
  };

  // 2FA Verification Handler
  const handle2FAVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const isStudentRole = selectedRole === 'STUDENT' || selectedRole === 'CANDIDATE';

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login/2fa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: pendingEmail, code: twoFactorCode }),
        credentials: 'include',
      });

      if (response.ok) {
        // Special case: EC_ADVISOR and EC_VOLUNTEER both go to /dashboard/ec
        const folderName = (selectedRole === 'EC_ADVISOR' || selectedRole === 'EC_VOLUNTEER')
          ? 'ec'
          : selectedRole.toLowerCase().replace('_', '');
        router.push(`/dashboard/${folderName}`);
      } else {
        const data = await response.json().catch(() => ({}));
        setError(data.message || 'Invalid 2FA code');
      }
    } catch (err: any) {
      setError('Network error. Please try again.');
    }
    setIsLoading(false);
  };

  const isStudentRole = selectedRole === 'STUDENT' || selectedRole === 'CANDIDATE';

  const mainBgUrl = "https://beranang.kpm.edu.my/kpmb/images/speasyimagegallery/albums/7/images/dewan-3.jpg";
  const heroPanelUrl = "https://beranang.kpm.edu.my/kpmb/images/speasyimagegallery/albums/20/images/lt-2-4.jpg";

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden font-sans">

      {/* BACKGROUND LAYER */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${mainBgUrl})`,
          filter: 'blur(8px) brightness(0.45)'
        }}
      />

      {/* HEADER */}
      <header className="relative z-50 px-10 py-5 flex justify-between items-center bg-[#4c0519]/90 backdrop-blur-md border-b border-white/5 shadow-2xl">
        <Link href="/">
          <button className="group flex items-center gap-3 text-white/80 hover:text-white transition-all">
            <div className="flex items-center justify-center w-8 h-8 rounded-full border border-white/20 group-hover:border-white/40 group-hover:bg-white/10 transition-all">
              <span className="text-lg">←</span>
            </div>
            <span className="text-[13px] font-black uppercase tracking-[0.2em]">Back</span>
          </button>
        </Link>
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3">
<h1 className="text-[14px] font-black uppercase tracking-[0.4em] text-white">
              SRC <span className="opacity-50 font-light">Voting Portal</span>
            </h1>
        </div>
      </header>

      {/* FLOATING MAIN CARD */}
      <main className="relative z-10 flex-grow flex items-center justify-center p-6">
        <div className="w-full max-w-4xl bg-white shadow-[0_40px_80px_-15px_rgba(0,0,0,0.55)] flex overflow-hidden min-h-[550px] rounded-sm">

          {/* LEFT HERO PANEL */}
          <div className="hidden md:flex w-5/12 relative bg-[#2D0A0A]">
            <img
              src={heroPanelUrl}
              alt="Governance"
              className="absolute inset-0 w-full h-full object-cover opacity-35 grayscale"
            />
            <div className="relative z-10 p-12 flex flex-col justify-end h-full text-white bg-gradient-to-t from-[#4c0519]/80 via-transparent to-transparent">
              <div className="flex items-center gap-2 mb-4 bg-white/10 w-fit px-2 py-1 rounded backdrop-blur-sm">
                <span className="text-[9px] tracking-[0.2em] font-bold uppercase">Step {step} of 2</span>
              </div>
              <h2 className="text-4xl font-black mb-4 leading-none italic tracking-tighter uppercase">
                Voices United<br />Future Ignited
              </h2>
              <p className="text-[10px] opacity-60 font-medium leading-relaxed max-w-[240px]">
                Secure authentication is required to participate in src election.
              </p>
            </div>
          </div>

          {/* RIGHT FORM PANEL */}
          <div className="w-full md:w-7/12 p-12 lg:p-13 flex flex-col justify-center">
            <h3 className="text-6xl font-black text-slate-900 mb-1 tracking-tighter leading-none">
              LOGIN
            </h3>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-10">
              Select your role and enter credentials to proceed.
            </p>

            {needs2FA ? (
              <form onSubmit={handle2FAVerification} className="space-y-6">
                <div className="space-y-1.5">
                  <label className="block text-[8px] font-black uppercase tracking-[0.2em] text-slate-500">Two-Factor Code</label>
                  <input
                    type="text"
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value)}
                    placeholder="000000"
                    maxLength={6}
                    className="w-full bg-slate-50 border-b border-slate-200 px-0 py-2 text-xs outline-none focus:border-[#4c0519] transition-colors font-bold tracking-[0.3em] text-center"
                    required
                  />
                </div>
                <p className="text-[9px] text-slate-400 text-center">
                  Enter the 6-digit code from your authenticator app
                </p>
                {error && (
                  <div className="text-red-500 text-[10px] font-bold uppercase tracking-widest text-center">
                    {error}
                  </div>
                )}
                <button type="submit" disabled={isLoading} className="w-full bg-[#4c0519] text-white py-4 flex items-center justify-center gap-3 hover:bg-black transition-all uppercase text-[9px] font-black tracking-[0.3em] shadow-xl active:scale-95 mt-2 disabled:opacity-50 disabled:cursor-not-allowed">
                  {isLoading ? 'Verifying...' : 'Verify'}
                </button>
                <button
                  type="button"
                  onClick={() => { setNeeds2FA(false); setTwoFactorCode(''); setError(null); }}
                  className="w-full text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 text-center"
                >
                  ← Back to login
                </button>
              </form>
            ) : (
              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4">Access Role</label>

                  {/* Category Tabs */}
                  <div className="flex gap-6 border-b border-white/10 mb-4">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setActiveCategory(cat.id);
                          setSelectedRole(cat.roles[0]);
                        }}
                        className={`pb-3 text-[10px] font-black uppercase tracking-widest transition-colors ${activeCategory === cat.id
                            ? 'text-yellow-500 border-b-2 border-yellow-500'
                            : 'text-slate-400 hover:text-white'
                          }`}
                      >
                        {cat.id}
                      </button>
                    ))}
                  </div>

                  {/* Role Cards - Filtered by Category */}
                  <div className="grid grid-cols-2 gap-2">
                    {ROLES.filter(r => CATEGORIES.find(c => c.id === activeCategory)?.roles.includes(r.id)).map((role) => (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => setSelectedRole(role.id)}
                        className={`flex flex-col items-center justify-center py-4 border transition-all rounded-sm ${selectedRole === role.id
                            ? 'border-slate-900 bg-white shadow-lg z-10 scale-105 ring-1 ring-slate-900/5'
                            : 'border-transparent bg-slate-50 opacity-40 hover:opacity-100 grayscale'
                          }`}
                      >
                        <role.icon size={20} className="mb-1 text-slate-700" />
                        <span className="text-[9px] font-black tracking-tighter text-center text-slate-900">{role.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-5">
                  {isStudentRole ? (
                    <>
                      <div className="space-y-1.5">
                        <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Student ID Identification</label>
                        <input
                          type="text"
                          value={studentId}
                          onChange={(e) => setStudentId(e.target.value)}
                          placeholder="BCSXXXX-XXX"
                          className="w-full bg-slate-50 border-b border-slate-200 px-0 py-2 text-xs outline-none focus:border-[#4c0519] transition-colors uppercase tracking-widest font-bold"
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">National IC Number</label>
                        <input
                          type="text"
                          value={icNumber}
                          onChange={(e) => setIcNumber(e.target.value)}
                          placeholder="000000-00-0000"
                          className="w-full bg-slate-50 border-b border-slate-200 px-0 py-2 text-xs outline-none focus:border-[#4c0519] transition-colors tracking-[0.2em] font-bold"
                          required
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-1.5">
                        <label className="block text-[8px] font-black uppercase tracking-[0.2em] text-slate-500">Institutional Email</label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="username@university.edu"
                          className="w-full bg-slate-50 border-b border-slate-200 px-0 py-2 text-xs outline-none focus:border-[#4c0519] transition-colors font-bold"
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-[8px] font-black uppercase tracking-[0.2em] text-slate-500">System Password</label>
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full bg-slate-50 border-b border-slate-200 px-0 py-2 text-xs outline-none focus:border-[#4c0519] transition-colors font-bold"
                          required
                        />
                      </div>
                    </>
                  )}
                </div>

                {error && (
                  <div className="text-red-500 text-[10px] font-bold uppercase tracking-widest text-center mt-4">
                    {error}
                  </div>
                )}

                {sessionError && (
                  <div className="bg-[#4c0519] border border-yellow-500/30 rounded-sm p-4 mt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="text-yellow-500 w-5 h-5" />
                      <span className="text-yellow-500 text-[10px] font-black uppercase tracking-widest">
                        Voting Session: Not Active
                      </span>
                    </div>
                    <div className="space-y-2 text-white/80 text-[10px]">
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-2 font-bold">
                          <Calendar size={12} /> Date
                        </span>
                        <span className="text-yellow-400 font-bold">{sessionError.date}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-2 font-bold">
                          <Clock size={12} /> Start Time
                        </span>
                        <span className="text-yellow-400 font-bold">{sessionError.startTime}</span>
                      </div>
                      <div className="flex justify-between items-center border-t border-white/10 pt-2 mt-2">
                        <span className="flex items-center gap-2 font-bold">
                          <Timer size={12} /> Duration Until
                        </span>
                        <span className="text-yellow-400 font-bold">{sessionError.timeUntilStart}</span>
                      </div>
                    </div>
                  </div>
                )}

                <button type="submit" disabled={isLoading} className="w-full bg-[#4c0519] text-white py-4 flex items-center justify-center gap-3 hover:bg-black transition-all uppercase text-[9px] font-black tracking-[0.3em] shadow-xl active:scale-95 mt-2 disabled:opacity-50 disabled:cursor-not-allowed">
                  {isLoading ? 'Authenticating...' : 'Login'}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="relative z-50 bg-[#4c0519] text-white px-10 py-5 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-4">
              <div className="bg-[#c5a021] p-2 rounded shadow-lg">
                <Shield className="text-white w-5 h-5" strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-[13px] font-bold tracking-tight uppercase leading-none">SRC Voting System</h2>
                <p className="text-[9px] text-slate-400 font-medium tracking-[0.15em] mt-1 uppercase opacity-80">
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
              <button className="bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded text-[9px] font-black uppercase tracking-widest transition flex items-center gap-2.5 group">
                <HelpCircle className="w-3.5 h-3.5 text-white/50 group-hover:text-white transition-colors" />
                FAQ
              </button>
              <button className="bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded text-[9px] font-black uppercase tracking-widest transition flex items-center gap-2.5 group">
                <Phone className="w-3.5 h-3.5 text-white/50 group-hover:text-white transition-colors" />
                Contact Support
              </button>
            </div>

            <div className="hidden md:flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.25em] text-slate-400">
              <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(234,179,8,0.6)]"></span>
              <span>Server Status: <span className="text-white font-bold">Optimal</span></span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}