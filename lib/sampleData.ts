import { CRMContact, Workspace } from "./types";

export const DEFAULT_CRM_CONTACTS: CRMContact[] = [
  {
    id: "crm_1",
    name: "Elena Rostova",
    email: "elena.r@acmeventures.io",
    company: "Acme Ventures",
    phone: "+1 (555) 382-9912",
    stage: "Prospect",
    preferredTone: "Professional yet warm, concise",
    relationshipContext: "Key stakeholder evaluating Q4 software rollout",
    notes: "Expressed interest during demo last Tuesday. Cares deeply about data privacy and SLA guarantees.",
    lastInteraction: "2 days ago",
    syncedProviders: ["HubSpot", "Zapier Webhook"],
  },
  {
    id: "crm_2",
    name: "Marcus Chen",
    email: "marcus.chen@vertexsys.com",
    company: "Vertex Systems",
    phone: "+1 (555) 741-2093",
    stage: "Active Client",
    preferredTone: "Direct, technical, structured",
    relationshipContext: "Lead engineer for API migration",
    notes: "Has concerns regarding the sprint timeline and API rate limits.",
    lastInteraction: "Yesterday",
    syncedProviders: ["Salesforce"],
  },
  {
    id: "crm_3",
    name: "Sarah Jenkins",
    email: "sarah.j@designco.agency",
    company: "DesignCo Agency",
    stage: "Partner",
    preferredTone: "Casual, collaborative, enthusiastic",
    relationshipContext: "Design partner agency collaborating on branding",
    notes: "Discussing revenue share model for upcoming co-marketing campaign.",
    lastInteraction: "4 days ago",
    syncedProviders: ["Pipedrive", "Notion CRM"],
  },
];

export const CONVERSATION_TEMPLATES = [
  {
    title: "Client Scope Creep & Timeline",
    person: "Marcus Chen",
    rel: "Key enterprise client",
    outcome: "Firmly protect the sprint timeline while offering a Phase 2 quote",
    latest: "Hey, we really need the custom reporting dashboard included in this Friday's release too, otherwise leadership won't approve the milestone payment.",
    history: `Them: Hey team, looking forward to the release on Friday.
Me: Thanks Marcus! We're on track with the agreed milestones.
Them: Hey, we really need the custom reporting dashboard included in this Friday's release too, otherwise leadership won't approve the milestone payment.`,
    summary: "Marcus is attempting to add a major custom reporting dashboard 3 days before deployment and tying milestone sign-off to scope creep.",
  },
  {
    title: "Gentle Rescheduling with Stakeholder",
    person: "Elena Rostova",
    rel: "High-value prospective partner",
    outcome: "Apologize for emergency reschedule and lock in next Tuesday at 2 PM",
    latest: "Looking forward to our call in 30 minutes! I have our VP on standby.",
    history: `Them: Looking forward to our call in 30 minutes! I have our VP on standby.`,
    summary: "Need to immediately reschedule our upcoming high-stakes meeting due to a production outage, without damaging credibility.",
  },
  {
    title: "Friendly Follow-up After Unanswered Proposal",
    person: "David Miller",
    rel: "Procurement lead",
    outcome: "Politely check in on proposal review without sounding pushy",
    latest: "",
    history: `Me: Hi David, sending over the revised contract proposal with the requested volume discount. Let me know what your team thinks!
Them: Thanks, will review with finance by Thursday.`,
    summary: "Sent revised proposal 8 days ago. David promised a review with finance by Thursday last week, but has gone silent.",
  },
  {
    title: "Setting Personal Boundary with Acquaintance",
    person: "Alex",
    rel: "College friend / loose acquaintance",
    outcome: "Politely decline lending money or equipment without creating drama",
    latest: "Hey man, can I borrow your 4K camera gear this weekend for a wedding gig? I'll buy you a beer next week!",
    history: `Them: Hey man, can I borrow your 4K camera gear this weekend for a wedding gig? I'll buy you a beer next week!`,
    summary: "Alex is asking to borrow fragile expensive camera equipment without insurance or deposit.",
  },
];

