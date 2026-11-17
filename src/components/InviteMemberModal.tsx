"use client";

import React, { useState } from "react";
import { X, Mail, Check, Copy, Loader2, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  workspaceName: string;
  projectName: string;
  inviterName: string;
  onInvitationSent?: (inv: { id: string; email: string; role: string }) => void;
}

export function InviteMemberModal({
  isOpen,
  onClose,
  workspaceId,
  workspaceName,
  projectName,
  inviterName,
  onInvitationSent,
}: InviteMemberModalProps) {
  if (!isOpen) return null;

  const [email, setEmail] = useState("");
  const [accessType, setAccessType] = useState<"all" | "selected">("all");
  const [projectSelected, setProjectSelected] = useState(true);
  const [role, setRole] = useState<"admin" | "member" | "viewer">("member");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedInviteLink, setGeneratedInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    const inviteId = `inv-${Math.random().toString(36).substring(2, 9)}`;
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const inviteRecord = {
      id: inviteId,
      workspaceId,
      workspaceName,
      inviterName: inviterName || "Haberry Studio",
      email: email.trim(),
      role,
      projectAccess: accessType,
      expiresAt,
      status: "pending",
    };

    // Store in localStorage for fast local availability
    try {
      localStorage.setItem(`invitation_${inviteId}`, JSON.stringify(inviteRecord));
      const existing = JSON.parse(localStorage.getItem(`all_invitations_${workspaceId}`) || "[]");
      existing.push(inviteRecord);
      localStorage.setItem(`all_invitations_${workspaceId}`, JSON.stringify(existing));
    } catch {}

    // Persist to Supabase workspace_invitations table
    try {
      const supabase = createClient();
      await supabase.from("workspace_invitations").insert({
        id: inviteId,
        workspace_id: workspaceId,
        workspace_name: workspaceName,
        inviter_name: inviterName || "Haberry Studio",
        email: email.trim(),
        role,
        project_access: accessType,
        status: "pending",
        expires_at: expiresAt,
      });
    } catch {}

    const link = `${window.location.origin}/invite/${inviteId}`;
    setGeneratedInviteLink(link);
    setIsLoading(false);

    if (onInvitationSent) {
      onInvitationSent({ id: inviteId, email: email.trim(), role });
    }
  };

  const handleCopyLink = () => {
    if (!generatedInviteLink) return;
    navigator.clipboard.writeText(generatedInviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-150">
      <div className="bg-[#141417] border border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden font-sans">
        {/* Header (Matching Screenshot 4) */}
        <div className="p-6 pb-4 flex items-center justify-between border-b border-zinc-800/80">
          <h3 className="text-base font-semibold text-white">Invite Team Member</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-500 hover:text-white p-1 rounded cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {generatedInviteLink ? (
          // Success & Invite Link Display
          <div className="p-6 space-y-5">
            <div className="text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-400 flex items-center justify-center mx-auto">
                <Check className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-semibold text-white">Invitation Created!</h4>
              <p className="text-xs text-zinc-400">
                Share this link with <strong className="text-white">{email}</strong> to join {workspaceName}:
              </p>
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#0e0e11] border border-zinc-800">
              <input
                type="text"
                readOnly
                value={generatedInviteLink}
                className="w-full bg-transparent text-xs font-mono text-zinc-300 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3 py-1 rounded bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setGeneratedInviteLink(null);
                  setEmail("");
                  onClose();
                }}
                className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          // Main Invite Form
          <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs">
            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-zinc-300">Email</label>
              <input
                type="email"
                required
                autoFocus
                placeholder="colleague@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#0e0e11] border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-colors"
              />
            </div>

            {/* Role selection */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-zinc-300">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as "admin" | "member" | "viewer")}
                className="w-full px-3 py-2 rounded-lg bg-[#0e0e11] border border-zinc-800 text-white focus:outline-none cursor-pointer"
              >
                <option value="member">Member (Can create, edit, and move tasks)</option>
                <option value="admin">Admin (Full project and member management)</option>
                <option value="viewer">Viewer (Read-only access)</option>
              </select>
            </div>

            {/* Project Access (Matching Screenshot 4) */}
            <div className="space-y-2.5 pt-1">
              <label className="block text-xs font-medium text-zinc-300">
                Project access
                <span className="block text-[11px] text-zinc-500 font-normal">
                  Choose which projects this person can see.
                </span>
              </label>

              <div className="space-y-2">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="radio"
                    name="project_access"
                    checked={accessType === "all"}
                    onChange={() => setAccessType("all")}
                    className="mt-0.5 accent-white cursor-pointer"
                  />
                  <div>
                    <span className="text-zinc-200 font-medium block">All projects</span>
                    <span className="text-zinc-500 text-[11px] block">
                      Access every project in this workspace, including new ones.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="radio"
                    name="project_access"
                    checked={accessType === "selected"}
                    onChange={() => setAccessType("selected")}
                    className="mt-0.5 accent-white cursor-pointer"
                  />
                  <div>
                    <span className="text-zinc-200 font-medium block">Selected projects</span>
                    <span className="text-zinc-500 text-[11px] block">
                      Only access the projects you choose.
                    </span>
                  </div>
                </label>
              </div>

              {accessType === "selected" && (
                <div className="pl-6 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
                    <input
                      type="checkbox"
                      checked={projectSelected}
                      onChange={(e) => setProjectSelected(e.target.checked)}
                      className="rounded accent-white cursor-pointer"
                    />
                    <span>{projectName}</span>
                  </label>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="pt-4 flex items-center justify-end gap-2.5 border-t border-zinc-800/80">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-lg border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isLoading || !email.trim()}
                className="px-4 py-2 rounded-lg bg-white hover:bg-zinc-200 disabled:opacity-50 text-zinc-950 font-semibold text-xs transition-colors cursor-pointer shadow-sm flex items-center gap-1.5"
              >
                {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-950" />}
                <span>Send Invitation</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

