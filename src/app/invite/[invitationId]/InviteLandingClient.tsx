"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HaberryDeskIcon } from "@/components/HaberryDeskLogo";
import { createClient } from "@/lib/supabase/client";

export default function InviteLandingClient({
  params,
}: {
  params: Promise<{ invitationId: string }>;
}) {
  const router = useRouter();
  const unwrappedParams = React.use(params);
  const invitationId = unwrappedParams.invitationId;

  const [workspaceName, setWorkspaceName] = useState("Haberry");
  const [inviterName, setInviterName] = useState("Haberry Studio");
  const [invitedEmail, setInvitedEmail] = useState("mangadome007@gmail.com");
  const [expiresAt, setExpiresAt] = useState("Nov 2, 2026");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Check if user is already logged in
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        // User already has an account and is logged in -> route straight to accept decision
        router.push(`/invitations/accept/${invitationId}`);
        return;
      }

      // 2. Fetch invitation details
      // First check localStorage
      try {
        const stored = localStorage.getItem(`invitation_${invitationId}`);
        if (stored) {
          const inv = JSON.parse(stored);
          setWorkspaceName(inv.workspaceName || "Haberry");
          setInviterName(inv.inviterName || "Haberry Studio");
          setInvitedEmail(inv.email || "colleague@company.com");
          if (inv.expiresAt) {
            setExpiresAt(new Date(inv.expiresAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }));
          }
          setIsLoading(false);
          return;
        }
      } catch {}

      // Query Supabase
      supabase
        .from("workspace_invitations")
        .select("*")
        .eq("id", invitationId)
        .single()
        .then(({ data }) => {
          if (data) {
            setWorkspaceName(data.workspace_name || "Haberry");
            setInviterName(data.inviter_name || "Haberry Studio");
            setInvitedEmail(data.email);
            if (data.expires_at) {
              setExpiresAt(new Date(data.expires_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              }));
            }
          }
          setIsLoading(false);
        });
    });
  }, [invitationId, router]);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#0e0e11] text-[#f4f4f5] px-4 font-sans selection:bg-zinc-800 selection:text-white">
      <div className="pt-6 sm:pt-8 max-w-5xl mx-auto w-full" />

      {/* Main Card (Pixel-perfect matching screenshot 5) */}
      <div className="flex-1 flex flex-col items-center justify-center py-10">
        <div className="w-full max-w-[400px]">
          {/* Logo */}
          <div className="mb-6">
            <Link href="/" className="inline-block hover:opacity-90 transition-opacity">
              <HaberryDeskIcon className="w-7 h-7 text-white" />
            </Link>
          </div>

          {/* Heading */}
          <h1 className="text-2xl font-semibold text-white tracking-tight">
            Join {workspaceName}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 mb-6">
            {inviterName} invited you to this workspace on Haberry Desk.
          </p>

          {/* Invitation Card */}
          <div className="rounded-xl border border-zinc-800 bg-[#141417] divide-y divide-zinc-800/80 mb-6 text-xs">
            {/* Row 1: Invited by */}
            <div className="p-3.5 space-y-0.5">
              <span className="text-[11px] text-zinc-500 block">Invited by</span>
              <span className="text-xs font-medium text-white">{inviterName}</span>
            </div>

            {/* Row 2: Sent to */}
            <div className="p-3.5 space-y-0.5">
              <span className="text-[11px] text-zinc-500 block">Sent to</span>
              <span className="text-xs font-medium text-white">{invitedEmail}</span>
            </div>

            {/* Row 3: Expires */}
            <div className="p-3.5 space-y-0.5">
              <span className="text-[11px] text-zinc-500 block">Expires</span>
              <span className="text-xs font-medium text-white">{expiresAt}</span>
            </div>
          </div>

          {/* Create Account Action */}
          <Link
            href={`/auth/sign-up?invite=${invitationId}&email=${encodeURIComponent(invitedEmail)}`}
            className="w-full py-2.5 px-4 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-sm transition-colors cursor-pointer shadow-sm flex items-center justify-center"
          >
            Create account
          </Link>

          {/* Already have an account */}
          <p className="text-xs text-zinc-400 text-center mt-5">
            Already have an account?{" "}
            <Link
              href={`/auth/sign-in?invite=${invitationId}`}
              className="text-white underline font-medium hover:text-zinc-200 transition-colors"
            >
              Sign In
            </Link>
          </p>
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

