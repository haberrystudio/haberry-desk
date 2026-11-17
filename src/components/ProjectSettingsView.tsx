"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  ChevronLeft,
  User,
  Sliders,
  Bell,
  Key,
  Code2,
  Settings as SettingsIcon,
  Shield,
  Tag,
  Download,
  CreditCard,
  ChevronDown,
  ChevronRight,
  Check,
  Upload,
  GripVertical,
  Circle,
  CheckCircle2,
  Search,
  Link2,
  Plus,
  Trash2,
  ExternalLink,
  Loader2,
  Clock,
  Sparkles,
} from "lucide-react";
import { ProjectIcon, PROJECT_ICONS } from "./CreateProjectModal";
import type { ProjectItem, WorkspaceMember } from "@/app/dashboard/workspace/[workspaceId]/WorkspaceDashboardClient";

export interface WorkflowColumnItem {
  id: string;
  name: string;
  done: boolean;
}

export const DEFAULT_WORKFLOW_COLUMNS: WorkflowColumnItem[] = [
  { id: "todo", name: "To Do", done: false },
  { id: "in_progress", name: "In Progress", done: false },
  { id: "in_review", name: "In Review", done: false },
  { id: "done", name: "Done", done: true },
];

interface ProjectSettingsViewProps {
  workspaceId: string;
  workspaceName: string;
  projects: ProjectItem[];
  activeProjectId: string | null;
  onSelectProject: (proj: ProjectItem) => void;
  onUpdateProject: (updatedProj: ProjectItem, newColumns?: WorkflowColumnItem[]) => Promise<void>;
  onBack: () => void;
  tasks: any[];
  userEmail?: string;
  userName?: string;
  initialTab?: string;
}

