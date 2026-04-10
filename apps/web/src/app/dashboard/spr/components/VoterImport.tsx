'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Upload, Download, Users, FileText, AlertCircle, CheckCircle } from 'lucide-react';

interface VoterImportProps {
  electionId: string | null;
  onRefresh: () => void;
}

interface ParsedVoter {
  name: string;
  email: string;
  studentId: string;
  icNumber: string;
  course: string;
}

export default function VoterImport({ electionId, onRefresh }: VoterImportProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [parsedVoters, setParsedVoters] = useState<ParsedVoter[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: number; failed: number; skipped?: number } | null>(null);
  const [importedVoters, setImportedVoters] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch imported voters when electionId changes
  useEffect(() => {
    if (electionId) {
      fetchImportedVoters();
    } else {
      setImportedVoters([]);
    }
  }, [electionId]);

  const fetchImportedVoters = async () => {
    if (!electionId) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/voter-registrations?electionId=${electionId}`, { 
        credentials: 'include' 
      });
      if (res.ok) {
        const data = await res.json();
        setImportedVoters(data);
      }
    } catch (err) {
      console.error('Failed to fetch imported voters', err);
    }
  };

  const sampleCsvData = [
    ['name', 'email', 'studentId', 'icNumber', 'course'],
    ['John Doe', 'john@example.com', 'BCS2311-001', '010101-01-0001', 'BCS'],
    ['Jane Smith', 'jane@example.com', 'BCS2311-002', '010101-01-0002', 'BCS'],
    ['Ali Bin Ahmad', 'ali@example.com', 'DCS2311-001', '010101-01-0003', 'DCS'],
  ];

  const downloadTemplate = () => {
    const csvContent = sampleCsvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'voter_template.csv';
    link.click();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    alert(`Files selected: ${files?.length || 0}`);
    if (files && files.length > 0) {
      alert(`File name: ${files[0].name}`);
      processFile(files[0]);
    }
  };

  const processFile = (file: File) => {
    alert(`processFile called with: ${file.name}`);
    if (!file.name.endsWith('.csv')) {
      alert('Please upload a CSV file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      alert(`File content length: ${text.length} chars`);
      
      const lines = text.split('\n').filter(line => line.trim());
      alert(`Lines found: ${lines.length}`);
      
      if (lines.length < 2) {
        alert('CSV file is empty or has no data rows');
        return;
      }

      // More robust header parsing - normalize headers
      const rawHeaders = lines[0].split(',').map(h => h.trim());
      const headers = rawHeaders.map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
      alert(`Raw headers: ${rawHeaders.join(', ')}`);
      alert(`Normalized headers: ${headers.join(', ')}`);
      
      const voters: ParsedVoter[] = [];

      for (let i = 1; i < lines.length; i++) {
        // Better handling of whitespace and empty values
        const rawValues = lines[i].split(',').map(v => v.trim());
        const values = rawValues;
        
        // Map values to headers dynamically
        const voter: any = {};
        headers.forEach((header, index) => {
          voter[header] = values[index] || '';
        });

        // Also store original keys for debugging
        rawHeaders.forEach((header, index) => {
          const normalizedHeader = header.toLowerCase().replace(/[^a-z0-9]/g, '');
          voter[normalizedHeader] = values[index] || '';
        });

        // More tolerant check - accept if either name OR studentId exists
        const hasName = !!(voter.name || voter.name);
        const hasStudentId = !!(voter.studentid || voter.studentId || voter.studentid);
        
        console.log(`Row ${i}: name="${voter.name}", studentId="${voter.studentId || voter.studentid}"`);
        
        if (hasName && hasStudentId) {
          const email = voter.email || voter.email || (voter.studentid || voter.studentId ? `${(voter.studentid || voter.studentId).toLowerCase()}@student.edu.my` : '');
          const icnum = voter.icnumber || voter.icnumber || voter.icnumber || '';
          const courseVal = voter.course || voter.course || '';
          
          voters.push({
            name: voter.name || voter.name,
            email: email,
            studentId: voter.studentid || voter.studentId || '',
            icNumber: icnum,
            course: courseVal,
          });
        }
      }

      alert(`Parsing complete: ${voters.length} voters found`);
      if (voters.length === 0) {
        alert(`No valid voters found. Check that CSV has 'name' and 'studentId' columns.`);
      }
      setParsedVoters(voters);
      alert(`State updated, voters count: ${voters.length}`);
      setImportResult(null);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (parsedVoters.length === 0) {
      alert('No voters to import');
      return;
    }

    if (!electionId) {
      alert('Please select an election first');
      return;
    }

    setIsImporting(true);
    let success = 0;
    let failed = 0;
    let skipped = 0;
    const failedDetails: { name: string; error: string }[] = [];

    // Bulk import all voters at once to the new endpoint
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/voter-registrations/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          electionId,
          voters: parsedVoters
        })
      });

      console.log('Import Response:', res.status, res.statusText);
      
      if (res.ok) {
        const result = await res.json();
        success = result.success || 0;
        failed = result.failed || 0;
        skipped = result.skipped || 0;
        
        if (result.errors && result.errors.length > 0) {
          result.errors.forEach((err: string) => {
            failedDetails.push({ name: 'Error', error: err });
          });
        }
        
        alert(`Import complete: ${success} succeeded, ${failed} failed, ${skipped} skipped.`);
        setImportResult({ success, failed });
        
        if (success > 0) {
          onRefresh();
          fetchImportedVoters();
        }
      } else {
        const errorText = await res.text();
        console.log('Error:', errorText);
        alert(`Import failed: ${errorText}`);
      }
    } catch (err: any) {
      console.log('Exception:', err.message);
      alert(`Error: ${err.message}`);
    }

    setIsImporting(false);
  };

  const clearData = () => {
    setParsedVoters([]);
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!electionId) {
    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-[#4c0519]/20 rounded-lg border border-white/10">
            <Users size={20} className="text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold uppercase tracking-tighter text-[#4c0519]">Voter Import</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Upload CSV to import voters</p>
          </div>
        </div>
        <div className="text-center py-12 bg-slate-50 border border-dashed border-slate-300 rounded-sm">
          <AlertCircle size={48} className="text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">Please complete Step 1 and Step 2 first to select an election.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#4c0519]/20 rounded-lg border border-white/10">
            <Users size={20} className="text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold uppercase tracking-tighter text-[#4c0519]">Voter Import</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Upload CSV file to import voters</p>
          </div>
        </div>
        <button 
          onClick={downloadTemplate}
          className="bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded text-[9px] font-black uppercase tracking-widest transition flex items-center gap-2"
        >
          <Download size={14} /> Download Template
        </button>
      </div>

      {/* Upload Area */}
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-sm p-12 text-center cursor-pointer transition-all ${
          isDragging 
            ? 'border-[#4c0519] bg-[#4c0519]/5' 
            : 'border-slate-300 hover:border-[#4c0519]'
        }`}
      >
        <input 
          ref={fileInputRef}
          type="file" 
          accept=".csv" 
          onChange={handleFileSelect}
          className="hidden" 
        />
        <Upload size={48} className="text-slate-300 mx-auto mb-4" />
        <p className="text-slate-600 font-bold">Drag & drop your CSV file here</p>
        <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-2">or click to browse</p>
      </div>

      {/* Parsed Data Preview */}
      {parsedVoters.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-bold text-black">
              Preview: {parsedVoters.length} voters found
            </p>
            <button onClick={clearData} className="text-red-500 text-[10px] font-black uppercase">
              Clear
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-sm overflow-hidden max-h-64 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-2 text-left text-[10px] font-black text-slate-500 uppercase">Name</th>
                  <th className="px-4 py-2 text-left text-[10px] font-black text-slate-500 uppercase">Student ID</th>
                  <th className="px-4 py-2 text-left text-[10px] font-black text-slate-500 uppercase">Email</th>
                  <th className="px-4 py-2 text-left text-[10px] font-black text-slate-500 uppercase">Course</th>
                </tr>
              </thead>
              <tbody>
                {parsedVoters.slice(0, 10).map((voter, index) => (
                  <tr key={index} className="border-t border-slate-100">
                    <td className="px-4 py-2 text-black">{voter.name}</td>
                    <td className="px-4 py-2 text-black font-mono text-xs">{voter.studentId}</td>
                    <td className="px-4 py-2 text-black">{voter.email}</td>
                    <td className="px-4 py-2 text-black">{voter.course}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {parsedVoters.length > 10 && (
              <div className="p-2 text-center text-[10px] text-slate-400 bg-slate-50">
                ... and {parsedVoters.length - 10} more voters
              </div>
            )}
          </div>

          <div className="mt-4 flex justify-end">
            <button 
              onClick={handleImport}
              disabled={isImporting}
              className="bg-[#c5a021] text-black px-8 py-3 rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-yellow-400 transition-all flex items-center gap-2"
            >
              {isImporting ? 'Importing...' : `Import ${parsedVoters.length} Voters`}
            </button>
          </div>
        </div>
      )}

      {/* Import Result */}
      {importResult && (
        <div className={`mt-6 p-4 rounded-sm ${importResult.failed > 0 ? 'bg-yellow-50 border border-yellow-200' : 'bg-green-50 border border-green-200'}`}>
          <div className="flex items-center gap-3">
            {importResult.failed > 0 ? (
              <AlertCircle size={20} className="text-yellow-600" />
            ) : (
              <CheckCircle size={20} className="text-green-600" />
            )}
            <div>
              <p className="text-sm font-bold text-black">
                Import Complete: {importResult.success} succeeded, {importResult.failed} failed
              </p>
              {importResult.failed > 0 && (
                <p className="text-[10px] text-slate-500">Failed voters may already exist in the system.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Imported Voters Preview */}
      {importedVoters.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-[#4c0519]" />
              <h4 className="text-lg font-bold uppercase tracking-tighter text-[#4c0519]">
                Imported Voters ({importedVoters.length})
              </h4>
            </div>
            <button 
              onClick={async () => {
                if (!electionId || !confirm('Archive all voters for this election?')) return;
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/voter-registrations/${electionId}/archive`, {
                  method: 'POST',
                  credentials: 'include'
                });
                if (res.ok) {
                  alert('Voters archived successfully!');
                  fetchImportedVoters();
                  onRefresh();
                } else {
                  alert('Failed to archive voters');
                }
              }}
              className="bg-red-600 text-white px-4 py-2 rounded text-[10px] font-black uppercase tracking-widest hover:bg-red-700"
            >
              Archive All
            </button>
          </div>
          
          <div className="bg-white border border-slate-200 rounded-sm overflow-hidden max-h-80 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-[10px] font-black text-slate-500 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-[10px] font-black text-slate-500 uppercase">Student ID</th>
                  <th className="px-4 py-3 text-left text-[10px] font-black text-slate-500 uppercase">IC Number</th>
                  <th className="px-4 py-3 text-left text-[10px] font-black text-slate-500 uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-[10px] font-black text-slate-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {importedVoters.map((reg) => {
                  const user = reg.user || {};
                  return (
                    <tr key={reg.id} className="border-t border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-2 text-black font-medium">{user.name || '-'}</td>
                      <td className="px-4 py-2 text-black font-mono text-xs">{user.studentId || '-'}</td>
                      <td className="px-4 py-2 text-black font-mono text-xs">{user.icNumber || '-'}</td>
                      <td className="px-4 py-2 text-black text-xs">{user.email || '-'}</td>
                      <td className="px-4 py-2">
                        {reg.isArchived ? (
                          <span className="bg-slate-200 text-slate-600 px-2 py-1 rounded text-[9px] font-black uppercase">Archived</span>
                        ) : (
                          <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-[9px] font-black uppercase">Active</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}