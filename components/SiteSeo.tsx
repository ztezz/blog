import React, { useEffect } from 'react';
import { useLocation, useSearch } from '../utils/router';
import { SiteSettings } from '../types';
import { getAbsoluteUrl, getCanonicalUrl, getSiteUrl } from '../utils/seo';

const upsertMeta = (attribute: 'name' | 'property', key: string, content: string) => {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.content = content;
  element.dataset.siteSeo = 'true';
};

const SiteSeo: React.FC<{ settings: SiteSettings }> = ({ settings }) => {
  const location = useLocation();
  const search = useSearch();

  useEffect(() => {
    if (/^\/blog\/[^/]+$/.test(location.pathname)) return;
    document.head.querySelector('script[data-post-seo]')?.remove();
    const siteName = `${settings.siteNamePrefix}${settings.siteNameSuffix}`.trim();
    const baseTitle = settings.pageTitle?.trim() || siteName;
    const category = new URLSearchParams(search).get('category');
    const isAdmin = location.pathname.startsWith('/admin');
    const isKnownPublicPage = ['/', '/blog', '/about', '/contact'].includes(location.pathname);
    const route = location.pathname === '/blog' && category ? '/blog-category' : location.pathname;
    const metadata: Record<string, { title: string; description: string }> = {
      '/': { title: baseTitle, description: settings.footerDescription },
      '/blog': { title: `Bài viết | ${siteName}`, description: `Khám phá các bài viết mới nhất từ ${siteName}.` },
      '/blog-category': { title: `Danh mục ${category} | ${siteName}`, description: `Các bài viết thuộc danh mục ${category} trên ${siteName}.` },
      '/about': { title: `Giới thiệu | ${siteName}`, description: `Tìm hiểu về ${siteName} và định hướng nội dung của website.` },
      '/contact': { title: `Liên hệ | ${siteName}`, description: `Liên hệ với ${siteName}.` }
    };
    const current = metadata[route] || { title: baseTitle, description: settings.footerDescription };
    const canonicalUrl = getCanonicalUrl(location.pathname, search);
    const imageUrl = getAbsoluteUrl(settings.logoUrl || settings.faviconUrl || '/ico.ico');
    const robots = isAdmin || !isKnownPublicPage ? 'noindex, nofollow, noarchive' : 'index, follow, max-image-preview:large';

    document.title = isAdmin ? `Quản trị | ${siteName}` : current.title;
    upsertMeta('name', 'description', current.description);
    upsertMeta('name', 'robots', robots);
    upsertMeta('property', 'og:title', current.title);
    upsertMeta('property', 'og:description', current.description);
    upsertMeta('property', 'og:type', 'website');
    upsertMeta('property', 'og:url', canonicalUrl);
    upsertMeta('property', 'og:site_name', siteName);
    upsertMeta('property', 'og:locale', 'vi_VN');
    upsertMeta('property', 'og:image', imageUrl);
    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', current.title);
    upsertMeta('name', 'twitter:description', current.description);
    upsertMeta('name', 'twitter:image', imageUrl);

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;
    canonical.dataset.siteSeo = 'true';

    document.head.querySelector('script[data-site-schema]')?.remove();
    if (location.pathname === '/') {
      const schema = document.createElement('script');
      schema.type = 'application/ld+json';
      schema.dataset.siteSchema = 'true';
      schema.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: siteName,
        url: getSiteUrl(),
        description: settings.footerDescription
      });
      document.head.appendChild(schema);
    }
  }, [location.pathname, search, settings]);

  return null;
};

export default SiteSeo;
