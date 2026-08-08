import React, { useEffect } from 'react';
import { BlogPost } from '../types';
import { useSiteSettings } from './Layout';
import { getAbsoluteUrl, getCanonicalUrl } from '../utils/seo';

const PostSeo: React.FC<{ post: BlogPost }> = ({ post }) => {
  const settings = useSiteSettings();
  useEffect(() => {
    document.head.querySelector('script[data-site-schema]')?.remove();
    document.head.querySelectorAll('[data-post-seo]').forEach(element => element.remove());
    const siteName = settings ? `${settings.siteNamePrefix}${settings.siteNameSuffix}`.trim() : '';
    const postTitle = post.seoTitle || post.title;
    const canonicalUrl = getCanonicalUrl(`/blog/${encodeURIComponent(post.id)}`);
    const imageUrl = getAbsoluteUrl(post.imageUrl);
    const metadata: Array<[string, string, 'name' | 'property']> = [
      ['description', post.metaDescription || post.excerpt, 'name'],
      ['og:title', postTitle, 'property'],
      ['og:description', post.metaDescription || post.excerpt, 'property'],
      ['og:image', imageUrl, 'property'],
      ['og:type', 'article', 'property'],
      ['og:url', canonicalUrl, 'property'],
      ['og:site_name', siteName, 'property'],
      ['og:locale', 'vi_VN', 'property'],
      ['article:published_time', post.date, 'property'],
      ['article:section', post.category, 'property'],
      ['twitter:card', 'summary_large_image', 'name'],
      ['twitter:title', postTitle, 'name'],
      ['twitter:description', post.metaDescription || post.excerpt, 'name'],
      ['twitter:image', imageUrl, 'name'],
      ['robots', 'index, follow, max-image-preview:large', 'name']
    ];
    const created: Element[] = [];
    document.title = siteName ? `${postTitle} | ${siteName}` : postTitle;
    metadata.forEach(([key, content, attribute]) => {
      document.head.querySelectorAll(`meta[${attribute}="${key}"]`).forEach(element => element.remove());
      const element = document.createElement('meta');
      element.setAttribute(attribute, key);
      element.setAttribute('content', content);
      element.dataset.postSeo = 'true';
      document.head.appendChild(element);
      created.push(element);
    });
    document.head.querySelectorAll('link[rel="canonical"]').forEach(element => element.remove());
    const canonical = document.createElement('link');
    canonical.rel = 'canonical';
    canonical.href = canonicalUrl;
    canonical.dataset.postSeo = 'true';
    document.head.appendChild(canonical);
    created.push(canonical);
    const jsonLd = document.createElement('script');
    jsonLd.type = 'application/ld+json';
    jsonLd.textContent = JSON.stringify({ '@context': 'https://schema.org', '@type': 'BlogPosting', headline: post.title, description: post.metaDescription || post.excerpt, image: imageUrl ? [imageUrl] : undefined, datePublished: post.date, author: { '@type': 'Person', name: post.author }, publisher: siteName ? { '@type': 'Organization', name: siteName } : undefined, articleSection: post.category, keywords: post.keywords || post.tags, mainEntityOfPage: { '@type': 'WebPage', '@id': canonicalUrl } });
    jsonLd.dataset.postSeo = 'true';
    document.head.appendChild(jsonLd);
    created.push(jsonLd);
    return () => { created.forEach(element => element.remove()); };
  }, [post, settings]);
  return null;
};

export default PostSeo;
