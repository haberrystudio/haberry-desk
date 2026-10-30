"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Home,
  Inbox,
  CheckCircle2,
  Users,
  LayoutGrid,
  ChevronDown,
  Plus,
  Search,
  UserPlus,
  Settings,
  PanelLeft,
  Moon,
  Sun,
  Sparkles,
  X,
  LogOut,
  Circle,
  Check,
  Calendar,
  Clock,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

// Custom Haberry Avatar with exact gradient seen in the screenshot
export function HaberryAvatar({
  className = "w-6 h-6",
  text = "haberry",
}: {
  className?: string;
  text?: string;
}) {
  return (
    <div
      className={`rounded-full flex items-center justify-center shrink-0 font-bold tracking-tighter text-white select-none ${className}`}
      style={{
        background:
          "linear-gradient(135deg, #ec4899 0%, #a855f7 40%, #f97316 100%)",
        fontSize: "7px",
      }}
    >
      <span className="scale-75 origin-center">{text}</span>
    </div>
  );
}

interface TaskItem {
  id: string;
  key: string;
  title: string;
  project: string;
  completed: boolean;
  assignedTo: string;
}

interface ActivityItem {
  id: string;
  author: string;
  action: string;
  taskRef: string;
  timestamp: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // UI state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [trialBannerVisible, setTrialBannerVisible] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [newTaskModalOpen, setNewTaskModalOpen] = useState(false);
  const [activeNav, setActiveNav] = useState<"home" | "inbox" | "tasks" | "members">("home");

  // Form state for New Task
  const [taskTitle, setTaskTitle] = useState("");
  const [taskProject, setTaskProject] = useState("Haberry-Desk");
  const [taskStatus, setTaskStatus] = useState<"todo" | "in_progress" | "done">("todo");

  // Dynamic Greeting & Date
  const [greeting, setGreeting] = useState("Good evening");
  const [formattedDate, setFormattedDate] = useState("Saturday, October 31");

  // Tasks state (matches screenshot HAB-5)
  const [tasks, setTasks] = useState<TaskItem[]>([
    {
      id: "1",
      key: "HAB-5",
      title: "Create your own task",
      project: "Haberry-Desk",
      completed: false,
      assignedTo: "You",
    },
  ]);

  // Activity Feed (matches screenshot items)
  const [activities, setActivities] = useState<ActivityItem[]>([
    {
      id: "act-1",
      author: "Haberry Studio",
      action: "changed status from In Progress to To Do",
      taskRef: "HAB-5 Create your own task",
      timestamp: "2 hours ago",
    },
    {
      id: "act-2",
      author: "Haberry Studio",
      action: "changed status from To Do to In Progress",
      taskRef: "HAB-5 Create your own task",
      timestamp: "2 hours ago",
    },
    {
      id: "act-3",
      author: "Haberry Studio",
      action: "changed status from In Progress to To Do",
      taskRef: "HAB-5 Create your own task",
      timestamp: "2 hours ago",
    },
    {
      id: "act-4",
      author: "Haberry Studio",
      action: "changed status from Done to In Progress",
      taskRef: "HAB-5 Create your own task",
      timestamp: "2 hours ago",
    },
    {
      id: "act-5",
      author: "Haberry Studio",
      action: "changed status from To Do to Done",
      taskRef: "HAB-7 aubam",
      timestamp: "3 hours ago",
    },
  ]);

