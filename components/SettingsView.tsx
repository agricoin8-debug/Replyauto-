"use client";

import React, { useState } from "react";
import { AppSettings, Workspace, CRMContact } from "@/lib/types";
import {
  Settings,
  Cpu,
  Feather,
  ShieldCheck,
  Download,
  Upload,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Code2,
  Radio,
  FileJson,
} from "lucide-react";

interface SettingsViewProps {
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  workspaces: Workspace[];
  contacts: CRMContact[];
  onImportBackup: (importedData: { workspaces?: Workspace[]; contacts?: CRMContact[]; settings?: AppSettings }) => void;
  onWipeData: () => void;
  onOpenExportModal: () => void;
  toast: (msg: string) => void;
}

const STYLE_PRESETS = [
  {
    name: "Crisp & Direct",
    text: "Short sentences, zero fluff. Direct yet respectful. Bullet points when appropriate.",
  },
  {
    name: "Warm & Empathetic",
    text: "Warm, supportive tone. Validate their perspective before offering solutions. Friendly close.",
  },
  {
    name: "Casual / Modern",
    text: "Relaxed conversational rhythm. Avoid corporate buzzwords. Natural and human.",
  },
  {
    name: "Executive & Strategic",
    text: "High-level, structured, focused on business value, outcomes, and clear next steps.",
  },
];

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onSaveSettings,
  workspaces,
  contacts,
  onImportBackup,
  onWipeData,
  onOpenExportModal,
  toast,
}) => {
  const [provider, setProvider] = useState(settings.provider);
  const [ollamaBase, setOllamaBase] = useState(settings.ollamaBase);
  const [ollamaModel, setOllamaModel] = useState(settings.ollamaModel);
  const [openaiBase, setOpenaiBase] = useState(settings.openaiBase || "https://api.openai.com/v1");
  const [openaiModel, setOpenaiModel] = useState(settings.openaiModel || "gpt-4o-mini");
  const [openaiKey, setOpenaiKey] = useState(settings.openaiKey || "");
  const [style, setStyle] = useState(settings.style);

  // Ping status
  const [isChecking, setIsChecking] = useState(false);
  const [pingResult, setPingResult] = useState<{ ok: boolean; msg: string } | null>(null);

  const handleSave = () => {
    onSaveSettings({
      ...settings,
      provider,
      ollamaBase: ollamaBase.trim() || "http://localhost:11434",
      ollamaModel: ollamaModel.trim(),
      openaiBase: openaiBase.trim(),
      openaiModel: openaiModel.trim(),
      openaiKey: openaiKey.trim(),
      style: style.trim(),
    });
    toast("Settings saved successfully");
  };

  const handleCheckConnection = async () => {
    setIsChecking(true);
    setPingResult(null);
    try {
      const res = await fetch("/api/replypilot/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "ping_provider",
          provider,
          ollamaBase: ollamaBase.trim() || "http://localhost:11434",
        }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setPingResult({ ok: true, msg: data.message });
      } else {
        setPingResult({
          ok: false,
          msg: data.message || "Cannot connect to the selected provider.",
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setPingResult({ ok: false, msg: `Connection error: ${msg}` });
    } finally {
      setIsChecking(false);
    }
  };

  // Export full JSON backup
  const handleExportJson = () => {
    const backupData = {
      app: "ReplyPilot AI",
      version: "Phase 1 MVP",
      timestamp: new Date().toISOString(),
      settings: { ...settings, style },
      workspaces,
      contacts,
    };
    const jsonStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `replypilot_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast("Full backup exported to JSON file");
  };

  // Import JSON backup
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        onImportBackup(parsed);
        toast("Backup restored successfully");
      } catch {
        alert("Failed to parse JSON backup file.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-28">
      {/* Header */}
      <div className="bg-[var(--card)] p-4 sm:p-5 rounded-2xl border border-[var(--line)] shadow-sm">
        <h1 className="text-xl font-extrabold text-[var(--ink)] flex items-center gap-2">
          <Settings className="h-5 w-5 text-teal-600" />
          Settings &amp; Preferences
        </h1>
        <p className="text-xs text-[var(--mute)] mt-1">
          Configure model providers, customize your personal writing voice, manage CRM syncing, and
          control local data retention.
        </p>
      </div>

      {/* Model Provider Configuration */}
      <div className="bg-[var(--card)] p-5 rounded-2xl border border-[var(--line)] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--ink)] flex items-center gap-2">
            <Cpu className="h-4 w-4 text-teal-600" />
            Model Provider Architecture
          </h2>
          <span className="text-xs text-[var(--mute)]">Phase 1 Engine</span>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[var(--ink)] mb-1.5">
            Active Provider
          </label>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value as AppSettings["provider"])}
            className="w-full text-xs rounded-xl border border-[var(--line)] bg-[var(--bg)] p-2.5 text-[var(--ink)] font-semibold"
          >
            <option value="auto">Auto (Gemini 3.8 Flash default / Ollama fallback)</option>
            <option value="gemini">Gemini 3.8 Flash (Built-in Server-side AI)</option>
            <option value="ollama">Ollama (Local or Self-Hosted)</option>
            <option value="openai">OpenAI-Compatible (Groq, vLLM, DeepSeek, LocalAI)</option>
          </select>
        </div>

        {/* Ollama options */}
        {(provider === "ollama" || provider === "auto") && (
          <div className="p-3.5 rounded-xl bg-[var(--bg)] border border-[var(--line)] space-y-3">
            <div className="text-xs font-bold text-[var(--ink)] flex items-center gap-1.5">
              <span>🦙 Ollama Configuration</span>
            </div>
            <p className="text-[11px] text-[var(--mute)]">
              When running Ollama locally, start it with{" "}
              <code className="px-1.5 py-0.5 rounded bg-[var(--card)] border border-[var(--line)] font-mono text-[10px]">
                OLLAMA_ORIGINS=*
              </code>{" "}
              so web requests are accepted. If Ollama is unreachable, ReplyPilot automatically falls
              back to Gemini 3.8 Flash with a visible alert banner.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-[var(--ink)] mb-1">
                  Ollama Base URL
                </label>
                <input
                  type="text"
                  value={ollamaBase}
                  onChange={(e) => setOllamaBase(e.target.value)}
                  placeholder="http://localhost:11434"
                  className="w-full text-xs rounded-xl border border-[var(--line)] bg-[var(--card)] p-2 text-[var(--ink)] font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--ink)] mb-1">
                  Ollama Model
                </label>
                <input
                  type="text"
                  value={ollamaModel}
                  onChange={(e) => setOllamaModel(e.target.value)}
                  placeholder="e.g. llama3.2, mistral, qwen2.5"
                  className="w-full text-xs rounded-xl border border-[var(--line)] bg-[var(--card)] p-2 text-[var(--ink)] font-mono"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCheckConnection}
                disabled={isChecking}
                className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg border border-[var(--line)] bg-[var(--card)] hover:bg-[var(--bg)] text-xs font-semibold text-[var(--ink)] transition-colors"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isChecking ? "animate-spin" : ""}`} />
                <span>Check Ollama Connection</span>
              </button>
            </div>
          </div>
        )}

        {/* OpenAI Compatible options */}
        {provider === "openai" && (
          <div className="p-3.5 rounded-xl bg-[var(--bg)] border border-[var(--line)] space-y-3">
            <div className="text-xs font-bold text-[var(--ink)]">OpenAI-Compatible Endpoint</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-[var(--ink)] mb-1">
                  Base URL
                </label>
                <input
                  type="text"
                  value={openaiBase}
                  onChange={(e) => setOpenaiBase(e.target.value)}
                  placeholder="https://api.openai.com/v1"
                  className="w-full text-xs rounded-xl border border-[var(--line)] bg-[var(--card)] p-2 font-mono text-[var(--ink)]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[var(--ink)] mb-1">
                  Model
                </label>
                <input
                  type="text"
                  value={openaiModel}
                  onChange={(e) => setOpenaiModel(e.target.value)}
                  placeholder="gpt-4o-mini"
                  className="w-full text-xs rounded-xl border border-[var(--line)] bg-[var(--card)] p-2 font-mono text-[var(--ink)]"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[var(--ink)] mb-1">
                API Key (Optional)
              </label>
              <input
                type="password"
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full text-xs rounded-xl border border-[var(--line)] bg-[var(--card)] p-2 text-[var(--ink)]"
              />
            </div>
          </div>
        )}

        {pingResult && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              pingResult.ok
                ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border border-emerald-300"
                : "bg-red-50 dark:bg-red-950/60 text-red-800 dark:text-red-200 border border-red-300"
            }`}
          >
            {pingResult.ok ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
            )}
            <span>{pingResult.msg}</span>
          </div>
        )}
      </div>

      {/* Writing Style */}
      <div className="bg-[var(--card)] p-5 rounded-2xl border border-[var(--line)] shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--ink)] flex items-center gap-2">
            <Feather className="h-4 w-4 text-teal-600" />
            My Writing Style
          </h2>
          <span className="text-[10px] text-[var(--mute)]">Powers the &quot;My Style&quot; rewrite</span>
        </div>

        <p className="text-xs text-[var(--mute)]">
          Describe how you naturally communicate. When you click the <strong>&quot;My style&quot;</strong>{" "}
          rewrite button on any reply or message, the AI will re-phrase it to match your voice.
        </p>

        <div className="flex flex-wrap gap-2">
          {STYLE_PRESETS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setStyle(p.text)}
              className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-[var(--line)] bg-[var(--bg)] hover:bg-teal-50 dark:hover:bg-teal-950/40 text-[var(--ink)] transition-colors"
            >
              + {p.name}
            </button>
          ))}
        </div>

        <textarea
          value={style}
          onChange={(e) => setStyle(e.target.value)}
          placeholder="e.g. Short lowercase texts, rarely use exclamation marks, keep things light, empathetic, no corporate jargon..."
          rows={3}
          className="w-full text-xs rounded-xl border border-[var(--line)] bg-[var(--bg)] p-3 text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-teal-500"
        />

        <div className="flex justify-end pt-1">
          <button
            onClick={handleSave}
            className="py-2 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition-all"
          >
            Save Settings
          </button>
        </div>
      </div>

      {/* Privacy & Prompt Injection Protection */}
      <div className="bg-[var(--card)] p-5 rounded-2xl border border-[var(--line)] shadow-sm space-y-2.5">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--ink)] flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          Privacy &amp; Security Architecture
        </h2>
        <div className="space-y-1 text-xs text-[var(--mute)] leading-relaxed">
          <p>
            • <strong>Suggestion-Only:</strong> ReplyPilot strictly generates suggestions. No external
            messaging APIs are granted send permissions.
          </p>
          <p>
            • <strong>Prompt-Injection Fencing:</strong> Untrusted user conversations are isolated
            inside strict <code className="text-teal-600">&lt;data&gt;</code> tags so instructions in
            pasted text cannot override model constraints.
          </p>
          <p>
            • <strong>Local-First Storage:</strong> All conversation workspaces, drafts, and CRM contacts
            are stored in your browser&apos;s local storage.
          </p>
        </div>
      </div>

      {/* Backup, Single-file HTML & Reset Data */}
      <div className="bg-[var(--card)] p-5 rounded-2xl border border-[var(--line)] shadow-sm space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--ink)]">
          Data Management &amp; Standalone Export
        </h2>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            onClick={handleExportJson}
            className="flex items-center gap-1.5 py-2 px-3 rounded-xl border border-[var(--line)] bg-[var(--card)] hover:bg-[var(--bg)] text-xs font-semibold text-[var(--ink)] transition-colors"
          >
            <Download className="h-3.5 w-3.5 text-teal-600" />
            <span>Export Full Backup (JSON)</span>
          </button>

          <label className="flex items-center gap-1.5 py-2 px-3 rounded-xl border border-[var(--line)] bg-[var(--card)] hover:bg-[var(--bg)] text-xs font-semibold text-[var(--ink)] cursor-pointer transition-colors">
            <Upload className="h-3.5 w-3.5 text-teal-600" />
            <span>Restore Backup</span>
            <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
          </label>

          <button
            onClick={onOpenExportModal}
            className="flex items-center gap-1.5 py-2 px-3 rounded-xl border border-teal-300 dark:border-teal-800 bg-teal-50 dark:bg-teal-950/40 text-xs font-semibold text-teal-800 dark:text-teal-200 hover:bg-teal-100 transition-colors"
          >
            <Code2 className="h-3.5 w-3.5 text-teal-600" />
            <span>Export Standalone Single-File HTML</span>
          </button>
        </div>

        <div className="pt-3 border-t border-[var(--line)] flex justify-between items-center">
          <span className="text-xs text-[var(--mute)]">
            Total stored: {workspaces.length} conversations · {contacts.length} CRM contacts
          </span>
          <button
            onClick={onWipeData}
            className="text-xs font-semibold text-red-600 hover:underline flex items-center gap-1"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Wipe All Local Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
