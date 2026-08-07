import { describe, expect, it } from 'vitest';
import media from './media.js';

const { detectImageType } = media;

describe('image content detection', () => {
  it.each([
    [Buffer.from([0xff, 0xd8, 0xff, 0xe0]), 'image/jpeg', '.jpg'],
    [Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), 'image/png', '.png'],
    [Buffer.from('GIF89a', 'ascii'), 'image/gif', '.gif'],
    [Buffer.concat([Buffer.from('RIFF', 'ascii'), Buffer.alloc(4), Buffer.from('WEBP', 'ascii')]), 'image/webp', '.webp']
  ])('detects supported image signatures', (buffer, mime, extension) => {
    expect(detectImageType(buffer)).toMatchObject({ mime, extension });
  });

  it('rejects content that only claims to be an image', () => {
    expect(detectImageType(Buffer.from('<script>alert(1)</script>'))).toBeNull();
  });
});
