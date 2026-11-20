# Update notifications and release notes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The production app announces a new version by itself (startup modal once, dot on Settings) and shows bilingual notes of the new version and a bundled "what is new" history, all from one `CHANGELOG.md` that also fills the Release page.

**Architecture:** `CHANGELOG.md` is the single source. CI scripts validate it and copy the tag's section into `latest.json` `notes` and the Release body. The app reads `notes` through the updater adapter, parses it with a pure TypeScript parser (also used for the bundled file via `?raw`), and `UpdateController` gains pending-update state and a persisted "postponed version". Two UI pieces (`UpdatePrompt`, `WhatsNew`) and a header dot use that state.

**Tech Stack:** Svelte 5 runes, TypeScript, Vitest, Node `.mjs` release scripts, GitHub Actions, Tauri updater plugin.

**Spec:** `docs/superpowers/specs/2026-11-20-update-notifications-and-notes-design.md` (all paths below are relative to `easy_mindmap_knowledge/`; the workflow is `../.github/workflows/mindmap-release.yml`).

## Global Constraints

- CHANGELOG format, newest version first: `## X.Y.Z`, then `### English` then `### Tiếng Việt`, each with at least one `- ` bullet line.
- Notes are plain text lines; no Markdown rendering, no `{@html}`.
- Language: chosen app language, fallback Vietnamese, then English, then omit the notes block.
- New `update.*` i18n keys exist in both `en.json` and `vi.json` and are referenced by non-test source (i18n test).
- `src/features/update/logic/` imports only its own files; UI-free (architecture test `tests/architecture/boundaries.test.ts`).
- Prompt never opens: during `practice`, `review`, `checkpoint`; over the daily review modal or resume prompt; more than once per app run; for a version already postponed. Never in the development channel (`services.updates` is null there).
- A failed startup check stays silent (existing `check({silent:true})`).
- Before every push run both `npm test` and `npm run check` (needs the rustup toolchain on PATH only for cargo).
- Commits: `type(scope): description` with body sections Scope / What did / Reviewed / Tested; no AI attribution lines.

## Review Focus

- Notes with only one language, an empty string, `null`, CRLF line endings or stray blank lines never break the modal; the body is omitted or falls back.
- Two versions in a row: postponing 0.1.2 must not suppress the prompt for 0.1.3.
- The startup check finishes while the user is mid-exam: the prompt must wait and show after they leave, not interrupt.
- Download fails inside the prompt: the user sees the error and a retry, the dot stays, the app keeps working.
- Offline start or a failing `settings` read/write: no prompt, no crash (treat an unreadable postponed version as "not postponed" only when the read succeeded; on read failure do not prompt).
- A `CHANGELOG.md` whose newest section does not match the app's `package.json` version is a release-time failure, not an app-time failure.

---

### Task 1: Changelog release script and the real CHANGELOG.md

**Files:**
- Create: `scripts/release/changelog.mjs`, `scripts/release/changelog.d.mts`, `scripts/release/changelog.test.ts`, `CHANGELOG.md`

**Interfaces:**
- Produces: `extractSection(text: string, version: string): string` (the section body from `### English` to just before the next `## `, trimmed; throws `Error` naming the version when the section is missing or either heading, or any bullet under it, is missing); CLI `node scripts/release/changelog.mjs <version> <CHANGELOG.md> <latest.json> <notes-out.md>` that writes the section to `notes-out.md` and sets `latest.json` `notes` to it.

- [ ] **Step 1: Write failing tests** in `changelog.test.ts`: `extractSection returns the English then Vietnamese block of the requested version`; `extractSection throws naming the version when it has no section`; `throws when the Vietnamese heading is missing`; `throws when a language has no bullet`; `accepts CRLF line endings`; `does not match 0.1.2 inside 10.1.2 or a prefix like 0.1.20`.
- [ ] **Step 2: Run** `npx vitest run scripts/release/changelog.test.ts`. Expected: FAIL (module missing).
- [ ] **Step 3: Implement** `extractSection` and the CLI in `changelog.mjs`, plus the types in `changelog.d.mts`. Match the version by an exact `## <version>` heading line.
- [ ] **Step 4: Write `CHANGELOG.md`** with sections 0.1.2 (the notification and notes feature, to be finalized at release time), 0.1.1 (version bump used to test updating), 0.1.0 (first release: tag-triggered release for macOS, Windows, Linux; in-app update; dev/prod split), each in both languages.
- [ ] **Step 5: Add a contract test** `changelog.test.ts` › `the real CHANGELOG.md has a valid section for every listed version` (runs `extractSection` over every `## ` heading of the file).
- [ ] **Step 6: Run** the file's tests. Expected: PASS.
- [ ] **Step 7: Commit** `feat(release): add the changelog source and its release script`.

