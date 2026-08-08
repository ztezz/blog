import { afterEach, describe, expect, it, vi } from 'vitest';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import automation from './automation.js';

const { createAutomation, extractArticle, extractArticleLinks, isAllowedDiscoveryUrl, isPrivateIp, normalizeImageUrl, parseDuckDuckGoResults, parseFeed, readingTime, selectRelatedCandidates, sourceSimilarity } = automation;

const temporaryDirectories = [];

afterEach(async () => {
  vi.unstubAllGlobals();
  await Promise.all(temporaryDirectories.splice(0).map(directory => fs.rm(directory, { recursive: true, force: true })));
});

describe('content automation helpers', () => {
  it('parses RSS and Atom links', () => {
    const rss = `<?xml version="1.0"?><rss><channel><item><title>Mars map</title><link>/mars</link><pubDate>2026-08-07</pubDate><description>New mapping data</description><enclosure url="/images/mars.jpg" type="image/jpeg" /></item></channel></rss>`;
    expect(parseFeed(rss, 'https://example.com/feed.xml')[0]).toMatchObject({
      url: 'https://example.com/mars',
      title: 'Mars map',
      imageUrl: 'https://example.com/images/mars.jpg'
    });
  });

  it('extracts same-origin article links only', () => {
    const html = '<main><a href="/news/one">One</a><a href="https://evil.example/post">External</a><a href="/news/one#part">Duplicate</a></main>';
    expect(extractArticleLinks(html, 'https://example.com/news')).toEqual(['https://example.com/news/one']);
  });

  it('falls back to meaningful body links when a website has no main or article element', () => {
    const html = '<body><a href="/post/one">A sufficiently descriptive article title</a><a href="/privacy">Privacy policy page</a><a href="/x">Short</a></body>';
    expect(extractArticleLinks(html, 'https://example.com')).toEqual(['https://example.com/post/one']);
  });

  it('extracts article text and removes executable elements', () => {
    const article = extractArticle('<meta property="og:image" content="/images/satellite-map.webp"><article><h1>Title</h1><script>alert(1)</script><p>This is a sufficiently detailed paragraph about satellite mapping.</p></article>', 'https://example.com/post');
    expect(article.title).toBe('Title');
    expect(article.content).toContain('satellite mapping');
    expect(article.content).not.toContain('alert');
    expect(article.imageUrl).toBe('https://example.com/images/satellite-map.webp');
  });

  it('filters decorative images and falls back to a relevant article image', () => {
    const article = extractArticle('<meta property="og:image" content="/assets/site-logo.png"><article><img src="/images/mars-terrain.jpg" width="1200" height="630"><p>This is a sufficiently detailed paragraph about mapping the terrain of Mars.</p></article>', 'https://example.com/post');
    expect(article.imageUrl).toBe('https://example.com/images/mars-terrain.jpg');
    expect(normalizeImageUrl('javascript:alert(1)', 'https://example.com/post')).toBe('');
  });

  it('blocks private network addresses', () => {
    expect(isPrivateIp('127.0.0.1')).toBe(true);
    expect(isPrivateIp('192.168.1.1')).toBe(true);
    expect(isPrivateIp('8.8.8.8')).toBe(false);
    expect(isPrivateIp('::1')).toBe(true);
  });

  it('applies discovery domain allowlists and blocklists to subdomains', () => {
    expect(isAllowedDiscoveryUrl('https://science.nasa.gov/mars', ['nasa.gov'], [])).toBe(true);
    expect(isAllowedDiscoveryUrl('https://example.com/mars', ['nasa.gov'], [])).toBe(false);
    expect(isAllowedDiscoveryUrl('https://spam.nasa.gov/mars', ['nasa.gov'], ['spam.nasa.gov'])).toBe(false);
  });

  it('parses and unwraps DuckDuckGo HTML results', () => {
    const html = '<div class="result"><a class="result__a" href="//duckduckgo.com/l/?uddg=https%3A%2F%2Fscience.nasa.gov%2Fmars%2Fnews">Mars News</a><div class="result__extras">2026-08-07T00:00:00</div><a class="result__snippet">Latest Mars mapping data</a></div>';
    expect(parseDuckDuckGoResults(html)[0]).toMatchObject({
      url: 'https://science.nasa.gov/mars/news',
      title: 'Mars News',
      publishedAt: '2026-08-07T00:00:00'
    });
  });

  it('calculates a non-zero reading time', () => {
    expect(readingTime('<p>short article</p>')).toBe('1 phút');
  });

  it('selects related evidence from independent domains', () => {
    const anchor = { url: 'https://nasa.gov/mars-map', title: 'New satellite map of Mars terrain', summary: 'Orbiter data maps Mars terrain' };
    const candidates = [
      anchor,
      { url: 'https://nasa.gov/duplicate', title: 'Satellite map of Mars terrain', summary: 'Mars terrain data' },
      { url: 'https://esa.int/mars-map', title: 'Satellite data improves Mars terrain map', summary: 'Mars orbiter mapping' },
      { url: 'https://example.com/weather', title: 'Weather forecast for Earth', summary: 'Rain and wind' }
    ];
    expect(sourceSimilarity(anchor, candidates[2])).toBeGreaterThan(0.2);
    expect(selectRelatedCandidates(anchor, candidates)).toEqual([candidates[2]]);
  });

  it('creates one sanitized AI draft with a quality score and records its source', async () => {
    const uploadDir = await fs.mkdtemp(path.join(os.tmpdir(), 'cosmogis-images-'));
    temporaryDirectories.push(uploadDir);
    const queries = [];
    const db = {
      query: vi.fn(async (sql, params = []) => {
        queries.push({ sql, params });
        if (sql.includes('SELECT * FROM ai_automation_settings')) return {
          rows: [{
            enabled: 1,
            base_url: 'http://9router.test/v1',
            api_key: 'database-secret',
            model: 'database-model',
            rss_feeds: '[]',
            website_urls: '[]',
            discovery_enabled: 1,
            discovery_provider: 'duckduckgo',
            discovery_model: '',
            discovery_topics: '["Mars GIS"]',
            allowed_domains: '["93.184.216.34"]',
            blocked_domains: '[]',
            run_hour_utc: 1,
            author: 'Database Author',
            default_image_url: 'https://example.com/image.jpg'
          }]
        };
        if (sql.includes('INSERT INTO ai_generation_log')) return { rowCount: 1, rows: [] };
        if (sql.includes('SELECT site_name_prefix')) return { rows: [{ site_name_prefix: 'COSMO', site_name_suffix: 'GIS' }] };
        if (sql.includes('SELECT name FROM categories')) return { rows: [{ name: 'Công nghệ vũ trụ' }] };
        if (sql.includes('SELECT id, name FROM categories')) return { rows: [{ id: 'space-tech', name: 'Công nghệ vũ trụ' }] };
        return { rows: [], rowCount: 1 };
      })
    };
    vi.stubGlobal('fetch', vi.fn(async (url, options = {}) => {
      if (String(url).includes('html.duckduckgo.com/html/')) {
        return new Response('<div class="result"><a class="result__a" href="//duckduckgo.com/l/?uddg=https%3A%2F%2F93.184.216.34%2Farticle">Mars source</a><div class="result__extras">2026-08-07</div><a class="result__snippet">Summary</a></div>', { status: 200 });
      }
      if (String(url).endsWith('/chat/completions')) {
        const request = JSON.parse(options.body || '{}');
        expect(request.model).toBe('database-model');
        if (request.temperature === 0) {
          return new Response(JSON.stringify({
            choices: [{ message: { content: JSON.stringify({
              assessments: [{ claimIndex: 0, status: 'supported', sourceIds: ['S1'], note: 'Dữ kiện xuất hiện trong S1' }]
            }) } }]
          }), { status: 200, headers: { 'content-type': 'application/json' } });
        }
        return new Response(JSON.stringify({
          choices: [{ message: { content: JSON.stringify({
            title: 'Bản đồ Sao Hỏa từ dữ liệu vệ tinh mới',
            excerpt: 'Phân tích dữ liệu bản đồ mới phục vụ nghiên cứu địa hình Sao Hỏa.',
            content: `<h2>Tổng quan</h2><p>${'Dữ liệu vệ tinh hỗ trợ lập bản đồ địa hình. '.repeat(12)}</p><script>alert(1)</script>`,
            category: 'space-tech',
            tags: ['Sao Hỏa', 'GIS'],
            seoTitle: 'Bản đồ Sao Hỏa từ dữ liệu vệ tinh mới',
            metaDescription: 'Khám phá cách dữ liệu vệ tinh mới hỗ trợ lập bản đồ và nghiên cứu địa hình Sao Hỏa với thông tin từ nguồn tham khảo.',
            keywords: ['bản đồ Sao Hỏa', 'dữ liệu vệ tinh'],
            imageAlt: 'Bản đồ địa hình Sao Hỏa từ dữ liệu vệ tinh',
            imageCaption: 'Dữ liệu vệ tinh phục vụ nghiên cứu địa hình Sao Hỏa.',
            claims: [{ text: 'Dữ liệu vệ tinh hỗ trợ lập bản đồ địa hình Sao Hỏa.', sourceIds: ['S1'] }]
          }) } }]
        }), { status: 200, headers: { 'content-type': 'application/json' } });
      }
      if (String(url).endsWith('/robots.txt')) return new Response('User-agent: *\nAllow: /', { status: 200 });
      if (String(url).includes('/images/')) return new Response(Uint8Array.from([0xff, 0xd8, 0xff, 0xd9]), { status: 200, headers: { 'content-type': 'image/jpeg' } });
      return new Response(`<meta property="og:image" content="https://93.184.216.34/images/mars-map.jpg"><article><h1>Mars source</h1><p>${'Satellite mapping facts for Mars terrain. '.repeat(12)}</p><img src="https://93.184.216.34/images/mars-rover.jpg" alt="Xe tự hành khảo sát Sao Hỏa" width="1200" height="800"></article>`, { status: 200 });
    }));

    const service = createAutomation({
      db,
      env: {
        AI_MODEL: 'ignored-env-model',
        AI_RSS_FEEDS: 'https://ignored.example/feed.xml',
        AI_DEFAULT_IMAGE_URL: 'https://example.com/image.jpg'
      },
      uploadDir,
      publicApiUrl: 'https://api.cosmogis.test'
    });
    const result = await service.run();
    const postInsert = queries.find(query => query.sql.includes('INSERT INTO posts'));

    expect(result.status).toBe('draft');
    expect(result.qualityScore).toBeGreaterThan(0);
    const status = await service.status();
    expect(status.running).toBe(false);
    expect(status.progress).toMatchObject({ stage: 'completed', percent: 100, totalCandidates: 1, processedCandidates: 1 });
    expect(postInsert).toBeTruthy();
    expect(postInsert.params[3]).toContain('Nguồn tham khảo');
    expect(postInsert.params[3]).toContain('Hình ảnh từ nguồn');
    expect(postInsert.params[3]).toContain('https://api.cosmogis.test/api/uploads/ai-');
    expect(postInsert.params[3]).not.toContain('<script');
    expect(postInsert.params[4]).toBe('Database Author');
    expect(postInsert.params[8]).toMatch(/^https:\/\/api\.cosmogis\.test\/api\/uploads\/ai-.+\.jpg$/);
    expect(postInsert.params[10]).toBe('draft');
    expect(postInsert.params[11]).toBe(result.qualityScore);
    const qualityReport = JSON.parse(postInsert.params[12]);
    expect(qualityReport.hardFailures).toEqual([]);
    expect(qualityReport.verification).toMatchObject({ supported: 1, partial: 0, unsupported: 0 });
    expect(postInsert.params[15]).toBe('Bản đồ Sao Hỏa từ dữ liệu vệ tinh mới');
    expect(postInsert.params[17]).toBe('["bản đồ Sao Hỏa","dữ liệu vệ tinh"]');
    expect(await fs.readdir(uploadDir)).toHaveLength(2);
    expect(fetch).toHaveBeenCalledWith('http://9router.test/v1/chat/completions', expect.anything());
    expect(queries.some(query => query.sql.includes("SET status=$1") && query.params[0] === 'draft')).toBe(true);
  });

  it('requires claims to cite an existing source', () => {
    const sourceIds = new Set(['S1', 'S2']);
    const claims = [{ text: 'A sufficiently detailed factual statement', sourceIds: ['S1', 'S3'] }];
    const invalid = claims.flatMap((claim, claimIndex) => claim.sourceIds.filter(sourceId => !sourceIds.has(sourceId)).map(sourceId => ({ claimIndex, sourceId })));
    expect(invalid).toEqual([{ claimIndex: 0, sourceId: 'S3' }]);
  });

  it('returns diagnostics when topic discovery finds no source', async () => {
    const db = {
      query: vi.fn(async sql => {
        if (sql.includes('SELECT * FROM ai_automation_settings')) return {
          rows: [{
            enabled: 1,
            base_url: 'http://9router.test/v1',
            api_key: '',
            model: 'writer',
            rss_feeds: '[]',
            website_urls: '[]',
            discovery_enabled: 1,
            discovery_provider: 'duckduckgo',
            discovery_model: '',
            discovery_topics: '["GIS"]',
            allowed_domains: '[]',
            blocked_domains: '[]',
            run_hour_utc: 1,
            author: 'AI',
            default_image_url: '/image.jpg'
          }]
        };
        if (sql.includes('SELECT site_name_prefix')) return { rows: [] };
        if (sql.includes('SELECT name FROM categories')) return { rows: [] };
        return { rows: [], rowCount: 1 };
      })
    };
    vi.stubGlobal('fetch', vi.fn(async () => new Response('<html><body>No results</body></html>', { status: 200 })));

    const service = createAutomation({ db });
    const result = await service.run();
    expect(result).toMatchObject({
      status: 'skipped',
      reason: 'no-new-source',
      diagnostics: { discoveryFound: 0, candidates: 0, failed: 0 }
    });
    expect((await service.status()).progress).toMatchObject({ stage: 'completed', percent: 100, totalCandidates: 0 });
  });

});
