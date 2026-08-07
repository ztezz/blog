const splitList = values => values
  .flatMap(item => typeof item === 'string' ? item.split(/[,\r\n]+/) : [])
  .map(item => item.trim())
  .filter(Boolean);

const parseJsonArray = (value, splitItems = false) => {
  try {
    const parsed = JSON.parse(value || '[]');
    if (!Array.isArray(parsed)) return [];
    const strings = parsed.filter(item => typeof item === 'string');
    return splitItems ? splitList(strings) : strings;
  } catch {
    return [];
  }
};

const seedValues = env => {
  const parseCsvUrls = value => (value || '').split(',').map(url => url.trim()).filter(Boolean);
  return [
    env.AI_AUTOMATION_ENABLED === 'true' ? 1 : 0,
    env.AI_BASE_URL || 'http://localhost:20128/v1',
    env.AI_API_KEY || '',
    env.AI_MODEL || '',
    JSON.stringify(parseCsvUrls(env.AI_RSS_FEEDS)),
    JSON.stringify(parseCsvUrls(env.AI_WEBSITE_URLS)),
    Number(env.AI_RUN_HOUR_UTC || 1),
    env.AI_AUTHOR || 'CosmoGIS AI',
    env.AI_DEFAULT_IMAGE_URL || 'https://picsum.photos/seed/cosmogis-ai/800/400'
  ];
};

const ensureAutomationSettings = async (db, env = process.env) => {
  await db.query(
    `INSERT OR IGNORE INTO ai_automation_settings
     (id, enabled, base_url, api_key, model, rss_feeds, website_urls, run_hour_utc, author, default_image_url)
     VALUES (1, $1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    seedValues(env)
  );
  const result = await db.query('SELECT * FROM ai_automation_settings WHERE id = 1');
  if (!result.rows[0]) throw new Error('Unable to initialize AI automation settings');
  return result.rows[0];
};

const serializeAutomationSettings = settings => ({
  enabled: Boolean(settings.enabled),
  baseUrl: settings.base_url || 'http://localhost:20128/v1',
  apiKey: '',
  hasApiKey: Boolean(settings.api_key),
  model: settings.model || '',
  rssFeeds: parseJsonArray(settings.rss_feeds, true),
  websites: parseJsonArray(settings.website_urls, true),
  discoveryEnabled: Boolean(settings.discovery_enabled),
  discoveryProvider: settings.discovery_provider === '9router' ? '9router' : 'duckduckgo',
  discoveryModel: settings.discovery_model || '',
  discoveryTopics: parseJsonArray(settings.discovery_topics),
  allowedDomains: parseJsonArray(settings.allowed_domains, true),
  blockedDomains: parseJsonArray(settings.blocked_domains, true),
  runHourUtc: Number(settings.run_hour_utc ?? 1),
  author: settings.author || 'CosmoGIS AI',
  defaultImageUrl: settings.default_image_url || 'https://picsum.photos/seed/cosmogis-ai/800/400'
});

module.exports = { ensureAutomationSettings, parseJsonArray, serializeAutomationSettings, splitList };
