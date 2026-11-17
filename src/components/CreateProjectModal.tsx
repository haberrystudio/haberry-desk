"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  Search,
  Loader2,
  Layout,
  Briefcase,
  Folder,
  Target,
  Rocket,
  Code,
  Box,
  Layers,
  Book,
  Bookmark,
  Building,
  Calendar,
  Cpu,
  Cog,
  Database,
  FileText,
  Flag,
  FlaskConical,
  Archive,
  GitBranch,
  Globe,
  Heart,
  Home,
  Image as ImageIcon,
  Lightbulb,
  Link as LinkIcon,
  List,
  MessageSquare,
  Music,
  Package,
  Palette,
  PenTool,
  Phone,
  PieChart,
  Puzzle,
  Radio,
  Scroll,
  Settings,
  Share2,
  Shield,
  ShoppingBag,
  Smile,
  Star,
  Table,
  Tag,
  Terminal,
  Zap,
  Sparkles,
  Compass,
} from "lucide-react";

export const PROJECT_ICONS: { [key: string]: React.ElementType } = {
  layout: Layout,
  briefcase: Briefcase,
  folder: Folder,
  target: Target,
  rocket: Rocket,
  code: Code,
  box: Box,
  layers: Layers,
  book: Book,
  bookmark: Bookmark,
  building: Building,
  calendar: Calendar,
  cpu: Cpu,
  cog: Cog,
  database: Database,
  "file-text": FileText,
  flag: Flag,
  flask: FlaskConical,
  archive: Archive,
  "git-branch": GitBranch,
  globe: Globe,
  heart: Heart,
  home: Home,
  image: ImageIcon,
  lightbulb: Lightbulb,
  link: LinkIcon,
  list: List,
  "message-square": MessageSquare,
  music: Music,
  package: Package,
  palette: Palette,
  "pen-tool": PenTool,
  phone: Phone,
  "pie-chart": PieChart,
  puzzle: Puzzle,
  radio: Radio,
  scroll: Scroll,
  settings: Settings,
  share: Share2,
  shield: Shield,
  "shopping-bag": ShoppingBag,
  smile: Smile,
  star: Star,
  table: Table,
  tag: Tag,
  terminal: Terminal,
  zap: Zap,
  sparkles: Sparkles,
  compass: Compass,
};

export function ProjectIcon({
  name,
  className = "w-4 h-4",
}: {
  name?: string;
  className?: string;
}) {
  const IconComp = (name && PROJECT_ICONS[name]) || Layout;
  return <IconComp className={className} />;
}

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (name: string, prefix: string, icon: string) => Promise<void> | void;
}

