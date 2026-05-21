"use client";

import React from "react";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning";
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  const confirmColor = variant === "danger"
    ? "bg-red-600 hover:bg-red-700 text-white"
    : "bg-yellow-600 hover:bg-yellow-700 text-white";

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#1a1a2e] border border-white/10 rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <AlertTriangle size={20} className={variant === "danger" ? "text-red-400" : "text-yellow-400"} />
            <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-white">{title}</h3>
          </div>
          <button
            onClick={onCancel}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-5">
          <p className="text-sm text-white/80 leading-relaxed">{message}</p>
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-white/10">
          <button
            onClick={onConfirm}
            className={`flex-1 py-3 rounded-lg text-[11px] font-black uppercase tracking-[0.15em] transition-all ${confirmColor}`}
          >
            {confirmLabel}
          </button>
          <button
            onClick={onCancel}
            className="flex-1 bg-white/5 text-white py-3 rounded-lg text-[11px] font-black uppercase tracking-[0.15em] hover:bg-white/10 transition-all border border-white/10"
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