export const INITIAL_SAMPLE_WORKSPACE: Workspace = {
  id: "sample_ws_1",
  kind: "reply",
  title: "Client Scope Creep & Timeline (Marcus)",
  f: {
    summary: "Marcus wants an un-scoped reporting dashboard added to Friday's delivery, subtly conditioning milestone sign-off.",
    outcome: "Protect the Friday deployment deadline, preserve relationship, and propose Phase 2 scoping next Monday.",
    person: "Marcus Chen",
    rel: "Enterprise client lead",
    history: "Them: Hey team, looking forward to Friday's deployment.\nMe: Thanks Marcus, testing is on schedule.\nThem: Hey, we really need the custom reporting dashboard included in this Friday's release too, otherwise leadership won't approve the milestone payment.",
    latest: "Hey, we really need the custom reporting dashboard included in this Friday's release too, otherwise leadership won't approve the milestone payment.",
  },
  msgs: [
    { who: "them", text: "Hey team, looking forward to Friday's deployment." },
    { who: "me", text: "Thanks Marcus, testing is on schedule." },
    { who: "them", text: "Hey, we really need the custom reporting dashboard included in this Friday's release too, otherwise leadership won't approve the milestone payment." },
  ],
  summary: "Marcus wants an un-scoped reporting dashboard added to Friday's delivery, subtly conditioning milestone sign-off on new features.",
  chat: [
    { r: "user", t: "Analyze conversation" },
    { r: "ai", t: "Here is your strategic analysis and calibrated reply to keep the release on track while defusing the scope dispute." },
  ],
  opts: {
    tone: "Professional",
    length: "Medium",
    objective: "Set a boundary",
  },
  at: new Date(Date.now() - 3600000).toISOString(),
  n: 1,
  crmContactId: "crm_2",
  a: {
    note: "Marcus is feeling pressure from his leadership, but agreeing to add an unvetted dashboard introduces critical deployment risk.",
    goal: "Maintain Friday's agreed deployment while politely establishing that custom reporting belongs in an immediate fast-follow sprint.",
    facts: [
      "Friday is the scheduled deployment date.",
      "The agreed milestones are on schedule.",
      "Marcus stated leadership wants the custom reporting dashboard before milestone sign-off.",
    ],
    interp: [
      "Marcus may be using leadership sign-off as leverage to get extra deliverables without budget review.",
      "Marcus might be genuinely anxious about his internal executive presentation.",
    ],
    missing: [
      "Was the reporting dashboard ever mentioned in the signed statement of work (SOW)?",
      "Who is Marcus's executive sponsor who needs the metrics?",
    ],
    q: "Does your existing contract have a formal change-order clause for out-of-scope requests?",
    urg: "now",
    urgNote: "Friday is fast approaching; leaving Marcus hanging will escalate his anxiety to his executives.",
    reason: "Acknowledge the value of the dashboard, confirm delivery of the agreed core system on Friday, and give a clear path forward for the dashboard on Monday.",
    alts: [
      {
        label: "Direct & Firm",
        text: "Hi Marcus, our focus is delivering the agreed milestone stably this Friday. The custom reporting dashboard is out of current scope, but I can share a mock-up and cost estimate for Phase 2 by Monday morning.",
      },
      {
        label: "Collaborative Compromise",
        text: "Hi Marcus, I understand leadership wants visibility into metrics! To ensure Friday's launch remains 100% stable, let's ship the core sprint as scheduled, and I can provide an interim CSV data export for your leadership meeting while we build the full dashboard next sprint.",
      },
    ],
    why: "It validates Marcus's need for reporting without conceding to last-minute sprint disruption. It anchors back to contractual stability while providing a solution.",
    next: {
      action: "Send the response, then prepare an interim data export template in case his executives only need raw numbers.",
      reason: "Gives Marcus a quick internal win with his leadership without risking production codebase stability.",
      timing: "Send within 1 hour during business hours.",
      fu: "Marcus, following up quickly—let me know if an interim export will suffice for Friday's deck, and we'll line up the dashboard tickets for sprint planning.",
    },
    lim: [
      "Analysis is based on chat history provided; contract terms were not inspected.",
    ],
  },
  draft: {
    cur: "Hi Marcus, totally understand that leadership is eager for reporting visibility. To protect the stability of Friday's launch, we need to keep the release scope locked to our agreed milestone deliverables.\n\nLet's deploy Friday as planned, and I'll prepare a separate sprint estimate for the custom reporting dashboard so we can prioritize it first thing next week. Would an interim data export help bridge the gap for your leadership this week?",
    versions: [
      {
        text: "Hi Marcus, totally understand that leadership is eager for reporting visibility. To protect the stability of Friday's launch, we need to keep the release scope locked to our agreed milestone deliverables.\n\nLet's deploy Friday as planned, and I'll prepare a separate sprint estimate for the custom reporting dashboard so we can prioritize it first thing next week. Would an interim data export help bridge the gap for your leadership this week?",
        label: "Best",
        at: new Date(Date.now() - 3600000).toISOString(),
      },
    ],
    saved: true,
  },
};
