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
  X,
  LogOut,
  Circle,
  ChevronRight,
  Loader2,
  Archive,
  Filter,
  SlidersHorizontal,
  Shield,
  ShieldAlert,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import {
  TaskDetailModal,
  type TaskDetailData,
  type SubtaskItem,
} from "@/components/TaskDetailModal";
import { NewTaskModal } from "@/components/NewTaskModal";
import { InviteMemberModal } from "@/components/InviteMemberModal";

// Custom Haberry Avatar with exact gradient seen in the screenshots
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

export interface WorkspaceMember {
  id: string;
  email: string;
  name: string;
  role: "owner" | "admin" | "member" | "viewer";
  status: "active" | "invited";
}

export default function WorkspaceDashboardClient({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const router = useRouter();
  const unwrappedParams = React.use(params);
  const workspaceId = unwrappedParams.workspaceId || "haberry-desk";

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Workspace Info
  const [workspaceName, setWorkspaceName] = useState("Haberry");
  const [projectName, setProjectName] = useState("Haberry-Desk");
  const [taskPrefix, setTaskPrefix] = useState("HAB");
  const [isTeam, setIsTeam] = useState(true);

  // UI Navigation
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState<
    "home" | "kanban" | "inbox" | "tasks" | "members"
  >("kanban");
  const [kanbanTab, setKanbanTab] = useState<"tasks" | "backlog">("tasks");

  // Modals
  const [newTaskModalOpen, setNewTaskModalOpen] = useState(false);
  const [newTaskDefaultStatus, setNewTaskDefaultStatus] = useState<
    "todo" | "in_progress" | "in_review" | "done"
  >("todo");
  const [selectedTaskForDetail, setSelectedTaskForDetail] =
    useState<TaskDetailData | null>(null);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  // Dynamic Greeting & Date
  const [greeting, setGreeting] = useState("Good evening");
  const [formattedDate, setFormattedDate] = useState("Saturday, October 31");

  // Tasks state (Full 4-column kanban tasks matching screenshots 1 & 2)
  const [tasks, setTasks] = useState<TaskDetailData[]>([]);

  // Members state
  const [members, setMembers] = useState<WorkspaceMember[]>([]);

  // Drag and Drop state
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  // Activity Feed
  const [activities, setActivities] = useState<
    { id: string; author: string; action: string; taskRef: string; timestamp: string }[]
  >([
    {
      id: "act-1",
      author: "Haberry Studio",
      action: "changed status from In Progress to To Do",
      taskRef: "Create your own task",
      timestamp: "2 hours ago",
    },
    {
      id: "act-2",
      author: "Haberry Studio",
      action: "changed status from To Do to In Progress",
      taskRef: "Invite your team",
      timestamp: "3 hours ago",
    },
  ]);

  // Load workspace, tasks, members & auth
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user }, error }) => {
      if (error || !user) {
        router.replace("/auth/sign-in");
        return;
      }
      setUser(user);

      // Attempt to load workspace from localStorage
      let currentWsName = "Haberry";
      let currentProjName = "Haberry-Desk";
      let currentPrefix = "HAB";
      let teamFlag = true;
      let initialTeammates: string[] = [];

      try {
        const savedWs = localStorage.getItem("haberry_active_workspace");
        if (savedWs) {
          const parsed = JSON.parse(savedWs);
          if (parsed.id === workspaceId || !workspaceId) {
            currentWsName = parsed.name || "Haberry";
            currentProjName = parsed.projectName || "Haberry-Desk";
            currentPrefix = parsed.taskPrefix || "HAB";
            teamFlag = parsed.audience !== "solo";
            initialTeammates = parsed.teammates || [];
          }
        }
      } catch {}

      setWorkspaceName(currentWsName);
      setProjectName(currentProjName);
      setTaskPrefix(currentPrefix);
      setIsTeam(teamFlag);

      // Seed Starter Tasks matching Screenshot 1 (HAB-5, HAB-6, HAB-7)
      const p = currentPrefix;
      const initialTasks: TaskDetailData[] = [
        {
          id: "task-1",
          key: `${p}-5`,
          title: "Create your own task",
          description:
            "Use the + next to a column name, or press T then C. Delete these starter tasks whenever you're ready.",
          status: "todo",
          priority: "none",
          assignee: "Haberry Studio",
          labels: ["General"],
          project: currentProjName,
          subtasks: [],
          relatedTask: { key: `${p}-6`, title: "dfgh" },
          activities: [
            {
              id: "act-10",
              author: "Haberry Studio",
              action: "created this task",
              time: "2 days ago",
            },
            {
              id: "act-11",
              author: "Haberry Studio",
              action: "assigned the task to themselves",
              time: "2 days ago",
            },
            {
              id: "act-12",
              author: "Haberry Studio",
              action: "changed status from In Progress to To Do",
              time: "2 days ago",
            },
          ],
        },
        {
          id: "task-2",
          key: `${p}-6`,
          title: "dfgh",
          description: "Inspect task relationships and subtasks.",
          status: "done",
          priority: "none",
          assignee: "Haberry Studio",
          labels: ["Dev"],
          project: currentProjName,
          subtasks: [
            { id: "sub-1", title: "Review requirements", completed: true },
          ],
          activities: [
            {
              id: "act-20",
              author: "Haberry Studio",
              action: "completed task",
              time: "1 day ago",
            },
          ],
        },
        {
          id: "task-3",
          key: `${p}-7`,
          title: "cvbnm",
          description: "Sprint review and deliverables.",
          status: "done",
          priority: "none",
          assignee: "Haberry Studio",
          labels: ["Frontend"],
          project: currentProjName,
          subtasks: [],
          activities: [
            {
              id: "act-30",
              author: "Haberry Studio",
              action: "moved to done",
              time: "3 hours ago",
            },
          ],
        },
      ];
      setTasks(initialTasks);

      // Members Setup (Owner + Teammates)
      const initialMembers: WorkspaceMember[] = [
        {
          id: user.id,
          email: user.email || "owner@company.com",
          name:
            user.user_metadata?.full_name ||
            user.email?.split("@")[0] ||
            "Haberry Studio",
          role: "owner",
          status: "active",
        },
      ];

      initialTeammates.forEach((tm, idx) => {
        initialMembers.push({
          id: `mem-${idx}`,
          email: tm,
          name: tm.split("@")[0],
          role: "member",
          status: "invited",
        });
      });

      setMembers(initialMembers);
      setIsLoading(false);
    });
  }, [router, workspaceId]);

  // Dynamic Date & Time-based Greeting
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

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/auth/sign-in");
  };

  // Move task status
  const moveTaskStatus = (
    taskId: string,
    newStatus: "todo" | "in_progress" | "in_review" | "done"
  ) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const newAct = {
            id: `act-${Date.now()}`,
            author: user?.user_metadata?.full_name || "You",
            action: `changed status from ${t.status} to ${newStatus}`,
            time: "Just now",
          };
          return {
            ...t,
            status: newStatus,
            activities: [newAct, ...(t.activities || [])],
          };
        }
        return t;
      })
    );
  };

  // HTML5 Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
    setDraggedTaskId(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (
    e: React.DragEvent,
    targetStatus: "todo" | "in_progress" | "in_review" | "done"
  ) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain") || draggedTaskId;
    if (!id) return;
    moveTaskStatus(id, targetStatus);
    setDraggedTaskId(null);
  };

  // Create Task from NewTaskModal
  const handleCreateTask = (newTaskData: {
    title: string;
    description: string;
    status: "todo" | "in_progress" | "in_review" | "done";
    priority: "none" | "low" | "medium" | "high" | "urgent";
    assignee: string;
  }) => {
    const nextNum = tasks.length + 5;
    const newTask: TaskDetailData = {
      id: `task-${Date.now()}`,
      key: `${taskPrefix}-${nextNum}`,
      title: newTaskData.title,
      description: newTaskData.description,
      status: newTaskData.status,
      priority: newTaskData.priority,
      assignee: newTaskData.assignee || "Haberry Studio",
      labels: ["General"],
      project: projectName,
      subtasks: [],
      activities: [
        {
          id: `act-${Date.now()}`,
          author: user?.user_metadata?.full_name || "Haberry Studio",
          action: `created this task in ${newTaskData.status}`,
          time: "Just now",
        },
      ],
    };

    setTasks((prev) => [newTask, ...prev]);

    // Add to workspace activity
    setActivities((prev) => [
      {
        id: `act-${Date.now()}`,
        author: user?.user_metadata?.full_name || "Haberry Studio",
        action: `created task in ${newTaskData.status}`,
        taskRef: `${newTask.key} ${newTask.title}`,
        timestamp: "Just now",
      },
      ...prev,
    ]);
  };

  // Update Task from TaskDetailModal
  const handleUpdateTask = (updated: TaskDetailData) => {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    setSelectedTaskForDetail(updated);
  };

  // Delete Task
  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    if (selectedTaskForDetail?.id === taskId) {
      setSelectedTaskForDetail(null);
    }
  };

  // Modify Member Role (Owner feature)
  const handleChangeMemberRole = (
    memberId: string,
    newRole: "owner" | "admin" | "member" | "viewer"
  ) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
    );
  };

  // Handle Invitation Sent
  const handleInvitationSent = (inv: { id: string; email: string; role: string }) => {
    const newMember: WorkspaceMember = {
      id: inv.id,
      email: inv.email,
      name: inv.email.split("@")[0],
      role: (inv.role as "admin" | "member" | "viewer") || "member",
      status: "invited",
    };
    setMembers((prev) => [...prev, newMember]);
  };

  const isCurrentUserOwner =
    members.find((m) => m.id === user?.id)?.role === "owner" || true;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0e0e11] flex flex-col items-center justify-center text-zinc-400 gap-3 font-sans">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-200" />
        <span className="text-xs">Loading {workspaceName} workspace...</span>
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
        {/* Top: Workspace & Navigation */}
        <div className="p-3 space-y-4">
          {/* Workspace Switcher Row */}
          <div className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-zinc-800/40 transition-colors">
            <div className="flex items-center gap-2 cursor-pointer truncate">
              <span className="text-sm font-semibold text-white tracking-tight truncate">
                {workspaceName}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            </div>

            <div className="flex items-center gap-2 shrink-0">
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

          {/* Navigation Links */}
          <nav className="space-y-0.5 text-xs font-medium">
            <button
              type="button"
              onClick={() => setActiveView("home")}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-colors cursor-pointer ${
                activeView === "home"
                  ? "bg-[#1c1d22] text-white font-semibold"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
              }`}
            >
              <Home className="w-4 h-4 text-zinc-300" />
              <span>Home</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView("inbox")}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-colors cursor-pointer ${
                activeView === "inbox"
                  ? "bg-[#1c1d22] text-white font-semibold"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
              }`}
            >
              <Inbox className="w-4 h-4 text-zinc-400" />
              <span>Inbox</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView("tasks")}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg transition-colors cursor-pointer ${
                activeView === "tasks"
                  ? "bg-[#1c1d22] text-white font-semibold"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-zinc-400" />
                <span>My tasks</span>
              </div>
              <span className="text-[11px] text-zinc-500 font-mono">
                {tasks.filter((t) => t.status !== "done").length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView("members")}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg transition-colors cursor-pointer ${
                activeView === "members"
                  ? "bg-[#1c1d22] text-white font-semibold"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-zinc-400" />
                <span>Members</span>
              </div>
              {isTeam && (
                <div className="flex items-center -space-x-1">
                  <div className="w-4 h-4 rounded-full bg-white text-zinc-950 font-bold text-[7px] flex items-center justify-center border border-zinc-900">
                    {workspaceName[0]?.toUpperCase() || "H"}
                  </div>
                  <div className="w-4 h-4 rounded-full bg-zinc-600 text-[6px] text-zinc-200 flex items-center justify-center border border-zinc-900">
                    •
                  </div>
                </div>
              )}
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
                onClick={() => {
                  setNewTaskDefaultStatus("todo");
                  setNewTaskModalOpen(true);
                }}
                title="Create task"
                className="text-zinc-400 hover:text-white p-0.5 rounded cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-1 space-y-0.5">
              <button
                type="button"
                onClick={() => setActiveView("kanban")}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer group ${
                  activeView === "kanban"
                    ? "bg-[#1c1d22] text-white font-medium border border-zinc-700/80"
                    : "text-zinc-300 hover:text-white hover:bg-zinc-800/40"
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <LayoutGrid className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white shrink-0" />
                  <span className="truncate">{projectName}</span>
                </div>
                <div className="w-3.5 h-3.5 rounded-full border border-zinc-700 bg-zinc-800/80 flex items-center justify-center text-[8px] text-zinc-400 shrink-0">
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
              onClick={() => setInviteModalOpen(true)}
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
              title="Sign out"
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
        {/* Top Header / Breadcrumbs */}
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
              <span
                onClick={() => setActiveView("home")}
                className="hover:text-zinc-200 cursor-pointer"
              >
                {workspaceName}
              </span>
              <span className="text-zinc-600">/</span>
              <span className="text-zinc-200 font-medium">
                {activeView === "kanban" ? projectName : activeView}
              </span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setNewTaskDefaultStatus("todo");
                setNewTaskModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs transition-colors cursor-pointer shadow-sm"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>New task</span>
            </button>
            <HaberryAvatar className="w-6 h-6 text-[7px]" text="haberry" />
          </div>
        </header>

        {/* ========================================================= */}
        {/* VIEW 1: 4-COLUMN KANBAN PERSPECTIVE (Matching Screenshot 1) */}
        {/* ========================================================= */}
        {activeView === "kanban" && (
          <main className="flex-1 p-6 sm:p-8 flex flex-col min-w-0 overflow-y-auto animate-in fade-in duration-150">
            {/* Top Bar with Tabs and Filters */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-[#141518] border border-zinc-800 rounded-lg p-0.5 text-xs font-medium">
                  <button
                    type="button"
                    onClick={() => setKanbanTab("tasks")}
                    className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                      kanbanTab === "tasks"
                        ? "bg-[#202127] text-white"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    Tasks
                  </button>
                  <button
                    type="button"
                    onClick={() => setKanbanTab("backlog")}
                    className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                      kanbanTab === "backlog"
                        ? "bg-[#202127] text-white"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    Backlog
                  </button>
                </div>
                <span className="text-xs text-zinc-500 font-mono">
                  {tasks.length} tasks
                </span>
              </div>

              {/* Filter / View Icons */}
              <div className="flex items-center gap-2 text-zinc-400">
                <button
                  type="button"
                  title="Search tasks"
                  className="p-1.5 rounded hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  title="Filter"
                  className="p-1.5 rounded hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
                >
                  <Filter className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  title="View options"
                  className="p-1.5 rounded hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 4 KANBAN COLUMNS WITH DRAG AND DROP (Matching Screenshot 1) */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 flex-1 items-start">
              {/* COLUMN 1: TO DO */}
              <div
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, "todo")}
                className="bg-[#121316] border border-zinc-800/80 rounded-xl p-3.5 space-y-3 min-h-[400px]"
              >
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <Circle className="w-3.5 h-3.5 text-zinc-400" />
                    <span className="text-xs font-semibold text-zinc-200">
                      To Do
                    </span>
                    <span className="text-[11px] text-zinc-500 font-mono">
                      {tasks.filter((t) => t.status === "todo").length}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setNewTaskDefaultStatus("todo");
                      setNewTaskModalOpen(true);
                    }}
                    className="text-zinc-500 hover:text-white p-1 rounded cursor-pointer"
                    title="Add task in To Do"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-2">
                  {tasks
                    .filter((t) => t.status === "todo")
                    .map((task) => (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        onClick={() => setSelectedTaskForDetail(task)}
                        className="p-3.5 rounded-xl bg-[#18191d] border border-zinc-800 hover:border-zinc-700 transition-all space-y-2 cursor-grab active:cursor-grabbing group shadow-sm"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-mono text-zinc-500">
                            {task.key}
                          </span>
                          <HaberryAvatar className="w-4 h-4 text-[5px]" text="h" />
                        </div>
                        <p className="text-xs text-white font-medium">
                          {task.title}
                        </p>
                      </div>
                    ))}
                </div>
              </div>

              {/* COLUMN 2: IN PROGRESS */}
              <div
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, "in_progress")}
                className="bg-[#121316] border border-zinc-800/80 rounded-xl p-3.5 space-y-3 min-h-[400px]"
              >
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded-full border border-amber-500/80 border-t-amber-400" />
                    <span className="text-xs font-semibold text-zinc-200">
                      In Progress
                    </span>
                    <span className="text-[11px] text-zinc-500 font-mono">
                      {tasks.filter((t) => t.status === "in_progress").length}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setNewTaskDefaultStatus("in_progress");
                      setNewTaskModalOpen(true);
                    }}
                    className="text-zinc-500 hover:text-white p-1 rounded cursor-pointer"
                    title="Add task in In Progress"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-2">
                  {tasks
                    .filter((t) => t.status === "in_progress")
                    .map((task) => (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        onClick={() => setSelectedTaskForDetail(task)}
                        className="p-3.5 rounded-xl bg-[#18191d] border border-amber-900/40 hover:border-amber-700 transition-all space-y-2 cursor-grab active:cursor-grabbing group shadow-sm"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-mono text-zinc-500">
                            {task.key}
                          </span>
                          <HaberryAvatar className="w-4 h-4 text-[5px]" text="h" />
                        </div>
                        <p className="text-xs text-white font-medium">
                          {task.title}
                        </p>
                      </div>
                    ))}
                </div>
              </div>

              {/* COLUMN 3: IN REVIEW */}
              <div
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, "in_review")}
                className="bg-[#121316] border border-zinc-800/80 rounded-xl p-3.5 space-y-3 min-h-[400px]"
              >
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded-full border border-cyan-500/80 border-t-cyan-400" />
                    <span className="text-xs font-semibold text-zinc-200">
                      In Review
                    </span>
                    <span className="text-[11px] text-zinc-500 font-mono">
                      {tasks.filter((t) => t.status === "in_review").length}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setNewTaskDefaultStatus("in_review");
                      setNewTaskModalOpen(true);
                    }}
                    className="text-zinc-500 hover:text-white p-1 rounded cursor-pointer"
                    title="Add task in In Review"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-2">
                  {tasks
                    .filter((t) => t.status === "in_review")
                    .map((task) => (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        onClick={() => setSelectedTaskForDetail(task)}
                        className="p-3.5 rounded-xl bg-[#18191d] border border-cyan-900/40 hover:border-cyan-700 transition-all space-y-2 cursor-grab active:cursor-grabbing group shadow-sm"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-mono text-zinc-500">
                            {task.key}
                          </span>
                          <HaberryAvatar className="w-4 h-4 text-[5px]" text="h" />
                        </div>
                        <p className="text-xs text-white font-medium">
                          {task.title}
                        </p>
                      </div>
                    ))}
                </div>
              </div>

              {/* COLUMN 4: DONE */}
              <div
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, "done")}
                className="bg-[#121316] border border-zinc-800/80 rounded-xl p-3.5 space-y-3 min-h-[400px]"
              >
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-xs font-semibold text-zinc-200">
                      Done
                    </span>
                    <span className="text-[11px] text-zinc-500 font-mono">
                      {tasks.filter((t) => t.status === "done").length}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Archive className="w-3.5 h-3.5 text-zinc-500" />
                    <button
                      type="button"
                      onClick={() => {
                        setNewTaskDefaultStatus("done");
                        setNewTaskModalOpen(true);
                      }}
                      className="text-zinc-500 hover:text-white p-1 rounded cursor-pointer"
                      title="Add completed task"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {tasks
                    .filter((t) => t.status === "done")
                    .map((task) => (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        onClick={() => setSelectedTaskForDetail(task)}
                        className="p-3.5 rounded-xl bg-[#18191d] border border-zinc-800 hover:border-zinc-700 transition-all space-y-2 cursor-grab active:cursor-grabbing group shadow-sm"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-mono text-zinc-500">
                            {task.key}
                          </span>
                          <HaberryAvatar className="w-4 h-4 text-[5px]" text="h" />
                        </div>
                        <p className="text-xs text-zinc-300 font-medium line-through">
                          {task.title}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </main>
        )}

        {/* ========================================================= */}
        {/* VIEW 2: HOME DASHBOARD                                     */}
        {/* ========================================================= */}
        {activeView === "home" && (
          <main className="flex-1 p-6 sm:p-10 max-w-6xl w-full mx-auto space-y-8 animate-in fade-in duration-150">
            <div>
              <p className="text-xs sm:text-sm text-zinc-400 font-normal">
                {formattedDate}
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-0.5">
                {greeting}
              </h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-7 space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-white">Up next</h2>
                    <button
                      type="button"
                      onClick={() => setActiveView("kanban")}
                      className="text-xs text-zinc-400 hover:text-white cursor-pointer"
                    >
                      View all
                    </button>
                  </div>

                  <div className="space-y-2">
                    {tasks.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => setSelectedTaskForDetail(task)}
                        className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-zinc-800/30 border border-zinc-800/50 cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono text-zinc-500">
                            {task.key}
                          </span>
                          <span className="text-xs font-medium text-zinc-200">
                            {task.title}
                          </span>
                        </div>
                        <span className="text-xs text-zinc-500">
                          {task.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

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
        )}

        {/* ========================================================= */}
        {/* VIEW 3: MEMBERS & ROLE MANAGEMENT                          */}
        {/* ========================================================= */}
        {activeView === "members" && (
          <main className="flex-1 p-6 sm:p-10 max-w-4xl w-full mx-auto space-y-6 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  Workspace Members
                </h1>
                <p className="text-xs text-zinc-400 mt-1">
                  Manage team members, roles, and project access for {workspaceName}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setInviteModalOpen(true)}
                className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs transition-colors cursor-pointer shadow-sm flex items-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Invite member</span>
              </button>
            </div>

            <div className="bg-[#141518] border border-zinc-800/80 rounded-xl divide-y divide-zinc-800/80 overflow-hidden">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="p-4 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 text-zinc-200 font-bold text-xs flex items-center justify-center">
                      {member.name[0]?.toUpperCase() || "M"}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white">
                        {member.name}
                        {member.status === "invited" && (
                          <span className="ml-2 text-[10px] text-emerald-400 font-normal">
                            (Invited · Pending)
                          </span>
                        )}
                      </p>
                      <p className="text-[11px] text-zinc-500">{member.email}</p>
                    </div>
                  </div>

                  {/* Role Selector (Owner can modify) */}
                  <div>
                    {member.role === "owner" ? (
                      <span className="px-2.5 py-1 rounded bg-zinc-800 text-zinc-300 font-semibold text-xs border border-zinc-700">
                        Owner
                      </span>
                    ) : isCurrentUserOwner ? (
                      <select
                        value={member.role}
                        onChange={(e) =>
                          handleChangeMemberRole(
                            member.id,
                            e.target.value as "admin" | "member" | "viewer"
                          )
                        }
                        className="bg-[#0e0e11] border border-zinc-700 text-zinc-200 rounded-lg px-2.5 py-1 text-xs focus:outline-none cursor-pointer"
                      >
                        <option value="admin">Admin</option>
                        <option value="member">Member</option>
                        <option value="viewer">Viewer</option>
                      </select>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 capitalize">
                        {member.role}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </main>
        )}

        {/* ========================================================= */}
        {/* VIEW 4: MY TASKS & INBOX                                  */}
        {/* ========================================================= */}
        {(activeView === "tasks" || activeView === "inbox") && (
          <main className="flex-1 p-6 sm:p-10 max-w-4xl w-full mx-auto space-y-6 animate-in fade-in duration-150">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight capitalize">
                {activeView === "tasks" ? "My Tasks" : "Inbox Notifications"}
              </h1>
            </div>

            <div className="space-y-2">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => setSelectedTaskForDetail(task)}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-[#141518] border border-zinc-800/80 hover:border-zinc-700 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-zinc-500">
                      {task.key}
                    </span>
                    <span className="text-xs font-medium text-white">
                      {task.title}
                    </span>
                  </div>
                  <span className="text-xs text-zinc-500 capitalize">
                    {task.status.replace("_", " ")}
                  </span>
                </div>
              ))}
            </div>
          </main>
        )}
      </div>

      {/* ========================================================= */}
      {/* MODAL 1: Task Detail Slide-over (Matching Screenshot 2)   */}
      {/* ========================================================= */}
      <TaskDetailModal
        task={selectedTaskForDetail}
        isOpen={Boolean(selectedTaskForDetail)}
        onClose={() => setSelectedTaskForDetail(null)}
        onUpdateTask={handleUpdateTask}
        onDeleteTask={handleDeleteTask}
      />

      {/* ========================================================= */}
      {/* MODAL 2: New Task Modal (Matching Screenshot 3)           */}
      {/* ========================================================= */}
      <NewTaskModal
        isOpen={newTaskModalOpen}
        onClose={() => setNewTaskModalOpen(false)}
        projectName={projectName}
        defaultStatus={newTaskDefaultStatus}
        onCreateTask={handleCreateTask}
      />

      {/* ========================================================= */}
      {/* MODAL 3: Invite Team Member (Matching Screenshot 4)       */}
      {/* ========================================================= */}
      <InviteMemberModal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        workspaceId={workspaceId}
        workspaceName={workspaceName}
        projectName={projectName}
        inviterName={user?.user_metadata?.full_name || "Haberry Studio"}
        onInvitationSent={handleInvitationSent}
      />
    </div>
  );
}
