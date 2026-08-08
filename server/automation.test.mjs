import { afterEach, describe, expect, it, vi } from 'vitest';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import automation from './automation.js';

const { containsPolicyPhrase, createAutomation, extractArticle, extractArticleLinks, isAllowedDiscoveryUrl, isPrivateIp, normalizeGeneratedPost, normalizeImageUrl, normalizeSourceIds, parseDuckDuckGoResults, parseFeed, readingTime, selectRelatedCandidates, sourceSimilarity } = automation;

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

  it('matches editorial policy phrases without Vietnamese accents or letter case', () => {
    expect(containsPolicyPhrase('Nội dung CÁ CƯỢC không phù hợp', 'ca cuoc')).toBe(true);
    expect(containsPolicyPhrase('Bài viết về dữ liệu không gian', 'DỮ LIỆU KHÔNG GIAN')).toBe(true);
    expect(containsPolicyPhrase('Nền tảng logistics hiện đại', 'GIS')).toBe(false);
    expect(containsPolicyPhrase('Bất kỳ nội dung nào', '  ')).toBe(false);
    expect(containsPolicyPhrase('Bản đồ Sao Hỏa', 'cá cược')).toBe(false);
  });

  it('normalizes common claim aliases without inventing source citations', () => {
    expect(normalizeGeneratedPost({ keywords: 'GIS, bản đồ; viễn thám\nGIS', claims: [
      'Dữ kiện dạng chuỗi có trích dẫn từ [S1].',
      'Dữ kiện dạng chuỗi nhưng không cung cấp mã nguồn.',
      { claim: 'Dữ liệu vệ tinh hỗ trợ lập bản đồ địa hình Sao Hỏa.', sources: ['[S1]', 'S2'] },
      { statement: 'Ảnh quỹ đạo cung cấp bằng chứng địa hình chi tiết.', citations: [1, { id: 'S3' }] },
      { assertion: 'Mô hình địa hình được xây dựng từ ảnh quỹ đạo.', source: '[S2]' },
      { fact: 'Dữ kiện chưa có trích dẫn.' }
    ] })).toMatchObject({ keywords: ['GIS', 'bản đồ', 'viễn thám'], claims: [
      { text: 'Dữ kiện dạng chuỗi có trích dẫn từ [S1].', sourceIds: ['S1'] },
      { text: 'Dữ kiện dạng chuỗi nhưng không cung cấp mã nguồn.', sourceIds: [] },
      expect.objectContaining({ text: 'Dữ liệu vệ tinh hỗ trợ lập bản đồ địa hình Sao Hỏa.', sourceIds: ['S1', 'S2'] }),
      expect.objectContaining({ text: 'Ảnh quỹ đạo cung cấp bằng chứng địa hình chi tiết.', sourceIds: ['S1', 'S3'] }),
      expect.objectContaining({ text: 'Mô hình địa hình được xây dựng từ ảnh quỹ đạo.', sourceIds: ['S2'] }),
      expect.objectContaining({ text: 'Dữ kiện chưa có trích dẫn.', sourceIds: [] })
    ] });
    expect(normalizeSourceIds(['source S2 and S4', 'không có mã nguồn'])).toEqual(['S2', 'S4']);
  });

  it('creates one sanitized AI draft with a quality score and records its source', async () => {
    const uploadDir = await fs.mkdtemp(path.join(os.tmpdir(), 'cosmogis-images-'));
    temporaryDirectories.push(uploadDir);
    const queries = [];
    const writerPrompts = [];
    const discoveryUrls = [];
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
            default_image_url: 'https://example.com/image.jpg',
            fallback_models: '["backup-model"]',
            retry_count: 0,
            image_generation_enabled: 1,
            image_model: 'ag/gemini-3.1-flash-image',
            generated_content_image_count: 1,
            approval_mode: 'quality_gate',
            quality_threshold: 50,
            article_style: 'analysis',
            target_word_count: 500,
            target_audience: 'professional',
            editorial_prompt: 'Ưu tiên thuật ngữ GIS tiếng Việt.',
            required_keywords: '["dữ liệu vệ tinh"]',
            blocked_keywords: '["quảng cáo trả phí"]'
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
        discoveryUrls.push(String(url));
        return new Response('<div class="result"><a class="result__a" href="//duckduckgo.com/l/?uddg=https%3A%2F%2F93.184.216.34%2Farticle">Mars source</a><div class="result__extras">2026-08-07</div><a class="result__snippet">Summary</a></div>', { status: 200 });
      }
      if (String(url).endsWith('/chat/completions')) {
        const request = JSON.parse(options.body || '{}');
        if (request.temperature !== 0) writerPrompts.push(request.messages?.[1]?.content || '');
        if (request.model === 'database-model') return new Response('temporary failure', { status: 500 });
        expect(request.model).toBe('backup-model');
        const isSchemaRepair = request.messages?.[0]?.content?.includes('bộ sửa cấu trúc JSON');
        if (request.temperature === 0 && !isSchemaRepair) {
          return new Response(JSON.stringify({
            choices: [{ message: { content: JSON.stringify({
              assessments: [{ claimIndex: 0, status: 'supported', sourceIds: ['S1'], note: 'Dữ kiện xuất hiện trong S1' }]
            }) } }]
          }), { status: 200, headers: { 'content-type': 'application/json' } });
        }
        return new Response(JSON.stringify({
          choices: [{ message: { content: JSON.stringify({
            title: 'Bản đồ Sao Hỏa từ dữ liệu vệ tinh mới',
            excerpt: 'Phân tích dữ liệu bản đồ vệ tinh mới phục vụ nghiên cứu địa hình Sao Hỏa và các ứng dụng GIS chuyên nghiệp.',
            content: `<h2>Tổng quan</h2><p>${'Dữ liệu vệ tinh hỗ trợ lập bản đồ địa hình và cung cấp bằng chứng nghiên cứu đáng tin cậy. '.repeat(28)}</p><h2>Ứng dụng</h2><p>${'Nhóm chuyên gia sử dụng kết quả quan sát để phân tích bề mặt và xây dựng lớp bản đồ chuyên đề. '.repeat(20)}</p><script>alert(1)</script>`,
            category: 'space-tech',
            tags: isSchemaRepair ? ['Sao Hỏa', 'GIS', 'Vệ tinh'] : 'Sao Hỏa, GIS, Vệ tinh',
            seoTitle: 'Bản đồ Sao Hỏa từ dữ liệu vệ tinh mới',
            metaDescription: 'Khám phá dữ liệu vệ tinh hỗ trợ lập bản đồ Sao Hỏa. Nội dung không chứa quảng-cáo trả phí ngoài phần kiểm thử chính sách.',
            keywords: 'bản đồ Sao Hỏa, dữ liệu vệ tinh',
            imageAlt: 'Bản đồ địa hình Sao Hỏa từ dữ liệu vệ tinh',
            imageCaption: 'Dữ liệu vệ tinh phục vụ nghiên cứu địa hình Sao Hỏa.',
            imagePlacements: [{ imageId: 'I2', afterHeading: 'Tổng quan', alt: 'Xe tự hành khảo sát Sao Hỏa', caption: 'Xe tự hành thu thập dữ liệu hỗ trợ lập bản đồ địa hình.' }],
            claims: ['Dữ liệu vệ tinh hỗ trợ lập bản đồ địa hình Sao Hỏa. [S1]']
          }) } }]
        }), { status: 200, headers: { 'content-type': 'application/json' } });
      }
      if (String(url).endsWith('/images/generations')) {
        const request = JSON.parse(options.body || '{}');
        expect(request.model).toBe('ag/gemini-3.1-flash-image');
        expect(request.output_format).toBe('png');
        const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
        return new Response(JSON.stringify({ data: [{ b64_json: png.toString('base64') }] }), { status: 200, headers: { 'content-type': 'application/json' } });
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
    const result = await service.run('manual', { customPrompt: 'Tập trung vào ứng dụng GIS trong quản lý thiên tai.' });
    const postInsert = queries.find(query => query.sql.includes('INSERT INTO posts'));

    expect(result.status).toBe('draft');
    expect(result.qualityScore).toBeGreaterThan(50);
    expect(result.model).toBe('backup-model');
    expect(result.attempts).toBe(5);
    expect(decodeURIComponent(discoveryUrls[0])).toContain('Tập trung vào ứng dụng GIS trong quản lý thiên tai.');
    expect(decodeURIComponent(discoveryUrls[0])).not.toContain('Mars GIS');
    expect(writerPrompts.some(prompt => prompt.includes('Tập trung vào ứng dụng GIS trong quản lý thiên tai.'))).toBe(true);
    expect(writerPrompts.some(prompt => prompt.includes('Ưu tiên thuật ngữ GIS tiếng Việt.'))).toBe(false);
    const status = await service.status();
    expect(status.running).toBe(false);
    expect(status.progress).toMatchObject({ stage: 'completed', percent: 100, totalCandidates: 1, processedCandidates: 1 });
    expect(postInsert).toBeTruthy();
    expect(postInsert.params[3]).toContain('Nguồn tham khảo');
    expect(postInsert.params[3]).not.toContain('Hình ảnh từ nguồn');
    expect(postInsert.params[3]).toContain('https://api.cosmogis.test/api/uploads/ai-');
    expect(postInsert.params[3].indexOf('Dữ liệu vệ tinh hỗ trợ')).toBeLessThan(postInsert.params[3].indexOf('<figure>'));
    expect(postInsert.params[3].indexOf('<figure>')).toBeLessThan(postInsert.params[3].indexOf('Nguồn tham khảo'));
    expect(postInsert.params[3]).toContain('Xem nguồn ảnh');
    expect(postInsert.params[3]).not.toContain('<script');
    expect(postInsert.params[4]).toBe('Database Author');
    expect(postInsert.params[8]).toMatch(/^https:\/\/api\.cosmogis\.test\/api\/uploads\/ai-generated-.+\.png$/);
    expect(postInsert.params[10]).toBe('draft');
    expect(postInsert.params[11]).toBe(result.qualityScore);
    const qualityReport = JSON.parse(postInsert.params[12]);
    expect(qualityReport.hardFailures).toContain('Chứa từ khóa bị chặn: quảng cáo trả phí');
    expect(qualityReport.policy).toMatchObject({
      articleStyle: 'analysis',
      targetAudience: 'professional',
      targetWordCount: 500,
      missingRequiredKeywords: [],
      presentBlockedKeywords: ['quảng cáo trả phí']
    });
    expect(qualityReport.verification).toMatchObject({ supported: 1, partial: 0, unsupported: 0 });
    expect(qualityReport.gateway).toMatchObject({ writerModel: 'backup-model', writerAttempts: 3, factCheckModel: 'backup-model', factCheckAttempts: 2 });
    expect(postInsert.params[15]).toBe('Bản đồ Sao Hỏa từ dữ liệu vệ tinh mới');
    expect(postInsert.params[17]).toBe('["bản đồ Sao Hỏa","dữ liệu vệ tinh"]');
    expect(qualityReport.media).toMatchObject({ imageModel: 'ag/gemini-3.1-flash-image', generatedTitleImage: true, generatedContentImages: 1 });
    expect(await fs.readdir(uploadDir)).toHaveLength(4);
    expect(fetch).toHaveBeenCalledWith('http://9router.test/v1/chat/completions', expect.anything());
    expect(queries.some(query => query.sql.includes("SET status=$1") && query.params[0] === 'draft')).toBe(true);
    expect(queries.some(query => query.sql.includes('INSERT INTO ai_automation_runs') && query.params[2] === 'running')).toBe(true);
    expect(queries.some(query => query.sql.includes('UPDATE ai_automation_runs SET status=$1') && query.params[0] === 'draft')).toBe(true);
  });

  it('requires claims to cite an existing source', () => {
    const sourceIds = new Set(['S1', 'S2']);
    const claims = [{ text: 'A sufficiently detailed factual statement', sourceIds: ['S1', 'S3'] }];
    const invalid = claims.flatMap((claim, claimIndex) => claim.sourceIds.filter(sourceId => !sourceIds.has(sourceId)).map(sourceId => ({ claimIndex, sourceId })));
    expect(invalid).toEqual([{ claimIndex: 0, sourceId: 'S3' }]);
  });

  it('stops the whole run instead of cycling through sources when 9Router rejects the writer request', async () => {
    const queries = [];
    const db = {
      query: vi.fn(async (sql, params = []) => {
        queries.push({ sql, params });
        if (sql.includes('SELECT * FROM ai_automation_settings')) return { rows: [{
          enabled: 1,
          base_url: 'http://9router.test/v1',
          api_key: 'invalid-key',
          model: 'missing-model',
          rss_feeds: '[]',
          website_urls: '[]',
          discovery_enabled: 1,
          discovery_provider: 'duckduckgo',
          discovery_topics: '["Mars GIS"]',
          allowed_domains: '["93.184.216.34"]',
          blocked_domains: '[]',
          run_hour_utc: 1,
          author: 'AI',
          default_image_url: '/image.jpg',
          fallback_models: '[]',
          retry_count: 0
        }] };
        if (sql.includes('INSERT INTO ai_generation_log')) return { rowCount: 1, rows: [] };
        if (sql.includes('SELECT site_name_prefix')) return { rows: [{ site_name_prefix: 'COSMO', site_name_suffix: 'GIS' }] };
        if (sql.includes('SELECT name FROM categories')) return { rows: [{ name: 'Công nghệ vũ trụ' }] };
        if (sql.includes('SELECT id, name FROM categories')) return { rows: [{ id: 'space-tech', name: 'Công nghệ vũ trụ' }] };
        return { rows: [], rowCount: 1 };
      })
    };
    const chatRequests = [];
    vi.stubGlobal('fetch', vi.fn(async (url, options = {}) => {
      if (String(url).includes('html.duckduckgo.com/html/')) return new Response([
        '<div class="result"><a class="result__a" href="//duckduckgo.com/l/?uddg=https%3A%2F%2F93.184.216.34%2Farticle-one">Mars mapping one</a><a class="result__snippet">Satellite terrain mapping evidence</a></div>',
        '<div class="result"><a class="result__a" href="//duckduckgo.com/l/?uddg=https%3A%2F%2F93.184.216.34%2Farticle-two">Mars mapping two</a><a class="result__snippet">Independent orbital mapping evidence</a></div>'
      ].join(''), { status: 200 });
      if (String(url).endsWith('/chat/completions')) {
        chatRequests.push(JSON.parse(options.body || '{}'));
        return new Response('invalid API key', { status: 401 });
      }
      if (String(url).endsWith('/robots.txt')) return new Response('User-agent: *\nAllow: /', { status: 200 });
      return new Response(`<article><h1>Mars mapping source</h1><p>${'Satellite observations provide detailed terrain mapping evidence. '.repeat(12)}</p></article>`, { status: 200 });
    }));

    const service = createAutomation({ db });
    await expect(service.run()).rejects.toThrow('Không thể tạo bài qua 9Router (http://9router.test/v1) sau 1 lượt gọi: 9Router trả HTTP 401: invalid API key');
    expect(chatRequests).toHaveLength(1);
    expect((await service.status()).lastResult).toMatchObject({ status: 'failed', error: expect.stringContaining('HTTP 401') });
    expect(queries.filter(query => query.sql.includes('INSERT INTO ai_generation_log'))).toHaveLength(1);
    expect(queries.some(query => query.sql.includes('UPDATE ai_automation_runs SET status=$1') && query.params[0] === 'failed')).toBe(true);
  });

  it('attempts schema repair only once before failing with concise field errors', async () => {
    const db = {
      query: vi.fn(async (sql) => {
        if (sql.includes('SELECT * FROM ai_automation_settings')) return { rows: [{
          enabled: 1,
          base_url: 'http://9router.test/v1',
          api_key: '',
          model: 'writer',
          rss_feeds: '[]',
          website_urls: '[]',
          discovery_enabled: 1,
          discovery_topics: '["Mars"]',
          allowed_domains: '["93.184.216.34"]',
          blocked_domains: '[]',
          run_hour_utc: 1,
          author: 'AI',
          default_image_url: '/image.jpg',
          fallback_models: '[]',
          retry_count: 0
        }] };
        if (sql.includes('INSERT INTO ai_generation_log')) return { rowCount: 1, rows: [] };
        if (sql.includes('SELECT site_name_prefix')) return { rows: [{ site_name_prefix: 'GIS', site_name_suffix: 'VN' }] };
        if (sql.includes('SELECT name FROM categories')) return { rows: [{ name: 'Vũ trụ' }] };
        if (sql.includes('SELECT id, name FROM categories')) return { rows: [{ id: 'space-tech', name: 'Vũ trụ' }] };
        return { rows: [], rowCount: 1 };
      })
    };
    let chatCalls = 0;
    vi.stubGlobal('fetch', vi.fn(async (url) => {
      if (String(url).includes('html.duckduckgo.com/html/')) return new Response('<div class="result"><a class="result__a" href="//duckduckgo.com/l/?uddg=https%3A%2F%2F93.184.216.34%2Farticle">Mars mapping source</a><a class="result__snippet">Orbital terrain evidence</a></div>', { status: 200 });
      if (String(url).endsWith('/chat/completions')) {
        chatCalls += 1;
        return new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify({ title: 'Quá ngắn', tags: 'sai kiểu' }) } }] }), { status: 200, headers: { 'content-type': 'application/json' } });
      }
      if (String(url).endsWith('/robots.txt')) return new Response('User-agent: *\nAllow: /', { status: 200 });
      return new Response(`<article><h1>Mars source</h1><p>${'Orbital observations provide detailed terrain mapping evidence. '.repeat(12)}</p></article>`, { status: 200 });
    }));

    const service = createAutomation({ db });
    await expect(service.run()).rejects.toThrow(/JSON vẫn sai schema sau một lượt sửa:[\s\S]*excerpt:/);
    expect(chatCalls).toBe(2);
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

  it('cancels an active run without creating a post', async () => {
    const db = {
      query: vi.fn(async sql => {
        if (sql.includes('SELECT * FROM ai_automation_settings')) return { rows: [{
          enabled: 1,
          base_url: 'http://9router.test/v1',
          api_key: '',
          model: 'writer',
          rss_feeds: '[]',
          website_urls: '[]',
          discovery_enabled: 1,
          discovery_topics: '["GIS"]',
          allowed_domains: '[]',
          blocked_domains: '[]',
          run_hour_utc: 1,
          author: 'AI',
          default_image_url: '/image.jpg'
        }] };
        if (sql.includes('SELECT site_name_prefix') || sql.includes('SELECT name FROM categories')) return { rows: [] };
        return { rows: [], rowCount: 1 };
      })
    };
    vi.stubGlobal('fetch', vi.fn((_url, options = {}) => new Promise((resolve, reject) => {
      if (options.signal?.aborted) {
        reject(options.signal.reason);
        return;
      }
      options.signal?.addEventListener('abort', () => reject(options.signal.reason), { once: true });
    })));

    const service = createAutomation({ db });
    const started = await service.start();
    expect(started).toMatchObject({ status: 'started', runId: expect.stringMatching(/^run-/) });
    await vi.waitFor(async () => expect((await service.status()).running).toBe(true));
    expect(await service.start()).toEqual({ status: 'skipped', reason: 'already-running' });
    expect(await service.cancel()).toEqual({ cancelled: true });
    await vi.waitFor(async () => expect((await service.status()).running).toBe(false));
    expect((await service.status()).lastResult).toMatchObject({ status: 'cancelled' });
    expect(await service.cancel()).toEqual({ cancelled: false, reason: 'not-running' });
    expect((await service.status()).progress).toMatchObject({ stage: 'cancelled', percent: 100 });
    expect(db.query).not.toHaveBeenCalledWith(expect.stringContaining('INSERT INTO posts'), expect.anything());
    expect(db.query).toHaveBeenCalledWith(expect.stringContaining('UPDATE ai_automation_runs SET status=$1'), ['cancelled', 'cancelled', expect.stringMatching(/^run-/)]);
  });

  it('recovers and clears a persisted run interrupted by a backend restart', async () => {
    let staleRunActive = true;
    const db = {
      query: vi.fn(async (sql, params = []) => {
        if (sql.includes('SELECT * FROM ai_automation_settings')) return { rows: [{
          enabled: 0,
          base_url: 'http://9router.test/v1',
          api_key: '',
          model: 'writer',
          rss_feeds: '[]',
          website_urls: '[]',
          discovery_enabled: 0,
          run_hour_utc: 1,
          author: 'AI',
          default_image_url: '/image.jpg'
        }] };
        if (sql.includes("SELECT id, stage, started_at") && staleRunActive) return { rows: [{ id: 'run-stale', stage: 'writing', started_at: '2026-08-08T08:00:00.000Z' }] };
        if (sql.includes("SELECT id FROM ai_automation_runs") && staleRunActive) return { rows: [{ id: 'run-stale' }] };
        if (sql.includes("UPDATE ai_automation_runs SET status='cancelled'")) staleRunActive = false;
        return { rows: [], rowCount: 1, params };
      })
    };

    const service = createAutomation({ db });
    expect(await service.status()).toMatchObject({ running: true, runId: 'run-stale', progress: { stale: true } });
    expect(await service.cancel()).toMatchObject({ cancelled: true, stale: true, runId: 'run-stale' });
    expect(await service.status()).toMatchObject({ running: false, lastResult: { status: 'cancelled', reason: 'stale-run-cleared' } });
    expect(db.query).toHaveBeenCalledWith(expect.stringContaining("UPDATE ai_generation_log SET status='cancelled'"), ['Interrupted run cleared by admin']);
  });

  it('recovers only generation rows owned by stale run ids', async () => {
    const queries = [];
    const db = {
      query: vi.fn(async (sql, params = []) => {
        queries.push({ sql, params });
        if (sql.includes("COALESCE(heartbeat_at, started_at)")) return { rows: [{ id: 'run-stale-a' }, { id: 'run-stale-b' }] };
        return { rows: [], rowCount: 1 };
      })
    };

    const service = createAutomation({ db });
    expect(await service.recoverStaleRuns()).toEqual({ recovered: 2, runIds: ['run-stale-a', 'run-stale-b'] });
    const generationUpdates = queries.filter(query => query.sql.includes('UPDATE ai_generation_log'));
    expect(generationUpdates).toHaveLength(2);
    expect(generationUpdates[0].sql).toContain('WHERE run_id=$3');
    expect(generationUpdates.map(query => query.params[2])).toEqual(['run-stale-a', 'run-stale-b']);
  });

});
