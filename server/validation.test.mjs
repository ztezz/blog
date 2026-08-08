import { describe, expect, it } from 'vitest';
import validation from './validation.js';

const { schemas } = validation;

describe('API request schemas', () => {
  it('rejects unsafe roles and malformed identifiers', () => {
    expect(schemas.user.safeParse({
      id: '../admin',
      username: 'user',
      password: 'secret',
      displayName: 'User',
      role: 'owner'
    }).success).toBe(false);
  });

  it('rejects executable media URLs', () => {
    expect(schemas.post.safeParse({
      id: 'post-1',
      title: 'Post',
      excerpt: '',
      content: '<p>Content</p>',
      author: 'Admin',
      date: '2026-08-07',
      category: 'gis-basic',
      tags: [],
      imageUrl: 'javascript:alert(1)',
      readTime: '1 phút'
    }).success).toBe(false);
  });

  it('normalizes valid contact messages', () => {
    const result = schemas.message.parse({
      name: '  Nguyen Van A  ',
      email: 'user@example.com',
      subject: '  Xin chao  ',
      message: '  Noi dung  '
    });

    expect(result.name).toBe('Nguyen Van A');
    expect(result.message).toBe('Noi dung');
  });

  it('validates resource and numeric message identifiers', () => {
    expect(schemas.idParam.safeParse({ id: '../post' }).success).toBe(false);
    expect(schemas.messageIdParam.parse({ id: '42' }).id).toBe(42);
    expect(schemas.messageIdParam.safeParse({ id: '-1' }).success).toBe(false);
  });

  it('validates database-backed automation settings', () => {
    const result = schemas.automationSettings.parse({
      enabled: true,
      baseUrl: 'http://localhost:20128/v1',
      apiKey: '',
      model: 'writing-combo',
      rssFeeds: ['https://example.com/feed.xml'],
      websites: [],
      discoveryEnabled: true,
      discoveryModel: 'web-search-combo',
      discoveryTopics: ['Bản đồ Sao Hỏa'],
      allowedDomains: ['nasa.gov'],
      blockedDomains: ['spam.example'],
      runHourUtc: 1,
      author: 'CosmoGIS AI',
      defaultImageUrl: 'https://example.com/image.jpg'
    });
    expect(result.model).toBe('writing-combo');
    expect(result.fallbackModels).toEqual([]);
    expect(result.retryCount).toBe(1);
    expect(result.imageModel).toBe('ag/gemini-3.1-flash-image');
    expect(result.imageGenerationEnabled).toBe(false);
    expect(result.articleStyle).toBe('analysis');
    expect(result.targetWordCount).toBe(1200);
    expect(result.targetAudience).toBe('general');
    expect(result.requiredKeywords).toEqual([]);
    expect(result.blockedKeywords).toEqual([]);
    expect(schemas.automationSettings.safeParse({ ...result, targetWordCount: 499 }).success).toBe(false);
    expect(schemas.automationSettings.safeParse({ ...result, targetWordCount: 5001 }).success).toBe(false);
    expect(schemas.automationSettings.safeParse({ ...result, editorialPrompt: 'x'.repeat(4001) }).success).toBe(false);
    expect(schemas.automationSettings.safeParse({ ...result, requiredKeywords: ['Dữ liệu không gian'], blockedKeywords: ['du lieu khong-gian'] }).success).toBe(false);
    expect(schemas.automationSettings.safeParse({ ...result, fallbackModels: Array(6).fill('model') }).success).toBe(false);
    expect(schemas.automationSettings.safeParse({ ...result, discoveryEnabled: false, rssFeeds: [], websites: [] }).success).toBe(false);
    expect(schemas.automationSettings.safeParse({ ...result, rssFeeds: [], websites: [] }).success).toBe(true);
    expect(schemas.automationSettings.safeParse({ ...result, enabled: false, model: '', rssFeeds: [], websites: [] }).success).toBe(true);
  });

  it('normalizes common URL and domain input formats', () => {
    const result = schemas.automationSettings.parse({
      enabled: true,
      baseUrl: 'localhost:20128/v1',
      apiKey: '',
      model: 'writer',
      rssFeeds: ['example.com/feed.xml'],
      websites: [],
      discoveryEnabled: true,
      discoveryModel: 'search',
      discoveryTopics: [],
      allowedDomains: ['https://science.nasa.gov/news', '*.esa.int'],
      blockedDomains: ['spam.example/path'],
      runHourUtc: 1,
      author: 'CosmoGIS AI',
      defaultImageUrl: 'https://example.com/image.jpg'
    });
    expect(result.baseUrl).toBe('http://localhost:20128/v1');
    expect(result.rssFeeds).toEqual(['https://example.com/feed.xml']);
    expect(result.allowedDomains).toEqual(['science.nasa.gov', 'esa.int']);
    expect(result.blockedDomains).toEqual(['spam.example']);
  });

  it('validates 9Router connection test input', () => {
    expect(schemas.automationConnectionTest.parse({
      baseUrl: 'localhost:20128/v1',
      apiKey: '',
      model: 'writer'
    })).toEqual({ baseUrl: 'http://localhost:20128/v1', apiKey: '', model: 'writer' });
    expect(schemas.automationConnectionTest.safeParse({ baseUrl: 'file:///tmp/router' }).success).toBe(false);
  });
});
