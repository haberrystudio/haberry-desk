"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HaberryDeskIcon } from "@/components/HaberryDeskLogo";
import { Users, Check, ArrowRight, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export default function InviteAcceptClient({
  params,
}: {
  params: Promise<{ invitationId: string }>;
}) {
  const router = useRouter();
  const unwrappedParams = React.use(params);
  const invitationId = unwrappedParams.invitationId;

  const [user, setUser] = useState<User | null>(null);
  const [workspaceId, setWorkspaceId] = useState("haberry-desk");
  const [workspaceName, setWorkspaceName] = useState("Haberry");
  const [inviterName, setInviterName] = useState("Haberry Studio");
  const [role, setRole] = useState("member");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user }, error }) => {
      if (error || !user) {
        // Not logged in -> redirect to sign-in preserving invitation context
        router.replace(`/auth/sign-in?invite=${invitationId}`);
        return;
      }
      setUser(user);

      // Fetch invitation data from localStorage or Supabase
      try {
        const stored = localStorage.getItem(`invitation_${invitationId}`);
        if (stored) {
          const inv = JSON.parse(stored);
          setWorkspaceId(inv.workspaceId || "haberry-desk");
          setWorkspaceName(inv.workspaceName || "Haberry");
          setInviterName(inv.inviterName || "Haberry Studio");
          setRole(inv.role || "member");
          setIsLoading(false);
          return;
        }
      } catch {}

      supabase
        .from("workspace_invitations")
        .select("*")
        .eq("id", invitationId)
        .single()
        .then(({ data }) => {
          if (data) {
            setWorkspaceId(data.workspace_id || "haberry-desk");
            setWorkspaceName(data.workspace_name || "Haberry");
            setInviterName(data.inviter_name || "Haberry Studio");
            setRole(data.role || "member");
          }
          setIsLoading(false);
        });
    });
  }, [invitationId, router]);

  // Option 1: Join Workspace
  const handleJoinWorkspace = async () => {
    setIsProcessing(true);

    const memberData = {
      workspaceId,
      workspaceName,
      userId: user?.id,
      email: user?.email,
      role: role || "member",
      joinedAt: new Date().toISOString(),
    };

    // Save membership and set as active workspace
    try {
      localStorage.setItem(
        "haberry_active_workspace",
        JSON.stringify({
          id: workspaceId,
          name: workspaceName,
          role: role || "member",
          projectName: "Haberry-Desk",
          taskPrefix: "HAB",
        })
      );
      const existingMembers = JSON.parse(
        localStorage.getItem(`members_${workspaceId}`) || "[]"
      );
      existingMembers.push(memberData);
      localStorage.setItem(`members_${workspaceId}`, JSON.stringify(existingMembers));
    } catch {}

    // Also persist to Supabase if table exists
    try {
      const supabase = createClient();
      await supabase.from("workspace_members").insert({
        workspace_id: workspaceId,
        user_id: user?.id,
        email: user?.email,
        name: user?.user_metadata?.full_name || user?.email?.split("@")[0],
        role: role || "member",
      });

      // Mark invitation accepted
      await supabase
        .from("workspace_invitations")
        .update({ status: "accepted" })
        .eq("id", invitationId);
    } catch {}

    // Redirect to dashboard/workspace/<workspaceid>
    setTimeout(() => {
      window.location.href = `/dashboard/workspace/${workspaceId}`;
    }, 600);
  };

  // Option 2: Not now -> redirect to invitations hub
  const handleNotNow = () => {
    router.push(`/invitations?pending=${invitationId}`);
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

      {/* Main Accept Decision Card */}
      <div className="flex-1 flex flex-col items-center justify-center py-10">
        <div className="w-full max-w-[420px] bg-[#141417] border border-zinc-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between">
            <Link href="/" className="inline-block hover:opacity-90">
              <HaberryDeskIcon className="w-7 h-7 text-white" />
            </Link>
            <div className="w-8 h-8 rounded-full bg-zinc-800 text-zinc-300 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>

          <div className="space-y-1.5">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Join {workspaceName}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              <strong className="text-white">{inviterName}</strong> invited you to collaborate in their workspace with the role of{" "}
              <span className="font-semibold text-zinc-200 uppercase text-[11px] bg-zinc-800 px-1.5 py-0.5 rounded">
                {role}
              </span>.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-800/80 bg-[#0e0e11] p-4 text-xs space-y-2 text-zinc-400">
            <div className="flex items-center gap-2 text-zinc-200">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Full access to workspace tasks, boards, and projects</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-200">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Collaborate in real-time with team members</span>
            </div>
          </div>

          {/* Action Buttons: Join Workspace or Not Now */}
          <div className="space-y-3 pt-2">
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleJoinWorkspace}
              className="w-full py-3 px-4 rounded-xl bg-white hover:bg-zinc-200 disabled:opacity-50 text-zinc-950 font-semibold text-sm transition-colors cursor-pointer shadow-sm flex items-center justify-center gap-2"
            >
              {isProcessing && <Loader2 className="w-4 h-4 animate-spin text-zinc-950" />}
              <span>Join Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleNotNow}
              className="w-full py-2.5 px-4 rounded-xl border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white font-medium text-xs transition-colors cursor-pointer"
            >
              Not now
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

