
export interface Category {
  id: string;
  name: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string; // HTML string or Markdown text
  author: string;
  date: string;
  category: string;
  tags: string[];
  imageUrl: string;
  readTime: string;
  views?: number;
  status?: 'draft' | 'published' | 'rejected';
  qualityScore?: number | null;
  qualityReport?: {
    checks?: string[];
    warnings?: string[];
    hardFailures?: string[];
    wordCount?: number;
    verification?: {
      supported: number;
      partial: number;
      unsupported: number;
      assessments?: Array<{ claimIndex: number; text: string; status: 'supported' | 'partial' | 'unsupported'; sourceIds: string[]; note: string }>;
    };
    gateway?: { writerModel?: string; writerAttempts?: number; factCheckModel?: string | null; factCheckAttempts?: number };
    media?: { imageModel?: string | null; generatedTitleImage?: boolean; generatedContentImages?: number; warnings?: string[] };
    policy?: { articleStyle?: AutomationSettings['articleStyle']; targetAudience?: AutomationSettings['targetAudience']; targetWordCount?: number; missingRequiredKeywords?: string[]; presentBlockedKeywords?: string[] };
  } | null;
  sourceUrl?: string;
  sourceUrls?: string[];
  seoTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  imageAlt?: string;
  imageCaption?: string;
  toc?: Array<{ id: string; text: string; level: 2 | 3 }>;
  relatedPosts?: Array<Pick<BlogPost, 'id' | 'title' | 'excerpt' | 'imageUrl' | 'category'>>;
}

export interface NavItem {
  id: string;
  label: string;
  path: string;
  isExternal?: boolean; // True if it's an external link
  children?: NavItem[]; // For dropdown menus
}

export interface SiteSettings {
  siteNamePrefix: string; 
  siteNameSuffix: string; 
  pageTitle?: string; // New: Browser Tab Title
  logoUrl?: string; // New: Logo image URL
  faviconUrl?: string; // New: Favicon image URL
  footerDescription: string;
  footerCopyright: string;
  navigation: NavItem[]; // Replaced old navLabels object with dynamic array
  socialLinks: {
    facebook: string;
    twitter: string;
    linkedin: string;
  };
  // New fields for dynamic pages
  aboutContent?: string; 
  contactContent?: string; 
}

export interface AutomationSettings {
  enabled: boolean;
  baseUrl: string;
  apiKey: string;
  hasApiKey: boolean;
  clearApiKey?: boolean;
  model: string;
  rssFeeds: string[];
  websites: string[];
  discoveryEnabled: boolean;
  discoveryProvider: 'duckduckgo' | '9router';
  discoveryModel: string;
  discoveryTopics: string[];
  allowedDomains: string[];
  blockedDomains: string[];
  runHourUtc: number;
  schedule: AutomationSchedule;
  author: string;
  defaultImageUrl: string;
  approvalMode: 'required' | 'quality_gate';
  qualityThreshold: number;
  fallbackModels: string[];
  retryCount: number;
  imageGenerationEnabled: boolean;
  imageModel: string;
  generatedContentImageCount: number;
  articleStyle: 'news' | 'analysis' | 'tutorial' | 'research_summary';
  targetWordCount: number;
  targetAudience: 'general' | 'beginner' | 'professional' | 'academic';
  editorialPrompt: string;
  requiredKeywords: string[];
  blockedKeywords: string[];
  maxSources: number;
  maxModelCalls: number;
  maxDurationSeconds: number;
}

export type AutomationSchedule =
  | { type: 'weekly'; daysOfWeek: number[]; time: string }
  | { type: 'interval'; intervalHours: number }
  | { type: 'once'; runAt: string[] };

export interface AutomationSchemaProbe {
  ok: boolean;
  model: string;
  status: number;
  responseFormatSupported: boolean;
  fallbackUsed: boolean;
  response?: { ok?: boolean } | null;
  error?: string | null;
}

export interface AutomationConnectionResult {
  success: boolean;
  latencyMs: number;
  modelCount: number;
  modelAvailable: boolean | null;
  schemaProbe: AutomationSchemaProbe;
}

export interface AutomationRunOptions {
  modelOverride?: string;
  customPrompt?: string;
  disableImages?: boolean;
  reuseSources?: boolean;
  parentRunId?: string;
  scheduledFor?: string;
}

export interface AutomationTimelineEvent {
  stage: AutomationProgress['stage'];
  message: string;
  percent: number;
  at: string;
}

export interface AutomationErrorDetails {
  [key: string]: string | number | boolean | null | undefined;
}

export interface AutomationRunResult {
  status: 'started' | 'running' | 'draft' | 'published' | 'skipped' | 'failed' | 'cancelled';
  runId?: string | null;
  startedAt?: string;
  completedAt?: string;
  postId?: string;
  title?: string;
  qualityScore?: number;
  sourceCount?: number;
  reason?: string;
  error?: string;
  diagnostics?: AutomationDiagnostics;
  model?: string;
  attempts?: number;
}

export interface AutomationDiagnostics {
  discoveryFound?: number;
  discoveryRejected?: number;
  rssItems?: number;
  websiteLinks?: number;
  candidates?: number;
  alreadyProcessed?: number;
  duplicates?: number;
  failed?: number;
  errors?: string[];
}

export interface AutomationProgress {
  stage: 'config' | 'sources' | 'filtering' | 'reading' | 'writing' | 'verifying' | 'imaging' | 'publishing' | 'cancelling' | 'cancelled' | 'completed' | 'failed';
  message: string;
  percent: number;
  updatedAt: string;
  currentSource?: string;
  totalCandidates?: number;
  processedCandidates?: number;
  diagnostics?: AutomationDiagnostics;
  stale?: boolean;
}

export interface AutomationStatus {
  enabled: boolean;
  running: boolean;
  progress: AutomationProgress | null;
  lastResult: AutomationRunResult | null;
  runId?: string | null;
  schedule?: AutomationSchedule;
  nextRunAt?: string | null;
}

export interface AutomationRunHistory {
  id: string;
  triggerType: 'manual' | 'scheduled' | 'rerun';
  status: AutomationRunResult['status'];
  stage: string;
  postId?: string | null;
  title?: string | null;
  model?: string | null;
  attempts: number;
  qualityScore?: number | null;
  sourceCount: number;
  error?: string | null;
  errorCode?: string | null;
  errorDetails?: AutomationErrorDetails | null;
  diagnostics?: AutomationDiagnostics | null;
  heartbeatAt?: string | null;
  timeline: AutomationTimelineEvent[];
  options: AutomationRunOptions;
  parentRunId?: string | null;
  sourceUrls: string[];
  maxSources: number;
  maxModelCalls: number;
  maxDurationSeconds: number;
  modelCalls: number;
  sourcesAttempted: number;
  deadlineAt?: string | null;
  startedAt: string;
  completedAt?: string | null;
}

export type AutomationRunDetail = AutomationRunHistory;

export interface AutomationStatistics {
  total: number;
  published: number;
  drafts: number;
  failed: number;
  cancelled: number;
  skipped: number;
  average_quality: number | null;
  average_duration_seconds: number | null;
  models: Array<{ model: string; runs: number; attempts: number }>;
}

export interface User {
  id: string;
  username: string;
  password?: string;
  displayName: string;
  role: 'admin' | 'editor';
  token?: string;
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
  read_status: boolean;
}

export enum PageRoute {
  HOME = '/',
  BLOG = '/blog',
  ABOUT = '/about',
  CONTACT = '/contact'
}
