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
