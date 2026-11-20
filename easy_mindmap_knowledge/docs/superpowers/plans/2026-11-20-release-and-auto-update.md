# Release pipeline, auto-update and dev/prod split Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish signed installers for macOS, Windows and Debian/Ubuntu from a pushed `vX.Y.Z` tag, and let the production app find, download (with progress) and install the newest release from Settings, while a locally built app is a separate "DEV" app with no update feature.

**Architecture:** The default Tauri config (`src-tauri/tauri.conf.json`) is the development app. A production overlay (`src-tauri/tauri.production.conf.json`) passed with `--config` in the release workflow changes the name, identifier, icons and adds the updater. The channel is chosen by one environment variable `APP_CHANNEL=production`, read by `build.rs` (Rust `cfg(production)` gates the updater and process plugins) and by Vite (`VITE_APP_CHANNEL`, gates the UI). The update logic is a new feature `src/features/update/` behind an `UpdaterPort`, so tests use a fake; one adapter wraps `@tauri-apps/plugin-updater`.

**Tech Stack:** Tauri 2.12 (`tauri-plugin-updater`, `tauri-plugin-process`), Svelte 5 runes, Vitest + Testing Library, Node `.mjs` release scripts, GitHub Actions with `tauri-apps/tauri-action`.

**Spec:** `docs/superpowers/specs/2026-11-20-release-and-auto-update-design.md` (approved 2026-11-20). Rulings that differ from the spec's open choices: the default config is the DEV app and the overlay is production (so a forgotten flag can never publish a production build); the channel switch is the single env var `APP_CHANNEL`.

## Global Constraints

- Release trigger: push of tag `v*`; merge to `main` never publishes. Tag must equal the version in `package.json`, `src-tauri/Cargo.toml`, `src-tauri/Cargo.lock` (package `app`) and `src-tauri/tauri.conf.json`, and must be greater than the latest published release.
- Production: `productName` "AWS CLF-C02 Mindmap", identifier `app.awsclf.mindmap`, current icons, updater on. Development: `productName` "AWS CLF-C02 Mindmap (Dev)", identifier `app.awsclf.mindmap.dev` (own data folder), icons with the orange "DEV" band (design B), no updater plugin, no update UI, no network check.
- Platforms: macOS universal (`.dmg` + updater archive), Windows `nsis` with `installMode: currentUser`, Linux `.deb` only (no AppImage).
- Updater endpoint: `https://github.com/lkienkle11/clf_c02_mindmap/releases/latest/download/latest.json`; updates are signature-checked with the Tauri minisign key; no `dangerous*` updater options.
- UI strings in English and Vietnamese. Modal copy: "Đã có bản cập nhật (xxx MB), cập nhật ngay?" with actions "Cập nhật ngay" and "Để sau". Button copy: "Tải bản cập nhật (xxx MB)", "Cài đặt bản cập nhật". Download shows % and "X MB / Y MB"; install shows "Đang cài đặt…" (indeterminate).
- Learner data must survive updates: never edit a shipped migration.
- Security: the private signing key and password exist only as GitHub Secrets `TAURI_SIGNING_PRIVATE_KEY` and `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`; only the release workflow sees them; it triggers only on tags, never on pull requests; the existing build workflow keeps `permissions: contents: read` and no secrets. Third-party actions are pinned to a full commit SHA.
- Commits follow the project's Commitlint rules: `type(scope): description`, body sections Scope / What did / Reviewed / Tested, no AI attribution lines.

## Review Focus

- GitHub unreachable or offline at app start: no error toast, app fully usable; Settings shows a retry message only when the user opened the check.
- Server reports the same or an older version: state is "up to date", never "available".
- Download fails halfway (network drop): state `error`, "Thử lại" restarts the download; a partly downloaded update is never installed.
- `contentLength` missing in the download events or size missing in `latest.json`: indeterminate bar, no "NaN %", button text without "(xxx MB)".
- Update downloaded, user presses "Để sau" or closes Settings: update stays `readyToInstall`; switching language while the modal is open re-renders the text.

---

### Task 1: Version scripts

**Files:**
- Create: `scripts/release/versions.mjs`, `scripts/release/set-version.mjs`, `scripts/release/versions.test.ts`

