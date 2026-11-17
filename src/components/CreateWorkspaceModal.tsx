"use client";

import React, { useState } from "react";
import { Loader2 } from "lucide-react";

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateWorkspace: (name: string, description: string) => Promise<void> | void;
}

export function CreateWorkspaceModal({
  isOpen,
  onClose,
  onCreateWorkspace,
}: CreateWorkspaceModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onCreateWorkspace(name.trim(), description.trim());
      setName("");
      setDescription("");
      onClose();
    } catch (err) {
      console.error("Failed to create workspace:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-150">
      <div className="bg-[#141417] border border-zinc-800/90 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden font-sans p-6 sm:p-7 space-y-6">
        {/* Header Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs">
          <span className="font-mono text-zinc-500 uppercase tracking-wider text-[11px] font-semibold">
            HABERRY
          </span>
          <span className="text-zinc-600 font-normal">&gt;</span>
          <span className="text-white font-medium">Create a new workspace</span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              required
              autoFocus
              placeholder="Workspace name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-transparent text-2xl sm:text-[26px] font-bold text-white placeholder-zinc-500 focus:outline-none tracking-tight leading-tight"
            />
          </div>

          <div>
            <textarea
              rows={2}
              placeholder="Add description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-transparent text-sm text-zinc-300 placeholder-zinc-500 focus:outline-none resize-none leading-relaxed"
            />
          </div>

          {/* Action Buttons in Footer */}
          <div className="pt-4 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2 rounded-full border border-zinc-700/80 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || isSubmitting}
              className="px-5 py-2 rounded-full bg-white hover:bg-zinc-200 disabled:opacity-40 text-zinc-950 text-xs font-semibold cursor-pointer transition-colors shadow-sm flex items-center gap-1.5"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Create Workspace</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
