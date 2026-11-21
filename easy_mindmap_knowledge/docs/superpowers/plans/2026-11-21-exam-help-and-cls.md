# Exam Help, Show-Answer, CLS Fix and Sticky Start Bar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add opt-in answer reveal to practice, opt-in help powers (3 reveals, 3 "remove 2 wrong") to checkpoint exams, remove the layout shift in the question grid, and pin the Start button to the bottom of the setup screens.

**Architecture:** Help state (`help_mode`, per-question `revealed` / `eliminated`) is stored with the attempt in SQLite (migration 0009, defaults only) and mirrored in `PracticeSession`; uses left are derived from the rows, never stored as a counter. The question screen keeps its radios/checkboxes and decorates them in place; option colouring logic is extracted from `OptionReview.svelte` and shared.

**Tech Stack:** Svelte 5 (runes), TypeScript, Tailwind semantic tokens, Vitest, Tauri 2 + `tauri_plugin_sql` (SQLite).

**Spec:** `docs/superpowers/specs/2026-11-21-exam-help-and-cls-design.md` (read it first; this plan only records decisions the spec leaves to the implementer).

## Global Constraints

- Never edit a shipped migration (`0001`-`0008`). Add `src-tauri/migrations/0009_attempt_help.sql` and register it as version 9 in `src-tauri/src/lib.rs`. Columns are added with defaults only.
- `help_mode` is `'off' | 'reveal' | 'powers'`. Practice with the tick = `reveal`; checkpoint with the tick = `powers`; Capstone (`kind 'practice'` with `topicId` `capstone-exam-1`/`capstone-exam-2`) and Review are always `off`.
- Each power: 3 uses per attempt, one use per question. Reveal re-click is free. "Loại 2 đáp án sai" is refused on a revealed question; reveal after eliminate is allowed. A correct option is never eliminated. If an eliminated option was selected, the selection is cleared and saved.
- Scoring, thresholds, spaced-repetition stats and the result screen are unchanged.
- No ✓ (or any content that changes cell size) in the question number grid; aria-labels stay.
- All user-visible strings go in `src/i18n/vi.json` and `src/i18n/en.json` (the i18n test checks both files have the same keys). Use `i18n.t(key, params)` with the key written as a plain string literal: `src/i18n/i18n.test.ts` fails when an `en.json` key is not referenced literally in non-test `.ts`/`.svelte` code, and when a template-built key prefix (`` t(`prefix.${x}`) ``) is not listed in its `DYNAMIC` map. Add a key in the same task that first uses it.
- Tests first. Verify with `npx vitest run <file>` per task and `npm run check` and `npm test` before the last task. Run from `easy_mindmap_knowledge/`.
- Commit messages follow the project's Commitlint/Conventional Commits and the four required body sections (Scope / What did / Reviewed / Tested) from the repository `CLAUDE.md`. Never add AI attribution or a `Co-Authored-By` trailer.
- Work in an isolated worktree/branch (never on `main`) once the user chooses one.

## Review Focus

- Close the app after spending uses and resume: the same uses stay spent (Task 3, Task 12).
- App updated while an attempt is in progress: the old row resumes with `help_mode = 'off'`, nothing revealed (Task 1).
- A question with fewer than 2 wrong options: eliminate removes what exists, disabled if none (Task 2).
- Rapid double-click on a power: one use is spent, not two (Task 3).
- Revealing a question the user already answered wrong, then changing the answer to correct: graded correct (Task 12).

---

### Task 1: Migration 0009 and persistence of help state

**Files:**
- Create: `src-tauri/migrations/0009_attempt_help.sql`
- Modify: `src-tauri/src/lib.rs` (add the version 9 `Migration`, description `"attempt_help"`)
- Modify: `src/persistence/records.ts`, `src/persistence/repositories/attempts.ts`
- Test: `src/persistence/migrations.test.ts`, `src/persistence/repositories/repositories.test.ts`
- Modify (type fix only): every test/fixture that builds an `AttemptRow` or `AttemptQuestionRow` literal; `npm run check` lists them (about 20 files, e.g. `src/testing/fake-services.ts`).

