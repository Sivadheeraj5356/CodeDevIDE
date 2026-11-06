import { describe, it, expect } from 'vitest';
import { mergeFiles } from '../files.js';

describe('mergeFiles', () => {
  const defaults = { '/App.js': { code: 'default' }, '/index.css': { code: 'css' } };

  it('keeps defaults when nothing is generated', () => {
    expect(mergeFiles(defaults, {})).toEqual(defaults);
  });

  it('generated files override defaults on key conflict', () => {
    const out = mergeFiles(defaults, { '/App.js': { code: 'generated' } });
    expect(out['/App.js'].code).toBe('generated');
    expect(out['/index.css'].code).toBe('css');
  });

  it('adds new generated files alongside defaults', () => {
    const out = mergeFiles(defaults, { '/components/Nav.js': { code: 'nav' } });
    expect(Object.keys(out)).toHaveLength(3);
  });

  it('tolerates null/undefined inputs', () => {
    expect(mergeFiles(null, null)).toEqual({});
    expect(mergeFiles(defaults, undefined)).toEqual(defaults);
  });
});
