'use client';

import React, { useState, useEffect } from 'react';

interface TabProps {
  users: any[];
  courses: any[];
  elections: any[];
  votingSessions: any[];
  candidates: any[];
  fetchActiveData: () => Promise<void>;
  inputStyle: React.CSSProperties;
  btnStyle: React.CSSProperties;
  delBtnStyle: React.CSSProperties;
  formStyle: React.CSSProperties;
  currentUser: any;
}

export default function SuperadminTab({
  users,
  courses,
  fetchActiveData,
  inputStyle,
  btnStyle,
  delBtnStyle,
  formStyle,
  currentUser
}: TabProps) {
  // User Form State (Create)
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('SUPERADMIN');
  const [userIcNumber, setUserIcNumber] = useState('');
  const [userStudentIdPrefix, setUserStudentIdPrefix] = useState('');
  const [userStudentIdBase, setUserStudentIdBase] = useState('');

  // Course Form State
  const [courseCode, setCourseCode] = useState('');
  const [courseStudentPrefix, setCourseStudentPrefix] = useState('');
  const [courseName, setCourseName] = useState('');

  // User Form State (Modify)
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [modifyUserId, setModifyUserId] = useState('');
  const [modEmail, setModEmail] = useState('');
  const [modPassword, setModPassword] = useState('');
  const [modName, setModName] = useState('');
  const [modRole, setModRole] = useState('SUPERADMIN');
  const [modIcNumber, setModIcNumber] = useState('');
  const [modStudentIdPrefix, setModStudentIdPrefix] = useState('');
  const [modStudentIdBase, setModStudentIdBase] = useState('');

  // Impersonate Form State
  const [impersonateUserId, setImpersonateUserId] = useState('');

  // 2FA State
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [twoFactorMessage, setTwoFactorMessage] = useState('');
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);

  useEffect(() => {
    if (currentUser?.isTwoFactorAuthenticationEnabled) {
      setTwoFactorEnabled(true);
    }
  }, [currentUser]);

  const generateQrCode = async () => {
    setTwoFactorLoading(true);
    setTwoFactorMessage('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/2fa/generate`, { method: 'POST', credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setQrCodeUrl(data.qrCodeDataUrl);
      } else {
        setTwoFactorMessage('Failed to generate QR code');
      }
    } catch (err) { setTwoFactorMessage('Error generating QR code'); }
    setTwoFactorLoading(false);
  };

  const enableTwoFactor = async (e: React.FormEvent) => {
    e.preventDefault();
    setTwoFactorLoading(true);
    setTwoFactorMessage('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/2fa/turn-on`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ code: verificationCode })
      });
      if (res.ok) {
        setTwoFactorEnabled(true);
        setQrCodeUrl(null);
        setVerificationCode('');
        setTwoFactorMessage('2FA enabled successfully!');
      } else {
        setTwoFactorMessage('Invalid verification code');
      }
    } catch (err) { setTwoFactorMessage('Error enabling 2FA'); }
    setTwoFactorLoading(false);
  };

  const disableTwoFactor = async () => {
    setTwoFactorLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/2fa/turn-off`, { method: 'POST', credentials: 'include' });
      if (res.ok) {
        setTwoFactorEnabled(false);
        setTwoFactorMessage('2FA disabled successfully');
      } else { setTwoFactorMessage('Failed to disable 2FA'); }
    } catch (err) { setTwoFactorMessage('Error disabling 2FA'); }
    setTwoFactorLoading(false);
  };

  const filteredUsers = users.filter(u => {
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

  const submitCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalStudentId = (userRole === 'STUDENT' || userRole === 'CANDIDATE')
      ? (userStudentIdPrefix && userStudentIdBase ? `${userStudentIdPrefix}${userStudentIdBase}` : undefined)
      : undefined;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: userEmail, password: userPassword, name: userName,
          role: userRole, icNumber: userIcNumber || undefined, studentId: finalStudentId,
        })
      });
      if (res.ok) { alert(`User Created!`); fetchActiveData(); }
      else alert(`Failed: ${res.status} - ${await res.text()}`);
    } catch (err: any) { alert(`Error: ${err.message}`); }
  };

  const handleSelectUserToModify = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setModifyUserId(id);
    if (!id) return;
    const u = users.find(x => x.id === id);
    if (u) {
      setModEmail(u.email || ''); setModName(u.name || '');
      setModRole(u.role || 'SUPERADMIN'); setModIcNumber(u.icNumber || '');
      setModPassword('');
      const spl = extractIdSplit(u.studentId);
      setModStudentIdPrefix(spl.prefix); setModStudentIdBase(spl.base);
    }
  };

  const submitModifyUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modifyUserId) return;
    const finalStudentId = (modRole === 'STUDENT' || modRole === 'CANDIDATE')
      ? (modStudentIdPrefix && modStudentIdBase ? `${modStudentIdPrefix}${modStudentIdBase}` : undefined) : undefined;

    const payload: any = { email: modEmail, name: modName, role: modRole, icNumber: modIcNumber || undefined, studentId: finalStudentId || null };
    if (modPassword.trim() !== '') payload.password = modPassword;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${modifyUserId}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify(payload)
      });
      if (res.ok) { alert(`User Modified!`); fetchActiveData(); }
      else alert(`Failed: ${res.status} - ${await res.text()}`);
    } catch (err: any) { alert(`Error: ${err.message}`); }
  };

  const deleteUser = async () => {
    if (!modifyUserId) return;
    if (!confirm("Delete user completely?")) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${modifyUserId}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) { alert("User deleted"); setModifyUserId(''); fetchActiveData(); }
      else alert(`Failed: ${await res.text()}`);
    } catch (err: any) { alert(`Error: ${err.message}`); }
  };

  const submitCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ code: courseCode, studentPrefix: courseStudentPrefix, name: courseName })
      });
      if (res.ok) { alert(`Course Created!`); fetchActiveData(); }
      else alert(`Failed: ${res.status} - ${await res.text()}`);
    } catch (err: any) { alert(`Error: ${err.message}`); }
  };

  const deleteCourse = async (id: string) => {
    if (!confirm("Delete course completely?")) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/${id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) fetchActiveData();
      else alert(`Failed: ${await res.text()}`);
    } catch (err: any) { alert(`Error: ${err.message}`); }
  };

  const submitImpersonate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!impersonateUserId) return;
    const targetUser = users.find(u => u.id === impersonateUserId);
    if (!targetUser) return;
    alert(`Impersonation would navigate to /dashboard/${targetUser.role.toLowerCase()}`);
  };

  return (
    <div>
      <h1>Super Admin System Operations</h1>

      <div style={{ marginTop: '2rem' }}>
        <h2>4. Users Database</h2>
        <form onSubmit={submitCreateUser} style={formStyle}>
          <label>Create System User</label>
          <input type="text" value={userName} onChange={e => setUserName(e.target.value)} placeholder="Name" required style={inputStyle} />
          <input type="email" value={userEmail} onChange={e => setUserEmail(e.target.value)} placeholder="Email" required style={inputStyle} />
          <input type="password" value={userPassword} onChange={e => setUserPassword(e.target.value)} placeholder="Password" required style={inputStyle} />
          <select value={userRole} onChange={e => setUserRole(e.target.value)} required style={inputStyle}>
            <option value="SUPERADMIN">SUPERADMIN</option>
            <option value="ADMIN">ADMIN</option>
            <option value="MPP_ADVISOR">MPP_ADVISOR</option>
            <option value="STUDENT">STUDENT</option>
            <option value="CANDIDATE">CANDIDATE</option>
          </select>
          <input type="text" value={userIcNumber} onChange={e => setUserIcNumber(e.target.value)} placeholder="IC Number (Optional)" style={inputStyle} />

          {(userRole === 'STUDENT' || userRole === 'CANDIDATE') && (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <select value={userStudentIdPrefix} onChange={e => setUserStudentIdPrefix(e.target.value)} style={{ ...inputStyle, flex: 1 }}>
                <option value="">-- Course Prefix --</option>
                {courses.map(c => <option key={c.id} value={c.studentPrefix}>{c.studentPrefix}</option>)}
              </select>
              <span style={{ fontWeight: 'bold', minWidth: '40px' }}>{userStudentIdPrefix}</span>
              <input type="text" value={userStudentIdBase} onChange={e => setUserStudentIdBase(e.target.value)} placeholder="e.g. 2311-014" style={{ ...inputStyle, flex: 2 }} />
            </div>
          )}
          <button type="submit" style={btnStyle}>Submit POST /users</button>
        </form>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem', width: '400px' }}>
          <input 
            type="text" 
            placeholder="Search name or email..." 
            value={userSearchQuery} 
            onChange={e => setUserSearchQuery(e.target.value)} 
            style={{ ...inputStyle, flex: 1 }} 
          />
          <select value={userRoleFilter} onChange={e => setUserRoleFilter(e.target.value)} style={inputStyle}>
            <option value="">All Roles</option>
            <option value="SUPERADMIN">SUPERADMIN</option>
            <option value="ADMIN">ADMIN</option>
            <option value="MPP_ADVISOR">MPP_ADVISOR</option>
            <option value="STUDENT">STUDENT</option>
            <option value="CANDIDATE">CANDIDATE</option>
          </select>
        </div>

        <select value={modifyUserId} onChange={handleSelectUserToModify} style={{ ...inputStyle, width: '400px', marginBottom: '1rem' }}>
          <option value="">-- Modify Existing User --</option>
          {filteredUsers.map(u => (
            <option key={u.id} value={u.id}>{u.name} ({u.email}) - {u.role}</option>
          ))}
        </select>

        {modifyUserId && (
          <form onSubmit={submitModifyUser} style={formStyle}>
            <input type="text" value={modName} onChange={e => setModName(e.target.value)} placeholder="Name" required style={inputStyle} />
            <input type="email" value={modEmail} onChange={e => setModEmail(e.target.value)} placeholder="Email" required style={inputStyle} />
            <input type="password" value={modPassword} onChange={e => setModPassword(e.target.value)} placeholder="Leave blank to preserve password" style={inputStyle} />

            <select value={modRole} onChange={e => setModRole(e.target.value)} required style={inputStyle}>
              <option value="SUPERADMIN">SUPERADMIN</option>
              <option value="ADMIN">ADMIN</option>
              <option value="MPP_ADVISOR">MPP_ADVISOR</option>
              <option value="STUDENT">STUDENT</option>
              <option value="CANDIDATE">CANDIDATE</option>
            </select>

            <input type="text" value={modIcNumber} onChange={e => setModIcNumber(e.target.value)} placeholder="IC Number" style={inputStyle} />

            {(modRole === 'STUDENT' || modRole === 'CANDIDATE') && (
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <select value={modStudentIdPrefix} onChange={e => setModStudentIdPrefix(e.target.value)} style={{ ...inputStyle, flex: 1 }}>
                  <option value="">-- Course Prefix --</option>
                  {courses.map(c => <option key={c.id} value={c.studentPrefix}>{c.studentPrefix}</option>)}
                </select>
                <span style={{ fontWeight: 'bold', minWidth: '40px' }}>{modStudentIdPrefix}</span>
                <input type="text" value={modStudentIdBase} onChange={e => setModStudentIdBase(e.target.value)} placeholder="e.g. 2311-014" style={{ ...inputStyle, flex: 2 }} />
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="submit" style={{ ...btnStyle, flex: 1 }}>Submit PATCH /users/:id</button>
              <button type="button" onClick={deleteUser} style={{ ...delBtnStyle, flex: 1 }}>Delete User</button>
            </div>
          </form>
        )}
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h2>3. Course Dictionary</h2>
        <ul style={{ marginBottom: '1rem' }}>
          {courses.map(c => (
            <li key={c.id}>
              <strong>{c.code}</strong> - {c.name} <button type="button" onClick={() => deleteCourse(c.id)} style={{ color: 'red', marginLeft: '1rem', background: 'none', border: 'none', cursor: 'pointer' }}>✖</button>
            </li>
          ))}
        </ul>
        <form onSubmit={submitCourse} style={formStyle}>
          <label>Add New Course</label>
          <input type="text" value={courseCode} onChange={e => setCourseCode(e.target.value)} placeholder="Code (e.g. DCS)" required style={inputStyle} />
          <input type="text" value={courseStudentPrefix} onChange={e => setCourseStudentPrefix(e.target.value)} placeholder="Student ID Prefix (e.g. BCS)" required style={inputStyle} />
          <input type="text" value={courseName} onChange={e => setCourseName(e.target.value)} placeholder="Name" required style={inputStyle} />
          <button type="submit" style={btnStyle}>Submit POST /courses</button>
        </form>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h2>5. Two-Factor Authentication</h2>
        <div style={formStyle}>
          {twoFactorEnabled && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <span style={{ 
                background: '#22c55e', 
                color: '#fff', 
                padding: '0.25rem 0.5rem', 
                borderRadius: '4px',
                fontSize: '0.8rem',
                fontWeight: 'bold'
              }}>
                2FA is Currently Active
              </span>
            </div>
          )}
          <p>Status: <strong>{twoFactorEnabled ? 'Enabled' : 'Disabled'}</strong></p>
          {!twoFactorEnabled && (
            <>
              <button onClick={generateQrCode} disabled={twoFactorLoading} style={{ ...btnStyle, background: '#059669' }}>
                {twoFactorLoading ? 'Generating...' : 'Generate QR Code'}
              </button>
              {qrCodeUrl && (
                <>
                  <img src={qrCodeUrl} alt="2FA QR Code" style={{ width: '200px', height: '200px' }} />
                  <p style={{ fontSize: '0.8rem' }}>Scan with your authenticator app, then enter code below:</p>
                  <form onSubmit={enableTwoFactor}>
                    <input 
                      type="text" 
                      value={verificationCode} 
                      onChange={e => setVerificationCode(e.target.value)} 
                      placeholder="6-digit code" 
                      maxLength={6}
                      style={{ ...inputStyle, width: '200px', textAlign: 'center', letterSpacing: '0.3em' }}
                      required 
                    />
                    <button type="submit" disabled={twoFactorLoading} style={{ ...btnStyle, background: '#059669' }}>
                      Enable 2FA
                    </button>
                  </form>
                </>
              )}
            </>
          )}
          {twoFactorEnabled && (
            <button onClick={disableTwoFactor} disabled={twoFactorLoading} style={{ ...btnStyle, background: '#dc2626' }}>
              {twoFactorLoading ? 'Disabling...' : 'Disable 2FA'}
            </button>
          )}
          {twoFactorMessage && (
            <p style={{ color: twoFactorMessage.includes('success') ? 'green' : 'red', fontWeight: 'bold' }}>{twoFactorMessage}</p>
          )}
        </div>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h2>6. Impersonate User</h2>
        <form onSubmit={submitImpersonate} style={formStyle}>
          <select value={impersonateUserId} onChange={e => setImpersonateUserId(e.target.value)} required style={{ ...inputStyle, width: '400px' }}>
            <option value="">-- Select User to Impersonate --</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
            ))}
          </select>
          <button type="submit" style={{ ...btnStyle, background: '#4f46e5' }}>Impersonate</button>
        </form>
      </div>
    </div>
  );
}