**Interfaces:**
- Produces: `type HelpMode = 'off' | 'reveal' | 'powers'` exported from `@/persistence`; `AttemptRow.helpMode: HelpMode`; `AttemptQuestionRow.revealed: boolean`; `AttemptQuestionRow.eliminated: string[]`; repo methods `saveReveal(attemptId: string, position: number): Promise<void>` and `saveElimination(attemptId: string, position: number, eliminated: string[], selected: string[]): Promise<void>` (one UPDATE statement writing both columns).

- [ ] **Step 1: Write failing tests.** In `migrations.test.ts`, following how the 0008 test is written: a DB migrated to 0008 holding an in-progress attempt with questions, then migrated to 0009, reads back `help_mode = 'off'`, `revealed = 0`, `eliminated = '[]'`, and the `CHECK` rejects `help_mode = 'x'`. In `repositories.test.ts`: `create` + `questionsOf` round-trips `helpMode`, `revealed`, `eliminated`; `saveReveal` sets `revealed`; `saveElimination` writes both `eliminated` and `selected`.
- [ ] **Step 2: Run them** (`npx vitest run src/persistence`) and confirm they fail.
- [ ] **Step 3: Implement.** SQL: `ALTER TABLE attempts ADD COLUMN help_mode TEXT NOT NULL DEFAULT 'off' CHECK (help_mode IN ('off','reveal','powers'));`, `ALTER TABLE attempt_questions ADD COLUMN revealed INTEGER NOT NULL DEFAULT 0;`, `ALTER TABLE attempt_questions ADD COLUMN eliminated TEXT NOT NULL DEFAULT '[]';` with the same header comment style as 0006. Extend `AttemptDb`/`QuestionDb`, `toAttempt`/`toQuestion`, and the two INSERTs in `create` (add `help_mode`, `revealed`, `eliminated`); add the two repo methods.
- [ ] **Step 4: Fix the fixtures** flagged by `npm run check` by adding `helpMode: 'off'`, `revealed: false`, `eliminated: []`. No behaviour change.
- [ ] **Step 5: Run** `npx vitest run src/persistence` and `npm run check`; expected: pass, no type errors.
- [ ] **Step 6: Commit** (`feat(persistence): store attempt help state`).

### Task 2: Pure help rules

**Files:**
- Create: `src/features/practice/logic/help.ts`, `src/features/practice/logic/help.test.ts`

**Interfaces:**
- Produces:
  - `export const HELP_USES = 3`
  - `export type HelpQuestion = { revealed: boolean; eliminated: readonly string[] }`
  - `export function usesLeft(questions: readonly HelpQuestion[]): { reveal: number; eliminate: number }` (`HELP_USES` minus questions with `revealed`, minus questions with non-empty `eliminated`)
  - `export type HelpRefusal = 'off' | 'noneLeft' | 'revealed' | 'noWrong' | 'already'`
  - `export function revealCheck(mode: HelpMode, item: HelpQuestion, all: readonly HelpQuestion[]): null | HelpRefusal` (`null` = allowed; `'already'` is not an error: it means free no-op)
  - `export function eliminateCheck(mode: HelpMode, item: HelpQuestion, all: readonly HelpQuestion[], wrongCount: number): null | HelpRefusal`
  - `export function pickEliminations(optionKeys: readonly string[], correct: readonly string[], rng: () => number): string[]` (up to 2 distinct wrong keys, never a correct one)
- Consumes: `HelpMode` from Task 1.

- [ ] **Step 1: Write failing tests** named: `usesLeft counts revealed and eliminated questions separately`; `reveal is refused when mode is off`; `reveal in reveal mode is unlimited`; `reveal in powers mode is refused after 3 questions but free again on an already revealed one` (returns `'already'`); `eliminate is refused when mode is not powers`; `eliminate is refused on a revealed question`; `eliminate is refused after 3 questions`; `eliminate is refused when the question already has an elimination`; `eliminate is refused when there are no wrong options`; `pickEliminations never returns a correct key`; `pickEliminations returns min(2, wrong count) distinct keys`; `pickEliminations is deterministic for a seeded rng` (use `makeRng` from `@/random/seeded-random`).
- [ ] **Step 2: Run** `npx vitest run src/features/practice/logic/help.test.ts`; expect FAIL (module missing).
- [ ] **Step 3: Implement** the signatures above (`shuffle` from `@/random/seeded-random` for picking).
- [ ] **Step 4: Run**; expect PASS.
- [ ] **Step 5: Commit** (`feat(practice): add help rules`).

