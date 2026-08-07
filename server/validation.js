const { z } = require('zod');

const id = z.string().trim().min(1).max(50).regex(/^[a-zA-Z0-9_-]+$/);
const shortText = z.string().trim().min(1).max(255);
const optionalMediaUrl = z.string().trim().max(2048).refine(
  value => value === '' || value.startsWith('/') || /^https?:\/\//i.test(value),
  'Media URL must be an HTTP(S) URL or an internal path'
);
const safeHref = z.string().trim().max(2048).refine(
  value => value === '#' || value.startsWith('/') || /^https?:\/\//i.test(value) || !/^[a-z][a-z\d+.-]*:/i.test(value),
  'Unsupported URL protocol'
);
const normalizeHttpUrl = value => {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  if (!trimmed || /^[a-z][a-z\d+.-]*:\/\//i.test(trimmed)) return trimmed;
  return `${/^(localhost|127\.0\.0\.1|\[::1\])(?::|\/|$)/i.test(trimmed) ? 'http' : 'https'}://${trimmed}`;
};
const httpUrl = z.preprocess(normalizeHttpUrl, z.url().refine(value => /^https?:\/\//i.test(value), 'Only HTTP(S) URLs are allowed'));
const normalizeDomain = value => {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim().toLowerCase().replace(/^\*\./, '').replace(/^\./, '');
  try {
    return new URL(normalizeHttpUrl(trimmed)).hostname.toLowerCase();
  } catch {
    return trimmed.split('/')[0].split(':')[0];
  }
};
const domain = z.preprocess(normalizeDomain, z.string().min(1).max(253).regex(/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)*[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/));
const normalizeList = value => Array.isArray(value)
  ? value.flatMap(item => typeof item === 'string' ? item.split(/[,\r\n]+/).map(part => part.trim()).filter(Boolean) : [item])
  : value;
const urlList = z.preprocess(normalizeList, z.array(httpUrl).max(50));
const domainList = z.preprocess(normalizeList, z.array(domain).max(100));

const navItem = z.lazy(() => z.object({
  id,
  label: z.string().trim().min(1).max(100),
  path: safeHref,
  isExternal: z.boolean().optional(),
  children: z.array(navItem).max(20).optional()
}));

const schemas = {
  idParam: z.object({ id }),
  messageIdParam: z.object({ id: z.coerce.number().int().positive().max(Number.MAX_SAFE_INTEGER) }),
  automationSettings: z.object({
    enabled: z.boolean(),
    baseUrl: httpUrl,
    apiKey: z.string().max(1000).optional().default(''),
    clearApiKey: z.boolean().optional().default(false),
    model: z.string().trim().max(200),
    rssFeeds: urlList,
    websites: urlList,
    discoveryEnabled: z.boolean().optional().default(false),
    discoveryProvider: z.literal('duckduckgo').optional().default('duckduckgo'),
    discoveryModel: z.string().trim().max(200).optional().default(''),
    discoveryTopics: z.array(z.string().trim().min(2).max(200)).max(30).optional().default([]),
    allowedDomains: domainList.optional().default([]),
    blockedDomains: domainList.optional().default([]),
    runHourUtc: z.number().int().min(0).max(23),
    author: z.string().trim().min(1).max(100),
    defaultImageUrl: optionalMediaUrl
  }).superRefine((value, context) => {
    if (value.enabled && !value.model) context.addIssue({ code: 'custom', message: 'Model is required when automation is enabled', path: ['model'] });
    if (value.enabled && value.rssFeeds.length + value.websites.length === 0 && !value.discoveryEnabled) context.addIssue({ code: 'custom', message: 'At least one RSS feed, website or topic discovery must be enabled', path: ['rssFeeds'] });
  }),
  login: z.object({
    username: z.string().trim().min(1).max(50),
    password: z.string().max(200)
  }),
  category: z.object({
    id,
    name: shortText
  }),
  message: z.object({
    name: z.string().trim().min(1).max(100),
    email: z.email().max(255),
    subject: shortText,
    message: z.string().trim().min(1).max(5000)
  }),
  post: z.object({
    id,
    title: shortText,
    excerpt: z.string().trim().max(2000),
    content: z.string().max(500000),
    author: z.string().trim().min(1).max(100),
    date: z.string().trim().min(1).max(20),
    category: id,
    tags: z.array(z.string().trim().min(1).max(50)).max(30),
    imageUrl: optionalMediaUrl,
    readTime: z.string().trim().max(50)
  }),
  settings: z.object({
    siteNamePrefix: z.string().trim().max(100),
    siteNameSuffix: z.string().trim().max(100),
    footerDescription: z.string().max(2000),
    footerCopyright: z.string().max(255),
    navigation: z.array(navItem).max(30),
    socialLinks: z.object({
      facebook: safeHref,
      twitter: safeHref,
      linkedin: safeHref
    }),
    logoUrl: optionalMediaUrl.optional().default(''),
    faviconUrl: optionalMediaUrl.optional().default(''),
    aboutContent: z.string().max(500000).optional().default(''),
    contactContent: z.string().max(500000).optional().default(''),
    pageTitle: z.string().trim().max(255).optional().default('')
  }),
  user: z.object({
    id,
    username: z.string().trim().min(1).max(50),
    password: z.string().max(200).optional(),
    displayName: z.string().trim().max(100),
    role: z.enum(['admin', 'editor'])
  })
};

const validateBody = schema => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      error: 'Invalid request body',
      issues: result.error.issues.map(issue => ({
        path: issue.path.join('.'),
        message: issue.message
      }))
    });
  }
  req.body = result.data;
  return next();
};

const validateParams = schema => (req, res, next) => {
  const result = schema.safeParse(req.params);
  if (!result.success) {
    return res.status(400).json({
      error: 'Invalid route parameters',
      issues: result.error.issues.map(issue => ({
        path: issue.path.join('.'),
        message: issue.message
      }))
    });
  }
  req.params = result.data;
  return next();
};

module.exports = { schemas, validateBody, validateParams };
