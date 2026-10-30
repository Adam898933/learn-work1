import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { describe, expect, it, vi } from 'vitest';

function relay(fetch: ReturnType<typeof vi.fn>) {
  const source = readFileSync('src/routes/api/public/gif-image.ts', 'utf8')
    .replace('import { createFileRoute } from "@tanstack/react-router";', '')
    .replace('export const Route =', 'const Route =');
  return runInNewContext(source + '\nRoute.server.handlers.GET', {
    createFileRoute: () => (config: unknown) => config,
    fetch, URL, Response, AbortSignal, Set,
  });
}

describe('GIF relay recovery', () => {
  it('serves another GIF rendition when the small version is missing', async () => {
    const fetch = vi.fn(async (url: string) => url.endsWith('/giphy-downsized.gif')
      ? new Response('GIF89a', { headers: { 'content-type': 'image/gif' } })
      : new Response('missing', { status: 404 }));
    const response = await relay(fetch)({ request: new Request('https://example.test/api/public/gif-image?id=abc123') });
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('image/gif');
    expect(await response.text()).toBe('GIF89a');
    expect(fetch).toHaveBeenCalledTimes(3);
  });

  it('rejects arbitrary URLs without making any upstream request', async () => {
    const fetch = vi.fn();
    const response = await relay(fetch)({ request: new Request('https://example.test/api/public/gif-image?id=https://evil.test') });
    expect(response.status).toBe(400);
    expect(fetch).not.toHaveBeenCalled();
  });
});