### Task 3: Session support for reveal and eliminate (including resume)

**Files:**
- Modify: `src/features/practice/session.svelte.ts`
- Test: `src/features/practice/session.test.ts` (practice cases), `session-exam.test.ts` (checkpoint and Capstone cases), `session-review.test.ts` (a review attempt always has `helpMode` `off`)

**Interfaces:**
- Consumes: Task 1 repo methods and `HelpMode`; Task 2 functions.
- Produces:
  - `SessionQuestion` gains `revealed: boolean` and `eliminated: string[]`.
  - `PracticeSession.helpMode: HelpMode` (readonly, from the attempt row).
  - `get helpLeft(): { reveal: number; eliminate: number }`.
  - `reveal(position: number): Promise<void>` and `eliminate(position: number): Promise<void>`; both resolve silently on a refusal (the UI disables the button, a refusal is a no-op, never an error) and throw only on a persistence failure after rolling memory back (same pattern as `select`).
  - `PracticeSession.start(...)` sets `helpMode` from a new `options.showAnswer` (Task 4 defines it) as `'reveal' | 'off'`; `startExam(services, input, ...)` gains `input.help?: boolean` and sets `'powers'` only when `kind === 'checkpoint' && help === true`, otherwise `'off'`; `startReview` always `'off'`.
  - `select` ignores keys in the question's `eliminated`.

- [ ] **Step 1: Write failing tests**: `practice start with showAnswer stores help_mode reveal`; `checkpoint start with help stores powers and capstone start with help stores off`; `reveal marks the question and persists it`; `reveal in powers mode refuses the 4th question and leaves the DB unchanged`; `two concurrent reveal calls on one question spend one use` (second call sees it already revealed); `eliminate stores two wrong keys and never a correct one`; `eliminate clears a selected option that was eliminated and persists the cleared selection`; `eliminate is refused after reveal`; `select ignores an eliminated key`; `a persistence failure in reveal rolls memory back and rejects`; `resume restores helpMode, revealed, eliminated and helpLeft` (build the session with `PracticeSession.resume` from rows saved by a first session); `resume of an attempt row with defaults has no help used`.
- [ ] **Step 2: Run** `npx vitest run src/features/practice/session.test.ts src/features/practice/session-exam.test.ts`; expect FAIL.
- [ ] **Step 3: Implement.** Map the new row fields in the constructor and `view`; `reveal`/`eliminate` follow `select`'s guard (`#closed`/`#exited`), call the Task 2 checks, update `#questions` before the await and roll back by identity as `select` does; the concurrent-call test requires that the in-memory state is updated synchronously before the await so a second call sees `revealed`. For the rng use `makeRng((services.now() + position) % 0x100000000)`.
- [ ] **Step 4: Run** the same command; expect PASS. Then `npm run check`.
- [ ] **Step 5: Commit** (`feat(practice): reveal and eliminate in sessions`).

### Task 4: Options and start wiring

**Files:**
- Modify: `src/features/practice/options.ts`, `src/features/exam/start-exam.ts`, `src/features/exam/options.ts` only if needed
- Test: `src/features/practice/options.test.ts`, `src/features/exam/start-exam.test.ts`

**Interfaces:**
- Produces: `PracticeOptions.showAnswer: boolean` (default `false`; saved options without it load as `false`; a non-boolean value falls back to the default options like the other fields); `startCheckpoint(services, groupIndex, options, onSubmitted, help = false)`; `startCapstoneExam` unchanged and always passes no help. The checkpoint help tick is deliberately NOT stored in `exam_last_options`.

