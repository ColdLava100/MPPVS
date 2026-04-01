"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState('');
  const [studentId, setStudentId] = useState('');
  const [icNumber, setIcNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    // Mock the first step for all roles and seamlessly transition to Unified Step 2
    setStep(2);
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (twoFactorCode === '000000') {
      alert('Magic Code Accepted! Bypassing security for testing...');
      
      let rolePath = selectedRole.toLowerCase();
      
      // Standardize the dashboard string routes from the precise enum states
      if (selectedRole === 'SUPER_ADMIN') rolePath = 'superadmin';
      if (selectedRole === 'MPP_ADVISOR') rolePath = 'advisor';

      router.push(`/dashboard/${rolePath}`);
    } else {
      alert('Invalid code. For testing, please use 000000.');
    }
  };

  const isStudentOrCandidate = selectedRole === 'STUDENT' || selectedRole === 'CANDIDATE';
  const isStaff = selectedRole === 'SUPER_ADMIN' || selectedRole === 'ADMIN' || selectedRole === 'MPP_ADVISOR';

  return (
    <div style={{ backgroundColor: '#fff', color: '#000', minHeight: '100vh', padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>System Login (Tracer Bullet UI)</h1>

      {step === 1 && (
        <div style={{ marginBottom: '2rem', marginTop: '1rem' }}>
          <label htmlFor="roleSelect" style={{ fontWeight: 'bold' }}>Select Your Role:</label><br />
          <select 
            id="roleSelect" 
            value={selectedRole} 
            onChange={(e) => {
              setSelectedRole(e.target.value);
              setStep(1);
              setError('');
            }} 
            style={{ padding: '0.5rem', width: '300px', marginTop: '0.5rem' }}
          >
            <option value="" disabled>-- Choose a Role --</option>
            <option value="SUPER_ADMIN">SUPER_ADMIN</option>
            <option value="ADMIN">ADMIN</option>
            <option value="MPP_ADVISOR">MPP_ADVISOR</option>
            <option value="CANDIDATE">CANDIDATE</option>
            <option value="STUDENT">STUDENT</option>
          </select>
        </div>
      )}

      {step === 1 && isStudentOrCandidate && (
        <form onSubmit={handleInitialSubmit} style={{ display: 'flex', flexDirection: 'column', maxWidth: '300px', gap: '1rem' }}>
          <h3>{selectedRole} Authentication - Step 1</h3>
          <div>
            <label htmlFor="studentId">Student ID:</label><br />
            <input 
              id="studentId" 
              type="text" 
              value={studentId} 
              onChange={(e) => setStudentId(e.target.value)} 
              required 
              style={{ padding: '0.5rem', width: '100%' }}
            />
          </div>
          <div>
            <label htmlFor="icNumber">IC Number:</label><br />
            <input 
              id="icNumber" 
              type="text" 
              value={icNumber} 
              onChange={(e) => setIcNumber(e.target.value)} 
              required 
              style={{ padding: '0.5rem', width: '100%' }}
            />
          </div>
          <button type="submit" style={{ padding: '0.75rem', cursor: 'pointer' }}>Next</button>
        </form>
      )}

      {step === 1 && isStaff && (
        <form onSubmit={handleInitialSubmit} style={{ display: 'flex', flexDirection: 'column', maxWidth: '300px', gap: '1rem' }}>
          <h3>{selectedRole} Authentication - Step 1</h3>
          <div>
            <label htmlFor="email">Email Address:</label><br />
            <input 
              id="email" 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              style={{ padding: '0.5rem', width: '100%' }}
            />
          </div>
          <div>
            <label htmlFor="password">Password:</label><br />
            <input 
              id="password" 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              style={{ padding: '0.5rem', width: '100%' }}
            />
          </div>
          <button type="submit" style={{ padding: '0.75rem', cursor: 'pointer' }}>Next</button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleVerifyCode} style={{ display: 'flex', flexDirection: 'column', maxWidth: '300px', gap: '1rem', marginTop: '1rem' }}>
          <h3>{selectedRole} Authentication - Step 2 (Verification)</h3>
          <div>
            <label htmlFor="twoFactorCode">6-Digit Code:</label><br />
            <input 
              id="twoFactorCode" 
              type="text" 
              value={twoFactorCode} 
              placeholder="e.g. 000000"
              onChange={(e) => setTwoFactorCode(e.target.value)} 
              maxLength={6}
              required 
              style={{ padding: '0.5rem', width: '100%' }}
            />
          </div>
          <button type="submit" style={{ padding: '0.75rem', cursor: 'pointer' }}>Verify Code</button>
          
          <button 
            type="button" 
            onClick={() => setStep(1)} 
            style={{ padding: '0.5rem', cursor: 'pointer', background: 'transparent', border: '1px solid #000' }}
          >
            Back
          </button>
        </form>
      )}

      {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
    </div>
  );
}
