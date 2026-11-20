export function parseVersion(s: string): [number, number, number];
export function isGreater(a: string, b: string): boolean;
export function setVersionInPackageJson(text: string, version: string): string;
export function setVersionInTauriConf(text: string, version: string): string;
export function setVersionInCargoToml(text: string, version: string): string;
export function setVersionInCargoLock(text: string, version: string): string;
export interface VersionFiles {
  packageJson: string;
  tauriConf: string;
  cargoToml: string;
  cargoLock: string;
}
export function readVersions(files: VersionFiles): string[];
export function assertSameVersions(files: VersionFiles): void;
