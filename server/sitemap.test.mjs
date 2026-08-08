import { describe, expect, it } from 'vitest';
import sitemap from './sitemap.js';

const { createSitemap } = sitemap;

describe('SEO sitemap', () => {
  it('creates canonical URLs and escapes category query strings', () => {
    const xml = createSitemap({
      siteUrl: 'https://www.example.com/',
      categories: [{ id: 'gis&maps' }],
      posts: [{ id: 'post-1', date: '2026-08-08' }]
    });

    expect(xml).toContain('<loc>https://www.example.com/</loc>');
    expect(xml).toContain('<loc>https://www.example.com/blog?category=gis%26maps</loc>');
    expect(xml).toContain('<loc>https://www.example.com/blog/post-1</loc>');
    expect(xml).toContain('<lastmod>2026-08-08T00:00:00.000Z</lastmod>');
    expect(xml).not.toContain('/admin');
  });
});
