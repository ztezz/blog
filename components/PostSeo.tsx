import React, { useEffect } from 'react';
import { BlogPost } from '../types';

const PostSeo: React.FC<{ post: BlogPost }> = ({ post }) => {
  useEffect(() => {
    const previousTitle = document.title;
    const canonicalUrl = window.location.href.split(/[?#]/)[0] || window.location.href;
    const metadata: Array<[string, string, 'name' | 'property']> = [
      ['description', post.metaDescription || post.excerpt, 'name'],
      ['og:title', post.seoTitle || post.title, 'property'],
      ['og:description', post.metaDescription || post.excerpt, 'property'],
      ['og:image', post.imageUrl, 'property'],
      ['og:type', 'article', 'property'],
      ['og:url', canonicalUrl, 'property'],
      ['twitter:card', 'summary_large_image', 'name'],
      ['twitter:title', post.seoTitle || post.title, 'name'],
      ['twitter:description', post.metaDescription || post.excerpt, 'name'],
      ['twitter:image', post.imageUrl, 'name']
    ];
    const created: Element[] = [];
    document.title = post.seoTitle || post.title;
    metadata.forEach(([key, content, attribute]) => {
      const element = document.createElement('meta');
      element.setAttribute(attribute, key);
      element.setAttribute('content', content);
      element.dataset.postSeo = 'true';
      document.head.appendChild(element);
      created.push(element);
    });
    const canonical = document.createElement('link');
    canonical.rel = 'canonical';
    canonical.href = canonicalUrl;
    canonical.dataset.postSeo = 'true';
    document.head.appendChild(canonical);
    created.push(canonical);
    const jsonLd = document.createElement('script');
    jsonLd.type = 'application/ld+json';
    jsonLd.textContent = JSON.stringify({ '@context': 'https://schema.org', '@type': 'BlogPosting', headline: post.title, description: post.metaDescription || post.excerpt, image: [post.imageUrl], datePublished: post.date, author: { '@type': 'Person', name: post.author }, keywords: post.keywords || post.tags, mainEntityOfPage: canonicalUrl });
    jsonLd.dataset.postSeo = 'true';
    document.head.appendChild(jsonLd);
    created.push(jsonLd);
    return () => {
      document.title = previousTitle;
      created.forEach(element => element.remove());
    };
  }, [post]);
  return null;
};

export default PostSeo;