**Interfaces:**
- Produces (`versions.mjs`): `parseVersion(s: string): [number, number, number]` (throws on anything but `X.Y.Z` digits); `isGreater(a: string, b: string): boolean`; `setVersionInPackageJson(text, v)`, `setVersionInTauriConf(text, v)`, `setVersionInCargoToml(text, v)` (only the `[package]` version), `setVersionInCargoLock(text, v)` (only the `[[package]] name = "app"` entry), each returning the new text; `readVersions(files: {packageJson, tauriConf, cargoToml, cargoLock}): string[]`; `assertSameVersions(files)` throws if they differ.
- Produces (`set-version.mjs`): CLI `node scripts/release/set-version.mjs 0.2.0` rewriting the four real files, then calling `assertSameVersions`.

- [ ] **Step 1: Write the failing tests** in `scripts/release/versions.test.ts`: `parseVersion('0.2.0')` gives `[0,2,0]`; `parseVersion('v0.2')` and `'0.2.0-beta'` throw; `isGreater('0.10.0','0.9.9')` is true and `isGreater('0.1.0','0.1.0')` is false; each setter changes only the intended line (Cargo.lock sample with two packages: only `app` changes; Cargo.toml sample with a dependency that also has `version = "1.0"`: untouched); `assertSameVersions` throws a message naming the file that differs.
- [ ] **Step 2: Run** `npx vitest run scripts/release/versions.test.ts` → FAIL (module missing).
- [ ] **Step 3: Implement** `versions.mjs` with line-based regex edits (no TOML parser dependency) and `set-version.mjs` reading and writing the four real files relative to the repo's `easy_mindmap_knowledge` folder.
- [ ] **Step 4: Run** the same command → PASS. Then run `node scripts/release/set-version.mjs 0.1.0` and `git diff --stat` → no change.
- [ ] **Step 5: Commit** `feat(release): add the version bump scripts`.

### Task 2: Build channel switch (frontend)

**Files:**
- Create: `src/app/build-channel.ts`, `src/app/build-channel.test.ts`
- Modify: `src/svelte-shim.d.ts` or the project's Vite env typing file (add `VITE_APP_CHANNEL?: string` to `ImportMetaEnv`), `vite.config.ts` (nothing to define: Vite exposes `VITE_*` automatically)

**Interfaces:**
- Produces: `type BuildChannel = 'production' | 'development'`; `getBuildChannel(): BuildChannel` — `'production'` only when `import.meta.env.VITE_APP_CHANNEL === 'production'`, otherwise `'development'`.

- [ ] **Step 1: Write failing tests** with `vi.stubEnv('VITE_APP_CHANNEL', ...)`: `'production'` → production; `undefined`, `''`, `'prod'`, `'Production'` → development.
- [ ] **Step 2: Run** `npx vitest run src/app/build-channel.test.ts` → FAIL.
- [ ] **Step 3: Implement** `getBuildChannel` and the env typing.
- [ ] **Step 4: Run** the test and `npm run check` → PASS.
- [ ] **Step 5: Commit** `feat(update): add the build channel switch`.

### Task 3: Size and progress formatting

**Files:**
- Create: `src/features/update/logic/format.ts`, `src/features/update/logic/format.test.ts`

**Interfaces:**
- Produces: `formatMegabytes(bytes: number): string` (1 decimal, 1 MB = 1,048,576 bytes, e.g. `12.3 MB`; below 0.1 MB shows `0.1 MB`); `percentDone(downloaded: number, total: number | null): number | null` (integer 0–100, clamped; `null` when total is null, 0 or negative).

- [ ] **Step 1: Write failing tests**: `formatMegabytes(12_900_000)` → `'12.3 MB'`; `formatMegabytes(1)` → `'0.1 MB'`; `percentDone(50,200)` → `25`; `percentDone(300,200)` → `100`; `percentDone(5,null)` → `null`; `percentDone(5,0)` → `null`.
- [ ] **Step 2: Run** `npx vitest run src/features/update/logic/format.test.ts` → FAIL.
- [ ] **Step 3: Implement** both functions.
- [ ] **Step 4: Run** → PASS.
- [ ] **Step 5: Commit** `feat(update): add size and percent formatting`.

