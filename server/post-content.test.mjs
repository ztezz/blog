import { describe, expect, it } from 'vitest';
import contentModule from './post-content.js';

const { addHeadingIds, slugifyHeading } = contentModule;

describe('post content helpers', () => {
  it('adds stable unique heading IDs and returns a table of contents', () => {
    const result = addHeadingIds('<h2>Bản đồ Sao Hỏa</h2><p>Nội dung</p><h3>Dữ liệu mới</h3><h2>Bản đồ Sao Hỏa</h2>');
    expect(result.content).toContain('id="ban-do-sao-hoa"');
    expect(result.content).toContain('id="ban-do-sao-hoa-2"');
    expect(result.toc).toEqual([
      { id: 'ban-do-sao-hoa', text: 'Bản đồ Sao Hỏa', level: 2 },
      { id: 'du-lieu-moi', text: 'Dữ liệu mới', level: 3 },
      { id: 'ban-do-sao-hoa-2', text: 'Bản đồ Sao Hỏa', level: 2 }
    ]);
  });

  it('creates a safe fallback heading slug', () => {
    expect(slugifyHeading('***')).toBe('muc');
  });
});
