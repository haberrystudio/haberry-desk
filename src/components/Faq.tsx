"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "Is there a credit card required for the Haberry Desk Cloud trial?",
      a: "No. You can start a 14-day full-featured Haberry Desk Cloud trial with just an email address or your GitHub account. No credit card is required upfront.",
    },
    {
      q: "Can I migrate between the self-hosted version and Haberry Desk Cloud?",
      a: "Yes. Haberry Desk has built-in one-click backup and JSON/SQL export tools. You can move your entire database, projects, and task history from self-hosted Docker to Haberry Desk Cloud (or vice versa) in minutes.",
    },
    {
      q: "How does the two-way GitHub sync work?",
      a: "Haberry Desk connects to your GitHub repositories via standard webhooks. You can link issues directly to Haberry Desk cards, auto-create Git branches from tasks, and Haberry Desk automatically closes or moves tasks when pull requests are created, reviewed, or merged (e.g. using 'Fixes #123').",
    },
    {
      q: "What is the Model Context Protocol (MCP) integration?",
      a: "Model Context Protocol (MCP) is an open standard that allows AI coding assistants (like Claude Code, Cursor, Windsurf, or Antigravity) to communicate with external tools. Haberry Desk includes a built-in MCP server, enabling AI assistants to inspect active sprint tasks, plan work, update task statuses, and append notes directly without leaving the terminal or editor.",
    },
    {
      q: "What database does Haberry Desk support for self-hosting?",
      a: "Haberry Desk supports both SQLite (ideal for solo engineers or small teams with zero database setup) and PostgreSQL (for higher concurrency, high-availability deployments, and team clusters).",
    },
    {
      q: "Can I migrate our existing tasks from Jira or Linear?",
      a: "Yes. Haberry Desk includes CSV and JSON importers for both Jira and Linear, preserving task titles, descriptions, priorities, labels, and markdown formatting.",
    },
  ];

  return (
    <section id="faq" className="py-20 md:py-28 border-t border-zinc-800/60">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <div className="text-left mb-12">
          <div className="text-xs uppercase font-mono tracking-widest text-zinc-400 mb-2">
            Frequently Asked Questions
          </div>
          <h2 className="text-3xl font-semibold text-white tracking-tight">
            Everything you need to know.
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={faq.q}
                className="rounded-xl border border-zinc-800 bg-[#111114] overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left text-zinc-200 hover:text-white font-medium text-sm sm:text-base cursor-pointer focus:outline-none"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-zinc-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-white" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-zinc-400 leading-relaxed border-t border-zinc-800/40 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

