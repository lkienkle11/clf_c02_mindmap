# Report feature (question / lesson / system reports) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Users can file question, lesson and system reports (text + screenshots + id references) from the app, see them in a Reports tab, and export them to a folder an AI agent can read and mark handled.

**Architecture:** A new `src/features/report/` feature (logic / ui) owns the dialog, button, Reports tab, export and status sync. Persistence follows the existing pattern: migration `0005`, a `reports` repository on the SQL executor, and a `ReportStorage` port (images and export-folder files) implemented with Tauri fs/dialog plugins in `src/persistence/` and faked in tests. Other features embed `ReportButton` and never the reverse; the report feature imports no other feature.

**Tech Stack:** Svelte 5 runes, TypeScript, Tailwind 4 tokens, vitest + @testing-library/svelte, Tauri v2 (`plugin-sql`, new `plugin-fs`, `plugin-dialog`), `html-to-image` for DOM capture (to be confirmed by Task 6's spike).

**Spec:** `docs/superpowers/specs/2026-11-10-report-feature-design.md`

## Global Constraints

- Svelte 5 runes only; run the svelte MCP `svelte-autofixer` on every touched `.svelte` file until clean.
- All UI strings in BOTH `src/i18n/en.json` and `src/i18n/vi.json` (flat keys, `report.*` prefix); Vietnamese is the primary UI language.
- Never edit a shipped migration; add `src-tauri/migrations/0005_reports.sql` and register it in `src-tauri/src/lib.rs`.
- Reference by id: never store question or lesson text in a report. Images are files, DB stores relative paths.
- No OS-specific hardcoded paths (macOS, Windows, Linux): use Tauri path APIs.
- The existing option "Khi đổi tab hoặc thu nhỏ cửa sổ" (`onHidden`) keeps its meaning. The new option "Khi mở báo cáo lúc đang làm bài" is per attempt, lives in `PracticeSetup` under the old one, default Đóng băng (freeze); exams default to run. Anti-cheat: hidden-window time is still governed by `onHidden` only.
- Report button: pale yellow, prominent (new tokens), label "Báo cáo" / "Report"; rich text max 1500 visible characters; system report max 3 images.
- Architecture rules in `tests/architecture/boundaries.test.ts` stay green: logic folders import only their own logic, `@/content/types`, `@/random/*` and `import type` from `@/persistence/records`; features import each other only via `index.ts`; `testing/` is imported only by tests.
- Imports use the `@/` alias. `npm test` and `npm run check` are green at the end of every task.
- Commit messages: Conventional Commits `type(scope): description` with body sections **Scope / What did / Reviewed / Tested**, and NO AI attribution or co-author trailer (the project `CLAUDE.md` overrides any default trailer).
- Work on a new branch, not on the current branch; creating it needs the user's permission at execution time.

## Review Focus

- Report on a question or lesson id no longer in the catalog: the Reports tab shows the id and still opens; nothing crashes.
- Body of exactly 1500 vs 1501 visible characters (markdown markers do not count); whitespace-only body is rejected.
- Capture fails (render error) or the user removes the preview: the report still submits without an image and shows an inline error for the failed capture.
- An image write fails during submit: no report row is created and the draft stays in the dialog so the user can retry.
- Escape or backdrop click while the "close the report?" confirmation is open closes only the top dialog; confirming discards the draft.
- Export folder missing/unwritable, a hand-edited JSON that is malformed, or equal `statusUpdatedAt` on both sides: error notice or ignore the file, DB unchanged, DB wins ties.
- Report dialog open in a timed attempt with the window hidden and `onHidden = run`: the clock keeps running.

## File Structure

- Create `src-tauri/migrations/0005_reports.sql`; modify `src-tauri/src/lib.rs`, `src-tauri/Cargo.toml`, `src-tauri/capabilities/default.json`, `package.json`.
- Modify `src/persistence/records.ts` (ReportRow types, `ClockState.onReport`), `src/persistence/index.ts`, `src/persistence/repositories/attempts.ts`.
- Create `src/persistence/repositories/reports.ts` (+test), `src/persistence/report-storage.ts` (port), `src/persistence/tauri-report-storage.ts`, `src/testing/fake-report-storage.ts`.
- Modify `src/app/composition.ts`, `src/app/app-state.svelte.ts`, `src/app/App.svelte`, `src/app/AppHeader.svelte`.
- Create `src/features/report/`: `index.ts`; `logic/report-draft.ts`, `logic/export-format.ts`, `logic/reconcile.ts`; `submit-report.ts`, `export-reports.ts`, `capture.ts`; `ui/ReportButton.svelte`, `ui/ReportDialog.svelte`, `ui/RichTextInput.svelte`, `ui/ScreenshotPicker.svelte`, `ui/ImageUpload.svelte`, `ui/ReportsScreen.svelte`, `ui/ReportDetail.svelte`, `ui/render-markdown.ts`; tests beside each.
- Modify clock: `src/features/practice/logic/attempt-clock.ts`, `session.svelte.ts`, `options.ts`, `ui/PracticeSetup.svelte`, `ui/PracticeSessionView.svelte`, `ui/PracticeResult.svelte`, `ui/KnowledgeOverlay.svelte`; `src/features/exam/start-exam.ts`; test fixtures `src/testing/{fake-services,history-env,review-env}.ts` (add `onReport`).
- Modify `src/features/history/ui/AttemptDetail.svelte`, `MissedQuestionsDialog.svelte`; `src/features/lesson/ui/LessonPanel.svelte`; `src/features/settings/ui/SettingsScreen.svelte`; `src/ui/tokens.css`; `src/i18n/en.json`, `vi.json`.

---

### Task 1: Migration 0005 and record types

**Files:**
- Create: `src-tauri/migrations/0005_reports.sql`
- Modify: `src-tauri/src/lib.rs` (register migration 5), `src/persistence/records.ts`
- Test: `src/persistence/migrations.test.ts`

**Interfaces:**
- Produces (records.ts): `ReportType = 'question'|'lesson'|'system'`; `ReportStatus = 'new'|'handled'`; `ReportRow { id; type; status; createdAt: number; statusUpdatedAt: number; body: string; appVersion: string; locale: 'en'|'vi'; sourceScreen: string|null; questionId: string|null; lessonId: string|null; attemptId: string|null; position: number|null; optionOrder: string[]|null; selected: string[]|null; isCorrect: boolean|null; images: string[] }` (`images` = relative paths in order). The `ClockState.onReport` type change belongs to Task 8; this task only adds the SQL column.
- Tables: `reports(id PK, type CHECK, status CHECK DEFAULT 'new', created_at, status_updated_at, body, app_version, locale, source_screen, question_id, lesson_id, attempt_id, position, option_order, selected, is_correct)`, `report_images(report_id, idx, path, PK(report_id, idx))`, index on `reports(status, created_at)`; `ALTER TABLE attempts ADD COLUMN clock_on_report TEXT NOT NULL DEFAULT 'freeze' CHECK (clock_on_report IN ('freeze','run'))`.

- [ ] **Step 1: Write failing tests** in `migrations.test.ts`: `'0005 creates reports and report_images and keeps existing attempts (clock_on_report defaults to freeze)'` (apply 0001..0004 with an attempt row, then 0005, assert the row survives with `clock_on_report = 'freeze'`); `'reports rejects an unknown type or status'` (CHECK violations throw).
- [ ] **Step 2: Run** `npx vitest run src/persistence/migrations.test.ts` → FAIL (no 0005 file; the existing "numbered without gaps" test is the guard).
- [ ] **Step 3: Write the migration and register it** in `lib.rs` as `version: 5, description: "reports"` mirroring the existing entries; add the types to `records.ts`.
- [ ] **Step 4: Run** the same command → PASS; run `npm test` and `npm run check` (nothing else changes in this task).
- [ ] **Step 5: Commit** `feat(reports): add reports migration and record types`.

### Task 2: Reports repository

**Files:**
- Create: `src/persistence/repositories/reports.ts`, `src/persistence/repositories/reports.test.ts`
- Modify: `src/persistence/index.ts`, `src/app/composition.ts` (`services.repos.reports`)

**Interfaces:**
- Produces: `createReportsRepo(db: SqlExecutor): ReportsRepo` with
  `create(row: Omit<ReportRow,'images'>, imagePaths: string[]): Promise<void>` (inserts `report_images` first, the `reports` row last, so a failure leaves no visible half-report);
  `get(id: string): Promise<ReportRow | null>`;
  `list(q: ReportQuery): Promise<{ items: ReportRow[]; total: number }>` where `ReportQuery { type?: ReportType; status?: ReportStatus; fromMs?: number; toMs?: number; text?: string; page: number; pageSize: number }` ordered newest first, `text` is a case-insensitive substring match on `body` with `%`/`_` escaped;
  `setStatus(id: string, status: ReportStatus, at: number): Promise<void>`;
  `counts(): Promise<{ total: number; newCount: number; byType: Record<ReportType, number> }>`;
  `listAll(): Promise<ReportRow[]>` (for export).

- [ ] **Step 1: Write failing tests** with `createNodeSqliteExecutor()`: round-trip of a question report (nullable fields, arrays, 2 images in order); `list` pagination (`page 2 of 25 rows, pageSize 10` returns rows 11-20 and `total 25`); filters by type/status/date/text including a body containing `50%_done` matched literally; `setStatus` updates `status` and `status_updated_at`; `counts`.
- [ ] **Step 2: Run** `npx vitest run src/persistence/repositories/reports.test.ts` → FAIL (module missing).
- [ ] **Step 3: Implement** the repository (JSON for arrays, `$n` placeholders, booleans as 0/1 like `attempts.ts`), export from `persistence/index.ts`, add `reports: ReportsRepo` to `Services['repos']` and `buildServices`.
- [ ] **Step 4: Run** the test and `npm test` → PASS.
- [ ] **Step 5: Commit** `feat(reports): add reports repository`.

### Task 3: ReportStorage port, Tauri plugins and fake

**Files:**
- Create: `src/persistence/report-storage.ts`, `src/persistence/tauri-report-storage.ts`, `src/testing/fake-report-storage.ts`, `src/persistence/report-storage.test.ts`
- Modify: `package.json` (`@tauri-apps/plugin-fs`, `@tauri-apps/plugin-dialog`), `src-tauri/Cargo.toml` (`tauri-plugin-fs`, `tauri-plugin-dialog`), `src-tauri/src/lib.rs` (register plugins), `src-tauri/capabilities/default.json`, `src/app/composition.ts`

**Interfaces:**
- Produces: `interface ReportStorage { saveImage(reportId: string, idx: number, png: Uint8Array): Promise<string>; readImage(relPath: string): Promise<Uint8Array>; defaultExportDir(): Promise<string>; pickExportDir(): Promise<string | null>; writeText(dir: string, rel: string, text: string): Promise<void>; writeBytes(dir: string, rel: string, bytes: Uint8Array): Promise<void>; readText(dir: string, rel: string): Promise<string | null> }`. `saveImage` returns a relative path such as `report-images/<reportId>-<idx>.png` under the app data dir. `createFakeReportStorage()` is an in-memory implementation with a `files` map and a `failNext(op)` hook.
- `Services` gains `reportStorage: ReportStorage`; `buildServices` defaults it to a stub whose methods reject with `Error('report storage unavailable')`; `createServices` passes the Tauri implementation.

- [ ] **Step 1: Write failing tests** for the fake against the contract: save then read returns the same bytes; `readText` of a missing file returns `null`; `saveImage` rejects after `failNext('saveImage')`; paths never contain `..` (the port rejects such `rel` values: test `writeText(dir, '../x', ...)` rejects).
- [ ] **Step 2: Run** the test → FAIL.
- [ ] **Step 3: Implement** port + fake + Tauri implementation (`appDataDir` + `join` from `@tauri-apps/api/path`, `writeFile/readFile/readTextFile/writeTextFile/mkdir` from plugin-fs, `open({directory:true})` from plugin-dialog); reject any `rel` containing `..` or an absolute path in the shared helper. Add dependency lines and plugin registration; capabilities: fs read/write/mkdir permissions scoped to `$APPDATA/report-images/**` and `$APPDATA/reports/**`.
- [ ] **Step 4: Manual verification (Tauri, cannot be unit tested):** run `npx tauri dev`, call `saveImage` once from a temporary button, confirm the file exists under the OS app-data directory, then remove the temporary button. Also confirm whether a folder picked with the dialog is writable in the same session; record the finding in the plan ledger. If a picked folder is NOT writable, restrict export to the default folder and say so in the README task (Task 13).
- [ ] **Step 5: Run** `npm test` and `npm run check` → PASS. Commit `feat(reports): add report storage port and Tauri fs/dialog plugins`.

### Task 4: Draft rules and report builder (pure logic)

**Files:**
- Create: `src/features/report/logic/report-draft.ts`, `src/features/report/logic/report-draft.test.ts`, `src/features/report/index.ts` (initially `export const feature = 'report' as const;`)

**Interfaces:**
- Produces: `MAX_BODY = 1500`, `MAX_SYSTEM_IMAGES = 3`; `visibleLength(markdown: string): number` (counts characters after removing `**`, `_`, leading `- `/`1. ` list markers and trimming; line breaks count as 1); `type ReportContext = { type:'question'; questionId: string; sourceScreen: string; attempt?: { attemptId: string; position: number; optionOrder: string[]; selected: string[]; isCorrect: boolean | null } } | { type:'lesson'; lessonId: string; sourceScreen: string } | { type:'system' }`; `interface ReportDraft { context: ReportContext; body: string; images: Uint8Array[] }`; `validateDraft(d: ReportDraft): { ok: true } | { ok: false; reason: 'empty' | 'tooLong' | 'tooManyImages' }`; `buildReportRow(d: ReportDraft, meta: { id: string; now: number; appVersion: string; locale: 'en'|'vi' }): Omit<ReportRow,'images'>`.

- [ ] **Step 1: Write failing tests** with the spec values: `visibleLength('**ab** _c_')` is 5; a body of 1500 chars is ok and 1501 is `tooLong`; whitespace-only is `empty`; system draft with 4 images is `tooManyImages`; question/lesson drafts allow 0 or 1 images (3 images → `tooManyImages`); `buildReportRow` for a question draft copies `questionId`, `attemptId`, `position`, `optionOrder`, `selected`, `isCorrect`, sets `status 'new'` and `statusUpdatedAt = createdAt = now`, and for a lesson draft leaves attempt fields `null`.
- [ ] **Step 2: Run** `npx vitest run src/features/report/logic/report-draft.test.ts` → FAIL.
- [ ] **Step 3: Implement** the functions in `report-draft.ts` (imports only `@/persistence/records` types, per the logic whitelist).
- [ ] **Step 4: Run** the test → PASS, then `npx vitest run tests/architecture`.
- [ ] **Step 5: Commit** `feat(reports): add report draft validation and row builder`.

### Task 5: Submit service

**Files:**
- Create: `src/features/report/submit-report.ts`, `src/features/report/submit-report.test.ts`
- Modify: `src/features/report/index.ts`

**Interfaces:**
- Consumes: `validateDraft`, `buildReportRow` (Task 4), `services.repos.reports`, `services.reportStorage`, `services.newId`, `services.now`.
- Produces: `submitReport(services: Services, draft: ReportDraft, meta: { appVersion: string; locale: 'en'|'vi' }): Promise<string>` (returns the report id); throws `ReportInvalidError(reason)` for invalid drafts and `ReportSaveError` when saving fails.

- [ ] **Step 1: Write failing tests** using fake services and the fake storage: valid question draft with 1 image creates a row (`status 'new'`) and one stored file whose path is in `images`; invalid draft throws `ReportInvalidError` and writes nothing; `failNext('saveImage')` makes it throw `ReportSaveError` and leaves zero rows and zero files; two images keep order `0,1`.
- [ ] **Step 2: Run** the test → FAIL.
- [ ] **Step 3: Implement**: validate, save images in order via `reportStorage.saveImage(id, idx, bytes)`, then `repos.reports.create(row, paths)`; on any save error delete nothing (orphan files are harmless, DB row not created).
- [ ] **Step 4: Run** the test and `npm test` → PASS.
- [ ] **Step 5: Commit** `feat(reports): add submit report service`.

### Task 6: Screenshot capture and spike

**Files:**
- Create: `src/features/report/capture.ts`, `src/features/report/capture.test.ts`
- Modify: `package.json` (`html-to-image`, pinned)

**Interfaces:**
- Produces: `captureFrame(el: HTMLElement, render?: Renderer): Promise<Uint8Array>` where `type Renderer = (el: HTMLElement) => Promise<Blob>` defaults to `html-to-image`'s `toBlob` with `{ pixelRatio: 1, filter: (n) => !(n instanceof HTMLElement && n.dataset.reportIgnore !== undefined) }`; throws `CaptureError` on a null/failed render.

- [ ] **Step 1: Write failing tests**: with an injected renderer returning a 3-byte blob, `captureFrame` returns those bytes; a renderer that rejects or returns `null` makes it throw `CaptureError`; the default filter excludes elements marked `data-report-ignore` (test the filter function exported as `captureFilter`).
- [ ] **Step 2: Run** `npx vitest run src/features/report/capture.test.ts` → FAIL.
- [ ] **Step 3: Implement**; add the dependency with an exact version at least two weeks old.
- [ ] **Step 4: Spike gate (manual, in `npx tauri dev`):** temporarily wire `captureFrame` to a debug button on a practice question panel; confirm the PNG shows correct Tailwind 4 colours (oklch/color-mix), the whole frame (not only the visible part when scrolled), and does not include any open modal. Record the result in the ledger. If it fails, switch the default `Renderer` to a Tauri-side capture and record the decision; do not continue to Task 7 until capture produces a correct image. Remove the debug button.
- [ ] **Step 5: Run** `npm test` → PASS. Commit `feat(reports): add DOM screenshot capture`.

### Task 7: ReportDialog, ReportButton and rich text input

**Files:**
- Create: `src/features/report/ui/ReportButton.svelte`, `ReportDialog.svelte`, `RichTextInput.svelte`, `ScreenshotPicker.svelte`, `ImageUpload.svelte` and a `.test.ts` for each
- Modify: `src/ui/tokens.css` (`--color-report`, `--color-report-hover`, `--color-report-foreground`, `--color-report-border`), `src/i18n/en.json`, `src/i18n/vi.json`, `src/features/report/index.ts`

**Interfaces:**
- Consumes: `submitReport` (Task 5), `captureFrame` (Task 6), `MAX_BODY`, `MAX_SYSTEM_IMAGES`, `visibleLength`, `ReportContext`, `Modal`, `Button`.
- Produces: `<ReportButton services context captureTarget? onopenchange? class? />` — renders the pale-yellow "Báo cáo" button and owns the dialog; `captureTarget: () => HTMLElement | null` is required for question/lesson contexts and omitted for system; `onopenchange(open: boolean)` fires when the dialog opens/closes (used by the clock in Task 8). `<ReportDialog services context open captureTarget onclose onsubmitted />`. Title and placeholder per type exactly as in the spec table (vi + en). `RichTextInput` is a textarea with a small toolbar (bold, italic, list) that wraps or prefixes the selection with markdown and shows a live counter `n/1500`; typing past 1500 is blocked by `maxlength` logic on `visibleLength`.

- [ ] **Step 1: Write failing tests** (render with `renderWithI18n`): clicking the button opens a dialog titled "Báo cáo câu hỏi sai"; the footer has "Nộp báo cáo" and "Đóng"; "Đóng", Escape and backdrop click each open the confirmation "Bạn có chắc chắn muốn đóng báo cáo không?" and the report stays open until confirmed; confirming closes and discards the draft; submit is disabled for an empty body and shows the counter at `1500/1500`; the capture button shows a thumbnail with delete and retake, a capture error shows an inline alert and submit still works; system type shows an upload control, accepts up to 3 PNG/JPEG files ≤ 5 MB each, rejects a 4th and a non-image with an alert; a successful submit calls `onsubmitted` and closes; `onopenchange` is called with `true` then `false`; the dialog element for capture is marked `data-report-ignore`.
- [ ] **Step 2: Run** `npx vitest run src/features/report/ui` → FAIL.
- [ ] **Step 3: Implement** the five components and tokens (button: pale yellow `#fde68a` fill, amber border, dark-brown text, contrast ≥ 7:1, min 44px target); strings under `report.*`. A failed submit (`ReportSaveError`) shows an alert and keeps the draft.
- [ ] **Step 4: Run** the tests, `svelte-autofixer` on each component, `npm run check`.
- [ ] **Step 5: Commit** `feat(reports): add report dialog, button and rich text input`.

### Task 8: Clock option for the report dialog

**Files:**
- Modify: `src/persistence/records.ts`, `src/persistence/repositories/attempts.ts`, `src/features/practice/logic/attempt-clock.ts`, `src/features/practice/session.svelte.ts`, `src/features/practice/options.ts`, `src/features/practice/ui/PracticeSetup.svelte`, `src/features/exam/start-exam.ts`, `src/testing/fake-services.ts`, `src/testing/history-env.ts`, `src/testing/review-env.ts`, `src/i18n/en.json`, `vi.json`
- Test: `attempt-clock.test.ts`, `session.test.ts`, `options.test.ts`, `PracticeSetup.test.ts`, `attempts.test.ts` (existing files in the same folders)

**Interfaces:**
- Produces: `ClockState.onReport: HiddenPolicy`; `startClock(limitMs, mode, now, onHidden, onReport = 'freeze')`; pure `pauseForReport(state: ClockState, elapsedMs: number): ClockState` (freeze-mode: unchanged; run-mode: `deadlineAt + elapsedMs`); `PracticeOptions.onReport: HiddenPolicy` (default `'freeze'`; options saved before this change load as `'freeze'`); `PracticeSession.beginReport(): void` and `PracticeSession.endReport(): void` (no-ops when the attempt is untimed or closed); `tick(elapsedMs)` applies `pauseForReport` instead of charging while a report is open and `clock.onReport === 'freeze'`; attempts repo persists `clock_on_report`; exam and checkpoint attempts start with `onReport 'run'`.

- [ ] **Step 1: Write failing tests**: `pauseForReport` for freeze-mode leaves `remainingMs`, for run-mode extends `deadlineAt` by the elapsed time; session tests with a fake clock: freeze-mode clock, report open 30 s with `onReport 'freeze'` → `remainingMs` unchanged, with `'run'` → reduced by 30 s; run-mode clock with 10 s left, report open 30 s with `'freeze'` → NOT expired, deadline moved; report open + `settleHidden(20000)` with `onHidden 'run'` and `onReport 'freeze'` in freeze-mode → remaining reduced by 20 s (hidden time still follows `onHidden`); `beginReport` on an untimed session changes nothing; `PracticeSetup` shows a second radio group "Khi mở báo cáo lúc đang làm bài" (Đóng băng thời gian / Thời gian tiếp tục trôi) under the hidden one, default Đóng băng, and the chosen value is saved in the last-options JSON and in the started attempt; the attempts repo round-trips `onReport`; a pre-existing attempt row reads as `'freeze'`.
- [ ] **Step 2: Run** `npx vitest run src/features/practice src/persistence` → FAIL.
- [ ] **Step 3: Implement** (the `onReport` column already exists from Task 1); add `onReport` to the three test fixtures; add the i18n keys `practice.setup.reportLegend|reportFreeze|reportRun|reportHint`.
- [ ] **Step 4: Run** `npm test` and `npm run check` → PASS.
- [ ] **Step 5: Commit** `feat(practice): add clock option for the report dialog`.

### Task 9: Question report buttons (5 places)

**Files:**
- Modify: `src/features/practice/ui/PracticeSessionView.svelte` (covers attempts, checkpoints and review sessions: left of "Thoát"), `src/features/practice/ui/PracticeResult.svelte` (per question), `src/features/history/ui/AttemptDetail.svelte` (per question), `src/features/history/ui/MissedQuestionsDialog.svelte` (per question), `src/features/practice/index.ts` if a shared helper is needed
- Test: the `.test.ts` beside each

**Interfaces:**
- Consumes: `<ReportButton>` from `@/features/report` (index only).
- Places: in-attempt button sits left of the "Thoát" button and uses `captureTarget = () => panel` (the question panel container) with context `{ type:'question', questionId, sourceScreen: 'practice'|'review'|'checkpoint', attempt: { attemptId: session.attemptId, position, optionOrder, selected, isCorrect: null } }` and `onopenchange` calling `session.beginReport()/endReport()`; result, history detail and missed dialog render one button per question list item with `captureTarget = () => that <li>`, `sourceScreen` `'result' | 'history' | 'missed'`, and `attempt` filled where known (result and history have it; the missed dialog passes `attempt` from `item.latestWrong` only when its attempt id is available, otherwise omits it).

- [ ] **Step 1: Write failing tests**: each of the five screens shows a "Báo cáo" button for a correct, a wrong and an unanswered question; clicking opens the question dialog and the submitted report row has the right `questionId`, `sourceScreen` and attempt references; in `PracticeSessionView` the button precedes "Thoát" in DOM order; opening the dialog calls `session.beginReport` and closing calls `endReport` (spy), and the button is also present in a review session.
- [ ] **Step 2: Run** `npx vitest run src/features/practice src/features/history` → FAIL.
- [ ] **Step 3: Implement** the placements; add `services` pass-through where a component lacks it (`AttemptDetail` and `MissedQuestionsDialog` already have it).
- [ ] **Step 4: Run** the tests, `svelte-autofixer` on touched components, `npx vitest run tests/architecture`.
- [ ] **Step 5: Commit** `feat(reports): add report buttons for questions`.

### Task 10: Lesson report buttons (3 places)

**Files:**
- Modify: `src/features/lesson/ui/LessonPanel.svelte` (button above "Bài kế tiếp"), `src/features/practice/ui/KnowledgeOverlay.svelte` (next to "Quay lại câu hỏi"), `src/features/practice/ui/PracticeSessionView.svelte` (pass `onreportchange` to the overlay), `src/features/review/ui/*` only if the overlay is mounted there
- Test: `LessonPanel.test.ts`, `KnowledgeOverlay` tests

**Interfaces:**
- `KnowledgeOverlay` gains `onreportchange?: (open: boolean) => void`; its report button uses context `{ type:'lesson', lessonId, sourceScreen: 'knowledge' }` where `lessonId` is the lesson currently shown (the overlay renders several lessons of a topic: one button per lesson article, each with `captureTarget = () => that article`). `LessonPanel` uses `sourceScreen: 'lesson'` and `captureTarget = () => the article element`.

- [ ] **Step 1: Write failing tests**: LessonPanel shows the lesson report button above the next/previous footer and the submitted row has `lessonId` and `type 'lesson'`; the overlay shows one report button per lesson article beside the close button area; opening a report from the overlay triggers `onreportchange(true)` then `(false)`; the dialog title is "Báo cáo kiến thức sai".
- [ ] **Step 2: Run** `npx vitest run src/features/lesson src/features/practice` → FAIL.
- [ ] **Step 3: Implement**; wire `PracticeSessionView` to call `session.beginReport()/endReport()` from the overlay's `onreportchange`.
- [ ] **Step 4: Run** tests and `svelte-autofixer`.
- [ ] **Step 5: Commit** `feat(reports): add report buttons for lessons and knowledge review`.

### Task 11: System report in Settings

**Files:**
- Modify: `src/features/settings/ui/SettingsScreen.svelte`, `src/features/settings/ui/SettingsScreen.test.ts` (create if absent), i18n files

- [ ] **Step 1: Write failing test**: Settings shows a "Báo cáo" button below the Language section; opening it shows the system dialog titled "Báo cáo hệ thống" with the upload control and no capture button; submitting a text with 2 images stores a `type 'system'` row with 2 image paths and no question/lesson ids.
- [ ] **Step 2: Run** `npx vitest run src/features/settings` → FAIL.
- [ ] **Step 3: Implement** using `<ReportButton context={{ type: 'system' }} />` below the language fieldset.
- [ ] **Step 4: Run** the test, `svelte-autofixer`, `npm test`.
- [ ] **Step 5: Commit** `feat(reports): add system report to settings`.

### Task 12: Reports tab

**Files:**
- Create: `src/features/report/ui/ReportsScreen.svelte`, `ReportDetail.svelte`, `render-markdown.ts` and tests
- Modify: `src/app/app-state.svelte.ts` (`Route` gains `{ view: 'reports' }`; `newReportCount` loaded in `refresh()` from `repos.reports.counts()`), `src/app/AppHeader.svelte` (item "Báo cáo" with a badge of new reports), `src/app/App.svelte`, `src/features/report/index.ts`, i18n files

**Interfaces:**
- `ReportsScreen({ services, appState })`: summary (counts by type and status), filters (type, status, date range, text search) with page size 10, pagination reset to page 1 on any filter change, list rows (type, status, date, first 100 chars of body, reference id), detail view (`ReportDetail`) with rendered body, screenshots (read via `reportStorage.readImage` and shown as data URLs), references as text, question or lesson title from the catalog when the id exists and the raw id otherwise, and a "Đánh dấu đã xử lý" / "Mở lại" button calling `repos.reports.setStatus`. `renderReportMarkdown(md: string): string` uses `marked`, escapes raw HTML and strips links to plain text (do not import the lesson feature).

- [ ] **Step 1: Write failing tests**: header shows the "Báo cáo" tab with the new-report badge; filters narrow the list, search matching nothing shows an empty message with page "0/0" and disabled paging; changing a filter on page 3 returns to page 1; marking handled updates the row, the badge and `statusUpdatedAt`; a report whose `questionId` is not in the catalog shows the raw id; a `<script>` in a body renders as text; a missing image file shows a placeholder instead of crashing.
- [ ] **Step 2: Run** `npx vitest run src/features/report src/app` → FAIL.
- [ ] **Step 3: Implement**; the screen follows the paging pattern of `MissedQuestionsDialog` and its pure `paginate` helper idea but keeps its own copy in `report/logic` only if needed (logic may not import another feature).
- [ ] **Step 4: Run** tests, `svelte-autofixer`, `npx vitest run tests/architecture`, `npm run check`.
- [ ] **Step 5: Commit** `feat(reports): add Reports tab with filters and detail view`.

### Task 13: Export, README for agents and status sync

**Files:**
- Create: `src/features/report/logic/export-format.ts`, `logic/reconcile.ts`, `src/features/report/export-reports.ts` and tests
- Modify: `src/features/report/ui/ReportsScreen.svelte` (Export button, export folder line), `src/features/report/index.ts`, i18n files

**Interfaces:**
- `toExportedReport(r: ReportRow): ExportedReport` (fields: `id, type, status, createdAt, statusUpdatedAt, body, locale, appVersion, refs { questionId, lessonId, attemptId, position, optionOrder, selected, isCorrect, sourceScreen }, images: string[]` as `images/<id>-<idx>.png`); `exportReadme(): string` (how to read a report, where question/lesson content lives by id, the required step "set `status` to `handled` and bump `statusUpdatedAt` after fixing", and that the app updates on the next sync); `parseExportedStatus(text: string): { status: ReportStatus; statusUpdatedAt: number } | null` (null for malformed JSON or unknown status); `reconcile(db: { id; status; statusUpdatedAt }[], files: Map<string, { status; statusUpdatedAt }>): { toDb: { id; status; at }[]; toFiles: { id; status; at }[] }` — newer wins, a tie keeps the DB value and writes nothing, ids missing on either side are skipped.
- `exportReports(services: Services, dir: string): Promise<void>` writes `README.md`, `index.json`, `<id>.json` for every report and copies images via `reportStorage.readImage`/`writeBytes`; `syncReports(services: Services, dir: string): Promise<{ updatedDb: number; updatedFiles: number }>` reads each `<id>.json`, applies `reconcile`, updates the DB via `repos.reports.setStatus` and rewrites only the changed files. The folder is saved in settings key `report_export_dir`; default `reportStorage.defaultExportDir()`.

- [ ] **Step 1: Write failing tests**: `reconcile` table (file newer → toDb; DB newer → toFiles; tie → neither; file for unknown id ignored); `parseExportedStatus` rejects malformed JSON and `status: "done"`; `exportReports` with the fake storage writes `README.md` containing the phrase `"status": "handled"`, `index.json`, one JSON and its images per report, and rewrites nothing outside `dir`; an agent edit (file status `handled` with a newer time) followed by `syncReports` marks the DB row handled; a malformed file is skipped without throwing; an unwritable folder (`failNext('writeText')`) rejects and leaves the DB unchanged.
- [ ] **Step 2: Run** `npx vitest run src/features/report` → FAIL.
- [ ] **Step 3: Implement**; the Reports screen runs `syncReports` when it opens (silently skipped if no folder has ever been exported) and after Export; the Export button shows the target folder, with a "Chọn thư mục" action using `pickExportDir`; failures show a dismissible alert.
- [ ] **Step 4: Run** `npm test` → PASS; manual check in `npx tauri dev`: export, edit one JSON to `handled`, reopen the tab, confirm the status changes.
- [ ] **Step 5: Commit** `feat(reports): export reports for agents and sync status`.

### Task 14: Release checks and docs

**Files:**
- Modify: `README.md` (reports section: what is stored, where, export folder, README for agents), `src/i18n` parity test if one exists (else add `src/i18n/parity.test.ts` asserting `en.json` and `vi.json` have identical key sets)

- [ ] **Step 1: Write failing test** `en.json and vi.json define exactly the same keys` (it fails if any `report.*` or `practice.setup.report*` key was added to only one file).
- [ ] **Step 2: Run** it → FAIL until the files agree; fix any missing key.
- [ ] **Step 3: Update the README** (data location per OS via the Tauri app data directory, export format, how an agent marks a report handled).
- [ ] **Step 4: Run** `npm test`, `npm run check`, `npm run build`, `npx vitest run tests/architecture`; then a manual pass in `npx tauri dev`: all 9 button placements, close-confirmation, timer behaviour with each option in a timed attempt, an export and a status round-trip.
- [ ] **Step 5: Commit** `docs(reports): document reports and release checks`.
