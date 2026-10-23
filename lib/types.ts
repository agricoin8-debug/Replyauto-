export type MessageWho = 'me' | 'them' | 'context';

export interface ChatMessage {
  who: MessageWho;
  text: string;
  timestamp?: string;
}

export interface WorkspaceChatTurn {
  r: 'user' | 'ai';
  t: string;
}

export interface DraftVersion {
  text: string;
  label: string;
  at: string;
}

export interface DraftState {
  versions: DraftVersion[];
  cur: string;
  saved: boolean;
}

export interface AlternativeReply {
  label: string;
  text: string;
}

export interface NextBestAction {
  action: string;
  reason: string;
  timing: string;
  fu: string;
}

export interface AnalysisResult {
  note: string;
  goal: string;
  facts: string[];
  interp: string[];
  missing: string[];
  q: string;
  urg: 'now' | 'soon' | 'can_wait';
  urgNote: string;
  reason: string;
  alts: AlternativeReply[];
  why: string;
  next: NextBestAction;
  lim: string[];
}

export interface WorkspaceFormState {
  summary: string;
  outcome: string;
  person: string;
  rel: string;
  history: string;
  latest: string;
}

export interface BuilderFormState {
  kind: string;
  purpose: string;
  recipient: string;
  tone: string;
  length: string;
  facts: string;
  avoid: string;
  language: string;
  outcome: string;
}

export interface Workspace {
  id: string;
  kind: 'reply' | 'builder';
  title: string;
  f?: WorkspaceFormState;
  b?: BuilderFormState;
  msgs: ChatMessage[];
  summary?: string;
  chat: WorkspaceChatTurn[];
  opts: {
    tone: string;
    length: string;
    objective: string;
  };
  a?: AnalysisResult;
  draft: DraftState;
  notes?: string;
  qs?: string[];
  at: string;
  n: number;
  crmContactId?: string;
}

export interface CRMContact {
  id: string;
  name: string;
  email: string;
  company: string;
  phone?: string;
  stage: 'Lead' | 'Prospect' | 'Active Client' | 'Partner' | 'Closed Won' | 'Personal';
  preferredTone?: string;
  relationshipContext?: string;
  notes: string;
  lastInteraction?: string;
  lastSyncedAt?: string;
  syncedProviders?: string[];
}

export type CRMProvider = 'hubspot' | 'salesforce' | 'pipedrive' | 'notion' | 'zoho' | 'webhook';

export interface CRMConfig {
  provider: CRMProvider;
  webhookUrl: string;
  apiKey: string;
  instanceUrl: string;
  autoLogReplies: boolean;
}

export interface AppSettings {
  provider: 'auto' | 'gemini' | 'ollama' | 'openai';
  ollamaBase: string;
  ollamaModel: string;
  openaiBase: string;
  openaiModel: string;
  openaiKey: string;
  style: string;
  crm: CRMConfig;
}

export interface AIResponseMeta {
  providerUsed: string;
  fallbackUsed: boolean;
  model: string;
  latencyMs: number;
}
