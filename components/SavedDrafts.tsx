"use client";

import React, { useState } from "react";
import { Workspace } from "@/lib/types";
import {
  Bookmark,
  Copy,
  Check,
  ExternalLink,
  Trash2,
  BookmarkX,
  Clock,
  Sparkles,
} from "lucide-react";

interface SavedDraftsProps {
  workspaces: Workspace[];
  onOpenWorkspace: (id: string) => void;
  onUnsaveDraft: (id: string) => void;
  onDeleteWorkspace: (id: string) => void;
  copyToClipboard: (text: string) => void;
}

export const SavedDrafts: React.FC<SavedDraftsProps> = ({
  workspaces,
  onOpenWorkspace,
  onUnsaveDraft,
  onDeleteWorkspace,
  copyToClipboard,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const savedList = workspaces
    .filter((w) => w.draft?.saved && w.draft?.cur?.trim())
    .sort((a, b) => (b.at < a.at ? -1 : 1));

  const handleCopy = (id: string, text: string) => {
    copyToClipboard(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-28">
      <div className="flex items-center justify-between bg-[var(--card)] p-4 sm:p-5 rounded-2xl border border-[var(--line)] shadow-sm">
        <div>
          <h1 className="text-xl font-extrabold text-[var(--ink)] flex items-center gap-2">
            <Bookmark className="h-5 w-5 text-amber-500 fill-amber-500" />
            Saved Drafts ({savedList.length})
          </h1>
          <p className="text-xs text-[var(--mute)] mt-1">
            Bookmarked responses and crafted messages ready to copy, refine, or review.
          </p>
        </div>
      </div>

      {savedList.length === 0 ? (
        <div className="bg-[var(--card)] p-12 rounded-2xl border border-[var(--line)] text-center space-y-3">
          <div className="flex justify-center">
            <div className="h-12 w-12 rounded-full bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-500">
              <Bookmark className="h-6 w-6" />
            </div>
          </div>
          <h3 className="font-bold text-sm text-[var(--ink)]">No saved drafts yet</h3>
          <p className="text-xs text-[var(--mute)] max-w-sm mx-auto">
            When you generate a reply or build a message, click &quot;Save Draft&quot; to pin it
            here for quick access.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {savedList.map((w) => {
            const isMessage = w.kind === "builder";
            const curDraft = w.draft.cur;

            return (
              <div
                key={w.id}
                className="bg-[var(--card)] p-5 rounded-2xl border border-[var(--line)] shadow-sm hover:border-teal-500/50 transition-all space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isMessage
                          ? "bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200"
                          : "bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200"
                      }`}
                    >
                      {isMessage ? "Message Builder" : "Conversation Reply"}
                    </span>
                    <h3 className="text-sm font-bold text-[var(--ink)]">{w.title}</h3>
                  </div>

                  <span className="text-[11px] text-[var(--mute)] flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(w.at).toLocaleDateString([], {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-[var(--bg)] border border-[var(--line)]">
                  <p className="text-xs sm:text-sm text-[var(--ink)] whitespace-pre-wrap leading-relaxed font-sans">
                    {curDraft}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(w.id, curDraft)}
                      className={`flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-bold transition-all shadow-sm ${
                        copiedId === w.id
                          ? "bg-emerald-600 text-white"
                          : "bg-teal-600 hover:bg-teal-700 text-white"
                      }`}
                    >
                      {copiedId === w.id ? (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => onOpenWorkspace(w.id)}
                      className="flex items-center gap-1 py-1.5 px-3 rounded-xl border border-[var(--line)] bg-[var(--card)] hover:bg-[var(--bg)] text-xs font-semibold text-[var(--ink)] transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5 text-teal-600" />
                      <span>Open Workspace</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onUnsaveDraft(w.id)}
                      className="flex items-center gap-1 text-xs text-[var(--mute)] hover:text-amber-600 px-2 py-1"
                      title="Remove from saved drafts"
                    >
                      <BookmarkX className="h-3.5 w-3.5" />
                      <span>Unsave</span>
                    </button>
                    <button
                      onClick={() => onDeleteWorkspace(w.id)}
                      className="text-[var(--mute)] hover:text-red-500 p-1.5"
                      title="Delete conversation completely"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