### Task 2: Release check and workflow use the changelog

**Files:**
- Modify: `scripts/release/check-release.mjs` (+ `.d.mts`, `check-release.test.ts`), `../.github/workflows/mindmap-release.yml`, `docs/RELEASING.md`

**Interfaces:**
- Consumes: `extractSection` (Task 1).
- Produces: `checkRelease(tag, files, latestPublished)` where `files` gains `changelog: string` and fails when `extractSection(files.changelog, version)` throws.

- [ ] **Step 1: Write failing tests** in `check-release.test.ts`: `fails when the changelog has no section for the tag version`; `passes when the section has both languages`.
- [ ] **Step 2: Run** them. Expected: FAIL.
- [ ] **Step 3: Implement** the new `files.changelog` read in `main()` (`../../CHANGELOG.md`) and the check in `checkRelease`.
- [ ] **Step 4: Workflow `finalize`:** after `add-sizes`, add `node easy_mindmap_knowledge/scripts/release/changelog.mjs "${GITHUB_REF_NAME#v}" easy_mindmap_knowledge/CHANGELOG.md latest.json notes.md`, then `gh release edit "$GITHUB_REF_NAME" --notes-file notes.md` before the existing upload and publish lines (order: notes, upload `latest.json`, publish). Keep all action pins unchanged.
- [ ] **Step 5: Update `docs/RELEASING.md`:** add "write the CHANGELOG section (both languages) before tagging" to the release steps.
- [ ] **Step 6: Run** `npx vitest run scripts/release tests/release-config.test.ts`. Expected: PASS.
- [ ] **Step 7: Commit** `feat(release): require changelog notes and publish them in latest.json and the Release body`.

### Task 3: App-side notes parser

**Files:**
- Create: `src/features/update/logic/changelog.ts`, `src/features/update/logic/changelog.test.ts`

**Interfaces:**
- Produces:
  - `type LocalizedNotes = { en: string[]; vi: string[] }`
  - `parseNotes(text: string | null | undefined): LocalizedNotes` (reads `### English` / `### Tiếng Việt` blocks; bullet text without the `- `; empty arrays when absent or unparsable; CRLF safe)
  - `parseChangelog(text: string): { version: string; notes: LocalizedNotes }[]` (order as in the file)
  - `pickNotes(notes: LocalizedNotes, locale: 'en' | 'vi'): string[]` (chosen language, else `vi`, else `en`, else `[]`)
  - `entriesUpTo(entries, installedVersion: string): entries` (versions not newer than the installed one, using the numeric `X.Y.Z` order)

- [ ] **Step 1: Write failing tests:** `parseNotes reads both languages`; `parseNotes returns empty lists for null, empty string and text without headings`; `parseNotes handles CRLF and blank lines between bullets`; `pickNotes uses the chosen language`; `pickNotes falls back to Vietnamese then English then empty`; `parseChangelog returns every version in file order`; `entriesUpTo hides versions newer than the installed one`; contract: `the real CHANGELOG.md parses with both languages non-empty for every version` (import with `?raw`).
- [ ] **Step 2: Run** `npx vitest run src/features/update/logic/changelog.test.ts`. Expected: FAIL.
- [ ] **Step 3: Implement** the four functions (pure; no imports outside `logic/`).
- [ ] **Step 4: Run** the file's tests. Expected: PASS.
- [ ] **Step 5: Commit** `feat(update): parse bilingual release notes`.

### Task 4: Notes through the updater adapter

**Files:**
- Modify: `src/features/update/logic/updater-port.ts`, `src/features/update/tauri-updater.ts`, `src/features/update/tauri-updater.test.ts`, `src/testing/fake-updater.ts`

**Interfaces:**
- Produces: `UpdateInfo = { version: string; sizeBytes: number | null; notes: string | null }`; the fake's `update` option accepts `notes`.

- [ ] **Step 1: Write failing tests** in `tauri-updater.test.ts`: `check returns the update notes from body`; `check returns null notes when body is missing or not a string`.
- [ ] **Step 2: Run** them. Expected: FAIL.
- [ ] **Step 3: Implement** `notes: typeof update.body === 'string' && update.body !== '' ? update.body : null` in `check()`, update the port type and the fake; fix existing tests that build `UpdateInfo` (add `notes: null`).
- [ ] **Step 4: Run** `npx vitest run src/features/update`. Expected: PASS.
- [ ] **Step 5: Commit** `feat(update): pass the release notes from the updater`.

