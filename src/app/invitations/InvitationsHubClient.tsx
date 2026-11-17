"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { HaberryDeskIcon } from "@/components/HaberryDeskLogo";
import { Users, Check, X, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

interface PendingInvitation {
  id: string;
  workspaceId: string;
  workspaceName: string;
  inviterName: string;
  role: string;
  date: string;
}

export default function InvitationsHubClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pendingId = searchParams.get("pending");

  const [user, setUser] = useState<User | null>(null);
  const [invitations, setInvitations] = useState<PendingInvitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingId, setIsProcessingId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user }, error }) => {
      if (error || !user) {
        router.replace("/auth/sign-in");
        return;
      }
      setUser(user);

      const items: PendingInvitation[] = [];

      // Check for pendingId
      if (pendingId) {
        try {
          const stored = localStorage.getItem(`invitation_${pendingId}`);
          if (stored) {
            const inv = JSON.parse(stored);
            items.push({
              id: pendingId,
              workspaceId: inv.workspaceId || "haberry-desk",
              workspaceName: inv.workspaceName || "Haberry",
              inviterName: inv.inviterName || "Haberry Studio",
              role: inv.role || "member",
              date: "Just now",
            });
          } else {
            items.push({
              id: pendingId,
              workspaceId: "haberry-desk",
              workspaceName: "Haberry",
              inviterName: "Haberry Studio",
              role: "member",
              date: "Recently",
            });
          }
        } catch {}
      }

      // Query Supabase invitations for user's email
      if (user.email) {
        supabase
          .from("workspace_invitations")
          .select("*")
          .eq("email", user.email)
          .eq("status", "pending")
          .then(({ data }) => {
            if (data && data.length > 0) {
              data.forEach((inv) => {
                if (!items.find((i) => i.id === inv.id)) {
                  items.push({
                    id: inv.id,
                    workspaceId: inv.workspace_id,
                    workspaceName: inv.workspace_name,
                    inviterName: inv.inviter_name,
                    role: inv.role,
                    date: "Pending",
                  });
                }
              });
            }
            // Fallback default invitation if empty
            if (items.length === 0) {
              items.push({
                id: "inv-demo",
                workspaceId: "haberry-desk",
                workspaceName: "Haberry",
                inviterName: "Haberry Studio",
                role: "member",
                date: "Pending review",
              });
            }
            setInvitations(items);
            setIsLoading(false);
          });
      } else {
        setInvitations(items);
        setIsLoading(false);
      }
    });
  }, [pendingId, router]);

  // Action 1: Accept
  const handleAccept = async (inv: PendingInvitation) => {
    setIsProcessingId(inv.id);

    try {
      localStorage.setItem(
        "haberry_active_workspace",
        JSON.stringify({
          id: inv.workspaceId,
          name: inv.workspaceName,
          role: inv.role,
          projectName: "Haberry-Desk",
          taskPrefix: "HAB",
        })
      );
    } catch {}

    try {
      const supabase = createClient();
      await supabase.from("workspace_members").insert({
        workspace_id: inv.workspaceId,
        user_id: user?.id,
        email: user?.email,
        name: user?.user_metadata?.full_name || user?.email?.split("@")[0],
        role: inv.role || "member",
      });
      await supabase
        .from("workspace_invitations")
        .update({ status: "accepted" })
        .eq("id", inv.id);
    } catch {}

    setTimeout(() => {
      window.location.href = `/dashboard/workspace/${inv.workspaceId}`;
    }, 600);
  };

  // Action 2: Decline -> goes to normal onboarding
  const handleDecline = async (inv: PendingInvitation) => {
    try {
      const supabase = createClient();
      await supabase
        .from("workspace_invitations")
        .update({ status: "declined" })
        .eq("id", inv.id);
    } catch {}

    router.push("/onboarding");
  };

  // Action 3: Skip for now -> goes to normal onboarding
  const handleSkipForNow = () => {
    router.push("/onboarding");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0e0e11] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#0e0e11] text-[#f4f4f5] px-4 font-sans selection:bg-zinc-800 selection:text-white">
      <div className="pt-6 sm:pt-8 max-w-5xl mx-auto w-full" />

      {/* Main Hub Card */}
      <div className="flex-1 flex flex-col items-center justify-center py-10">
        <div className="w-full max-w-[500px] bg-[#141417] border border-zinc-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between">
            <Link href="/" className="inline-block hover:opacity-90">
              <HaberryDeskIcon className="w-7 h-7 text-white" />
            </Link>
            <span className="text-xs text-zinc-400 font-mono">
              Invitations Hub
            </span>
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Workspace Invitations
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400">
              Review and manage pending invitations to collaborate in other workspaces.
            </p>
          </div>

          {/* Invitations List */}
          <div className="space-y-3">
            {invitations.map((inv) => (
              <div
                key={inv.id}
                className="rounded-xl border border-zinc-800 bg-[#0e0e11] p-4 space-y-3.5 hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 text-zinc-200 font-bold text-xs flex items-center justify-center">
                      {inv.workspaceName[0]?.toUpperCase() || "H"}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">
                        {inv.workspaceName}
                      </h4>
                      <p className="text-xs text-zinc-400">
                        Invited by <strong className="text-zinc-200">{inv.inviterName}</strong>
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] font-semibold uppercase bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded">
                    {inv.role}
                  </span>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-1 border-t border-zinc-800/80">
                  <button
                    type="button"
                    onClick={() => handleDecline(inv)}
                    className="px-3 py-1.5 rounded-lg border border-zinc-800 hover:bg-zinc-800 text-xs text-zinc-400 hover:text-red-400 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Decline</span>
                  </button>

                  <button
                    type="button"
                    disabled={isProcessingId === inv.id}
                    onClick={() => handleAccept(inv)}
                    className="px-4 py-1.5 rounded-lg bg-white hover:bg-zinc-200 disabled:opacity-50 text-zinc-950 font-semibold text-xs transition-colors cursor-pointer shadow-sm flex items-center gap-1.5"
                  >
                    {isProcessingId === inv.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-950" />
                    ) : (
                      <Check className="w-3.5 h-3.5" />
                    )}
                    <span>Accept & Join</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Skip For Now Action */}
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={handleSkipForNow}
              className="text-xs text-zinc-400 hover:text-white font-medium underline transition-colors cursor-pointer"
            >
              Skip for now & create your own workspace &rarr;
            </button>
          </div>
        </div>
      </div>

      <footer className="py-6 flex items-center justify-center gap-6 text-xs text-zinc-500">
        <span>Haberry Desk</span>
      </footer>
    </div>
  );
}