- [ ] **Step 1: Write failing tests**: `parse keeps showAnswer`; `options saved before showAnswer existed load with showAnswer false`; `invalid showAnswer resets to defaults`; `startCheckpoint with help true creates a powers attempt`; `startCheckpoint default creates an off attempt`; `startCapstoneExam creates an off attempt`.
- [ ] **Step 2: Run** `npx vitest run src/features/practice/options.test.ts src/features/exam/start-exam.test.ts`; expect FAIL.
- [ ] **Step 3: Implement** in `options.ts` (extend interface, defaults, `parse`) and thread `help` through `start(...)` to `PracticeSession.startExam`.
- [ ] **Step 4: Run** the command; expect PASS; `npm run check` for fixtures needing `showAnswer: false`.
- [ ] **Step 5: Commit** (`feat(practice): carry help choices into attempts`).

### Task 5: Share option colouring between exam screen and results (refactor)

**Files:**
- Create: `src/features/practice/logic/option-state.ts`, `src/features/practice/logic/option-state.test.ts`
- Modify: `src/features/practice/ui/OptionReview.svelte`
- Existing safety net: `src/features/practice/ui/OptionReview.test.ts`

**Interfaces:**
- Produces: `export type OptionState = 'right' | 'wrong' | 'missed' | 'none'`; `export function optionState(correct: readonly string[], selected: readonly string[], key: string): OptionState` (same rules as today's `stateOf` without `hideAnswers`; the caller passes `'none'` handling itself); `export function badgeKey(state: Exclude<OptionState,'none'>): string[]` returning the existing i18n keys (`practice.result.badge.picked`, `.correct`, `.wrong`, `.missed`) to be joined as today.

- [ ] **Step 1: Run `npx vitest run src/features/practice/ui/OptionReview.test.ts` and confirm it is green** (the recoverable baseline). Do not edit before this.
- [ ] **Step 2: Write `option-state.test.ts`** covering the four states for single and multi answer.
- [ ] **Step 3: Implement** the module and make `OptionReview.svelte` call it; the rendered output must not change.
- [ ] **Step 4: Run** `OptionReview.test.ts` and `option-state.test.ts`; expect PASS. The final report for this task carries the labelled `Critical:/High:/Nice:/Skip:` assessment lines and a `Decision:` line, as the refactoring skill requires.
- [ ] **Step 5: Commit** (`refactor(practice): share option state logic`).

### Task 6: Question grid without layout shift

**Files:**
- Modify: `src/features/practice/ui/QuestionNav.svelte`
- Test: create `src/features/practice/ui/QuestionNav.test.ts`

**Interfaces:** props unchanged (`questions`, `index`, `ongo`).

- [ ] **Step 1: Write failing tests**: `answered cell contains only its number` (text content equals `"1"`, no `✓`); `answered and unanswered cells have identical class tokens for size` (compare the sizing classes, only colour classes differ); `aria-label still says answered/unanswered`.
- [ ] **Step 2: Run** `npx vitest run src/features/practice/ui/QuestionNav.test.ts`; expect FAIL on the first test.
- [ ] **Step 3: Implement:** remove the `✓` span and the `gap-1` it needed; answered stays `border-primary bg-muted`.
- [ ] **Step 4: Run**; expect PASS.
- [ ] **Step 5: Commit** (`fix(practice): stop question grid shifting on answer`).

### Task 7: Question panel shows revealed and eliminated state

**Files:**
- Modify: `src/features/practice/ui/QuestionPanel.svelte`
- Test: create `src/features/practice/ui/QuestionPanel.test.ts`; add strings to both i18n files

**Interfaces:**
- Consumes: `optionState`/`badgeKey` (Task 5), `SessionQuestion.revealed/eliminated` (Task 3). Props unchanged.
- Strings: `practice.help.eliminatedLabel` ("Đã loại" / "Eliminated", used as visually hidden text on struck options).

- [ ] **Step 1: Write failing tests**: `a revealed question marks correct options green with the correct badge`; `a revealed question marks a picked wrong option red with the wrong badge`; `the explanation appears only when revealed`; `inputs stay enabled after reveal and changing the answer calls session.select`; `eliminated options are disabled, struck through and carry the hidden "Đã loại" text`; `a not revealed question shows no badges and no explanation`; `reveal does not change the number of option rows`.
- [ ] **Step 2: Run** `npx vitest run src/features/practice/ui/QuestionPanel.test.ts`; expect FAIL.
- [ ] **Step 3: Implement** in the template: class and badge per option from `optionState` when `item.revealed`; `disabled` + `line-through opacity-60` when in `item.eliminated`; explanation block below the options using the catalog `question.explanation` (during the attempt there is no `SubmitResult`, so the result screen's `item.explanation` fallback does not apply) under the existing `practice.result.explanation` heading. When a revealed question has no `explanation`, show the new string `practice.help.noExplanation` ("Câu này chưa có giải thích" / "No explanation for this question yet") instead of an empty block; add a test `a revealed question without explanation shows the no-explanation text`. Keep `lang="en"` on question content as today.
- [ ] **Step 4: Run**; expect PASS; run `npx vitest run src/i18n`.
- [ ] **Step 5: Commit** (`feat(practice): show revealed and eliminated options in place`).

### Task 8: Help buttons in the session view

**Files:**
- Modify: `src/features/practice/ui/PracticeSessionView.svelte`
- Test: `src/features/practice/ui/PracticeSessionView.test.ts`; add strings to both i18n files

**Interfaces:**
- Consumes: `session.helpMode`, `session.helpLeft`, `session.reveal(position)`, `session.eliminate(position)`, `revealCheck`/`eliminateCheck`, `HELP_USES`.
- Strings: `practice.help.reveal` ("Hiển thị đáp án"), `practice.help.revealPower` ("Hiện đáp án đúng ({left}/{max})"), `practice.help.eliminate` ("Loại 2 đáp án sai ({left}/{max})"), `practice.help.noneLeft`, `practice.help.blockedRevealed`, `practice.help.noWrong`, `practice.help.announceRevealed`, `practice.help.announceEliminated`.

- [ ] **Step 1: Write failing tests**: `no help buttons when helpMode is off`; `reveal mode renders one "Hiển thị đáp án" button`; `powers mode renders both buttons with remaining counts`; `clicking reveal calls session.reveal for the current question`; `the eliminate button is disabled with a visible reason after the question was revealed`; `buttons disable when no uses are left`; `the status region announces the result of a help use`; `buttons sit in the bottom action row on the right` (assert `ml-auto` wrapper).
- [ ] **Step 2: Run** `npx vitest run src/features/practice/ui/PracticeSessionView.test.ts`; expect FAIL.
- [ ] **Step 3: Implement.** Compute disabled/reason from `revealCheck`/`eliminateCheck` for the current item; use the existing `announcement` status region; a failed call shows the existing `practice.selectFailed` alert. Buttons use `Button variant="secondary"`.
- [ ] **Step 4: Run**; expect PASS; `npx vitest run src/i18n`.
- [ ] **Step 5: Commit** (`feat(practice): help buttons in the session view`).

### Task 9: Practice setup tick

**Files:**
- Modify: `src/features/practice/ui/PracticeSetup.svelte`
- Test: `src/features/practice/ui/PracticeSetup.test.ts`; strings `practice.setup.showAnswer` ("Cho phép hiển thị đáp án") in both i18n files

- [ ] **Step 1: Write failing tests**: `the tick is unchecked by default`; `the tick loads the saved value`; `starting with the tick sends showAnswer true in the options saved and used` ; `starting without it sends false`.
- [ ] **Step 2: Run** `npx vitest run src/features/practice/ui/PracticeSetup.test.ts`; expect FAIL.
- [ ] **Step 3: Implement:** `let showAnswer = $state(false)`, loaded from `loadLastOptions` where the other options are loaded, included in the `PracticeOptions` passed to `PracticeSession.start`; a checkbox label in the style of the existing `radio` rows.
- [ ] **Step 4: Run**; expect PASS.
- [ ] **Step 5: Commit** (`feat(practice): opt-in show answer on setup`).

### Task 10: Checkpoint setup tick and rules text

**Files:**
- Modify: `src/features/exam/ui/ExamSetup.svelte`
- Test: `src/features/exam/ui/ExamSetup.test.ts`; strings `exam.setup.help` ("Sử dụng quyền trợ giúp"), `exam.setup.helpHint`, `exam.setup.ruleAnswersHelp` in both i18n files

- [ ] **Step 1: Write failing tests**: `the help tick shows only for checkpoint setup, not Capstone`; `unchecked by default and not remembered between mounts`; `starting a checkpoint with the tick calls startCheckpoint with help true`; `rules list shows the "answers only after submit" rule when unticked and the help rule when ticked`; `capstone setup text is unchanged`.
- [ ] **Step 2: Run** `npx vitest run src/features/exam/ui/ExamSetup.test.ts`; expect FAIL.
- [ ] **Step 3: Implement:** `let help = $state(false)`; render the checkbox (with hint of 3 + 3 uses) when `capstoneTopicId === null`; pass `help` to `startCheckpoint`; swap the `ruleAnswers` item for `ruleAnswersHelp` (with `{max}` = `HELP_USES`) while ticked.
- [ ] **Step 4: Run**; expect PASS.
- [ ] **Step 5: Commit** (`feat(exam): opt-in help powers on checkpoint setup`).

### Task 11: Sticky Start bar on both setup screens

**Files:**
- Create: `src/ui/StickyActionBar.svelte` (props: `children` snippet; wraps content in a bottom-fixed bar with border-top, surface background, safe-area bottom padding, same max width as the form), `src/ui/StickyActionBar.test.ts`
- Modify: `src/features/practice/ui/PracticeSetup.svelte`, `src/features/exam/ui/ExamSetup.svelte`
- Test: the two setup test files

- [ ] **Step 1: Write failing tests**: `StickyActionBar renders its children inside a fixed bottom container`; `PracticeSetup renders the Start button inside the sticky bar`; `ExamSetup renders the Start button inside the sticky bar`; `the form has bottom padding so the last control is not covered` (assert the padding class on the form).
- [ ] **Step 2: Run** `npx vitest run src/ui/StickyActionBar.test.ts src/features/practice/ui/PracticeSetup.test.ts src/features/exam/ui/ExamSetup.test.ts`; expect FAIL.
- [ ] **Step 3: Implement** the component and move each Start `<Button type="submit">` into it. The Start button remains inside its `<form>` so submit still works (the bar is positioned, not moved out of the form element). Keep the `lockedReason` and error `message` paragraphs in normal flow above the bar; the bar must not hide them.
- [ ] **Step 4: Run**; expect PASS.
- [ ] **Step 5: Commit** (`feat(ui): pin the Start button on setup screens`).

### Task 12: End-to-end behaviour, full suite and manual check

**Files:**
- Test: create `src/features/practice/help-flow.test.ts` (uses the same fakes as `session.test.ts` and `testing/fake-services.ts`)

- [ ] **Step 1: Write failing tests**: `reveal then change answer to correct is graded correct` and `score is identical with and without reveals for the same final selections`; `spend 3 reveals, rebuild the session from the stored rows (resume), a 4th reveal is refused`; `an attempt resumed after the migration has no help used` ; `capstone attempts offer no help whatever the options`.
- [ ] **Step 2: Run** `npx vitest run src/features/practice/help-flow.test.ts`; fix any failure by correcting the code from Tasks 1-4 (a failure here means an earlier task is wrong, not that this test is).
- [ ] **Step 3: Run the whole suite and type check:** `npm test` and `npm run check`; expected: all pass, no errors.
- [ ] **Step 4: Manual check with the `run` skill** in the dev app: practice with and without the tick; a checkpoint with the tick (use 3 reveals, 3 eliminates, close and reopen the app, resume); a Capstone shows no help; open the question grid and answer a question and confirm the cell does not change size; scroll the setup screens and confirm Start stays visible at 320px width and at desktop width.
- [ ] **Step 5: Commit** (`test(practice): help flow and resume coverage`).

---

## Execution decisions (user, 2026-11-21)

- Execution method: subagent-driven (with `diff-type-subagents`; the worker assignment table needs the user's approval before any delegation).
- Before starting: `git fetch origin --prune && git pull origin main --rebase`. If there is a conflict, STOP and let the user check; do not abort the rebase.
- Then rename the current branch to the new feature branch name (`git branch -m <new-name>`); work on that branch in the current checkout. A separate worktree is NOT created now (the user will decide later).
- After the last task: build the dev app so the user can test the new version. The production release is decided later.
