"use client";

import React, { useState } from "react";
import {
  CRMContact,
  CRMConfig,
  Workspace,
  CRMProvider,
} from "@/lib/types";
import {
  Building,
  UserPlus,
  Mail,
  Phone,
  Search,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Share2,
  Trash2,
  Edit2,
  MessageSquare,
  Sparkles,
  Link2,
  Radio,
  FileSpreadsheet,
} from "lucide-react";

interface CRMManagerProps {
  contacts: CRMContact[];
  crmConfig: CRMConfig;
  workspaces: Workspace[];
  onUpdateCRMConfig: (config: CRMConfig) => void;
  onAddContact: (contact: Omit<CRMContact, "id">) => void;
  onUpdateContact: (contact: CRMContact) => void;
  onDeleteContact: (id: string) => void;
  onStartConversationForContact: (contact: CRMContact) => void;
  onOpenWorkspace: (id: string) => void;
  toast: (msg: string) => void;
}

const PROVIDERS: { id: CRMProvider; name: string; desc: string; icon: string; color: string }[] = [
  {
    id: "hubspot",
    name: "HubSpot",
    desc: "Sync contacts, timeline events, and notes directly into HubSpot CRM.",
    icon: "🟠",
    color: "border-orange-300 dark:border-orange-800",
  },
  {
    id: "salesforce",
    name: "Salesforce",
    desc: "Push leads, opportunities, and executive communication logs.",
    icon: "☁️",
    color: "border-blue-300 dark:border-blue-800",
  },
  {
    id: "pipedrive",
    name: "Pipedrive",
    desc: "Update deals, activities, and follow-up schedules in Pipedrive pipelines.",
    icon: "🟢",
    color: "border-emerald-300 dark:border-emerald-800",
  },
  {
    id: "notion",
    name: "Notion CRM",
    desc: "Sync contact pages, strategic advice, and drafts to Notion database.",
    icon: "📓",
    color: "border-stone-300 dark:border-stone-700",
  },
  {
    id: "zoho",
    name: "Zoho CRM",
    desc: "Enterprise contact history and multi-channel customer engagement.",
    icon: "🔴",
    color: "border-red-300 dark:border-red-800",
  },
  {
    id: "webhook",
    name: "Custom Webhook / Zapier / Make",
    desc: "Send standard JSON payloads to Zapier, Make, n8n, or any HTTP endpoint.",
    icon: "⚡",
    color: "border-purple-300 dark:border-purple-800",
  },
];

