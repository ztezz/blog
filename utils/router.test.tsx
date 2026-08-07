import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useSearchParams } from './router';

describe('router adapter', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/blog?category=gis-basic');
  });

  it('reads and updates search parameters without dropping the path', () => {
    const { result } = renderHook(() => useSearchParams());
    expect(result.current[0].get('category')).toBe('gis-basic');

    act(() => result.current[1]({ category: 'space-tech' }));
    expect(window.location.pathname).toBe('/blog');
    expect(window.location.search).toBe('?category=space-tech');
  });
});
