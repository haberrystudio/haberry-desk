"use client";

import React, { useState } from "react";
import {
  GitPullRequest,
  Calendar,
  Server,
  Bot,
  Zap,
  FileText,
  Keyboard,
  ShieldCheck,
  Check,
  ArrowRight,
} from "lucide-react";

export function Features() {
  const [activeFeature, setActiveFeature] = useState(0);

  const featureTabs = [
    {
      title: "GitHub 2-Way Sync",
      icon: GitPullRequest,
      tagline: "Close tasks with git commits. No manual bookkeeping.",
      desc: "Haberry Desk talks directly to GitHub and Gitea. When a developer opens a pull request, links an issue, or merges code with 'Fixes #42', Haberry Desk automatically updates the board card in sub-seconds.",
      highlights: [
        "Automatic branch creation directly from tasks",
        "PR status and review approvals mirrored on card badges",
        "Zero-latency webhooks for instant state transitions",
      ],
      badge: "Developer Native",
    },
    {
      title: "Interactive Gantt Timelines",
      icon: Calendar,
      tagline: "Roadmaps without the spreadsheet nightmare.",
      desc: "Drag-and-drop timeline dependencies that recalculate downstream dates automatically. Spot critical path bottlenecks before they delay your release.",
      highlights: [
        "Visual task dependencies with auto-snapping",
        "Milestones and sprint capacity forecasting",
        "Export vector roadmaps for stakeholders with one click",
      ],
      badge: "Zero Spreadsheet Chaos",
    },
    {
      title: "Self-Host or Haberry Desk Cloud",
      icon: Server,
      tagline: "Run on your servers, or let us handle the devops.",
      desc: "Deploy Haberry Desk on your own infrastructure with a single Docker Compose file and retain 100% data ownership. Or use Haberry Desk Cloud for automatic backups, instant updates, and zero maintenance.",
      highlights: [
        "MIT-licensed open source code base",
        "Single-container Docker deploy with SQLite or Postgres",
        "Automated encrypted daily snapshots on Haberry Desk Cloud",
      ],
      badge: "100% Data Ownership",
    },
    {
      title: "Model Context Protocol (MCP)",
      icon: Bot,
      tagline: "The first project tracker built for AI coding agents.",
      desc: "Equipped with a built-in MCP server. Claude Code, Cursor, Windsurf, or Antigravity can read your tasks, create subtasks from design specs, and update progress automatically.",
      highlights: [
        "Native JSON-RPC / stdio and SSE transport support",
        "Coding agents inspect sprint context before writing code",
        "Auto-generate pull request descriptions from task specs",
      ],
      badge: "AI-Ready",
    },
  ];

  return (
    <section id="features" className="py-20 md:py-28 relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="max-w-3xl text-left mb-16">
          <div className="text-xs uppercase font-mono tracking-widest text-zinc-400 mb-3">
            Core Philosophy
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-white tracking-tight leading-[1.15]">
            Everything your team needs to ship.
            <br />
            <span className="text-zinc-500">Nothing to slow you down.</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-zinc-400 max-w-2xl leading-relaxed">
            Most project management software becomes a full-time administrative burden. Haberry Desk is engineered with extreme minimalism and deep developer workflow integration.
          </p>
        </div>

        {/* Feature Spotlight Carousel / Tabs */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mb-20">
          {/* Left: Tab Selectors */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-3">
            {featureTabs.map((tab, idx) => {
              const Icon = tab.icon;
              const isActive = activeFeature === idx;
              return (
                <button
                  key={tab.title}
                  onClick={() => setActiveFeature(idx)}
                  className={`text-left p-5 rounded-xl border transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-zinc-900/90 border-zinc-700 shadow-xl shadow-black/50"
                      : "bg-[#111114]/40 border-zinc-800/60 hover:bg-[#151519] hover:border-zinc-700/60"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          isActive
                            ? "bg-white text-zinc-950"
                            : "bg-zinc-800 text-zinc-400"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span
                        className={`font-medium text-sm sm:text-base ${
                          isActive ? "text-white" : "text-zinc-300"
                        }`}
                      >
                        {tab.title}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-800/80 text-zinc-400">
                      {tab.badge}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-400 line-clamp-2 pl-11">
                    {tab.tagline}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Right: Active Tab Preview Panel */}
          <div className="lg:col-span-7 bg-[#111114] border border-zinc-800 rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl">
            <div>
              <div className="inline-block text-xs font-mono px-2.5 py-1 rounded bg-zinc-800 text-zinc-300 border border-zinc-700 mb-4">
                {featureTabs[activeFeature].badge}
              </div>

              <h3 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight mb-3">
                {featureTabs[activeFeature].tagline}
              </h3>

              <p className="text-zinc-300 text-sm sm:text-base leading-relaxed mb-6">
                {featureTabs[activeFeature].desc}
              </p>

              <div className="space-y-3 pt-4 border-t border-zinc-800/80">
                {featureTabs[activeFeature].highlights.map((item) => (
                  <div key={item} className="flex items-center gap-3 text-sm text-zinc-300">
                    <div className="w-4 h-4 rounded-full bg-emerald-950 border border-emerald-700 flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5 text-emerald-400" />
                    </div>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-zinc-800/60 flex items-center justify-between">
              <span className="text-xs text-zinc-500 font-mono">
                Featured in Haberry Desk Core & Haberry Desk Cloud
              </span>
              <a
                href="#product-demo"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-white hover:text-zinc-300 transition-colors"
              >
                <span>Try live demo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* 6-Card Grid: The Developer Experience */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl bg-[#111114]/60 border border-zinc-800/80 hover:border-zinc-700 transition-all">
            <div className="p-2.5 w-fit rounded-lg bg-zinc-800 text-zinc-200 mb-4">
              <Zap className="w-5 h-5 text-amber-400" />
            </div>
            <h4 className="text-base font-semibold text-white mb-2">Sub-50ms Interaction Latency</h4>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Every action runs through an optimistic UI layer. Dragging a card, renaming a task, or adding tags feels instant.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-[#111114]/60 border border-zinc-800/80 hover:border-zinc-700 transition-all">
            <div className="p-2.5 w-fit rounded-lg bg-zinc-800 text-zinc-200 mb-4">
              <Keyboard className="w-5 h-5 text-purple-400" />
            </div>
            <h4 className="text-base font-semibold text-white mb-2">Keyboard-First Command Palette</h4>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Press ⌘K or Ctrl+K anywhere. Navigate workspaces, assign teammates, filter sprints, or toggle dark contrast without touching your mouse.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-[#111114]/60 border border-zinc-800/80 hover:border-zinc-700 transition-all">
            <div className="p-2.5 w-fit rounded-lg bg-zinc-800 text-zinc-200 mb-4">
              <FileText className="w-5 h-5 text-blue-400" />
            </div>
            <h4 className="text-base font-semibold text-white mb-2">Full Markdown & Code Embeds</h4>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Task descriptions support full syntax-highlighted code blocks, tables, task checklists, and GitHub issue back-references.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-[#111114]/60 border border-zinc-800/80 hover:border-zinc-700 transition-all">
            <div className="p-2.5 w-fit rounded-lg bg-zinc-800 text-zinc-200 mb-4">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <h4 className="text-base font-semibold text-white mb-2">No 50-Step Jira Permissions</h4>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Sensible role-based access without complex permission schemes. Invite teammates with simple Member or Admin roles.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-[#111114]/60 border border-zinc-800/80 hover:border-zinc-700 transition-all">
            <div className="p-2.5 w-fit rounded-lg bg-zinc-800 text-zinc-200 mb-4">
              <Server className="w-5 h-5 text-cyan-400" />
            </div>
            <h4 className="text-base font-semibold text-white mb-2">Instant Docker Deploy</h4>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Spin up your own instance with SQLite for a solo setup or PostgreSQL for high concurrency. Run behind your company VPN.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-[#111114]/60 border border-zinc-800/80 hover:border-zinc-700 transition-all">
            <div className="p-2.5 w-fit rounded-lg bg-zinc-800 text-zinc-200 mb-4">
              <Bot className="w-5 h-5 text-rose-400" />
            </div>
            <h4 className="text-base font-semibold text-white mb-2">Open API & Webhooks</h4>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Standard REST endpoints and incoming/outgoing webhooks let you pipe events to Discord, Slack, CI/CD runners, or custom bots.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