export const CRMManager: React.FC<CRMManagerProps> = ({
  contacts,
  crmConfig,
  workspaces,
  onUpdateCRMConfig,
  onAddContact,
  onUpdateContact,
  onDeleteContact,
  onStartConversationForContact,
  onOpenWorkspace,
  toast,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [editingContact, setEditingContact] = useState<CRMContact | null>(null);

  // Connection testing state
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; msg: string } | null>(null);

  // New Contact Form State
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactCompany, setContactCompany] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactStage, setContactStage] = useState<CRMContact["stage"]>("Prospect");
  const [contactTone, setContactTone] = useState("Professional, direct");
  const [contactRel, setContactRel] = useState("");
  const [contactNotes, setContactNotes] = useState("");

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/replypilot/crm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "test_connection",
          provider: crmConfig.provider,
          webhookUrl: crmConfig.webhookUrl,
          apiKey: crmConfig.apiKey,
        }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setTestResult({ ok: true, msg: data.message });
      } else {
        setTestResult({ ok: false, msg: data.message || "Connection failed." });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setTestResult({ ok: false, msg });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim()) {
      alert("Please provide at least a contact name.");
      return;
    }

    if (editingContact) {
      onUpdateContact({
        ...editingContact,
        name: contactName,
        email: contactEmail,
        company: contactCompany,
        phone: contactPhone,
        stage: contactStage,
        preferredTone: contactTone,
        relationshipContext: contactRel,
        notes: contactNotes,
      });
      toast("Contact updated successfully");
      setEditingContact(null);
    } else {
      onAddContact({
        name: contactName,
        email: contactEmail,
        company: contactCompany,
        phone: contactPhone,
        stage: contactStage,
        preferredTone: contactTone,
        relationshipContext: contactRel,
        notes: contactNotes,
        lastInteraction: "Just now",
        syncedProviders: [crmConfig.provider.toUpperCase()],
      });
      toast("Contact created and added to directory");
    }

    // Reset
    setContactName("");
    setContactEmail("");
    setContactCompany("");
    setContactPhone("");
    setContactRel("");
    setContactNotes("");
    setShowAddContactModal(false);
  };

  const handleOpenEdit = (c: CRMContact) => {
    setEditingContact(c);
    setContactName(c.name);
    setContactEmail(c.email);
    setContactCompany(c.company);
    setContactPhone(c.phone || "");
    setContactStage(c.stage);
    setContactTone(c.preferredTone || "Professional");
    setContactRel(c.relationshipContext || "");
    setContactNotes(c.notes);
    setShowAddContactModal(true);
  };

  // Export Contacts to CSV
  const handleExportCSV = () => {
    const headers = ["Name", "Email", "Company", "Phone", "Stage", "PreferredTone", "Notes"];
    const rows = contacts.map((c) => [
      `"${c.name}"`,
      `"${c.email}"`,
      `"${c.company}"`,
      `"${c.phone || ""}"`,
      `"${c.stage}"`,
      `"${c.preferredTone || ""}"`,
      `"${(c.notes || "").replace(/"/g, '""')}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `replypilot_crm_contacts_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    toast("Contacts exported to CSV");
  };

  const filteredContacts = contacts.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStage = stageFilter === "all" || c.stage === stageFilter;
    return matchSearch && matchStage;
  });

  const activeProviderMeta = PROVIDERS.find((p) => p.id === crmConfig.provider) || PROVIDERS[0];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-28">
      {/* Header banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-[var(--card)] p-5 rounded-2xl border border-[var(--line)] shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-extrabold text-[var(--ink)]">
              CRM &amp; Contact Management
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200">
              Active: {activeProviderMeta.name}
            </span>
          </div>
          <p className="text-xs text-[var(--mute)] mt-1">
            Seamlessly link conversations, log strategic replies, and sync Next Best Actions to
            HubSpot, Salesforce, Pipedrive, Notion, or custom Webhooks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowConfigModal(true)}
            className="flex items-center gap-1.5 py-2 px-3 rounded-xl border border-[var(--line)] bg-[var(--card)] hover:bg-[var(--bg)] text-xs font-semibold text-[var(--ink)] transition-colors"
          >
            <Radio className="h-3.5 w-3.5 text-teal-600" />
            <span>CRM Setup</span>
          </button>

          <button
            onClick={() => {
              setEditingContact(null);
              setContactName("");
              setContactEmail("");
              setContactCompany("");
              setContactPhone("");
              setContactRel("");
              setContactNotes("");
              setShowAddContactModal(true);
            }}
            className="flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-xs font-bold text-white shadow-sm transition-all"
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>Add Contact</span>
          </button>
        </div>
      </div>

      {/* Active CRM Connection Status Card */}
      <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--line)] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="text-2xl">{activeProviderMeta.icon}</div>
          <div>
            <div className="text-xs font-bold text-[var(--ink)] flex items-center gap-1.5">
              <span>{activeProviderMeta.name} Integration</span>
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
            </div>
            <p className="text-[11px] text-[var(--mute)]">{activeProviderMeta.desc}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleTestConnection}
            disabled={isTesting}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg border border-[var(--line)] bg-[var(--bg)] hover:bg-[var(--card)] text-xs font-semibold text-[var(--ink)] transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isTesting ? "animate-spin" : ""}`} />
            <span>Test Connection</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg border border-[var(--line)] bg-[var(--bg)] hover:bg-[var(--card)] text-xs font-semibold text-[var(--ink)] transition-colors"
            title="Export contacts as CSV"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-teal-600" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {testResult && (
        <div
          className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
            testResult.ok
              ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border border-emerald-300"
              : "bg-red-50 dark:bg-red-950/60 text-red-800 dark:text-red-200 border border-red-300"
          }`}
        >
          {testResult.ok ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
          )}
          <span>{testResult.msg}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--mute)]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search contacts by name, company, or email..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[var(--line)] bg-[var(--card)] text-[var(--ink)] focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        </div>

        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
          className="text-xs rounded-xl border border-[var(--line)] bg-[var(--card)] px-3 py-2 text-[var(--ink)] font-semibold"
        >
          <option value="all">All Stages ({contacts.length})</option>
          <option value="Lead">Lead</option>
          <option value="Prospect">Prospect</option>
          <option value="Active Client">Active Client</option>
          <option value="Partner">Partner</option>
          <option value="Closed Won">Closed Won</option>
          <option value="Personal">Personal</option>
        </select>
      </div>

      {/* Contacts List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredContacts.length === 0 ? (
          <div className="col-span-full bg-[var(--card)] p-8 rounded-2xl border border-[var(--line)] text-center text-sm text-[var(--mute)]">
            No contacts found. Click &quot;Add Contact&quot; to build your directory.
          </div>
        ) : (
          filteredContacts.map((contact) => {
            // Find linked workspaces
            const linkedWs = workspaces.filter((w) => w.crmContactId === contact.id);

            return (
              <div
                key={contact.id}
                className="bg-[var(--card)] p-4 sm:p-5 rounded-2xl border border-[var(--line)] shadow-sm hover:border-teal-500/50 transition-all flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-sm text-[var(--ink)]">{contact.name}</h3>
                      <div className="flex items-center gap-2 text-xs text-[var(--mute)] mt-0.5">
                        <span className="flex items-center gap-1">
                          <Building className="h-3 w-3" />
                          {contact.company || "No company"}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200">
                      {contact.stage}
                    </span>
                  </div>

                  {/* Contact Details */}
                  <div className="mt-2.5 space-y-1 text-xs text-[var(--mute)]">
                    {contact.email && (
                      <div className="flex items-center gap-1.5 truncate">
                        <Mail className="h-3 w-3 shrink-0" />
                        <span>{contact.email}</span>
                      </div>
                    )}
                    {contact.phone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="h-3 w-3 shrink-0" />
                        <span>{contact.phone}</span>
                      </div>
                    )}
                    {contact.preferredTone && (
                      <div className="text-[11px] font-medium text-teal-700 dark:text-teal-300 mt-1">
                        Preferred tone: {contact.preferredTone}
                      </div>
                    )}
                    {contact.notes && (
                      <p className="text-[11px] text-[var(--mute)] line-clamp-2 mt-1 italic">
                        &quot;{contact.notes}&quot;
                      </p>
                    )}
                  </div>

                  {/* Linked Workspaces */}
                  {linkedWs.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-[var(--line)]">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--mute)]">
                        Linked Conversations ({linkedWs.length}):
                      </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {linkedWs.map((ws) => (
                          <button
                            key={ws.id}
                            onClick={() => onOpenWorkspace(ws.id)}
                            className="text-[10px] font-semibold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 hover:underline px-2 py-0.5 rounded border border-teal-200 dark:border-teal-800"
                          >
                            {ws.title.slice(0, 24)}...
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="pt-2 border-t border-[var(--line)] flex items-center justify-between gap-2">
                  <button
                    onClick={() => onStartConversationForContact(contact)}
                    className="flex items-center gap-1 text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>Analyze Conversation</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(contact)}
                      className="p-1.5 text-[var(--mute)] hover:text-[var(--ink)] rounded"
                      title="Edit Contact"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteContact(contact.id)}
                      className="p-1.5 text-[var(--mute)] hover:text-red-500 rounded"
                      title="Delete Contact"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* CRM SETUP MODAL */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-[var(--card)] max-w-lg w-full rounded-2xl border border-[var(--line)] p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[var(--ink)] flex items-center gap-2">
                <Radio className="h-4 w-4 text-teal-600" />
                Configure CRM Integration
              </h3>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-[var(--mute)] hover:text-[var(--ink)] text-xs font-bold p-1"
              >
                ✕ Close
              </button>
            </div>

            <p className="text-xs text-[var(--mute)]">
              Choose your primary CRM connector. ReplyPilot can automatically push analyzed replies,
              meeting notes, and follow-up schedules.
            </p>

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--ink)]">
                Active CRM Platform
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PROVIDERS.map((p) => {
                  const isSelected = crmConfig.provider === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => onUpdateCRMConfig({ ...crmConfig, provider: p.id })}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? "border-teal-500 bg-teal-50/50 dark:bg-teal-950/40 ring-1 ring-teal-500"
                          : "border-[var(--line)] bg-[var(--bg)] hover:bg-[var(--card)]"
                      }`}
                    >
                      <div className="flex items-center gap-2 font-bold text-xs text-[var(--ink)]">
                        <span>{p.icon}</span>
                        <span>{p.name}</span>
                      </div>
                      <p className="text-[10px] text-[var(--mute)] mt-1 line-clamp-2">{p.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t border-[var(--line)]">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--ink)] mb-1">
                  Webhook / Endpoint URL
                </label>
                <input
                  type="text"
                  value={crmConfig.webhookUrl || ""}
                  onChange={(e) =>
                    onUpdateCRMConfig({ ...crmConfig, webhookUrl: e.target.value.trim() })
                  }
                  placeholder="https://hooks.zapier.com/hooks/catch/... or API URL"
                  className="w-full text-xs rounded-xl border border-[var(--line)] bg-[var(--bg)] p-2.5 text-[var(--ink)] focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
                <span className="text-[10px] text-[var(--mute)]">
                  Use this to push directly to Zapier, Make, n8n, or your CRM webhook endpoint.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--ink)] mb-1">
                  API Key / Bearer Token (Optional)
                </label>
                <input
                  type="password"
                  value={crmConfig.apiKey || ""}
                  onChange={(e) =>
                    onUpdateCRMConfig({ ...crmConfig, apiKey: e.target.value.trim() })
                  }
                  placeholder="Enter CRM API token..."
                  className="w-full text-xs rounded-xl border border-[var(--line)] bg-[var(--bg)] p-2.5 text-[var(--ink)]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="auto_sync"
                  checked={crmConfig.autoLogReplies}
                  onChange={(e) =>
                    onUpdateCRMConfig({ ...crmConfig, autoLogReplies: e.target.checked })
                  }
                  className="rounded text-teal-600 focus:ring-teal-500 h-4 w-4"
                />
                <label htmlFor="auto_sync" className="text-xs font-medium text-[var(--ink)]">
                  Auto-prompt to log to CRM whenever a best reply is copied
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setShowConfigModal(false);
                  toast("CRM settings saved");
                }}
                className="py-2 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs"
              >
                Save &amp; Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD/EDIT CONTACT MODAL */}
      {showAddContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-[var(--card)] max-w-lg w-full rounded-2xl border border-[var(--line)] p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[var(--ink)]">
                {editingContact ? "Edit Contact" : "Add New CRM Contact"}
              </h3>
              <button
                onClick={() => setShowAddContactModal(false)}
                className="text-[var(--mute)] hover:text-[var(--ink)] text-xs font-bold p-1"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleSaveContact} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--ink)] mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    required
                    placeholder="e.g. Elena Rostova"
                    className="w-full text-xs rounded-xl border border-[var(--line)] bg-[var(--bg)] p-2 text-[var(--ink)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--ink)] mb-1">
                    Company / Organization
                  </label>
                  <input
                    type="text"
                    value={contactCompany}
                    onChange={(e) => setContactCompany(e.target.value)}
                    placeholder="e.g. Acme Ventures"
                    className="w-full text-xs rounded-xl border border-[var(--line)] bg-[var(--bg)] p-2 text-[var(--ink)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--ink)] mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="elena@acme.com"
                    className="w-full text-xs rounded-xl border border-[var(--line)] bg-[var(--bg)] p-2 text-[var(--ink)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--ink)] mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full text-xs rounded-xl border border-[var(--line)] bg-[var(--bg)] p-2 text-[var(--ink)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--ink)] mb-1">
                    Lead Stage
                  </label>
                  <select
                    value={contactStage}
                    onChange={(e) => setContactStage(e.target.value as CRMContact["stage"])}
                    className="w-full text-xs rounded-xl border border-[var(--line)] bg-[var(--bg)] p-2 text-[var(--ink)]"
                  >
                    <option value="Lead">Lead</option>
                    <option value="Prospect">Prospect</option>
                    <option value="Active Client">Active Client</option>
                    <option value="Partner">Partner</option>
                    <option value="Closed Won">Closed Won</option>
                    <option value="Personal">Personal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--ink)] mb-1">
                    Preferred Tone
                  </label>
                  <input
                    type="text"
                    value={contactTone}
                    onChange={(e) => setContactTone(e.target.value)}
                    placeholder="e.g. Concise, friendly, formal"
                    className="w-full text-xs rounded-xl border border-[var(--line)] bg-[var(--bg)] p-2 text-[var(--ink)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--ink)] mb-1">
                  Relationship Context &amp; Dynamics
                </label>
                <input
                  type="text"
                  value={contactRel}
                  onChange={(e) => setContactRel(e.target.value)}
                  placeholder="e.g. VP who makes purchase decisions, very sensitive to timelines"
                  className="w-full text-xs rounded-xl border border-[var(--line)] bg-[var(--bg)] p-2 text-[var(--ink)]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--ink)] mb-1">
                  Notes &amp; Interaction Background
                </label>
                <textarea
                  value={contactNotes}
                  onChange={(e) => setContactNotes(e.target.value)}
                  placeholder="Important background, previous commitments..."
                  rows={2}
                  className="w-full text-xs rounded-xl border border-[var(--line)] bg-[var(--bg)] p-2 text-[var(--ink)]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddContactModal(false)}
                  className="py-2 px-3 text-xs text-[var(--mute)] hover:text-[var(--ink)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs"
                >
                  {editingContact ? "Update Contact" : "Create Contact"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
