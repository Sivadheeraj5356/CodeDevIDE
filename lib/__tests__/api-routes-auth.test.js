import { describe, it, expect } from 'vitest';
// Set before imports so the route's verification path has a client id;
// without it requireApiUser fails closed with 500 (covered in server-auth tests).
process.env.GOOGLE_CLIENT_ID = 'test-client.apps.googleusercontent.com';

import { POST as chatPOST } from '../../app/api/ai-chat/route';
import { POST as codePOST } from '../../app/api/gen-ai-code/route';

// Unauthenticated requests must be refused BEFORE the Gemini client is even
// constructed, so these tests need no API key and never touch the network.
const unauthenticatedReq = () => ({
  headers: { get: () => null },
  json: async () => ({ prompt: 'make me a website' }),
});

describe('AI route gates', () => {
  it('/api/ai-chat rejects anonymous requests with 401', async () => {
    const res = await chatPOST(unauthenticatedReq());
    expect(res.status).toBe(401);
    expect((await res.json()).error).toBe('Sign in required');
  });

  it('/api/gen-ai-code rejects anonymous requests with 401', async () => {
    const res = await codePOST(unauthenticatedReq());
    expect(res.status).toBe(401);
    expect((await res.json()).error).toBe('Sign in required');
  });

  it('a malformed bearer token is rejected, not trusted', async () => {
    const res = await chatPOST({
      headers: { get: (k) => (k.toLowerCase() === 'authorization' ? 'Bearer !!!' : null) },
      json: async () => ({ prompt: 'x' }),
    });
    // Google tokeninfo rejects the garbage token -> 401; a network outage in
    // the test sandbox would surface as 502. Either way it is never 200.
    expect([401, 502]).toContain(res.status);
  });
});
