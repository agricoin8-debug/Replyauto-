"use client";

import React, { useState, useRef } from "react";
import {
  Workspace,
  CRMContact,
  AnalysisResult,
  DraftVersion,
} from "@/lib/types";
import {
  Send,
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  History,
  FileText,
  AlertTriangle,
  Clock,
  Target,
  HelpCircle,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Upload,
  User,
  Building,
  RefreshCw,
  Bookmark,
  Share2,
  Trash2,
  ArrowLeft,
  MessageCircle,
  Lightbulb,
} from "lucide-react";
import { CONVERSATION_TEMPLATES } from "@/lib/sampleData";

interface ReplyWorkspaceProps {
  workspace: Workspace | null;
  workspaces: Workspace[];
  crmContacts: CRMContact[];
  onSelectWorkspace: (id: string) => void;
  onDeleteWorkspace: (id: string) => void;
  onNewWorkspace: () => void;
  onStartAnalysis: (formData: {
    summary: string;
    outcome: string;
    person: string;
    rel: string;
    history: string;
    latest: string;
    crmContactId?: string;
  }) => Promise<void>;
  onAnalyze: (instruction: string, incomingMessage?: string) => Promise<void>;
  onRewrite: (actionKey: string, actionLabel: string, actionInstruction: string) => Promise<void>;
  onUpdateDraftText: (text: string) => void;
  onCommitDraftText: (label: string) => void;
  onRestoreVersion: (index: number) => void;
  onToggleSaveDraft: () => void;
  onAddManualMessage: (who: "me" | "them", text: string) => void;
  onUpdateSummary: (newSummary: string) => void;
  onLinkCRMContact: (workspaceId: string, contactId: string) => void;
  onSyncToCRM: (workspace: Workspace) => Promise<void>;
  isBusy: boolean;
  busyLabel: string;
  copyToClipboard: (text: string) => void;
  writingStyle: string;
}

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