  // Auth Protection: Check session on mount
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user }, error }) => {
      if (error || !user) {
        // Not logged in -> block access and redirect to sign in
        router.replace("/auth/sign-in");
      } else {
        setUser(user);
        setIsLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        router.replace("/auth/sign-in");
      } else {
        setUser(session.user);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  // Calculate dynamic greeting and date
  useEffect(() => {
    const now = new Date();
    const hours = now.getHours();
    if (hours < 12) setGreeting("Good morning");
    else if (hours < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");

    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    setFormattedDate(
      `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}`
    );
  }, []);

  // Handle Logout
  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/auth/sign-in");
  };

  // Toggle Task Completion
  const toggleTaskCompletion = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const nextState = !t.completed;
          // Add activity entry
          const newAct: ActivityItem = {
            id: `act-${Date.now()}`,
            author: user?.user_metadata?.full_name || "Haberry Studio",
            action: nextState
              ? "changed status from In Progress to Done"
              : "changed status from Done to To Do",
            taskRef: `${t.key} ${t.title}`,
            timestamp: "Just now",
          };
          setActivities((a) => [newAct, ...a]);
          return { ...t, completed: nextState };
        }
        return t;
      })
    );
  };

  // Create New Task
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    const nextIdNum = tasks.length + 5;
    const newTask: TaskItem = {
      id: `task-${Date.now()}`,
      key: `HAB-${nextIdNum}`,
      title: taskTitle.trim(),
      project: taskProject,
      completed: taskStatus === "done",
      assignedTo: "You",
    };

    setTasks((prev) => [newTask, ...prev]);

    // Add activity
    const newAct: ActivityItem = {
      id: `act-${Date.now()}`,
      author: user?.user_metadata?.full_name || "Haberry Studio",
      action: `created task in ${taskStatus === "done" ? "Done" : "To Do"}`,
      taskRef: `${newTask.key} ${newTask.title}`,
      timestamp: "Just now",
    };
    setActivities((a) => [newAct, ...a]);

    setTaskTitle("");
    setNewTaskModalOpen(false);
  };

  // Calculate project completion percent
  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = Math.max(tasks.length, 3); // base 3
  const completionPercent = Math.round(
    ((completedCount + 2) / (totalCount + 1)) * 100
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0e0e11] flex flex-col items-center justify-center text-zinc-400 gap-3 font-sans">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-200" />
        <span className="text-xs">Loading Haberry Desk workspace...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0e0e11] text-[#f4f4f5] flex font-sans selection:bg-zinc-800 selection:text-white">
      {/* ========================================================= */}
      {/* LEFT SIDEBAR                                              */}
      {/* ========================================================= */}
      <aside
        className={`${
          sidebarOpen ? "w-60" : "w-0 -translate-x-full"
        } transition-all duration-200 ease-in-out border-r border-zinc-800/70 bg-[#0f1013] flex flex-col justify-between shrink-0 fixed inset-y-0 left-0 z-30 lg:static lg:translate-x-0 overflow-y-auto overflow-x-hidden`}
      >
        {/* Top: Workspace & Nav */}
        <div className="p-3 space-y-4">
          {/* Workspace Switcher Row */}
          <div className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-zinc-800/40 transition-colors">
            <div className="flex items-center gap-2 cursor-pointer">
              <span className="text-sm font-semibold text-white tracking-tight">
                Haberry
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                title="Search"
                className="text-zinc-400 hover:text-white transition-colors p-1 rounded cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
              <HaberryAvatar className="w-5 h-5 text-[6px]" text="h" />
            </div>
          </div>

          {/* Main Navigation Links */}
          <nav className="space-y-0.5 text-xs font-medium">
            <button
              type="button"
              onClick={() => setActiveNav("home")}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-colors cursor-pointer ${
                activeNav === "home"
                  ? "bg-[#1c1d22] text-white font-semibold"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
              }`}
            >
              <Home className="w-4 h-4 text-zinc-300" />
              <span>Home</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveNav("inbox")}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-colors cursor-pointer ${
                activeNav === "inbox"
                  ? "bg-[#1c1d22] text-white font-semibold"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
              }`}
            >
              <Inbox className="w-4 h-4 text-zinc-400" />
              <span>Inbox</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveNav("tasks")}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg transition-colors cursor-pointer ${
                activeNav === "tasks"
                  ? "bg-[#1c1d22] text-white font-semibold"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-zinc-400" />
                <span>My tasks</span>
              </div>
              <span className="text-[11px] text-zinc-500 font-mono">1</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveNav("members")}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-colors cursor-pointer ${
                activeNav === "members"
                  ? "bg-[#1c1d22] text-white font-semibold"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
              }`}
            >
              <Users className="w-4 h-4 text-zinc-400" />
              <span>Members</span>
            </button>
          </nav>

          {/* Projects Section */}
          <div className="pt-2">
            <div className="flex items-center justify-between px-2.5 py-1 text-xs text-zinc-400 font-medium">
              <div className="flex items-center gap-1.5 cursor-pointer hover:text-zinc-200">
                <span>Projects</span>
                <ChevronDown className="w-3 h-3 text-zinc-500" />
              </div>
              <button
                type="button"
                onClick={() => setNewTaskModalOpen(true)}
                title="Create Task / Project"
                className="text-zinc-400 hover:text-white p-0.5 rounded cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-1 space-y-0.5">
              <button
                type="button"
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-zinc-300 hover:text-white hover:bg-zinc-800/40 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <LayoutGrid className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white" />
                  <span className="truncate">Haberry-Desk</span>
                </div>
                <div className="w-3.5 h-3.5 rounded-full border border-zinc-700 bg-zinc-800/80 flex items-center justify-center text-[8px] text-zinc-400">
                  ⚡
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Sidebar */}
        <div className="p-3 space-y-3 border-t border-zinc-800/70">
          <div className="space-y-0.5 text-xs text-zinc-400">
            <button
              type="button"
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:text-white hover:bg-zinc-800/40 transition-colors cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-zinc-400" />
              <span>Invite people</span>
            </button>

            <button
              type="button"
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:text-white hover:bg-zinc-800/40 transition-colors cursor-pointer"
            >
              <Settings className="w-4 h-4 text-zinc-400" />
              <span>Settings</span>
            </button>
          </div>

          {/* 12 days left in trial card */}
          {trialBannerVisible && (
            <div className="relative bg-[#0d1627] border border-blue-900/50 rounded-xl p-3 text-xs space-y-1.5">
              <button
                type="button"
                onClick={() => setTrialBannerVisible(false)}
                title="Dismiss"
                className="absolute top-2.5 right-2.5 text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>

              <div className="flex items-center gap-1.5 text-sky-400 font-medium text-xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>12 days left in trial</span>
              </div>

              <p className="text-[11px] text-zinc-400 leading-snug">
                Upgrade anytime to keep your workspace after the trial.
              </p>

              <div>
                <a
                  href="#upgrade"
                  className="text-sky-400 hover:text-sky-300 underline text-xs font-medium"
                >
                  View plans
                </a>
              </div>
            </div>
          )}

          {/* Bottom Version & Theme Toggle Row */}
          <div className="flex items-center justify-between px-2 pt-1 text-xs text-zinc-500">
            <span className="font-mono text-[11px]">v2.48.0</span>

            <div className="flex items-center bg-[#141518] border border-zinc-800 rounded-full p-0.5">
              <div
                title="Dark theme (active)"
                className="p-1 rounded-full bg-zinc-800 text-zinc-200"
              >
                <Moon className="w-3 h-3" />
              </div>
              <div
                title="Light theme"
                className="p-1 rounded-full text-zinc-500 hover:text-zinc-300"
              >
                <Sun className="w-3 h-3" />
              </div>
            </div>
          </div>

          {/* User Account / Sign Out Row */}
          <div className="pt-2 border-t border-zinc-800/70 flex items-center justify-between px-2">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-6 h-6 rounded-full bg-zinc-800 text-zinc-200 flex items-center justify-center text-xs font-semibold shrink-0">
                {user?.email?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="truncate text-xs text-zinc-300">
                {user?.email || "User"}
              </div>
            </div>

            <button
              type="button"
              onClick={handleSignOut}
              title="Sign out of Haberry Desk"
              className="text-zinc-400 hover:text-red-400 p-1 rounded transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* MAIN CONTENT AREA                                         */}
      {/* ========================================================= */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header / Breadcrumb Bar */}
        <header className="h-12 border-b border-zinc-800/70 px-4 sm:px-8 flex items-center justify-between shrink-0 bg-[#0e0e11]">
          <div className="flex items-center gap-3 text-xs text-zinc-400">
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-zinc-400 hover:text-white cursor-pointer"
              title="Toggle sidebar"
            >
              <PanelLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1.5">
              <span className="hover:text-zinc-200 cursor-pointer">Haberry</span>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
              <span className="text-zinc-200 font-medium">Home</span>
            </div>
          </div>

          {/* Quick User Badge */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-500 hidden sm:inline-block">
              {user?.email}
            </span>
            <HaberryAvatar className="w-6 h-6 text-[7px]" text="haberry" />
          </div>
        </header>

        {/* Main Canvas */}
        <main className="flex-1 p-6 sm:p-10 max-w-6xl w-full mx-auto space-y-8">
          {/* Greeting & Date Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs sm:text-sm text-zinc-400 font-normal">
                {formattedDate}
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-0.5">
                {greeting}
              </h1>
            </div>

            <button
              type="button"
              onClick={() => setNewTaskModalOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs transition-colors cursor-pointer shadow-sm self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>New task</span>
            </button>
          </div>

          {/* 7-Day Timeline Bar (Exact layout from screenshot) */}
          <div className="rounded-xl border border-zinc-800/80 bg-[#121316] overflow-hidden">
            <div className="grid grid-cols-7 divide-x divide-zinc-800/80 text-xs text-center min-h-[92px]">
              {/* Wed 28 */}
              <div className="p-3 flex flex-col justify-start items-center text-zinc-500 hover:bg-zinc-800/20 transition-colors cursor-pointer">
                <span className="font-normal text-[11px]">Wed 28</span>
              </div>

              {/* Thu 29 */}
              <div className="p-3 flex flex-col justify-start items-center text-zinc-500 hover:bg-zinc-800/20 transition-colors cursor-pointer">
                <span className="font-normal text-[11px]">Thu 29</span>
              </div>

              {/* Fri 30 */}
              <div className="p-3 flex flex-col justify-start items-center text-zinc-500 hover:bg-zinc-800/20 transition-colors cursor-pointer">
                <span className="font-normal text-[11px]">Fri 30</span>
              </div>

              {/* Today (Active) */}
              <div className="p-3 flex flex-col justify-start items-center bg-[#17181c] text-white font-medium border-t-2 border-white/90 shadow-inner">
                <span className="font-semibold text-[11px]">Today</span>
              </div>

              {/* Sun 1 */}
              <div className="p-3 flex flex-col justify-start items-center text-zinc-500 hover:bg-zinc-800/20 transition-colors cursor-pointer">
                <span className="font-normal text-[11px]">Sun 1</span>
              </div>

              {/* Mon 2 */}
              <div className="p-3 flex flex-col justify-start items-center text-zinc-500 hover:bg-zinc-800/20 transition-colors cursor-pointer">
                <span className="font-normal text-[11px]">Mon 2</span>
              </div>

              {/* Tue 3 */}
              <div className="p-3 flex flex-col justify-start items-center text-zinc-500 hover:bg-zinc-800/20 transition-colors cursor-pointer">
                <span className="font-normal text-[11px]">Tue 3</span>
              </div>
            </div>
          </div>

          {/* Two-Column Grid: Left Column (Up Next + Projects) & Right Column (Activity) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT COLUMN (Up Next & Your Projects) */}
            <div className="lg:col-span-7 space-y-8">
              {/* SECTION: Up next */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-semibold text-white">Up next</h2>
                    <span className="text-xs text-zinc-500 font-normal">
                      {tasks.filter((t) => !t.completed).length} assigned to you
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveNav("tasks")}
                    className="text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  >
                    View all
                  </button>
                </div>

                {/* Tasks List */}
                <div className="space-y-2">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-zinc-800/30 transition-colors border border-transparent hover:border-zinc-800/60 group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Priority dash */}
                        <span className="text-zinc-600 font-bold select-none text-xs">
                          —
                        </span>

                        {/* Status Check Circle */}
                        <button
                          type="button"
                          onClick={() => toggleTaskCompletion(task.id)}
                          className="text-zinc-500 hover:text-white transition-colors cursor-pointer"
                          title={task.completed ? "Mark incomplete" : "Mark complete"}
                        >
                          {task.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 fill-emerald-950/60" />
                          ) : (
                            <Circle className="w-4 h-4 hover:border-white" />
                          )}
                        </button>

                        {/* Task Key */}
                        <span className="text-xs font-mono text-zinc-500 shrink-0">
                          {task.key}
                        </span>

                        {/* Task Title */}
                        <span
                          className={`text-xs font-medium truncate ${
                            task.completed
                              ? "line-through text-zinc-500"
                              : "text-zinc-200 group-hover:text-white"
                          }`}
                        >
                          {task.title}
                        </span>
                      </div>

                      {/* Project Label */}
                      <span className="text-xs text-zinc-500 shrink-0 ml-4">
                        {task.project}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION: Your projects */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-white">Your projects</h2>
                  <button
                    type="button"
                    className="text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  >
                    All projects
                  </button>
                </div>

                {/* Project Card (Exact visual from screenshot) */}
                <div className="bg-[#141518] border border-zinc-800/80 rounded-xl p-4 space-y-3 hover:border-zinc-700/80 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <LayoutGrid className="w-4 h-4 text-zinc-400" />
                      <span className="text-sm font-semibold text-white tracking-tight">
                        Haberry-Desk
                      </span>
                    </div>
                    <span className="text-xs font-mono text-zinc-400">
                      {completionPercent}%
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-zinc-800/90 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-white h-full rounded-full transition-all duration-300"
                      style={{ width: `${completionPercent}%` }}
                    />
                  </div>

                  <div className="text-[11px] text-zinc-500">
                    {totalCount} tasks
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN (Activity Feed) */}
            <div className="lg:col-span-5 space-y-3">
              <h2 className="text-sm font-semibold text-white">Activity</h2>

              <div className="space-y-4 pt-1">
                {activities.map((act) => (
                  <div key={act.id} className="flex items-start gap-3">
                    <HaberryAvatar className="w-6 h-6 text-[7px] mt-0.5" text="haberry" />

                    <div className="space-y-0.5 leading-tight">
                      <p className="text-xs text-zinc-300">
                        <strong className="font-semibold text-white">
                          {act.author}
                        </strong>{" "}
                        <span className="text-zinc-400">{act.action}</span>
                      </p>
                      <p className="text-[11px] text-zinc-500">
                        {act.taskRef} · {act.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* ========================================================= */}
      {/* MODAL: + New Task                                         */}
      {/* ========================================================= */}
      {newTaskModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141417] border border-zinc-800 rounded-2xl w-full max-w-md p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-white">Create new task</h3>
              <button
                type="button"
                onClick={() => setNewTaskModalOpen(false)}
                className="text-zinc-400 hover:text-white p-1 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Task title
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. Design auth flow and dashboard"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#0e0e11] border border-zinc-700 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Project
                  </label>
                  <select
                    value={taskProject}
                    onChange={(e) => setTaskProject(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#0e0e11] border border-zinc-700 text-xs text-zinc-200 focus:outline-none focus:border-white cursor-pointer"
                  >
                    <option value="Haberry-Desk">Haberry-Desk</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Status
                  </label>
                  <select
                    value={taskStatus}
                    onChange={(e) =>
                      setTaskStatus(e.target.value as "todo" | "in_progress" | "done")
                    }
                    className="w-full px-3 py-2 rounded-lg bg-[#0e0e11] border border-zinc-700 text-xs text-zinc-200 focus:outline-none focus:border-white cursor-pointer"
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setNewTaskModalOpen(false)}
                  className="px-3.5 py-2 rounded-lg border border-zinc-800 text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs transition-colors cursor-pointer shadow-sm"
                >
                  Create task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

