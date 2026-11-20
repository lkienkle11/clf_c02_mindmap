import { describe, expect, it } from 'vitest';
import { parseVersion, isGreater, setVersionInPackageJson, setVersionInTauriConf, setVersionInCargoToml, setVersionInCargoLock, readVersions, assertSameVersions } from './versions.mjs';

const files = {
  packageJson: '{\n  "version": "0.1.0",\n  "other": "0.1.0"\n}\n',
  tauriConf: '{\n  "version": "0.1.0",\n  "other": "0.1.0"\n}\n',
  cargoToml: '[package]\nname = "app"\nversion = "0.1.0"\n[dependencies]\nexample = { version = "1.0" }\n',
  cargoLock: '[[package]]\nname = "other"\nversion = "1.0"\n\n[[package]]\nname = "app"\nversion = "0.1.0"\n',
};

describe('release versions', () => {
  it('parses exactly three numeric components', () => {
    expect(parseVersion('0.2.0')).toEqual([0, 2, 0]);
    expect(() => parseVersion('v0.2')).toThrow();
    expect(() => parseVersion('0.2.0-beta')).toThrow();
  });
  it('compares numeric version components', () => {
    expect(isGreater('0.10.0', '0.9.9')).toBe(true);
    expect(isGreater('0.1.0', '0.1.0')).toBe(false);
  });
  it('updates only the package JSON version', () => {
    expect(setVersionInPackageJson(files.packageJson, '0.2.0')).toBe('{\n  "version": "0.2.0",\n  "other": "0.1.0"\n}\n');
  });
  it('updates only the Tauri version', () => {
    expect(setVersionInTauriConf(files.tauriConf, '0.2.0')).toBe('{\n  "version": "0.2.0",\n  "other": "0.1.0"\n}\n');
  });
  it('updates only the Cargo package version', () => {
    expect(setVersionInCargoToml(files.cargoToml, '0.2.0')).toBe('[package]\nname = "app"\nversion = "0.2.0"\n[dependencies]\nexample = { version = "1.0" }\n');
  });
  it('updates only the app package in Cargo.lock', () => {
    expect(setVersionInCargoLock(files.cargoLock, '0.2.0')).toBe('[[package]]\nname = "other"\nversion = "1.0"\n\n[[package]]\nname = "app"\nversion = "0.2.0"\n');
  });
  it('reads all four versions', () => {
    expect(readVersions(files)).toEqual(['0.1.0', '0.1.0', '0.1.0', '0.1.0']);
  });
  it('names a file whose version differs', () => {
    expect(() => assertSameVersions({ ...files, cargoToml: files.cargoToml.replace('0.1.0', '0.2.0') })).toThrow(/cargoToml/i);
    expect(() => assertSameVersions(files)).not.toThrow();
  });
});
