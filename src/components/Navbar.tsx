"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { HaberryDeskLogo } from "./HaberryDeskLogo";
import {
  ChevronDown,
  Menu,
  X,
  Kanban,
  GitBranch,
  Calendar,
  Bot,
  BookOpen,
  Server,
  Code2,
  Sparkles,
  ArrowRight,
} from "lucide-react";

interface NavbarProps {
  onOpenCommandPalette?: () => void;
  onOpenAuthModal?: () => void;
}

export function Navbar({ onOpenCommandPalette, onOpenAuthModal }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [productDropdownOpen, setProductDropdownOpen] = useState(false);
  const [resourcesDropdownOpen, setResourcesDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        scrolled
          ? "bg-[#09090b]/85 backdrop-blur-md border-b border-zinc-800/60 shadow-lg shadow-black/20"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12 h-16 sm:h-20 flex items-center justify-between">
        {/* Left: Logo & Navigation */}
        <div className="flex items-center gap-10">
          <Link href="/" className="hover:opacity-90 transition-opacity">
            <HaberryDeskLogo />
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-[14px]">
            {/* Product Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setProductDropdownOpen(true)}
              onMouseLeave={() => setProductDropdownOpen(false)}
            >
              <button
                className="flex items-center gap-1 text-zinc-300 hover:text-white transition-colors py-2 focus:outline-none"
                onClick={() => setProductDropdownOpen(!productDropdownOpen)}
              >
                Product
                <ChevronDown
                  className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${
                    productDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {productDropdownOpen && (
                <div className="absolute top-full -left-4 w-72 pt-2 z-50">
                  <div className="bg-[#121215] border border-zinc-800/90 rounded-xl p-2 shadow-2xl shadow-black/80 backdrop-blur-xl">
                    <a
                      href="#product-demo"
                      onClick={() => setProductDropdownOpen(false)}
                      className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-zinc-800/60 transition-colors group"
                    >
                      <div className="p-2 rounded-md bg-zinc-800/80 text-zinc-200 group-hover:bg-zinc-700/80 group-hover:text-white transition-colors">
                        <Kanban className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-zinc-200 group-hover:text-white">
                          Kanban Boards
                        </div>
                        <div className="text-xs text-zinc-400 leading-snug">
                          Fast, clutter-free task pipelines
                        </div>
                      </div>
                    </a>

                    <a
                      href="#gantt-section"
                      onClick={() => setProductDropdownOpen(false)}
                      className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-zinc-800/60 transition-colors group"
                    >
                      <div className="p-2 rounded-md bg-zinc-800/80 text-zinc-200 group-hover:bg-zinc-700/80 group-hover:text-white transition-colors">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-zinc-200 group-hover:text-white">
                          Gantt Timelines
                        </div>
                        <div className="text-xs text-zinc-400 leading-snug">
                          Roadmaps without spreadsheet chaos
                        </div>
                      </div>
                    </a>

                    <a
                      href="#github-sync"
                      onClick={() => setProductDropdownOpen(false)}
                      className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-zinc-800/60 transition-colors group"
                    >
                      <div className="p-2 rounded-md bg-zinc-800/80 text-zinc-200 group-hover:bg-zinc-700/80 group-hover:text-white transition-colors">
                        <GitBranch className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-zinc-200 group-hover:text-white">
                          GitHub 2-Way Sync
                        </div>
                        <div className="text-xs text-zinc-400 leading-snug">
                          Issues, PRs, and branch status updates
                        </div>
                      </div>
                    </a>

                    <a
                      href="#mcp-section"
                      onClick={() => setProductDropdownOpen(false)}
                      className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-zinc-800/60 transition-colors group"
                    >
                      <div className="p-2 rounded-md bg-zinc-800/80 text-zinc-200 group-hover:bg-zinc-700/80 group-hover:text-white transition-colors">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-zinc-200 group-hover:text-white flex items-center gap-1.5">
                          MCP Server
                          <span className="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                            AI
                          </span>
                        </div>
                        <div className="text-xs text-zinc-400 leading-snug">
                          Connect Cursor, Claude & AI agents
                        </div>
                      </div>
                    </a>
                  </div>
                </div>
              )}
            </div>

            <a
              href="#features"
              className="text-zinc-300 hover:text-white transition-colors"
            >
              Features
            </a>

            <a
              href="#blog"
              className="text-zinc-300 hover:text-white transition-colors"
            >
              Blog
            </a>

            {/* Resources Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setResourcesDropdownOpen(true)}
              onMouseLeave={() => setResourcesDropdownOpen(false)}
            >
              <button
                className="flex items-center gap-1 text-zinc-300 hover:text-white transition-colors py-2 focus:outline-none"
                onClick={() => setResourcesDropdownOpen(!resourcesDropdownOpen)}
              >
                Resources
                <ChevronDown
                  className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${
                    resourcesDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {resourcesDropdownOpen && (
                <div className="absolute top-full -left-4 w-72 pt-2 z-50">
                  <div className="bg-[#121215] border border-zinc-800/90 rounded-xl p-2 shadow-2xl shadow-black/80 backdrop-blur-xl">
                    <a
                      href="#docs"
                      onClick={() => setResourcesDropdownOpen(false)}
                      className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-zinc-800/60 transition-colors group"
                    >
                      <div className="p-2 rounded-md bg-zinc-800/80 text-zinc-200 group-hover:bg-zinc-700/80 group-hover:text-white transition-colors">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-zinc-200 group-hover:text-white">
                          Documentation
                        </div>
                        <div className="text-xs text-zinc-400 leading-snug">
                          Quick start, guides, and API specs
                        </div>
                      </div>
                    </a>

                    <a
                      href="#self-hosting"
                      onClick={() => setResourcesDropdownOpen(false)}
                      className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-zinc-800/60 transition-colors group"
                    >
                      <div className="p-2 rounded-md bg-zinc-800/80 text-zinc-200 group-hover:bg-zinc-700/80 group-hover:text-white transition-colors">
                        <Server className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-zinc-200 group-hover:text-white">
                          Self-Hosting Guide
                        </div>
                        <div className="text-xs text-zinc-400 leading-snug">
                          Deploy in 60s with Docker & Compose
                        </div>
                      </div>
                    </a>

                    <a
                      href="#github"
                      onClick={() => setResourcesDropdownOpen(false)}
                      className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-zinc-800/60 transition-colors group"
                    >
                      <div className="p-2 rounded-md bg-zinc-800/80 text-zinc-200 group-hover:bg-zinc-700/80 group-hover:text-white transition-colors">
                        <Code2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-zinc-200 group-hover:text-white">
                          GitHub Repository
                        </div>
                        <div className="text-xs text-zinc-400 leading-snug">
                          Star Haberry Desk on GitHub (MIT License)
                        </div>
                      </div>
                    </a>
                  </div>
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {/* Quick search shortcut button */}
          <button
            onClick={onOpenCommandPalette}
            className="hidden lg:flex items-center gap-2 px-2.5 py-1 text-xs text-zinc-400 hover:text-zinc-200 bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800/80 rounded-md transition-colors mr-1 cursor-pointer"
            title="Open Command Palette"
          >
            <span>Search</span>
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-zinc-800 border border-zinc-700 text-zinc-300 rounded">
              ⌘K
            </kbd>
          </button>

          <Link
            href="/auth/sign-in"
            className="text-sm text-zinc-300 hover:text-white transition-colors px-3 py-1.5 cursor-pointer"
          >
            Sign In
          </Link>

          <Link
            href="/auth/sign-up"
            className="inline-flex items-center justify-center bg-white text-zinc-950 font-medium text-[13px] px-3.5 py-1.5 rounded-lg hover:bg-zinc-200 active:scale-[0.98] transition-all duration-150 shadow-sm cursor-pointer"
          >
            Get Started
          </Link>

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-zinc-400 hover:text-white rounded-lg focus:outline-none"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0e0e11] border-b border-zinc-800 px-6 py-6 space-y-4">
          <div className="flex flex-col space-y-3 text-base">
            <a
              href="#product-demo"
              onClick={() => setMobileMenuOpen(false)}
              className="text-zinc-300 hover:text-white py-1"
            >
              Product
            </a>
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="text-zinc-300 hover:text-white py-1"
            >
              Features
            </a>
            <a
              href="#blog"
              onClick={() => setMobileMenuOpen(false)}
              className="text-zinc-300 hover:text-white py-1"
            >
              Blog
            </a>
            <a
              href="#github-sync"
              onClick={() => setMobileMenuOpen(false)}
              className="text-zinc-300 hover:text-white py-1"
            >
              GitHub Sync
            </a>
            <a
              href="#self-hosting"
              onClick={() => setMobileMenuOpen(false)}
              className="text-zinc-300 hover:text-white py-1"
            >
              Self-Hosting
            </a>
          </div>

          <div className="pt-4 border-t border-zinc-800/80 flex flex-col gap-2">
            <Link
              href="/auth/sign-in"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2 text-zinc-300 hover:text-white border border-zinc-800 rounded-lg text-sm"
            >
              Sign In
            </Link>
            <Link
              href="/auth/sign-up"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2 bg-white text-zinc-950 font-medium rounded-lg text-sm hover:bg-zinc-200 cursor-pointer"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

