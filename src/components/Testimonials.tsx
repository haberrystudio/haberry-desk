import React from "react";
import { Star } from "lucide-react";

export function Testimonials() {
  const testimonials = [
    {
      quote:
        "We migrated our 25-person engineering team from Jira to Haberry Desk in an afternoon. Our developers actually update their tickets now because it takes 2 seconds instead of navigating 10 required fields.",
      author: "Marcus Lindqvist",
      role: "VP of Engineering at HyperScale",
      avatar: "ML",
      bg: "bg-indigo-600",
    },
    {
      quote:
        "The two-way GitHub sync is flawlessly fast. When I open a PR or type 'Fixes #42' in a commit, the Haberry Desk card moves to Done before my CI pipeline finishes running.",
      author: "Priya Sharma",
      role: "Senior Staff Engineer & Open Source Maintainer",
      avatar: "PS",
      bg: "bg-emerald-600",
    },
    {
      quote:
        "Self-hosting Haberry Desk on our private infrastructure took one docker-compose command. Having full data ownership while keeping the speed and aesthetic of a modern app is unmatched.",
      author: "Christian Weber",
      role: "Founder & CTO at StackForge",
      avatar: "CW",
      bg: "bg-violet-600",
    },
  ];

  return (
    <section className="py-20 border-t border-zinc-800/60">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="text-left max-w-2xl mb-12">
          <div className="text-xs uppercase font-mono tracking-widest text-zinc-400 mb-2">
            Social Proof
          </div>
          <h2 className="text-3xl font-semibold text-white tracking-tight">
            Loved by engineers who ship fast.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.author}
              className="p-6 rounded-xl bg-[#111114] border border-zinc-800/80 flex flex-col justify-between hover:border-zinc-700 transition-colors"
            >
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-zinc-300 leading-relaxed mb-6 font-normal">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-zinc-800/60">
                <div
                  className={`w-8 h-8 rounded-full ${t.bg} text-white font-semibold text-xs flex items-center justify-center shrink-0`}
                >
                  {t.avatar}
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">{t.author}</div>
                  <div className="text-[11px] text-zinc-400">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

