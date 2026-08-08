const escapeXml = value => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;');

const normalizeLastModified = value => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

const createSitemap = ({ siteUrl, posts, categories }) => {
  const origin = siteUrl.replace(/\/$/, '');
  const urls = [
    { location: `${origin}/` },
    { location: `${origin}/blog` },
    { location: `${origin}/about` },
    { location: `${origin}/contact` },
    ...categories.map(category => ({ location: `${origin}/blog?category=${encodeURIComponent(category.id)}` })),
    ...posts.map(post => ({
      location: `${origin}/blog/${encodeURIComponent(post.id)}`,
      lastModified: normalizeLastModified(post.reviewed_at || post.created_at || post.date)
    }))
  ];
  const body = urls.map(url => {
    const lastModified = url.lastModified ? `<lastmod>${escapeXml(url.lastModified)}</lastmod>` : '';
    return `<url><loc>${escapeXml(url.location)}</loc>${lastModified}</url>`;
  }).join('');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</urlset>`;
};

module.exports = { createSitemap, escapeXml, normalizeLastModified };
