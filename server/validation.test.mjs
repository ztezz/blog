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
});
