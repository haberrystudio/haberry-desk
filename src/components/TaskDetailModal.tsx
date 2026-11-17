"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Link as LinkIcon,
  GitBranch,
  MoreHorizontal,
  Maximize2,
  Circle,
  CheckCircle2,
  Plus,
  Paperclip,
  Calendar,
  Tag,
  User,
  Trash2,
} from "lucide-react";
import { HaberryAvatar } from "@/app/dashboard/workspace/[workspaceId]/WorkspaceDashboardClient";

export interface SubtaskItem {
  id: string;
  title: string;
  completed: boolean;
}

export interface TaskDetailData {
  id: string;
  key: string;
  title: string;
  description: string;
  status: "todo" | "in_progress" | "in_review" | "done";
  priority: "none" | "low" | "medium" | "high" | "urgent";
  assignee: string;
  creatorName?: string;
  labels: string[];
  startDate?: string;
  dueDate?: string;
  project: string;
  subtasks: SubtaskItem[];
  relatedTask?: { key: string; title: string };
  activities: { id: string; author: string; action: string; time: string }[];
}

interface TaskDetailModalProps {
  task: TaskDetailData | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateTask: (updated: TaskDetailData) => void;
  onDeleteTask?: (taskId: string) => void;
  members?: { id: string; name: string; email: string; role?: string }[];
  currentUserName?: string;
}

