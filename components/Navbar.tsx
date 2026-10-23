"use client";

import React from "react";
import {
  MessageSquareText,
  Sparkles,
  Users,
  BookmarkCheck,
  Settings,
  Sun,
  Moon,
  PlusCircle,
  Code2,
  Cpu,
} from "lucide-react";
import { AppSettings } from "@/lib/types";

interface NavbarProps {
  currentTab: string;
  setTab: (tab: string) => void;
  onNew: () => void;
  onOpenExportModal: () => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
  settings: AppSettings;
  activeProviderLabel: string;
  isBusy: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setTab,
  onNew,
  onOpenExportModal,
  theme,
  toggleTheme,
  activeProviderLabel,
  isBusy,
}) => {
  const tabs = [
    { id: "reply", label: "Reply", icon: MessageSquareText },
    { id: "builder", label: "Builder", icon: Sparkles },
    { id: "crm", label: "CRM", icon: Users },
    { id: "saved", label: "Saved", icon: BookmarkCheck },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <>
      {/* Top Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-[var(--line)] bg-[var(--card)] px-4 py-3 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div
            onClick={() => setTab("reply")}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-white shadow-sm transition-transform group-hover:scale-105">
              <MessageSquareText className="h-5 w-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-[var(--ink)]">
                ReplyPilot<b className="text-teal-600 dark:text-teal-400"> AI</b>
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200/50 dark:border-teal-800/40">
                Phase 1 MVP
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Provider status chip */}
          <div
            onClick={() => setTab("settings")}
            title="Click to configure AI providers in Settings"
            className="hidden sm:flex items-center gap-1.5 cursor-pointer rounded-full border border-[var(--line)] bg-[var(--bg)] px-3 py-1 text-xs font-medium text-[var(--mute)] hover:border-teal-500 transition-colors"
          >
            <span
              className={`h-2 w-2 rounded-full ${
                isBusy ? "bg-amber-500 animate-ping" : "bg-emerald-500"
              }`}
            />
            <Cpu className="h-3 w-3 text-teal-600 dark:text-teal-400" />
            <span className="truncate max-w-[130px]">{activeProviderLabel}</span>
          </div>

          {/* New Workspace button */}
          <button
            onClick={onNew}
            className="flex items-center gap-1 rounded-xl bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 text-xs font-semibold shadow-sm transition-all"
            title="Start a new conversation"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>New</span>
          </button>

          {/* Export standalone HTML */}
          <button
            onClick={onOpenExportModal}
            className="hidden md:flex items-center gap-1 rounded-xl border border-[var(--line)] bg-[var(--card)] hover:bg-[var(--bg)] px-2.5 py-1.5 text-xs font-medium text-[var(--ink)] transition-colors"
            title="Export Standalone Offline Single-file HTML"
          >
            <Code2 className="h-3.5 w-3.5 text-teal-600" />
            <span>Single HTML</span>
          </button>

          {/* Dark/Light mode toggle */}
          <button
            onClick={toggleTheme}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-[var(--line)] bg-[var(--card)] text-[var(--ink)] hover:bg-[var(--bg)] transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-slate-600" />
            )}
          </button>
        </div>
      </header>

      {/* Mobile & Desktop Bottom Navigation */}
      <nav
        aria-label="Main Navigation"
        className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-[var(--line)] bg-[var(--card)]/95 backdrop-blur-lg px-2 py-1 shadow-lg"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 min-w-[56px] transition-all ${
                isActive
                  ? "text-teal-600 dark:text-teal-400 font-bold scale-105"
                  : "text-[var(--mute)] hover:text-[var(--ink)] font-normal"
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
              <span className="text-[11px] mt-0.5 tracking-tight">{tab.label}</span>
              {isActive && (
                <span className="h-1 w-5 rounded-full bg-teal-600 dark:bg-teal-400 mt-0.5" />
              )}
            </button>
          );
        })}
      </nav>
    </>
  );
};