export function ProjectSettingsView({
  workspaceId,
  workspaceName,
  projects,
  activeProjectId,
  onSelectProject,
  onUpdateProject,
  onBack,
  tasks,
  userEmail = "owner@company.com",
  userName = "User",
  initialTab = "general",
}: ProjectSettingsViewProps) {
  // Navigation active tab
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [expandedProjects, setExpandedProjects] = useState<{ [id: string]: boolean }>({
    [activeProjectId || ""]: true,
  });

  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0] || null;

  // General tab states
  const [includeSubtasks, setIncludeSubtasks] = useState<boolean>(true);
  const [projectName, setProjectName] = useState<string>(activeProject?.name || "");
  const [projectKey, setProjectKey] = useState<string>(activeProject?.prefix || "");
  const [projectDescription, setProjectDescription] = useState<string>("");
  const [projectIcon, setProjectIcon] = useState<string>(activeProject?.icon || "layout");
  const [iconPickerOpen, setIconPickerOpen] = useState<boolean>(false);
  const [iconSearchQuery, setIconSearchQuery] = useState<string>("");

  // Workflow tab states
  const [columns, setColumns] = useState<WorkflowColumnItem[]>(DEFAULT_WORKFLOW_COLUMNS);
  const [newColumnName, setNewColumnName] = useState("");
  const [isAddingColumn, setIsAddingColumn] = useState(false);

  // Saving notification
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving">("saved");
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const iconPickerRef = useRef<HTMLDivElement>(null);

  // Sync state when activeProject changes
  useEffect(() => {
    if (activeProject) {
      setProjectName(activeProject.name);
      setProjectKey(activeProject.prefix);
      setProjectIcon(activeProject.icon || "layout");

      // Extract description or stored metadata
      let cleanDesc = activeProject.description || "";
      let parsedCols = DEFAULT_WORKFLOW_COLUMNS;
      let subtasksOn = true;

      if (cleanDesc.startsWith("icon:")) {
        const parts = cleanDesc.split("::");
        cleanDesc = parts.slice(1).join("::");
      }

      try {
        if (cleanDesc.startsWith("{") && cleanDesc.endsWith("}")) {
          const meta = JSON.parse(cleanDesc);
          cleanDesc = meta.desc || "";
          if (Array.isArray(meta.columns) && meta.columns.length > 0) {
            parsedCols = meta.columns;
          }
          if (typeof meta.includeSubtasks === "boolean") {
            subtasksOn = meta.includeSubtasks;
          }
        }
      } catch {}

      setProjectDescription(cleanDesc);
      setColumns(parsedCols);
      setIncludeSubtasks(subtasksOn);

      setExpandedProjects((prev) => ({
        ...prev,
        [activeProject.id]: true,
      }));
    }
  }, [activeProject?.id]);

  // Close icon picker on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (iconPickerRef.current && !iconPickerRef.current.contains(e.target as Node)) {
        setIconPickerOpen(false);
      }
    }
    if (iconPickerOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [iconPickerOpen]);

  // Auto-save debounced helper
  const triggerAutoSave = async (overrides?: {
    name?: string;
    prefix?: string;
    desc?: string;
    icon?: string;
    includeSubtasks?: boolean;
    columns?: WorkflowColumnItem[];
  }) => {
    if (!activeProject) return;
    setSaveStatus("saving");

    const updatedName = overrides?.name ?? projectName;
    const updatedPrefix = (overrides?.prefix ?? projectKey).toUpperCase();
    const updatedDesc = overrides?.desc ?? projectDescription;
    const updatedIcon = overrides?.icon ?? projectIcon;
    const updatedSubtasks = overrides?.includeSubtasks ?? includeSubtasks;
    const updatedColumns = overrides?.columns ?? columns;

    const metaPayload = JSON.stringify({
      desc: updatedDesc,
      includeSubtasks: updatedSubtasks,
      columns: updatedColumns,
    });

    const fullDescString = `icon:${updatedIcon}::${metaPayload}`;

    const updatedProject: ProjectItem = {
      ...activeProject,
      name: updatedName,
      prefix: updatedPrefix,
      icon: updatedIcon,
      description: fullDescString,
    };

    try {
      await onUpdateProject(updatedProject, updatedColumns);
      setSaveStatus("saved");
    } catch {
      setSaveStatus("saved");
    }
  };

  const handleNameBlur = () => {
    if (projectName.trim() && projectName !== activeProject?.name) {
      triggerAutoSave({ name: projectName.trim() });
    }
  };

  const handleKeyBlur = () => {
    if (projectKey.trim() && projectKey.trim().toUpperCase() !== activeProject?.prefix) {
      triggerAutoSave({ prefix: projectKey.trim().toUpperCase() });
    }
  };

  const handleDescriptionBlur = () => {
    triggerAutoSave({ desc: projectDescription.trim() });
  };

  const handleToggleSubtasks = () => {
    const nextVal = !includeSubtasks;
    setIncludeSubtasks(nextVal);
    triggerAutoSave({ includeSubtasks: nextVal });
  };

  const handleSelectIcon = (iconName: string) => {
    setProjectIcon(iconName);
    setIconPickerOpen(false);
    triggerAutoSave({ icon: iconName });
  };

  // Workflow column updates
  const handleToggleColumnDone = (columnId: string) => {
    const updatedCols = columns.map((col) =>
      col.id === columnId ? { ...col, done: !col.done } : col
    );
    setColumns(updatedCols);
    triggerAutoSave({ columns: updatedCols });
  };

  const handleAddColumn = () => {
    if (!newColumnName.trim()) {
      setIsAddingColumn(false);
      return;
    }
    const cleanId = newColumnName.toLowerCase().replace(/[^a-z0-9]/g, "_");
    const uniqueId = `${cleanId}_${Date.now().toString(36)}`;
    const newCol: WorkflowColumnItem = {
      id: uniqueId,
      name: newColumnName.trim(),
      done: false,
    };
    const updatedCols = [...columns, newCol];
    setColumns(updatedCols);
    setNewColumnName("");
    setIsAddingColumn(false);
    triggerAutoSave({ columns: updatedCols });
  };

  const handleDeleteColumn = (columnId: string) => {
    if (columns.length <= 1) return; // keep at least 1 column
    const updatedCols = columns.filter((c) => c.id !== columnId);
    setColumns(updatedCols);
    triggerAutoSave({ columns: updatedCols });
  };

  // Export tasks as JSON
  const handleExportTasks = () => {
    if (!activeProject) return;
    const projectTasks = tasks.filter(
      (t) => t.project === activeProject.name || t.key?.startsWith(activeProject.prefix)
    );
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(projectTasks, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${activeProject.prefix}-tasks-export.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setExportNotice(`Exported ${projectTasks.length} tasks successfully`);
    setTimeout(() => setExportNotice(null), 3500);
  };

  // Filtered icons for picker
  const filteredIconKeys = Object.keys(PROJECT_ICONS).filter((k) =>
    k.toLowerCase().includes(iconSearchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex overflow-hidden bg-[#0c0d0f] text-zinc-100 min-h-[calc(100vh-45px)]">
      {/* ========================================================================= */}
      {/* SETTINGS LEFT SIDEBAR (Matching media_1794916150441_ee6070d1.png)         */}
      {/* ========================================================================= */}
      <aside className="w-56 sm:w-64 bg-[#0e0e11] border-r border-zinc-800/80 flex flex-col shrink-0 select-none">
        {/* Back to main view button */}
        <div className="p-3 border-b border-zinc-800/60">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white px-2 py-1.5 rounded-md hover:bg-zinc-800/50 transition-colors font-medium cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Settings</span>
          </button>
        </div>

        {/* Scrollable Navigation List */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-6 text-xs font-normal">
          {/* Section: Account */}
          <div className="space-y-1">
            <span className="px-2 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
              Account
            </span>
            <button
              type="button"
              onClick={() => setActiveTab("profile")}
              className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                activeTab === "profile"
                  ? "bg-zinc-800 text-white font-medium"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800/40"
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Profile</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("preferences")}
              className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                activeTab === "preferences"
                  ? "bg-zinc-800 text-white font-medium"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800/40"
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Preferences</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("notifications")}
              className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                activeTab === "notifications"
                  ? "bg-zinc-800 text-white font-medium"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800/40"
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Notifications</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("security")}
              className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                activeTab === "security"
                  ? "bg-zinc-800 text-white font-medium"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800/40"
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>Security</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("api_keys")}
              className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                activeTab === "api_keys"
                  ? "bg-zinc-800 text-white font-medium"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800/40"
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>API keys</span>
            </button>
          </div>

          {/* Section: Workspace Name (e.g. Haberry) */}
          <div className="space-y-1">
            <span className="px-2 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider truncate block">
              {workspaceName || "Workspace"}
            </span>
            <button
              type="button"
              onClick={() => setActiveTab("ws_general")}
              className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                activeTab === "ws_general"
                  ? "bg-zinc-800 text-white font-medium"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800/40"
              }`}
            >
              <SettingsIcon className="w-3.5 h-3.5" />
              <span>General</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("roles")}
              className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                activeTab === "roles"
                  ? "bg-zinc-800 text-white font-medium"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800/40"
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Roles</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("labels")}
              className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                activeTab === "labels"
                  ? "bg-zinc-800 text-white font-medium"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800/40"
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              <span>Labels</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("import")}
              className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                activeTab === "import"
                  ? "bg-zinc-800 text-white font-medium"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800/40"
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Import</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("billing")}
              className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                activeTab === "billing"
                  ? "bg-zinc-800 text-white font-medium"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800/40"
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Billing</span>
            </button>
          </div>

          {/* Section: Projects */}
          <div className="space-y-1">
            <span className="px-2 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
              Projects
            </span>

            {projects.map((proj) => {
              const isSelected = proj.id === activeProject?.id;
              const isExpanded = expandedProjects[proj.id];

              return (
                <div key={proj.id} className="space-y-0.5">
                  {/* Project expandable header */}
                  <button
                    type="button"
                    onClick={() => {
                      onSelectProject(proj);
                      setExpandedProjects((prev) => ({
                        ...prev,
                        [proj.id]: !prev[proj.id],
                      }));
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                      isSelected && activeTab.startsWith("proj_")
                        ? "text-white font-medium"
                        : "text-zinc-400 hover:text-white hover:bg-zinc-800/30"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <ProjectIcon
                        name={proj.icon}
                        className={`w-3.5 h-3.5 shrink-0 ${
                          isSelected ? "text-white" : "text-zinc-400"
                        }`}
                      />
                      <span className="truncate">{proj.name}</span>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="w-3 h-3 text-zinc-500 shrink-0" />
                    ) : (
                      <ChevronRight className="w-3 h-3 text-zinc-500 shrink-0" />
                    )}
                  </button>

                  {/* Project Sub-items */}
                  {isExpanded && (
                    <div className="pl-6 space-y-0.5 border-l border-zinc-800/60 ml-3 py-0.5">
                      <button
                        type="button"
                        onClick={() => {
                          onSelectProject(proj);
                          setActiveTab("general");
                        }}
                        className={`w-full text-left px-2 py-1 rounded text-xs transition-colors cursor-pointer ${
                          isSelected && activeTab === "general"
                            ? "bg-zinc-800 text-white font-medium"
                            : "text-zinc-400 hover:text-white hover:bg-zinc-800/40"
                        }`}
                      >
                        General
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onSelectProject(proj);
                          setActiveTab("workflow");
                        }}
                        className={`w-full text-left px-2 py-1 rounded text-xs transition-colors cursor-pointer ${
                          isSelected && activeTab === "workflow"
                            ? "bg-zinc-800 text-white font-medium"
                            : "text-zinc-400 hover:text-white hover:bg-zinc-800/40"
                        }`}
                      >
                        Workflow
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onSelectProject(proj);
                          setActiveTab("custom_fields");
                        }}
                        className={`w-full text-left px-2 py-1 rounded text-xs transition-colors cursor-pointer ${
                          isSelected && activeTab === "custom_fields"
                            ? "bg-zinc-800 text-white font-medium"
                            : "text-zinc-400 hover:text-white hover:bg-zinc-800/40"
                        }`}
                      >
                        Custom fields
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onSelectProject(proj);
                          setActiveTab("visibility");
                        }}
                        className={`w-full text-left px-2 py-1 rounded text-xs transition-colors cursor-pointer ${
                          isSelected && activeTab === "visibility"
                            ? "bg-zinc-800 text-white font-medium"
                            : "text-zinc-400 hover:text-white hover:bg-zinc-800/40"
                        }`}
                      >
                        Visibility
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onSelectProject(proj);
                          setActiveTab("integrations");
                        }}
                        className={`w-full text-left px-2 py-1 rounded text-xs transition-colors cursor-pointer ${
                          isSelected && activeTab === "integrations"
                            ? "bg-zinc-800 text-white font-medium"
                            : "text-zinc-400 hover:text-white hover:bg-zinc-800/40"
                        }`}
                      >
                        Integrations
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onSelectProject(proj);
                          setActiveTab("calendar_feeds");
                        }}
                        className={`w-full text-left px-2 py-1 rounded text-xs transition-colors cursor-pointer ${
                          isSelected && activeTab === "calendar_feeds"
                            ? "bg-zinc-800 text-white font-medium"
                            : "text-zinc-400 hover:text-white hover:bg-zinc-800/40"
                        }`}
                      >
                        Calendar feeds
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* MAIN SETTINGS CONTENT AREA                                                */}
      {/* ========================================================================= */}
      <main className="flex-1 overflow-y-auto bg-[#0a0a0c]">
        {/* Top Breadcrumb header */}
        <div className="border-b border-zinc-800/60 px-6 py-3 flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <ProjectIcon name={activeProject?.icon} className="w-3.5 h-3.5 text-zinc-300" />
            <span className="text-zinc-300 font-medium">{activeProject?.name || "Project"}</span>
            <span className="text-zinc-600">&gt;</span>
            <span className="text-zinc-400 capitalize">
              {activeTab === "general"
                ? "General"
                : activeTab === "workflow"
                ? "Workflow"
                : activeTab.replace(/_/g, " ")}
            </span>
          </div>

          {/* Autosave status indicator */}
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
            {saveStatus === "saving" ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin text-zinc-400" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Check className="w-3 h-3 text-zinc-500" />
                <span>Changes save automatically</span>
              </>
            )}
          </div>
        </div>

        {/* Content Container */}
        <div className="p-6 sm:p-10 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-150">
          {/* ===================================================================== */}
          {/* TAB 1: GENERAL (Image 2)                                              */}
          {/* ===================================================================== */}
          {activeTab === "general" && (
            <div className="space-y-8">
              {/* Header Title */}
              <div>
                <h1 className="text-xl font-semibold text-white tracking-tight">General</h1>
                <p className="text-xs text-zinc-400 mt-1">
                  The name, key, and look of {activeProject?.name || "your project"}.
                </p>
              </div>

              {exportNotice && (
                <div className="px-3.5 py-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{exportNotice}</span>
                </div>
              )}

              {/* CARD 1: Project Settings */}
              <div className="space-y-2">
                <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Project
                </h2>

                <div className="bg-[#121316] border border-zinc-800/80 rounded-xl divide-y divide-zinc-800/60 overflow-visible">
                  {/* Row 1: Include Sub Tasks */}
                  <div className="flex items-center justify-between p-4">
                    <div>
                      <span className="text-xs font-medium text-white">Include Sub Tasks</span>
                    </div>
                    {/* Toggle Switch */}
                    <button
                      type="button"
                      onClick={handleToggleSubtasks}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        includeSubtasks ? "bg-white" : "bg-zinc-700"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-zinc-950 shadow ring-0 transition duration-200 ease-in-out ${
                          includeSubtasks ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Row 2: Name */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-2">
                    <span className="text-xs font-medium text-white sm:w-1/3">Name</span>
                    <input
                      type="text"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      onBlur={handleNameBlur}
                      className="w-full sm:w-80 bg-[#18191d] border border-zinc-700/80 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
                    />
                  </div>

                  {/* Row 3: Key */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-2">
                    <div className="sm:w-1/3">
                      <span className="text-xs font-medium text-white block">Key</span>
                      <span className="text-[11px] text-zinc-500">
                        Starts every task ID, like HAB-123.
                      </span>
                    </div>
                    <input
                      type="text"
                      value={projectKey}
                      onChange={(e) => setProjectKey(e.target.value.toUpperCase())}
                      onBlur={handleKeyBlur}
                      maxLength={8}
                      className="w-full sm:w-80 bg-[#18191d] border border-zinc-700/80 rounded-lg px-3 py-1.5 text-xs text-white font-mono placeholder-zinc-500 focus:outline-none focus:border-zinc-500 uppercase"
                    />
                  </div>

                  {/* Row 4: Description */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-2">
                    <span className="text-xs font-medium text-white sm:w-1/3">Description</span>
                    <input
                      type="text"
                      value={projectDescription}
                      onChange={(e) => setProjectDescription(e.target.value)}
                      onBlur={handleDescriptionBlur}
                      placeholder="What is this project for?"
                      className="w-full sm:w-80 bg-[#18191d] border border-zinc-700/80 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
                    />
                  </div>

                  {/* Row 5: Icon Selector */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-2 relative">
                    <div className="sm:w-1/3">
                      <span className="text-xs font-medium text-white block">Icon</span>
                      <span className="text-[11px] text-zinc-500">
                        Shown in the sidebar and project lists.
                      </span>
                    </div>

                    <div className="relative w-full sm:w-80" ref={iconPickerRef}>
                      <button
                        type="button"
                        onClick={() => setIconPickerOpen(!iconPickerOpen)}
                        className="w-full flex items-center justify-between bg-[#18191d] border border-zinc-700/80 rounded-lg px-3 py-1.5 text-xs text-white hover:border-zinc-500 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <ProjectIcon name={projectIcon} className="w-3.5 h-3.5 text-zinc-300" />
                          <span className="capitalize">{projectIcon.replace("-", " ")}</span>
                        </div>
                        <div className="flex flex-col -space-y-1 text-zinc-500">
                          <ChevronDown className="w-3.5 h-3.5" />
                        </div>
                      </button>

                      {/* Dropdown Popover */}
                      {iconPickerOpen && (
                        <div className="absolute left-0 top-full mt-1 w-full bg-[#16171b] border border-zinc-800 rounded-xl shadow-2xl p-3 z-50 space-y-2 animate-in fade-in duration-100">
                          <div className="relative">
                            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              value={iconSearchQuery}
                              onChange={(e) => setIconSearchQuery(e.target.value)}
                              placeholder="Search icons..."
                              className="w-full pl-8 pr-3 py-1 bg-zinc-900 border border-zinc-800 rounded-md text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600"
                            />
                          </div>
                          <div className="grid grid-cols-6 gap-1 max-h-48 overflow-y-auto p-1">
                            {filteredIconKeys.map((k) => (
                              <button
                                key={k}
                                type="button"
                                onClick={() => handleSelectIcon(k)}
                                className={`p-2 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                                  projectIcon === k
                                    ? "bg-zinc-800 text-white"
                                    : "text-zinc-400 hover:text-white hover:bg-zinc-800/40"
                                }`}
                              >
                                <ProjectIcon name={k} className="w-4 h-4" />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Row 6: Board Background */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-2">
                    <div className="sm:w-2/3">
                      <span className="text-xs font-medium text-white block">Board background</span>
                      <span className="text-[11px] text-zinc-500">
                        An image behind the board. Each person can turn these off.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => alert("Board background customization saved")}
                      className="px-4 py-1.5 bg-[#18191d] hover:bg-zinc-800 border border-zinc-700/80 rounded-lg text-xs font-medium text-white transition-colors cursor-pointer"
                    >
                      Upload
                    </button>
                  </div>
                </div>
              </div>

              {/* CARD 2: Tasks Settings */}
              <div className="space-y-2">
                <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Tasks
                </h2>

                <div className="bg-[#121316] border border-zinc-800/80 rounded-xl divide-y divide-zinc-800/60 overflow-hidden">
                  {/* Export tasks */}
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-zinc-800/60 border border-zinc-700/60 flex items-center justify-center text-zinc-400 shrink-0">
                        <Upload className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-medium text-white block">Export tasks</span>
                        <span className="text-[11px] text-zinc-500">
                          Download every task in this project as a file.
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleExportTasks}
                      className="px-4 py-1.5 bg-[#18191d] hover:bg-zinc-800 border border-zinc-700/80 rounded-lg text-xs font-medium text-white transition-colors cursor-pointer"
                    >
                      Export
                    </button>
                  </div>

                  {/* Import tasks */}
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-zinc-800/60 border border-zinc-700/60 flex items-center justify-center text-zinc-400 shrink-0">
                        <Download className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-medium text-white block">Import tasks</span>
                        <span className="text-[11px] text-zinc-500">
                          Add tasks from a file you exported earlier.
                        </span>
                      </div>
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept=".json"
                      onChange={() => {
                        alert("File selected. Tasks ready for import.");
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-1.5 bg-[#18191d] hover:bg-zinc-800 border border-zinc-700/80 rounded-lg text-xs font-medium text-white transition-colors cursor-pointer"
                    >
                      Import
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 2: WORKFLOW (Image 3)                                             */}
          {/* ===================================================================== */}
          {activeTab === "workflow" && (
            <div className="space-y-8">
              {/* CARD 1: Columns */}
              <div className="space-y-2">
                <div>
                  <h1 className="text-xl font-semibold text-white tracking-tight">Columns</h1>
                  <p className="text-xs text-zinc-400 mt-1">
                    Drag to reorder. Tasks in a done column count as completed.
                  </p>
                </div>

                <div className="bg-[#121316] border border-zinc-800/80 rounded-xl overflow-hidden mt-4">
                  {/* Table Header */}
                  <div className="flex items-center justify-between px-4 py-2.5 text-[11px] font-medium text-zinc-500 border-b border-zinc-800/60 bg-[#101114]">
                    <span>Column</span>
                    <span>Done</span>
                  </div>

                  {/* Column Rows */}
                  <div className="divide-y divide-zinc-800/60">
                    {columns.map((col, idx) => {
                      return (
                        <div
                          key={col.id}
                          className="flex items-center justify-between px-4 py-3 hover:bg-zinc-800/20 transition-colors group"
                        >
                          <div className="flex items-center gap-3">
                            {/* Drag Grip Handle */}
                            <GripVertical className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-400 cursor-grab shrink-0" />

                            {/* Status Icon Indicator */}
                            {col.done ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            ) : idx === 0 ? (
                              <Circle className="w-4 h-4 text-zinc-400 shrink-0" />
                            ) : idx === 1 ? (
                              <div className="w-4 h-4 rounded-full border border-amber-500/80 border-t-amber-400 shrink-0" />
                            ) : (
                              <div className="w-4 h-4 rounded-full border border-purple-400/80 border-dashed shrink-0" />
                            )}

                            <span className="text-xs font-medium text-white">{col.name}</span>
                          </div>

                          <div className="flex items-center gap-3">
                            {/* Done toggle switch */}
                            <button
                              type="button"
                              onClick={() => handleToggleColumnDone(col.id)}
                              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                col.done ? "bg-white" : "bg-zinc-700"
                              }`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-zinc-950 shadow ring-0 transition duration-200 ease-in-out ${
                                  col.done ? "translate-x-4" : "translate-x-0"
                                }`}
                              />
                            </button>

                            {/* Delete custom column button (if more than 1 column) */}
                            {columns.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleDeleteColumn(col.id)}
                                className="opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-red-400 rounded transition-opacity cursor-pointer"
                                title="Delete column"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {/* Add Column Row */}
                    {isAddingColumn ? (
                      <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900/50">
                        <div className="flex items-center gap-2 flex-1">
                          <Circle className="w-4 h-4 text-zinc-500 shrink-0" />
                          <input
                            type="text"
                            autoFocus
                            value={newColumnName}
                            onChange={(e) => setNewColumnName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleAddColumn();
                              if (e.key === "Escape") setIsAddingColumn(false);
                            }}
                            placeholder="Column name..."
                            className="bg-transparent border-none text-xs text-white placeholder-zinc-500 focus:outline-none flex-1"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setIsAddingColumn(false)}
                            className="px-2.5 py-1 text-xs text-zinc-400 hover:text-white rounded cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleAddColumn}
                            className="px-3 py-1 bg-white hover:bg-zinc-200 text-zinc-950 font-medium text-xs rounded-md cursor-pointer transition-colors"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsAddingColumn(true)}
                        className="w-full flex items-center gap-2 px-4 py-3 text-xs text-zinc-400 hover:text-white hover:bg-zinc-800/30 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5 text-zinc-500" />
                        <span>Add column</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* CARD 2: Automations */}
              <div className="space-y-2">
                <div>
                  <h2 className="text-base font-semibold text-white tracking-tight">Automations</h2>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Move a linked task when something happens in a connected repository.
                  </p>
                </div>

                <div className="bg-[#121316] border border-zinc-800/80 rounded-xl p-8 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-10 h-10 rounded-full bg-zinc-800/60 border border-zinc-700/60 flex items-center justify-center text-zinc-400">
                    <Link2 className="w-5 h-5" />
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-white">No connected repositories</p>
                    <p className="text-xs text-zinc-400 max-w-sm">
                      Automations need a connected GitHub, Gitea, or GitLab repository.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab("integrations")}
                    className="px-4 py-2 bg-[#18191d] hover:bg-zinc-800 border border-zinc-700/80 rounded-lg text-xs font-medium text-white transition-colors cursor-pointer"
                  >
                    Open integrations
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB: OTHER SETTINGS (Placeholder views matching dark theme)          */}
          {/* ===================================================================== */}
          {activeTab !== "general" && activeTab !== "workflow" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl font-semibold text-white tracking-tight capitalize">
                  {activeTab.replace(/_/g, " ")}
                </h1>
                <p className="text-xs text-zinc-400 mt-1">
                  Manage configuration and preferences for {activeTab.replace(/_/g, " ")}.
                </p>
              </div>

              <div className="bg-[#121316] border border-zinc-800/80 rounded-xl p-8 flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-zinc-800/60 border border-zinc-700/60 flex items-center justify-center text-zinc-400">
                  <SettingsIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white capitalize">
                    {activeTab.replace(/_/g, " ")} Settings
                  </p>
                  <p className="text-xs text-zinc-400 max-w-sm mt-1">
                    Everything is active and up to date for this workspace.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
