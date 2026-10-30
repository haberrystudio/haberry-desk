"use client";

import React, { useState } from "react";
import { X, ArrowRight, ShieldCheck, Check, Sparkles } from "lucide-react";
import { HaberryDeskLogo, GithubIcon } from "./HaberryDeskLogo";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "signin" | "trial";
}

export function AuthModal({ isOpen, onClose, initialMode = "trial" }: AuthModalProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-[#121215] border border-zinc-700/80 rounded-2xl shadow-2xl shadow-black p-6 sm:p-8 z-10 animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-zinc-400 hover:text-white rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <HaberryDeskLogo />
          </div>
          <h3 className="text-xl font-semibold text-white tracking-tight">
            {submitted
              ? "Check your inbox"
              : initialMode === "trial"
              ? "Start your 14-day Haberry Desk Cloud trial"
              : "Welcome back to Haberry Desk"}
          </h3>
          <p className="mt-1.5 text-xs sm:text-sm text-zinc-400">
            {submitted
              ? `We sent a magic sign-in link to ${email}`
              : "No credit card required. Up and running in 2 minutes."}
          </p>
        </div>

        {submitted ? (
          <div className="space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-950 border border-emerald-700 mx-auto flex items-center justify-center text-emerald-400">
              <Check className="w-6 h-6" />
            </div>
            <p className="text-xs text-zinc-400">
              Click the link in the email to automatically create your Haberry Desk Cloud workspace and invite teammates.
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                onClose();
              }}
              className="w-full py-2.5 rounded-lg bg-zinc-800 text-white font-medium text-xs hover:bg-zinc-700 transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* GitHub OAuth Button */}
            <button
              onClick={() => {
                alert("Simulating GitHub OAuth login for Haberry Desk workspace!");
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-lg bg-white text-zinc-950 font-medium text-sm hover:bg-zinc-200 transition-colors shadow-sm cursor-pointer"
            >
              <GithubIcon className="w-4 h-4" />
              <span>Continue with GitHub</span>
            </button>

            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-zinc-800" />
              <span className="text-[11px] uppercase tracking-wider text-zinc-500 font-mono">
                or with email
              </span>
              <div className="flex-1 h-px bg-zinc-800" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Work Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="alex@acmecorp.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white transition-colors"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-sm transition-colors cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="pt-4 border-t border-zinc-800 text-center space-y-2">
              <p className="text-[11px] text-zinc-500 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Enterprise SOC-2 compliant &amp; fully encrypted</span>
              </p>
              <p className="text-[11px] text-zinc-500">
                Self-hosting on your private cluster?{" "}
                <a
                  href="#self-hosting"
                  className="text-zinc-300 underline hover:text-white"
                >
                  Docker Compose guide
                </a>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

