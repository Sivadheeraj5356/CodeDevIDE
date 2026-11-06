import { describe, it, expect, beforeEach } from 'vitest';
import {
  decodeJwtPayload,
  isTokenExpired,
  saveSession,
  loadSession,
  getIdToken,
  clearSession,
  authHeaders,
} from '../session.js';

const b64u = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');
const makeToken = (payload) => `${b64u({ alg: 'RS256', typ: 'JWT' })}.${b64u(payload)}.fakesig`;

// Minimal in-memory localStorage stand-in for node.
beforeEach(() => {
  const store = new Map();
  globalThis.localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => void store.set(k, String(v)),
    removeItem: (k) => void store.delete(k),
    clear: () => store.clear(),
  };
});

describe('decodeJwtPayload', () => {
  it('decodes a well-formed token payload', () => {
    const payload = decodeJwtPayload(makeToken({ email: 'a@b.c', exp: 2000000000 }));
    expect(payload.email).toBe('a@b.c');
    expect(payload.exp).toBe(2000000000);
  });

  it('returns null for garbage input', () => {
    expect(decodeJwtPayload('not-a-jwt')).toBeNull();
    expect(decodeJwtPayload('')).toBeNull();
    expect(decodeJwtPayload(null)).toBeNull();
    expect(decodeJwtPayload(`${b64u({})}.%%%!!!.sig`)).toBeNull();
  });
});

describe('isTokenExpired', () => {
  it('treats a missing or malformed exp as expired', () => {
    expect(isTokenExpired({})).toBe(true);
    expect(isTokenExpired({ exp: 'soon' })).toBe(true);
  });

  it('treats a token inside the skew window as expired', () => {
    const now = Date.now();
    expect(isTokenExpired({ exp: Math.floor(now / 1000) + 10 }, now)).toBe(true);
    expect(isTokenExpired({ exp: Math.floor(now / 1000) + 600 }, now)).toBe(false);
  });
});

describe('session store', () => {
  const future = Math.floor(Date.now() / 1000) + 3600;

  it('saves a valid token and drops the legacy unsigned profile key', () => {
    localStorage.setItem('user', JSON.stringify({ email: 'forged@example.com' }));
    const session = saveSession(makeToken({ name: 'A', email: 'a@b.c', picture: 'p', exp: future }));
    expect(session.email).toBe('a@b.c');
    expect(localStorage.getItem('user')).toBeNull();
    expect(loadSession().idToken).toBeTruthy();
    expect(getIdToken()).toBe(session.idToken);
  });

  it('refuses to save an already-expired token', () => {
    expect(saveSession(makeToken({ exp: 1000 }))).toBeNull();
    expect(loadSession()).toBeNull();
  });

  it('evicts an expired stored session on load', () => {
    localStorage.setItem('codedev.session', JSON.stringify({ idToken: 'x.y.z', exp: 1000 }));
    expect(loadSession()).toBeNull();
    expect(localStorage.getItem('codedev.session')).toBeNull();
  });

  it('builds an Authorization header only when signed in', () => {
    expect(authHeaders()).toEqual({});
    saveSession(makeToken({ email: 'a@b.c', exp: future }));
    expect(authHeaders().Authorization).toMatch(/^Bearer /);
  });

  it('clearSession removes both the session and the legacy key', () => {
    saveSession(makeToken({ email: 'a@b.c', exp: future }));
    localStorage.setItem('user', '{}');
    clearSession();
    expect(loadSession()).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });
});
