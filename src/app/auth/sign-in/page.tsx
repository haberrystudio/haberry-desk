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
  ArrowLeft,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Check,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Toast, type ToastMessage } from "@/components/Toast";

export default function SignInPage() {
  const router = useRouter();

  // Form Fields (Email & Password only)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Status
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Check if already authenticated on mount
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setToast({
          type: "info",
          message: "You are already logged in. Redirecting to your dashboard...",
        });
        setTimeout(() => {
          router.replace("/dashboard");
        }, 800);
      }
    });
  }, [router]);

  // Sign In with Email & Password
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        const lowerMsg = error.message.toLowerCase();

        // Check if invalid credentials / no account exists
        if (
          lowerMsg.includes("invalid login credentials") ||
          lowerMsg.includes("user not found") ||
          lowerMsg.includes("no user")
        ) {
          const msg =
            "No account found with this email or incorrect password. Please sign up.";
          setErrorMessage(msg);
          setToast({
            type: "error",
            message: msg,
            actionText: "Sign up now",
            actionHref: "/auth/sign-up",
          });
        } else if (lowerMsg.includes("email not confirmed")) {
          const msg =
            "Your email has not been verified yet. Please check your inbox or sign up to get a new code.";
          setErrorMessage(msg);
          setToast({
            type: "error",
            message: msg,
            actionText: "Go to sign up",
            actionHref: "/auth/sign-up",
          });
        } else {
          setErrorMessage(error.message);
          setToast({ type: "error", message: error.message });
        }
      } else if (data.session || data.user) {
        setIsSuccess(true);
        setToast({
          type: "success",
          message: "Welcome back! Redirecting to your dashboard...",
        });
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 900);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Authentication failed";
      setErrorMessage(msg);
      setToast({ type: "error", message: msg });
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
        <div className="w-full max-w-[390px]">
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
            Sign in to Haberry Desk
          </h1>
          <p className="text-sm text-zinc-400 mt-1 mb-6">
            Enter your email and password to access your workspace.
          </p>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-lg bg-red-950/60 border border-red-800/80 text-xs text-red-200 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1 leading-snug">
                {errorMessage}
                {errorMessage.includes("sign up") && (
                  <div className="mt-1.5">
                    <Link
                      href="/auth/sign-up"
                      className="text-white underline font-semibold hover:text-zinc-200"
                    >
                      Click here to sign up &rarr;
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Success Banner */}
          {isSuccess && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-950/60 border border-emerald-800/80 text-xs text-emerald-200 flex items-center gap-2.5">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Signed in successfully! Redirecting...</span>
            </div>
          )}

          {/* Email & Password Form */}
          <div className="space-y-4">
            <form onSubmit={handleSignIn} className="space-y-4">
              {/* Email */}
              <div>
                <label
                  htmlFor="email-input"
                  className="block text-xs font-medium text-zinc-300 mb-1.5"
                >
                  Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-3 pointer-events-none" />
                  <input
                    id="email-input"
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
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="password-input"
                    className="block text-xs font-medium text-zinc-300"
                  >
                    Password
                  </label>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-3 pointer-events-none" />
                  <input
                    id="password-input"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
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

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading || isSuccess}
                className="w-full py-2.5 px-4 rounded-lg bg-white hover:bg-zinc-200 disabled:opacity-50 text-zinc-950 font-semibold text-sm transition-colors cursor-pointer shadow-sm flex items-center justify-center gap-2"
              >
                {isLoading && (
                  <Loader2 className="w-4 h-4 animate-spin text-zinc-950" />
                )}
                <span>Sign in</span>
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-800/80" />
              </div>
              <span className="relative bg-[#0e0e11] px-3 text-xs text-zinc-500">
                or continue with
              </span>
            </div>

            {/* Social Buttons (Google & GitHub) */}
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
