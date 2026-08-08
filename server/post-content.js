const cheerio = require('cheerio');

const slugifyHeading = value => String(value || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/đ/g, 'd')
  .replace(/Đ/g, 'D')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '') || 'muc';

const addHeadingIds = html => {
  const $ = cheerio.load(html || '', null, false);
  const used = new Set();
  const toc = [];
  $('h2, h3').each((_, element) => {
    const heading = $(element);
    const text = heading.text().replace(/\s+/g, ' ').trim();
    if (!text) return;
    const base = slugifyHeading(text);
    let id = base;
    let suffix = 2;
    while (used.has(id)) id = `${base}-${suffix++}`;
    used.add(id);
    heading.attr('id', id);
    toc.push({ id, text, level: element.tagName === 'h3' ? 3 : 2 });
  });
  return { content: $.html(), toc };
};

const parseStringArray = value => {
  try {
    const parsed = JSON.parse(value || '[]');
    return Array.isArray(parsed) ? parsed.filter(item => typeof item === 'string') : [];
  } catch {
    return [];
  }
};

module.exports = { addHeadingIds, parseStringArray, slugifyHeading };
