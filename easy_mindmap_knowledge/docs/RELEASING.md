# Releasing AWS CLF-C02 Mindmap

**Tom tat (tieng Viet):** Ban phat hanh duoc tao tu dong khi ban day mot tag `vX.Y.Z` len GitHub. Lan dau, ban tao khoa ky cap nhat, dan khoa cong khai vao `src-tauri/tauri.production.conf.json`, dat hai secret tren GitHub va bat bao ve cho tag `v*`. Moi lan phat hanh: chay `node scripts/release/set-version.mjs X.Y.Z`, commit, tao tag `vX.Y.Z`, roi `git push origin vX.Y.Z`. Ung dung chua duoc ky boi Apple hay Microsoft nen lan cai dau tien se co canh bao; cach mo ung dung duoc ghi ben duoi. Ban dev la ung dung rieng (Dev), co du lieu rieng va khong tu cap nhat.

All commands run from the `easy_mindmap_knowledge` folder unless stated otherwise.

## One-time setup

1. Generate the updater signing key:

   ```bash
   npx tauri signer generate -w ~/.tauri/clf-mindmap-updater.key
   ```

   Choose a password when asked. The command prints the public key and writes the private key to `~/.tauri/clf-mindmap-updater.key`.

2. Put the public key into `src-tauri/tauri.production.conf.json`, replacing the placeholder at `plugins.updater.pubkey`. The release check refuses to run while the placeholder is still there.

3. Set the two GitHub secrets (run from the repository, replace the path if you used another one):

   ```bash
   gh secret set TAURI_SIGNING_PRIVATE_KEY < ~/.tauri/clf-mindmap-updater.key
   gh secret set TAURI_SIGNING_PRIVATE_KEY_PASSWORD
   ```

   The second command asks for the password on a prompt. Never paste either value into a workflow file, an issue or a log.

4. Back up the private key file and its password in a private place (a password manager or an encrypted drive). If the key is lost, installed apps can never update again: users would have to install a new build by hand.

5. Protect `v*` tags on GitHub: Settings, Rules, Rulesets, New tag ruleset, target pattern `v*`, and enable "Restrict deletions" and "Restrict updates" (also restrict creations to maintainers). A release tag must never be moved or re-created after the app has been published.

## How to release

```bash
node scripts/release/set-version.mjs X.Y.Z
git add -A
git commit -m "chore(release): X.Y.Z"
git tag vX.Y.Z
git push origin vX.Y.Z
```

`set-version.mjs` updates the version in `package.json`, `src-tauri/tauri.conf.json`, `src-tauri/Cargo.toml` and `src-tauri/Cargo.lock` together. Push the branch with the version commit as well, so the tag points at a commit that is on the main line.

The `mindmap-release` workflow then:

1. in the `verify` job (run once, before any build), runs `scripts/release/check-release.mjs`, which fails unless the tag is `v` plus the shared version of the four files, the version is greater than the latest published release, and the updater public key is real;
2. in the `build` job (after `verify`), runs `npm test` and `npm run check`;
3. builds and signs each platform and uploads the files and `latest.json` to the GitHub release;
4. in the `finalize` job, adds the asset sizes to `latest.json` and uploads it again.

If the check fails, fix the cause, delete the tag locally and on GitHub (only possible while no release exists, or after you lift the tag rule), and tag again.

## If a release fails halfway

- A failed job can be re-run with "Re-run failed jobs" on the workflow run. `verify` is not repeated, so the version check does not run again.
- A full re-run ("Re-run all jobs") after one platform has already published fails the version check on purpose, because that version is now the latest published release. In that case delete the partial GitHub Release and the tag (on GitHub and locally), fix the cause, and tag again.
- The `finalize` job fails on purpose when `latest.json` lacks a platform (darwin-aarch64, darwin-x86_64, windows-x86_64 or linux-x86_64), so a release without an update path for some system never looks successful.

## What each platform downloads

| Platform | Installer you share | File the updater uses |
| --- | --- | --- |
| macOS (Apple Silicon and Intel, universal) | `.dmg` | `.app.tar.gz` and its signature |
| Windows | NSIS `.exe` installer (per-user install) | the NSIS `.exe` and its signature |
| Linux (Debian, Ubuntu) | `.deb` | the `.deb` and its signature |

`latest.json` lists these files with their signatures and sizes. Installed apps read it from `https://github.com/lkienkle11/clf_c02_mindmap/releases/latest/download/latest.json`.

## First install: warnings and how to open the app

The app is not signed or notarized with an Apple or Microsoft certificate, so the first install shows a warning. The update signature (Tauri key) protects later updates; it does not remove this first warning.

**macOS**

- Open the `.dmg` and drag the app to Applications.
- Right-click (or Control-click) the app and choose Open, then Open again in the dialog.
- If macOS still blocks it: System Settings, Privacy and Security, scroll to the message about the app, click "Open Anyway", and confirm.

**Windows**

- Run the installer. When SmartScreen says "Windows protected your PC", click "More info", then "Run anyway".

**Linux**

- Install the `.deb` with `sudo apt install ./name.deb` or open it in the software installer.
- Because the `.deb` installs system-wide, an update asks for the administrator (sudo/polkit) password when the app installs it.

## Dev builds

A development build is a separate app, "AWS CLF-C02 Mindmap (Dev)", with its own identifier and its own data folder. It never reads or changes the data of the production app and it does not check for updates. The `mindmap-build` workflow builds this development channel only (no secrets, no publishing).

## Rehearsal results

Fill this in after the rehearsal (task 12). Leave a box empty until it has really been checked.

- [ ] Release check fails with the placeholder public key
- [ ] Release check fails when the tag does not match the file versions
- [ ] Release check fails when the version is not greater than the latest published release
- [ ] Tag push builds macOS, Windows and Linux without errors
- [ ] The release contains the `.dmg`, the NSIS `.exe`, the `.deb`, the update files, the signatures and `latest.json`
- [ ] `latest.json` contains `sizes` for every platform after the `finalize` job
- [ ] macOS first install opened using right-click Open or Open Anyway
- [ ] Windows first install opened using More info, Run anyway
- [ ] Linux `.deb` installed and the administrator prompt appeared on update
- [ ] An installed older version found, downloaded and installed the newer version
- [ ] The Dev app kept its own data and did not offer updates
