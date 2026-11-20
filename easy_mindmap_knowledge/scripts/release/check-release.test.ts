import { describe, expect, it } from 'vitest';
import { assertPlatforms, assertRealPubkey, checkRelease } from './check-release.mjs';

function filesAt(version: string) {
  return {
    packageJson: `{\n  "version": "${version}"\n}\n`,
    tauriConf: `{\n  "version": "${version}"\n}\n`,
    cargoToml: `[package]\nname = "app"\nversion = "${version}"\n`,
    cargoLock: `[[package]]\nname = "app"\nversion = "${version}"\n`,
  };
}

describe('checkRelease', () => {
  it('passes when the tag matches the files and the published version is lower', () => {
    expect(() => checkRelease('v0.2.0', filesAt('0.2.0'), '0.1.0')).not.toThrow();
  });

  it('throws when the tag differs from the file versions', () => {
    expect(() => checkRelease('v0.2.0', filesAt('0.1.0'), '0.0.9')).toThrow();
  });

  it('throws when the version equals the latest published version', () => {
    expect(() => checkRelease('v0.2.0', filesAt('0.2.0'), '0.2.0')).toThrow();
  });

  it('throws when the version is lower than the latest published version', () => {
    expect(() => checkRelease('v0.2.0', filesAt('0.2.0'), '0.3.0')).toThrow();
  });

  it('passes for the first release when nothing is published', () => {
    expect(() => checkRelease('v0.1.0', filesAt('0.1.0'), null)).not.toThrow();
  });

  it('throws when the version files disagree', () => {
    const files = { ...filesAt('0.2.0'), cargoLock: filesAt('0.1.0').cargoLock };
    expect(() => checkRelease('v0.2.0', files, '0.1.0')).toThrow();
  });
});

describe('assertRealPubkey', () => {
  const overlay = (pubkey?: string) => JSON.stringify({ plugins: { updater: pubkey === undefined ? {} : { pubkey } } });

  it('throws for the placeholder public key', () => {
    expect(() => assertRealPubkey(overlay('REPLACE_WITH_TAURI_SIGNER_PUBLIC_KEY'))).toThrow();
  });

  it('throws for an empty public key', () => {
    expect(() => assertRealPubkey(overlay(''))).toThrow();
  });

  it('throws when the public key is missing', () => {
    expect(() => assertRealPubkey(overlay())).toThrow();
  });

  it('passes for a real-looking base64 public key', () => {
    const key = 'dW50cnVzdGVkIGNvbW1lbnQ6IG1pbmlzaWduIHB1YmxpYyBrZXk6IDEyMzQ1Njc4OUFCQ0RFRjAKUldRQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQQ==';
    expect(() => assertRealPubkey(overlay(key))).not.toThrow();
  });
});

describe('assertPlatforms', () => {
  const required = ['darwin-aarch64', 'darwin-x86_64', 'windows-x86_64', 'linux-x86_64'];
  const entry = { url: 'https://example.com/a', signature: 'sig' };
  const latestWith = (keys: string[]) => ({ platforms: Object.fromEntries(keys.map(key => [key, entry])) });

  it('passes when every required platform is present', () => {
    expect(() => assertPlatforms(latestWith(required), required)).not.toThrow();
  });

  it('throws naming the missing platform', () => {
    expect(() => assertPlatforms(latestWith(required.filter(key => key !== 'linux-x86_64')), required)).toThrow(/linux-x86_64/);
  });

  it('lists every missing platform', () => {
    expect(() => assertPlatforms(latestWith(['darwin-aarch64']), required)).toThrow(/darwin-x86_64.*windows-x86_64.*linux-x86_64/);
  });

  it('throws when latest has no platforms object', () => {
    expect(() => assertPlatforms({}, required)).toThrow();
  });
});
