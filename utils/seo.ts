const configuredSiteUrl = (import.meta.env.VITE_SITE_URL || '').trim().replace(/\/$/, '');

export const getSiteUrl = () => configuredSiteUrl || window.location.origin;

export const getCanonicalUrl = (pathname: string, search = '') => {
  const canonical = new URL(pathname, `${getSiteUrl()}/`);
  const category = new URLSearchParams(search).get('category');
  if (pathname === '/blog' && category) canonical.searchParams.set('category', category);
  return canonical.toString();
};

export const getAbsoluteUrl = (value: string) => {
  if (!value) return '';
  return new URL(value, `${getSiteUrl()}/`).toString();
};
