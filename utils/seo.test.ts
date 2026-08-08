import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('SEO URL helpers', () => {
  beforeEach(() => {
    vi.resetModules();
    window.history.replaceState(null, '', '/');
  });

  it('keeps only the category query in blog canonical URLs', async () => {
    const { getCanonicalUrl } = await import('./seo');
    expect(getCanonicalUrl('/blog', '?category=gis-basic&tracking=1')).toBe(`${window.location.origin}/blog?category=gis-basic`);
    expect(getCanonicalUrl('/about', '?category=ignored')).toBe(`${window.location.origin}/about`);
  });
});
