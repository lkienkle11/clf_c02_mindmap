# Release pipeline, in-app auto-update and dev/prod build split - design

Date: 2026-11-20. Status: approved by the user on 2026-11-20.

## Intent and why

The app is an offline Tauri v2 desktop app (Svelte 5, SQLite). It will be used by the author, friends and the public. Today the repo has no release and no way to update: a user would have to download and install every new build by hand. The user wants (1) GitHub Releases that carry installers for macOS, Windows 10/11 and Debian/Ubuntu Linux, (2) an in-app update flow in Settings that finds a new release and installs it, and (3) a clear split between a development build (built from source on a machine) and a production build (built by GitHub).

## Goals

- A release is made when the user pushes a tag such as `v0.2.0`. GitHub builds all three platforms and publishes one Release with installers and `latest.json`.
- The production app shows, in Settings, the current version and an update section: a button "Tải bản cập nhật (xxx MB)" when a newer release exists, then "Cài đặt bản cập nhật". A modal "Đã có bản cập nhật (xxx MB), cập nhật ngay?" asks before installing. English and Vietnamese strings both exist.
- Every update is a GitHub Release asset; the version number only goes up.
- Development build: different icon (production icon plus an orange "DEV" band, chosen by the user), different name and identifier, its own data folder, and no update feature.
- Learner data (SQLite database, reports) survives updates.

## Non-goals

- No Apple Developer ID, notarization or Windows code-signing certificate. The user accepts the macOS Gatekeeper and Windows SmartScreen warnings on first install.
- No release on every merge to `main`. No auto-versioning from commit messages.
- No update channel other than the latest stable release (no beta channel).
- No Linux AppImage, `.rpm`, Android or iOS.

## Anti-goals (a failure even if it works)

- A forged or tampered update is installed (the update signature must be checked).
- The private signing key is committed, logged or printed in CI.
- A local or CI test build contacts the GitHub update endpoint.
- Installing an update loses or corrupts the user's database.
- The dev build opens or changes the production database.

## Constraints and verified facts

- Repo: `lkienkle11/clf_c02_mindmap`, public, so the app reads Releases without a token.
- Current CI (`.github/workflows/mindmap-build.yml`) builds `app` (macOS), `nsis` (Windows), `deb` (Linux) on pull request and on push to `main`; it has not been run on Windows and Linux (the file says so).
- The Tauri updater plugin needs its own minisign key pair (`tauri signer generate`), `bundle.createUpdaterArtifacts` set under `bundle`, the public key in config, and endpoints (usually `https://github.com/<repo>/releases/latest/download/latest.json`). Source: https://v2.tauri.app/plugin/updater/
- The plugin installs `.deb` on Linux with an administrator prompt, so no AppImage is needed. Source: https://v2.tauri.app/release/updater/all-versions/ and the plugin source on docs.rs. [Unverified on a real Linux machine.]
- Whether `tauri-action`'s `includeUpdaterJson` works together with `createUpdaterArtifacts: true` is disputed in one issue report; the plan must verify it against the pinned `tauri-action` version.
- The version string lives in `package.json`, `src-tauri/Cargo.toml` and `src-tauri/tauri.conf.json`; `src/features/report/ui/app-version.ts` and the Settings screen read it.
- The CSP `connect-src` currently allows only `'self'`, `ipc:` and `http://ipc.localhost`; the updater runs in Rust, so it likely needs no CSP change. The plan must confirm.
- `tauri-plugin-persisted-scope` and `fs` scopes do not touch the update path.

## Approaches considered

1. Official Tauri updater plugin plus GitHub Releases (chosen by the user). Signature-checked in-place install on all three platforms. Costs: a signing key to protect, a permission and config to add.
2. Custom code: GitHub API, download, open the installer. No key, but no signature check and per-OS install code. Rejected: unsafe for a public app.
3. Only link to the Releases page. Rejected: does not give "install now".

## Design

### Build channel (production vs development)

