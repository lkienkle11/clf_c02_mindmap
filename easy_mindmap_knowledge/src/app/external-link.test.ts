import { beforeEach, describe, expect, it, vi } from 'vitest';

const openUrl = vi.fn(async (_url: string) => {});
vi.mock('@tauri-apps/plugin-opener', () => ({ openUrl: (url: string) => openUrl(url) }));

import { openExternal } from './external-link';

describe('openExternal', () => {
  beforeEach(() => openUrl.mockClear());

  it('opens YouTube search URLs through the opener plugin', async () => {
    const url = 'https://www.youtube.com/results?search_query=aws%20ec2';
    await openExternal(url);
    expect(openUrl).toHaveBeenCalledWith(url);
  });

  it('also opens AWS documentation URLs', async () => {
    await openExternal('https://docs.aws.amazon.com/ec2/');
    expect(openUrl).toHaveBeenCalledWith('https://docs.aws.amazon.com/ec2/');
  });

  it.each([
    'https://www.youtube.com@evil.com/results?q=1',
    'https://evil.example/results?x=1',
    'http://www.youtube.com/results?search_query=a',
    'https://www.youtube.com/watch?v=abc',
    'https://www.youtube.com.evil.example/results?q=a',
    'javascript:alert(1)',
  ])('rejects %s', async (url) => {
    await expect(openExternal(url)).rejects.toThrow();
    expect(openUrl).not.toHaveBeenCalled();
  });
});
