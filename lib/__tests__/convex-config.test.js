import { describe, it, expect } from 'vitest';
import { getConvexUrl, isConvexConfigured } from '../convex-config.js';

describe('convex config guard', () => {
  it('reports unconfigured when the URL is missing', () => {
    expect(getConvexUrl({})).toBeNull();
    expect(isConvexConfigured({})).toBe(false);
  });

  it('reports unconfigured when the URL is blank', () => {
    expect(isConvexConfigured({ NEXT_PUBLIC_CONVEX_URL: '   ' })).toBe(false);
  });

  it('reports configured with a real URL', () => {
    const env = { NEXT_PUBLIC_CONVEX_URL: 'https://abc.convex.cloud' };
    expect(getConvexUrl(env)).toBe('https://abc.convex.cloud');
    expect(isConvexConfigured(env)).toBe(true);
  });
});
