import { describe, expect, it, vi } from 'vitest';
import settingsModule from './automation-settings.js';

const { ensureAutomationSettings, parseJsonArray, serializeAutomationSettings, splitList } = settingsModule;

describe('automation settings recovery', () => {
  it('creates the singleton row when it is missing', async () => {
    let row = null;
    const db = {
      query: vi.fn(async (sql, params = []) => {
        if (sql.includes('INSERT OR IGNORE')) {
          row = {
            id: 1,
            enabled: params[0],
            base_url: params[1],
            api_key: params[2],
            model: params[3],
            rss_feeds: params[4],
            website_urls: params[5],
            run_hour_utc: params[6],
            author: params[7],
            default_image_url: params[8]
          };
          return { rows: [], rowCount: 1 };
        }
        return { rows: row ? [row] : [] };
      })
    };

    const result = await ensureAutomationSettings(db, { AI_MODEL: 'seed-model' });
    expect(result.id).toBe(1);
    expect(result.model).toBe('seed-model');
  });

  it('recovers malformed JSON arrays without exposing the API key', () => {
    expect(parseJsonArray('{broken')).toEqual([]);
    expect(serializeAutomationSettings({
      enabled: 0,
      base_url: 'http://localhost:20128/v1',
      api_key: 'secret',
      rss_feeds: '{broken',
      website_urls: 'null',
      discovery_topics: '["Mars"]',
      allowed_domains: '[]',
      blocked_domains: '[]',
      run_hour_utc: 1,
      schedule_json: '{broken',
      author: 'AI',
      default_image_url: '/image.jpg',
      article_style: 'tutorial',
      target_word_count: 1800,
      target_audience: 'professional',
      editorial_prompt: 'Giải thích thuật ngữ khi xuất hiện lần đầu.',
      required_keywords: '["dữ liệu không gian"]',
      blocked_keywords: '["cá cược"]'
      ,max_sources: 5
      ,max_model_calls: 12
      ,max_duration_seconds: 900
    })).toMatchObject({
      apiKey: '',
      hasApiKey: true,
      rssFeeds: [],
      websites: [],
      discoveryTopics: ['Mars'],
      articleStyle: 'tutorial',
      targetWordCount: 1800,
      targetAudience: 'professional',
      editorialPrompt: 'Giải thích thuật ngữ khi xuất hiện lần đầu.',
      requiredKeywords: ['dữ liệu không gian'],
      blockedKeywords: ['cá cược'],
      maxSources: 5,
      maxModelCalls: 12,
      maxDurationSeconds: 900
      ,schedule: { type: 'weekly', daysOfWeek: [0, 1, 2, 3, 4, 5, 6], time: '08:00' }
    });
  });

  it('serializes a saved flexible schedule', () => {
    expect(serializeAutomationSettings({ run_hour_utc: 1, schedule_json: '{"type":"interval","intervalHours":12}' }).schedule).toEqual({ type: 'interval', intervalHours: 12 });
  });

  it('splits legacy comma-separated URLs stored as a single array item', () => {
    const legacy = '["https://www.naturalearthdata.com,https://www.esri.com,https://www.usgs.gov"]';
    expect(parseJsonArray(legacy, true)).toEqual([
      'https://www.naturalearthdata.com',
      'https://www.esri.com',
      'https://www.usgs.gov'
    ]);
    expect(splitList(['nasa.gov, esa.int\n usgs.gov'])).toEqual(['nasa.gov', 'esa.int', 'usgs.gov']);
  });
});
