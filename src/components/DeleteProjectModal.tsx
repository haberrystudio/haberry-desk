"use client";

import React, { useState } from "react";
import { AlertTriangle, Loader2, X } from "lucide-react";
import { ProjectItem } from "@/app/dashboard/workspace/[workspaceId]/WorkspaceDashboardClient";

interface DeleteProjectModalProps {
  project: ProjectItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: (projectId: string) => Promise<void> | void;
}

export function DeleteProjectModal({
  project,
  isOpen,
  onClose,
  onConfirmDelete,
}: DeleteProjectModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !project) return null;

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await onConfirmDelete(project.id);
      onClose();
    } catch (err) {
      console.error("Failed to delete project:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-150">
      <div className="bg-[#141417] border border-zinc-800/90 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden font-sans p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-red-400">
            <div className="w-8 h-8 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-red-400" />
            </div>
            <h3 className="text-base font-bold text-white">Delete project</h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-zinc-500 hover:text-white p-1 rounded cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2 text-xs text-zinc-300 leading-relaxed">
          <p>
            Are you sure you want to delete <strong className="text-white font-semibold">{project.name}</strong>?
          </p>
          <p className="text-zinc-500">
            This will permanently remove the project and its tasks. This action cannot be undone.
          </p>
        </div>

        <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-zinc-800/80">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 rounded-full border border-zinc-700 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold cursor-pointer transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-4 py-2 rounded-full bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400 text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5"
          >
            {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>Delete Project</span>
          </button>
        </div>
      </div>
    </div>
  );
}
