# Update re-check while running, modal only at start, scrollable modal - design (short)

Date: 2026-11-21. Status: approved by the user on 2026-11-21. Builds on `2026-11-20-update-notifications-and-notes-design.md`. Release number chosen by the user: 0.2.3.

## Intent
Today a new version found while the app is open can pop the update modal over the user's work (for example when they open Settings, which checks), and the app never looks again while it stays open, so the Settings dot appears only after a manual look. The user wants: the modal only at app start; while the app runs, only the dot and the Settings screen tell about a new version; and a modal that is easy to use even with long notes.

## Goals
- The update modal opens only for the update found by the check made when the app starts. An update found later (Settings visit or a periodic re-check) shows the dot on Settings and the update section in Settings, never the modal, until the next app start.
- While the app stays open it re-checks quietly every 6 hours, so the dot appears without the user visiting Settings.
- A quiet re-check never makes the visible state flicker (no "checking" text, the dot does not disappear).
- "Để sau" keeps its meaning: the modal does not come back for that version, the dot stays; a newer version is announced again at the next start.
- The modal is easy to use: long release notes scroll inside their own area (the area can be reached and scrolled with the keyboard), and the title and the buttons stay visible at every window height. Same for the notes in the Settings confirmation modal and the Settings update section.
- CI: the build jobs get a time limit and `apt-get` retries, so a stuck mirror fails fast instead of hanging.

## Non-goals
- No automatic download or install. No change to signing, release notes format or the release pipeline.
- No native OS notification. No re-check on window focus (only the 6-hour timer).

## Anti-goals
- The modal opening while the user works because of a later check.
- The prompt text or version changing under the user's eyes because of a background re-check while the modal is open.
- A re-check that hides an update already found, or that disturbs a download or an install in progress.

## Constraints and facts
- `UpdateController.check({ silent })` is shared in flight, is a no-op while downloading, ready or installing, and today sets `checking` on every run; `promptable` is derived from status, info and the postponed version; `UpdatePrompt` opens once per run when `promptable && !blocked`.
- `Modal.svelte` already scrolls its body (`overflow-auto`) and pins the footer; the notes list itself has no height limit and no keyboard access.
- `main.ts` calls `await services.updates?.loadPostponed(); void services.updates?.check({ silent: true })` at start; the controller exists only in the production channel.

## Approaches considered
1. (chosen) The controller remembers which version the start-up check found (`promptVersion`); the prompt opens only for that version. A quiet re-check keeps the visible status while it runs and only applies its result.
2. Do not run any check after start. Rejected: the dot would never appear without a Settings visit.
3. Show a banner instead of a dot. Rejected by the user's request (the dot).

## Design
- `UpdateController`: `promptVersion: string | null` set by `checkAtStart()` (a silent check; sets it only when the result is `available`). `promptable` additionally requires `info.version === promptVersion`.
- A silent re-check runs only while the status is `idle`, `upToDate` or a failed check; if an update is already pending (`available`, downloading, ready, installing, install error) it does nothing, so the version the user sees is always the one that will be downloaded, and a still newer version is found at the next start. While it runs from `upToDate` the status stays `upToDate` (no flicker); success turns it into `available`; failure changes nothing. A non-silent check (Settings visit) keeps today's behaviour.
- `startRechecks(intervalMs = 6 h)` starts a timer calling `check({ silent: true })` and returns a stop function; `main.ts` calls `checkAtStart()` then `startRechecks()`.
- `UpdateNotes` renders the list inside a region with `max-height: 40vh`, vertical scroll and `tabindex="0"`, labelled by the existing "What's new" string; the prompt and the Settings modal/section use it.
- CI: `timeout-minutes: 25` on the build jobs of both workflows, and `apt-get` with `-o Acquire::Retries=3`.

## Parts left to the builder
Exact class names and padding of the scroll region; scheduler injection for the timer test.

## Calls made by the agent (not yet confirmed)
- 6 hours between re-checks; a failed quiet re-check is silent.
- An update already pending is never replaced by a re-check (simplest way to keep the shown version equal to the downloaded one).
- The release is a patch-size feature; the user chose the number 0.2.3.

## Approval
The user approved this design on 2026-11-21.
