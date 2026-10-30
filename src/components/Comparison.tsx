import React from "react";
import { Check } from "lucide-react";

export function Comparison() {
  const comparisonItems = [
    {
      feature: "Setup time",
      haberry: "< 2 minutes",
      jira: "3+ weeks of admin training",
      linear: "5 minutes",
    },
    {
      feature: "Two-way GitHub/Gitea Sync",
      haberry: "Native & included",
      jira: "Paid third-party plugin",
      linear: "GitHub only (proprietary)",
    },
    {
      feature: "Self-Hostable with Docker",
      haberry: "100% Free & Open Source (MIT)",
      jira: "Discontinued / Enterprise Data Center ($$$$)",
      linear: "No (Cloud lock-in)",
    },
    {
      feature: "Model Context Protocol (MCP) for AI",
      haberry: "Built-in stdio / SSE server",
      jira: "No native MCP",
      linear: "Limited API",
    },
    {
      feature: "Interactive Gantt Timelines",
      haberry: "Included out of the box",
      jira: "Requires Advanced Roadmaps addon",
      linear: "Roadmaps view (Pro plan)",
    },
    {
      feature: "Page Load & Interaction Speed",
      haberry: "< 50ms latency",
      jira: "2.5s – 5.0s typical load",
      linear: "Fast (< 100ms)",
    },
    {
      feature: "Data Privacy & Control",
      haberry: "100% Free & Open Source (Self-Host or Cloud)",
      jira: "Proprietary vendor lock-in",
      linear: "Cloud-only vendor lock-in",
    },
  ];

  return (
    <section id="comparison" className="py-20 bg-[#0a0a0d] border-y border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="max-w-3xl mb-12">
          <div className="text-xs uppercase font-mono tracking-widest text-zinc-400 mb-2">
            Honest Comparison
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight">
            Why teams ditch Jira for Haberry Desk.
          </h2>
          <p className="mt-3 text-zinc-400 text-sm sm:text-base">
            No mandatory 20-field Jira forms. No vendor lock-in. Just clean boards, roadmaps, and instant GitHub sync.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-[#111114]">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/60 text-xs font-mono uppercase tracking-wider text-zinc-400">
                <th className="py-4 px-6 font-semibold">Capability</th>
                <th className="py-4 px-6 font-semibold text-white bg-zinc-800/50">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>Haberry Desk</span>
                  </div>
                </th>
                <th className="py-4 px-6 font-semibold text-zinc-400">Jira</th>
                <th className="py-4 px-6 font-semibold text-zinc-400">Linear</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-sans">
              {comparisonItems.map((item, idx) => (
                <tr
                  key={item.feature}
                  className={`hover:bg-zinc-900/30 transition-colors ${
                    idx % 2 === 0 ? "bg-[#111114]" : "bg-[#0e0e11]"
                  }`}
                >
                  <td className="py-4 px-6 text-zinc-300 font-medium">{item.feature}</td>
                  <td className="py-4 px-6 text-white font-medium bg-zinc-800/30 border-x border-zinc-800/50">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{item.haberry}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-zinc-400">{item.jira}</td>
                  <td className="py-4 px-6 text-zinc-400">{item.linear}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
