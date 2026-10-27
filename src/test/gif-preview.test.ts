import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { describe, expect, it, vi } from 'vitest';

function loadPicker() {
  const html = readFileSync('public/group-chat.html', 'utf8');
  const start = html.indexOf('  function gifImageUrls(item)');
  const end = html.indexOf('  var gifRequestSeq', start);
  const grid = document.createElement('div');
  document.body.appendChild(grid);
  const send = vi.fn();
  const context = { document, gifPickerGrid: grid, gifPickerStatus: document.createElement('p'), sendGifMessage: send, setTimeout, clearTimeout };
  const api = runInNewContext(html.slice(start, end) + '\n({gifImageUrls,renderGifResults})', context);
  return { api, grid, send };
}

describe('GIF image recovery', () => {
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
    expect(send).toHaveBeenCalledWith('https://example.test/full.gif');
    grid.remove();
  });

  it('removes a GIF when every preview fails', () => {
    const { api, grid } = loadPicker();
    api.renderGifResults([{ previewUrls: ['https://example.test/broken.gif'], fullUrl: 'https://example.test/full.gif' }]);
    grid.querySelector('img')?.dispatchEvent(new Event('error'));
    expect(grid.children.length).toBe(0);
    grid.remove();
  });

  it('includes alternate image hosts for valid GIPHY IDs', () => {
    const { api, grid } = loadPicker();
    expect(api.gifImageUrls({ id: 'abc123', images: {} })).toEqual([
      'https://media.giphy.com/media/abc123/200w.gif', 'https://i.giphy.com/abc123.gif',
    ]);
    grid.remove();
  });
});