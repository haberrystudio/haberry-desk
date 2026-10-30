"use client";

import React, { useState } from "react";
import {
  Kanban,
  Calendar,
  GitBranch,
  Bot,
  Plus,
  CheckCircle2,
  Clock,
  ExternalLink,
  GitPullRequest,
  Sparkles,
  Search,
  Filter,
  Check,
  ChevronRight,
  Maximize2,
  X,
} from "lucide-react";

interface TaskItem {
  id: string;
  title: string;
  tag: string;
  tagColor: string;
  priority: "P0" | "P1" | "P2";
  assignee: string;
  avatarBg: string;
  githubPr?: string;
  subtasks?: string;
}

export function ProductDemo() {
  const [activeTab, setActiveTab] = useState<"kanban" | "gantt" | "github" | "mcp">("kanban");
  const [searchFilter, setSearchFilter] = useState("");
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);

  // Initial demo tasks state
  const [columns, setColumns] = useState<{
    todo: TaskItem[];
    inProgress: TaskItem[];
    inReview: TaskItem[];
    done: TaskItem[];
  }>({
    todo: [
      {
        id: "HAB-104",
        title: "Docker compose healthcheck & backup scripts",
        tag: "DevOps",
        tagColor: "bg-blue-950/60 text-blue-300 border-blue-800/60",
        priority: "P1",
        assignee: "Alex K.",
        avatarBg: "bg-indigo-600",
        subtasks: "1/3",
      },
      {
        id: "HAB-108",
        title: "Global shortcut G+T to navigate to Gantt timeline",
        tag: "UI / UX",
        tagColor: "bg-purple-950/60 text-purple-300 border-purple-800/60",
        priority: "P2",
        assignee: "Maria P.",
        avatarBg: "bg-pink-600",
      },
      {
        id: "HAB-112",
        title: "Webhook signature verification using HMAC-SHA256",
        tag: "Security",
        tagColor: "bg-emerald-950/60 text-emerald-300 border-emerald-800/60",
        priority: "P0",
        assignee: "David R.",
        avatarBg: "bg-emerald-600",
        subtasks: "0/2",
      },
    ],
    inProgress: [
      {
        id: "HAB-092",
        title: "Bi-directional GitHub webhook auto-state transitions",
        tag: "Integration",
        tagColor: "bg-emerald-950/60 text-emerald-300 border-emerald-800/60",
        priority: "P0",
        assignee: "David R.",
        avatarBg: "bg-emerald-600",
        githubPr: "#184",
        subtasks: "4/5",
      },
      {
        id: "HAB-097",
        title: "Optimistic UI updates for instant drag-and-drop",
        tag: "Frontend",
        tagColor: "bg-amber-950/60 text-amber-300 border-amber-800/60",
        priority: "P1",
        assignee: "Sarah T.",
        avatarBg: "bg-amber-600",
      },
    ],
    inReview: [
      {
        id: "HAB-089",
        title: "Model Context Protocol (MCP) server stdio bridge",
        tag: "AI / MCP",
        tagColor: "bg-cyan-950/60 text-cyan-300 border-cyan-800/60",
        priority: "P0",
        assignee: "Elena V.",
        avatarBg: "bg-cyan-600",
        githubPr: "#179",
        subtasks: "2/2",
      },
    ],
    done: [
      {
        id: "HAB-081",
        title: "Zero-latency SQLite and PostgreSQL hybrid storage",
        tag: "Database",
        tagColor: "bg-zinc-800 text-zinc-300 border-zinc-700",
        priority: "P0",
        assignee: "David R.",
        avatarBg: "bg-emerald-600",
        githubPr: "#165",
        subtasks: "3/3",
      },
      {
        id: "HAB-085",
        title: "Markdown spec rendering inside task modal",
        tag: "Editor",
        tagColor: "bg-zinc-800 text-zinc-300 border-zinc-700",
        priority: "P2",
        assignee: "Maria P.",
        avatarBg: "bg-pink-600",
      },
    ],
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: TaskItem = {
      id: `HAB-${Math.floor(115 + Math.random() * 50)}`,
      title: newTaskTitle.trim(),
      tag: "Feature",
      tagColor: "bg-purple-950/60 text-purple-300 border-purple-800/60",
      priority: "P1",
      assignee: "You",
      avatarBg: "bg-violet-600",
    };

    setColumns((prev) => ({
      ...prev,
      todo: [newTask, ...prev.todo],
    }));

    setNewTaskTitle("");
    setIsAddingTask(false);
  };

  const moveTask = (task: TaskItem, fromCol: keyof typeof columns, toCol: keyof typeof columns) => {
    if (fromCol === toCol) return;
    setColumns((prev) => ({
      ...prev,
      [fromCol]: prev[fromCol].filter((t) => t.id !== task.id),
      [toCol]: [task, ...prev[toCol]],
    }));
  };

  return (
    <section id="product-demo" className="relative py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Section Intro */}
        <div className="text-left mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-400 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-zinc-200" />
            <span>Interactive Demo Experience</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-white tracking-tight">
            Built for developers who want to ship, not fiddle.
          </h2>
          <p className="mt-2 text-zinc-400 text-sm sm:text-base max-w-2xl">
            Switch between Kanban, Gantt timelines, GitHub sync, and AI MCP controls in real-time. Try interacting with the demo below.
          </p>
        </div>

        {/* Browser / App Mockup Container */}
        <div className="relative rounded-2xl border border-zinc-800/90 bg-[#0c0c0e] shadow-2xl shadow-black/90 overflow-hidden">
          {/* Top Window Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-3 bg-[#111114] border-b border-zinc-800/80">
            {/* Window controls and title */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#ef4444]/80" />
                <div className="w-3 h-3 rounded-full bg-[#eab308]/80" />
                <div className="w-3 h-3 rounded-full bg-[#22c55e]/80" />
              </div>
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-400 font-mono pl-3 border-l border-zinc-800">
                <span className="text-zinc-500">acme-corp</span>
                <span>/</span>
                <span className="text-zinc-200 font-medium">sprint-34 (v2.4-release)</span>
              </div>
            </div>

            {/* View Switcher Tabs */}
            <div className="flex items-center gap-1 bg-[#18181b] p-1 rounded-lg border border-zinc-800 text-xs font-medium">
              <button
                onClick={() => setActiveTab("kanban")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                  activeTab === "kanban"
                    ? "bg-zinc-800 text-white shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Kanban className="w-3.5 h-3.5" />
                <span>Kanban Board</span>
              </button>

              <button
                onClick={() => setActiveTab("gantt")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                  activeTab === "gantt"
                    ? "bg-zinc-800 text-white shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Gantt Timeline</span>
              </button>

              <button
                onClick={() => setActiveTab("github")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                  activeTab === "github"
                    ? "bg-zinc-800 text-white shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <GitBranch className="w-3.5 h-3.5" />
                <span>GitHub Sync</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </button>

              <button
                onClick={() => setActiveTab("mcp")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                  activeTab === "mcp"
                    ? "bg-zinc-800 text-white shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Bot className="w-3.5 h-3.5 text-cyan-400" />
                <span>MCP Server</span>
              </button>
            </div>

            {/* Status indicator */}
            <div className="hidden lg:flex items-center gap-2 text-xs text-zinc-400">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
              <span>Synced with main</span>
            </div>
          </div>

          {/* Subheader Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3 bg-[#0e0e11] border-b border-zinc-800/60 text-xs">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Filter tasks..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 text-zinc-200 pl-8 pr-3 py-1 rounded-md text-xs placeholder-zinc-500 focus:outline-none focus:border-zinc-700 w-44 sm:w-56"
                />
              </div>

              <span className="text-zinc-500 hidden sm:inline">|</span>

              <div className="hidden sm:flex items-center gap-2 text-zinc-400">
                <span className="text-zinc-400">Perspective:</span>
                <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-200 font-medium text-[11px] flex items-center gap-1.5 border border-zinc-700/60">
                  <Kanban className="w-3 h-3 text-white" />
                  Kanban Board
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAddingTask(true)}
                className="flex items-center gap-1 px-3 py-1 rounded-md bg-white text-zinc-950 hover:bg-zinc-200 font-medium transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Task</span>
              </button>
            </div>
          </div>

          {/* Add Task Modal / Inline input */}
          {isAddingTask && (
            <div className="p-4 bg-zinc-900/90 border-b border-zinc-800 flex items-center gap-3">
              <form onSubmit={handleCreateTask} className="flex-1 flex items-center gap-3">
                <input
                  type="text"
                  autoFocus
                  placeholder="Task title (e.g. Implement webhook retry with exponential backoff)..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="flex-1 bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white"
                />
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-white text-zinc-950 font-medium text-xs hover:bg-zinc-200 cursor-pointer"
                >
                  Add to To-Do
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingTask(false)}
                  className="px-3 py-1.5 rounded-lg text-zinc-400 hover:text-white text-xs cursor-pointer"
                >
                  Cancel
                </button>
              </form>
            </div>
          )}

          {/* View Tab 1: KANBAN BOARD */}
          {activeTab === "kanban" && (
            <div className="p-6 overflow-x-auto min-h-[460px]">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 min-w-[760px]">
                {/* Column: To-Do */}
                <div className="flex flex-col bg-[#111114]/80 rounded-xl p-3 border border-zinc-800/50">
                  <div className="flex items-center justify-between mb-3 px-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-400" />
                      <span className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
                        To-Do
                      </span>
                    </div>
                    <span className="text-xs text-zinc-400 font-mono px-1.5 py-0.5 rounded bg-zinc-800/80">
                      {columns.todo.length}
                    </span>
                  </div>

                  <div className="space-y-2.5 flex-1">
                    {columns.todo
                      .filter((t) => t.title.toLowerCase().includes(searchFilter.toLowerCase()))
                      .map((task) => (
                        <div
                          key={task.id}
                          onClick={() => setSelectedTask(task)}
                          className="group p-3 rounded-lg bg-[#16161a] hover:bg-[#1a1a20] border border-zinc-800/80 hover:border-zinc-700 transition-all cursor-pointer shadow-sm"
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[11px] font-mono text-zinc-500">{task.id}</span>
                            <span
                              className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${task.tagColor}`}
                            >
                              {task.tag}
                            </span>
                          </div>
                          <p className="text-xs font-medium text-zinc-200 group-hover:text-white leading-snug">
                            {task.title}
                          </p>

                          <div className="mt-3 flex items-center justify-between pt-2 border-t border-zinc-800/50 text-[11px] text-zinc-500">
                            <span className="font-semibold text-zinc-400">{task.priority}</span>
                            <div className="flex items-center gap-2">
                              {task.subtasks && <span>{task.subtasks}</span>}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  moveTask(task, "todo", "inProgress");
                                }}
                                className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700 transition-colors"
                                title="Move to In Progress"
                              >
                                Start →
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Column: In Progress */}
                <div className="flex flex-col bg-[#111114]/80 rounded-xl p-3 border border-zinc-800/50">
                  <div className="flex items-center justify-between mb-3 px-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      <span className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
                        In Progress
                      </span>
                    </div>
                    <span className="text-xs text-zinc-400 font-mono px-1.5 py-0.5 rounded bg-zinc-800/80">
                      {columns.inProgress.length}
                    </span>
                  </div>

                  <div className="space-y-2.5 flex-1">
                    {columns.inProgress
                      .filter((t) => t.title.toLowerCase().includes(searchFilter.toLowerCase()))
                      .map((task) => (
                        <div
                          key={task.id}
                          onClick={() => setSelectedTask(task)}
                          className="group p-3 rounded-lg bg-[#16161a] hover:bg-[#1a1a20] border border-zinc-800/80 hover:border-zinc-700 transition-all cursor-pointer shadow-sm ring-1 ring-amber-500/10"
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[11px] font-mono text-zinc-500">{task.id}</span>
                            <span
                              className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${task.tagColor}`}
                            >
                              {task.tag}
                            </span>
                          </div>
                          <p className="text-xs font-medium text-zinc-200 group-hover:text-white leading-snug">
                            {task.title}
                          </p>

                          {task.githubPr && (
                            <div className="mt-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-zinc-800/80 text-[10px] text-zinc-300">
                              <GitPullRequest className="w-3 h-3 text-emerald-400" />
                              <span>PR {task.githubPr}</span>
                            </div>
                          )}

                          <div className="mt-3 flex items-center justify-between pt-2 border-t border-zinc-800/50 text-[11px] text-zinc-500">
                            <div className="flex items-center gap-1.5">
                              <div
                                className={`w-4 h-4 rounded-full ${task.avatarBg} text-[9px] text-white flex items-center justify-center font-bold`}
                              >
                                {task.assignee[0]}
                              </div>
                              <span className="text-zinc-400 text-[11px]">{task.assignee}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  moveTask(task, "inProgress", "todo");
                                }}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700"
                                title="Move back to To-Do"
                              >
                                ←
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  moveTask(task, "inProgress", "inReview");
                                }}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700"
                                title="Move to In Review"
                              >
                                Review →
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Column: In Review */}
                <div className="flex flex-col bg-[#111114]/80 rounded-xl p-3 border border-zinc-800/50">
                  <div className="flex items-center justify-between mb-3 px-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-cyan-400" />
                      <span className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
                        In Review
                      </span>
                    </div>
                    <span className="text-xs text-zinc-400 font-mono px-1.5 py-0.5 rounded bg-zinc-800/80">
                      {columns.inReview.length}
                    </span>
                  </div>

                  <div className="space-y-2.5 flex-1">
                    {columns.inReview
                      .filter((t) => t.title.toLowerCase().includes(searchFilter.toLowerCase()))
                      .map((task) => (
                        <div
                          key={task.id}
                          onClick={() => setSelectedTask(task)}
                          className="group p-3 rounded-lg bg-[#16161a] hover:bg-[#1a1a20] border border-zinc-800/80 hover:border-zinc-700 transition-all cursor-pointer shadow-sm ring-1 ring-cyan-500/10"
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[11px] font-mono text-zinc-500">{task.id}</span>
                            <span
                              className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${task.tagColor}`}
                            >
                              {task.tag}
                            </span>
                          </div>
                          <p className="text-xs font-medium text-zinc-200 group-hover:text-white leading-snug">
                            {task.title}
                          </p>

                          {task.githubPr && (
                            <div className="mt-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-zinc-800/80 text-[10px] text-zinc-300">
                              <GitPullRequest className="w-3 h-3 text-cyan-400" />
                              <span>PR {task.githubPr} waiting review</span>
                            </div>
                          )}

                          <div className="mt-3 flex items-center justify-between pt-2 border-t border-zinc-800/50 text-[11px] text-zinc-500">
                            <div className="flex items-center gap-1.5">
                              <div
                                className={`w-4 h-4 rounded-full ${task.avatarBg} text-[9px] text-white flex items-center justify-center font-bold`}
                              >
                                {task.assignee[0]}
                              </div>
                              <span className="text-zinc-400 text-[11px]">{task.assignee}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  moveTask(task, "inReview", "inProgress");
                                }}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700"
                                title="Move back to In Progress"
                              >
                                ←
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  moveTask(task, "inReview", "done");
                                }}
                                className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 hover:bg-emerald-900"
                                title="Mark as Done"
                              >
                                Done ✓
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Column: Done */}
                <div className="flex flex-col bg-[#111114]/80 rounded-xl p-3 border border-zinc-800/50">
                  <div className="flex items-center justify-between mb-3 px-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
                        Done
                      </span>
                    </div>
                    <span className="text-xs text-zinc-400 font-mono px-1.5 py-0.5 rounded bg-zinc-800/80">
                      {columns.done.length}
                    </span>
                  </div>

                  <div className="space-y-2.5 flex-1">
                    {columns.done
                      .filter((t) => t.title.toLowerCase().includes(searchFilter.toLowerCase()))
                      .map((task) => (
                        <div
                          key={task.id}
                          onClick={() => setSelectedTask(task)}
                          className="group p-3 rounded-lg bg-[#141418] border border-zinc-800/60 opacity-85 hover:opacity-100 transition-all cursor-pointer"
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[11px] font-mono text-zinc-500 line-through">
                              {task.id}
                            </span>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          </div>
                          <p className="text-xs font-medium text-zinc-400 group-hover:text-zinc-200 line-through leading-snug">
                            {task.title}
                          </p>

                          <div className="mt-3 flex items-center justify-between pt-2 border-t border-zinc-800/40 text-[11px] text-zinc-500">
                            <span className="text-emerald-400 font-mono text-[10px]">Merged</span>
                            <div className="flex items-center gap-2">
                              <span className="text-zinc-500 text-[11px]">{task.assignee}</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  moveTask(task, "done", "todo");
                                }}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700"
                                title="Reopen task into To-Do"
                              >
                                ↺ Reopen
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Kanban Task Detail Modal */}
          {selectedTask && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div
                className="fixed inset-0 bg-black/80 backdrop-blur-sm"
                onClick={() => setSelectedTask(null)}
              />
              <div className="relative w-full max-w-lg bg-[#121215] border border-zinc-700/80 rounded-2xl shadow-2xl shadow-black p-6 z-10 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-mono font-bold text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded">
                      {selectedTask.id}
                    </span>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${selectedTask.tagColor}`}>
                      {selectedTask.tag}
                    </span>
                    <span className="text-xs font-mono text-zinc-400">
                      Priority: <strong className="text-white">{selectedTask.priority}</strong>
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedTask(null)}
                    className="p-1.5 text-zinc-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="py-4 space-y-4">
                  <h3 className="text-lg font-semibold text-white leading-snug">
                    {selectedTask.title}
                  </h3>

                  <div className="grid grid-cols-2 gap-3 text-xs bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/80">
                    <div>
                      <span className="text-zinc-500 block">Assignee</span>
                      <span className="text-zinc-200 font-medium flex items-center gap-1.5 mt-0.5">
                        <span className={`w-3.5 h-3.5 rounded-full ${selectedTask.avatarBg} text-[8px] text-white flex items-center justify-center`}>
                          {selectedTask.assignee[0]}
                        </span>
                        {selectedTask.assignee}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">Subtasks</span>
                      <span className="text-zinc-200 font-medium mt-0.5 block">
                        {selectedTask.subtasks || "Completed"}
                      </span>
                    </div>
                  </div>

                  {selectedTask.githubPr && (
                    <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/50 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-emerald-300">
                        <GitPullRequest className="w-4 h-4" />
                        <span>Connected to Pull Request {selectedTask.githubPr}</span>
                      </div>
                      <span className="font-mono text-[10px] bg-emerald-900/60 text-emerald-200 px-2 py-0.5 rounded">
                        2-way sync active
                      </span>
                    </div>
                  )}

                  <div className="text-xs text-zinc-400 space-y-1">
                    <span className="text-zinc-500 uppercase font-mono tracking-wider text-[10px]">
                      Description &amp; Acceptance Criteria
                    </span>
                    <p className="leading-relaxed bg-zinc-950/80 p-3 rounded-lg border border-zinc-800 text-zinc-300 font-mono text-[11px]">
                      - Automated test suite runs on pull request commit.<br />
                      - Status changes in Haberry Desk automatically reflect on GitHub branch.<br />
                      - Sub-50ms latency cached locally with optimistic UI rollbacks.
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
                  <div className="text-[11px] text-zinc-500 font-mono">
                    Kanban Perspective Live Card
                  </div>
                  <button
                    onClick={() => setSelectedTask(null)}
                    className="px-4 py-2 rounded-lg bg-white text-zinc-950 font-medium text-xs hover:bg-zinc-200 cursor-pointer"
                  >
                    Close Preview
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* View Tab 2: GANTT TIMELINE */}
          {activeTab === "gantt" && (
            <div className="p-6 min-h-[460px] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800">
                  <div className="text-xs font-medium text-zinc-400">
                    Sprint 34 Roadmap & Milestone Tracking
                  </div>
                  <div className="flex items-center gap-4 text-xs font-mono text-zinc-500">
                    <span>Oct 14</span>
                    <span>Oct 21</span>
                    <span className="text-white font-bold">Today (Oct 29)</span>
                    <span>Nov 05</span>
                    <span>Nov 12</span>
                  </div>
                </div>

                {/* Timeline Gantt Rows */}
                <div className="space-y-4">
                  {/* Row 1 */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-250 font-medium text-zinc-200">
                        1. Two-Way GitHub Webhook Engine
                      </span>
                      <span className="text-[11px] text-emerald-400 font-mono">85% Complete</span>
                    </div>
                    <div className="h-7 w-full bg-zinc-900 rounded-md p-1 relative overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-emerald-600 to-teal-500 rounded text-[10px] text-white flex items-center px-3 font-medium w-[75%] shadow-sm">
                        PR #184 Auto-sync
                      </div>
                    </div>
                  </div>

                  {/* Row 2 */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-250 font-medium text-zinc-200">
                        2. Interactive Gantt Timeline with Drag-to-Resize
                      </span>
                      <span className="text-[11px] text-amber-400 font-mono">60% Complete</span>
                    </div>
                    <div className="h-7 w-full bg-zinc-900 rounded-md p-1 relative overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-amber-600 to-orange-500 rounded text-[10px] text-white flex items-center px-3 font-medium w-[55%] ml-[20%] shadow-sm">
                        Milestone Dependencies
                      </div>
                    </div>
                  </div>

                  {/* Row 3 */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-250 font-medium text-zinc-200">
                        3. Model Context Protocol (MCP) Server for AI Agents
                      </span>
                      <span className="text-[11px] text-cyan-400 font-mono">92% In Review</span>
                    </div>
                    <div className="h-7 w-full bg-zinc-900 rounded-md p-1 relative overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-cyan-600 to-blue-500 rounded text-[10px] text-white flex items-center px-3 font-medium w-[80%] ml-[10%] shadow-sm">
                        Claude & Cursor stdio integration
                      </div>
                    </div>
                  </div>

                  {/* Row 4 */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-250 font-medium text-zinc-200">
                        4. Production v2.4 Launch on Haberry Desk Cloud
                      </span>
                      <span className="text-[11px] text-zinc-500 font-mono">Scheduled Nov 05</span>
                    </div>
                    <div className="h-7 w-full bg-zinc-900 rounded-md p-1 relative overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 rounded text-[10px] text-white flex items-center px-3 font-medium w-[30%] ml-[65%] shadow-sm opacity-80">
                        Cloud Migration & Backups
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-400 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Dependencies dynamically re-calculate when dates shift. Zero manual math.</span>
                </div>
                <span className="font-mono text-zinc-500 text-[11px]">Sprint velocity: +24%</span>
              </div>
            </div>
          )}

          {/* View Tab 3: GITHUB 2-WAY SYNC */}
          {activeTab === "github" && (
            <div className="p-6 min-h-[460px] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800">
                  <div className="flex items-center gap-2 text-xs font-medium text-zinc-200">
                    <GitBranch className="w-4 h-4 text-emerald-400" />
                    <span>haberry/desk repository stream</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[11px] bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 font-mono">
                    Webhook connected
                  </span>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div className="p-3 rounded-lg bg-zinc-900/80 border border-zinc-800 flex items-start gap-3">
                    <GitPullRequest className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-200 font-medium">
                          PR #184: &quot;feat(sync): add 2-way github status mapping&quot;
                        </span>
                        <span className="text-zinc-500 text-[11px]">2m ago</span>
                      </div>
                      <p className="text-zinc-400 text-[11px] mt-1 font-sans">
                        Auto-linked to Haberry Desk task <span className="text-emerald-400 font-mono">HAB-092</span>.
                        Status automatically moved to <strong className="text-white">In Progress</strong>.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-zinc-900/80 border border-zinc-800 flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-200 font-medium">
                          Commit 9b8c2d: &quot;fix(db): handle transaction rollback [Fixes #165]&quot;
                        </span>
                        <span className="text-zinc-500 text-[11px]">18m ago</span>
                      </div>
                      <p className="text-zinc-400 text-[11px] mt-1 font-sans">
                        Detected commit syntax. Haberry Desk task <span className="text-cyan-400 font-mono">HAB-081</span>{" "}
                        automatically transitioned to <strong className="text-white">Done</strong> and archived.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-zinc-900/80 border border-zinc-800 flex items-start gap-3">
                    <GitBranch className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-200 font-medium">
                          Branch created: feature/mcp-stdio-client
                        </span>
                        <span className="text-zinc-500 text-[11px]">1h ago</span>
                      </div>
                      <p className="text-zinc-400 text-[11px] mt-1 font-sans">
                        Linked branch to Haberry Desk task <span className="text-purple-400 font-mono">HAB-089</span>.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-3 rounded-lg bg-zinc-900/50 border border-zinc-800 text-xs text-zinc-400 flex items-center justify-between">
                <span>Ship code on GitHub. Your board updates itself automatically.</span>
                <span className="text-zinc-200 underline cursor-pointer hover:text-white">
                  Configure repo webhooks →
                </span>
              </div>
            </div>
          )}

          {/* View Tab 4: MCP SERVER (AI AGENTS) */}
          {activeTab === "mcp" && (
            <div className="p-6 min-h-[460px] flex flex-col justify-between font-mono">
              <div>
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800">
                  <div className="flex items-center gap-2 text-xs font-medium text-cyan-300">
                    <Bot className="w-4 h-4 text-cyan-400" />
                    <span>Model Context Protocol (MCP) Live Endpoint</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[11px] bg-cyan-950/80 text-cyan-300 border border-cyan-800/80">
                    Claude Code / Cursor / AI Ready
                  </span>
                </div>

                <div className="bg-zinc-950 rounded-xl p-4 border border-zinc-800 text-xs space-y-3">
                  <div className="text-zinc-500 text-[11px]">
                    // Natural language command sent from coding agent:
                  </div>
                  <div className="text-emerald-400">
                    &gt; Agent: &quot;Find all high priority bugs in sprint-34, pick one and assign it to me.&quot;
                  </div>

                  <div className="text-zinc-500 text-[11px] pt-2">
                    // Haberry Desk MCP Server responds via JSON-RPC:
                  </div>
                  <pre className="text-zinc-300 bg-zinc-900/80 p-3 rounded-lg text-[11px] overflow-x-auto leading-relaxed border border-zinc-800">
{`{
  "jsonrpc": "2.0",
  "method": "haberry.assign_task",
  "params": {
    "taskId": "HAB-092",
    "assignee": "current_developer",
    "newStatus": "IN_PROGRESS",
    "notifySlack": false
  },
  "result": { "success": true, "message": "Assigned HAB-092 and moved to In Progress" }
}`}
                  </pre>

                  <div className="text-cyan-400 text-xs">
                    ✓ Agent: &quot;I&apos;ve assigned HAB-092 (Bi-directional GitHub webhook) to you and created git branch feature/hab-092.&quot;
                  </div>
                </div>
              </div>

              <div className="mt-6 p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-400 flex items-center justify-between">
                <span>Use Haberry Desk with Claude, Cursor, Antigravity, or any MCP client out of the box.</span>
                <span className="text-cyan-400 font-mono text-[11px]">haberry-desk-mcp v1.0.4</span>
              </div>
            </div>
          )}

          {/* Bottom quick shortcut bar */}
          <div className="px-6 py-2.5 bg-[#0b0b0d] border-t border-zinc-800/80 flex flex-wrap items-center justify-between text-xs text-zinc-500">
            <div className="flex items-center gap-4">
              <span>Shortcuts:</span>
              <span className="flex items-center gap-1 font-mono">
                <kbd className="px-1 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[10px]">C</kbd>
                Create task
              </span>
              <span className="flex items-center gap-1 font-mono">
                <kbd className="px-1 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[10px]">⌘</kbd>
                <kbd className="px-1 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[10px]">K</kbd>
                Command palette
              </span>
            </div>

            <div className="text-zinc-400 font-medium">
              Try clicking tabs above to test Kanban, Gantt, and GitHub sync
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

