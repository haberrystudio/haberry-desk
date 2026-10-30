import React from "react";
import Link from "next/link";
import { HaberryDeskLogo, GithubIcon, ProductHuntIcon } from "./HaberryDeskLogo";

export function Footer() {
  return (
    <footer className="border-t border-zinc-800/80 bg-[#070709] text-zinc-400 text-xs">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12 mb-12">
          {/* Brand Col */}
          <div className="col-span-2 space-y-4">
            <Link href="/" className="inline-block">
              <HaberryDeskLogo />
            </Link>
            <p className="text-zinc-400 max-w-sm leading-relaxed text-xs">
              Project management that doesn&apos;t become the project. Lightweight, fast, developer-friendly Kanban, Gantt, and GitHub sync.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors border border-zinc-800"
                aria-label="GitHub"
              >
                <GithubIcon className="w-4 h-4" />
              </a>
              <a
                href="https://www.producthunt.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors border border-zinc-800"
                aria-label="Product Hunt"
              >
                <ProductHuntIcon className="w-4 h-4" />
              </a>

              {/* Live operational badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>All systems operational</span>
              </div>
            </div>
          </div>

          {/* Product Col */}
          <div className="space-y-3">
            <div className="text-[11px] uppercase font-mono tracking-wider text-zinc-200 font-semibold">
              Product
            </div>
            <ul className="space-y-2">
              <li>
                <a href="#product-demo" className="hover:text-white transition-colors">
                  Kanban Boards
                </a>
              </li>
              <li>
                <a href="#product-demo" className="hover:text-white transition-colors">
                  Gantt Timelines
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-white transition-colors">
                  GitHub 2-Way Sync
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-white transition-colors">
                  MCP AI Server
                </a>
              </li>
              <li>
                <a href="#comparison" className="hover:text-white transition-colors">
                  Why Haberry Desk
                </a>
              </li>
            </ul>
          </div>

          {/* Resources Col */}
          <div className="space-y-3">
            <div className="text-[11px] uppercase font-mono tracking-wider text-zinc-200 font-semibold">
              Resources
            </div>
            <ul className="space-y-2">
              <li>
                <a href="#docs" className="hover:text-white transition-colors">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#self-hosting" className="hover:text-white transition-colors">
                  Self-Hosting Guide
                </a>
              </li>
              <li>
                <a href="#self-hosting" className="hover:text-white transition-colors">
                  Docker Compose
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-white transition-colors">
                  Frequently Asked Questions
                </a>
              </li>
              <li>
                <a href="#api" className="hover:text-white transition-colors">
                  REST API &amp; Webhooks
                </a>
              </li>
            </ul>
          </div>

          {/* Community & Legal Col */}
          <div className="space-y-3">
            <div className="text-[11px] uppercase font-mono tracking-wider text-zinc-200 font-semibold">
              Legal &amp; Trust
            </div>
            <ul className="space-y-2">
              <li>
                <a href="#privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#terms" className="hover:text-white transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#security" className="hover:text-white transition-colors">
                  Security &amp; Encryption
                </a>
              </li>
              <li>
                <a href="#license" className="hover:text-white transition-colors">
                  MIT Open Source License
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-zinc-800/60 flex flex-wrap items-center justify-between gap-4 text-xs text-zinc-500">
          <div>
            © 2026 Haberry Desk. All rights reserved. Open source under MIT license.
          </div>
          <div className="flex items-center gap-4 text-zinc-400">
            <span>Designed for teams that ship</span>
            <span>•</span>
            <span className="font-mono text-zinc-500">v2.4.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
