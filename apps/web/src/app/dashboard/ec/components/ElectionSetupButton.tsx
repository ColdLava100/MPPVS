'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Settings, Plus, Pencil, ChevronDown, X } from 'lucide-react';

interface ElectionSetupButtonProps {
  elections: any[];
  onCreateNew: () => void;
  onEditExisting: (election: any) => void;
}

export default function ElectionSetupButton({ elections, onCreateNew, onEditExisting }: ElectionSetupButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showEditList, setShowEditList] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const draftElections = elections.filter(e => e.status === 'DRAFT');
  const activeElections = elections.filter(e => e.status === 'ACTIVE');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowEditList(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleEditSelect = (election: any) => {
    setIsOpen(false);
    setShowEditList(false);
    onEditExisting(election);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-[#c5a021] hover:bg-yellow-400 text-black px-6 py-3 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg"
      >
        <Settings size={16} />
        Election Setup
        <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white/95 backdrop-blur-xl border border-white/20 rounded-sm shadow-2xl z-50">
          <div className="p-2">
            <button
              onClick={() => {
                setIsOpen(false);
                onCreateNew();
              }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-100 rounded-sm transition-colors text-left"
            >
              <div className="w-8 h-8 bg-[#c5a021]/20 rounded-full flex items-center justify-center">
                <Plus size={16} className="text-[#c5a021]" />
              </div>
              <div>
                <p className="text-sm font-bold text-black">Create New Election</p>
                <p className="text-[9px] text-slate-500">Start from scratch</p>
              </div>
            </button>

            <div className="my-2 border-t border-slate-200" />

            <button
              onClick={() => setShowEditList(!showEditList)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-100 rounded-sm transition-colors text-left"
            >
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Pencil size={16} className="text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-black">Edit Existing</p>
                <p className="text-[9px] text-slate-500">Modify saved elections</p>
              </div>
              <ChevronDown size={14} className={`text-slate-400 transition-transform ${showEditList ? 'rotate-180' : ''}`} />
            </button>

            {showEditList && (
              <div className="mt-2 ml-4 pl-4 border-l-2 border-slate-200 space-y-1">
                {draftElections.length === 0 && activeElections.length === 0 ? (
                  <p className="text-[10px] text-slate-400 px-4 py-2 italic">No elections to edit</p>
                ) : (
                  <>
                    {draftElections.map(election => (
                      <button
                        key={election.id}
                        onClick={() => handleEditSelect(election)}
                        className="w-full text-left px-4 py-2 hover:bg-slate-100 rounded-sm transition-colors"
                      >
                        <p className="text-sm font-bold text-black truncate">{election.title}</p>
                        <p className="text-[9px] text-yellow-600 font-black uppercase">Draft</p>
                      </button>
                    ))}
                    {activeElections.map(election => (
                      <button
                        key={election.id}
                        onClick={() => handleEditSelect(election)}
                        className="w-full text-left px-4 py-2 hover:bg-slate-100 rounded-sm transition-colors"
                      >
                        <p className="text-sm font-bold text-black truncate">{election.title}</p>
                        <p className="text-[9px] text-green-600 font-black uppercase">Active</p>
                      </button>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}