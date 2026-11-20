import type { VersionFiles } from './versions.mjs';

export function checkRelease(tag: string, files: VersionFiles & { changelog: string }, latestPublished: string | null): void;
export function assertRealPubkey(overlayText: string): void;
export function assertPlatforms(latest: { platforms?: Record<string, unknown> }, required: string[]): void;
