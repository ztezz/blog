import { describe, expect, it, vi } from 'vitest';
import settingsModule from './automation-settings.js';

const { ensureAutomationSettings, parseJsonArray, serializeAutomationSettings } = settingsModule;

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
      author: 'AI',
      default_image_url: '/image.jpg'
    })).toMatchObject({ apiKey: '', hasApiKey: true, rssFeeds: [], websites: [], discoveryTopics: ['Mars'] });
  });
});
