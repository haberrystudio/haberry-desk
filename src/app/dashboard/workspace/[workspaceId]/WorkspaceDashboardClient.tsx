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
  Check,
  ChevronRight,
  Loader2,
  Archive,
  Filter,
  SlidersHorizontal,
  Shield,
  ShieldAlert,
  Layout,
  FolderKanban,
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
import { CreateWorkspaceModal } from "@/components/CreateWorkspaceModal";
import {
  CreateProjectModal,
  ProjectIcon,
} from "@/components/CreateProjectModal";

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

export interface WorkspaceListItem {
  id: string;
  name: string;
  projectName?: string;
  taskPrefix?: string;
  description?: string;
}

export interface ProjectItem {
  id: string;
  workspace_id: string;
  name: string;
  prefix: string;
  icon?: string;
  description?: string;
}

export function formatRelativeTime(timestamp?: string | null): string {
  if (!timestamp) return "Just now";
  if (timestamp.includes("ago") || timestamp === "Just now") return timestamp;
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return timestamp;
  const now = new Date();
  const diffInSeconds = Math.max(0, Math.floor((now.getTime() - date.getTime()) / 1000));

  if (diffInSeconds < 60) return "Just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return "Yesterday";
  if (diffInDays < 7) return `${diffInDays} days ago`;
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) return `${diffInWeeks}w ago`;
  return date.toLocaleDateString();
}