export function CreateProjectModal({
  isOpen,
  onClose,
  onCreateProject,
}: CreateProjectModalProps) {
  const [name, setName] = useState("");
  const [prefix, setPrefix] = useState("PRO");
  const [isPrefixManual, setIsPrefixManual] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState("layout");
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
  const [iconSearch, setIconSearch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName("");
      setPrefix("PRO");
      setIsPrefixManual(false);
      setSelectedIcon("layout");
      setIsIconPickerOpen(false);
      setIconSearch("");
      setIsSubmitting(false);
    }
  }, [isOpen]);

  // Auto derive prefix from project name
  const handleNameChange = (val: string) => {
    setName(val);
    if (!isPrefixManual) {
      const letters = val.replace(/[^a-zA-Z]/g, "").toUpperCase();
      if (letters.length >= 3) {
        setPrefix(letters.slice(0, 3));
      } else if (letters.length > 0) {
        setPrefix(letters);
      } else {
        setPrefix("PRO");
      }
    }
  };

  const handlePrefixChange = (val: string) => {
    setIsPrefixManual(true);
    setPrefix(val.replace(/[^a-zA-Z0-9]/g, "").slice(0, 5).toUpperCase());
  };

  const filteredIcons = useMemo(() => {
    const q = iconSearch.trim().toLowerCase();
    if (!q) return Object.keys(PROJECT_ICONS);
    return Object.keys(PROJECT_ICONS).filter((k) => k.toLowerCase().includes(q));
  }, [iconSearch]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const cleanPrefix = prefix.trim() || "HAB";
      await onCreateProject(name.trim(), cleanPrefix, selectedIcon);
      onClose();
    } catch (err) {
      console.error("Failed to create project:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-150">
      <div className="bg-[#141417] border border-zinc-800/90 rounded-2xl w-full max-w-lg shadow-2xl overflow-visible font-sans p-6 sm:p-7 space-y-6 relative">
        {/* Header Breadcrumbs */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-mono text-zinc-500 uppercase tracking-wider text-[11px] font-semibold">
              HABERRY
            </span>
            <span className="text-zinc-600 font-normal">&gt;</span>
            <span className="text-white font-medium">Create a new project</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-zinc-500 hover:text-white p-1 rounded cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Icon Selector Button */}
          <div className="relative inline-block">
            <button
              type="button"
              onClick={() => setIsIconPickerOpen((prev) => !prev)}
              title="Select project icon"
              className="w-10 h-10 rounded-xl bg-[#1c1d22] border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer shadow-sm"
            >
              <ProjectIcon name={selectedIcon} className="w-5 h-5" />
            </button>

            {/* Icon Picker Popover */}
            {isIconPickerOpen && (
              <div className="absolute left-0 top-12 z-50 w-72 bg-[#141518] border border-zinc-800 rounded-2xl shadow-2xl p-3.5 space-y-3 animate-in fade-in zoom-in-95 duration-100">
                {/* Search */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    autoFocus
                    placeholder="Search icons..."
                    value={iconSearch}
                    onChange={(e) => setIconSearch(e.target.value)}
                    className="w-full bg-[#0e0e11] border border-zinc-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-700"
                  />
                </div>

                {/* Grid */}
                <div className="grid grid-cols-6 gap-1 max-h-52 overflow-y-auto pr-1">
                  {filteredIcons.map((iconKey) => {
                    const isSel = iconKey === selectedIcon;
                    return (
                      <button
                        key={iconKey}
                        type="button"
                        onClick={() => {
                          setSelectedIcon(iconKey);
                          setIsIconPickerOpen(false);
                        }}
                        className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                          isSel
                            ? "bg-zinc-800 text-white shadow-xs"
                            : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
                        }`}
                      >
                        <ProjectIcon name={iconKey} className="w-4 h-4" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Project Name Input */}
          <div>
            <input
              type="text"
              required
              autoFocus
              placeholder="Project name"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full bg-transparent text-2xl sm:text-[26px] font-bold text-white placeholder-zinc-500 focus:outline-none tracking-tight"
            />
          </div>

          {/* Key Box */}
          <div className="bg-[#18191d] border border-zinc-800/80 rounded-xl px-4 py-3 flex items-center gap-3 text-xs">
            <span className="text-zinc-400 font-medium">Key:</span>
            <input
              type="text"
              value={prefix}
              onChange={(e) => handlePrefixChange(e.target.value)}
              className="bg-[#121316] border border-zinc-700 rounded-lg px-3 py-1 text-white font-mono font-bold uppercase text-center w-20 focus:outline-none focus:border-zinc-500"
              placeholder="PRO"
            />
            <span className="text-zinc-500 truncate">
              Used for ticket IDs (e.g., ABC-123)
            </span>
          </div>

          {/* Import Projects Notice */}
          <div className="text-xs text-zinc-400 pt-1">
            <span>Moving from Jira, Linear, Trello or Plane? </span>
            <button
              type="button"
              className="text-white font-semibold hover:underline cursor-pointer"
            >
              Import your projects
            </button>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 flex items-center justify-end gap-2.5 border-t border-zinc-800/70">
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
              <span>Create Project</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
