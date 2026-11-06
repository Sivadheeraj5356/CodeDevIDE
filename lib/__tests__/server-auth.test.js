import { describe, it, expect } from 'vitest';
import { AuthError, getBearerToken, verifyGoogleIdToken, requireApiUser } from '../server-auth.js';

const CLIENT_ID = 'test-client.apps.googleusercontent.com';
const validPayload = {
  iss: 'https://accounts.google.com',
  aud: CLIENT_ID,
  email: 'siva@example.com',
  email_verified: true,
  exp: Math.floor(Date.now() / 1000) + 600,
  name: 'Siva',
};
const okVerify = (payload) => async () => payload;
const failingVerify = (message) => async () => { throw new Error(message); };

const req = (auth) => ({ headers: { get: (k) => (k.toLowerCase() === 'authorization' ? auth ?? null : null) } });

describe('getBearerToken', () => {
  it('parses a Bearer header', () => {
    expect(getBearerToken(req('Bearer abc.def.ghi'))).toBe('abc.def.ghi');
  });
  it('returns null without a Bearer header', () => {
    expect(getBearerToken(req(null))).toBeNull();
    expect(getBearerToken(req('Basic abc'))).toBeNull();
  });
});

describe('verifyGoogleIdToken', () => {
  it('accepts a token the verifier approves for this app', async () => {
    const user = await verifyGoogleIdToken('tok', { clientId: CLIENT_ID, verifyImpl: okVerify(validPayload) });
    expect(user.email).toBe('siva@example.com');
  });

  it('rejects when signature, issuer, audience or expiry fail (jwtVerify throws)', async () => {
    await expect(
      verifyGoogleIdToken('tok', { clientId: CLIENT_ID, verifyImpl: failingVerify('invalid signature') })
    ).rejects.toMatchObject({ status: 401 });
    await expect(
      verifyGoogleIdToken('tok', { clientId: CLIENT_ID, verifyImpl: failingVerify('"aud" claim mismatch') })
    ).rejects.toMatchObject({ status: 401 });
    await expect(
      verifyGoogleIdToken('tok', { clientId: CLIENT_ID, verifyImpl: failingVerify('"exp" claim timestamp check failed') })
    ).rejects.toMatchObject({ status: 401 });
  });

  it('rejects an unverified email', async () => {
    await expect(
      verifyGoogleIdToken('tok', { clientId: CLIENT_ID, verifyImpl: okVerify({ ...validPayload, email_verified: false }) })
    ).rejects.toMatchObject({ status: 401 });
  });

  it('rejects a token with no email claim', async () => {
    await expect(
      verifyGoogleIdToken('tok', { clientId: CLIENT_ID, verifyImpl: okVerify({ ...validPayload, email: undefined }) })
    ).rejects.toMatchObject({ status: 401 });
  });

  it('maps a JWKS fetch failure to 502, not an allow', async () => {
    await expect(
      verifyGoogleIdToken('tok', { clientId: CLIENT_ID, verifyImpl: failingVerify('fetch failed: ENOTFOUND') })
    ).rejects.toMatchObject({ status: 502 });
  });

  it('fails closed when the server has no client id configured', async () => {
    await expect(verifyGoogleIdToken('tok', { clientId: '', verifyImpl: okVerify(validPayload) })).rejects.toMatchObject({ status: 500 });
  });

  it('rejects a missing token', async () => {
    await expect(verifyGoogleIdToken(null, { clientId: CLIENT_ID })).rejects.toMatchObject({ status: 401 });
  });
});

describe('requireApiUser', () => {
  it('rejects requests with no Authorization header before any verification call', async () => {
    let verifyCalled = false;
    await expect(
      requireApiUser(req(null), { clientId: CLIENT_ID, verifyImpl: async () => { verifyCalled = true; return validPayload; } })
    ).rejects.toMatchObject({ status: 401, message: 'Sign in required' });
    expect(verifyCalled).toBe(false);
  });

  it('passes a verified request through', async () => {
    const user = await requireApiUser(req('Bearer tok'), { clientId: CLIENT_ID, verifyImpl: okVerify(validPayload) });
    expect(user.email).toBe('siva@example.com');
  });
});
