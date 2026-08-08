import { describe, expect, it } from 'vitest';
import contentModule from './post-content.js';

const { addHeadingIds, insertContextualImages, slugifyHeading } = contentModule;

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

  it('places a cited image after the first paragraph of its matching section', () => {
    const result = insertContextualImages(
      '<h2>Dữ liệu vệ tinh</h2><p>Đoạn dẫn chứng chính.</p><p>Đoạn tiếp theo.</p><h2>Kết luận</h2>',
      [{ imageId: 'I2', afterHeading: 'Dữ liệu vệ tinh', alt: 'Ảnh vệ tinh', caption: 'Ảnh minh họa dữ liệu vệ tinh.' }],
      [{ id: 'I2', url: '/uploads/satellite.jpg', alt: 'Ảnh vệ tinh', articleUrl: 'https://example.com/source' }]
    );
    expect(result.placedCount).toBe(1);
    expect(result.content.indexOf('Đoạn dẫn chứng chính')).toBeLessThan(result.content.indexOf('<figure'));
    expect(result.content.indexOf('<figure')).toBeLessThan(result.content.indexOf('Đoạn tiếp theo'));
    expect(result.content).toContain('href="https://example.com/source"');
  });

  it('drops invalid and duplicate image placements instead of appending them', () => {
    const result = insertContextualImages(
      '<h2>Mục hợp lệ</h2><p>Nội dung.</p>',
      [{ imageId: 'I1', afterHeading: 'Không tồn tại', alt: 'Ảnh', caption: 'Chú thích' }, { imageId: 'I1', afterHeading: 'Mục hợp lệ', alt: 'Ảnh', caption: 'Chú thích' }, { imageId: 'I1', afterHeading: 'Mục hợp lệ', alt: 'Ảnh', caption: 'Chú thích' }],
      [{ id: 'I1', url: '/uploads/image.jpg', alt: 'Ảnh', articleUrl: '' }]
    );
    expect(result.placedCount).toBe(1);
    expect((result.content.match(/<figure/g) || [])).toHaveLength(1);
  });
});
