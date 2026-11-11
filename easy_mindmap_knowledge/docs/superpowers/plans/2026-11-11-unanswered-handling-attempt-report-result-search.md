# Unanswered handling, attempt report (type 4) and result search/filter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add (A) a per-attempt "what to show for unanswered questions" practice option, (B) a type 4 "attempt" report button on the result page and the history past-attempt dialog, and (C) one search box plus a correct/wrong filter on both.

**Architecture:** A new `attempts.unanswered_display` column carries the choice from setup to result and history. Report type `attempt` extends the existing report pipeline (draft, row, DB, list, export); the DB needs a table rebuild because `reports.type` has a CHECK. Search/filter is a pure function in the practice feature plus one shared Svelte bar used by `PracticeResult` and `AttemptDetail`.

**Tech Stack:** Svelte 5 (runes), TypeScript, Tauri + SQLite migrations, Vitest + Testing Library, Tailwind. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-11-11-unanswered-handling-attempt-report-result-search-design.md`

## Global Constraints

- Default of the unanswered option is `reveal` (today's behavior). Old attempts and old saved options load as `reveal`.
- Option applies only to questions with no selected option; scoring is unchanged (unanswered = wrong).
- Exam (checkpoint) and review attempts always use `reveal`; the exam setup does not change.
- Type 4 report: type `attempt`, stores `attempt_id` and `source_screen` (`result` or `history`), one screenshot max, same body limit as other context reports.
- Search matches: question number equals the typed number, OR title contains the text, OR any option text contains the text; case- and diacritic-insensitive; never searches explanations or option notes. Filter: Tất cả / Đúng / Sai; unanswered counts as Sai. Original question numbers stay when filtered. `ExamBreakdown` is not filtered. Search state is not saved.
- Never edit a shipped migration; new migrations are `0006_*.sql` and `0007_*.sql`, registered in `src-tauri/src/lib.rs`.
- All user-visible text goes through i18n in BOTH `src/i18n/en.json` and `src/i18n/vi.json` (a test requires identical key sets and flags unused keys).
- Commit format: Conventional Commits `type(scope): description` with body sections **Scope:**, **What did:**, **Reviewed:**, **Tested:**. No AI attribution or co-author trailers.
- Run every command through `rtk` (for example `rtk npx vitest run <file>`). Work on a branch or worktree, never main; the user allows creating it.

## Review Focus

- Existing `reports` rows and image rows must survive the 0007 rebuild (including the `idx_reports_status_created` index).
- An attempt with every question unanswered, and one with none unanswered, under option 2.
- Search text that is only whitespace, only digits, or has Vietnamese diacritics; a number that matches no question.
- Filter and search that match nothing: empty message, count `0 / n`, no crash.
- A saved `practice_last_options` from before this change (no `unansweredDisplay`) loads as `reveal`.

---

## File Structure

- `src-tauri/migrations/0006_attempt_unanswered_display.sql` (new), `0007_reports_attempt_type.sql` (new); `src-tauri/src/lib.rs` (register both).
- `src/persistence/records.ts`, `repositories/attempts.ts`, `repositories/reports.ts`: new field and type.
- `src/features/practice/logic/unanswered.ts` (new): pure `hidesAnswers`.
- `src/features/practice/logic/result-filter.ts` (new): pure search/filter.
- `src/features/practice/ui/ResultSearchBar.svelte` (new): shared bar, exported from `features/practice/index.ts`.
- `src/features/practice/options.ts`, `session.svelte.ts`, `ui/PracticeSetup.svelte`, `ui/OptionReview.svelte`, `ui/PracticeResult.svelte`, `ui/PracticeScreen.svelte`.
- `src/features/history/ui/AttemptDetail.svelte`.
- `src/features/report/logic/report-draft.ts`, `ui/ReportDialog.svelte`, `ui/labels.ts`, `logic/export-format.ts`.
- `src/i18n/en.json`, `vi.json`; tests beside each file.

---

### Task 1: Persist `unanswered_display` on attempts

**Files:**
- Create: `src-tauri/migrations/0006_attempt_unanswered_display.sql`
- Modify: `src-tauri/src/lib.rs` (add migration version 6 after 0005), `src/persistence/records.ts` (`AttemptRow`), `src/persistence/repositories/attempts.ts` (`AttemptDb`, `toAttempt`, `create`)
- Test: `src/persistence/migrations.test.ts`, `src/persistence/repositories/attempts.test.ts` (existing; add cases)

**Interfaces:**
- Produces: `export type UnansweredDisplay = 'reveal' | 'answersOnly'` in `records.ts`; `AttemptRow.unansweredDisplay: UnansweredDisplay`. Every place that builds an `AttemptRow` (session `start`, `startReview`, `startExam`, test fixtures) must set it; review and exam use `'reveal'`.

- [ ] **Step 1: Write failing tests.** In `migrations.test.ts` add `describe('0006 attempt unanswered_display')` following the 0005 block: after applying 0001-0006, a pre-existing attempt row reads `unanswered_display = 'reveal'`; inserting `'bogus'` throws (CHECK). In `attempts.test.ts`: `create` with `unansweredDisplay: 'answersOnly'` then `get` returns `'answersOnly'`.
- [ ] **Step 2: Run** `rtk npx vitest run src/persistence` and confirm the new tests FAIL.
- [ ] **Step 3: Implement.** Migration: `ALTER TABLE attempts ADD COLUMN unanswered_display TEXT NOT NULL DEFAULT 'reveal' CHECK (unanswered_display IN ('reveal', 'answersOnly'));`. Register it in `lib.rs` like 0005. Add the column to `AttemptDb`, `toAttempt`, and the `INSERT` in `create` (new `$20`).
- [ ] **Step 4: Run** `rtk npx vitest run src/persistence` and `rtk npx tsc --noEmit -p .` (fix fixtures that now miss the field). Expected: PASS.
- [ ] **Step 5: Commit** `feat(persistence): store the unanswered-question display choice per attempt`.

### Task 2: Rebuild `reports` to allow type `attempt`

**Files:**
- Create: `src-tauri/migrations/0007_reports_attempt_type.sql`
- Modify: `src-tauri/src/lib.rs`, `src/persistence/records.ts` (`ReportType`), `src/persistence/repositories/reports.ts` (`counts` initial `byType`)
- Test: `src/persistence/migrations.test.ts`, `src/persistence/repositories/reports.test.ts` (existing; add cases)

**Interfaces:**
- Produces: `ReportType = 'question' | 'lesson' | 'system' | 'attempt'`; `counts().byType.attempt`.

- [ ] **Step 1: Write failing tests.** Migration test: apply 0001-0006, insert one `question` report and two `report_images` rows, apply 0007; both reports and images remain with identical values; `idx_reports_status_created` exists; inserting type `attempt` succeeds; type `bogus` still throws. Repo test: `counts()` after saving an `attempt` report returns `byType.attempt === 1`.
- [ ] **Step 2: Run** `rtk npx vitest run src/persistence`; confirm FAIL.
- [ ] **Step 3: Implement.** 0007: create `reports_new` with the 0005 columns and `CHECK (type IN ('question','lesson','system','attempt'))`, `INSERT INTO reports_new SELECT <explicit columns> FROM reports`, `DROP TABLE reports`, `ALTER TABLE reports_new RENAME TO reports`, recreate `idx_reports_status_created`. `report_images` is untouched (no foreign key). Register in `lib.rs`. Update the type and the `counts` initializer.
- [ ] **Step 4: Run** `rtk npx vitest run src/persistence`; expected PASS.
- [ ] **Step 5: Commit** `feat(persistence): allow the attempt report type`.

### Task 3: Attempt report in the report pipeline

**Files:**
- Modify: `src/features/report/logic/report-draft.ts`, `ui/ReportDialog.svelte`, `ui/labels.ts`, `logic/export-format.ts`, `src/i18n/en.json`, `vi.json`
- Test: `report-draft.test.ts`, `ReportDialog.test.ts`, `export-format.test.ts`, `ReportSummary`/filters tests (existing)

**Interfaces:**
- Produces: `ReportContext` gains `{ type: 'attempt'; attemptId: string; sourceScreen: string }`. `buildReportRow` returns `type: 'attempt'`, `attemptId`, `sourceScreen`, all other context fields null. `TYPE_KEY.attempt = 'report.type.attempt'`, `REPORT_TYPES` includes `'attempt'`.

- [ ] **Step 1: Write failing tests.** `buildReportRow` for an attempt context gives the row above; `validateDraft` allows 1 image and rejects 2 (`tooManyImages`); labels cover all four types in vi and en; export JSON for an attempt report has `type: 'attempt'` and `refs.attemptId`, and the format help text mentions `attempt`; `ReportDialog` with an attempt context shows the attempt title/placeholder and the screenshot area (not the system upload picker).
- [ ] **Step 2: Run** `rtk npx vitest run src/features/report src/i18n`; confirm FAIL.
- [ ] **Step 3: Implement.** Mirror the `lesson` entries: add the case in `buildReportRow`, the `TITLE`/`PLACEHOLDER` maps in `ReportDialog.svelte`, `TYPE_KEY`/`REPORT_TYPES`, the `type` description line in the export help text, and i18n keys (`report.type.attempt`, dialog title, placeholder) in both locale files. vi text for the type: "Báo cáo bài làm".
- [ ] **Step 4: Run** the same command; expected PASS.
- [ ] **Step 5: Commit** `feat(report): add the attempt report type`.

### Task 4: The practice option and the session

**Files:**
- Modify: `src/features/practice/options.ts`, `session.svelte.ts`, `ui/PracticeSetup.svelte`, `src/i18n/en.json`, `vi.json`
- Test: `options.test.ts`, `session.test.ts`, `ui/PracticeSetup.test.ts`

**Interfaces:**
- Consumes: `UnansweredDisplay`, `AttemptRow.unansweredDisplay` (Task 1).
- Produces: `PracticeOptions.unansweredDisplay: UnansweredDisplay` (default `'reveal'`); `PracticeSession.unansweredDisplay` getter (from the attempt row, so a resumed attempt keeps it); `startReview`/`startExam` write `'reveal'`.

- [ ] **Step 1: Write failing tests.** Options: defaults to `reveal`; saved options without the field load as `reveal`; an invalid value loads the whole defaults like other invalid fields; round-trip keeps `answersOnly`. Session: `start` with `answersOnly` stores it on the created attempt and the getter returns it; `resume` of that attempt returns it; review/exam sessions return `reveal`. Setup UI: a fieldset with legend `practice.setup.unansweredLegend` and two radios is shown with no time limit and with a time limit; it is directly after the report fieldset in the timed case; choosing option 2 and starting passes `unansweredDisplay: 'answersOnly'` to `start`; the remembered value pre-selects.
- [ ] **Step 2: Run** `rtk npx vitest run src/features/practice`; confirm FAIL.
- [ ] **Step 3: Implement.** Add the field to `PracticeOptions`, `DEFAULT_PRACTICE_OPTIONS`, `parse`. In `PracticeSetup.svelte` add `let unanswered = $state<UnansweredDisplay>('reveal')`, load it with the other last options, and render the fieldset after the `{#if timeMode === 'set'}` block (so it always shows, and sits right under the report fieldset when timed) using the existing `radio` class. Pass it in the options object. Session: set it on the `AttemptRow` in `start`/`startReview`/`startExam`; store `attempt.unansweredDisplay` in the constructor. i18n keys: legend "Xử lý các câu chưa làm sau khi kết thúc bài"; options "Hiển thị đáp án đúng và giải thích của các câu đó" and "Chỉ hiển thị đáp án, không hiển thị đáp án đúng"; matching en text.
- [ ] **Step 4: Run** `rtk npx vitest run src/features/practice src/i18n`; expected PASS.
- [ ] **Step 5: Commit** `feat(practice): choose what unanswered questions show after the attempt`.

### Task 5: Apply the choice when rendering results

**Files:**
- Create: `src/features/practice/logic/unanswered.ts`
- Modify: `ui/OptionReview.svelte`, `ui/PracticeResult.svelte`, `ui/PracticeScreen.svelte`, `src/features/history/ui/AttemptDetail.svelte`
- Test: `logic/unanswered.test.ts`, `ui/OptionReview.test.ts`, `ui/PracticeResult.test.ts`, `src/features/history/ui/AttemptDetail.test.ts`

**Interfaces:**
- Consumes: `UnansweredDisplay`; `PracticeSession.unansweredDisplay`.
- Produces: `hidesAnswers(selected: string[], display: UnansweredDisplay): boolean` (true only when `selected` is empty and `display === 'answersOnly'`); `OptionReview` prop `hideAnswers?: boolean` (default false); `PracticeResult` prop `unansweredDisplay?: UnansweredDisplay` (default `'reveal'`).

- [ ] **Step 1: Write failing tests.** `hidesAnswers` truth table (4 cases). `OptionReview` with `hideAnswers`: all options render, none has the correct/missed badge or green style, no option notes, no explanation, the "no answer" text still shows. `PracticeResult` with `answersOnly`: an unanswered item hides correct marks and the explanation (also in the fallback branch used when the catalog lacks the question), an answered wrong item still shows everything, and with `reveal` nothing changes. `AttemptDetail` follows `attempt.unansweredDisplay` the same way.
- [ ] **Step 2: Run** `rtk npx vitest run src/features/practice src/features/history`; confirm FAIL.
- [ ] **Step 3: Implement.** Pure helper, then `OptionReview`: when `hideAnswers`, `stateOf` returns `'none'` for every option and the explanation block is skipped. In `PracticeResult` compute `hideAnswers` per item with `hidesAnswers(item.selected, unansweredDisplay)` and skip `item.explanation` in the fallback branch; `PracticeScreen` passes `session.unansweredDisplay`. `AttemptDetail` passes `attempt.unansweredDisplay`. Export `hidesAnswers` from the practice index only if `AttemptDetail` needs it (it imports from `@/features/practice`).
- [ ] **Step 4: Run** the same command; expected PASS.
- [ ] **Step 5: Commit** `feat(practice): hide correct answers of unanswered questions when chosen`.

### Task 6: Search and filter logic

**Files:**
- Create: `src/features/practice/logic/result-filter.ts`
- Test: `src/features/practice/logic/result-filter.test.ts`

**Interfaces:**
- Produces:
  - `type ResultVerdict = 'all' | 'correct' | 'wrong'`
  - `interface ResultFilterItem { number: number; isCorrect: boolean; title: string; optionTexts: string[] }`
  - `filterResultItems(items: ResultFilterItem[], query: string, verdict: ResultVerdict): number[]` returning the matching `number`s in original order.

- [ ] **Step 1: Write failing tests**, one per rule: `'34'` matches number 34 and any title/option containing `34`; a title substring, case-insensitive; an option substring; diacritics (`'dap an'` matches `'đáp án'`); whitespace-only query matches everything; `verdict: 'wrong'` includes unanswered (`isCorrect: false`); verdict and query combine; no match returns `[]`; explanation text is not an input (type has no such field).
- [ ] **Step 2: Run** `rtk npx vitest run src/features/practice/logic/result-filter.test.ts`; confirm FAIL.
- [ ] **Step 3: Implement.** Normalize with `normalize('NFD')` minus combining marks, `đ`→`d`, lowercase, trim; number match is exact equality when the trimmed query is all digits.
- [ ] **Step 4: Run** the same file; expected PASS.
- [ ] **Step 5: Commit** `feat(practice): add result search and filter logic`.

### Task 7: The search bar on the result page and the history dialog

**Files:**
- Create: `src/features/practice/ui/ResultSearchBar.svelte`
- Modify: `ui/PracticeResult.svelte`, `src/features/history/ui/AttemptDetail.svelte`, `src/features/practice/index.ts` (export), `src/i18n/en.json`, `vi.json`
- Test: `ui/ResultSearchBar.test.ts`, `ui/PracticeResult.test.ts`, `src/features/history/ui/AttemptDetail.test.ts`

**Interfaces:**
- Consumes: `filterResultItems`, `ResultFilterItem`, `ResultVerdict` (Task 6).
- Produces: `ResultSearchBar` props `{ query: string; verdict: ResultVerdict; shown: number; total: number }` using `$bindable` for `query` and `verdict`. Labelled input (`aria-label` from i18n), three-option filter, a `role="status"` count "x / n câu", and the empty message `practice.result.noMatch`.

- [ ] **Step 1: Write failing tests.** Bar renders, binds both values, shows the count. `PracticeResult`: typing `2` leaves only question 2 (number kept as "Câu 2"); choosing Sai hides correct items and keeps unanswered; no match shows the empty message and `0 / n`; `ExamBreakdown` is unaffected (exam mode). Same behavior inside `AttemptDetail`.
- [ ] **Step 2: Run** `rtk npx vitest run src/features/practice src/features/history`; confirm FAIL.
- [ ] **Step 3: Implement.** In both lists compute `visible = $derived(new Set(filterResultItems(...)))` and render only visible items (keep each item's original number); state is local `$state`, so it resets on close. Place the bar above the list heading area. i18n keys for the input label/placeholder, the three filter labels, the count and the empty message in both locales.
- [ ] **Step 4: Run** the same command and `rtk npx tsc --noEmit -p .`; expected PASS.
- [ ] **Step 5: Commit** `feat(practice): search and filter questions on results and past attempts`.

### Task 8: Attempt report buttons

**Files:**
- Modify: `ui/PracticeResult.svelte`, `src/features/history/ui/AttemptDetail.svelte`
- Test: `ui/PracticeResult.report.test.ts`, `src/features/history/ui/AttemptDetail.report.test.ts` (existing; add cases)

**Interfaces:**
- Consumes: `ReportContext` `attempt` variant (Task 3); `attemptId` prop already on `PracticeResult`.

- [ ] **Step 1: Write failing tests.** `PracticeResult` with an `attemptId`: in the sticky bar a report button sits after "Về sơ đồ" and "Làm lại" (right side), opens the dialog with `{ type: 'attempt', attemptId, sourceScreen: 'result' }`, in practice, exam and review modes; it also shows when `actions` replaces the default buttons (review). Without `attemptId` it is not rendered. `AttemptDetail`: the footer has the button next to Close with `{ type: 'attempt', attemptId: attempt.id, sourceScreen: 'history' }`; submitting stores one `attempt` row.
- [ ] **Step 2: Run** `rtk npx vitest run src/features/practice src/features/history`; confirm FAIL.
- [ ] **Step 3: Implement.** Add `<ReportButton class="ml-auto" ...>` inside the sticky bar (outside the `actions`/default branch so it always shows), with `captureTarget` returning the page root element (new `bind:this`). In `AttemptDetail` render it in the footer row beside Close with `captureTarget` returning the list container.
- [ ] **Step 4: Run** the same command; expected PASS.
- [ ] **Step 5: Commit** `feat(report): report an attempt from the result page and history`.

### Task 9: Whole-branch verification

**Files:** none new.

- [ ] **Step 1: Run** `rtk npx vitest run` (full suite), `rtk npm run check`, `rtk npm run build`. Expected: all green, no unused i18n keys.
- [ ] **Step 2: Manual check** (user): in the app, start a practice with option 2 and leave questions blank, submit, confirm blank questions show options without marks; use search/filter on the result page and the history dialog; file an attempt report from both; open the Reports tab and see type "Báo cáo bài làm"; export reports.
- [ ] **Step 3: Report** the results faithfully, then request a branch review (`superpowers:requesting-code-review`).

---

## Self-review

- Spec coverage: A → Tasks 1, 4, 5; B → Tasks 2, 3, 8; C → Tasks 6, 7; exam/review fixed to `reveal` → Tasks 1, 4; history button → Task 8; migration safety → Task 2. No gaps.
- Names consistent: `UnansweredDisplay`, `unansweredDisplay`, `hidesAnswers`, `filterResultItems`, `ResultSearchBar`, `'attempt'` used identically across tasks.
- Calls made in the plan (not in the spec): the option value names `reveal` / `answersOnly`; two migrations (0006, 0007) instead of one.
