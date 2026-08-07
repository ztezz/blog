import { describe, expect, it } from 'vitest';
import { sanitizeHtml } from './sanitizeHtml';

describe('sanitizeHtml', () => {
  it('removes executable content while preserving safe markup', () => {
    const html = '<p>Hello <strong>CosmoGIS</strong></p><script>alert(1)</script><img src="x" onerror="alert(2)">';
    const result = sanitizeHtml(html);

    expect(result).toContain('<strong>CosmoGIS</strong>');
    expect(result).not.toContain('<script');
    expect(result).not.toContain('onerror');
  });
});
