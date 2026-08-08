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

const insertContextualImages = (html, placements, images) => {
  const $ = cheerio.load(html || '', null, false);
  const imageMap = new Map(images.map(image => [image.id, image]));
  const headings = $('h2, h3').toArray();
  const usedImages = new Set();
  let placedCount = 0;

  for (const placement of placements) {
    const image = imageMap.get(placement.imageId);
    if (!image || usedImages.has(image.id)) continue;
    const targetSlug = slugifyHeading(placement.afterHeading);
    const heading = headings.find(element => slugifyHeading($(element).text()) === targetSlug);
    if (!heading) continue;

    const figure = $('<figure></figure>').attr('data-source-image', image.id);
    figure.append($('<img>').attr({ src: image.url, alt: placement.alt || image.alt, loading: 'lazy' }));
    const caption = $('<figcaption></figcaption>').text(placement.caption || image.alt || 'Ảnh minh họa từ nguồn tham khảo.');
    if (image.articleUrl) {
      caption.append(' ');
      caption.append($('<a></a>').attr({ href: image.articleUrl, target: '_blank', rel: 'noopener noreferrer nofollow' }).text('Xem nguồn ảnh'));
      caption.append('.');
    }
    figure.append(caption);

    let insertionPoint = $(heading);
    let sibling = insertionPoint.next();
    while (sibling.length && !sibling.is('h2, h3')) {
      if (sibling.is('p')) {
        insertionPoint = sibling;
        break;
      }
      sibling = sibling.next();
    }
    insertionPoint.after(figure);
    usedImages.add(image.id);
    placedCount += 1;
  }

  return { content: $.html(), placedCount };
};

const parseStringArray = value => {
  try {
    const parsed = JSON.parse(value || '[]');
    return Array.isArray(parsed) ? parsed.filter(item => typeof item === 'string') : [];
  } catch {
    return [];
  }
};

module.exports = { addHeadingIds, insertContextualImages, parseStringArray, slugifyHeading };
