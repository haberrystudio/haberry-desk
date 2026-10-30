"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  HaberryDeskIcon,
  GithubIcon,
  GoogleIcon,
} from "@/components/HaberryDeskLogo";
import {
  Check,
  ArrowLeft,
  AlertCircle,
  Loader2,
  KeyRound,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Toast, type ToastMessage } from "@/components/Toast";

export default function SignUpPage() {
  const router = useRouter();

  // Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // OTP Verification Step
  const [otpCode, setOtpCode] = useState("");
  const [step, setStep] = useState<"form" | "otp" | "success">("form");
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Toast & Inline Error
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Check if already authenticated on mount -> redirect to dashboard
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setToast({
          type: "info",
          message: "You are already signed in. Redirecting to your dashboard...",
        });
        setTimeout(() => {
          router.replace("/dashboard");
        }, 800);
      }
    });
  }, [router]);

  // Countdown timer for resending OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Step 1: Submit Signup Form (Name, Email, Password, Confirm Password)
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!name.trim()) {
      setErrorMessage("Please enter your name.");
      setToast({ type: "error", message: "Please enter your name." });
      return;
    }
    if (!email.trim()) {
      setErrorMessage("Please enter a valid email address.");
      setToast({ type: "error", message: "Please enter a valid email address." });
      return;
    }
    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      setToast({
        type: "error",
        message: "Password must be at least 6 characters.",
      });
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      setToast({
        type: "error",
        message: "Passwords do not match. Please verify your password.",
      });
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      const redirectUrl = `${window.location.origin}/auth/callback?next=/dashboard`;

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: name.trim(),
          },
        },
      });

      if (error) {
        const lowerMsg = error.message.toLowerCase();
        if (
          lowerMsg.includes("already registered") ||
          lowerMsg.includes("already exists") ||
          lowerMsg.includes("user already")
        ) {
          const msg = "An account with this email already exists. Please sign in.";
          setErrorMessage(msg);
          setToast({
            type: "error",
            message: msg,
            actionText: "Sign in here",
            actionHref: "/auth/sign-in",
          });
        } else {
          setErrorMessage(error.message);
          setToast({ type: "error", message: error.message });
        }
      } else {
        // If user is already confirmed (e.g. email confirmation disabled in project settings)
        if (data.session) {
          setStep("success");
          setToast({
            type: "success",
            message: "Account created! Redirecting to dashboard...",
          });
          setTimeout(() => {
            window.location.href = "/dashboard";
          }, 1000);
        } else {
          // Transition to OTP verification step
          setStep("otp");
          setCountdown(60);
          setOtpCode("");
          setToast({
            type: "success",
            message: `Verification code sent to ${email.trim()}`,
          });
        }
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Account registration failed";
      setErrorMessage(msg);
      setToast({ type: "error", message: msg });
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim() || otpCode.trim().length < 6) {
      setErrorMessage("Please enter the 6-digit verification code.");
      setToast({
        type: "error",
        message: "Please enter the 6-digit verification code.",
      });
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const supabase = createClient();

      // First attempt with type: "signup"
      let { data, error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: otpCode.trim(),
        type: "signup",
      });

      // Fallback to "email" if required by GoTrue client
      if (error && error.message.toLowerCase().includes("type")) {
        const fallback = await supabase.auth.verifyOtp({
          email: email.trim(),
          token: otpCode.trim(),
          type: "email",
        });
        data = fallback.data;
        error = fallback.error;
      }

      if (error) {
        const lower = error.message.toLowerCase();
        if (
          lower.includes("expired") ||
          lower.includes("invalid") ||
          lower.includes("not found")
        ) {
          const expiredMsg =
            "This verification code has expired or is invalid. If you requested a new code, please enter the newest code sent to your email.";
          setErrorMessage(expiredMsg);
          setToast({ type: "error", message: expiredMsg });
        } else {
          setErrorMessage(error.message);
          setToast({ type: "error", message: error.message });
        }
      } else if (data.session || data.user) {
        setStep("success");
        setToast({
          type: "success",
          message: "Verification successful! Opening your workspace...",
        });
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1000);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "OTP verification failed";
      setErrorMessage(msg);
      setToast({ type: "error", message: msg });
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP code: generates a new code and expires the previous code
  const handleResendOtp = async () => {
    if (countdown > 0) return;
    setIsLoading(true);
    setErrorMessage(null);
    setOtpCode(""); // Clear old expired code from input box

    try {
      const supabase = createClient();
      const redirectUrl = `${window.location.origin}/auth/callback?next=/dashboard`;

      // Calling resend generates a new token and automatically expires any older token
      let { error } = await supabase.auth.resend({
        type: "signup",
        email: email.trim(),
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      // Fallback to signInWithOtp if user row is already created
      if (
        error &&
        (error.message.toLowerCase().includes("type") ||
          error.message.toLowerCase().includes("not found"))
      ) {
        const fallback = await supabase.auth.signInWithOtp({
          email: email.trim(),
          options: {
            emailRedirectTo: redirectUrl,
            shouldCreateUser: false,
          },
        });
        error = fallback.error;
      }

      if (error) {
        const lower = error.message.toLowerCase();
        if (
          lower.includes("security purposes") ||
          lower.includes("rate limit") ||
          lower.includes("seconds")
        ) {
          setCountdown(60);
          const limitMsg =
            "Please wait for the timer to finish before requesting another code.";
          setErrorMessage(limitMsg);
          setToast({ type: "error", message: limitMsg });
        } else {
          setErrorMessage(error.message);
          setToast({ type: "error", message: error.message });
        }
      } else {
        setCountdown(60);
        setToast({
          type: "success",
          message: "New 6-digit code sent! Your previous code has now expired.",
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to resend code";
      setErrorMessage(msg);
      setToast({ type: "error", message: msg });
    } finally {
      setIsLoading(false);
    }
  };

  // OAuth Sign Up (Google & GitHub)
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
        setToast({ type: "error", message: error.message });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "OAuth connection failed";
      setErrorMessage(msg);
      setToast({ type: "error", message: msg });
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#0e0e11] text-[#f4f4f5] px-4 font-sans selection:bg-zinc-800 selection:text-white">
      {/* Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />

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
        <div className="w-full max-w-[400px]">
          {/* Logo */}
          <div className="mb-6">
            <Link
              href="/"
              className="inline-block hover:opacity-90 transition-opacity"
            >
              <HaberryDeskIcon className="w-7 h-7 text-white" />
            </Link>
          </div>

          {/* Heading */}
          <h1 className="text-2xl font-semibold text-white tracking-tight">
            Create your account
          </h1>
          <p className="text-sm text-zinc-400 mt-1 mb-6">
            {step === "otp"
              ? "Enter the 6-digit verification code sent to your email."
              : "Enter your details to set up your workspace."}
          </p>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-lg bg-red-950/60 border border-red-800/80 text-xs text-red-200 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1 leading-snug">{errorMessage}</div>
            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 1: Registration Form (Name, Email, Password, Confirm) */}
          {/* ========================================================= */}
          {step === "form" && (
            <div className="space-y-4">
              <form onSubmit={handleSignUp} className="space-y-3.5">
                {/* Full Name */}
                <div>
                  <label
                    htmlFor="name-input"
                    className="block text-xs font-medium text-zinc-300 mb-1.5"
                  >
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-zinc-500 absolute left-3 top-3 pointer-events-none" />
                    <input
                      id="name-input"
                      type="text"
                      required
                      placeholder="Alex Morgan"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-[#141417] border border-zinc-800 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email-signup-input"
                    className="block text-xs font-medium text-zinc-300 mb-1.5"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-3 pointer-events-none" />
                    <input
                      id="email-signup-input"
                      type="email"
                      required
                      placeholder="me@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-[#141417] border border-zinc-800 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="password-input"
                    className="block text-xs font-medium text-zinc-300 mb-1.5"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-3 pointer-events-none" />
                    <input
                      id="password-input"
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={6}
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-10 py-2.5 rounded-lg bg-[#141417] border border-zinc-800 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label
                    htmlFor="confirm-password-input"
                    className="block text-xs font-medium text-zinc-300 mb-1.5"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-3 pointer-events-none" />
                    <input
                      id="confirm-password-input"
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      minLength={6}
                      placeholder="Repeat your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-9 pr-10 py-2.5 rounded-lg bg-[#141417] border border-zinc-800 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-2.5 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                      title={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-2.5 px-4 rounded-lg bg-white hover:bg-zinc-200 disabled:opacity-50 text-zinc-950 font-semibold text-sm transition-colors cursor-pointer shadow-sm flex items-center justify-center gap-2"
                >
                  {isLoading && (
                    <Loader2 className="w-4 h-4 animate-spin text-zinc-950" />
                  )}
                  <span>Create Account</span>
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-5 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-800/80" />
                </div>
                <span className="relative bg-[#0e0e11] px-3 text-xs text-zinc-500">
                  or continue with
                </span>
              </div>

              {/* Social Buttons */}
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

              {/* Switch link */}
              <p className="text-xs text-zinc-400 text-center mt-6 pt-2">
                Already have an account?{" "}
                <Link
                  href="/auth/sign-in"
                  className="text-white underline font-medium hover:text-zinc-200 transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 2: Enter 6-digit OTP Code                           */}
          {/* ========================================================= */}
          {step === "otp" && (
            <div className="bg-[#141417] border border-zinc-800 rounded-xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
              <div className="text-center space-y-1">
                <div className="w-10 h-10 rounded-full bg-zinc-800 text-zinc-200 flex items-center justify-center mx-auto mb-2">
                  <KeyRound className="w-5 h-5 text-zinc-300" />
                </div>
                <h3 className="text-base font-semibold text-white">
                  Enter Verification Code
                </h3>
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
                    Enter the code sent to your email to activate your account
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || otpCode.length < 6}
                  className="w-full py-2.5 px-4 rounded-lg bg-white hover:bg-zinc-200 disabled:opacity-40 text-zinc-950 font-semibold text-sm transition-colors cursor-pointer shadow-sm flex items-center justify-center gap-2"
                >
                  {isLoading && (
                    <Loader2 className="w-4 h-4 animate-spin text-zinc-950" />
                  )}
                  <span>Verify and Activate Account</span>
                </button>
              </form>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-zinc-800/80">
                <button
                  type="button"
                  onClick={() => {
                    setStep("form");
                    setOtpCode("");
                    setErrorMessage(null);
                  }}
                  className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  Edit details
                </button>

                {countdown > 0 ? (
                  <span className="text-zinc-500 font-mono text-[11px]">
                    Resend code in {countdown}s
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isLoading}
                    className="text-zinc-300 hover:text-white underline font-medium transition-colors cursor-pointer"
                  >
                    Resend code
                  </button>
                )}
              </div>

              <p className="text-[10px] text-zinc-600 text-center">
                Requesting a new code automatically expires any previous code.
              </p>
            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 3: Success Screen                                   */}
          {/* ========================================================= */}
          {step === "success" && (
            <div className="bg-[#141417] border border-zinc-800 rounded-xl p-6 text-center space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="w-12 h-12 rounded-full bg-emerald-950/80 border border-emerald-700/60 text-emerald-400 flex items-center justify-center mx-auto">
                <Check className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-semibold text-white">
                  Account Verified Successfully!
                </h3>
                <p className="text-xs text-zinc-400">
                  Redirecting to your Haberry Desk workspace...
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
