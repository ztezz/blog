const { createHash } = require('crypto');
const dns = require('dns').promises;
const net = require('net');
const { XMLParser } = require('fast-xml-parser');
const cheerio = require('cheerio');
const sanitizeHtml = require('sanitize-html');
const { z } = require('zod');
const { ensureAutomationSettings, parseJsonArray } = require('./automation-settings');

const USER_AGENT = 'CosmoGISBot/1.0 (+content research; configured sources only)';
const MAX_RESPONSE_BYTES = 2 * 1024 * 1024;
const generatedPostSchema = z.object({
  title: z.string().trim().min(10).max(255),
  excerpt: z.string().trim().min(20).max(500),
  content: z.string().min(200).max(100000),
  category: z.string().trim().min(1).max(50),
  tags: z.array(z.string().trim().min(1).max(50)).min(1).max(10)
});
const asArray = value => value === undefined ? [] : Array.isArray(value) ? value : [value];
const textValue = value => typeof value === 'string' ? value : value?.['#text'] || '';

const parseFeed = (xml, feedUrl) => {
  const parsed = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' }).parse(xml);
  const items = parsed?.rss?.channel?.item || parsed?.feed?.entry || [];
  return asArray(items).map(item => {
    const links = asArray(item.link);
    const link = links.find(value => value?.['@_rel'] === 'alternate') || links[0];
    const href = typeof link === 'string' ? link : link?.['@_href'] || textValue(link);
    if (!href) return null;
    return {
      url: new URL(href, feedUrl).href,
      title: textValue(item.title).trim(),
      publishedAt: textValue(item.pubDate || item.published || item.updated),
      summary: textValue(item.description || item.summary || item.content).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    };
  }).filter(Boolean);
};

const extractArticleLinks = (html, websiteUrl) => {
  const $ = cheerio.load(html);
  const origin = new URL(websiteUrl).origin;
  const links = [];
  const primaryLinks = $('article a[href], main a[href]');
  const elements = primaryLinks.length > 0 ? primaryLinks : $('body a[href]');
  elements.each((_, element) => {
    try {
      const url = new URL($(element).attr('href'), websiteUrl);
      url.hash = '';
      const text = $(element).text().replace(/\s+/g, ' ').trim();
      const excludedPath = /\.(?:jpg|jpeg|png|gif|webp|svg|pdf|zip|xml)$/i.test(url.pathname) || /\/(?:tag|tags|category|categories|author|login|register|privacy|contact)(?:\/|$)/i.test(url.pathname);
      if (url.origin === origin && url.pathname !== '/' && !excludedPath && (primaryLinks.length > 0 || text.length >= 12) && !links.includes(url.href)) links.push(url.href);
    } catch {
      // Ignore malformed links from source markup.
    }
  });
  return links.slice(0, 30);
};

const extractArticle = (html, url, fallback = {}) => {
  const $ = cheerio.load(html);
  $('script, style, nav, footer, header, aside, form, noscript, svg').remove();
  const title = $('meta[property="og:title"]').attr('content') || $('h1').first().text() || $('title').text() || fallback.title || '';
  const container = $('article').first().length ? $('article').first() : $('main').first().length ? $('main').first() : $('body');
  const paragraphs = container.find('p, h2, h3, li').map((_, element) => $(element).text().replace(/\s+/g, ' ').trim()).get().filter(text => text.length >= 20);
  const content = paragraphs.join('\n').slice(0, 30000) || fallback.summary || '';
  return { url, title: title.replace(/\s+/g, ' ').trim(), content };
};

const isPrivateIp = address => {
  if (net.isIPv4(address)) {
    const parts = address.split('.').map(Number);
    return parts[0] === 10 || parts[0] === 127 || parts[0] === 0 ||
      (parts[0] === 169 && parts[1] === 254) || (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
      (parts[0] === 192 && parts[1] === 168) || parts[0] >= 224;
  }
  if (net.isIPv6(address)) {
    const normalized = address.toLowerCase();
    return normalized === '::1' || normalized === '::' || normalized.startsWith('fc') || normalized.startsWith('fd') || normalized.startsWith('fe8') || normalized.startsWith('fe9') || normalized.startsWith('fea') || normalized.startsWith('feb');
  }
  return true;
};

const assertPublicUrl = async value => {
  const url = new URL(value);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) throw new Error('Only public HTTP(S) source URLs are allowed');
  if ((url.protocol === 'http:' && url.port && url.port !== '80') || (url.protocol === 'https:' && url.port && url.port !== '443')) {
    throw new Error('Source URLs must use the default HTTP(S) port');
  }
  const addresses = await dns.lookup(url.hostname, { all: true });
  if (addresses.length === 0 || addresses.some(entry => isPrivateIp(entry.address))) throw new Error('Private or local source URLs are not allowed');
  return url;
};

