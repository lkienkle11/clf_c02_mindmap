# Update notifications and release notes in the app - design

Date: 2026-11-20. Status: draft, waiting for the user's approval. Builds on `2026-11-20-release-and-auto-update-design.md` (v0.1.0 and v0.1.1 are released with it).

## Intent and why

Today the production app checks for an update at start but tells nobody: the "update now?" modal only appears after the user opens Settings, presses download and presses install. A user who never opens Settings never learns that a new version exists. The update also carries no description, so a user cannot tell what changes. The user wants (1) the app to announce a new version by itself, (2) a visible marker on Settings while an update is pending, (3) the "what is in this version" text visible inside the app, in English and Vietnamese, and (4) the same text on the GitHub Release page, which many non-Vietnamese readers open.

## Goals

- A new version is announced by a modal shown once when the app starts (decided by the user: "A+B") and by a dot on the Settings tab that stays until the update is installed.
- The modal shows version, size and the notes of the new version in the language the user chose; "Cập nhật ngay" downloads (with the % bar), installs and restarts without opening Settings; "Để sau" is remembered for that version, so the modal does not come back for it (the dot stays).
- Settings shows the notes of a pending update and a "Có gì mới" history of every installed-or-older version, readable offline.
- One source of the text: `CHANGELOG.md`, both languages. The Release page shows English first, then Vietnamese. The app shows the chosen language and falls back to Vietnamese (the app default).

## Non-goals

- No automatic download or install without the user pressing "Cập nhật ngay" (bandwidth and trust).
- No notes in languages other than English and Vietnamese; no machine translation.
- No full Markdown rendering: notes are plain text bullet lists (avoids the XSS class fixed in the report feature).
- No change to the signing, platforms or workflow ordering of the release pipeline.

## Anti-goals (a failure even if it works)

- The modal opens while the user is inside a practice, review or checkpoint attempt, or on top of another modal (daily review prompt, resume prompt).
- The modal repeats for a version the user already postponed, or never appears again for a later version.
- A release is published without notes in both languages.
- A startup update check that fails (offline) shows an error or blocks the app.
- The development build shows any update UI.

## Constraints and verified facts

- Tauri's `Update` object exposes the release notes as `body` (from `notes` in `latest.json`); `rawJson` also carries the whole file. [Plugin API; the adapter test pins it with a fake.]
- `latest.json` is produced by `tauri-action`; the `finalize` job already rewrites it (adds `sizes`) before publishing, so adding `notes` there is under our control. The artifact signatures cover the installers, not `latest.json`.
- `repos.settings.get/set(key)` stores strings; used for `locale` and the daily-review prompt dates.
- The app default language is Vietnamese (`I18n` starts at `'vi'`); the saved choice overrides it.
- Existing modals: `DailyReviewModal` (shown on the tree view only when no unfinished attempt) and `ResumePrompt`. The header and the resume gate already hide themselves during `practice`, `review`, `checkpoint`.
- Feature folders may import only their own `logic/` (architecture test); the update feature's logic must stay UI-free.
- Installed versions 0.1.0 and 0.1.1 ignore `notes` in `latest.json`, so adding it is safe for them.

## Approaches considered

1. Notes only on the GitHub Release page, app links to it. Rejected: not readable in the app, fails when the repo is private or offline.
2. Notes only inside `latest.json`. Rejected alone: nothing to read after the update, and nothing offline.
3. (chosen) One `CHANGELOG.md`, both languages. The workflow copies the version's section into `latest.json` `notes` and the Release body; the app also bundles the file for the history. Cost: two small parsers (script and app), pinned by one contract test on the real file; release authors write each line twice (the agent drafts both).

## Design

### Source: `CHANGELOG.md` (in `easy_mindmap_knowledge/`)

```
## 0.1.2
### English
- Line.
### Tiếng Việt
- Dòng.
```

Versions newest first. Each section has exactly the two headings `### English` and `### Tiếng Việt`, in this order, each with at least one `- ` bullet. The Release page therefore reads English first.

### Release pipeline

- `verify` job (`check-release.mjs`) fails the release when `CHANGELOG.md` has no section for the tag's version or the section lacks either language.
- `finalize` job: copies the section into `latest.json` `notes` and sets the Release body with `gh release edit --notes-file`, before publishing.

### App

- `UpdateInfo` gains `notes: string | null` (from `update.body`).
- A pure parser turns a notes string or the bundled changelog into `{ en: string[], vi: string[] }` per version; `pickNotes(entry, locale)` returns the chosen language and falls back to Vietnamese, then to English, then to an empty list.
- `UpdateController` gains: `hasUpdate` (status is available, downloading, ready, installing, or an error from download or install), `promptable` (available, a version not yet postponed), `dismissedVersion` persisted through a small injected store (`get`/`set` of key `update_prompt_postponed_version`), `postpone()`, and `updateNow()` (download, then install, stopping at the first error).
- Prompt rules (component `UpdatePrompt`, mounted in `App.svelte`): open only when `promptable`, the view is not practice/review/checkpoint, no daily review modal and no resume prompt is open, and not already shown this run. It shows the question (version, size, notes), then the same progress view while downloading, "Đang cài đặt…" while installing, and the error with retry. Closing it or "Để sau" before the download starts calls `postpone()`.
- Dot: `AppHeader` shows a dot with a screen-reader text on the Settings tab while `hasUpdate`.
- Settings: `UpdateSection` shows the notes of the pending update (collapsible) and a new `WhatsNew` section lists the bundled history for versions up to the installed one (newest open, others collapsed).
- The progress bar markup moves to one shared component used by `UpdateSection` and `UpdatePrompt`.

## Parts left to the builder

Exact component names and layout classes, the dot's look (follows the existing red badge on the Reports tab), the exact wording of new i18n strings (both languages, same style as the existing `update.*` keys).

## Calls made by the agent (not yet confirmed by the user)

- Notes use the headings `### English` / `### Tiếng Việt`, not `en`/`vi`, so the Release page reads naturally.
- Fallback order is Vietnamese, then English, then nothing (never an empty modal body: the notes block is simply omitted).
- The prompt is shown at most once per app run, and after "Để sau" not again for that version even on later runs.
- The release check blocks only on the tag's own version section; older sections are backfilled once (0.1.0, 0.1.1) and not checked.
- Parsers are written twice (a `.mjs` script for CI, a TypeScript module for the app) because the app's architecture test forbids importing scripts; one contract test runs both on the real `CHANGELOG.md`.
- The first release with this feature is 0.1.2; 0.1.0 and 0.1.1 users receive it through the normal flow, and it shows its own notes only to 0.1.2 and later (older apps ignore `notes`).

## Approval

Not yet approved.
