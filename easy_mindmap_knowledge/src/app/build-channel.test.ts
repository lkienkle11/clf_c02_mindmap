import { afterEach, describe, expect, it, vi } from 'vitest';
import { getBuildChannel } from './build-channel';

describe('getBuildChannel', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('returns production when VITE_APP_CHANNEL is exactly production', () => {
    vi.stubEnv('VITE_APP_CHANNEL', 'production');
    expect(getBuildChannel()).toBe('production');
  });

  it.each([undefined, '', 'prod', 'Production'])(
    'returns development when VITE_APP_CHANNEL is %s',
    (value) => {
      vi.stubEnv('VITE_APP_CHANNEL', value);
      expect(getBuildChannel()).toBe('development');
    },
  );
});
