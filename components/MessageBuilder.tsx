"use client";

import React, { useState } from "react";
import {
  Workspace,
  BuilderFormState,
} from "@/lib/types";
import {
  Sparkles,
  Send,
  Copy,
  Check,
  Bookmark,
  RotateCcw,
  History,
  HelpCircle,
  Lightbulb,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface MessageBuilderProps {
  workspace: Workspace | null;
  onSelectWorkspace: (id: string) => void;
  onNewMessage: () => void;
  onGenerateMessage: (b: BuilderFormState, instruction?: string) => Promise<void>;
  onRewrite: (actionKey: string, actionLabel: string, actionInstruction: string) => Promise<void>;
  onUpdateDraftText: (text: string) => void;
  onCommitDraftText: (label: string) => void;
  onRestoreVersion: (index: number) => void;
  onToggleSaveDraft: () => void;
  isBusy: boolean;
  busyLabel: string;
  copyToClipboard: (text: string) => void;
  writingStyle: string;
}

const MESSAGE_KINDS = [
  "Personal",
  "Romantic",
  "Apology",
  "Invitation",
  "Follow-up",
  "Thank-you",
  "Business",
  "Customer support",
  "Professional outreach",
  "Negotiation",
  "Conflict resolution",
  "Friendly check-in",
  "Difficult conversation",
];

const REWRITE_ACTIONS = [
  { k: "sh", label: "Shorter", instr: "Make it noticeably shorter." },
  { k: "lo", label: "Longer", instr: "Make it somewhat longer with a bit more care, no new facts." },
  { k: "wa", label: "Warmer", instr: "Make it warmer and more caring." },
  { k: "na", label: "More natural", instr: "Make it sound like a real person." },
  { k: "co", label: "More confident", instr: "Make it more confident, not arrogant." },
  { k: "pr", label: "More professional", instr: "Make it more professional." },
  { k: "ro", label: "More romantic", instr: "Make it more romantic only if appropriate; sincere, not cheesy." },
  { k: "ca", label: "More casual", instr: "Make it more casual." },
  { k: "di", label: "More direct", instr: "Make it more direct yet polite." },
  { k: "ap", label: "Apologetic", instr: "Add a sincere, specific apology without over-apologizing." },
  { k: "bo", label: "Set boundaries", instr: "Politely and clearly set a boundary without blaming." },
  { k: "fu", label: "Ask follow-up", instr: "End with one thoughtful follow-up question." },
  { k: "my", label: "My style", instr: "Rewrite to match the user’s writing style." },
];

const PRESETS = [
  {
    kind: "Apology",
    purpose: "Apologize for missing a project deadline due to an unexpected family emergency and commit to delivering by tomorrow 5 PM.",
    recipient: "Project manager & team",
    tone: "Sincere, accountable, professional",
    facts: "Draft is 85% done, final QA remains.",
    avoid: "Making excuses or oversharing personal medical details.",
  },
  {
    kind: "Negotiation",
    purpose: "Ask for a 15% rate increase for an ongoing retainer contract after 1 year of consistent value.",
    recipient: "Long-term client director",
    tone: "Confident, respectful, value-focused",
    facts: "Delivered 24 successful features with zero downtime over past 12 months.",
    avoid: "Ultimatums or complaining about inflation.",
  },
  {
    kind: "Invitation",
    purpose: "Invite a prospective mentor for a 20-minute virtual coffee to discuss their recent talk on distributed systems.",
    recipient: "Senior Engineering VP",
    tone: "Warm, respectful, concise",
    facts: "Attended their talk at QCon last week.",
    avoid: "Asking for a job immediately.",
  },
];

export const MessageBuilder: React.FC<MessageBuilderProps> = ({
  workspace,
  onNewMessage,
  onGenerateMessage,
  onRewrite,
  onUpdateDraftText,
  onCommitDraftText,
  onRestoreVersion,
  onToggleSaveDraft,
  isBusy,
  busyLabel,
  copyToClipboard,
  writingStyle,
}) => {
  // Form State
  const [kind, setKind] = useState("Personal");
  const [purpose, setPurpose] = useState("");
  const [recipient, setRecipient] = useState("");
  const [tone, setTone] = useState("Natural, sincere");
  const [length, setLength] = useState("Medium");
  const [language, setLanguage] = useState("");
  const [facts, setFacts] = useState("");
  const [avoid, setAvoid] = useState("");
  const [outcome, setOutcome] = useState("");

  const [refinementInput, setRefinementInput] = useState("");
  const [copiedDraft, setCopiedDraft] = useState(false);
  const [showVersions, setShowVersions] = useState(false);

  // Load preset
  const handleLoadPreset = (p: (typeof PRESETS)[0]) => {
    setKind(p.kind);
    setPurpose(p.purpose);
    setRecipient(p.recipient);
    setTone(p.tone);
    setFacts(p.facts);
    setAvoid(p.avoid);
  };

  const handleStartGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!purpose.trim() && !facts.trim()) {
      alert("Please specify what you want to communicate.");
      return;
    }
    await onGenerateMessage({
      kind,
      purpose,
      recipient,
      tone,
      length,
      language,
      facts,
      avoid,
      outcome,
    });
  };

  const handleSendRefinement = async () => {
    if (!refinementInput.trim() || isBusy || !workspace?.b) return;
    const instr = refinementInput.trim();
    setRefinementInput("");
    await onGenerateMessage(workspace.b, instr);
  };

  const handleCopy = () => {
    if (!workspace?.draft?.cur) return;
    copyToClipboard(workspace.draft.cur);
    setCopiedDraft(true);
    setTimeout(() => setCopiedDraft(false), 2000);
  };

  // -------------------------------------------------------------
  // BUILDER FORM VIEW (WHEN NO BUILDER WORKSPACE ACTIVE)
  // -------------------------------------------------------------
  if (!workspace || workspace.kind !== "builder") {
    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-24">
        <div className="text-center py-4 px-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 dark:bg-teal-950/70 text-teal-700 dark:text-teal-300 border border-teal-200/50 mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            13 Calibrated Message Types
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--ink)] max-w-2xl mx-auto leading-tight">
            Craft the perfect message from scratch.
          </h1>
          <p className="mt-2 text-sm text-[var(--mute)] max-w-xl mx-auto">
            Select your message type, outline what you need to convey, and let ReplyPilot compose a
            human, tactful draft ready to copy and send.
          </p>
        </div>

        {/* Quick Presets */}
        <div className="bg-[var(--card)] p-4 rounded-2xl border border-[var(--line)] shadow-sm">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--mute)] flex items-center gap-1">
              <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
              Quick Presets
            </span>
            <span className="text-xs text-[var(--mute)]">1-click fill</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {PRESETS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleLoadPreset(p)}
                className="text-left p-2.5 rounded-xl border border-[var(--line)] hover:border-teal-500 hover:bg-teal-50/40 dark:hover:bg-teal-950/20 transition-all"
              >
                <div className="text-xs font-bold text-[var(--ink)]">{p.kind}</div>
                <div className="text-[11px] text-[var(--mute)] line-clamp-2 mt-0.5">
                  {p.purpose}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Builder Form */}
        <form
          onSubmit={handleStartGenerate}
          className="bg-[var(--card)] p-5 sm:p-6 rounded-2xl border border-[var(--line)] shadow-sm space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--ink)] mb-1.5">
                Type of Message
              </label>
              <select
                value={kind}
                onChange={(e) => setKind(e.target.value)}
                className="w-full text-xs rounded-xl border border-[var(--line)] bg-[var(--card)] p-2.5 text-[var(--ink)] font-semibold"
              >
                {MESSAGE_KINDS.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--ink)] mb-1.5">
                Recipient or Audience
              </label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="e.g. My team, A new prospective client, A close friend"
                className="w-full text-xs rounded-xl border border-[var(--line)] bg-[var(--card)] p-2.5 text-[var(--ink)]"
              >
              </input>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--ink)] mb-1.5">
              What do you want to communicate? *
            </label>
            <textarea
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g. Invite someone to spend time with me, or address an uncomfortable fee discrepancy..."
              rows={3}
              required
              className="w-full text-xs rounded-xl border border-[var(--line)] bg-[var(--card)] p-3 text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--ink)] mb-1">
                Tone
              </label>
              <input
                type="text"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                placeholder="e.g. Warm, sincere, firm"
                className="w-full text-xs rounded-xl border border-[var(--line)] bg-[var(--card)] p-2 text-[var(--ink)]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--ink)] mb-1">
                Length
              </label>
              <select
                value={length}
                onChange={(e) => setLength(e.target.value)}
                className="w-full text-xs rounded-xl border border-[var(--line)] bg-[var(--card)] p-2 text-[var(--ink)]"
              >
                <option value="Short">Short</option>
                <option value="Medium">Medium</option>
                <option value="Long">Long</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--ink)] mb-1">
                Language (Optional)
              </label>
              <input
                type="text"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                placeholder="e.g. English, Spanish, French"
                className="w-full text-xs rounded-xl border border-[var(--line)] bg-[var(--card)] p-2 text-[var(--ink)]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--ink)] mb-1">
                Important facts to include
              </label>
              <textarea
                value={facts}
                onChange={(e) => setFacts(e.target.value)}
                placeholder="Specific dates, deliverables, context..."
                rows={2}
                className="w-full text-xs rounded-xl border border-[var(--line)] bg-[var(--card)] p-2.5 text-[var(--ink)]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--ink)] mb-1">
                Details or traps to avoid
              </label>
              <textarea
                value={avoid}
                onChange={(e) => setAvoid(e.target.value)}
                placeholder="e.g. Don't sound accusatory, avoid over-promising..."
                rows={2}
                className="w-full text-xs rounded-xl border border-[var(--line)] bg-[var(--card)] p-2.5 text-[var(--ink)]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--ink)] mb-1">
              Desired outcome
            </label>
            <input
              type="text"
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
              placeholder="e.g. Lock in a date, clear the air, get sign-off"
              className="w-full text-xs rounded-xl border border-[var(--line)] bg-[var(--card)] p-2.5 text-sm text-[var(--ink)]"
            />
          </div>

          <button
            type="submit"
            disabled={isBusy}
            className="w-full py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="h-4 w-4" />
            <span>Generate Message Draft</span>
          </button>
        </form>
      </div>
    );
  }

  // -------------------------------------------------------------
  // ACTIVE MESSAGE BUILDER WORKSPACE
  // -------------------------------------------------------------
  const draft = workspace.draft;
  const versions = draft?.versions || [];

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-28">
      {/* Top Header */}
      <div className="flex items-center justify-between bg-[var(--card)] p-3 rounded-2xl border border-[var(--line)] shadow-sm">
        <button
          onClick={onNewMessage}
          className="flex items-center gap-1 text-xs font-semibold text-[var(--mute)] hover:text-[var(--ink)] bg-[var(--bg)] px-2.5 py-1.5 rounded-xl border border-[var(--line)] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>New Message</span>
        </button>
        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
          {workspace.b?.kind || "Message"} Draft
        </span>
      </div>

      {/* Editor Card */}
      <div className="bg-[var(--card)] p-5 rounded-2xl border border-[var(--line)] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[var(--ink)]">{workspace.title}</h2>
          <span className="text-xs text-[var(--mute)]">
            {draft?.cur?.length || 0} chars · {draft?.cur?.split(/\s+/).filter(Boolean).length || 0} words
          </span>
        </div>

        <textarea
          value={draft?.cur || ""}
          onChange={(e) => onUpdateDraftText(e.target.value)}
          onBlur={() => onCommitDraftText("Edited")}
          rows={8}
          className="w-full text-base leading-relaxed rounded-xl border border-[var(--line)] bg-[var(--card)] p-3.5 text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-teal-500 font-sans"
        />

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 py-2 px-3.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                copiedDraft ? "bg-emerald-600 text-white" : "bg-teal-600 hover:bg-teal-700 text-white"
              }`}
            >
              {copiedDraft ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy Message</span>
                </>
              )}
            </button>

            <button
              onClick={onToggleSaveDraft}
              className={`flex items-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-semibold transition-colors ${
                draft?.saved
                  ? "border-amber-400 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300"
                  : "border-[var(--line)] bg-[var(--card)] hover:bg-[var(--bg)] text-[var(--ink)]"
              }`}
            >
              <Bookmark className={`h-3.5 w-3.5 ${draft?.saved ? "fill-amber-400 text-amber-500" : ""}`} />
              <span>{draft?.saved ? "Saved" : "Save Draft"}</span>
            </button>
          </div>

          <button
            onClick={() => setShowVersions(!showVersions)}
            className="flex items-center gap-1 text-xs text-[var(--mute)] hover:text-[var(--ink)] px-2 py-1"
          >
            <History className="h-3.5 w-3.5" />
            <span>Versions ({versions.length})</span>
            {showVersions ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        </div>

        {/* Version History Drawer */}
        {showVersions && (
          <div className="p-3 rounded-xl bg-[var(--bg)] border border-[var(--line)] space-y-2 max-h-48 overflow-y-auto">
            <div className="text-[11px] font-bold text-[var(--mute)] uppercase tracking-wider">
              Version History
            </div>
            {versions
              .slice()
              .reverse()
              .map((ver, revIdx) => {
                const originalIdx = versions.length - 1 - revIdx;
                const isCurrent = originalIdx === versions.length - 1;
                return (
                  <div
                    key={originalIdx}
                    className="flex items-center justify-between gap-2 p-2 rounded-lg bg-[var(--card)] border border-[var(--line)] text-xs"
                  >
                    <div className="truncate max-w-[70%]">
                      <span className="font-bold text-[var(--ink)] mr-1.5">{ver.label}</span>
                      <span className="text-[10px] text-[var(--mute)]">
                        {new Date(ver.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      <p className="text-[11px] text-[var(--mute)] truncate">{ver.text}</p>
                    </div>
                    {isCurrent ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
                        Current
                      </span>
                    ) : (
                      <button
                        onClick={() => onRestoreVersion(originalIdx)}
                        className="flex items-center gap-1 text-xs font-semibold text-teal-600 hover:underline"
                      >
                        <RotateCcw className="h-3 w-3" />
                        Restore
                      </button>
                    )}
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* 13 One-Tap Rewrites */}
      <div className="bg-[var(--card)] p-4 rounded-2xl border border-[var(--line)] shadow-sm space-y-2.5">
        <span className="text-xs font-bold uppercase tracking-wider text-[var(--ink)] flex items-center gap-1">
          <Sparkles className="h-3.5 w-3.5 text-teal-600" />
          13 Instant Rewrites
        </span>
        <div className="flex flex-wrap gap-1.5">
          {REWRITE_ACTIONS.map((action) => {
            const isMyStyle = action.k === "my";
            const isDisabled = isBusy || (isMyStyle && !writingStyle.trim());
            return (
              <button
                key={action.k}
                onClick={() => onRewrite(action.k, action.label, action.instr)}
                disabled={isDisabled}
                className={`text-xs px-2.5 py-1.5 rounded-xl border transition-all ${
                  isMyStyle
                    ? "border-teal-500 bg-teal-50/60 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 font-bold"
                    : "border-[var(--line)] bg-[var(--card)] hover:bg-[var(--bg)] text-[var(--ink)] font-medium"
                } hover:scale-102 active:scale-98 disabled:opacity-40`}
              >
                {action.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tactical Notes & Clarifying Questions */}
      {workspace.notes && (
        <div className="p-3.5 rounded-2xl bg-teal-50/60 dark:bg-teal-950/30 border border-teal-200/50 dark:border-teal-900/40 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-teal-800 dark:text-teal-200">
            <Lightbulb className="h-4 w-4 text-teal-600" />
            <span>Tactical Advice</span>
          </div>
          <p className="text-xs text-teal-950 dark:text-teal-100">{workspace.notes}</p>
        </div>
      )}

      {workspace.qs && workspace.qs.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-[var(--card)] border border-[var(--line)] space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--ink)]">
            <HelpCircle className="h-4 w-4 text-amber-500" />
            <span>To refine this draft further:</span>
          </div>
          <ul className="list-disc pl-4 text-xs text-[var(--mute)] space-y-0.5">
            {workspace.qs.map((q, idx) => (
              <li key={idx}>{q}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Persistent Refinement Bar */}
      <div className="fixed bottom-14 left-0 right-0 z-30 px-3 py-2 bg-[var(--card)]/90 backdrop-blur-md border-t border-[var(--line)] shadow-xl">
        <div className="max-w-4xl mx-auto flex items-center gap-2">
          <input
            type="text"
            value={refinementInput}
            onChange={(e) => setRefinementInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendRefinement()}
            placeholder="Refine draft: 'make it warmer', 'add that I will follow up next Monday'..."
            className="flex-1 text-xs rounded-xl border border-[var(--line)] bg-[var(--bg)] p-2.5 text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <button
            onClick={handleSendRefinement}
            disabled={isBusy || !refinementInput.trim()}
            className="py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1"
          >
            <Send className="h-3.5 w-3.5" />
            <span>Revise</span>
          </button>
        </div>
      </div>
    </div>
  );
};