export function formatStatusLabel(
  status: "todo" | "in_progress" | "in_review" | "done" | string
): string {
  switch (status) {
    case "todo":
      return "To Do";
    case "in_progress":
      return "In Progress";
    case "in_review":
      return "In Review";
    case "done":
      return "Done";
    default:
      return status;
  }
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
  const [isSwitching, setIsSwitching] = useState(false);
  const [targetWorkspaceName, setTargetWorkspaceName] = useState("");

  // Workspace Info
  const [workspaceName, setWorkspaceName] = useState("Haberry");
  const [isTeam, setIsTeam] = useState(true);

  // Projects State
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [projectName, setProjectName] = useState("Haberry-Desk");
  const [taskPrefix, setTaskPrefix] = useState("HAB");

  // Workspaces List & Switcher States
  const [allWorkspaces, setAllWorkspaces] = useState<WorkspaceListItem[]>([]);
  const [workspaceDropdownOpen, setWorkspaceDropdownOpen] = useState(false);
  const [createWorkspaceModalOpen, setCreateWorkspaceModalOpen] = useState(false);
  const [createProjectModalOpen, setCreateProjectModalOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // UI Navigation - Defaults to Home
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState<
    "home" | "kanban" | "inbox" | "tasks" | "members"
  >("home");
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

  // Tasks state
  const [tasks, setTasks] = useState<TaskDetailData[]>([]);

  // Members state
  const [members, setMembers] = useState<WorkspaceMember[]>([]);

  // Drag and Drop state
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  // Activity Feed
  const [activities, setActivities] = useState<
    { id: string; author: string; action: string; taskRef: string; timestamp: string }[]
  >([]);

  // Load workspace, projects, tasks, members & auth from Supabase
  useEffect(() => {
    setIsLoading(true);
    setActiveView("home");

    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user }, error }) => {
      if (error || !user) {
        router.replace("/auth/sign-in");
        return;
      }
      setUser(user);

      const currentUserName =
        user.user_metadata?.full_name ||
        user.email?.split("@")[0] ||
        "Haberry Studio";

      // Attempt to load current workspace info from localStorage
      let currentWsName = "Haberry";
      let teamFlag = true;
      let initialTeammates: string[] = [];

      try {
        const savedWs = localStorage.getItem("haberry_active_workspace");
        if (savedWs) {
          const parsed = JSON.parse(savedWs);
          if (parsed.id === workspaceId || !workspaceId) {
            currentWsName = parsed.name || "Haberry";
            teamFlag = parsed.audience !== "solo";
            initialTeammates = parsed.teammates || [];
          }
        }
      } catch {}

      setWorkspaceName(currentWsName);
      setIsTeam(teamFlag);

      // Members Setup (Owner + Teammates)
      const initialMembers: WorkspaceMember[] = [
        {
          id: user.id,
          email: user.email || "owner@company.com",
          name: currentUserName,
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

      try {
        // Ensure workspace exists in Supabase
        await supabase
          .from("workspaces")
          .upsert(
            {
              id: workspaceId,
              name: currentWsName,
              plan: "free",
              owner_id: user.id,
              members_type: teamFlag ? "team" : "solo",
            },
            { onConflict: "id" }
          );

        // Fetch all workspaces for switcher
        const { data: dbWorkspaces } = await supabase
          .from("workspaces")
          .select("id, name");

        const combinedWorkspaces: WorkspaceListItem[] = [];
        const seenWs = new Set<string>();

        const appendWs = (item: WorkspaceListItem) => {
          if (!item.id || seenWs.has(item.id)) return;
          seenWs.add(item.id);
          combinedWorkspaces.push(item);
        };

        // Current workspace
        appendWs({
          id: workspaceId,
          name: currentWsName,
        });

        // Default workspace
        appendWs({
          id: "haberry-desk",
          name: "Haberry",
          projectName: "Haberry-Desk",
          taskPrefix: "HAB",
        });

        // Workspaces from Supabase
        (dbWorkspaces || []).forEach((w) => {
          appendWs({ id: w.id, name: w.name });
        });

        // Workspaces from localStorage
        try {
          const localWsList = JSON.parse(
            localStorage.getItem("haberry_all_workspaces") || "[]"
          );
          if (Array.isArray(localWsList)) {
            localWsList.forEach((lw) => {
              if (lw?.id && lw?.name) {
                appendWs({
                  id: lw.id,
                  name: lw.name,
                  projectName: lw.projectName,
                  taskPrefix: lw.taskPrefix,
                  description: lw.description,
                });
              }
            });
          }
        } catch {}

        setAllWorkspaces(combinedWorkspaces);

        // Fetch projects for this workspace
        const { data: dbProjects } = await supabase
          .from("projects")
          .select("*")
          .eq("workspace_id", workspaceId)
          .order("created_at", { ascending: true });

        let loadedProjects: ProjectItem[] = (dbProjects || []).map((p: any) => {
          let iconName = p.icon || "layout";
          if (!p.icon && p.description && p.description.startsWith("icon:")) {
            const parts = p.description.split("::");
            iconName = parts[0].replace("icon:", "");
          }
          return {
            id: p.id,
            workspace_id: p.workspace_id,
            name: p.name,
            prefix: p.prefix,
            icon: iconName,
            description: p.description,
          };
        });

        // Special case: ONLY the starter workspace 'haberry-desk' gets default project if empty
        if (workspaceId === "haberry-desk" && loadedProjects.length === 0) {
          const defaultProjId = "haberry-desk-proj";
          await supabase.from("projects").upsert(
            {
              id: defaultProjId,
              workspace_id: "haberry-desk",
              name: "Haberry-Desk",
              prefix: "HAB",
              description: "icon:layout::Primary workspace board",
            },
            { onConflict: "id" }
          );
          loadedProjects = [
            {
              id: defaultProjId,
              workspace_id: "haberry-desk",
              name: "Haberry-Desk",
              prefix: "HAB",
              icon: "layout",
              description: "Primary workspace board",
            },
          ];
        }

        setProjects(loadedProjects);

        // Active project selection
        if (loadedProjects.length > 0) {
          const active = loadedProjects[0];
          setActiveProjectId(active.id);
          setProjectName(active.name);
          setTaskPrefix(active.prefix);
        } else {
          setActiveProjectId(null);
          setProjectName("");
          setTaskPrefix("");
        }

        // Fetch tasks for this workspace
        const { data: dbTasks } = await supabase
          .from("tasks")
          .select("*")
          .eq("workspace_id", workspaceId)
          .order("order_index", { ascending: true });

        let loadedTasks = dbTasks || [];

        // Only seed starter tasks for the default 'haberry-desk' workspace
        if (workspaceId === "haberry-desk" && loadedTasks.length === 0) {
          const now = Date.now();
          const seedTasks = [
            {
              id: "HAB-5",
              workspace_id: "haberry-desk",
              project_id: "haberry-desk-proj",
              title: "Create your own task",
              description:
                "Use the + next to a column name, or press T then C. Delete these starter tasks whenever you're ready.",
              status: "todo",
              priority: "none",
              assignee_name: currentUserName,
              assignee_id: user.id,
              labels: ["General"],
              order_index: 0,
              created_at: new Date(now - 2 * 86400000).toISOString(),
              updated_at: new Date(now - 2 * 86400000).toISOString(),
            },
            {
              id: "HAB-6",
              workspace_id: "haberry-desk",
              project_id: "haberry-desk-proj",
              title: "dfgh",
              description: "Inspect task relationships and subtasks.",
              status: "done",
              priority: "none",
              assignee_name: currentUserName,
              assignee_id: user.id,
              labels: ["Dev"],
              order_index: 1,
              created_at: new Date(now - 86400000).toISOString(),
              updated_at: new Date(now - 86400000).toISOString(),
            },
            {
              id: "HAB-7",
              workspace_id: "haberry-desk",
              project_id: "haberry-desk-proj",
              title: "cvbnm",
              description: "Sprint review and deliverables.",
              status: "done",
              priority: "none",
              assignee_name: currentUserName,
              assignee_id: user.id,
              labels: ["Frontend"],
              order_index: 2,
              created_at: new Date(now - 3 * 3600000).toISOString(),
              updated_at: new Date(now - 3 * 3600000).toISOString(),
            },
          ];

          await supabase.from("tasks").insert(seedTasks);

          // Seed task activities
          await supabase.from("task_activities").insert([
            {
              task_id: "HAB-5",
              user_id: user.id,
              author: currentUserName,
              action: "created this task",
              created_at: new Date(now - 2 * 86400000).toISOString(),
            },
            {
              task_id: "HAB-5",
              user_id: user.id,
              author: currentUserName,
              action: "assigned the task to themselves",
              created_at: new Date(now - 2 * 86400000).toISOString(),
            },
            {
              task_id: "HAB-5",
              user_id: user.id,
              author: currentUserName,
              action: "changed status from In Progress to To Do",
              created_at: new Date(now - 2 * 86400000).toISOString(),
            },
            {
              task_id: "HAB-6",
              user_id: user.id,
              author: currentUserName,
              action: "completed task",
              created_at: new Date(now - 86400000).toISOString(),
            },
            {
              task_id: "HAB-7",
              user_id: user.id,
              author: currentUserName,
              action: "moved to done",
              created_at: new Date(now - 3 * 3600000).toISOString(),
            },
          ]);

          const { data: refetched } = await supabase
            .from("tasks")
            .select("*")
            .eq("workspace_id", "haberry-desk")
            .order("order_index", { ascending: true });
          loadedTasks = refetched || [];
        }

        // Fetch activities, subtasks, relations for all tasks
        const taskIds = loadedTasks.map((t) => t.id);
        let allActivities: any[] = [];
        let allSubtasks: any[] = [];
        let allRelations: any[] = [];

        if (taskIds.length > 0) {
          const [actRes, subRes, relRes] = await Promise.all([
            supabase
              .from("task_activities")
              .select("*")
              .in("task_id", taskIds)
              .order("created_at", { ascending: false }),
            supabase
              .from("subtasks")
              .select("*")
              .in("task_id", taskIds)
              .order("order_index", { ascending: true }),
            supabase
              .from("task_relations")
              .select("*")
              .in("task_id", taskIds),
          ]);
          allActivities = actRes.data || [];
          allSubtasks = subRes.data || [];
          allRelations = relRes.data || [];
        }

        // Assemble tasks state
        const assembledTasks: TaskDetailData[] = loadedTasks.map((t) => {
          const taskActs = allActivities.filter((a) => a.task_id === t.id);
          const taskSubs = allSubtasks.filter((s) => s.task_id === t.id);
          const rel = allRelations.find((r) => r.task_id === t.id);
          const relatedTaskObj = rel
            ? loadedTasks.find((item) => item.id === rel.related_task_id)
            : null;

          const createAct = taskActs
            .slice()
            .reverse()
            .find((a) => a.action?.toLowerCase().includes("created"));
          const creator = createAct?.author || t.assignee_name || currentUserName;

          return {
            id: t.id,
            key: t.id,
            title: t.title,
            description: t.description || "",
            status: t.status as "todo" | "in_progress" | "in_review" | "done",
            priority: (t.priority || "none") as "none" | "low" | "medium" | "high" | "urgent",
            assignee: t.assignee_name || currentUserName,
            creatorName: creator,
            labels: Array.isArray(t.labels) ? t.labels : ["General"],
            startDate: t.start_date,
            dueDate: t.due_date,
            project: projectName || "Project",
            subtasks: taskSubs.map((s) => ({
              id: s.id,
              title: s.title,
              completed: Boolean(s.completed),
            })),
            relatedTask: relatedTaskObj
              ? { key: relatedTaskObj.id, title: relatedTaskObj.title }
              : undefined,
            activities: taskActs.map((act) => ({
              id: act.id,
              author: act.author,
              action: act.action,
              time: formatRelativeTime(act.created_at),
            })),
          };
        });

        setTasks(assembledTasks);

        // Populate workspace activities feed
        const workspaceActs = allActivities.map((act) => {
          const matchedTask = loadedTasks.find((t) => t.id === act.task_id);
          return {
            id: act.id,
            author: act.author,
            action: act.action,
            taskRef: matchedTask
              ? `${matchedTask.id} ${matchedTask.title}`
              : "Task",
            timestamp: formatRelativeTime(act.created_at),
          };
        });
        setActivities(workspaceActs);
      } catch (err) {
        console.error("Error loading workspace data from Supabase:", err);
      } finally {
        setIsLoading(false);
        setIsSwitching(false);
        setTargetWorkspaceName("");
      }
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

  // Switch Active Workspace & land on Home page with loading screen
  const handleSwitchWorkspace = (ws: WorkspaceListItem) => {
    setWorkspaceDropdownOpen(false);
    if (ws.id === workspaceId) {
      setActiveView("home");
      return;
    }

    setIsSwitching(true);
    setTargetWorkspaceName(ws.name);
    setActiveView("home");

    try {
      localStorage.setItem(
        "haberry_active_workspace",
        JSON.stringify({
          id: ws.id,
          name: ws.name,
          projectName: ws.projectName || `${ws.name}-Desk`,
          taskPrefix: ws.taskPrefix || ws.name.slice(0, 3).toUpperCase(),
        })
      );
    } catch {}

    router.push(`/dashboard/workspace/${ws.id}`);
  };

  // Create New Workspace (Fresh Workspace: No auto-created projects or tasks)
  const handleCreateNewWorkspace = async (name: string, description: string) => {
    const slug =
      name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") || `ws-${Date.now()}`;

    const nowIso = new Date().toISOString();

    setIsSwitching(true);
    setTargetWorkspaceName(name.trim());
    setActiveView("home");

    const supabase = createClient();

    try {
      // Insert into Supabase workspaces ONLY (no projects, no tasks auto-created!)
      await supabase.from("workspaces").insert({
        id: slug,
        name: name.trim(),
        description: description.trim() || "",
        plan: "free",
        members_type: "team",
        owner_id: user?.id,
      });
    } catch (err) {
      console.error("Error creating workspace in Supabase:", err);
    }

    // Update localStorage
    const newWsData = {
      id: slug,
      name: name.trim(),
      description: description.trim(),
      plan: "free",
      createdAt: nowIso,
    };

    try {
      localStorage.setItem("haberry_active_workspace", JSON.stringify(newWsData));
      const all = JSON.parse(
        localStorage.getItem("haberry_all_workspaces") || "[]"
      );
      all.push(newWsData);
      localStorage.setItem("haberry_all_workspaces", JSON.stringify(all));
    } catch {}

    // Navigate directly into the newly created workspace as a fresh workspace
    router.push(`/dashboard/workspace/${slug}`);
  };

  // Create New Project with Icon & Key
  const handleCreateNewProject = async (name: string, prefix: string, icon: string) => {
    const cleanPrefix = prefix.trim().toUpperCase() || "HAB";
    const projId = `${workspaceId}-${cleanPrefix.toLowerCase()}-${Date.now().toString(36)}`;
    const supabase = createClient();

    const newProject: ProjectItem = {
      id: projId,
      workspace_id: workspaceId,
      name: name.trim(),
      prefix: cleanPrefix,
      icon,
      description: "",
    };

    try {
      const { error: insErr } = await supabase.from("projects").insert({
        id: projId,
        workspace_id: workspaceId,
        name: name.trim(),
        prefix: cleanPrefix,
        icon,
        description: `icon:${icon}::`,
      });

      if (insErr && insErr.code === "PGRST204") {
        // Fallback without icon column
        await supabase.from("projects").insert({
          id: projId,
          workspace_id: workspaceId,
          name: name.trim(),
          prefix: cleanPrefix,
          description: `icon:${icon}::`,
        });
      }
    } catch (err) {
      console.error("Failed to insert project into Supabase:", err);
    }

    setProjects((prev) => [...prev, newProject]);
    setActiveProjectId(newProject.id);
    setProjectName(newProject.name);
    setTaskPrefix(newProject.prefix);
    setActiveView("kanban");
  };

  // Select Active Project from Sidebar
  const handleSelectProject = (proj: ProjectItem) => {
    setActiveProjectId(proj.id);
    setProjectName(proj.name);
    setTaskPrefix(proj.prefix);
  };

  // Move task status & record in Supabase
  const moveTaskStatus = async (
    taskId: string,
    newStatus: "todo" | "in_progress" | "in_review" | "done"
  ) => {
    const currentTask = tasks.find((t) => t.id === taskId);
    if (!currentTask || currentTask.status === newStatus) return;

    const oldStatusLabel = formatStatusLabel(currentTask.status);
    const newStatusLabel = formatStatusLabel(newStatus);
    const author =
      user?.user_metadata?.full_name ||
      user?.email?.split("@")[0] ||
      "Haberry Studio";
    const actionText = `changed status from ${oldStatusLabel} to ${newStatusLabel}`;
    const newActId = `act-${Date.now()}`;
    const nowIso = new Date().toISOString();

    const newActivity = {
      id: newActId,
      author,
      action: actionText,
      time: "Just now",
    };

    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const updated = {
            ...t,
            status: newStatus,
            activities: [newActivity, ...(t.activities || [])],
          };
          if (selectedTaskForDetail?.id === taskId) {
            setSelectedTaskForDetail(updated);
          }
          return updated;
        }
        return t;
      })
    );

    // Update workspace activities feed
    setActivities((prev) => [
      {
        id: newActId,
        author,
        action: actionText,
        taskRef: `${currentTask.key} ${currentTask.title}`,
        timestamp: "Just now",
      },
      ...prev,
    ]);

    // Persist to Supabase
    try {
      const supabase = createClient();
      await supabase
        .from("tasks")
        .update({
          status: newStatus,
          updated_at: nowIso,
        })
        .eq("id", taskId);

      await supabase.from("task_activities").insert({
        task_id: taskId,
        user_id: user?.id,
        author,
        action: actionText,
        created_at: nowIso,
      });
    } catch (err) {
      console.error("Failed to persist task status change to Supabase:", err);
    }
  };

  // HTML5 Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
    setDraggedTaskId(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (
    e: React.DragEvent,
    targetStatus: "todo" | "in_progress" | "in_review" | "done"
  ) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain") || draggedTaskId;
    if (!id) return;
    setDraggedTaskId(null);
    await moveTaskStatus(id, targetStatus);
  };

  // Create Task from NewTaskModal & Persist to Supabase
  const handleCreateTask = async (newTaskData: {
    title: string;
    description: string;
    status: "todo" | "in_progress" | "in_review" | "done";
    priority: "none" | "low" | "medium" | "high" | "urgent";
    assignee: string;
  }) => {
    const currentPrefix = taskPrefix || "HAB";
    let maxNum = 0;
    tasks.forEach((t) => {
      const match = t.key.match(new RegExp(`^${currentPrefix}-(\\d+)`));
      if (match) {
        const n = parseInt(match[1], 10);
        if (n > maxNum) maxNum = n;
      }
    });
    const newKey = `${currentPrefix}-${maxNum + 1}`;

    const author =
      user?.user_metadata?.full_name ||
      user?.email?.split("@")[0] ||
      "Haberry Studio";
    const assignee = newTaskData.assignee || author;
    const nowIso = new Date().toISOString();

    const creationActId = `act-${Date.now()}`;
    const creationAct = {
      id: creationActId,
      author,
      action: `created this task in ${formatStatusLabel(newTaskData.status)}`,
      time: "Just now",
    };

    const taskActivities = [creationAct];
    if (assignee && assignee !== "Unassigned" && assignee !== author) {
      taskActivities.push({
        id: `act-${Date.now() + 1}`,
        author,
        action: `assigned the task to ${assignee}`,
        time: "Just now",
      });
    }

    const newTask: TaskDetailData = {
      id: newKey,
      key: newKey,
      title: newTaskData.title,
      description: newTaskData.description || "",
      status: newTaskData.status,
      priority: newTaskData.priority,
      assignee,
      creatorName: author,
      labels: ["General"],
      project: projectName || "Project",
      subtasks: [],
      activities: taskActivities,
    };

    // Optimistic UI update
    setTasks((prev) => [newTask, ...prev]);

    setActivities((prev) => [
      {
        id: creationActId,
        author,
        action: creationAct.action,
        taskRef: `${newKey} ${newTask.title}`,
        timestamp: "Just now",
      },
      ...prev,
    ]);

    // Persist to Supabase
    try {
      const supabase = createClient();
      await supabase.from("tasks").insert({
        id: newKey,
        workspace_id: workspaceId,
        project_id: activeProjectId || `${workspaceId}-proj`,
        title: newTask.title,
        description: newTask.description,
        status: newTask.status,
        priority: newTask.priority,
        assignee_name: assignee,
        assignee_id: user?.id,
        labels: ["General"],
        order_index: tasks.length,
        created_at: nowIso,
        updated_at: nowIso,
      });

      await supabase.from("task_activities").insert({
        task_id: newKey,
        user_id: user?.id,
        author,
        action: creationAct.action,
        created_at: nowIso,
      });

      if (assignee && assignee !== "Unassigned" && assignee !== author) {
        await supabase.from("task_activities").insert({
          task_id: newKey,
          user_id: user?.id,
          author,
          action: `assigned the task to ${assignee}`,
          created_at: new Date(Date.now() + 100).toISOString(),
        });
      }
    } catch (err) {
      console.error("Failed to insert new task to Supabase:", err);
    }
  };

  // Update Task from TaskDetailModal & Persist to Supabase
  const handleUpdateTask = async (updated: TaskDetailData) => {
    const prevTask = tasks.find((t) => t.id === updated.id);
    const author =
      user?.user_metadata?.full_name ||
      user?.email?.split("@")[0] ||
      "Haberry Studio";
    const nowIso = new Date().toISOString();

    let updatedActivities = updated.activities || [];

    // Track status change activity
    if (prevTask && prevTask.status !== updated.status) {
      const act = {
        id: `act-${Date.now()}`,
        author,
        action: `changed status from ${formatStatusLabel(prevTask.status)} to ${formatStatusLabel(updated.status)}`,
        time: "Just now",
      };
      updatedActivities = [act, ...updatedActivities];
      setActivities((a) => [
        {
          id: act.id,
          author,
          action: act.action,
          taskRef: `${updated.key} ${updated.title}`,
          timestamp: "Just now",
        },
        ...a,
      ]);

      try {
        const supabase = createClient();
        await supabase.from("task_activities").insert({
          task_id: updated.id,
          user_id: user?.id,
          author,
          action: act.action,
          created_at: nowIso,
        });
      } catch {}
    }

    // Track assignee change activity
    if (prevTask && prevTask.assignee !== updated.assignee) {
      const act = {
        id: `act-${Date.now() + 1}`,
        author,
        action: `reassigned task to ${updated.assignee}`,
        time: "Just now",
      };
      updatedActivities = [act, ...updatedActivities];
      setActivities((a) => [
        {
          id: act.id,
          author,
          action: act.action,
          taskRef: `${updated.key} ${updated.title}`,
          timestamp: "Just now",
        },
        ...a,
      ]);

      try {
        const supabase = createClient();
        await supabase.from("task_activities").insert({
          task_id: updated.id,
          user_id: user?.id,
          author,
          action: act.action,
          created_at: nowIso,
        });
      } catch {}
    }

    const taskWithActs = { ...updated, activities: updatedActivities };

    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t.id === updated.id ? taskWithActs : t))
    );
    setSelectedTaskForDetail(taskWithActs);

    // Persist to Supabase
    try {
      const supabase = createClient();
      await supabase
        .from("tasks")
        .update({
          title: updated.title,
          description: updated.description,
          status: updated.status,
          priority: updated.priority,
          assignee_name: updated.assignee,
          updated_at: nowIso,
        })
        .eq("id", updated.id);

      // Persist subtasks
      if (updated.subtasks && updated.subtasks.length > 0) {
        for (let i = 0; i < updated.subtasks.length; i++) {
          const s = updated.subtasks[i];
          await supabase.from("subtasks").upsert(
            {
              id: s.id,
              task_id: updated.id,
              title: s.title,
              completed: s.completed,
              order_index: i,
            },
            { onConflict: "id" }
          );
        }
      }
    } catch (err) {
      console.error("Failed to persist task updates to Supabase:", err);
    }
  };

  // Delete Task & Persist to Supabase
  const handleDeleteTask = async (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    if (selectedTaskForDetail?.id === taskId) {
      setSelectedTaskForDetail(null);
    }

    try {
      const supabase = createClient();
      await supabase.from("tasks").delete().eq("id", taskId);
    } catch (err) {
      console.error("Failed to delete task from Supabase:", err);
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

  const currentUserName =
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Haberry Studio";

  // Simple, elegant loading screen when switching or loading workspaces
  if (isLoading || isSwitching) {
    const displayWsName = targetWorkspaceName || workspaceName || "Haberry";
    return (
      <div className="min-h-screen bg-[#0e0e11] flex flex-col items-center justify-center font-sans selection:bg-zinc-800 selection:text-white px-4 animate-in fade-in duration-150">
        <div className="flex flex-col items-center text-center max-w-sm space-y-4">
          {/* Animated Avatar with glowing ring */}
          <div className="relative flex items-center justify-center">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/10 animate-pulse"
              style={{
                background:
                  "linear-gradient(135deg, #ec4899 0%, #a855f7 40%, #f97316 100%)",
              }}
            >
              <span className="text-white font-bold text-base tracking-tight select-none">
                {displayWsName[0]?.toUpperCase() || "H"}
              </span>
            </div>
            {/* Spinning Ring */}
            <div className="absolute -inset-2 rounded-2xl border border-zinc-800 border-t-purple-400 animate-spin" />
          </div>

          <div className="space-y-1">
            <h2 className="text-sm font-semibold text-white tracking-tight">
              {isSwitching ? `Switching to ${displayWsName}...` : `Loading ${displayWsName}...`}
            </h2>
            <p className="text-xs text-zinc-500">
              Opening your home dashboard
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0e0e11] text-[#f4f4f5] flex font-sans selection:bg-zinc-800 selection:text-white">
      {/* Background click listener to close dropdowns */}
      {(workspaceDropdownOpen || userMenuOpen) && (
        <div
          className="fixed inset-0 z-30 bg-transparent"
          onClick={() => {
            setWorkspaceDropdownOpen(false);
            setUserMenuOpen(false);
          }}
        />
      )}

      {/* ========================================================= */}
      {/* LEFT SIDEBAR                                              */}
      {/* ========================================================= */}
      <aside
        className={`${
          sidebarOpen ? "w-60" : "w-0 -translate-x-full"
        } transition-all duration-200 ease-in-out border-r border-zinc-800/70 bg-[#0f1013] flex flex-col justify-between shrink-0 fixed inset-y-0 left-0 z-40 lg:static lg:translate-x-0 overflow-y-auto overflow-x-hidden`}
      >
        {/* Top: Workspace & Navigation */}
        <div className="p-3 space-y-4">
          {/* Workspace Switcher Row - Separate Controls */}
          <div className="relative">
            <div className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-zinc-800/40 transition-colors">
              {/* 1. Workspace Name + Chevron Trigger */}
              <button
                type="button"
                onClick={() => setWorkspaceDropdownOpen((prev) => !prev)}
                className="flex items-center gap-1.5 cursor-pointer truncate hover:text-white transition-colors group focus:outline-none"
                title="Switch workspace"
              >
                <span className="text-sm font-semibold text-white tracking-tight truncate max-w-[115px]">
                  {workspaceName}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-200 transition-transform shrink-0 ${
                    workspaceDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* 2. Distinct Controls: Search and Profile Avatar */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  title="Search"
                  onClick={() => setActiveView("kanban")}
                  className="text-zinc-400 hover:text-white hover:bg-zinc-800/70 transition-colors p-1.5 rounded-lg cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5" />
                </button>

                <div className="relative">
                  <button
                    type="button"
                    title={currentUserName}
                    onClick={() => setUserMenuOpen((prev) => !prev)}
                    className="p-0.5 rounded-full hover:ring-2 hover:ring-zinc-700 transition-all cursor-pointer focus:outline-none"
                  >
                    <HaberryAvatar className="w-5 h-5 text-[6px]" text="h" />
                  </button>

                  {/* Profile Dropdown */}
                  {userMenuOpen && (
                    <div className="absolute right-0 top-8 z-50 w-48 rounded-xl bg-[#141518] border border-zinc-800 shadow-2xl py-1.5 text-xs animate-in fade-in zoom-in-95 duration-100">
                      <div className="px-3 py-2 border-b border-zinc-800/80">
                        <p className="font-semibold text-white truncate">{currentUserName}</p>
                        <p className="text-[11px] text-zinc-500 truncate">{user?.email}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setUserMenuOpen(false);
                          setActiveView("members");
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-zinc-300 hover:text-white hover:bg-zinc-800/60 cursor-pointer"
                      >
                        <Users className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Workspace Members</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2 px-3 py-2 text-red-400 hover:bg-zinc-800/60 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign out</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Workspace Switcher Dropdown */}
            {workspaceDropdownOpen && (
              <div className="absolute left-0 top-11 z-50 w-56 rounded-xl bg-[#141518] border border-zinc-800 shadow-2xl py-1.5 text-xs animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1.5 text-[10px] uppercase font-mono text-zinc-500 font-semibold tracking-wider">
                  Workspaces
                </div>

                <div className="max-h-56 overflow-y-auto space-y-0.5 px-1">
                  {allWorkspaces.map((ws) => {
                    const isCurrent = ws.id === workspaceId;
                    return (
                      <button
                        key={ws.id}
                        type="button"
                        onClick={() => handleSwitchWorkspace(ws)}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                          isCurrent
                            ? "bg-zinc-800 text-white font-medium"
                            : "text-zinc-300 hover:text-white hover:bg-zinc-800/60"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <div className="w-5 h-5 rounded-md bg-zinc-700 text-zinc-200 font-bold text-[9px] flex items-center justify-center shrink-0">
                            {ws.name[0]?.toUpperCase() || "W"}
                          </div>
                          <span className="truncate">{ws.name}</span>
                        </div>
                        {isCurrent && (
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="pt-1 mt-1 border-t border-zinc-800/80 px-1">
                  <button
                    type="button"
                    onClick={() => {
                      setWorkspaceDropdownOpen(false);
                      setCreateWorkspaceModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800/60 transition-colors cursor-pointer font-medium"
                  >
                    <Plus className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Create workspace</span>
                  </button>
                </div>
              </div>
            )}
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

          {/* Projects Section with Icons & Creation */}
          <div className="pt-2">
            <div className="flex items-center justify-between px-2.5 py-1 text-xs text-zinc-400 font-medium">
              <div className="flex items-center gap-1.5 cursor-pointer hover:text-zinc-200">
                <span>Projects</span>
                <span className="text-[10px] text-zinc-500 font-mono">
                  ({projects.length})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setCreateProjectModalOpen(true)}
                title="Create project"
                className="text-zinc-400 hover:text-white p-0.5 rounded cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-1 space-y-0.5">
              {projects.length === 0 ? (
                <button
                  type="button"
                  onClick={() => setCreateProjectModalOpen(true)}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs text-zinc-400 hover:text-white hover:bg-zinc-800/40 border border-dashed border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Create project</span>
                </button>
              ) : (
                projects.map((proj) => {
                  const isCurrent = proj.id === activeProjectId;
                  const projTaskCount = tasks.filter(
                    (t) =>
                      t.project === proj.name ||
                      t.key.startsWith(proj.prefix)
                  ).length;
                  return (
                    <button
                      key={proj.id}
                      type="button"
                      onClick={() => {
                        handleSelectProject(proj);
                        setActiveView("kanban");
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer group ${
                        isCurrent
                          ? "bg-[#1c1d22] text-white font-medium border border-zinc-700/80"
                          : "text-zinc-300 hover:text-white hover:bg-zinc-800/40"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <ProjectIcon
                          name={proj.icon}
                          className={`w-3.5 h-3.5 shrink-0 ${
                            isCurrent
                              ? "text-white"
                              : "text-zinc-400 group-hover:text-zinc-200"
                          }`}
                        />
                        <span className="truncate">{proj.name}</span>
                      </div>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {projTaskCount}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Bottom User Bar */}
        <div className="p-3 border-t border-zinc-800/60 bg-[#0e0e11]/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 truncate">
              <div className="w-7 h-7 rounded-full bg-zinc-800 text-zinc-200 font-semibold text-xs flex items-center justify-center border border-zinc-700 shrink-0">
                {currentUserName[0]?.toUpperCase() || "H"}
              </div>
              <div className="truncate">
                <p className="text-xs font-medium text-white truncate">
                  {currentUserName}
                </p>
                <p className="text-[10px] text-zinc-500 truncate">
                  {user?.email || "owner@company.com"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSignOut}
              title="Sign out"
              className="p-1.5 rounded hover:bg-zinc-800 hover:text-red-400 transition-colors text-zinc-400 cursor-pointer"
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
        {/* Top Header Bar */}
        <header className="h-12 border-b border-zinc-800/80 px-4 sm:px-6 flex items-center justify-between shrink-0 bg-[#0e0e11] sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-zinc-400 hover:text-white transition-colors cursor-pointer p-1 rounded"
              title="Toggle sidebar"
            >
              <PanelLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-zinc-400 font-medium">{workspaceName}</span>
              <span className="text-zinc-600">&gt;</span>
              <span className="text-white font-medium">
                {projectName || "No project selected"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setInviteModalOpen(true)}
              className="px-2.5 py-1 rounded-md text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer flex items-center gap-1.5 border border-zinc-800"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Invite</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (projects.length === 0) {
                  setCreateProjectModalOpen(true);
                  return;
                }
                setNewTaskDefaultStatus("todo");
                setNewTaskModalOpen(true);
              }}
              className="px-3 py-1 rounded-md bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Task</span>
            </button>
          </div>
        </header>

        {/* ========================================================= */}
        {/* VIEW 1: KANBAN BOARD                                      */}
        {/* ========================================================= */}
        {activeView === "kanban" && (
          <main className="flex-1 p-4 sm:p-6 space-y-4 flex flex-col animate-in fade-in duration-150">
            {projects.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center max-w-md mx-auto space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-[#141518] border border-zinc-800 flex items-center justify-center text-zinc-400 shadow-md">
                  <Layout className="w-7 h-7 text-zinc-300" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-white">
                    No projects in {workspaceName} yet
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Start fresh by creating your first project to track tasks, organize columns, and manage workflows.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCreateProjectModalOpen(true)}
                  className="px-5 py-2 rounded-full bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Project</span>
                </button>
              </div>
            ) : (
              <>
                {/* View Sub-header: Tasks / Backlog Switcher */}
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800/60">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setKanbanTab("tasks")}
                        className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
                          kanbanTab === "tasks"
                            ? "text-white bg-zinc-800"
                            : "text-zinc-400 hover:text-zinc-200"
                        }`}
                      >
                        Tasks
                      </button>
                      <button
                        type="button"
                        onClick={() => setKanbanTab("backlog")}
                        className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
                          kanbanTab === "backlog"
                            ? "text-white bg-zinc-800"
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

                {/* 4 KANBAN COLUMNS WITH DRAG AND DROP */}
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
              </>
            )}
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
                    {projects.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setActiveView("kanban")}
                        className="text-xs text-zinc-400 hover:text-white cursor-pointer"
                      >
                        View all
                      </button>
                    )}
                  </div>

                  {projects.length === 0 ? (
                    <div className="p-6 rounded-xl bg-[#141518] border border-dashed border-zinc-800 text-center space-y-3">
                      <p className="text-xs text-zinc-400">
                        No projects created yet in this workspace.
                      </p>
                      <button
                        type="button"
                        onClick={() => setCreateProjectModalOpen(true)}
                        className="px-4 py-1.5 rounded-full bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Create Project</span>
                      </button>
                    </div>
                  ) : tasks.length === 0 ? (
                    <div className="p-6 rounded-xl bg-[#141518] border border-dashed border-zinc-800 text-center space-y-3">
                      <p className="text-xs text-zinc-400">
                        No tasks in this project yet.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setNewTaskDefaultStatus("todo");
                          setNewTaskModalOpen(true);
                        }}
                        className="px-4 py-1.5 rounded-full bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add First Task</span>
                      </button>
                    </div>
                  ) : (
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
                            {formatStatusLabel(task.status)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="lg:col-span-5 space-y-3">
                <h2 className="text-sm font-semibold text-white">Activity</h2>
                <div className="space-y-4 pt-1">
                  {activities.length === 0 ? (
                    <p className="text-xs text-zinc-500 italic">
                      No activity recorded yet in this workspace.
                    </p>
                  ) : (
                    activities.map((act) => (
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
                    ))
                  )}
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
              {tasks.length === 0 ? (
                <div className="p-6 rounded-xl bg-[#141518] border border-dashed border-zinc-800 text-center text-xs text-zinc-500">
                  No tasks assigned to you.
                </div>
              ) : (
                tasks.map((task) => (
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
                      {formatStatusLabel(task.status)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </main>
        )}
      </div>

      {/* ========================================================= */}
      {/* MODAL 1: Task Detail Slide-over                           */}
      {/* ========================================================= */}
      <TaskDetailModal
        task={selectedTaskForDetail}
        isOpen={Boolean(selectedTaskForDetail)}
        onClose={() => setSelectedTaskForDetail(null)}
        onUpdateTask={handleUpdateTask}
        onDeleteTask={handleDeleteTask}
        members={members}
        currentUserName={currentUserName}
      />

      {/* ========================================================= */}
      {/* MODAL 2: New Task Modal                                   */}
      {/* ========================================================= */}
      <NewTaskModal
        isOpen={newTaskModalOpen}
        onClose={() => setNewTaskModalOpen(false)}
        projectName={projectName || "Project"}
        defaultStatus={newTaskDefaultStatus}
        onCreateTask={handleCreateTask}
        members={members}
        currentUserName={currentUserName}
      />

      {/* ========================================================= */}
      {/* MODAL 3: Invite Team Member                               */}
      {/* ========================================================= */}
      <InviteMemberModal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        workspaceId={workspaceId}
        workspaceName={workspaceName}
        projectName={projectName || "Project"}
        inviterName={currentUserName}
        onInvitationSent={handleInvitationSent}
      />

      {/* ========================================================= */}
      {/* MODAL 4: Create Workspace Modal                           */}
      {/* ========================================================= */}
      <CreateWorkspaceModal
        isOpen={createWorkspaceModalOpen}
        onClose={() => setCreateWorkspaceModalOpen(false)}
        onCreateWorkspace={handleCreateNewWorkspace}
      />

      {/* ========================================================= */}
      {/* MODAL 5: Create Project Modal (with Icon Picker)          */}
      {/* ========================================================= */}
      <CreateProjectModal
        isOpen={createProjectModalOpen}
        onClose={() => setCreateProjectModalOpen(false)}
        onCreateProject={handleCreateNewProject}
      />
    </div>
  );
}
