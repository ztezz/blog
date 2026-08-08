import React from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Layout from './Layout';
import { getSettings } from '../utils/storage';

vi.mock('../utils/storage', async importOriginal => {
  const original = await importOriginal<typeof import('../utils/storage')>();
  return { ...original, getSettings: vi.fn() };
});

vi.mock('./StarBackground', () => ({ default: () => null }));
vi.mock('./SkyBackground', () => ({ default: () => null }));

const settings = {
  siteNamePrefix: 'GIS',
  siteNameSuffix: 'VN',
  pageTitle: 'GISVN',
  logoUrl: '',
  faviconUrl: '',
  footerDescription: 'Dữ liệu không gian',
  footerCopyright: 'Copyright',
  navigation: [],
  socialLinks: { facebook: '#', twitter: '#', linkedin: '#' },
  aboutContent: '',
  contactContent: ''
};

describe('Layout settings loading', () => {
  beforeEach(() => {
    vi.mocked(getSettings).mockReset().mockResolvedValue(settings);
    window.history.replaceState(null, '', '/');
  });

  it('loads settings once and does not refetch after rerenders', async () => {
    const view = render(<Layout><div>Page content</div></Layout>);
    await screen.findByText('Page content');
    expect(getSettings).toHaveBeenCalledTimes(1);

    view.rerender(<Layout><div>Updated content</div></Layout>);
    await screen.findByText('Updated content');
    expect(getSettings).toHaveBeenCalledTimes(1);

    act(() => window.dispatchEvent(new CustomEvent('site-settings-updated', { detail: { ...settings, siteNamePrefix: 'NEW' } })));
    await waitFor(() => expect(screen.getAllByText('NEW').length).toBeGreaterThan(0));
    expect(screen.getAllByText('VN').length).toBeGreaterThan(0);
    expect(getSettings).toHaveBeenCalledTimes(1);
  });
});
