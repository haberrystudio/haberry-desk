"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  HaberryDeskIcon,
  GithubIcon,
  GoogleIcon,
} from "@/components/HaberryDeskLogo";
import { Check, ArrowLeft, AlertCircle, Loader2, KeyRound } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [step, setStep] = useState<"email" | "otp" | "success">("email");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  // Check if already authenticated on mount
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        window.location.href = "/dashboard";
      }
    });
  }, []);

  // Countdown timer for resending OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Step 1: Send OTP to Email
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const supabase = createClient();
      const redirectUrl = `${window.location.origin}/auth/callback?next=/dashboard`;

      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: redirectUrl,
          shouldCreateUser: true,
        },
      });

      if (error) {
        if (
          error.message.includes("API key") ||
          error.message.includes("Failed to fetch")
        ) {
          setErrorMessage(
            "Supabase anon key needs to be configured in .env (NEXT_PUBLIC_SUPABASE_ANON_KEY). Check your dashboard."
          );
        } else {
          setErrorMessage(error.message);
        }
      } else {
        setStep("otp");
        setCountdown(30);
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Authentication request failed";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim() || otpCode.trim().length < 6) {
      setErrorMessage("Please enter the 6-digit verification code.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: otpCode.trim(),
        type: "email",
      });

      if (error) {
        setErrorMessage(error.message);
      } else if (data.session || data.user) {
        setStep("success");
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1000);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "OTP verification failed";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // OAuth Sign In (Google & GitHub)
  const handleOAuth = async (provider: "google" | "github") => {
    setErrorMessage(null);
    try {
      const supabase = createClient();
      const redirectUrl = `${window.location.origin}/auth/callback?next=/dashboard`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        setErrorMessage(error.message);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "OAuth connection failed";
      setErrorMessage(msg);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#0e0e11] text-[#f4f4f5] px-4 font-sans selection:bg-zinc-800 selection:text-white">
      {/* Top back link */}
      <div className="pt-6 sm:pt-8 max-w-5xl mx-auto w-full">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Haberry Desk</span>
        </Link>
      </div>

      {/* Main Card */}
      <div className="flex-1 flex flex-col items-center justify-center py-10">
        <div className="w-full max-w-[390px]">
          {/* Logo */}
          <div className="mb-6">
            <Link href="/" className="inline-block hover:opacity-90 transition-opacity">
              <HaberryDeskIcon className="w-7 h-7 text-white" />
            </Link>
          </div>

          {/* Heading */}
          <h1 className="text-2xl font-semibold text-white tracking-tight">
            Sign in to Haberry Desk
          </h1>
          <p className="text-sm text-zinc-400 mt-1 mb-6">
            {step === "otp"
              ? "Enter the verification code sent to your email."
              : "Use your email or a connected account."}
          </p>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-lg bg-red-950/60 border border-red-800/80 text-xs text-red-200 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1 leading-snug">{errorMessage}</div>
            </div>
          )}

          {/* STEP 1: Enter Email */}
          {step === "email" && (
            <div className="space-y-4">
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label
                    htmlFor="email-input"
                    className="block text-xs font-medium text-zinc-200 mb-2"
                  >
                    Email
                  </label>
                  <input
                    id="email-input"
                    type="email"
                    required
                    placeholder="me@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#141417] border border-zinc-800 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 rounded-lg bg-[#9ca3af] hover:bg-[#b0b0b8] active:bg-[#8f96a3] disabled:opacity-50 text-[#121214] font-medium text-sm transition-colors cursor-pointer shadow-sm flex items-center justify-center gap-2"
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin text-[#121214]" />}
                  <span>Continue with email</span>
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-6 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-800/80" />
                </div>
                <span className="relative bg-[#0e0e11] px-3 text-xs text-zinc-500">
                  or
                </span>
              </div>

              {/* Social Buttons (Google & GitHub, Discord removed) */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleOAuth("google")}
                  className="flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-lg border border-zinc-800 bg-[#141417]/70 hover:bg-zinc-800 text-xs font-medium text-zinc-300 hover:text-white transition-colors cursor-pointer"
                >
                  <GoogleIcon className="w-4 h-4 text-zinc-300" />
                  <span>Google</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOAuth("github")}
                  className="flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-lg border border-zinc-800 bg-[#141417]/70 hover:bg-zinc-800 text-xs font-medium text-zinc-300 hover:text-white transition-colors cursor-pointer"
                >
                  <GithubIcon className="w-4 h-4 text-zinc-300" />
                  <span>GitHub</span>
                </button>
              </div>

              {/* Bottom switch link */}
              <p className="text-xs text-zinc-400 text-center mt-6 pt-2">
                New to Haberry Desk?{" "}
                <Link
                  href="/auth/sign-up"
                  className="text-white underline font-medium hover:text-zinc-200 transition-colors"
                >
                  Create an account
                </Link>
              </p>
            </div>
          )}

          {/* STEP 2: Enter OTP Code */}
          {step === "otp" && (
            <div className="bg-[#141417] border border-zinc-800 rounded-xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
              <div className="text-center space-y-1">
                <div className="w-10 h-10 rounded-full bg-zinc-800 text-zinc-200 flex items-center justify-center mx-auto mb-2">
                  <KeyRound className="w-5 h-5 text-zinc-300" />
                </div>
                <h3 className="text-base font-semibold text-white">Enter OTP Code</h3>
                <p className="text-xs text-zinc-400">
                  We sent a 6-digit code to{" "}
                  <strong className="text-zinc-200 font-medium">{email}</strong>
                </p>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoFocus
                    maxLength={6}
                    placeholder="123456"
                    value={otpCode}
                    onChange={(e) =>
                      setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    className="w-full text-center text-2xl font-mono tracking-[0.35em] px-3 py-3 rounded-lg bg-[#0e0e11] border border-zinc-700 text-white placeholder:text-zinc-600 focus:outline-none focus:border-white transition-colors"
                  />
                  <p className="text-[11px] text-zinc-500 text-center mt-1.5">
                    Enter the 6-digit verification code from your email
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || otpCode.length < 6}
                  className="w-full py-2.5 px-4 rounded-lg bg-white hover:bg-zinc-200 disabled:opacity-40 text-zinc-950 font-semibold text-sm transition-colors cursor-pointer shadow-sm flex items-center justify-center gap-2"
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin text-zinc-950" />}
                  <span>Verify and Sign In</span>
                </button>
              </form>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-zinc-800/80">
                <button
                  type="button"
                  onClick={() => {
                    setStep("email");
                    setOtpCode("");
                    setErrorMessage(null);
                  }}
                  className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  Edit email
                </button>

                {countdown > 0 ? (
                  <span className="text-zinc-500 font-mono text-[11px]">
                    Resend in {countdown}s
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSendOtp()}
                    disabled={isLoading}
                    className="text-zinc-300 hover:text-white underline font-medium transition-colors cursor-pointer"
                  >
                    Resend code
                  </button>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: Success Screen */}
          {step === "success" && (
            <div className="bg-[#141417] border border-zinc-800 rounded-xl p-6 text-center space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="w-12 h-12 rounded-full bg-emerald-950/80 border border-emerald-700/60 text-emerald-400 flex items-center justify-center mx-auto">
                <Check className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-semibold text-white">
                  Successfully Verified
                </h3>
                <p className="text-xs text-zinc-400">
                  Signing you in to your Haberry Desk workspace...
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 flex items-center justify-center gap-6 text-xs text-zinc-500">
        <a href="#terms" className="hover:text-zinc-400 transition-colors">
          Terms
        </a>
        <a href="#privacy" className="hover:text-zinc-400 transition-colors">
          Privacy
        </a>
        <Link href="/" className="hover:text-zinc-400 transition-colors">
          haberrydesk.com
        </Link>
      </footer>
    </div>
  );
}