### Task 4: UpdaterPort and update state machine

**Files:**
- Create: `src/features/update/updater-port.ts`, `src/features/update/logic/update-controller.svelte.ts`, `src/features/update/logic/update-controller.test.ts`, `src/testing/fake-updater.ts`

**Interfaces:**
- Consumes: `percentDone` (Task 3).
- Produces (`updater-port.ts`): 
  `interface UpdateInfo { version: string; sizeBytes: number | null }`;
  `interface DownloadProgress { downloaded: number; total: number | null }`;
  `interface UpdaterPort { check(): Promise<UpdateInfo | null>; download(onProgress: (p: DownloadProgress) => void): Promise<void>; install(): Promise<void> }` (`download` applies to the update found by the last `check`; `install` restarts the app).
- Produces (`update-controller.svelte.ts`): `type UpdateStatus = 'idle' | 'checking' | 'upToDate' | 'available' | 'downloading' | 'ready' | 'installing' | 'error'`; `class UpdateController { constructor(port: UpdaterPort); status: UpdateStatus; info: UpdateInfo | null; progress: DownloadProgress | null; percent: number | null; errorStage: 'check' | 'download' | 'install' | null; check(opts?: { silent?: boolean }): Promise<void>; download(): Promise<void>; install(): Promise<void> }` (all fields `$state`/`$derived`).
- Produces (`fake-updater.ts`): `makeFakeUpdater(o?: { update?: UpdateInfo | null; failCheck?: boolean; failDownload?: boolean; failInstall?: boolean; chunks?: DownloadProgress[] }): UpdaterPort & { calls: string[] }`.

Rules: `check` while `downloading`, `ready` or `installing` does nothing; `check` with `info.version` equal to nothing newer is the port's job (it returns `null`); a silent check that fails returns to `idle` with `errorStage` still `null`; a non-silent failure sets `error` with `errorStage 'check'`; `download` only from `available` or from `error` with `errorStage 'download'`; `install` only from `ready`.

- [ ] **Step 1: Write failing tests**: (a) check with an update → `available`, `info` set; (b) check with `null` → `upToDate`; (c) silent failed check → `idle`, `errorStage` null; non-silent failed check → `error` / `'check'`; (d) download feeds chunks `{0,1000}`, `{500,1000}`, `{1000,1000}` → `percent` goes 0, 50, 100 and the status ends `ready`; (e) chunks with `total: null` → `percent` stays `null`; (f) `failDownload` → `error` / `'download'`, and calling `download()` again succeeds from there; (g) `install` from `ready` → `installing` and the port's `install` is called once; install before `ready` is ignored; (h) `check()` in `downloading` and `ready` does not call the port.
- [ ] **Step 2: Run** `npx vitest run src/features/update/logic/update-controller.test.ts` → FAIL.
- [ ] **Step 3: Implement** the port, controller and fake.
- [ ] **Step 4: Run** the test → PASS.
- [ ] **Step 5: Commit** `feat(update): add the updater port and state machine`.

### Task 5: i18n strings

**Files:**
- Modify: `src/i18n/en.json`, `src/i18n/vi.json`; Test: `src/i18n/i18n.test.ts` (existing key-parity test must stay green)

**Interfaces:**
- Produces keys (both locales): `update.heading`, `update.checking`, `update.upToDate`, `update.available` (`{version}`), `update.download` (`{size}`) , `update.downloadNoSize`, `update.downloading` (`{percent}`), `update.downloadingBytes` (`{done}`, `{total}`), `update.downloadingBytesNoTotal` (`{done}`), `update.install`, `update.installing`, `update.retry`, `update.checkFailed`, `update.downloadFailed`, `update.installFailed`, `update.modal.title`, `update.modal.body` (`{version}`, `{size}`), `update.modal.bodyNoSize` (`{version}`), `update.modal.confirm`, `update.modal.later`. Vietnamese values use the copy in Global Constraints.

