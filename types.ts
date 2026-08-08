
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
  status?: 'draft' | 'published' | 'rejected';
  qualityScore?: number | null;
  qualityReport?: {
    checks?: string[];
    warnings?: string[];
    hardFailures?: string[];
    verification?: {
      supported: number;
      partial: number;
      unsupported: number;
      assessments?: Array<{ claimIndex: number; text: string; status: 'supported' | 'partial' | 'unsupported'; sourceIds: string[]; note: string }>;
    };
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
  author: string;
  defaultImageUrl: string;
  approvalMode: 'required' | 'quality_gate';
  qualityThreshold: number;
}

export interface AutomationConnectionResult {
  success: boolean;
  latencyMs: number;
  modelCount: number;
  modelAvailable: boolean | null;
}

export interface AutomationRunResult {
  status: 'draft' | 'published' | 'skipped' | 'failed';
  completedAt?: string;
  postId?: string;
  title?: string;
  qualityScore?: number;
  sourceCount?: number;
  reason?: string;
  error?: string;
  diagnostics?: AutomationDiagnostics;
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
  stage: 'config' | 'sources' | 'filtering' | 'reading' | 'writing' | 'verifying' | 'publishing' | 'completed' | 'failed';
  message: string;
  percent: number;
  updatedAt: string;
  currentSource?: string;
  totalCandidates?: number;
  processedCandidates?: number;
  diagnostics?: AutomationDiagnostics;
}

export interface AutomationStatus {
  enabled: boolean;
  running: boolean;
  progress: AutomationProgress | null;
  lastResult: AutomationRunResult | null;
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