### Task 5: Controller state for pending update and postponing

**Files:**
- Modify: `src/features/update/logic/update-controller.svelte.ts`, `src/features/update/logic/update-controller.test.ts`, `src/app/composition.ts`
- Create: `src/features/update/logic/prompt-store.ts`

**Interfaces:**
- Produces: `interface PromptStore { get(): Promise<string | null>; set(version: string): Promise<void> }` and `export const POSTPONED_KEY = 'update_prompt_postponed_version'` in `prompt-store.ts`. `new UpdateController(port: UpdaterPort, store?: PromptStore)` gains: `hasUpdate: boolean` (derived: status in available/downloading/ready/installing, or error with stage download/install), `postponedVersion: string | null | undefined` (undefined = not read, null = nothing postponed), `loadPostponed(): Promise<void>` (on read failure leaves it undefined), `promptable: boolean` (derived: status available, `info` set, `postponedVersion !== undefined`, and `info.version !== postponedVersion`), `postpone(): Promise<void>` (stores the current `info.version`; a failed write is logged and still marks it postponed for this run), `updateNow(): Promise<void>` (`download()` then, if status is `ready`, `install()`).
- `composition.ts`: pass a store built from `repos.settings` (`get`: `settings.get(POSTPONED_KEY)`; `set`: `settings.set(POSTPONED_KEY, v)`) when an updater exists.

- [ ] **Step 1: Write failing tests** (fake port + in-memory store): `hasUpdate is true while available, downloading, ready and after a download error, false when up to date`; `promptable is false until the postponed version has been read`; `promptable is false for a postponed version and true again for a newer one`; `postpone stores the version and clears promptable`; `a failing store write still stops promptable for this run`; `a failing store read keeps promptable false`; `updateNow downloads then installs`; `updateNow stops after a download error and does not call install`.
- [ ] **Step 2: Run** `npx vitest run src/features/update/logic/update-controller.test.ts`. Expected: FAIL.
- [ ] **Step 3: Implement** as specified above.
- [ ] **Step 4: Wire `composition.ts`** and call `services.updates?.loadPostponed()` in `main.ts` before the silent check (`await` it, errors swallowed inside the controller).
- [ ] **Step 5: Run** `npm test`. Expected: PASS.
- [ ] **Step 6: Commit** `feat(update): track a pending update and a postponed version`.

### Task 6: Shared progress view, notes in the update section, strings

**Files:**
- Create: `src/features/update/ui/UpdateProgress.svelte`, `src/features/update/ui/UpdateNotes.svelte`
- Modify: `src/features/update/ui/UpdateSection.svelte`, `src/features/update/ui/UpdateSection.test.ts` (existing test file next to the component), `src/i18n/en.json`, `src/i18n/vi.json`, `src/features/update/logic/strings.test.ts`

**Interfaces:**
- Produces: `UpdateProgress` props `{ controller: UpdateController; headingId: string }` (the progress markup moved out of `UpdateSection`, unchanged behavior); `UpdateNotes` props `{ notes: string | null }` rendering `pickNotes(parseNotes(notes), i18n.locale)` as a `<ul>` of text (nothing when empty). New keys: `update.notes.heading` ("Có gì mới" / "What's new"), `update.whatsNew.heading`, `update.whatsNew.version` (`{version}`), `update.dot.label` (screen-reader text for the header dot).

- [ ] **Step 1: Write failing tests:** `UpdateNotes shows the chosen language and falls back to Vietnamese`; `UpdateNotes renders nothing for null notes`; `UpdateSection shows the notes of an available update`; existing `UpdateSection` progress tests still pass after extraction; `strings.test.ts` asserts the four new keys exist in both languages with exact wording.
- [ ] **Step 2: Run** `npx vitest run src/features/update`. Expected: FAIL (new tests).
- [ ] **Step 3: Implement** the two components, move the progress markup, add the notes block to the `available` state and to the confirm modal, add the strings in both languages.
- [ ] **Step 4: Run** `npx vitest run src/features/update src/i18n`. Expected: PASS.
- [ ] **Step 5: Commit** `feat(update): show release notes and share the progress view`.

### Task 7: Startup prompt

**Files:**
- Create: `src/features/update/ui/UpdatePrompt.svelte`, `src/features/update/ui/UpdatePrompt.test.ts`
- Modify: `src/features/update/index.ts`, `src/app/App.svelte`

