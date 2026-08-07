import { describe, expect, it } from 'vitest';
import { calculateReadTime } from './storage';

describe('calculateReadTime', () => {
  it('ignores HTML tags and rounds reading time up', () => {
    const content = `<p>${Array.from({ length: 201 }, () => 'word').join(' ')}</p>`;
    expect(calculateReadTime(content)).toBe('2 phút');
  });

  it('returns zero for empty content', () => {
    expect(calculateReadTime('<p> </p>')).toBe('0 phút');
  });
});
