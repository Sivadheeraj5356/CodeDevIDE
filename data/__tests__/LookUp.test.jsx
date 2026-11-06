import { describe, it, expect } from 'vitest';
import LookUp from '../LookUp.jsx';

describe('LookUp defaults and copy', () => {
  it('ships the template files the Sandpack merge relies on', () => {
    expect(LookUp.DEFAULT_FILE['/App.js'].code).toContain('React');
    expect(LookUp.DEFAULT_FILE['/public/index.html'].code).toContain('<div id="root">');
    expect(LookUp.DEFAULT_FILE['/index.css'].code).toContain('@tailwind');
  });

  it('has no leftover third-party branding in user-facing copy', () => {
    const copy = JSON.stringify(LookUp);
    expect(copy).not.toMatch(/bolt/i);
    expect(LookUp.SIGNIN_HEADING).toContain('CodeDevAI');
  });

  it('provides prompt suggestions for the landing page', () => {
    expect(LookUp.SUGGSTIONS.length).toBeGreaterThan(0);
  });
});
