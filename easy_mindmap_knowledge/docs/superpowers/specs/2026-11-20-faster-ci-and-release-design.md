# Faster CI and release - design (short)

Date: 2026-11-20. Status: scope approved by the user in chat ("làm tăng tốc CI và release đi", after the options 1 to 3 were listed). A small change: no builder check.

## Intent
A pull request waits 4 to 8 minutes and a release about 20 minutes. Make both faster without lowering what is checked before a release is published.

## Goals
- Pull request: a change that touches no native code finishes in about 2 minutes.
- Release: the three platform builds run in parallel (about 8 minutes instead of about 20).
- The release stays a draft until all four updater platforms are present, and `latest.json` still carries version, public download URLs, signatures, sizes and notes.

## Non-goals
- No change to signing, the secrets, the action pins, the version rules or the release notes format.
- No caching rework beyond what exists.

## Anti-goals
- A published release with a platform missing from `latest.json` (the race the serial build avoided).
- Two draft releases for one tag (parallel jobs creating the release).
- A native build error first seen at release time for a change that touched native code.

## Constraints and facts
- `tauri-action` (pinned `1deb371b`) has the inputs `releaseId` (upload to an existing release) and `uploadUpdaterJson`.
- It was serial because every job rewrote the same `latest.json` (see the 0.1.0 review). In parallel, no job may write `latest.json`.
- GitHub lists a draft release by tag only through `gh release view` or the releases list, not the tag endpoint.
- Updater files per platform: macOS `*_universal.app.tar.gz` + `.sig`, Windows `*_x64-setup.exe` + `.sig`, Linux `*_amd64.deb` + `.sig` (asset names use dots where the product name has spaces).

## Approach (chosen)
1. **PR workflow** (`mindmap-build.yml`): a `test` job (ubuntu: `npm ci`, `npm test`, `npm run check`, `npm run build`) always; a `changes` job decides `native` (changed files under `easy_mindmap_knowledge/src-tauri/`, `package.json`, `package-lock.json` or `.github/workflows/`; always true on a push to `main`, so the `main` Rust cache stays warm); the Tauri matrix runs only when `native` is true and no longer repeats the tests.
2. **Release workflow**: `verify` also runs `npm ci`, `npm test`, `npm run check` once (the matrix no longer repeats them); a new `draft` job creates the draft release once and outputs its id; the matrix builds in parallel with `releaseId` and `uploadUpdaterJson: false`; `finalize` builds `latest.json` itself from the uploaded assets and `.sig` files with a new script `scripts/release/build-latest.mjs`, then runs the existing `assert-platforms`, `add-sizes`, changelog notes, upload and publish steps. `public-urls.mjs` is removed (its job is done by the new script).
3. **Proof**: the new script is checked against the real v0.2.1 assets and `latest.json` (same URLs and signatures); the workflow itself is proven only by a real release (0.2.2).

## Calls made by the agent
- Tests no longer run on Windows and Linux in PRs (they ran on 3 OS before); the frontend tests are OS independent and the release `verify` job still runs them.
- Only the four plain platform keys are written (`darwin-aarch64`, `darwin-x86_64`, `windows-x86_64`, `linux-x86_64`); the Tauri updater falls back to them.

## Risks (unverified until a release runs)
- `.sig` files are uploaded as release assets when `uploadUpdaterJson` is false (they were present for 0.1.0 to 0.2.1 with it true).
- `releaseId` upload from three jobs at once.