const fetchSource = async (value, redirects = 0) => {
  const url = await assertPublicUrl(value);
  const response = await fetch(url, {
    redirect: 'manual',
    signal: AbortSignal.timeout(15000),
    headers: { 'User-Agent': USER_AGENT, Accept: 'text/html, application/rss+xml, application/atom+xml, application/xml, text/xml' }
  });
  if ([301, 302, 303, 307, 308].includes(response.status)) {
    if (redirects >= 3) throw new Error('Too many source redirects');
    const location = response.headers.get('location');
    if (!location) throw new Error('Source redirect is missing Location');
    return fetchSource(new URL(location, url).href, redirects + 1);
  }
  if (!response.ok) throw new Error(`Source returned HTTP ${response.status}`);
  const contentLength = Number(response.headers.get('content-length') || 0);
  if (contentLength > MAX_RESPONSE_BYTES) throw new Error('Source response is too large');
  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.length > MAX_RESPONSE_BYTES) throw new Error('Source response is too large');
  return buffer.toString('utf8');
};

const robotsAllows = async value => {
  const url = new URL(value);
  try {
    const robots = await fetchSource(`${url.origin}/robots.txt`);
    let applies = false;
    const disallowed = [];
    for (const rawLine of robots.split(/\r?\n/)) {
      const line = rawLine.replace(/#.*/, '').trim();
      const [field, ...rest] = line.split(':');
      if (!field || rest.length === 0) continue;
      const content = rest.join(':').trim();
      if (field.toLowerCase() === 'user-agent') applies = content === '*';
      if (applies && field.toLowerCase() === 'disallow' && content) disallowed.push(content);
    }
    return !disallowed.some(path => url.pathname.startsWith(path));
  } catch {
    return true;
  }
};

const parseCsvUrls = value => (value || '').split(',').map(item => item.trim()).filter(Boolean);
const cleanJsonText = value => value.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
const readingTime = html => {
  const words = html.replace(/<[^>]+>/g, ' ').trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(words / 200))} phút`;
};
const domainMatches = (hostname, configuredDomain) => hostname === configuredDomain || hostname.endsWith(`.${configuredDomain}`);
const isAllowedDiscoveryUrl = (value, allowedDomains, blockedDomains) => {
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol)) return false;
    const hostname = url.hostname.toLowerCase().replace(/\.$/, '');
    if (blockedDomains.some(domain => domainMatches(hostname, domain))) return false;
    return allowedDomains.length === 0 || allowedDomains.some(domain => domainMatches(hostname, domain));
  } catch {
    return false;
  }
};

const parseDuckDuckGoResults = html => {
  const $ = cheerio.load(html);
  const results = [];
  $('.result').each((_, element) => {
    const anchor = $(element).find('.result__a').first();
    const href = anchor.attr('href');
    if (!href) return;
    try {
      const redirectUrl = new URL(href, 'https://html.duckduckgo.com');
      const target = redirectUrl.hostname.endsWith('duckduckgo.com')
        ? redirectUrl.searchParams.get('uddg')
        : redirectUrl.href;
      if (!target) return;
      const url = new URL(target);
      if (!['http:', 'https:'].includes(url.protocol)) return;
      url.hash = '';
      const extras = $(element).find('.result__extras').text();
      const publishedAt = extras.match(/\d{4}-\d{2}-\d{2}(?:T[^\s]+)?/)?.[0] || '';
      results.push({
        url: url.href,
        title: anchor.text().replace(/\s+/g, ' ').trim(),
        publishedAt,
        summary: $(element).find('.result__snippet').text().replace(/\s+/g, ' ').trim()
      });
    } catch {
      // Ignore malformed redirect targets in search markup.
    }
  });
  return results.slice(0, 10);
};

const createAutomation = ({ db, env = process.env }) => {
  let running = false;
  let timer = null;
  let lastResult = null;
  const fallbackConfig = {
    enabled: env.AI_AUTOMATION_ENABLED === 'true',
    baseUrl: (env.AI_BASE_URL || 'http://localhost:20128/v1').replace(/\/$/, ''),
    apiKey: env.AI_API_KEY || '',
    model: env.AI_MODEL || '',
    rssFeeds: parseCsvUrls(env.AI_RSS_FEEDS),
    websites: parseCsvUrls(env.AI_WEBSITE_URLS),
    discoveryEnabled: false,
    discoveryTopics: [],
    allowedDomains: [],
    blockedDomains: [],
    runHourUtc: Number(env.AI_RUN_HOUR_UTC || 1),
    author: env.AI_AUTHOR || 'CosmoGIS AI',
    defaultImageUrl: env.AI_DEFAULT_IMAGE_URL || 'https://picsum.photos/seed/cosmogis-ai/800/400'
  };

  const loadConfig = async () => {
    let row;
    try {
      row = await ensureAutomationSettings(db, env);
    } catch (error) {
      if (String(error.message).includes('no such table')) return fallbackConfig;
      throw error;
    }
    return {
      enabled: Boolean(row.enabled),
      baseUrl: String(row.base_url).replace(/\/$/, ''),
      apiKey: row.api_key || '',
      model: row.model || '',
      rssFeeds: parseJsonArray(row.rss_feeds, true),
      websites: parseJsonArray(row.website_urls, true),
      discoveryEnabled: Boolean(row.discovery_enabled),
      discoveryTopics: parseJsonArray(row.discovery_topics),
      allowedDomains: parseJsonArray(row.allowed_domains, true),
      blockedDomains: parseJsonArray(row.blocked_domains, true),
      runHourUtc: Number(row.run_hour_utc),
      author: row.author || 'CosmoGIS AI',
      defaultImageUrl: row.default_image_url || 'https://picsum.photos/seed/cosmogis-ai/800/400'
    };
  };

  const validateConfig = config => {
    if (!config.model) throw new Error('AI_MODEL is required');
    if (config.rssFeeds.length + config.websites.length === 0 && !config.discoveryEnabled) throw new Error('At least one source or topic discovery is required');
    if (!Number.isInteger(config.runHourUtc) || config.runHourUtc < 0 || config.runHourUtc > 23) throw new Error('AI_RUN_HOUR_UTC must be an integer from 0 to 23');
  };

  const discoverCandidates = async (config, diagnostics) => {
    const settingsResult = await db.query('SELECT site_name_prefix, site_name_suffix FROM settings WHERE id = 1');
    const categoryResult = await db.query('SELECT name FROM categories ORDER BY name');
    const siteName = settingsResult.rows[0] ? `${settingsResult.rows[0].site_name_prefix || ''}${settingsResult.rows[0].site_name_suffix || ''}` : 'CosmoGIS';
    const automaticTopics = categoryResult.rows.map(category => `${siteName} ${category.name}`);
    const topics = [...new Set([...config.discoveryTopics, ...automaticTopics])].slice(0, 3);
    const discovered = [];
    for (const topic of topics) {
      const query = `${topic} latest news ${new Date().getUTCFullYear()}`;
      const html = await fetchSource(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}&df=w`);
      const results = parseDuckDuckGoResults(html);
      diagnostics.discoveryFound += results.length;
      for (const result of results) {
        if (!isAllowedDiscoveryUrl(result.url, config.allowedDomains, config.blockedDomains)) {
          diagnostics.discoveryRejected += 1;
        } else if (!discovered.some(existing => existing.url === result.url)) {
          discovered.push(result);
        }
        if (discovered.length >= 15) return discovered;
      }
    }
    return discovered;
  };

  const collectCandidates = async (config, diagnostics) => {
    const candidates = [];
    if (config.discoveryEnabled) {
      try {
        candidates.push(...await discoverCandidates(config, diagnostics));
      } catch (error) {
        diagnostics.errors.push(`DuckDuckGo: ${error.message}`);
        console.error('[Automation] DuckDuckGo discovery failed:', error.message);
      }
    }
    for (const feedUrl of config.rssFeeds) {
      try {
        const xml = await fetchSource(feedUrl);
        const feedCandidates = parseFeed(xml, feedUrl);
        diagnostics.rssItems += feedCandidates.length;
        candidates.push(...feedCandidates);
      } catch (error) {
        diagnostics.errors.push(`RSS ${feedUrl}: ${error.message}`);
        console.error(`[Automation] RSS source failed (${feedUrl}):`, error.message);
      }
    }
    for (const websiteUrl of config.websites) {
      try {
        if (!await robotsAllows(websiteUrl)) throw new Error('Source disallows crawling in robots.txt');
        const html = await fetchSource(websiteUrl);
        const websiteLinks = extractArticleLinks(html, websiteUrl);
        diagnostics.websiteLinks += websiteLinks.length;
        candidates.push(...websiteLinks.map(url => ({ url, title: '', publishedAt: '', summary: '' })));
      } catch (error) {
        diagnostics.errors.push(`Website ${websiteUrl}: ${error.message}`);
        console.error(`[Automation] Website source failed (${websiteUrl}):`, error.message);
      }
    }
    const uniqueCandidates = [...new Map(candidates.map(candidate => [candidate.url, candidate])).values()]
      .sort((first, second) => {
        const firstDate = Date.parse(first.publishedAt || '') || 0;
        const secondDate = Date.parse(second.publishedAt || '') || 0;
        return secondDate - firstDate;
      });
    diagnostics.candidates = uniqueCandidates.length;
    diagnostics.errors = diagnostics.errors.slice(0, 10);
    return uniqueCandidates;
  };

  const claimCandidate = async candidate => {
    const result = await db.query(
      `INSERT INTO ai_generation_log (source_url, status, claimed_at) VALUES ($1, 'processing', CURRENT_TIMESTAMP)
       ON CONFLICT(source_url) DO UPDATE SET status='processing', claimed_at=CURRENT_TIMESTAMP, error=NULL
       WHERE ai_generation_log.status != 'published'
         AND (ai_generation_log.status != 'processing' OR ai_generation_log.claimed_at <= datetime('now', '-1 hour'))`,
      [candidate.url]
    );
    return result.rowCount > 0;
  };

  const callAi = async (config, article, categories) => {
    const request = {
      model: config.model,
      temperature: 0.4,
      messages: [
        {
          role: 'system',
          content: 'Bạn là biên tập viên CosmoGIS. Viết bài tiếng Việt nguyên bản dựa trên dữ kiện được cung cấp, không sao chép câu chữ, không bịa thêm dữ kiện. Trả về JSON thuần gồm title, excerpt, content (HTML semantic chỉ dùng p,h2,h3,ul,ol,li,strong,em,blockquote,a), category và tags. Không dùng markdown.'
        },
        {
          role: 'user',
          content: `Danh mục hợp lệ: ${JSON.stringify(categories)}\nNguồn: ${article.url}\nTiêu đề nguồn: ${article.title}\nDữ kiện:\n${article.content}`
        }
      ]
    };
    const send = body => fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      signal: AbortSignal.timeout(120000),
      headers: {
        'Content-Type': 'application/json',
        ...(config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {})
      },
      body: JSON.stringify(body)
    });
    let response = await send({ ...request, response_format: { type: 'json_object' } });
    if (response.status === 400) response = await send(request);
    if (!response.ok) throw new Error(`AI gateway returned HTTP ${response.status}`);
    const payload = await response.json();
    const content = payload?.choices?.[0]?.message?.content;
    if (typeof content !== 'string') throw new Error('AI gateway returned an invalid response');
    return generatedPostSchema.parse(JSON.parse(cleanJsonText(content)));
  };

  const run = async () => {
    if (running) return { status: 'skipped', reason: 'already-running' };
    running = true;
    try {
      const config = await loadConfig();
      validateConfig(config);
      const diagnostics = {
        discoveryFound: 0,
        discoveryRejected: 0,
        rssItems: 0,
        websiteLinks: 0,
        candidates: 0,
        alreadyProcessed: 0,
        duplicates: 0,
        failed: 0,
        errors: []
      };
      const candidates = await collectCandidates(config, diagnostics);
      for (const candidate of candidates) {
        if (!await claimCandidate(candidate)) {
          diagnostics.alreadyProcessed += 1;
          continue;
        }
        try {
          if (!await robotsAllows(candidate.url)) throw new Error('Source disallows crawling in robots.txt');
          const html = await fetchSource(candidate.url);
          const article = extractArticle(html, candidate.url, candidate);
          if (article.content.length < 200) throw new Error('Source article does not contain enough text');
          const contentHash = createHash('sha256').update(article.content.replace(/\s+/g, ' ').trim().toLowerCase()).digest('hex');
          const duplicate = await db.query("SELECT source_url FROM ai_generation_log WHERE content_hash=$1 AND status='published'", [contentHash]);
          if (duplicate.rows.length > 0) {
            diagnostics.duplicates += 1;
            await db.query("UPDATE ai_generation_log SET status='duplicate', content_hash=$1, error=$2 WHERE source_url=$3", [contentHash, `Duplicate of ${duplicate.rows[0].source_url}`, candidate.url]);
            continue;
          }
          await db.query('UPDATE ai_generation_log SET content_hash=$1 WHERE source_url=$2', [contentHash, candidate.url]);
          const categoryRows = await db.query('SELECT id, name FROM categories ORDER BY name');
          const categories = categoryRows.rows;
          const generated = await callAi(config, article, categories);
          const validCategory = categories.some(category => category.id === generated.category) ? generated.category : categories[0]?.id || 'space-tech';
          const sourceBlock = `<hr><p><strong>Nguồn tham khảo:</strong> <a href="${candidate.url}" target="_blank" rel="noopener noreferrer nofollow">${article.title || new URL(candidate.url).hostname}</a>. Bài viết được AI tổng hợp và biên tập lại.</p>`;
          const content = sanitizeHtml(`${generated.content}${sourceBlock}`, {
            allowedTags: ['p', 'h2', 'h3', 'ul', 'ol', 'li', 'strong', 'em', 'blockquote', 'a', 'hr'],
            allowedAttributes: { a: ['href', 'target', 'rel'] },
            allowedSchemes: ['http', 'https']
          });
          const hash = createHash('sha256').update(candidate.url).digest('hex').slice(0, 16);
          const postId = `ai-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${hash}`.slice(0, 50);
          await db.query(
            `INSERT INTO posts (id, title, excerpt, content, author, date, category, tags, image_url, read_time)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
            [postId, generated.title, generated.excerpt, content, config.author, new Date().toISOString().slice(0, 10), validCategory, JSON.stringify(generated.tags), config.defaultImageUrl, readingTime(content)]
          );
          await db.query("UPDATE ai_generation_log SET status='published', post_id=$1, published_at=CURRENT_TIMESTAMP WHERE source_url=$2", [postId, candidate.url]);
          lastResult = { status: 'published', postId, sourceUrl: candidate.url, title: generated.title };
          return lastResult;
        } catch (error) {
          diagnostics.failed += 1;
          if (diagnostics.errors.length < 10) diagnostics.errors.push(`${candidate.url}: ${error.message || error}`);
          await db.query("UPDATE ai_generation_log SET status='failed', error=$1 WHERE source_url=$2", [String(error.message || error).slice(0, 1000), candidate.url]);
        }
      }
      lastResult = { status: 'skipped', reason: 'no-new-source', diagnostics };
      return lastResult;
    } finally {
      running = false;
    }
  };

  const schedule = async () => {
    const config = await loadConfig();
    if (!config.enabled || timer) return;
    validateConfig(config);
    const scheduleNext = () => {
      const now = new Date();
      const next = new Date(now);
      next.setUTCHours(config.runHourUtc, 0, 0, 0);
      if (next <= now) next.setUTCDate(next.getUTCDate() + 1);
      timer = setTimeout(async () => {
        try { await run(); } catch (error) { console.error('[Automation] Daily run failed:', error); }
        timer = null;
        scheduleNext();
      }, next.getTime() - now.getTime());
      timer.unref?.();
    };
    scheduleNext();
  };

  const reschedule = async () => {
    if (timer) clearTimeout(timer);
    timer = null;
    await schedule();
  };

  return {
    run,
    schedule,
    reschedule,
    status: async () => {
      const config = await loadConfig();
      return { enabled: config.enabled, running, lastResult, sourceCount: config.rssFeeds.length + config.websites.length, discoveryEnabled: config.discoveryEnabled, runHourUtc: config.runHourUtc, model: config.model || null };
    }
  };
};

module.exports = { createAutomation, extractArticle, extractArticleLinks, isAllowedDiscoveryUrl, isPrivateIp, parseDuckDuckGoResults, parseFeed, readingTime };
