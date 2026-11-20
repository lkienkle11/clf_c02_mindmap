import type { VersionFiles } from './versions.mjs';

export function checkRelease(tag: string, files: VersionFiles, latestPublished: string | null): void;
export function assertRealPubkey(overlayText: string): void;
export function assertPlatforms(latest: { platforms?: Record<string, unknown> }, required: string[]): void;