- One switch decides the channel: the environment variable `APP_CHANNEL=production`, set only by the release workflow. Without it the build is `development`. [Builder's call: whether the switch is a Cargo feature, a Tauri config overlay, or both. The plan chooses and tests it.]
- Production config: `productName` "AWS CLF-C02 Mindmap", identifier `app.awsclf.mindmap`, current icons, updater plugin active.
- Development config (overlay merged with `--config`, used by local `tauri dev` and `tauri build`): `productName` "AWS CLF-C02 Mindmap (Dev)", identifier `app.awsclf.mindmap.dev`, icon set with the orange "DEV" band (design B), `createUpdaterArtifacts` off, updater plugin not registered.
- The frontend learns the channel from a Rust command (`get_build_channel`) or a build-time constant; the update section is not rendered, and no update check runs, in development.
- Dev data is separate: a different identifier gives a different app data folder and database.
- The pull-request/main CI build is a development-channel build (no signing secret), so it never publishes.

### Versioning

- A script `scripts/set-version` takes `X.Y.Z`, rewrites the three version files in one step, and fails if they disagree afterwards. The user runs it, commits, then pushes the tag `vX.Y.Z`.
- The release workflow fails if the tag does not equal the version in the three files, or if the new version is not greater than the latest published release.

### Release workflow (`.github/workflows/mindmap-release.yml`)

- Trigger: push of a tag `v*`. Matrix: macOS (universal: Apple Silicon and Intel), Windows (`nsis`), Ubuntu (`deb`).
- Runs tests and type check first, then builds with `APP_CHANNEL=production` and the signing key from the GitHub Secrets `TAURI_SIGNING_PRIVATE_KEY` and its password.
- Publishes one Release with: macOS `.dmg` and updater archive, Windows `.exe` and signature, Linux `.deb` and signature, and `latest.json`. A CI step adds each platform's `size` (bytes) to `latest.json`.
- The key pair is made once by the user on their machine; the public key goes in config, the private key only in the Secret and in the user's own backup.

### Update flow in the app (production only)

- In Settings, below "Phiên bản X.Y.Z", an "Cập nhật" section with the states: checking, up to date, update available, downloading (progress), ready to install, error with retry.
- The app checks on opening Settings and once per app start in the background; a failed check (offline, rate limit) is silent on start and shows a retry message in Settings. The app stays usable offline.
- "Tải bản cập nhật (xxx MB)" downloads and verifies the signature. Then "Cài đặt bản cập nhật" opens the modal "Đã có bản cập nhật (xxx MB), cập nhật ngay?" with Cập nhật ngay and Để sau. Install then restarts the app. On Linux the system asks for administrator permission.
- Progress: while downloading, the app shows a progress bar with a percentage and "đã tải X MB / Y MB", fed by the updater's download events (started with total size, progress with chunk size, finished). If the total size is unknown, the bar is indeterminate and shows only MB downloaded. The install step has no percentage from the operating system, so the app shows "Đang cài đặt…" with an indeterminate bar, then restarts. Closing Settings does not cancel a running download (the state lives in app state, not in the screen). [Builder's call: whether "Tải" and "Cài đặt" are two separate steps as the user described, using download-then-install events.]
- The update logic is a pure module behind an interface (check, download, install, size formatting) so tests use a fake.

### Safety

- Database migrations already run at start; a new version only adds migrations. The plan keeps the rule "never edit a shipped migration".
- Capabilities: add only the updater and process-restart permissions the flow needs, to the main window.

## Parts left to the builder (marked as builder's calls)

- Exact mechanism of the channel switch (Cargo feature vs config overlay vs both).
- Exact file and script names, and the test layout.
- How the "DEV" icon files are generated from `app-icon.svg` (a script that renders all sizes and `.icns`/`.ico`).
- Pinned versions of `tauri-action` and the updater plugin.

## Calls made by the agent (not yet confirmed by the user)

- Windows installer installs per user (`installMode: currentUser`), so updating needs no administrator prompt. Linux `.deb` does need one.
- The first published release is `v0.1.0`; the update flow can only be proven end to end once a second release (for example `v0.1.1`) exists, so the plan includes publishing a throwaway second release for a manual check on macOS (the only platform the author can test; Windows and Linux are checked from CI output and by friends).
- The update modal shows version numbers and size only; release notes stay on the GitHub Release page.
- The user must do these by hand, once: generate the signing key pair, store `TAURI_SIGNING_PRIVATE_KEY` and its password as GitHub Secrets, keep a private backup of the key. The plan gives exact commands.
- Automated tests cover: version script, channel switch (dev has no updater), update state machine and progress with a fake updater, size and percent formatting, both languages. A real download and install is only a manual check.
- Risk [Unverified]: an unsigned macOS app updating itself in place. Tauri signs Apple Silicon builds ad hoc by default; the manual check on macOS decides whether more is needed.

## Approval

The user approved this design on 2026-11-20.
