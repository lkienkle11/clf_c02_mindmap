# Faster CI and release Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development.

**Goal:** Pull requests and releases finish faster with the same safety.
**Architecture:** see the spec. **Tech Stack:** GitHub Actions, Node `.mjs` scripts tested with Vitest.
**Spec:** `docs/superpowers/specs/2026-11-20-faster-ci-and-release-design.md` (paths relative to `easy_mindmap_knowledge/`).

## Global Constraints
- Action pins by full SHA unchanged in the release workflow; secrets only in the tauri-action step env; the release stays a draft until `finalize` publishes.
- Commit rules: `type(scope): description` with Scope / What did / Reviewed / Tested; no AI attribution.

## Review Focus
- An asset or `.sig` missing for one platform must fail `finalize` (never publish a partial `latest.json`).
- Asset names with dots, spaces or `#` must produce valid encoded URLs.
- Re-running the workflow must not create a second draft release.

### Task 1: build-latest script

**Files:**
- Create: `scripts/release/build-latest.mjs`, `scripts/release/build-latest.d.mts`, `scripts/release/build-latest.test.ts`

**Interfaces:**
- Produces: `buildLatest({ version, repo, tag, assets, sigs }): { version, notes: string, pub_date: string, platforms }` where `assets: { name: string }[]` (release assets as listed by `gh release view --json assets`), `sigs: Record<string, string>` maps an asset name to the content of its `.sig` file (key is the installer asset name without `.sig`). It picks, per platform, the asset by name suffix: `_universal.app.tar.gz` -> `darwin-aarch64` and `darwin-x86_64` (same asset), `_x64-setup.exe` -> `windows-x86_64`, `_amd64.deb` -> `linux-x86_64`. Each platform entry is `{ signature: sigs[name].trim(), url: https://github.com/<repo>/releases/download/<tag>/<encodeURIComponent(name)> }`. `pub_date` is `new Date().toISOString()`. Throws an `Error` naming the platform when its asset or its signature is missing, or when two assets match one platform. CLI: `node scripts/release/build-latest.mjs <assets.json> <sigs-dir> <version> <owner/repo> <tag> <out latest.json>`: reads `assets.json` (a JSON array or `{assets}`), reads each `<name>.sig` file from `<sigs-dir>` for matching assets, writes the result as JSON with a trailing newline, exits 1 with a usage message on wrong arguments.

- [ ] **Step 1: Write failing tests** in `build-latest.test.ts`: `builds the four platform entries with public URLs and trimmed signatures`; `encodes unusual characters in asset names`; `throws naming the platform when its installer asset is missing`; `throws naming the platform when its signature is missing`; `throws when two assets match one platform`; `notes is an empty string and version, repo and tag are used`.
- [ ] **Step 2: Run** `npx vitest run scripts/release/build-latest.test.ts`. Expected: FAIL (module missing).
- [ ] **Step 3: Implement** `buildLatest` and the CLI in `build-latest.mjs` with the types in `build-latest.d.mts`.
- [ ] **Step 4: Run** the file's tests, then `npm test` and `npm run check`. Expected: PASS.
- [ ] **Step 5: Commit** (orchestrator): `feat(release): build latest.json from the uploaded assets`.

### Task 2: Workflows (orchestrator, independent review)

**Files:** `../.github/workflows/mindmap-build.yml`, `../.github/workflows/mindmap-release.yml`, `docs/RELEASING.md`; delete `scripts/release/public-urls.mjs`, `.d.mts`, `.test.ts`.

- [ ] Apply the spec's items 1 and 2; add a contract test in `tests/release-config.test.ts` that the release workflow has no `max-parallel`, passes `releaseId`, sets `uploadUpdaterJson: false`, and runs `build-latest.mjs` in `finalize`.
- [ ] Verify the new script against the real v0.2.1 assets and `latest.json` (platform URLs and signatures identical).
- [ ] Independent review of the workflow diff, then a real release (0.2.2) as the proof; fix and repeat on failure.