**Interfaces:**
- Consumes: `controller.promptable`, `postpone()`, `updateNow()`, `UpdateProgress`, `UpdateNotes`.
- Produces: `UpdatePrompt` props `{ controller: UpdateController; blocked: boolean }` where `blocked` is true when the view is practice/review/checkpoint, a daily review modal is open, or the resume prompt is open. App passes `blocked` computed from `appState.view`, `appState.dailyPromptVisible`, `appState.resumeAttempt`.

- [ ] **Step 1: Write failing tests:** `opens when promptable and not blocked, showing version, size and notes`; `does not open while blocked and opens when unblocked`; `opens only once per run even if the controller becomes available again`; `Để sau stores the version and closes`; `closing before download counts as postponing`; `Cập nhật ngay shows the progress, then installing`; `a download error shows the message and a retry and does not postpone`; `renders nothing when updates are disabled`.
- [ ] **Step 2: Run** `npx vitest run src/features/update/ui/UpdatePrompt.test.ts`. Expected: FAIL.
- [ ] **Step 3: Implement** the component (uses `Modal`; closing during download or install is disabled) and mount it in `App.svelte` next to `ReviewPrompts` for `services.updates`; export it from `index.ts`.
- [ ] **Step 4: Run** `npm test && npm run check`. Expected: PASS, 0 errors.
- [ ] **Step 5: Commit** `feat(update): announce a new version with a modal at start`.

### Task 8: Dot on the Settings tab

**Files:**
- Modify: `src/app/AppHeader.svelte`; test in the existing header test file (`src/app/AppHeader.test.ts`, create if absent)

- [ ] **Step 1: Write failing tests:** `shows a dot with the screen-reader text on Settings while an update is pending`; `shows no dot when up to date or when updates are disabled`.
- [ ] **Step 2: Run** the test. Expected: FAIL.
- [ ] **Step 3: Implement** the dot after the Settings label (`aria-hidden` dot plus `sr-only` text `update.dot.label`), following the style of the Reports badge, driven by `services.updates?.hasUpdate`.
- [ ] **Step 4: Run** `npm test && npm run check`. Expected: PASS.
- [ ] **Step 5: Commit** `feat(update): mark Settings while an update is pending`.

### Task 9: "What is new" history in Settings

**Files:**
- Create: `src/features/update/ui/WhatsNew.svelte`, `src/features/update/ui/WhatsNew.test.ts`
- Modify: `src/features/update/index.ts`, `src/features/settings/ui/SettingsScreen.svelte` (+ its test)

**Interfaces:**
- Produces: `WhatsNew` props `{ installedVersion: string; changelog?: string }` (default: the bundled file via `import changelog from '../../../../CHANGELOG.md?raw'`); shows `entriesUpTo` newest first, newest open, others collapsed, notes via `pickNotes`.

- [ ] **Step 1: Write failing tests:** `lists only versions up to the installed one, newest first`; `shows the chosen language`; `shows nothing when the changelog is empty`; `SettingsScreen renders the history only in the production build (services.updates set)`.
- [ ] **Step 2: Run** them. Expected: FAIL.
- [ ] **Step 3: Implement** and mount `WhatsNew` below `UpdateSection` inside the `services.updates` block, passing the version already imported in `SettingsScreen`.
- [ ] **Step 4: Run** `npm test && npm run check`. Expected: PASS.
- [ ] **Step 5: Commit** `feat(update): show the version history in Settings`.

### Task 10: Whole-branch verification and release 0.1.2 (manual with the user)

- [ ] **Step 1:** Run `npm test`, `npm run check`, `cargo check` and `APP_CHANNEL=production cargo check` (rustup toolchain on PATH); build the dev app and confirm no update UI.
- [ ] **Step 2:** Finalize the 0.1.2 section of `CHANGELOG.md` (both languages), `node scripts/release/set-version.mjs 0.1.2` plus `package-lock.json` by hand, PR, CI green, merge (user), tag `v0.1.2` (user's permission), watch the workflow, check the Release body (English first) and `latest.json` `notes`.
- [ ] **Step 3 (user):** apps 0.1.0 and 0.1.1 ignore `notes`, so they update to 0.1.2 with the old Settings flow only. Install 0.1.2, then release a throwaway 0.1.3 (its own CHANGELOG section, both languages) and, with 0.1.2 installed, check: the startup modal with notes, "Để sau" memory across restarts, the dot on Settings, "Cập nhật ngay" end to end, and the "Có gì mới" history. Record results in `docs/RELEASING.md`.
