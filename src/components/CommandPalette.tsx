"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Kanban,
  Calendar,
  GitBranch,
  Bot,
  BookOpen,
  Server,
  Code2,
  X,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Trigger open
        }
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const actions = [
    {
      category: "Views",
      items: [
        {
          title: "Jump to Kanban Board",
          icon: Kanban,
          href: "#product-demo",
          badge: "View",
        },
        {
          title: "Jump to Gantt Timeline",
          icon: Calendar,
          href: "#product-demo",
          badge: "View",
        },
        {
          title: "Inspect GitHub 2-Way Sync",
          icon: GitBranch,
          href: "#product-demo",
          badge: "Integration",
        },
        {
          title: "Model Context Protocol (MCP) details",
          icon: Bot,
          href: "#features",
          badge: "AI Agent",
        },
      ],
    },
    {
      category: "Self-Hosting & Open Source",
      items: [
        {
          title: "Deploy via Docker Compose",
          icon: Server,
          href: "#self-hosting",
          badge: "Self-Host",
        },
        {
          title: "Open Haberry Desk GitHub Repository",
          icon: Code2,
          href: "https://github.com",
          external: true,
          badge: "Open Source",
        },
        {
          title: "Read Documentation & FAQ",
          icon: BookOpen,
          href: "#faq",
          badge: "Docs",
        },
      ],
    },
  ];

  const filteredGroups = actions
    .map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        item.title.toLowerCase().includes(query.toLowerCase())
      ),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-xl bg-[#121215] border border-zinc-700/80 rounded-2xl shadow-2xl shadow-black overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-zinc-800">
          <Search className="w-4 h-4 text-zinc-400 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Type a command or search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-white rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[380px] overflow-y-auto p-2 space-y-4">
          {filteredGroups.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-500">
              No matching commands or pages found.
            </div>
          ) : (
            filteredGroups.map((group) => (
              <div key={group.category} className="space-y-1">
                <div className="px-3 py-1 text-[11px] font-mono uppercase tracking-wider text-zinc-500">
                  {group.category}
                </div>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <a
                      key={item.title}
                      href={item.href}
                      target={item.external ? "_blank" : undefined}
                      rel={item.external ? "noopener noreferrer" : undefined}
                      onClick={() => onClose()}
                      className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-zinc-800/70 text-zinc-300 hover:text-white transition-colors group text-sm cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
                        <span>{item.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 group-hover:text-zinc-300">
                          {item.badge}
                        </span>
                        {item.external ? (
                          <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
                        ) : (
                          <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white transition-transform group-hover:translate-x-0.5" />
                        )}
                      </div>
                    </a>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 bg-[#0e0e11] border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
          <span>Navigate with mouse or touch</span>
          <span>ESC to close</span>
        </div>
      </div>
    </div>
  );
}

