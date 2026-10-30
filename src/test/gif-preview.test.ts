import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { describe, expect, it, vi } from 'vitest';

function loadPicker() {
  const html = readFileSync('public/group-chat.html', 'utf8');
  const start = html.indexOf('  function sentImageUrls(url)');
  const end = html.indexOf('  var gifRequestSeq', start);
  const grid = document.createElement('div');
  document.body.appendChild(grid);
  const send = vi.fn();
  const context = { document, gifPickerGrid: grid, gifPickerStatus: document.createElement('p'), sendGifMessage: send, setTimeout, clearTimeout };
  const api = runInNewContext(html.slice(start, end) + '\n({sentImageUrls,gifImageUrls,renderGifResults})', context);
  return { api, grid, send };
}

describe('GIF image recovery', () => {
  it('relays sent and historical GIPHY images while leaving photos and other hosts alone', () => {
    const { api, grid } = loadPicker();
    for (const url of ['https://media2.giphy.com/media/abc123/giphy.gif?cid=test', 'https://i.giphy.com/abc123.gif']) {
      expect(api.sentImageUrls(url)).toEqual([
        '/api/public/gif-image?id=abc123&f=200w.gif',
        '/api/public/gif-image?id=abc123&f=giphy.gif', url,
      ]);
    }
    const tokenUrl = 'https://media1.giphy.com/media/v1.Y2lkPTQwMzA1MzFi_ZCZlcD12MV9n/774uK11mxE3W0cjE8L/giphy.gif';
    expect(api.sentImageUrls(tokenUrl)).toEqual([
      '/api/public/gif-image?id=774uK11mxE3W0cjE8L&f=200w.gif',
      '/api/public/gif-image?id=774uK11mxE3W0cjE8L&f=giphy.gif', tokenUrl,
    ]);
    expect(api.sentImageUrls('/api/public/gif-image?id=abc123&f=200w.gif')).toEqual([
      '/api/public/gif-image?id=abc123&f=200w.gif', '/api/public/gif-image?id=abc123&f=giphy.gif',
    ]);
    for (const url of ['data:image/png;base64,abc', 'https://example.test/photo.jpg', 'https://media.giphy.com.evil.test/media/abc123/giphy.gif']) {
      expect(api.sentImageUrls(url)).toEqual([url]);
    }
    grid.remove();
  });

  it('tries another image when the preview fails and only allows loaded images to send', () => {
    const { api, grid, send } = loadPicker();
    api.renderGifResults([{ title: 'Cat', previewUrls: ['https://example.test/broken.gif', 'https://example.test/working.gif'], fullUrl: 'https://example.test/full.gif' }]);
    const button = grid.querySelector('button');
    const image = grid.querySelector('img');
    if (!button || !image) throw new Error('Missing GIF');
    expect(button.disabled).toBe(true);
    image.dispatchEvent(new Event('error'));
    expect(image.src).toBe('https://example.test/working.gif');
    Object.defineProperty(image, 'naturalWidth', { value: 200 });
    image.dispatchEvent(new Event('load'));
    expect(button.disabled).toBe(false);
    button.click();
    expect(send).toHaveBeenCalledWith('https://example.test/working.gif');
    grid.remove();
  });

  it('removes a GIF when every preview fails', () => {
    const { api, grid } = loadPicker();
    api.renderGifResults([{ previewUrls: ['https://example.test/broken.gif'], fullUrl: 'https://example.test/full.gif' }]);
    grid.querySelector('img')?.dispatchEvent(new Event('error'));
    expect(grid.children.length).toBe(0);
    grid.remove();
  });

  it('includes alternate image hosts and the site relay for valid GIPHY IDs', () => {
    const { api, grid } = loadPicker();
    expect(api.gifImageUrls({ id: 'abc123', images: {} })).toEqual([
      '/api/public/gif-image?id=abc123&f=200w.gif',
      'https://media.giphy.com/media/abc123/200w.gif', 'https://i.giphy.com/abc123.gif',
    ]);
    grid.remove();
  });

  it('keeps earlier GIFs when more are loaded', () => {
    const { api, grid } = loadPicker();
    api.renderGifResults([{ previewUrls: ['https://example.test/a.gif'], fullUrl: 'https://example.test/a.gif' }]);
    api.renderGifResults([{ previewUrls: ['https://example.test/b.gif'], fullUrl: 'https://example.test/b.gif' }], true);
    expect(grid.children.length).toBe(2);
    grid.remove();
  });
});