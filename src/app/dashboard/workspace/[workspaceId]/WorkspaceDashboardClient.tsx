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

  // Tasks state (Full 4-column kanban tasks)
  const [tasks, setTasks] = useState<TaskDetailData[]>([]);

  // Members state
  const [members, setMembers] = useState<WorkspaceMember[]>([]);

  // Drag and Drop state
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  // Activity Feed
  const [activities, setActivities] = useState<
    { id: string; author: string; action: string; taskRef: string; timestamp: string }[]
  >([]);

  // Load workspace, tasks, members & auth from Supabase
  useEffect(() => {
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
        // Ensure workspace & project exist in Supabase
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

        const projId = `${workspaceId}-proj`;
        await supabase
          .from("projects")
          .upsert(
            {
              id: projId,
              workspace_id: workspaceId,
              name: currentProjName,
              prefix: currentPrefix,
              description: "Primary workspace board",
            },
            { onConflict: "id" }
          );

        // Fetch tasks from Supabase
        const { data: dbTasks } = await supabase
          .from("tasks")
          .select("*")
          .eq("workspace_id", workspaceId)
          .order("order_index", { ascending: true });

        let loadedTasks = dbTasks || [];

        // If no tasks exist for this workspace, seed starter tasks into DB!
        if (loadedTasks.length === 0) {
          const now = Date.now();
          const seedTasks = [
            {
              id: `${currentPrefix}-5`,
              workspace_id: workspaceId,
              project_id: projId,
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
              id: `${currentPrefix}-6`,
              workspace_id: workspaceId,
              project_id: projId,
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
              id: `${currentPrefix}-7`,
              workspace_id: workspaceId,
              project_id: projId,
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
              task_id: `${currentPrefix}-5`,
              user_id: user.id,
              author: currentUserName,
              action: "created this task",
              created_at: new Date(now - 2 * 86400000).toISOString(),
            },
            {
              task_id: `${currentPrefix}-5`,
              user_id: user.id,
              author: currentUserName,
              action: "assigned the task to themselves",
              created_at: new Date(now - 2 * 86400000).toISOString(),
            },
            {
              task_id: `${currentPrefix}-5`,
              user_id: user.id,
              author: currentUserName,
              action: "changed status from In Progress to To Do",
              created_at: new Date(now - 2 * 86400000).toISOString(),
            },
            {
              task_id: `${currentPrefix}-6`,
              user_id: user.id,
              author: currentUserName,
              action: "created this task",
              created_at: new Date(now - 86400000).toISOString(),
            },
            {
              task_id: `${currentPrefix}-6`,
              user_id: user.id,
              author: currentUserName,
              action: "completed task",
              created_at: new Date(now - 86400000).toISOString(),
            },
            {
              task_id: `${currentPrefix}-7`,
              user_id: user.id,
              author: currentUserName,
              action: "created this task",
              created_at: new Date(now - 3 * 3600000).toISOString(),
            },
            {
              task_id: `${currentPrefix}-7`,
              user_id: user.id,
              author: currentUserName,
              action: "moved to done",
              created_at: new Date(now - 3 * 3600000).toISOString(),
            },
          ]);

          // Seed subtask
          await supabase.from("subtasks").insert([
            {
              id: "sub-1",
              task_id: `${currentPrefix}-6`,
              title: "Review requirements",
              completed: true,
              order_index: 0,
            },
          ]);

          // Seed relation
          await supabase.from("task_relations").insert([
            {
              task_id: `${currentPrefix}-5`,
              related_task_id: `${currentPrefix}-6`,
              relation_type: "related",
            },
          ]);

          const { data: refetched } = await supabase
            .from("tasks")
            .select("*")
            .eq("workspace_id", workspaceId)
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

          // Find creator author from the creation activity or default
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
            project: currentProjName,
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
    // Generate next sequential key e.g. HAB-8
    let maxNum = 4;
    tasks.forEach((t) => {
      const match = t.key.match(new RegExp(`^${taskPrefix}-(\\d+)`));
      if (match) {
        const n = parseInt(match[1], 10);
        if (n > maxNum) maxNum = n;
      }
    });
    const newKey = `${taskPrefix}-${maxNum + 1}`;

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
      project: projectName,
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
        project_id: `${workspaceId}-proj`,
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
                <div className="flex items-center gap-2 truncate">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                  <span className="truncate">{projectName}</span>
                </div>
                <span className="text-[10px] text-zinc-500 font-mono">
                  {tasks.length}
                </span>
              </button>
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
              <span className="text-white font-medium">{projectName}</span>
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
        {/* VIEW 1: KANBAN BOARD (Matching Screenshots 1 & 2)         */}
        {/* ========================================================= */}
        {activeView === "kanban" && (
          <main className="flex-1 p-4 sm:p-6 space-y-4 flex flex-col animate-in fade-in duration-150">
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
                          {formatStatusLabel(task.status)}
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
                    {formatStatusLabel(task.status)}
                  </span>
                </div>
              ))}
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
        projectName={projectName}
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
        projectName={projectName}
        inviterName={currentUserName}
        onInvitationSent={handleInvitationSent}
      />
    </div>
  );
}