- [ ] **Step 1: Add a failing test** in `src/features/update/logic/strings.test.ts` that every key above exists in both JSON files and that `{version}`/`{size}` placeholders appear in both languages of the keys that use them.
- [ ] **Step 2: Run** `npx vitest run src/features/update/logic/strings.test.ts` → FAIL.
- [ ] **Step 3: Add the keys** to both files.
- [ ] **Step 4: Run** that test and `npx vitest run src/i18n` → PASS.
- [ ] **Step 5: Commit** `feat(update): add English and Vietnamese update strings`.

### Task 6: Update UI in Settings and service wiring

**Files:**
- Create: `src/features/update/ui/UpdateSection.svelte`, `src/features/update/ui/UpdateSection.test.ts`, `src/features/update/index.ts`
- Modify: `src/app/composition.ts` (add `updates: UpdateController | null` to `Services`; `buildServices` part `updater?: UpdaterPort | null`, default `null`), `src/features/settings/ui/SettingsScreen.svelte` (render `<UpdateSection>` under the version line when `services.updates !== null`; call `services.updates.check()` on mount), `src/features/settings/ui/SettingsScreen.test.ts` (version assertion uses `package.json`'s `version`, not the literal `0.1.0`), `src/main.ts` (after mount: `void services.updates?.check({ silent: true })`)

**Interfaces:**
- Consumes: `UpdateController`, `makeFakeUpdater`, i18n keys, `Modal` (`open`, `title`, `onclose`, `footer`), `formatMegabytes`.
- Produces: `UpdateSection` props `{ controller: UpdateController }`.

UI rules: `available` → button "Tải bản cập nhật (X MB)" (no size → `update.downloadNoSize`); `downloading` → `<progress>` with the `%` (indeterminate when `percent` is null) and text from `downloadingBytes`; `ready` → button "Cài đặt bản cập nhật" that opens the modal (title/body from `update.modal.*`, "Cập nhật ngay" calls `install`, "Để sau" and Esc close it and keep status `ready`); `installing` → "Đang cài đặt…" with an indeterminate bar, buttons disabled; `error` → `role="alert"` message by `errorStage` and a "Thử lại" button (`check` for stage check, `download` for stage download).

- [ ] **Step 1: Write failing tests** for `UpdateSection` with the fake updater: shows no size text when `sizeBytes` is null; shows `Tải bản cập nhật (12.3 MB)` in Vietnamese; progress bar `aria-valuenow` follows chunks and has no `aria-valuenow` when total is null; "Cài đặt" opens a modal with the size and version; "Để sau" closes it and the install button is still there; "Cập nhật ngay" calls the fake's `install`; failed download shows an alert and "Thử lại" recovers; switching the locale while the modal is open changes its text. Settings test: with `services.updates === null` no "Cập nhật" heading renders (development channel).
- [ ] **Step 2: Run** `npx vitest run src/features/update src/features/settings` → FAIL.
- [ ] **Step 3: Implement** the component, the exports, the `Services` field and the Settings/main changes.
- [ ] **Step 4: Run** `npx vitest run` (full suite) and `npm run check` → PASS.
- [ ] **Step 5: Commit** `feat(update): show the update flow in Settings`.

### Task 7: Tauri config split, plugins and capabilities

**Files:**
- Create: `src-tauri/tauri.production.conf.json`, `tests/release-config.test.ts`
- Modify: `src-tauri/tauri.conf.json` (becomes the DEV app), `src-tauri/Cargo.toml` (`tauri-plugin-updater = "2"`, `tauri-plugin-process = "2"`, both under `[target.'cfg(not(any(target_os = "android", target_os = "ios")))'.dependencies]`), `src-tauri/build.rs`, `src-tauri/src/lib.rs`, `src-tauri/capabilities/default.json`, `package.json` (`@tauri-apps/plugin-updater`, `@tauri-apps/plugin-process`)

**Interfaces:**
- Produces: `tauri.conf.json`: `productName` "AWS CLF-C02 Mindmap (Dev)", window title the same, `identifier` `app.awsclf.mindmap.dev`, `bundle.icon` pointing at `icons-dev/…` (files arrive in Task 9; until then keep the current paths and let Task 9 switch them), no `createUpdaterArtifacts`. `tauri.production.conf.json` (merge patch): `productName`, window title, `identifier` `app.awsclf.mindmap`, `bundle.icon` current `icons/…`, `bundle.createUpdaterArtifacts: true`, `bundle.targets: ["app","dmg","nsis","deb"]`, `bundle.windows.nsis.installMode: "currentUser"`, `plugins.updater: { pubkey, endpoints: ["https://github.com/lkienkle11/clf_c02_mindmap/releases/latest/download/latest.json"] }`. `build.rs`: when env `APP_CHANNEL` is `production` emit `cargo:rustc-cfg=production`; always emit `cargo:rerun-if-env-changed=APP_CHANNEL` and `cargo::rustc-check-cfg=cfg(production)`. `lib.rs`: register the updater and process plugins only under `#[cfg(all(production, desktop))]`. `default.json`: add `updater:default`, `process:allow-restart`.

- [ ] **Step 1 (manual, the user, once): create the signing key.** Run `npx tauri signer generate -w ~/.tauri/clf-mindmap-updater.key`, choose a password, back up the key file and password somewhere private, copy the printed public key into `plugins.updater.pubkey` of the production overlay, then `gh secret set TAURI_SIGNING_PRIVATE_KEY < ~/.tauri/clf-mindmap-updater.key` and `gh secret set TAURI_SIGNING_PRIVATE_KEY_PASSWORD`. The agent never reads the private key file.
- [ ] **Step 2: Write the failing contract test** `tests/release-config.test.ts` reading both JSON files: dev identifier ends with `.dev` and equals `app.awsclf.mindmap.dev`; dev has no `plugins.updater` and no `createUpdaterArtifacts`; production overlay identifier is `app.awsclf.mindmap`, `createUpdaterArtifacts` is true, `pubkey` is a non-empty string, the only endpoint is the URL in Global Constraints and starts with `https://`, `nsis.installMode` is `currentUser`, no `dangerous` key anywhere; capability file lists `updater:default` and `process:allow-restart`.
- [ ] **Step 3: Run** `npx vitest run tests/release-config.test.ts` → FAIL.
- [ ] **Step 4: Implement** the config split, `build.rs`, `lib.rs`, capabilities, Cargo and npm dependencies (`npm install`, which updates `package-lock.json`; `cargo update -p` only as needed).
- [ ] **Step 5: Verify** `npx vitest run tests/release-config.test.ts` → PASS; `cd src-tauri && cargo check` (development) and `APP_CHANNEL=production cargo check` both succeed; `rtk` prefix is allowed for these commands.
- [ ] **Step 6: Commit** `feat(release): split the dev and production Tauri configs`.

### Task 8: Tauri updater adapter and channel wiring

**Files:**
- Create: `src/features/update/tauri-updater.ts`, `src/features/update/tauri-updater.test.ts`
- Modify: `src/app/composition.ts` (`createServices`: when `getBuildChannel() === 'production'` pass `updater: createTauriUpdater()`), `src/features/update/index.ts`

**Interfaces:**
- Consumes: `UpdaterPort`, `getBuildChannel`, `check`/`Update` from `@tauri-apps/plugin-updater`, `relaunch` from `@tauri-apps/plugin-process`.
- Produces: `createTauriUpdater(deps?: { check?: typeof check; relaunch?: typeof relaunch }): UpdaterPort`.

Behavior: `check()` keeps the returned `Update` and maps it to `UpdateInfo` (`version`, `sizeBytes` read from `rawJson.sizes` of `latest.json`, `null` if absent); `download(onProgress)` calls `update.download(cb)` mapping `Started{contentLength}`, `Progress{chunkLength}` (accumulated) and `Finished` to `DownloadProgress`; `install()` calls `update.install()` then `relaunch()`.

- [ ] **Step 1 (spike, 10 minutes): read** `node_modules/@tauri-apps/plugin-updater/dist-js/index.d.ts` and decide the size lookup: if `Update` exposes the download URL or target key, look `sizes` up by it; otherwise key `sizes` by asset file name and take the file name from `rawJson.platforms[…].url` of the platform the app runs on (`@tauri-apps/plugin-os` only if no other way exists). Record the decision in a comment in `tauri-updater.ts` and in Task 10's input format.
- [ ] **Step 2: Write failing tests** with an injected fake `check`: returns `null` → port returns `null`; returns an update with `rawJson.sizes` → `sizeBytes` correct; without `sizes` → `null`; `download` maps events (Started 1000, Progress 400, Progress 600, Finished) to `{0,1000}`, `{400,1000}`, `{1000,1000}`; `install` calls the update's `install` then `relaunch` once, in that order; a `check` that throws rejects.
- [ ] **Step 3: Run** `npx vitest run src/features/update/tauri-updater.test.ts` → FAIL.
- [ ] **Step 4: Implement** the adapter and the `createServices` change; dev builds must not import or call the plugin at runtime (dynamic `import()` inside `createTauriUpdater`, only reached in production).
- [ ] **Step 5: Run** `npx vitest run` and `npm run check` → PASS.
- [ ] **Step 6: Commit** `feat(update): add the Tauri updater adapter`.

### Task 9: Development icons

**Files:**
- Create: `app-icon-dev.svg`, `scripts/release/make-dev-icons.mjs`, `src-tauri/icons-dev/` (generated: `32x32.png`, `128x128.png`, `128x128@2x.png`, `icon.icns`, `icon.ico`, `icon.png`)
- Modify: `src-tauri/tauri.conf.json` (`bundle.icon` → `icons-dev/…`), `tests/release-config.test.ts` (dev icon paths start with `icons-dev/`, production with `icons/`, every listed file exists)

- [ ] **Step 1: Extend the contract test** with the icon assertions above → run `npx vitest run tests/release-config.test.ts` → FAIL.
- [ ] **Step 2: Create** `app-icon-dev.svg` from `app-icon.svg`: add a clipped orange (`#f59e0b`) band over the bottom 164 units of the rounded square with the letters "DEV" in `#1f2937`; draw the letters as paths (not `<text>`) so every renderer shows the same shape; the node dots and tree stay as in production (the approved mockup B).
- [ ] **Step 3: Implement** `make-dev-icons.mjs` running `npx tauri icon app-icon-dev.svg -o src-tauri/icons-dev` and deleting the platform folders the app does not use (`android`, `ios`) if produced.
- [ ] **Step 4: Run** the script, point the dev config at `icons-dev/`, open the PNG and `.icns` to confirm the band reads at 32 px; run the contract test → PASS.
- [ ] **Step 5: Commit** `feat(release): add the development app icon`.

### Task 10: latest.json size step

**Files:**
- Create: `scripts/release/add-sizes.mjs`, `scripts/release/add-sizes.test.ts`

**Interfaces:**
- Produces: `addSizes(latest: object, assets: { name: string; size: number }[]): object` — returns a copy of `latest` with top-level `sizes: { [assetFileName]: bytes }` for every platform `url` whose file name matches an asset (format fixed by Task 8 Step 1); throws if a platform url has no matching asset. CLI: `node scripts/release/add-sizes.mjs <latest.json> <assets.json>` rewriting the file.

- [ ] **Step 1: Write failing tests**: two platforms with matching assets → `sizes` has both; url-encoded names (`%20`) match the decoded asset name; a missing asset throws naming the platform; input object not mutated.
- [ ] **Step 2: Run** `npx vitest run scripts/release/add-sizes.test.ts` → FAIL.
- [ ] **Step 3: Implement** `addSizes` and the CLI.
- [ ] **Step 4: Run** → PASS.
- [ ] **Step 5: Commit** `feat(release): add asset sizes to latest.json`.

### Task 11: Release workflow, release check and runbook

**Files:**
- Create: `.github/workflows/mindmap-release.yml`, `scripts/release/check-release.mjs`, `scripts/release/check-release.test.ts`, `docs/RELEASING.md`
- Modify: `.github/workflows/mindmap-build.yml` (comment that it builds the DEV channel; no secrets; unchanged permissions)

**Interfaces:**
- Produces: `checkRelease(tag: string, files, latestPublished: string | null): void` in `check-release.mjs` — throws unless `tag` is `v` + the shared version of all four files and the version is greater than `latestPublished` (`null` = first release, allowed). CLI reads the tag from `GITHUB_REF_NAME` and the latest from `gh release view --json tagName`.

Workflow shape: `on: push: tags: ['v*']`; `permissions: contents: write`; job `build` matrix macOS (`--target universal-apple-darwin`, rust targets `aarch64-apple-darwin,x86_64-apple-darwin`), Windows, Ubuntu (same Linux packages as the build workflow); steps: checkout, node 22, rust, `node scripts/release/check-release.mjs`, `npm ci`, `npm test`, `npm run check`, `tauri-apps/tauri-action@<full commit SHA of the current v0 release>` with `projectPath: easy_mindmap_knowledge`, `tagName`, `releaseName: AWS CLF-C02 Mindmap ${{ github.ref_name }}`, `includeUpdaterJson: true`, `args: --config src-tauri/tauri.production.conf.json` plus the macOS target, env `APP_CHANNEL: production`, `VITE_APP_CHANNEL: production`, the two signing secrets. Job `finalize` (`needs: build`): `gh release download` `latest.json`, `gh release view --json assets` → `assets.json`, run `add-sizes.mjs`, `gh release upload --clobber latest.json`. Pin every other action to a SHA too.

- [ ] **Step 1: Write failing tests** for `checkRelease`: matching tag and versions with a lower published version passes; tag `v0.2.0` with files at `0.1.0` throws; version equal to or lower than the latest published throws; `latestPublished = null` passes; files that disagree throw.
- [ ] **Step 2: Run** `npx vitest run scripts/release/check-release.test.ts` → FAIL.
- [ ] **Step 3: Implement** `check-release.mjs`, the workflow, the build-workflow comment, and `docs/RELEASING.md` (how to release: `node scripts/release/set-version.mjs X.Y.Z`, commit, `git tag vX.Y.Z`, `git push origin vX.Y.Z`; key backup; GitHub setting to protect `v*` tags; the first-install warnings on macOS and Windows and how to open the app; the Linux admin prompt).
- [ ] **Step 4: Verify** `npx vitest run scripts/release` → PASS; validate the YAML with `actionlint` if installed, otherwise re-read it for the shape above; check with `grep` that no step prints a secret and no `pull_request` trigger exists in the release workflow.
- [ ] **Step 5: Commit** `feat(release): add the tag-triggered release workflow`.

### Task 12: Release rehearsal (manual, the user with the agent watching)

**Files:** none (a throwaway tag, then clean-up)

- [ ] **Step 1:** Run `node scripts/release/set-version.mjs 0.1.0` (no-op), push the branch and open the PR; the build workflow passes on 3 platforms as the DEV channel.
- [ ] **Step 2:** After merge, tag `v0.1.0`; confirm the Release has `.dmg`, `.exe`, `.deb`, `.sig` files and a `latest.json` with `sizes`.
- [ ] **Step 3:** Install `v0.1.0` on macOS (right-click → Open), confirm the production icon, name and the "Cập nhật" section says "up to date".
- [ ] **Step 4:** Bump to `0.1.1`, tag, wait for the release; in the installed `0.1.0` app open Settings: "Tải bản cập nhật (… MB)", progress %, "Cài đặt bản cập nhật", modal, restart into `0.1.1`; database content is unchanged.
- [ ] **Step 5:** Build locally with `npx tauri build`: the app is "(Dev)", orange DEV icon, no update section, its own empty data. Record the results (including the unsigned-macOS in-place update risk) in `docs/RELEASING.md`; Windows and Linux are checked from the CI result and by a friend.

## Self-review

- **Spec coverage:** release on tag (Tasks 1, 11); 3 platforms (Task 7 targets, Task 11 matrix); Settings flow with size, modal, progress (Tasks 3–6, 8); version only increases (Tasks 1, 11); dev/prod split with icon, name, identifier, no update (Tasks 2, 7, 9, 6); learner data safe (identifier separation, no migration changes; Task 12 Step 4 checks it); signing and secrets (Tasks 7, 11); risks (Task 12).
- **Type consistency:** `UpdaterPort`, `UpdateInfo`, `DownloadProgress` are defined in Task 4 and used unchanged in Tasks 6 and 8; `UpdateController` fields in Task 4 are those the Task 6 UI reads.
- **Open item for the executor:** the `sizes` key format is decided in Task 8 Step 1 and consumed in Task 10; do these two in that order.