export const ReplyWorkspace: React.FC<ReplyWorkspaceProps> = ({
  workspace,
  workspaces,
  crmContacts,
  onSelectWorkspace,
  onDeleteWorkspace,
  onNewWorkspace,
  onStartAnalysis,
  onAnalyze,
  onRewrite,
  onUpdateDraftText,
  onCommitDraftText,
  onRestoreVersion,
  onToggleSaveDraft,
  onAddManualMessage,
  onUpdateSummary,
  onLinkCRMContact,
  onSyncToCRM,
  isBusy,
  busyLabel,
  copyToClipboard,
  writingStyle,
}) => {
  // New Workspace form state
  const [formSummary, setFormSummary] = useState("");
  const [formOutcome, setFormOutcome] = useState("");
  const [formPerson, setFormPerson] = useState("");
  const [formRel, setFormRel] = useState("");
  const [formLatest, setFormLatest] = useState("");
  const [formHistory, setFormHistory] = useState("");
  const [formCrmContactId, setFormCrmContactId] = useState("");
  const [showOptional, setShowOptional] = useState(false);

  // Active Workspace interaction state
  const [manualMsgWho, setManualMsgWho] = useState<"them" | "me">("them");
  const [manualMsgText, setManualMsgText] = useState("");
  const [editableSummary, setEditableSummary] = useState(workspace?.summary || "");
  const [followUpInput, setFollowUpInput] = useState("");
  const [isIncomingCheck, setIsIncomingCheck] = useState(false);
  const [clarifyingAnswer, setClarifyingAnswer] = useState("");
  const [copiedDraft, setCopiedDraft] = useState(false);
  const [copiedAltIndex, setCopiedAltIndex] = useState<number | null>(null);
  const [copiedFu, setCopiedFu] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [activeTabMobile, setActiveTabMobile] = useState<"reply" | "analysis" | "context">("reply");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync summary when workspace changes
  React.useEffect(() => {
    if (workspace) {
      setEditableSummary(workspace.summary || "");
    }
  }, [workspace?.id, workspace?.summary]);

  // Load a conversation template
  const handleLoadTemplate = (tpl: (typeof CONVERSATION_TEMPLATES)[0]) => {
    setFormSummary(tpl.summary);
    setFormOutcome(tpl.outcome);
    setFormPerson(tpl.person);
    setFormRel(tpl.rel);
    setFormLatest(tpl.latest);
    setFormHistory(tpl.history);
    setShowOptional(true);
  };

  // Handle .txt chat upload parsing
  const handleTxtFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      if (!content) return;
      setFormHistory(content);
      if (!formSummary) {
        setFormSummary(`Uploaded conversation log: ${file.name}`);
      }
      setShowOptional(true);
    };
    reader.readAsText(file);
  };

  // Submit initial analysis
  const handleSubmitInitial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSummary.trim() && !formHistory.trim() && !formLatest.trim()) {
      alert("Please provide either a summary, recent message, or chat history to begin.");
      return;
    }
    await onStartAnalysis({
      summary: formSummary,
      outcome: formOutcome,
      person: formPerson,
      rel: formRel,
      history: formHistory,
      latest: formLatest,
      crmContactId: formCrmContactId || undefined,
    });
  };

  // Send conversational follow-up
  const handleSendFollowUp = async () => {
    if (!followUpInput.trim() || isBusy) return;
    const input = followUpInput.trim();
    setFollowUpInput("");
    if (isIncomingCheck) {
      await onAnalyze("", input);
    } else {
      await onAnalyze(input);
    }
  };

  // Answer clarifying question
  const handleAnswerQuestion = async () => {
    if (!clarifyingAnswer.trim() || !workspace?.a?.q || isBusy) return;
    const ans = clarifyingAnswer.trim();
    setClarifyingAnswer("");
    await onAnalyze(`Answer to your question "${workspace.a.q}": ${ans}`);
  };

  // Add manual message to thread
  const handleAddManualMessage = () => {
    if (!manualMsgText.trim()) return;
    onAddManualMessage(manualMsgWho, manualMsgText.trim());
    setManualMsgText("");
  };

  // Copy draft handler with check animation
  const handleCopyDraft = () => {
    if (!workspace?.draft?.cur) return;
    copyToClipboard(workspace.draft.cur);
    setCopiedDraft(true);
    setTimeout(() => setCopiedDraft(false), 2000);
  };

  // Linked CRM contact if any
  const linkedContact = workspace?.crmContactId
    ? crmContacts.find((c) => c.id === workspace.crmContactId)
    : null;

  // -------------------------------------------------------------
  // VIEW A: NO WORKSPACE SELECTED -> NEW CONVERSATION FORM & RECENT
  // -------------------------------------------------------------
  if (!workspace) {
    const recentReplyWorkspaces = workspaces
      .filter((w) => w.kind === "reply")
      .sort((a, b) => (b.at < a.at ? -1 : 1));

    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-24">
        {/* Hero Section */}
        <div className="text-center py-4 px-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 dark:bg-teal-950/70 text-teal-700 dark:text-teal-300 border border-teal-200/50 mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            AI-Powered Conversation Copilot
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--ink)] max-w-2xl mx-auto leading-tight">
            Understand the conversation. Find the right words. Know what to do next.
          </h1>
          <p className="mt-2 text-sm text-[var(--mute)] max-w-xl mx-auto">
            Paste or summarize any discussion. Get calibrated replies with 13 instant rewrites,
            strategic analysis, Next Best Action, and seamless CRM logging.
          </p>
        </div>

        {/* Quick Presets / Templates */}
        <div className="bg-[var(--card)] p-4 rounded-2xl border border-[var(--line)] shadow-sm">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--mute)] flex items-center gap-1">
              <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
              Quick Templates
            </span>
            <span className="text-xs text-[var(--mute)]">1-click fill</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {CONVERSATION_TEMPLATES.map((tpl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleLoadTemplate(tpl)}
                className="text-left p-2.5 rounded-xl border border-[var(--line)] hover:border-teal-500 hover:bg-teal-50/40 dark:hover:bg-teal-950/20 transition-all group"
              >
                <div className="text-xs font-bold text-[var(--ink)] group-hover:text-teal-600 dark:group-hover:text-teal-400">
                  {tpl.title}
                </div>
                <div className="text-[11px] text-[var(--mute)] truncate mt-0.5">
                  {tpl.summary}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Intake Form */}
        <form
          onSubmit={handleSubmitInitial}
          className="bg-[var(--card)] p-5 sm:p-6 rounded-2xl border border-[var(--line)] shadow-sm space-y-4"
        >
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--ink)] mb-1.5">
              What is the conversation about? What happened most recently? *
            </label>
            <textarea
              value={formSummary}
              onChange={(e) => setFormSummary(e.target.value)}
              placeholder="e.g. A client is requesting out-of-scope work before paying our invoice, or someone canceled plans for the second time..."
              rows={3}
              required
              className="w-full rounded-xl border border-[var(--line)] bg-[var(--card)] p-3 text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--ink)] mb-1.5">
              What outcome do you want?
            </label>
            <input
              type="text"
              value={formOutcome}
              onChange={(e) => setFormOutcome(e.target.value)}
              placeholder="e.g. Firmly protect scope while keeping them happy, confirm meeting date, or decline politely"
              className="w-full rounded-xl border border-[var(--line)] bg-[var(--card)] p-2.5 text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* CRM Contact Link Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--ink)] mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Building className="h-3.5 w-3.5 text-teal-600" />
                Link to CRM Contact (Optional)
              </span>
              <span className="text-[11px] font-normal text-[var(--mute)]">
                Syncs replies directly to timeline
              </span>
            </label>
            <select
              value={formCrmContactId}
              onChange={(e) => {
                setFormCrmContactId(e.target.value);
                const found = crmContacts.find((c) => c.id === e.target.value);
                if (found && !formPerson) setFormPerson(found.name);
                if (found && !formRel) setFormRel(`${found.stage} at ${found.company}`);
              }}
              className="w-full rounded-xl border border-[var(--line)] bg-[var(--card)] p-2.5 text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">None (Standalone conversation)</option>
              {crmContacts.map((contact) => (
                <option key={contact.id} value={contact.id}>
                  {contact.name} ({contact.company} - {contact.stage})
                </option>
              ))}
            </select>
          </div>

          {/* Optional Details Accordion */}
          <div className="border border-[var(--line)] rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowOptional(!showOptional)}
              className="w-full flex items-center justify-between p-3 bg-[var(--bg)]/50 text-xs font-bold text-[var(--ink)] hover:bg-[var(--bg)] transition-colors"
            >
              <span className="flex items-center gap-1.5">
                {showOptional ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                Optional Details (Who, Relationship, Chat History & .txt file)
              </span>
              <span className="text-[11px] font-normal text-[var(--mute)]">
                {showOptional ? "Hide" : "Expand"}
              </span>
            </button>

            {showOptional && (
              <div className="p-4 space-y-3 bg-[var(--card)] border-t border-[var(--line)]">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[var(--ink)] mb-1">
                      Who are you talking to?
                    </label>
                    <input
                      type="text"
                      value={formPerson}
                      onChange={(e) => setFormPerson(e.target.value)}
                      placeholder="e.g. Marcus, Boss, Landlord, Date"
                      className="w-full rounded-xl border border-[var(--line)] bg-[var(--card)] p-2 text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--ink)] mb-1">
                      Relationship context
                    </label>
                    <input
                      type="text"
                      value={formRel}
                      onChange={(e) => setFormRel(e.target.value)}
                      placeholder="e.g. Key client, Co-worker, Partner, Friend"
                      className="w-full rounded-xl border border-[var(--line)] bg-[var(--card)] p-2 text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--ink)] mb-1">
                    Latest message you received
                  </label>
                  <textarea
                    value={formLatest}
                    onChange={(e) => setFormLatest(e.target.value)}
                    placeholder="Paste the exact message you need to answer..."
                    rows={2}
                    className="w-full rounded-xl border border-[var(--line)] bg-[var(--card)] p-2 text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-[var(--ink)]">
                      Full chat history (start lines with &quot;Me:&quot; or &quot;Them:&quot;)
                    </label>
                    <div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept=".txt"
                        onChange={handleTxtFileUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-1 text-xs font-medium text-teal-600 dark:text-teal-400 hover:underline"
                      >
                        <Upload className="h-3 w-3" />
                        Upload .txt chat export
                      </button>
                    </div>
                  </div>
                  <textarea
                    value={formHistory}
                    onChange={(e) => setFormHistory(e.target.value)}
                    placeholder={`Me: Hey, are we still meeting today?\nThem: Running 15 minutes late, sorry!`}
                    rows={4}
                    className="w-full rounded-xl border border-[var(--line)] bg-[var(--card)] p-2 font-mono text-xs text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Privacy Note */}
          <div className="p-3 rounded-xl bg-teal-50/60 dark:bg-teal-950/30 border border-teal-200/40 dark:border-teal-900/40 text-xs text-teal-900 dark:text-teal-200 flex items-start gap-2">
            <ShieldAlert className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
            <span>
              <strong>Private &amp; Suggestion-only:</strong> ReplyPilot only suggests answers.
              Nothing is ever sent automatically to anyone. With only a summary, the analysis rests
              on that summary alone.
            </span>
          </div>

          <button
            type="submit"
            disabled={isBusy}
            className="w-full py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
          >
            {isBusy ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>{busyLabel || "Analyzing conversation..."}</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Analyze conversation &amp; Generate Best Reply</span>
              </>
            )}
          </button>
        </form>

        {/* Recent Workspaces */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--mute)]">
            Recent Conversations
          </h2>
          {recentReplyWorkspaces.length === 0 ? (
            <div className="bg-[var(--card)] p-8 rounded-2xl border border-[var(--line)] text-center text-sm text-[var(--mute)]">
              No conversations analyzed yet. Start above to create your first workspace.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {recentReplyWorkspaces.slice(0, 8).map((w) => {
                const crmL = w.crmContactId
                  ? crmContacts.find((c) => c.id === w.crmContactId)
                  : null;
                return (
                  <div
                    key={w.id}
                    className="bg-[var(--card)] p-4 rounded-2xl border border-[var(--line)] hover:border-teal-500/50 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-semibold text-[var(--mute)] flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(w.at).toLocaleDateString([], {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {crmL && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200">
                            {crmL.company}
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-sm text-[var(--ink)] mt-1.5 line-clamp-1">
                        {w.title}
                      </h3>
                      {w.draft?.cur && (
                        <p className="text-xs text-[var(--mute)] line-clamp-2 mt-1 italic">
                          &quot;{w.draft.cur}&quot;
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--line)]">
                      <button
                        onClick={() => onSelectWorkspace(w.id)}
                        className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
                      >
                        Open Workspace →
                      </button>
                      <button
                        onClick={() => onDeleteWorkspace(w.id)}
                        className="text-[var(--mute)] hover:text-red-500 p-1"
                        title="Delete conversation"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW B: ACTIVE WORKSPACE (SPLIT DESKTOP / TABBED MOBILE)
  // -------------------------------------------------------------
  const a = workspace.a;
  const draft = workspace.draft;
  const versions = draft?.versions || [];

  const urgencyConfig = {
    now: { label: "Reply soon", color: "bg-red-50 dark:bg-red-950/80 text-red-700 dark:text-red-300 border-red-300" },
    soon: { label: "Replying today is reasonable", color: "bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border-teal-300" },
    can_wait: { label: "Waiting is reasonable", color: "bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border-blue-300" },
  };
  const urg = a?.urg ? urgencyConfig[a.urg] : urgencyConfig.soon;

  return (
    <div className="max-w-6xl mx-auto space-y-4 pb-28">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-[var(--card)] p-3 rounded-2xl border border-[var(--line)] shadow-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={onNewWorkspace}
            className="flex items-center gap-1 text-xs font-semibold text-[var(--mute)] hover:text-[var(--ink)] bg-[var(--bg)] px-2.5 py-1.5 rounded-xl border border-[var(--line)] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>All Conversations</span>
          </button>
          <div className="flex items-center gap-1.5">
            <h2 className="text-sm font-bold text-[var(--ink)] truncate max-w-[200px] sm:max-w-xs">
              {workspace.title}
            </h2>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[var(--bg)] text-[var(--mute)] border border-[var(--line)]">
              #{workspace.n}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Linked CRM contact badge */}
          {linkedContact ? (
            <div
              title={`Linked to ${linkedContact.name} (${linkedContact.company})`}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-[11px] font-bold text-blue-700 dark:text-blue-300"
            >
              <User className="h-3 w-3" />
              <span>{linkedContact.name}</span>
            </div>
          ) : (
            <select
              value=""
              onChange={(e) => onLinkCRMContact(workspace.id, e.target.value)}
              className="text-xs rounded-xl border border-[var(--line)] bg-[var(--card)] px-2 py-1 text-[var(--mute)]"
            >
              <option value="">+ Link CRM Contact</option>
              {crmContacts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.company})
                </option>
              ))}
            </select>
          )}

          {/* Sync to CRM button */}
          <button
            onClick={() => onSyncToCRM(workspace)}
            className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 transition-colors"
            title="Log this reply and analysis to CRM"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Sync CRM</span>
          </button>

          {/* Delete workspace */}
          <button
            onClick={() => onDeleteWorkspace(workspace.id)}
            className="p-1.5 text-[var(--mute)] hover:text-red-500 rounded-xl"
            title="Delete this workspace"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Mobile Tab Switcher */}
      <div className="flex sm:hidden border border-[var(--line)] rounded-xl bg-[var(--card)] p-1">
        <button
          onClick={() => setActiveTabMobile("reply")}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
            activeTabMobile === "reply"
              ? "bg-teal-600 text-white"
              : "text-[var(--mute)] hover:text-[var(--ink)]"
          }`}
        >
          Reply &amp; Action
        </button>
        <button
          onClick={() => setActiveTabMobile("analysis")}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
            activeTabMobile === "analysis"
              ? "bg-teal-600 text-white"
              : "text-[var(--mute)] hover:text-[var(--ink)]"
          }`}
        >
          Analysis ({a ? "Ready" : "None"})
        </button>
        <button
          onClick={() => setActiveTabMobile("context")}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
            activeTabMobile === "context"
              ? "bg-teal-600 text-white"
              : "text-[var(--mute)] hover:text-[var(--ink)]"
          }`}
        >
          Chat Thread ({workspace.msgs.length})
        </button>
      </div>

      {/* Main Grid: Left (Context & Analysis) / Right (Reply, Rewrites & NBA) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* ========================================================= */}
        {/* LEFT COLUMN: CONTEXT & ANALYSIS (5 Cols)                  */}
        {/* ========================================================= */}
        <div
          className={`lg:col-span-5 space-y-4 ${
            activeTabMobile === "reply" ? "hidden sm:block" : "block"
          }`}
        >
          {/* Conversation Summary Box */}
          <div className="bg-[var(--card)] p-4 rounded-2xl border border-[var(--line)] shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--ink)] flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-teal-600" />
                Conversation Summary
              </span>
              <span className="text-[10px] text-[var(--mute)]">
                {workspace.msgs.length ? "Evolving" : "Summary only"}
              </span>
            </div>
            <textarea
              value={editableSummary}
              onChange={(e) => setEditableSummary(e.target.value)}
              rows={3}
              className="w-full text-xs rounded-xl border border-[var(--line)] bg-[var(--bg)] p-2.5 text-[var(--ink)] focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
            <div className="flex justify-end">
              <button
                onClick={() => onUpdateSummary(editableSummary)}
                disabled={isBusy}
                className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
              >
                <RefreshCw className="h-3 w-3" />
                Save &amp; Re-analyze
              </button>
            </div>
          </div>

          {/* Conversation Thread & Bubbles */}
          <div className="bg-[var(--card)] p-4 rounded-2xl border border-[var(--line)] shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--ink)] flex items-center gap-1.5">
                <MessageCircle className="h-3.5 w-3.5 text-teal-600" />
                Message History ({workspace.msgs.length})
              </span>
            </div>

            <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
              {workspace.msgs.length === 0 ? (
                <div className="text-center py-6 text-xs text-[var(--mute)] bg-[var(--bg)] rounded-xl p-3">
                  No individual messages provided. (Analysis is using the high-level summary).
                </div>
              ) : (
                workspace.msgs.map((m, idx) => {
                  const isMe = m.who === "me";
                  const isContext = m.who === "context";
                  return (
                    <div
                      key={idx}
                      className={`flex flex-col ${
                        isMe ? "items-end" : isContext ? "items-center" : "items-start"
                      }`}
                    >
                      <div
                        className={`max-w-[88%] text-xs p-2.5 rounded-2xl shadow-2xs whitespace-pre-wrap ${
                          isMe
                            ? "bg-teal-600 text-white rounded-br-none"
                            : isContext
                            ? "bg-[var(--bg)] text-[var(--mute)] text-center text-[11px] italic"
                            : "bg-[var(--bub)] text-[var(--ink)] rounded-bl-none border border-[var(--line)]"
                        }`}
                      >
                        <div
                          className={`text-[10px] font-bold mb-0.5 ${
                            isMe ? "text-teal-100" : "text-[var(--mute)]"
                          }`}
                        >
                          {isMe ? "Me" : isContext ? "Context" : "Them"}
                        </div>
                        {m.text}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Quick add message inline */}
            <div className="pt-2 border-t border-[var(--line)] space-y-1.5">
              <div className="flex items-center gap-2">
                <select
                  value={manualMsgWho}
                  onChange={(e) => setManualMsgWho(e.target.value as "them" | "me")}
                  className="text-xs rounded-lg border border-[var(--line)] bg-[var(--bg)] p-1.5 text-[var(--ink)] font-semibold"
                >
                  <option value="them">Them</option>
                  <option value="me">Me</option>
                </select>
                <input
                  type="text"
                  value={manualMsgText}
                  onChange={(e) => setManualMsgText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddManualMessage()}
                  placeholder="Add a message to thread..."
                  className="flex-1 text-xs rounded-lg border border-[var(--line)] bg-[var(--bg)] p-1.5 text-[var(--ink)] focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
                <button
                  onClick={handleAddManualMessage}
                  className="px-2.5 py-1.5 rounded-lg bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Deep Analysis Card */}
          {a ? (
            <div className="bg-[var(--card)] p-4 rounded-2xl border border-[var(--line)] shadow-sm space-y-4">
              {/* Urgency Pill & Note */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${urg.color}`}
                  >
                    <Clock className="h-3 w-3" />
                    {urg.label}
                  </span>
                </div>
                {a.urgNote && (
                  <p className="text-xs text-[var(--mute)] leading-relaxed italic">
                    {a.urgNote}
                  </p>
                )}
              </div>

              {/* User Goal */}
              {a.goal && (
                <div className="p-3 rounded-xl bg-[var(--bg)] border border-[var(--line)]">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--mute)] flex items-center gap-1 mb-1">
                    <Target className="h-3.5 w-3.5 text-teal-600" />
                    Your Strategic Goal
                  </div>
                  <p className="text-xs font-medium text-[var(--ink)] leading-snug">
                    {a.goal}
                  </p>
                </div>
              )}

              {/* Known Facts vs Interpretations */}
              <div className="space-y-3">
                {a.facts && a.facts.length > 0 && (
                  <div>
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-1 flex items-center gap-1">
                      <Check className="h-3 w-3" />
                      What is Known (Explicit Facts)
                    </h4>
                    <ul className="list-disc pl-4 text-xs text-[var(--ink)] space-y-1">
                      {a.facts.map((fact, idx) => (
                        <li key={idx} className="leading-relaxed">
                          {fact}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {a.interp && a.interp.length > 0 && (
                  <div>
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-1 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Possible Interpretations (Uncertain)
                    </h4>
                    <ul className="list-disc pl-4 text-xs text-[var(--ink)] space-y-1">
                      {a.interp.map((interp, idx) => (
                        <li key={idx} className="leading-relaxed">
                          {interp}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {a.missing && a.missing.length > 0 && (
                  <div>
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Missing Information
                    </h4>
                    <ul className="list-disc pl-4 text-xs text-[var(--mute)] space-y-1">
                      {a.missing.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Clarifying Question from AI */}
              {a.q && (
                <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-teal-800 dark:text-teal-200">
                    <HelpCircle className="h-4 w-4 text-teal-600" />
                    <span>To refine this advice:</span>
                  </div>
                  <p className="text-xs text-teal-950 dark:text-teal-100 font-medium">
                    {a.q}
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={clarifyingAnswer}
                      onChange={(e) => setClarifyingAnswer(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAnswerQuestion()}
                      placeholder="Your answer..."
                      className="flex-1 text-xs rounded-lg border border-teal-200 bg-[var(--card)] p-1.5 text-[var(--ink)] focus:outline-none"
                    />
                    <button
                      onClick={handleAnswerQuestion}
                      disabled={isBusy}
                      className="px-2.5 py-1.5 rounded-lg bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 transition-colors"
                    >
                      Update
                    </button>
                  </div>
                </div>
              )}

              {/* Limitations */}
              {a.lim && a.lim.length > 0 && (
                <div className="pt-2 border-t border-[var(--line)]">
                  <div className="text-[10px] uppercase font-bold text-[var(--mute)] mb-1">
                    Limitations
                  </div>
                  <ul className="list-disc pl-4 text-[11px] text-[var(--mute)] space-y-0.5">
                    {a.lim.map((lim, idx) => (
                      <li key={idx}>{lim}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-[var(--card)] p-4 rounded-2xl border border-[var(--line)] text-center text-xs text-[var(--mute)]">
              No analysis data yet. Click &quot;Generate best reply&quot; to begin.
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: CALIBRATED REPLY, REWRITES & ACTION (7 Cols) */}
        {/* ========================================================= */}
        <div
          className={`lg:col-span-7 space-y-4 ${
            activeTabMobile === "analysis" || activeTabMobile === "context"
              ? "hidden sm:block"
              : "block"
          }`}
        >
          {/* Controls: Tone / Length / Objective */}
          <div className="bg-[var(--card)] p-4 rounded-2xl border border-[var(--line)] shadow-sm space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--mute)] mb-1">
                  Tone
                </label>
                <select
                  value={workspace.opts.tone}
                  onChange={(e) => {
                    workspace.opts.tone = e.target.value;
                    onCommitDraftText(`Tone: ${e.target.value}`);
                  }}
                  className="w-full text-xs rounded-xl border border-[var(--line)] bg-[var(--bg)] p-2 text-[var(--ink)] font-medium"
                >
                  {[
                    "Natural",
                    "Warm",
                    "Direct",
                    "Professional",
                    "Casual",
                    "Romantic",
                    "Confident",
                  ].map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--mute)] mb-1">
                  Length
                </label>
                <select
                  value={workspace.opts.length}
                  onChange={(e) => {
                    workspace.opts.length = e.target.value;
                    onCommitDraftText(`Length: ${e.target.value}`);
                  }}
                  className="w-full text-xs rounded-xl border border-[var(--line)] bg-[var(--bg)] p-2 text-[var(--ink)] font-medium"
                >
                  {["Short", "Medium", "Long"].map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--mute)] mb-1">
                  Objective
                </label>
                <select
                  value={workspace.opts.objective}
                  onChange={(e) => {
                    workspace.opts.objective = e.target.value;
                    onCommitDraftText(`Objective: ${e.target.value}`);
                  }}
                  className="w-full text-xs rounded-xl border border-[var(--line)] bg-[var(--bg)] p-2 text-[var(--ink)] font-medium"
                >
                  <option value="">Let AI decide</option>
                  <option value="Clarify something">Clarify something</option>
                  <option value="Apologize">Apologize</option>
                  <option value="Set a boundary">Set a boundary</option>
                  <option value="Make a concrete plan">Make a concrete plan</option>
                  <option value="Reconnect">Reconnect</option>
                  <option value="Decline politely">Decline politely</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                onClick={() => onAnalyze("Generate a fresh best reply with these options.")}
                disabled={isBusy}
                className="flex-1 py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Generate Best Reply</span>
              </button>
              <button
                onClick={() => onAnalyze("Give me a completely different strategic angle.")}
                disabled={isBusy}
                className="py-2 px-3 rounded-xl border border-[var(--line)] bg-[var(--card)] hover:bg-[var(--bg)] text-[var(--ink)] font-semibold text-xs transition-colors"
              >
                Another Approach
              </button>
            </div>
          </div>

          {/* Editable Reply Box */}
          <div className="bg-[var(--card)] p-4 sm:p-5 rounded-2xl border border-[var(--line)] shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--ink)] flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-teal-600" />
                Recommended Reply (Editable)
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-[var(--mute)]">
                  {draft?.cur?.length || 0} chars · {draft?.cur?.split(/\s+/).filter(Boolean).length || 0} words
                </span>
              </div>
            </div>

            <textarea
              value={draft?.cur || ""}
              onChange={(e) => onUpdateDraftText(e.target.value)}
              onBlur={() => onCommitDraftText("Edited")}
              rows={6}
              placeholder="Your reply will appear here..."
              className="w-full text-base sm:text-base leading-relaxed rounded-xl border border-[var(--line)] bg-[var(--card)] p-3 text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-teal-500 font-sans"
            />

            {/* Action Buttons for Reply */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyDraft}
                  className={`flex items-center gap-1.5 py-2 px-3.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                    copiedDraft
                      ? "bg-emerald-600 text-white"
                      : "bg-teal-600 hover:bg-teal-700 text-white"
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
                      <span>Copy Reply</span>
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
                  <span>{draft?.saved ? "Saved to Drafts" : "Save Draft"}</span>
                </button>
              </div>

              {/* Version History Toggle */}
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
              <div className="mt-3 p-3 rounded-xl bg-[var(--bg)] border border-[var(--line)] space-y-2 max-h-48 overflow-y-auto">
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

          {/* 13 One-Tap Rewrites Section */}
          <div className="bg-[var(--card)] p-4 rounded-2xl border border-[var(--line)] shadow-sm space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--ink)] flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-teal-600" />
                13 Instant Rewrites
              </span>
              <span className="text-[10px] text-[var(--mute)]">One-tap calibrate</span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {REWRITE_ACTIONS.map((action) => {
                const isMyStyle = action.k === "my";
                const isDisabled = isBusy || (isMyStyle && !writingStyle.trim());
                return (
                  <button
                    key={action.k}
                    onClick={() => onRewrite(action.k, action.label, action.instr)}
                    disabled={isDisabled}
                    title={
                      isMyStyle && !writingStyle.trim()
                        ? "Configure writing style in Settings first"
                        : action.instr
                    }
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

          {/* Alternative Replies */}
          {a?.alts && a.alts.length > 0 && (
            <div className="bg-[var(--card)] p-4 rounded-2xl border border-[var(--line)] shadow-sm space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--ink)]">
                Alternative Reply Angles ({a.alts.length})
              </span>
              <div className="space-y-2.5">
                {a.alts.map((alt, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-[var(--line)] bg-[var(--bg)]/50 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[var(--ink)]">{alt.label}</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            onUpdateDraftText(alt.text);
                            onCommitDraftText(alt.label);
                          }}
                          className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline px-2 py-0.5"
                        >
                          Use This
                        </button>
                        <button
                          onClick={() => {
                            copyToClipboard(alt.text);
                            setCopiedAltIndex(idx);
                            setTimeout(() => setCopiedAltIndex(null), 2000);
                          }}
                          className="p-1 text-[var(--mute)] hover:text-[var(--ink)]"
                          title="Copy alternative"
                        >
                          {copiedAltIndex === idx ? (
                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-[var(--ink)] leading-relaxed">{alt.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Why This Reply Works Card */}
          {a?.why && (
            <div className="bg-[var(--card)] p-4 rounded-2xl border border-[var(--line)] shadow-sm space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--ink)] flex items-center gap-1.5">
                <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                Why This Reply Works
              </span>
              <p className="text-xs text-[var(--ink)] leading-relaxed">{a.why}</p>
            </div>
          )}

          {/* Next Best Action Card */}
          {a?.next && (
            <div className="bg-gradient-to-br from-teal-500/10 via-[var(--card)] to-[var(--card)] p-4 sm:p-5 rounded-2xl border-2 border-teal-500/60 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-teal-800 dark:text-teal-200 flex items-center gap-1.5">
                  <Target className="h-4 w-4 text-teal-600" />
                  Next Best Action
                </span>
                {a.next.timing && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200">
                    ⏱ {a.next.timing}
                  </span>
                )}
              </div>

              <div>
                <h4 className="text-sm font-bold text-[var(--ink)]">{a.next.action}</h4>
                <p className="text-xs text-[var(--mute)] mt-1 leading-relaxed">
                  {a.next.reason}
                </p>
              </div>

              {a.next.fu && (
                <div className="p-3 rounded-xl bg-[var(--card)] border border-[var(--line)] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[var(--mute)] uppercase">
                      Suggested Follow-up If Unanswered:
                    </span>
                    <button
                      onClick={() => {
                        copyToClipboard(a.next.fu);
                        setCopiedFu(true);
                        setTimeout(() => setCopiedFu(false), 2000);
                      }}
                      className="text-xs font-semibold text-teal-600 hover:underline flex items-center gap-1"
                    >
                      {copiedFu ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      <span>{copiedFu ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                  <p className="text-xs text-[var(--ink)] font-medium italic">&quot;{a.next.fu}&quot;</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Persistent Sticky Follow-up Chat Bar */}
      <div className="fixed bottom-14 left-0 right-0 z-30 px-3 py-2 bg-[var(--card)]/90 backdrop-blur-md border-t border-[var(--line)] shadow-xl">
        <div className="max-w-4xl mx-auto space-y-1.5">
          {/* Recent 2 chat messages inline */}
          {workspace.chat.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto text-[11px] text-[var(--mute)] pb-0.5">
              <span className="font-bold text-teal-600">Latest prompt:</span>
              <span className="truncate max-w-md">
                {workspace.chat[workspace.chat.length - 1]?.t}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={followUpInput}
                onChange={(e) => setFollowUpInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendFollowUp()}
                placeholder={
                  isIncomingCheck
                    ? "Paste the new incoming message from them..."
                    : "Ask or instruct: 'make it warmer', 'what if they reply with no?', 'focus on deadline'..."
                }
                className="w-full text-xs rounded-xl border border-[var(--line)] bg-[var(--bg)] p-2.5 pr-20 text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <label className="absolute right-2 top-2 flex items-center gap-1 text-[11px] font-medium text-[var(--mute)] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isIncomingCheck}
                  onChange={(e) => setIsIncomingCheck(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500 h-3.5 w-3.5"
                />
                <span>Them</span>
              </label>
            </div>

            <button
              onClick={handleSendFollowUp}
              disabled={isBusy || !followUpInput.trim()}
              className="py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1"
            >
              <Send className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
