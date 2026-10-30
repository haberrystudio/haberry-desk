"use client";

import React, { useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export interface ToastMessage {
  id?: string;
  type: "success" | "error" | "info";
  message: string;
  actionText?: string;
  actionHref?: string;
}

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
  duration?: number;
}

export function Toast({ toast, onClose, duration = 4500 }: ToastProps) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [toast, onClose, duration]);

  if (!toast) return null;

  const isError = toast.type === "error";
  const isSuccess = toast.type === "success";

  return (
    <div className="fixed top-5 right-5 z-50 max-w-sm w-full animate-in fade-in slide-in-from-top-3 duration-200">
      <div
        className={`rounded-xl p-3.5 shadow-xl border flex items-start gap-3 backdrop-blur-md ${
          isError
            ? "bg-[#181113]/95 border-red-900/80 text-red-100"
            : isSuccess
            ? "bg-[#0f1a14]/95 border-emerald-900/80 text-emerald-100"
            : "bg-[#14151a]/95 border-zinc-800 text-zinc-100"
        }`}
      >
        <div className="shrink-0 mt-0.5">
          {isError && <AlertCircle className="w-4 h-4 text-red-400" />}
          {isSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          {!isError && !isSuccess && <Info className="w-4 h-4 text-sky-400" />}
        </div>

        <div className="flex-1 text-xs leading-relaxed">
          <p className="font-medium">{toast.message}</p>
          {toast.actionText && toast.actionHref && (
            <a
              href={toast.actionHref}
              className="inline-block mt-1.5 font-semibold underline text-[11px] hover:opacity-80"
            >
              {toast.actionText} &rarr;
            </a>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="shrink-0 text-zinc-400 hover:text-white p-0.5 rounded cursor-pointer transition-colors"
          title="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

