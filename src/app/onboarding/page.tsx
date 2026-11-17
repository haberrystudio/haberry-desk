"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  HaberryDeskIcon,
} from "@/components/HaberryDeskLogo";
import {
  Inbox,
  CheckCircle2,
  Users,
  LayoutGrid,
  Plus,
  X,
  Check,
  Sparkles,
  ArrowRight,
  Loader2,
  Circle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

// Helper to create clean workspace slug
function generateWorkspaceId(name: string): string {
  const clean = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const suffix = Math.random().toString(36).substring(2, 6);
  return `${clean || "workspace"}-${suffix}`;
}

// Helper to derive task prefix initials from project name
function deriveTaskPrefix(projectName: string): string {
  const words = projectName.trim().split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return words
      .slice(0, 3)
      .map((w) => w[0].toUpperCase())
      .join("");
  }
  if (words.length === 1 && words[0].length >= 3) {
    return words[0].substring(0, 3).toUpperCase();
  }
  return "HAB";
}

export default function OnboardingPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // Onboarding Step State
  // 1: Name workspace
  // 2: Who's it for (Team vs Just me)
  // 3: Start your first project
  // 4: Bring your team (ONLY if audience === 'team')
  // 5 (or 4 for solo): Completely Free & Workspace Ready
  const [step, setStep] = useState<number>(1);

  // Form State
  const [workspaceName, setWorkspaceName] = useState("Your workspace");
  const [audience, setAudience] = useState<"team" | "solo">("team");
  const [projectName, setProjectName] = useState("My first project");
  const [teammateEmails, setTeammateEmails] = useState<string[]>([
    "",
    "",
    "",
  ]);

  const [isFinishing, setIsFinishing] = useState(false);

  // Total steps: 5 if team, 4 if solo
  const totalSteps = audience === "team" ? 5 : 4;

  // Current visual step number
  // If solo and on step 4 (final), visual step is 4/4
  // If team and on step 4, visual step is 4/5; step 5 is 5/5
  const visualStep = step > 3 && audience === "solo" ? 4 : step;

  // Check auth on mount
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user }, error }) => {
      if (error || !user) {
        router.replace("/auth/sign-in");
      } else {
        setUser(user);
        // Default workspace name based on user's name or email
        const userFullName =
          user.user_metadata?.full_name ||
          user.email?.split("@")[0] ||
          "Airdrop";
        const capitalized =
          userFullName.charAt(0).toUpperCase() + userFullName.slice(1);
        setWorkspaceName(`${capitalized}`);
        setIsLoadingAuth(false);
      }
    });
  }, [router]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/auth/sign-in");
  };

  // Add / remove teammate email input
  const handleAddTeammate = () => {
    setTeammateEmails((prev) => [...prev, ""]);
  };

  const handleRemoveTeammate = (index: number) => {
    setTeammateEmails((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateTeammate = (index: number, value: string) => {
    setTeammateEmails((prev) => {
      const copy = [...prev];
      copy[index] = value;
      return copy;
    });
  };

  // Next step handler
  const handleContinue = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (step === 1) {
      if (!workspaceName.trim()) return;
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      if (!projectName.trim()) return;
      if (audience === "solo") {
        // Skip team invite -> go straight to step 4 (Ready/Free)
        setStep(4);
      } else {
        // Team -> go to step 4 (Bring your team)
        setStep(4);
      }
    } else if (step === 4) {
      if (audience === "team") {
        // Move to step 5 (Ready/Free)
        setStep(5);
      } else {
        // Finish
        handleFinishOnboarding();
      }
    } else if (step === 5) {
      handleFinishOnboarding();
    }
  };

  // Complete Onboarding & Save Workspace
  const handleFinishOnboarding = async () => {
    setIsFinishing(true);
    const workspaceId = generateWorkspaceId(workspaceName);
    const taskPrefix = deriveTaskPrefix(projectName);

    // Workspace payload
    const workspaceData = {
      id: workspaceId,
      name: workspaceName.trim() || "Haberry Workspace",
      audience,
      projectName: projectName.trim() || "My first project",
      taskPrefix,
      teammates: teammateEmails.filter((e) => e.trim().length > 0),
      plan: "free",
      createdAt: new Date().toISOString(),
    };

    // Store in localStorage for instant retrieval
    try {
      localStorage.setItem("haberry_active_workspace", JSON.stringify(workspaceData));
      const allWs = JSON.parse(localStorage.getItem("haberry_all_workspaces") || "[]");
      allWs.push(workspaceData);
      localStorage.setItem("haberry_all_workspaces", JSON.stringify(allWs));
    } catch {}

    // Persist to Supabase workspaces table if table exists
    try {
      const supabase = createClient();
      await supabase.from("workspaces").insert({
        id: workspaceId,
        name: workspaceData.name,
        plan: "free",
        members_type: audience,
        owner_id: user?.id,
      });
    } catch {
      // Pass through safely if table not migrated yet
    }

    // Redirect directly to: siteurl/dashboard/workspace/<workspaceid>
    setTimeout(() => {
      window.location.href = `/dashboard/workspace/${workspaceId}`;
    }, 600);
  };

  const taskPrefix = deriveTaskPrefix(projectName);
  const userInitial = (workspaceName[0] || "H").toUpperCase();

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-[#0c0d0e] flex flex-col items-center justify-center text-zinc-400 gap-3 font-sans">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-200" />
        <span className="text-xs">Preparing onboarding...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0c0d0e] text-[#f4f4f5] flex font-sans selection:bg-zinc-800 selection:text-white">
      {/* ========================================================= */}
      {/* LEFT HALF: Form & Step Content                            */}
      {/* ========================================================= */}
      <div className="w-full lg:w-[480px] xl:w-[520px] flex flex-col justify-between p-6 sm:p-12 shrink-0 border-r border-zinc-800/80 bg-[#0e0e11]">
        {/* Top Header Row */}
        <div>
          <div className="flex items-center justify-between">
            <HaberryDeskIcon className="w-7 h-7 text-white" />

            {/* Segmented Step Indicator */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-zinc-400">
                {visualStep} / {totalSteps}
              </span>
              <div className="flex items-center gap-1.5">
                {Array.from({ length: totalSteps }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 rounded-full transition-all duration-300 ${
                      i + 1 <= visualStep
                        ? "w-5 bg-white"
                        : "w-4 bg-zinc-800"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Middle: Step Forms */}
        <div className="my-10">
          {/* ========================================================= */}
          {/* STEP 1: Name your workspace                               */}
          {/* ========================================================= */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-150">
              <div className="space-y-1">
                <p className="text-xs text-zinc-400">
                  Welcome,{" "}
                  {user?.user_metadata?.full_name ||
                    user?.email?.split("@")[0] ||
                    "there"}
                </p>
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  Name your workspace
                </h1>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed pt-1">
                  This is where your projects live. Use your team or company
                  name, you can change it later.
                </p>
              </div>

              <form onSubmit={handleContinue} className="space-y-6">
                <div>
                  <label
                    htmlFor="workspace-name-input"
                    className="block text-xs font-medium text-zinc-300 mb-2"
                  >
                    Workspace name
                  </label>
                  <input
                    id="workspace-name-input"
                    type="text"
                    required
                    autoFocus
                    placeholder="e.g. Acme Inc, My Team"
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#141417] border border-zinc-800 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!workspaceName.trim()}
                  className="py-2.5 px-6 rounded-lg bg-white hover:bg-zinc-200 disabled:opacity-50 text-zinc-950 font-semibold text-xs transition-colors cursor-pointer shadow-sm"
                >
                  Continue
                </button>
              </form>
            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 2: Who's it for?                                     */}
          {/* ========================================================= */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-150">
              <div className="space-y-1">
                <p className="text-xs text-zinc-400">
                  Setting up {workspaceName}
                </p>
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  Who&apos;s it for?
                </h1>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed pt-1">
                  We&apos;ll set {workspaceName} up to match. You can always
                  invite people later.
                </p>
              </div>

              <div className="space-y-3">
                {/* Option 1: My team */}
                <div
                  onClick={() => setAudience("team")}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    audience === "team"
                      ? "border-zinc-500 bg-[#17181c]"
                      : "border-zinc-800 bg-[#121316] hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    {/* Team Avatar Stack */}
                    <div className="flex items-center -space-x-1.5 shrink-0">
                      <div className="w-6 h-6 rounded-full bg-white text-zinc-950 font-bold text-[10px] flex items-center justify-center border border-[#17181c]">
                        {userInitial}
                      </div>
                      <div className="w-6 h-6 rounded-full bg-zinc-700 text-zinc-400 flex items-center justify-center border border-[#17181c] text-[10px]">
                        •
                      </div>
                      <div className="w-6 h-6 rounded-full bg-zinc-800 text-zinc-500 flex items-center justify-center border border-[#17181c] text-[10px]">
                        •
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-white">
                        My team
                      </h4>
                      <p className="text-xs text-zinc-400">
                        Plan and ship work together
                      </p>
                    </div>
                  </div>

                  {/* Radio indicator */}
                  <div className="w-4 h-4 rounded-full border border-zinc-500 flex items-center justify-center">
                    {audience === "team" && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                </div>

                {/* Option 2: Just me */}
                <div
                  onClick={() => setAudience("solo")}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    audience === "solo"
                      ? "border-zinc-500 bg-[#17181c]"
                      : "border-zinc-800 bg-[#121316] hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    {/* Solo Avatar */}
                    <div className="w-6 h-6 rounded-full bg-white text-zinc-950 font-bold text-[10px] flex items-center justify-center">
                      {userInitial}
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-white">
                        Just me
                      </h4>
                      <p className="text-xs text-zinc-400">
                        Keep track of your own work
                      </p>
                    </div>
                  </div>

                  {/* Radio indicator */}
                  <div className="w-4 h-4 rounded-full border border-zinc-500 flex items-center justify-center">
                    {audience === "solo" && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleContinue()}
                className="py-2.5 px-6 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs transition-colors cursor-pointer shadow-sm"
              >
                Continue
              </button>
            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 3: Start your first project                          */}
          {/* ========================================================= */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-150">
              <div className="space-y-1">
                <p className="text-xs text-zinc-400">
                  Setting up {workspaceName}
                </p>
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  Start your first project
                </h1>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed pt-1">
                  We&apos;ll add a few starter tasks to show you around. Rename
                  or delete them anytime.
                </p>
              </div>

              <form onSubmit={handleContinue} className="space-y-4">
                <div>
                  <label
                    htmlFor="project-name-input"
                    className="block text-xs font-medium text-zinc-300 mb-2"
                  >
                    Project name
                  </label>
                  <input
                    id="project-name-input"
                    type="text"
                    required
                    autoFocus
                    placeholder="e.g. My first project"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#141417] border border-zinc-800 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-colors"
                  />
                  <p className="text-xs text-zinc-500 mt-2 flex items-center gap-1.5 font-mono">
                    <span>Tasks will be numbered</span>
                    <span className="bg-zinc-800 px-1.5 py-0.5 rounded text-[11px] text-zinc-300">
                      {taskPrefix}-1
                    </span>
                    <span className="bg-zinc-800 px-1.5 py-0.5 rounded text-[11px] text-zinc-300">
                      {taskPrefix}-2
                    </span>
                    <span>...</span>
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={!projectName.trim()}
                    className="py-2.5 px-6 rounded-lg bg-white hover:bg-zinc-200 disabled:opacity-50 text-zinc-950 font-semibold text-xs transition-colors cursor-pointer shadow-sm"
                  >
                    Continue
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 4 (Team Only): Bring your team                       */}
          {/* ========================================================= */}
          {step === 4 && audience === "team" && (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-150">
              <div className="space-y-1">
                <p className="text-xs text-zinc-400">
                  Setting up {workspaceName}
                </p>
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  Bring your team
                </h1>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed pt-1">
                  They&apos;ll get an email to join {workspaceName}. Skip this if
                  you&apos;d rather look around first.
                </p>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-medium text-zinc-300">
                  Teammate emails
                </label>

                {teammateEmails.map((email, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="email"
                      placeholder="teammate@company.com"
                      value={email}
                      onChange={(e) =>
                        handleUpdateTeammate(index, e.target.value)
                      }
                      className="w-full px-3.5 py-2 rounded-lg bg-[#141417] border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-colors"
                    />
                    {teammateEmails.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveTeammate(index)}
                        className="text-zinc-500 hover:text-zinc-300 p-1 rounded cursor-pointer"
                        title="Remove email"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={handleAddTeammate}
                  className="text-xs text-zinc-400 hover:text-white font-medium flex items-center gap-1.5 pt-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add another</span>
                </button>
              </div>

              <div className="flex items-center gap-4 pt-3">
                <button
                  type="button"
                  onClick={() => handleContinue()}
                  className="py-2.5 px-6 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs transition-colors cursor-pointer shadow-sm"
                >
                  Send invites
                </button>

                <button
                  type="button"
                  onClick={() => handleContinue()}
                  className="text-xs text-zinc-400 hover:text-white font-medium cursor-pointer"
                >
                  Skip for now
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* FINAL STEP: Completely Free & Workspace Ready             */}
          {/* (Step 5 for Team, Step 4 for Solo)                        */}
          {/* ========================================================= */}
          {((step === 4 && audience === "solo") || step === 5) && (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-150">
              <div className="space-y-1">
                <p className="text-xs text-zinc-400">
                  Setting up {workspaceName}
                </p>
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  How do you want to start?
                </h1>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed pt-1">
                  Haberry Desk is 100% free and open. Every feature, project,
                  and team collaboration tool is unlocked with zero subscription
                  or paywalls.
                </p>
              </div>

              {/* Free Plan Showcase Card (Matches user instruction: completely free) */}
              <div className="rounded-xl border border-zinc-700 bg-[#16171a] p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-white">
                        Community & Team
                      </h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950 border border-emerald-800 text-emerald-300">
                        Free Forever
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400">
                      Unlimited members, projects, tasks, and boards
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xl font-bold text-white">$0</span>
                    <span className="text-xs text-zinc-500 block">
                      per month
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-800 space-y-2 text-xs text-zinc-300">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Unlimited tasks, subtasks, and Kanban boards</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Multi-member real-time collaboration</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Full GitHub integration & webhook transitions</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  disabled={isFinishing}
                  onClick={handleFinishOnboarding}
                  className="w-full py-3 px-6 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-sm transition-colors cursor-pointer shadow-sm flex items-center justify-center gap-2"
                >
                  {isFinishing && (
                    <Loader2 className="w-4 h-4 animate-spin text-zinc-950" />
                  )}
                  <span>Launch Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <p className="text-[11px] text-zinc-500 text-center mt-2">
                  No credit card required. Free forever.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Bottom User Info Row */}
        <div className="pt-4 border-t border-zinc-800/80 text-xs text-zinc-500 flex items-center justify-between">
          <div className="truncate">
            Signed in as{" "}
            <span className="text-zinc-300 font-medium">
              {user?.email || "user@example.com"}
            </span>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            className="hover:text-white underline cursor-pointer shrink-0 ml-3"
          >
            Sign out
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* RIGHT HALF: Live Mockup / Interactive Preview             */}
      {/* ========================================================= */}
      <div className="flex-1 hidden lg:flex flex-col bg-[#090a0c] p-8 xl:p-12 overflow-hidden">
        {/* Live Preview Header */}
        <div className="flex items-center gap-2 text-xs font-mono tracking-wider text-emerald-400 mb-4 select-none">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>LIVE PREVIEW OF {workspaceName.toUpperCase()}</span>
        </div>

        {/* Browser Mockup Window */}
        <div className="flex-1 rounded-2xl border border-zinc-800/90 bg-[#0f1013] overflow-hidden flex shadow-2xl min-h-[580px]">
          {/* Mockup Sidebar */}
          <div className="w-56 bg-[#111215] border-r border-zinc-800/80 p-3.5 flex flex-col justify-between shrink-0 select-none">
            <div className="space-y-4">
              {/* Workspace Pill */}
              <div className="px-3 py-2 rounded-lg bg-[#18191d] border border-zinc-700/80 flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-white text-zinc-950 font-bold text-xs flex items-center justify-center shrink-0">
                  {userInitial}
                </div>
                <span className="text-xs font-semibold text-white truncate">
                  {workspaceName || "Your workspace"}
                </span>
              </div>

              {/* Navigation Items */}
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-zinc-400">
                  <Inbox className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Inbox</span>
                </div>

                <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-zinc-400">
                  <CheckCircle2 className="w-3.5 h-3.5 text-zinc-500" />
                  <span>My tasks</span>
                </div>

                <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-zinc-400">
                  <div className="flex items-center gap-2.5">
                    <Users className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Members</span>
                  </div>

                  {/* Team Avatars Indicator if audience is team */}
                  {audience === "team" && (
                    <div className="flex items-center -space-x-1">
                      <div className="w-4 h-4 rounded-full bg-white text-zinc-950 font-bold text-[8px] flex items-center justify-center border border-zinc-900">
                        {userInitial}
                      </div>
                      <div className="w-4 h-4 rounded-full bg-zinc-600 text-[6px] text-zinc-200 flex items-center justify-center border border-zinc-900">
                        •
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Projects Section */}
              <div className="pt-2">
                <span className="text-[11px] text-zinc-500 font-medium px-2.5">
                  Projects
                </span>

                <div className="mt-1">
                  {step <= 2 ? (
                    <div className="h-6 w-32 bg-zinc-800/40 rounded mx-2.5 animate-pulse" />
                  ) : (
                    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#18191d] border border-zinc-700/80 text-xs text-white">
                      <LayoutGrid className="w-3.5 h-3.5 text-zinc-400" />
                      <span className="truncate">{projectName}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="text-[10px] text-zinc-600 font-mono px-2">
              Haberry Desk v1.0
            </div>
          </div>

          {/* Mockup Main Canvas */}
          <div className="flex-1 bg-[#131417] flex flex-col min-w-0 select-none">
            {/* Top Mockup Header */}
            <div className="h-10 border-b border-zinc-800/80 px-4 flex items-center gap-2 text-xs text-zinc-400">
              <span className="text-zinc-500">{workspaceName}</span>
              {step >= 3 && (
                <>
                  <span className="text-zinc-600">/</span>
                  <span className="text-zinc-200 font-medium">
                    {projectName}
                  </span>
                </>
              )}
            </div>

            {/* Mockup Kanban Board */}
            <div className="flex-1 p-4 overflow-y-auto">
              {step <= 2 ? (
                // Skeleton preview
                <div className="grid grid-cols-3 gap-3 h-full">
                  <div className="bg-[#17181c]/60 border border-zinc-800/60 rounded-xl p-3 space-y-3">
                    <div className="h-4 w-20 bg-zinc-800/60 rounded" />
                    <div className="h-20 bg-zinc-800/40 rounded-lg" />
                    <div className="h-20 bg-zinc-800/40 rounded-lg" />
                  </div>
                  <div className="bg-[#17181c]/60 border border-zinc-800/60 rounded-xl p-3 space-y-3">
                    <div className="h-4 w-20 bg-zinc-800/60 rounded" />
                  </div>
                  <div className="bg-[#17181c]/60 border border-zinc-800/60 rounded-xl p-3 space-y-3">
                    <div className="h-4 w-20 bg-zinc-800/60 rounded" />
                  </div>
                </div>
              ) : (
                // Active Interactive Kanban Preview
                <div className="grid grid-cols-3 gap-3 h-full items-start">
                  {/* Column 1: To Do */}
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300 px-1">
                      <Circle className="w-3.5 h-3.5 text-zinc-500" />
                      <span>To Do</span>
                      <span className="text-[11px] text-zinc-500 font-normal">
                        5
                      </span>
                    </div>

                    <div className="space-y-2">
                      {/* Card 1 */}
                      <div className="p-3 rounded-lg bg-[#18191d] border border-zinc-800/80 space-y-1 hover:border-zinc-700 transition-colors">
                        <span className="text-[10px] font-mono text-zinc-500 block">
                          {taskPrefix}-1
                        </span>
                        <p className="text-xs text-white font-medium">
                          Drag this card to the next column
                        </p>
                        <span className="text-[10px] text-zinc-500 block">
                          — No priority
                        </span>
                      </div>

                      {/* Card 2 */}
                      <div className="p-3 rounded-lg bg-[#18191d] border border-zinc-800/80 space-y-1 hover:border-zinc-700 transition-colors">
                        <span className="text-[10px] font-mono text-zinc-500 block">
                          {taskPrefix}-2
                        </span>
                        <p className="text-xs text-white font-medium">
                          Open this task and add a subtask
                        </p>
                        <span className="text-[10px] text-zinc-500 block">
                          — No priority
                        </span>
                      </div>

                      {/* Card 3 */}
                      <div className="p-3 rounded-lg bg-[#18191d] border border-zinc-800/80 space-y-1 hover:border-zinc-700 transition-colors">
                        <span className="text-[10px] font-mono text-zinc-500 block">
                          {taskPrefix}-3
                        </span>
                        <p className="text-xs text-white font-medium">
                          Invite your team
                        </p>
                        <span className="text-[10px] text-zinc-500 block">
                          — No priority
                        </span>
                      </div>

                      {/* Card 4 */}
                      <div className="p-3 rounded-lg bg-[#18191d] border border-zinc-800/80 space-y-1 hover:border-zinc-700 transition-colors">
                        <span className="text-[10px] font-mono text-zinc-500 block">
                          {taskPrefix}-4
                        </span>
                        <p className="text-xs text-white font-medium">
                          Connect GitHub, GitLab or Gitea
                        </p>
                        <span className="text-[10px] text-zinc-500 block">
                          — No priority
                        </span>
                      </div>

                      {/* Card 5 */}
                      <div className="p-3 rounded-lg bg-[#18191d] border border-zinc-800/80 space-y-1 hover:border-zinc-700 transition-colors">
                        <span className="text-[10px] font-mono text-zinc-500 block">
                          {taskPrefix}-5
                        </span>
                        <p className="text-xs text-white font-medium">
                          Create your own task
                        </p>
                        <span className="text-[10px] text-zinc-500 block">
                          — No priority
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Column 2: In Progress */}
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300 px-1">
                      <div className="w-3.5 h-3.5 rounded-full border border-amber-500/80 border-t-amber-400" />
                      <span>In Progress</span>
                      <span className="text-[11px] text-zinc-500 font-normal">
                        0
                      </span>
                    </div>

                    <div className="border border-dashed border-zinc-800/80 rounded-lg p-6 text-center text-xs text-zinc-600">
                      Empty
                    </div>
                  </div>

                  {/* Column 3: Done */}
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300 px-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Done</span>
                      <span className="text-[11px] text-zinc-500 font-normal">
                        0
                      </span>
                    </div>

                    <div className="border border-dashed border-zinc-800/80 rounded-lg p-6 text-center text-xs text-zinc-600">
                      Empty
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

