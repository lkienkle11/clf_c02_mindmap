export function parseVersion(s) {
  if (!/^\d+\.\d+\.\d+$/.test(s)) throw new Error(`Invalid version: ${s}`);
  return s.split('.').map(Number);
}

export function isGreater(a, b) {
  const left = parseVersion(a);
  const right = parseVersion(b);
  for (let i = 0; i < 3; i++) {
    if (left[i] !== right[i]) return left[i] > right[i];
  }
  return false;
}

const jsonVersion = /^(\s*"version"\s*:\s*")([^"\r\n]+)(".*)$/m;
const tomlVersion = /^(\s*version\s*=\s*")([^"\r\n]+)(".*)$/m;

function replaceVersion(text, pattern, version, name) {
  parseVersion(version);
  if (!pattern.test(text)) throw new Error(`Version not found in ${name}`);
  return text.replace(pattern, (_, before, _old, after) => before + version + after);
}

function section(text, header, matches) {
  const blocks = text.split(/(?=^\[\[?[^\r\n]+\]\]?\s*$)/m);
  const index = blocks.findIndex(block => header.test(block) && matches(block));
  if (index < 0) throw new Error('Package section not found');
  return { blocks, index };
}

function updateSection(text, header, matches, version, name) {
  const { blocks, index } = section(text, header, matches);
  blocks[index] = replaceVersion(blocks[index], tomlVersion, version, name);
  return blocks.join('');
}

export function setVersionInPackageJson(text, version) {
  return replaceVersion(text, jsonVersion, version, 'packageJson');
}
export function setVersionInTauriConf(text, version) {
  return replaceVersion(text, jsonVersion, version, 'tauriConf');
}
export function setVersionInCargoToml(text, version) {
  return updateSection(text, /^\[package\]\s*$/m, () => true, version, 'cargoToml');
}
export function setVersionInCargoLock(text, version) {
  return updateSection(text, /^\[\[package\]\]\s*$/m, block => /^name\s*=\s*"app"\s*$/m.test(block), version, 'cargoLock');
}

function extract(text, pattern, name) {
  const match = text.match(pattern);
  if (!match) throw new Error(`Version not found in ${name}`);
  return match[2];
}

export function readVersions(files) {
  const cargo = section(files.cargoToml, /^\[package\]\s*$/m, () => true);
  const lock = section(files.cargoLock, /^\[\[package\]\]\s*$/m, block => /^name\s*=\s*"app"\s*$/m.test(block));
  return [extract(files.packageJson, jsonVersion, 'packageJson'), extract(files.tauriConf, jsonVersion, 'tauriConf'), extract(cargo.blocks[cargo.index], tomlVersion, 'cargoToml'), extract(lock.blocks[lock.index], tomlVersion, 'cargoLock')];
}

export function assertSameVersions(files) {
  const versions = readVersions(files);
  const names = ['packageJson', 'tauriConf', 'cargoToml', 'cargoLock'];
  for (let i = 1; i < versions.length; i++) {
    if (versions[i] !== versions[0]) throw new Error(`${names[i]} version ${versions[i]} differs from packageJson version ${versions[0]}`);
  }
}