export function TaskDetailModal({
  task,
  isOpen,
  onClose,
  onUpdateTask,
  onDeleteTask,
  members = [],
  currentUserName = "Haberry Studio",
}: TaskDetailModalProps) {
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [status, setStatus] = useState(task?.status || "todo");
  const [priority, setPriority] = useState(task?.priority || "none");
  const [assignee, setAssignee] = useState(task?.assignee || "Haberry Studio");
  const [subtasks, setSubtasks] = useState<SubtaskItem[]>(task?.subtasks || []);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [showAddSubtask, setShowAddSubtask] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setStatus(task.status);
      setPriority(task.priority);
      setAssignee(task.assignee || "Haberry Studio");
      setSubtasks(task.subtasks || []);
    }
  }, [task]);

  if (!isOpen || !task) return null;

  // Sync edits back
  const handleTitleChange = (val: string) => {
    setTitle(val);
    onUpdateTask({ ...task, title: val });
  };

  const handleDescriptionChange = (val: string) => {
    setDescription(val);
    onUpdateTask({ ...task, description: val });
  };

  const handleStatusChange = (newStatus: "todo" | "in_progress" | "in_review" | "done") => {
    setStatus(newStatus);
    onUpdateTask({ ...task, status: newStatus });
  };

  const handlePriorityChange = (newPriority: "none" | "low" | "medium" | "high" | "urgent") => {
    setPriority(newPriority);
    onUpdateTask({ ...task, priority: newPriority });
  };

  const handleAssigneeChange = (newAssignee: string) => {
    setAssignee(newAssignee);
    onUpdateTask({ ...task, assignee: newAssignee });
  };

  const handleToggleSubtask = (subId: string) => {
    const updated = subtasks.map((s) =>
      s.id === subId ? { ...s, completed: !s.completed } : s
    );
    setSubtasks(updated);
    onUpdateTask({ ...task, subtasks: updated });
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    const newSub: SubtaskItem = {
      id: `sub-${Date.now()}`,
      title: newSubtaskTitle.trim(),
      completed: false,
    };
    const updated = [...subtasks, newSub];
    setSubtasks(updated);
    onUpdateTask({ ...task, subtasks: updated });
    setNewSubtaskTitle("");
    setShowAddSubtask(false);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const creatorDisplayName =
    task.creatorName ||
    task.activities?.find((a) => a.action.toLowerCase().includes("created"))?.author ||
    "Haberry Studio";

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
      <div className="w-full max-w-3xl bg-[#111215] border-l border-zinc-800 flex flex-col h-full shadow-2xl overflow-hidden font-sans">
        {/* Top Header Bar */}
        <div className="h-12 border-b border-zinc-800/80 px-6 flex items-center justify-between shrink-0 bg-[#0e0e11]">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <span className="text-zinc-500 font-medium">{task.project}</span>
            <span className="text-zinc-600">&gt;</span>
            <span className="text-zinc-200 font-mono font-semibold">{task.key}</span>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 text-zinc-400">
            <button
              type="button"
              onClick={handleCopyLink}
              title="Copy task link"
              className="p-1.5 rounded hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
            >
              <LinkIcon className="w-3.5 h-3.5" />
            </button>
            {copiedLink && (
              <span className="text-[10px] text-emerald-400 font-medium">Copied!</span>
            )}

            <button
              type="button"
              title="Add relation"
              className="p-1.5 rounded hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
            >
              <GitBranch className="w-3.5 h-3.5" />
            </button>

            {onDeleteTask && (
              <button
                type="button"
                onClick={() => {
                  onDeleteTask(task.id);
                  onClose();
                }}
                title="Delete task"
                className="p-1.5 rounded hover:bg-zinc-800 hover:text-red-400 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}

            <div className="h-4 w-px bg-zinc-800 mx-1" />

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body: Left Details & Right Metadata Sidebar */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* LEFT: Task Content */}
          <div className="flex-1 p-6 md:p-8 overflow-y-auto space-y-7 border-r border-zinc-800/60">
            {/* Title (Inline editable) */}
            <div>
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full bg-transparent text-xl md:text-2xl font-bold text-white tracking-tight border-b border-transparent hover:border-zinc-800 focus:border-zinc-600 focus:outline-none transition-colors py-1"
                placeholder="Task title"
              />
            </div>

            {/* Description */}
            <div className="relative group">
              <textarea
                rows={3}
                value={description}
                onChange={(e) => handleDescriptionChange(e.target.value)}
                placeholder="Add a description for your task..."
                className="w-full bg-transparent text-xs text-zinc-300 leading-relaxed placeholder-zinc-500 rounded-lg p-2 border border-transparent hover:border-zinc-800/80 focus:border-zinc-700 focus:outline-none resize-none transition-colors"
              />
              <Paperclip className="w-3.5 h-3.5 text-zinc-600 absolute right-3 bottom-3" />
            </div>

            {/* Sub-tasks Section */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-400">Sub-tasks</span>
                <button
                  type="button"
                  onClick={() => setShowAddSubtask(!showAddSubtask)}
                  className="text-zinc-500 hover:text-white p-1 rounded cursor-pointer"
                  title="Add subtask"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {subtasks.length === 0 && !showAddSubtask ? (
                <p className="text-xs text-zinc-600 italic">No subtasks yet</p>
              ) : (
                <div className="space-y-1.5">
                  {subtasks.map((sub) => (
                    <div
                      key={sub.id}
                      onClick={() => handleToggleSubtask(sub.id)}
                      className="flex items-center gap-2.5 py-1.5 px-2 rounded-lg hover:bg-zinc-800/40 cursor-pointer text-xs"
                    >
                      {sub.completed ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Circle className="w-3.5 h-3.5 text-zinc-500" />
                      )}
                      <span
                        className={
                          sub.completed ? "line-through text-zinc-500" : "text-zinc-300"
                        }
                      >
                        {sub.title}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {showAddSubtask && (
                <form onSubmit={handleAddSubtask} className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    autoFocus
                    placeholder="Subtask title..."
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg bg-[#0e0e11] border border-zinc-700 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-lg bg-white text-zinc-950 font-semibold text-xs hover:bg-zinc-200 cursor-pointer"
                  >
                    Add
                  </button>
                </form>
              )}
            </div>

            {/* Relations Section */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-400">Relations 1</span>
                <button
                  type="button"
                  className="text-zinc-500 hover:text-white p-1 rounded cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#141518] border border-zinc-800/80 text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-mono text-zinc-400">
                    {task.relatedTask?.key || "HAB-6"}
                  </span>
                  <span className="text-zinc-200">
                    {task.relatedTask?.title || "dfgh"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-zinc-800 text-zinc-400 border border-zinc-700">
                    Related
                  </span>
                  <HaberryAvatar className="w-4 h-4 text-[5px]" text="h" />
                </div>
              </div>
            </div>

            {/* Resources Section */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-400">Resources</span>
                <button
                  type="button"
                  className="text-zinc-500 hover:text-white p-1 rounded cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs text-zinc-600 italic">No resources linked to this task.</p>
            </div>

            {/* Activity Stream Section */}
            <div className="space-y-3 pt-4 border-t border-zinc-800/80">
              <span className="text-xs font-semibold text-white block">Activity</span>

              <div className="space-y-3">
                {task.activities?.map((act) => (
                  <div key={act.id} className="flex items-start gap-2.5 text-xs">
                    <HaberryAvatar className="w-5 h-5 text-[6px] mt-0.5" text="h" />
                    <div>
                      <p className="text-zinc-300">
                        <strong className="text-white font-medium">{act.author}</strong>{" "}
                        <span className="text-zinc-400">{act.action}</span>
                      </p>
                      <span className="text-[10px] text-zinc-500">{act.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: Metadata Sidebar */}
          <div className="w-full md:w-64 p-6 bg-[#0e0e11] space-y-5 text-xs shrink-0 select-none">
            {/* Status */}
            <div className="flex items-center justify-between">
              <span className="text-zinc-500">Status</span>
              <select
                value={status}
                onChange={(e) =>
                  handleStatusChange(
                    e.target.value as "todo" | "in_progress" | "in_review" | "done"
                  )
                }
                className="bg-[#141518] border border-zinc-800 text-zinc-200 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-zinc-600 cursor-pointer"
              >
                <option value="todo">○ To Do</option>
                <option value="in_progress">◐ In Progress</option>
                <option value="in_review">◑ In Review</option>
                <option value="done">● Done</option>
              </select>
            </div>

            {/* Priority */}
            <div className="flex items-center justify-between">
              <span className="text-zinc-500">Priority</span>
              <select
                value={priority}
                onChange={(e) =>
                  handlePriorityChange(
                    e.target.value as "none" | "low" | "medium" | "high" | "urgent"
                  )
                }
                className="bg-[#141518] border border-zinc-800 text-zinc-200 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-zinc-600 cursor-pointer"
              >
                <option value="none">— No priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            {/* Assignee */}
            <div className="flex items-center justify-between">
              <span className="text-zinc-500">Assignee</span>
              <select
                value={assignee}
                onChange={(e) => handleAssigneeChange(e.target.value)}
                className="bg-[#141518] border border-zinc-800 text-zinc-200 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-zinc-600 cursor-pointer max-w-[130px] truncate"
              >
                <option value={currentUserName}>{currentUserName}</option>
                {members
                  ?.filter((m) => m.name !== currentUserName)
                  .map((m) => (
                    <option key={m.id} value={m.name}>
                      {m.name}
                    </option>
                  ))}
                <option value="Unassigned">Unassigned</option>
              </select>
            </div>

            {/* Created by */}
            <div className="flex items-center justify-between">
              <span className="text-zinc-500">Created by</span>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#141518] border border-zinc-800 text-zinc-300">
                <HaberryAvatar className="w-3.5 h-3.5 text-[5px]" text="h" />
                <span className="truncate max-w-[110px] text-zinc-200 font-medium">
                  {creatorDisplayName}
                </span>
              </div>
            </div>

            {/* Labels */}
            <div className="flex items-center justify-between">
              <span className="text-zinc-500">Labels</span>
              <button
                type="button"
                className="flex items-center gap-1 text-zinc-400 hover:text-white cursor-pointer"
              >
                <Tag className="w-3.5 h-3.5" />
                <span>Add labels</span>
              </button>
            </div>

            {/* Dates */}
            <div className="flex items-center justify-between">
              <span className="text-zinc-500">Dates</span>
              <div className="flex items-center gap-2 text-zinc-400">
                <button
                  type="button"
                  className="flex items-center gap-1 hover:text-white cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Start</span>
                </button>
                <span>·</span>
                <button
                  type="button"
                  className="hover:text-white cursor-pointer"
                >
                  Due date
                </button>
              </div>
            </div>

            {/* Project */}
            <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80">
              <span className="text-zinc-500">Project</span>
              <span className="font-medium text-white truncate max-w-[120px]">
                {task.project}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
