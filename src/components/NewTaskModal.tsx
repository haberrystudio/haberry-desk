"use client";

import React, { useState } from "react";
import {
  X,
  Paperclip,
  FolderKanban,
  Clock,
  Calendar,
  User,
  Tag,
  Check,
} from "lucide-react";

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectName: string;
  defaultStatus?: "todo" | "in_progress" | "in_review" | "done";
  onCreateTask: (task: {
    title: string;
    description: string;
    status: "todo" | "in_progress" | "in_review" | "done";
    priority: "none" | "low" | "medium" | "high" | "urgent";
    assignee: string;
    createMore: boolean;
  }) => void;
}

export function NewTaskModal({
  isOpen,
  onClose,
  projectName,
  defaultStatus = "todo",
  onCreateTask,
}: NewTaskModalProps) {
  if (!isOpen) return null;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"todo" | "in_progress" | "in_review" | "done">(defaultStatus);
  const [priority, setPriority] = useState<"none" | "low" | "medium" | "high" | "urgent">("none");
  const [createMore, setCreateMore] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onCreateTask({
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      assignee: "Haberry Studio",
      createMore,
    });

    if (createMore) {
      setTitle("");
      setDescription("");
    } else {
      setTitle("");
      setDescription("");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-150">
      <div className="bg-[#141417] border border-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden font-sans">
        {/* Header */}
        <div className="px-6 pt-5 pb-2 flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="font-mono text-zinc-500">TASK</span>
            <span className="text-zinc-600">&gt;</span>
            <span className="text-white font-medium">New Task</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-zinc-500 hover:text-white p-1 rounded cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {/* Title */}
          <div>
            <input
              type="text"
              required
              autoFocus
              placeholder="Task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-transparent text-xl font-bold text-white placeholder-zinc-500 focus:outline-none"
            />
          </div>

          {/* Description */}
          <div className="relative">
            <textarea
              rows={4}
              placeholder="Add a description for your task..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-transparent text-xs text-zinc-300 placeholder-zinc-500 leading-relaxed focus:outline-none resize-none"
            />
            <Paperclip className="w-4 h-4 text-zinc-600 absolute right-1 bottom-2 cursor-pointer hover:text-zinc-400" />
          </div>

          {/* Metadata Action Toolbar (Matching Screenshot 3) */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-zinc-800/70 text-xs">
            {/* Project Picker */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#0e0e11] border border-zinc-800 text-zinc-300">
              <FolderKanban className="w-3.5 h-3.5 text-zinc-500" />
              <span className="truncate max-w-[120px]">{projectName}</span>
            </div>

            {/* Status Picker */}
            <select
              value={status}
              onChange={(e) =>
                setStatus(
                  e.target.value as "todo" | "in_progress" | "in_review" | "done"
                )
              }
              className="px-2.5 py-1.5 rounded-lg bg-[#0e0e11] border border-zinc-800 text-zinc-300 focus:outline-none cursor-pointer"
            >
              <option value="todo">Planned (To Do)</option>
              <option value="in_progress">In Progress</option>
              <option value="in_review">In Review</option>
              <option value="done">Done</option>
            </select>

            {/* Priority Picker */}
            <select
              value={priority}
              onChange={(e) =>
                setPriority(
                  e.target.value as "none" | "low" | "medium" | "high" | "urgent"
                )
              }
              className="px-2.5 py-1.5 rounded-lg bg-[#0e0e11] border border-zinc-800 text-zinc-300 focus:outline-none cursor-pointer"
            >
              <option value="none">— No priority</option>
              <option value="low">Low priority</option>
              <option value="medium">Medium priority</option>
              <option value="high">High priority</option>
              <option value="urgent">Urgent</option>
            </select>

            <button
              type="button"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#0e0e11] border border-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
            >
              <User className="w-3.5 h-3.5" />
              <span>Assign</span>
            </button>

            <button
              type="button"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#0e0e11] border border-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
            >
              <Tag className="w-3.5 h-3.5" />
              <span>Labels</span>
            </button>
          </div>

          {/* Footer Bar */}
          <div className="pt-4 flex items-center justify-between border-t border-zinc-800/80">
            <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={createMore}
                onChange={(e) => setCreateMore(e.target.checked)}
                className="w-3.5 h-3.5 rounded bg-zinc-800 border-zinc-700 text-white accent-white cursor-pointer"
              />
              <span>Create more</span>
            </label>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-lg border border-zinc-800 text-xs text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!title.trim()}
                className="px-4 py-2 rounded-lg bg-white hover:bg-zinc-200 disabled:opacity-40 text-zinc-950 font-semibold text-xs transition-colors cursor-pointer shadow-sm"
              >
                Create Task
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

