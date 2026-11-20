# Update re-check and modal scroll Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development.

**Goal:** The update modal appears only at app start; a running app re-checks quietly and shows only the dot; the modal and the notes scroll and stay usable.
**Architecture:** see the spec. **Tech Stack:** Svelte 5 runes, TypeScript, Vitest, GitHub Actions.
**Spec:** `docs/superpowers/specs/2026-11-21-update-recheck-and-modal-scroll-design.md` (paths relative to `easy_mindmap_knowledge/`).

## Global Constraints
- `src/features/update/logic/` imports only its own files; UI-free.
- The modal never opens for a version other than the one the start-up check found; never during practice, review, checkpoint or over another prompt (existing rules stay).
- No new i18n key unless referenced by source and present in both languages.
- Before every push run `npm test` and `npm run check`. Commits: `type(scope): description` with Scope / What did / Reviewed / Tested; no AI attribution.

## Review Focus
- Start-up finds 0.2.3, user closes with "Để sau", a re-check later finds 0.2.4 while the app is open: no modal now; dot stays; next start shows the modal for 0.2.4.
- Start-up finds nothing, a re-check later finds an update: no modal; dot shows.
- A quiet re-check while downloading, ready or installing changes nothing.
- A re-check failure (offline) is silent and leaves the dot as it was.
- Long notes (30 bullets) in a short window: title and buttons still visible, notes scroll.

### Task 1: Controller (Codex)
**Files:** `src/features/update/logic/update-controller.svelte.ts` (+ `.test.ts`), `src/main.ts`
**Interfaces:**
- `UpdateController.promptVersion: string | null`; `checkAtStart(): Promise<void>` (silent check; sets `promptVersion = info.version` only when the status becomes `available`); `promptable` requires `info.version === promptVersion` in addition to today's conditions; `startRechecks(intervalMs?: number, schedule?: (fn: () => void, ms: number) => () => void): () => void` (default 6 h, default scheduler = `setInterval` returning a clear function) calling `void this.check({ silent: true })` each tick.
- Silent check (`check({ silent: true })`): runs only when the status is `idle`, `upToDate` or an error from a check; while `available`, downloading, ready, installing or an install error it is a no-op. From `upToDate` the status stays `upToDate` while it runs (never `checking`); a found update turns it into `available`; a null result keeps `upToDate`; a failure changes nothing (silent). `checkAtStart` is the first silent check made from `idle`, which keeps today's behaviour for that call. A non-silent check is unchanged (shows `checking`). Calls while downloading/ready/installing stay no-ops.
- [ ] Failing tests first: `checkAtStart sets promptVersion only when an update is available`; `a later check that finds a newer version is not promptable but hasUpdate`; `postponing the start-up version and a later newer find is not promptable`; `a silent re-check keeps the status while it runs`; `a silent re-check failure changes nothing`; `a silent re-check does nothing while an update is pending`; `a silent re-check from upToDate that finds an update turns it into available without showing checking`; `a non-silent check still shows checking`; `startRechecks ticks call a silent check and the returned stop function ends them`; existing tests stay green.
- [ ] Implement; `main.ts`: `await loadPostponed(); void services.updates?.checkAtStart(); services.updates?.startRechecks();`
- [ ] `npm test`, `npm run check`. Commit by the orchestrator.

### Task 2: Scrollable notes and modal usability (Sonnet, Svelte skills)
**Files:** `src/features/update/ui/UpdateNotes.svelte` (+ test), `UpdatePrompt.svelte` / `UpdateSection.svelte` and their tests only where needed
- [ ] Failing tests first: `UpdateNotes puts the list in a scroll region reachable by keyboard` (region role, `tabindex="0"`, accessible name from `update.notes.heading`, class with a max height and `overflow-y-auto`); `the prompt keeps its title and both buttons with 30 long notes` (the buttons are present and outside the scroll region).
- [ ] Implement; check with the real browser at a short height (use the Svelte autofixer and a manual look at 600 px and 400 px windows) and report.
- [ ] `npm test`, `npm run check`. Commit by the orchestrator.

### Task 3: CI hardening (orchestrator)
**Files:** `../.github/workflows/mindmap-build.yml`, `mindmap-release.yml`, `tests/release-config.test.ts`
- [ ] Failing contract test first: every `build` job has `timeout-minutes`, and the Linux install step uses `-o Acquire::Retries=3`.
- [ ] Implement; YAML check; commit.

### Task 4: Whole-branch review and release 0.2.3 (orchestrator and the user)
- [ ] Independent review of the branch (modal opens only for the start-up version; timer cleanup; no flicker).
- [ ] `CHANGELOG.md` section 0.2.3 in both languages (what changed for the user), `set-version.mjs 0.2.3`, `package-lock.json`, PR, CI, merge, tag `v0.2.3` (the user chose the number), verify the Release.
- [ ] User check from 0.2.2 or later: start the app, release a throwaway newer version, see only the dot while the app is open, the modal after a restart, and "Để sau" memory.
