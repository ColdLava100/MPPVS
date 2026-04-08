"use client";

import React, React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, HelpCircle, Phone } from 'lucide-react';



const ROLES = [
  { id: 'ADMIN', label: 'ADMIN', icon: '👤', inputLabel: 'Email Address', placeholder: 'admin@university.edu' },
  { id: 'SUPER_ADMIN', label: 'SUPERADMIN', icon: '🛡️', inputLabel: 'System Email', placeholder: 'root@university.edu' },
  { id: 'MPP_ADVISOR', label: 'MPP ADVISOR', icon: '🏛️', inputLabel: 'Official Email', placeholder: 'advisor@mpp.edu' },
  { id: 'STUDENT', label: 'STUDENT', icon: '🎓', inputLabel: 'Student ID', placeholder: 'BCSXXXX-XXX' },
  { id: 'CANDIDATE', label: 'CANDIDATE', icon: '📢', inputLabel: 'Candidate ID', placeholder: 'BCSXXXX-XXX' },
];

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState('STUDENT');
  const [studentId, setStudentId] = useState('');
  const [icNumber, setIcNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Updated Login Logic to actually hit authentication endpoints
  // --- UI STATES ---
  const [hoveredRole, setHoveredRole] = useState<string | null>(null);
  const activeRoleInfo = ROLES.find(r => r.id === (hoveredRole || selectedRole)) || ROLES[3];

  // --- SUBMISSION LOGIC ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const isStudentOrCandidate = selectedRole === 'STUDENT' || selectedRole === 'CANDIDATE';
    const endpoint = isStudentOrCandidate 
      ? `${process.env.NEXT_PUBLIC_API_URL}/auth/student/login` 
      : `${process.env.NEXT_PUBLIC_API_URL}/auth/staff/login`;
    
    const payload = isStudentOrCandidate 
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
        // Normalizing role to match folder names (e.g., MPP_ADVISOR -> mppadvisor)
        const folderName = selectedRole.toLowerCase().replace('_', '');
        router.push(`/dashboard/${folderName}`);
      } else {
        const data = await response.json().catch(() => ({}));
        setError(data.message || 'Invalid credentials. Please try again.');
        setIsLoading(false);
      }
    } catch (err: any) {
      setError('Network error. Ensure the server is running.');
      setIsLoading(false);
    }
  };

  const isStudentOrCandidate = selectedRole === 'STUDENT' || selectedRole === 'CANDIDATE';

  const mainBgUrl = "https://beranang.kpm.edu.my/kpmb/images/speasyimagegallery/albums/7/images/dewan-3.jpg";
  const heroPanelUrl = "https://beranang.kpm.edu.my/kpmb/images/speasyimagegallery/albums/20/images/lt-2-4.jpg";

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex flex-col font-sans">
      {/* HEADER */}
      <header className="p-6 flex justify-between items-center bg-white border-b border-gray-100">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-800 italic">
          MPP <span className="font-light text-slate-400">Voting Portal</span>
        </h1>
        <div className="flex gap-4 text-slate-400 text-sm">
          <span>🛡️ SECURE</span>
          <span>❓ HELP</span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-5xl bg-white shadow-2xl flex overflow-hidden min-h-[600px] rounded-sm border border-gray-200">
          
          {/* LEFT HERO */}
          <div className="hidden md:flex w-1/2 relative bg-[#2D0A0A]">
            <img 
              src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069" 
              alt="Governance" 
              className="absolute inset-0 w-full h-full object-cover opacity-20"
            />
            <div className="relative z-10 p-12 flex flex-col justify-end h-full text-white">
              <div className="flex items-center gap-2 mb-4 bg-white/10 w-fit px-3 py-1 rounded backdrop-blur-md">
                <span className="text-[10px] tracking-[0.2em] font-bold uppercase">Step {step} of 2</span>
              </div>
              <h2 className="text-4xl font-medium mb-6 leading-tight italic">Voices United<br />Future Ignited</h2>
              <p className="text-sm opacity-60 font-light leading-relaxed max-w-xs">
                {step === 1 ? "Please authenticate your credentials to access the voting portal." : "A security code has been sent to your registered device for multi-factor authentication."}
              </p>
            </div>
          </div>

          {/* RIGHT FORM */}
          <div className="w-full md:w-1/2 p-12 flex flex-col justify-center">
            <h3 className="text-5xl font-medium text-slate-900 mb-2 italic tracking-tighter">
              {step === 1 ? 'Login' : 'Verify'}
            </h3>
            <p className="text-sm text-slate-400 mb-10">
              {step === 1 ? 'Select your role and enter credentials.' : 'Enter the 6-digit code to continue.'}
            </p>

            {step === 1 && (
              <form onSubmit={handleInitialSubmit} className="space-y-8">
                {/* ROLE PICKER */}
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Select Access Role</label>
                  <div className="grid grid-cols-5 gap-2">
                    {ROLES.map((role) => (
                      <button
                        key={role.id}
                        type="button"
                        onMouseEnter={() => setHoveredRole(role.id)}
                        onMouseLeave={() => setHoveredRole(null)}
                        onClick={() => { setSelectedRole(role.id); setError(''); }}
                        className={`flex flex-col items-center justify-center py-4 border transition-all duration-300 ${
                          selectedRole === role.id 
                          ? 'border-slate-900 bg-white shadow-md z-10 scale-105' 
                          : hoveredRole === role.id 
                            ? 'border-slate-300 bg-slate-50 opacity-100 scale-105 shadow-sm'
                            : 'border-transparent bg-slate-50 opacity-40 grayscale'
                        }`}
                      >
                        <span className="text-xl mb-2">{role.icon}</span>
                        <span className="text-[8px] font-black text-center">{role.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* DYNAMIC INPUTS BASED ON ROLE */}
                {isStudentOrCandidate ? (
                  <>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500">Student ID</label>
                      <input 
                        type="text" 
                        value={studentId} 
                        onChange={(e) => setStudentId(e.target.value)} 
                        placeholder="BCSXXXX-XXX"
                        className="w-full bg-slate-50 border border-transparent px-4 py-4 text-sm outline-none focus:bg-white focus:border-slate-200 rounded-sm"
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500">IC Number</label>
                      <input 
                        type="text" 
                        value={icNumber} 
                        onChange={(e) => setIcNumber(e.target.value)} 
                        placeholder="000000-00-0000"
                        className="w-full bg-slate-50 border border-transparent px-4 py-4 text-sm outline-none focus:bg-white focus:border-slate-200 rounded-sm"
                        required 
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500">{activeRoleInfo.inputLabel}</label>
                      <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        placeholder={activeRoleInfo.placeholder}
                        className="w-full bg-slate-50 border border-transparent px-4 py-4 text-sm outline-none focus:bg-white focus:border-slate-200 rounded-sm"
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500">Password</label>
                      <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        placeholder="wilHandsome"
                        className="w-full bg-slate-50 border border-transparent px-4 py-4 text-sm outline-none focus:bg-white focus:border-slate-200 rounded-sm"
                        required 
                      />
                    </div>
                  </>
                )}

                <button type="submit" className="w-full bg-[#2D0A0A] text-white py-5 flex items-center justify-center gap-3 hover:bg-[#441212] transition-all uppercase text-[10px] font-black tracking-[0.3em] shadow-xl">
                  Next Step <span>→</span>
                </button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleVerifyCode} className="space-y-8">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500">6-Digit Multi-Factor Code</label>
                  <input 
                    type="text" 
                    value={twoFactorCode} 
                    onChange={(e) => setTwoFactorCode(e.target.value)} 
                    maxLength={6}
                    placeholder="e.g. 000000"
                    className="w-full bg-slate-50 border border-transparent px-4 py-4 text-center text-2xl font-mono tracking-[0.5em] outline-none focus:bg-white focus:border-slate-200 rounded-sm"
                    required 
                  />
                </div>

                <div className="flex gap-4">
                  <button type="button" onClick={() => setStep(1)} className="w-1/3 border border-slate-200 py-5 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition">Back</button>
                  <button type="submit" className="w-2/3 bg-[#2D0A0A] text-white py-5 text-[10px] font-black uppercase tracking-widest shadow-xl">Verify Code</button>
                </div>
              </form>
            )}

            {error && <p className="mt-6 text-[10px] font-bold uppercase text-red-600 bg-red-50 p-3 rounded-sm border border-red-100">{error}</p>}
          </div>
        </div>
      </main>

      <footer className="p-8 flex flex-col items-center bg-white border-t border-gray-100 space-y-6">
        <div className="w-full flex flex-col md:flex-row justify-between items-center text-[9px] font-bold uppercase tracking-widest text-slate-400">
          <p>© 2024 Institutional Voting Authority. Protocol V4.2</p>
          <div className="flex gap-8">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
        <div className="pt-6 border-t border-gray-50 w-full text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">
            Developed by <span className="text-slate-900">DevOps KitaBuild Studio</span>
          </p>
        </div>
      </footer>
    </div>
  );
}