
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
}

export interface AutomationConnectionResult {
  success: boolean;
  latencyMs: number;
  modelCount: number;
  modelAvailable: boolean | null;
}

export interface AutomationRunResult {
  status: 'published' | 'skipped' | 'failed';
  completedAt: string;
  postId?: string;
  title?: string;
  reason?: string;
  error?: string;
  diagnostics?: {
    failed?: number;
    errors?: string[];
  };
}

export interface AutomationStatus {
  enabled: boolean;
  running: boolean;
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
