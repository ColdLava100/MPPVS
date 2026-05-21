'use client';

import React, { useState, useEffect } from 'react';
import { UserPlus, Users, Shield, Loader2, Search, Trash2, Save, Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AccountManagementProps {
  courses: any[];
  users: any[];
  onRefresh: () => void;
}

const ALL_ROLES = [
  { value: 'SUPERADMIN', label: 'Super Admin' },
  { value: 'ADMIN', label: 'Admin' },
  { value: 'SRC_ADVISOR', label: 'SRC Advisor' },
  { value: 'SPR_ADVISOR', label: 'EC Advisor' },
  { value: 'SPR_VOLUNTEER', label: 'EC Volunteer' },
  { value: 'STUDENT', label: 'Student' },
  { value: 'CANDIDATE', label: 'Candidate' },
];

export default function AccountManagement({ courses, users, onRefresh }: AccountManagementProps) {
  const router = useRouter();
  // User creation form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password');
  const [role, setRole] = useState('');
  const [icNumber, setIcNumber] = useState('');
  const [coursePrefix, setCoursePrefix] = useState('');
  const [studentId, setStudentId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // User search & modify
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [modifyUserId, setModifyUserId] = useState('');
  const [modName, setModName] = useState('');
  const [modEmail, setModEmail] = useState('');
  const [modPassword, setModPassword] = useState('');
  const [modRole, setModRole] = useState('STUDENT');
  const [modIcNumber, setModIcNumber] = useState('');
  const [modCoursePrefix, setModCoursePrefix] = useState('');
  const [modStudentId, setModStudentId] = useState('');
  const [modifyingUser, setModifyingUser] = useState(false);

  // 2FA State
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [twoFactorMessage, setTwoFactorMessage] = useState('');
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);

  // Impersonate State
  const [impersonateUserId, setImpersonateUserId] = useState('');

  const needsCourse = role === 'STUDENT' || role === 'CANDIDATE';
  const modNeedsCourse = modRole === 'STUDENT' || modRole === 'CANDIDATE';

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('twoFactorEnabled');
      if (saved === 'true') setTwoFactorEnabled(true);
    }
  }, []);

  const filteredUsers = users.filter((u: any) => {
    const matchesSearch = u.name?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
                          u.email?.toLowerCase().includes(userSearchQuery.toLowerCase());
    const matchesRole = userRoleFilter ? u.role === userRoleFilter : true;
    return matchesSearch && matchesRole;
  });

  const extractIdSplit = (fullId: string | null) => {
    if (!fullId) return { prefix: '', base: '' };
    const match = fullId.match(/^[A-Za-z]+/);
    if (match) return { prefix: match[0], base: fullId.substring(match[0].length) };
    return { prefix: '', base: fullId };
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !role) { setError('Name, email, and role are required.'); return; }
    setError(''); setSubmitting(true);
    try {
      const body: any = { name, email, password, role, icNumber: icNumber || undefined };
      if (needsCourse) {
        body.coursePrefix = coursePrefix;
        body.studentId = studentId;
      }
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify(body)
      });
      if (res.ok) {
        alert(`User "${name}" created successfully!`);
        setName(''); setEmail(''); setPassword('password'); setRole(''); setIcNumber('');
        setCoursePrefix(''); setStudentId('');
        onRefresh();
      } else {
        const err = await res.json().catch(() => ({}));
        setError(err.message || `Failed: ${res.status}`);
      }
    } catch (err: any) { setError(`Error: ${err.message}`); }
    setSubmitting(false);
  };

  const handleSelectUserToModify = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setModifyUserId(id);
    if (!id) return;
    const u = users.find((x: any) => x.id === id);
    if (u) {
      setModEmail(u.email || ''); setModName(u.name || '');
      setModRole(u.role || 'STUDENT'); setModIcNumber(u.icNumber || '');
      setModPassword('');
      const spl = extractIdSplit(u.studentId);
      setModCoursePrefix(spl.prefix); setModStudentId(spl.base);
    }
  };

  const handleModifyUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modifyUserId) return;
    setModifyingUser(true);
    const body: any = { email: modEmail, name: modName, role: modRole, icNumber: modIcNumber || undefined };
    if (modPassword.trim() !== '') body.password = modPassword;
    if (modNeedsCourse) {
      body.studentId = modCoursePrefix && modStudentId ? `${modCoursePrefix}${modStudentId}` : null;
    } else {
      body.studentId = null;
    }
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${modifyUserId}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify(body)
      });
      if (res.ok) { alert(`User Modified!`); onRefresh(); }
      else { const err = await res.json().catch(() => ({})); alert(err.message || `Failed: ${res.status}`); }
    } catch (err: any) { alert(`Error: ${err.message}`); }
    setModifyingUser(false);
  };

  const deleteUser = async () => {
    if (!modifyUserId) return;
    if (!confirm('Delete user completely?')) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${modifyUserId}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) { alert('User deleted'); setModifyUserId(''); onRefresh(); }
      else alert(`Failed: ${res.status}`);
    } catch (err: any) { alert(`Error: ${err.message}`); }
  };

  const generateQrCode = async () => {
    setTwoFactorLoading(true);
    setTwoFactorMessage('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/2fa/generate`, { method: 'POST', credentials: 'include' });
      if (res.ok) { const data = await res.json(); setQrCodeUrl(data.qrCodeDataUrl); }
      else { setTwoFactorMessage('Failed to generate QR code'); }
    } catch { setTwoFactorMessage('Error generating QR code'); }
    setTwoFactorLoading(false);
  };

  const enableTwoFactor = async (e: React.FormEvent) => {
    e.preventDefault();
    setTwoFactorLoading(true);
    setTwoFactorMessage('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/2fa/turn-on`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ code: verificationCode })
      });
      if (res.ok) {
        setTwoFactorEnabled(true); setQrCodeUrl(null); setVerificationCode('');
        setTwoFactorMessage('2FA enabled successfully!');
        sessionStorage.setItem('twoFactorEnabled', 'true');
      } else { setTwoFactorMessage('Invalid verification code'); }
    } catch { setTwoFactorMessage('Error enabling 2FA'); }
    setTwoFactorLoading(false);
  };

  const disableTwoFactor = async () => {
    setTwoFactorLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/2fa/turn-off`, { method: 'POST', credentials: 'include' });
      if (res.ok) { setTwoFactorEnabled(false); setTwoFactorMessage('2FA disabled successfully'); sessionStorage.removeItem('twoFactorEnabled'); }
      else { setTwoFactorMessage('Failed to disable 2FA'); }
    } catch { setTwoFactorMessage('Error disabling 2FA'); }
    setTwoFactorLoading(false);
  };

  const submitImpersonate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!impersonateUserId) return;
    const targetUser = users.find((u: any) => u.id === impersonateUserId);
    if (!targetUser) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/impersonate`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ userId: impersonateUserId })
      });
      if (res.ok) { alert(`Impersonating ${targetUser.name} — redirecting...`); router.push(`/dashboard/${targetUser.role.toLowerCase()}`); }
      else { alert(`Failed: ${res.status}`); }
    } catch (err: any) { alert(`Error: ${err.message}`); }
  };

  return (
    <div className="space-y-8">
      {/* Create User */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-[#4c0519]/10 rounded-sm">
            <UserPlus size={16} className="text-[#4c0519]" />
          </div>
          <h3 className="text-base font-bold text-slate-900 uppercase tracking-tight">Create User Account</h3>
        </div>

        <form onSubmit={handleCreateUser} className="bg-slate-50 border border-slate-200 rounded-sm p-5 space-y-3">
          {error && <div className="bg-red-50 border border-red-200 rounded-sm p-3 text-red-700 text-xs font-bold uppercase tracking-widest">{error}</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Full Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., John Doe"
                className="w-full bg-white border border-slate-200 rounded-sm px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#c5a021] transition-colors placeholder:text-slate-400" required />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e.g., john@example.com"
                className="w-full bg-white border border-slate-200 rounded-sm px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#c5a021] transition-colors placeholder:text-slate-400" required />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Password (optional)</label>
              <input type="text" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Defaults to 'password'"
                className="w-full bg-white border border-slate-200 rounded-sm px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#c5a021] transition-colors placeholder:text-slate-400" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Role</label>
              <select value={role} onChange={(e) => { setRole(e.target.value); setCoursePrefix(''); setStudentId(''); }}
                className="w-full bg-white border border-slate-200 rounded-sm px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#c5a021] transition-colors" required>
                <option value="">Select role...</option>
                {ALL_ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            {needsCourse && (
              <>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Course</label>
                  <select value={coursePrefix} onChange={(e) => setCoursePrefix(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-sm px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#c5a021] transition-colors" required>
                    <option value="">Select course...</option>
                    {courses.map((c: any) => <option key={c.id} value={c.studentPrefix}>{c.studentPrefix} - {c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Student ID</label>
                  <input type="text" value={studentId} onChange={(e) => setStudentId(e.target.value)} placeholder="e.g., BCS2311-001"
                    className="w-full bg-white border border-slate-200 rounded-sm px-3 py-2 text-sm text-slate-900 uppercase outline-none focus:border-[#c5a021] transition-colors placeholder:text-slate-400 font-mono" required />
                </div>
              </>
            )}
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">IC Number (optional)</label>
              <input type="text" value={icNumber} onChange={(e) => setIcNumber(e.target.value)} placeholder="e.g., 010101-01-0001"
                className="w-full bg-white border border-slate-200 rounded-sm px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#c5a021] transition-colors placeholder:text-slate-400" />
            </div>
          </div>
          <button type="submit" disabled={submitting}
            className="bg-[#c5a021] hover:bg-yellow-400 text-black px-6 py-2.5 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-50">
            {submitting ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
            {submitting ? 'Creating...' : 'Create Account'}
          </button>
        </form>
      </div>

      {/* Modify / Delete User */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-[#4c0519]/10 rounded-sm">
            <Users size={16} className="text-[#4c0519]" />
          </div>
          <h3 className="text-base font-bold text-slate-900 uppercase tracking-tight">Modify / Delete User</h3>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-sm p-5 space-y-3">
          {/* Search & Filter */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" value={userSearchQuery} onChange={(e) => setUserSearchQuery(e.target.value)}
                placeholder="Search name or email..."
                className="w-full bg-white border border-slate-200 rounded-sm pl-9 pr-3 py-2 text-sm text-slate-900 outline-none focus:border-[#c5a021] transition-colors placeholder:text-slate-400" />
            </div>
            <select value={userRoleFilter} onChange={(e) => setUserRoleFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-sm px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#c5a021] transition-colors">
              <option value="">All Roles</option>
              {ALL_ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>

          {/* User Select */}
          <select value={modifyUserId} onChange={handleSelectUserToModify}
            className="w-full bg-white border border-slate-200 rounded-sm px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#c5a021] transition-colors">
            <option value="">-- Modify Existing User --</option>
            {filteredUsers.map((u: any) => (
              <option key={u.id} value={u.id}>{u.name} ({u.email}) - {u.role}</option>
            ))}
          </select>

          {/* Modify Form */}
          {modifyUserId && (
            <form onSubmit={handleModifyUser} className="space-y-3 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input type="text" value={modName} onChange={(e) => setModName(e.target.value)} placeholder="Name" required
                  className="bg-white border border-slate-200 rounded-sm px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#c5a021]" />
                <input type="email" value={modEmail} onChange={(e) => setModEmail(e.target.value)} placeholder="Email" required
                  className="bg-white border border-slate-200 rounded-sm px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#c5a021]" />
                <input type="password" value={modPassword} onChange={(e) => setModPassword(e.target.value)} placeholder="Leave blank to preserve password"
                  className="bg-white border border-slate-200 rounded-sm px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#c5a021]" />
                <select value={modRole} onChange={(e) => { setModRole(e.target.value); }}
                  className="bg-white border border-slate-200 rounded-sm px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#c5a021]">
                  {ALL_ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
                <input type="text" value={modIcNumber} onChange={(e) => setModIcNumber(e.target.value)} placeholder="IC Number"
                  className="bg-white border border-slate-200 rounded-sm px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#c5a021]" />
              </div>
              {modNeedsCourse && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <select value={modCoursePrefix} onChange={(e) => setModCoursePrefix(e.target.value)}
                    className="bg-white border border-slate-200 rounded-sm px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#c5a021]">
                    <option value="">-- Course Prefix --</option>
                    {courses.map((c: any) => <option key={c.id} value={c.studentPrefix}>{c.studentPrefix}</option>)}
                  </select>
                  <input type="text" value={modStudentId} onChange={(e) => setModStudentId(e.target.value)} placeholder="Student ID base (e.g. 2311-014)"
                    className="bg-white border border-slate-200 rounded-sm px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#c5a021]" />
                </div>
              )}
              <div className="flex gap-2">
                <button type="submit" disabled={modifyingUser}
                  className="bg-[#4c0519]/80 hover:bg-[#4c0519] text-white px-4 py-2 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 disabled:opacity-50">
                  {modifyingUser ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  Save Changes
                </button>
                <button type="button" onClick={deleteUser}
                  className="bg-red-100 text-red-600 px-4 py-2 rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-red-200 transition flex items-center gap-1">
                  <Trash2 size={14} /> Delete User
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Two-Factor Authentication */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-[#4c0519]/10 rounded-sm">
            <Shield size={16} className="text-[#4c0519]" />
          </div>
          <h3 className="text-base font-bold text-slate-900 uppercase tracking-tight">Two-Factor Authentication</h3>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-sm p-5 space-y-3">
          {twoFactorEnabled && (
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-green-100 text-green-700 border border-green-200 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">2FA is Active</span>
            </div>
          )}
          <p className="text-sm text-slate-700">Status: <strong>{twoFactorEnabled ? 'Enabled' : 'Disabled'}</strong></p>
          {!twoFactorEnabled && (
            <div className="space-y-3">
              <button onClick={generateQrCode} disabled={twoFactorLoading}
                className="bg-[#059669] hover:bg-emerald-600 text-white px-4 py-2 rounded-sm text-[10px] font-black uppercase tracking-widest transition flex items-center gap-2 disabled:opacity-50">
                {twoFactorLoading ? <Loader2 size={14} className="animate-spin" /> : <Shield size={14} />}
                Generate QR Code
              </button>
              {qrCodeUrl && (
                <div className="space-y-3">
                  <img src={qrCodeUrl} alt="2FA QR Code" className="w-[200px] h-[200px] border border-slate-200 rounded-sm" />
                  <p className="text-xs text-slate-500">Scan with your authenticator app, then enter the code below:</p>
                  <form onSubmit={enableTwoFactor} className="flex gap-2">
                    <input type="text" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)}
                      placeholder="6-digit code" maxLength={6} required
                      className="bg-white border border-slate-200 rounded-sm px-3 py-2 text-sm text-slate-900 text-center tracking-[0.3em] outline-none focus:border-[#c5a021] w-[160px] font-mono" />
                    <button type="submit" disabled={twoFactorLoading}
                      className="bg-[#059669] hover:bg-emerald-600 text-white px-4 py-2 rounded-sm text-[10px] font-black uppercase tracking-widest transition disabled:opacity-50">
                      {twoFactorLoading ? 'Enabling...' : 'Enable'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}
          {twoFactorEnabled && (
            <button onClick={disableTwoFactor} disabled={twoFactorLoading}
              className="bg-red-100 text-red-600 px-4 py-2 rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-red-200 transition flex items-center gap-2 disabled:opacity-50">
              {twoFactorLoading ? <Loader2 size={14} className="animate-spin" /> : <Shield size={14} />}
              Disable 2FA
            </button>
          )}
          {twoFactorMessage && (
            <p className={`text-xs font-bold ${twoFactorMessage.includes('success') ? 'text-green-600' : 'text-red-600'}`}>{twoFactorMessage}</p>
          )}
        </div>
      </div>

      {/* Impersonate User */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-[#4c0519]/10 rounded-sm">
            <Eye size={16} className="text-[#4c0519]" />
          </div>
          <h3 className="text-base font-bold text-slate-900 uppercase tracking-tight">Impersonate User</h3>
        </div>

        <form onSubmit={submitImpersonate} className="bg-slate-50 border border-slate-200 rounded-sm p-5 space-y-3">
          <select value={impersonateUserId} onChange={(e) => setImpersonateUserId(e.target.value)} required
            className="w-full bg-white border border-slate-200 rounded-sm px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#c5a021] transition-colors">
            <option value="">-- Select User to Impersonate --</option>
            {users.map((u: any) => (
              <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
            ))}
          </select>
          <button type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-sm text-[10px] font-black uppercase tracking-widest transition flex items-center gap-2">
            <Eye size={14} /> Impersonate
          </button>
        </form>
      </div>
    </div>
  );
}
