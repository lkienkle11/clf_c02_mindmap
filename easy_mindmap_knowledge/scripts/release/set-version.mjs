import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { assertSameVersions, parseVersion, setVersionInPackageJson, setVersionInTauriConf, setVersionInCargoToml, setVersionInCargoLock } from './versions.mjs';

const version = process.argv[2];
parseVersion(version);
const paths = {
  packageJson: new URL('../../package.json', import.meta.url),
  tauriConf: new URL('../../src-tauri/tauri.conf.json', import.meta.url),
  cargoToml: new URL('../../src-tauri/Cargo.toml', import.meta.url),
  cargoLock: new URL('../../src-tauri/Cargo.lock', import.meta.url),
};
const setters = { packageJson: setVersionInPackageJson, tauriConf: setVersionInTauriConf, cargoToml: setVersionInCargoToml, cargoLock: setVersionInCargoLock };
const files = Object.fromEntries(Object.entries(paths).map(([name, path]) => [name, setters[name](readFileSync(fileURLToPath(path), 'utf8'), version)]));
for (const [name, path] of Object.entries(paths)) writeFileSync(fileURLToPath(path), files[name]);
assertSameVersions(Object.fromEntries(Object.entries(paths).map(([name, path]) => [name, readFileSync(fileURLToPath(path), 'utf8')])));
