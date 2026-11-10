# Question Bank and Lesson Quality Audit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Workers are assigned by the `/diff-type-subagents` rules in the repository `CLAUDE.md`; the Claude Code session only orchestrates and reviews.

**Goal:** Make every question, answer, explanation, option note and lesson (EN and VI) agree with current official AWS documentation, and keep old attempt history consistent with the corrected answers.

**Architecture:** Two kinds of work. (1) App support, built test-first: content-integrity tests, a corrections log, and a startup step that re-grades submitted attempts against the live bank (the existing `reconcileStats` then rebuilds `question_stats` exactly). (2) A per-topic audit loop: workers audit read-only, the orchestrator verifies sources, the user approves each answer change, then approved changes are applied by script and by workers for prose.

**Tech Stack:** Svelte 5, TypeScript, Vitest (jsdom; `// @vitest-environment node` for SQLite tests), Tauri v2 with `@tauri-apps/plugin-sql`, `npx tsx` for scripts, Codex CLI, Agy CLI, Haiku 5.5.

**Spec:** `easy_mindmap_knowledge/docs/superpowers/specs/2026-11-10-question-bank-and-lesson-quality-audit-design.md` (section numbers below refer to it).

## Global Constraints

- Source of truth is current official AWS documentation. Blogs and study sites are leads only (spec 1, 4).
- A changed factual answer needs old answer, new answer, reason, official source URL, confidence, and the user's approval one by one (spec 4).
- Old history is re-graded with the new answer; old scores may change (spec 6).
- Question ids hash text and options, not answers. Edit only `correct` and `multi` of a question; text or option edits need an id mapping and are built only if the audit finds a real import bug (spec 5, 9b-3).
- `imported.json` is generated; after the first fix never re-run `scripts/import-cards` over it (spec 7).
- Migrations `0001`-`0005` are never edited (spec 5).
- Worker rules, models, fallback, task folders: `CLAUDE.md` section "Mixed-Vendor Subagents Flag". Never Opus; no Sonnet workers; read-only unless the user allows writes; no `ultra`/`max` effort.
- Task folder: `.superpowers/diff-agents/2026-11-10-question-bank-audit/<task-id>/` (git-ignored). Tracked deliverables: `easy_mindmap_knowledge/docs/superpowers/audits/2026-11-10-<topic>.md`.
- Project rules: Superpowers gates; `rtk`-prefixed commands; commit titles `type(scope): description` with body sections Scope / What did / Reviewed / Tested; no AI attribution or co-author trailer. **Every "Commit" step below happens only after the user says so, on a branch the user allowed (never `main`).**

## Review Focus

1. Re-grade run twice (every app start) changes nothing the second time: pinned in Task 5.
2. A question that is no longer in the bank keeps its stored grade and never crashes startup: Task 5.
3. A question changed from single to multi answer (or back): an old `selected` of the wrong size grades wrong, not crash: Task 3.
4. A checkpoint attempt's `passed` flips after re-grade, which can lock or unlock a checkpoint gate: Task 5 asserts the stored `passed`, Task 6 asserts `passedCheckpointGroups` changes accordingly.
5. In-progress attempts and ungraded rows are never touched, and a failed re-grade or backup does not stop the app from loading: Tasks 4 and 6.

## File Structure

| Path | Responsibility |
|---|---|
| `src/content/question-bank-integrity.test.ts` (new) | Structural rules for every bundled question |
| `src/content/answer-corrections.ts`, `.test.ts` (new) | Corrections-log type and `validateCorrections` |
| `content/review/answer-corrections.json` (new) | Audit trail of every approved answer change (starts as `[]`) |
| `src/features/practice/logic/regrade.ts`, `.test.ts` (new) | Pure `regradeAnswers`, `attemptScore` |
| `src/features/practice/session.svelte.ts` (modify ~L360) | Use `attemptScore` instead of inline scoring |
| `src/persistence/repositories/attempts.ts` (modify) + `attempts-regrade.test.ts` (new) | `applyRegrade` |
| `src/features/practice/answers-reconcile.ts`, `.test.ts` (new), `index.ts` (modify) | `reconcileAnswers` |
| `src/app/app-state.svelte.ts` (modify L73), `composition.ts` (modify) | Run re-grade before `reconcileStats` |
| `src/persistence/tauri-db-backup.ts` (new) | Backup before the first re-grade |
| `scripts/audit/check-import-answers.ts`, `apply-corrections.ts` + tests (new) | Import-bug detector; apply an approved corrections file |
| `scripts/import-cards/README.md` or header comment (modify) | Warn: do not re-run over fixed data |

---

## Part 1: App support (TDD, needs a branch the user allows)

### Task 1: Content-integrity tests for every question

**Files:** Create `src/content/question-bank-integrity.test.ts`.
**Interfaces:** Consumes `loadBundledCatalog(): Catalog` from `@/content/bundled`. Produces nothing.

- [ ] **Step 1: Write the test** with these cases over `catalog.questions` (all 798): `'every question has at least one correct key and every correct key is one of its option keys'`; `'option keys are unique inside a question'`; `'multi is true exactly when more than one key is correct'`.
- [ ] **Step 2: Run** `rtk npx vitest run src/content/question-bank-integrity.test.ts`. Expected: PASS. If it fails, the listed ids are real data bugs: write them to `import-bugs.json` in the audit task folder and tell the user; do not weaken the test or edit data.
- [ ] **Step 3: Commit** (when the user allows): `test(content): check every bundled question is structurally valid`.

### Task 2: Corrections log and validator

**Files:** Create `content/review/answer-corrections.json` (`[]`), `src/content/answer-corrections.ts`, `src/content/answer-corrections.test.ts`.
**Interfaces:** Produces `interface AnswerCorrection { questionId: string; oldCorrect: string[]; newCorrect: string[]; reason: string; sources: string[]; confidence: 'high' | 'medium' | 'low'; approvedOn: string }` (approvedOn `YYYY-MM-DD`) and `validateCorrections(log: unknown, questions: readonly Question[]): string[]` (empty array = valid).

- [ ] **Step 1: Write failing tests** (fixtures): valid log → `[]`; unknown `questionId`; bank `correct` differs from `newCorrect`; `oldCorrect` equals `newCorrect`; empty `sources`; a source not starting with `https://`; duplicate `questionId`; confidence outside the three values; not an array. Plus `'the real corrections log is valid against the bundled bank'` reading the JSON with `node:fs` (`// @vitest-environment node`).
- [ ] **Step 2: Run** the file; expected FAIL (module missing).
- [ ] **Step 3: Implement** `validateCorrections` in `answer-corrections.ts` (pure, no I/O).
- [ ] **Step 4: Run** the file; expected PASS.
- [ ] **Step 5: Commit** (when allowed): `feat(content): add the answer corrections log and its validator`.

### Task 3: Pure re-grade logic and shared scoring

**Files:** Create `src/features/practice/logic/regrade.ts`, `regrade.test.ts`; modify `src/features/practice/session.svelte.ts` (scoring block near L360-366).
**Interfaces:** Consumes `gradeQuestion`, `passes` from `./grading`. Produces:
`interface StoredAnswer { attemptId: string; position: number; questionId: string; selected: string[]; isCorrect: boolean | null }`;
`regradeAnswers(rows: StoredAnswer[], correctOf: (questionId: string) => readonly string[] | null): { attemptId: string; position: number; isCorrect: boolean }[]` (only rows whose live grade differs from the stored one);
`attemptScore(correctCount: number, total: number): { scorePct: number; passed: boolean }`.
Logic folder rule: import only `./grading`, `@/content/types`, `@/random/*`, type-only `@/persistence/records` (enforced by `tests/architecture/boundaries.test.ts`).

- [ ] **Step 1: Write failing tests:** only changed rows returned; rows with `isCorrect === null` skipped; `correctOf` returning `null` skips the row; single→multi (`selected ['B']`, new correct `['B','C']`) grades false; multi→single (`['B','C']` vs `['B']`) grades false; `attemptScore(3,4)` → `{75,false}`, `attemptScore(4,5)` → `{80,true}`, `attemptScore(0,0)` → `{0,false}`; `attemptScore` equals `Math.round(correct*100/total)` used today.
- [ ] **Step 2: Run** `rtk npx vitest run src/features/practice/logic/regrade.test.ts`; expected FAIL.
- [ ] **Step 3: Implement** both functions. Then replace the inline `scorePct`/`passes` in `#doSubmit` with `attemptScore`.
- [ ] **Step 4: Run** `rtk npx vitest run src/features/practice tests/architecture`; expected PASS (existing practice tests prove the submit result is unchanged).
- [ ] **Step 5: Commit** (when allowed): `feat(practice): add pure re-grade logic and share attempt scoring`.

### Task 4: Persist a re-grade

**Files:** Modify `src/persistence/repositories/attempts.ts`; create `src/persistence/repositories/attempts-regrade.test.ts` (`// @vitest-environment node`, `createNodeSqliteExecutor` as in `repositories.test.ts`).
**Interfaces:** Produces `interface RegradeInput { attemptId: string; grades: { position: number; isCorrect: boolean }[]; scorePct: number; passed: boolean }` and `attemptsRepo.applyRegrade(changes: RegradeInput[]): Promise<void>`. Writes grade rows first and the attempt row last per attempt (same crash-safety convention as `markSubmitted`), and only for `status = 'submitted'`.

- [ ] **Step 1: Write failing tests:** grades and score/passed are updated for a submitted attempt; an in-progress attempt is untouched; `selected` is never changed; applying twice gives the same rows; an empty list is a no-op.
- [ ] **Step 2: Run** the file; expected FAIL.
- [ ] **Step 3: Implement** `applyRegrade` with the same `$n` placeholder style as the neighbouring methods.
- [ ] **Step 4: Run** `rtk npx vitest run src/persistence`; expected PASS.
- [ ] **Step 5: Commit** (when allowed): `feat(persistence): add applyRegrade for submitted attempts`.

### Task 5: Reconcile answers against the live bank

**Files:** Create `src/features/practice/answers-reconcile.ts`, `answers-reconcile.test.ts`; modify `src/features/practice/index.ts` (export).
**Interfaces:** Consumes `attemptsRepo.listSubmitted()`, `questionsOfMany(ids)`, `applyRegrade`, `regradeAnswers`, `attemptScore`, `Catalog`. Produces
`interface ReconcileAnswersDeps { attempts: AttemptsRepo; catalog: Catalog; beforeWrite?: () => Promise<void> }`;
`reconcileAnswers(deps: ReconcileAnswersDeps): Promise<{ attempts: number; answers: number }>` (counts of changed attempts and answers). `beforeWrite` is awaited once, only when something will change; if it throws, nothing is written and the error propagates.
Score uses all rows of the attempt as `total` (same as submit).

- [ ] **Step 1: Write failing tests** (node SQLite, bundled-free catalog via `makeQuestion` from `@/testing/fixtures`): a bank answer changed after submit flips the old tick and recomputes `scorePct` and `passed` → `{attempts:1, answers:1}`; running again → `{0,0}`; unchanged bank → `{0,0}`; a question missing from the catalog keeps its stored grade, no throw; in-progress attempt untouched; checkpoint attempt (`kind: 'checkpoint'`, `groupIndex` set) gets its `passed` recomputed; `beforeWrite` called once with changes, never without; a throwing `beforeWrite` leaves all rows unchanged.
- [ ] **Step 2: Run** the file; expected FAIL.
- [ ] **Step 3: Implement** `reconcileAnswers`: list submitted attempts, load their rows, `regradeAnswers`, group by attempt, recompute score from all rows of that attempt, call `beforeWrite` once, `applyRegrade`. Export from `index.ts`.
- [ ] **Step 4: Run** `rtk npx vitest run src/features/practice tests/architecture`; expected PASS.
- [ ] **Step 5: Commit** (when allowed): `feat(practice): re-grade submitted attempts against the live answer bank`.

### Task 6: Run it at startup, before the stats rebuild

**Files:** Modify `src/app/app-state.svelte.ts` (`load()`, L73), `src/app/composition.ts` (pass `beforeWrite` from Task 7 when available); test in `src/app/app-state.test.ts`.
**Interfaces:** Consumes `reconcileAnswers`. `load()` order: `reconcileAnswers` → `reconcileStats` → rest. `reconcileStats` replays `is_correct`, so `question_stats` becomes exact with no extra code.

- [ ] **Step 1: Write failing tests:** with a submitted attempt whose stored grade disagrees with the bank, after `load()` the attempt grade, `scorePct` and the `question_stats` row all match the bank; a checkpoint attempt whose `passed` flips changes the result of `passedCheckpointGroups` (from `@/features/exam`, already imported by `app-state`); `'a failing re-grade does not stop the app from loading'` (error is logged with `console.error`, `load()` resolves).
- [ ] **Step 2: Run** `rtk npx vitest run src/app/app-state.test.ts`; expected FAIL.
- [ ] **Step 3: Implement** the call, wrapped in `try/catch` that logs and continues (the re-grade is per attempt crash-safe and retried on the next start). [Agent's call]
- [ ] **Step 4: Run** `rtk npx vitest run`; expected all PASS.
- [ ] **Step 5: Commit** (when allowed): `feat(app): reconcile history with the answer bank at startup`.

### Task 7: Backup before the first re-grade

**Files:** Create `src/persistence/tauri-db-backup.ts` (+ test with a fake executor); modify `composition.ts`.
**Interfaces:** Produces `createTauriDbBackup(executor: SqlExecutor): () => Promise<void>` that writes `mindmap-before-regrade-<timestamp>.db` into the app data directory (suggested mechanism: SQLite `VACUUM INTO`). Passed as `beforeWrite` to `reconcileAnswers`.

- [ ] **Step 1: Spike (manual gate):** run `rtk npx tauri dev` (Rust on PATH per the report-feature handoff) and confirm `VACUUM INTO` works through `@tauri-apps/plugin-sql` and the target folder exists or can be created. If not feasible, record a `Ruling:` and use the nearest workable mechanism or skip the backup with the user's agreement.
- [ ] **Step 2: Write failing unit test:** the function issues exactly one backup statement with a timestamped file name; a failing statement rejects.
- [ ] **Step 3: Implement**, wire into `createServices` only (tests keep `beforeWrite` undefined).
- [ ] **Step 4: Run** `rtk npx vitest run`; expected PASS. Manual: with a seeded old database, confirm one backup file appears on first start and none on the second.
- [ ] **Step 5: Commit** (when allowed): `feat(persistence): back up the database before re-grading history`.

---

## Part 2: Audit tooling (scripts, test-first)

### Task 8: Import-bug detector and corrections applier

**Files:** Create `scripts/audit/check-import-answers.ts`, `apply-corrections.ts`, and `*.test.ts` for each (vitest already includes `scripts/**`).
**Interfaces:** Consumes `parseCards(raw: string): RawCard[]` from `scripts/import-cards/parse-cards.ts` and the bank JSON. Produces:
`findAnswerCountMismatches(cards: RawCard[], bank: Question[]): { questionId: string; textSaysCount: number | null; sourceCorrect: string[]; bankCorrect: string[] }[]` (a "Choose two/three" card, or a source/bank `correct` difference);
`applyCorrections(bank: Question[], log: AnswerCorrection[]): Question[]` (edits only `correct` and `multi`; throws if a question is missing or its current `correct` is not `oldCorrect`).
CLI shape: `rtk npx tsx scripts/audit/<name>.ts <input> <output>`; each writes a JSON file named by the caller (a task folder path).

- [ ] **Step 1: Write failing tests** with 3-4 card fixtures each: a "Choose two" card whose source has three keys but the bank has two is reported; a clean bank reports `[]`; `applyCorrections` changes `correct` and `multi` only, refuses a stale `oldCorrect`, is a no-op for `[]`.
- [ ] **Step 2: Run** `rtk npx vitest run scripts/audit`; expected FAIL.
- [ ] **Step 3: Implement** both modules and thin CLI entrypoints.
- [ ] **Step 4: Run** `rtk npx vitest run scripts/audit`; expected PASS. Then run the detector on the real files; save its output as `import-bugs.json` in the audit task folder for the user to review (spec 9b-3).
- [ ] **Step 5: Add the do-not-re-import warning** at the top of `scripts/import-cards/build.ts` (comment) and in `README.md` (one sentence), then commit (when allowed): `feat(audit): add import-bug detector and corrections applier`.

---

## Part 3: Pilot (measure before committing to models)

### Task 9: Pilot on `shared-responsibility` (29 questions: 19 imported + 10 authored)

Task folder: `.superpowers/diff-agents/2026-11-10-question-bank-audit/pilot-shared-responsibility/` (orchestrator creates `brief.md`, `ledger.json`, `notes.md`, `results/`).
Finding schema every worker returns, one JSON array per batch: `{ questionId, locationFile, currentCorrect: string[], awsCorrect: string[] | null, verdict: 'verified' | 'wrong' | 'outdated' | 'ambiguous' | 'unsure', confidence: 'high'|'medium'|'low', sources: string[], note: string }`.

- [ ] **Step 1: Pre-flight** per `CLAUDE.md` (auth, model list, effort validity); record the quota state if readable and capture the exact quota-exhausted message if it is ever seen. Resolve the "Not yet known" items from spec 9c that can be resolved now.
- [ ] **Step 2: Write `brief.md`** (goal, the 29 question ids, allowed paths = read the bank and explanations, output = the schema above, stop condition = one array covering every id, no other writes).
- [ ] **Step 3: Run the same batch read-only** on Haiku 5.5 XHigh, Codex `gpt-6.1-sol` high, Agy `gemini-3.8-flash-high`; save each result under `results/` and log quota used per run in `notes.md`.
- [ ] **Step 4: Orchestrator checks accuracy:** for every question where any run says `wrong`/`outdated`, or runs disagree, open the cited official AWS page and decide; record per-model hits/misses and cost.
- [ ] **Step 5: Decide the final assignment** (cheapest accurate model per kind of task) and update spec 9c; show the user the numbers and the proposed assignment and wait for approval before Part 4.

---

## Part 4: Per-topic audit loop (repeat once per topic; user gate on every answer change)

Order and size (imported + authored = questions): `shared-responsibility` 19+10 (pilot, redo its Steps 5-10 for real), `migration-caf` 73+10, `support-ai-other` 58+10, `unassigned` 17+0, `deploy-operate` 60+10, `pricing-billing` 69+10, `databases` 38+10, `compute` 70+10, `storage` 51+10, `networking` 57+10, `iam-security` 103+10, `global-infrastructure` 16+10, `cloud-concepts` 37+10, `capstone` 0+10 (this order puts topics with "the exam expects" notes first; every topic is audited regardless of its count).

### Task 10: One topic, end to end (instantiate per topic, task-id = topic name)

**Files per topic:** audit folder under `.superpowers/diff-agents/...`, report `docs/superpowers/audits/2026-11-10-<topic>.md`, then `content/questions/...`, `content/explanations/<topic>.json`, `content/lessons/<topic>/*.md`, `content/review/answer-corrections.json`.

- [ ] **Step 1: Batch** the topic's questions (25-30 per batch); write `brief.md` and `ledger.json`; run the audit workers from the Task 9 assignment; write each result to `results/batch-NN.json` immediately; on a quota stop, follow the handoff and fallback rules in `CLAUDE.md`.
- [ ] **Step 2: Audit explanations/option notes and lesson claims (EN and VI)** with the assigned workers; same schema, `locationFile` = the explanation or lesson file.
- [ ] **Step 3: Arbitrate** every disputed or low-confidence finding with Agy `claude-sonnet-4-6`; items still unclear stay `unsure`.
- [ ] **Step 4: Orchestrator verifies sources:** open the official page for every proposed answer change and every lesson fact change; downgrade anything not backed by an official AWS source.
- [ ] **Step 5: Build the report** `docs/superpowers/audits/2026-11-10-<topic>.md` (one line per question, import bugs in their own section) and show it to the user.
- [ ] **Step 6: USER GATE:** the user approves, rejects or defers each answer change one by one; wording-only fixes may be approved as one batch (spec 9b-2). Nothing is edited before this.
- [ ] **Step 7: Write the approved changes** into a corrections file (`AnswerCorrection[]`, with today's date as `approvedOn`) and run `applyCorrections` through `scripts/audit/apply-corrections.ts`; append the entries to `content/review/answer-corrections.json`.
- [ ] **Step 8: Edit prose:** Haiku 5.5 XHigh updates the explanation and option notes of each changed question and the EN lesson text, then syncs the VI lesson in the same task; no edits outside the approved list.
- [ ] **Step 9: Verify:** `rtk npx vitest run` (integrity, corrections-log and existing explanation tests must pass) and `rtk npm run check`; expected all PASS.
- [ ] **Step 10: Orchestrator review of the topic diff** with the checklist: only approved ids changed; explanation, option notes, EN and VI agree with the new answer; sources recorded; then commit (when the user allows): `fix(content): correct <topic> answers and notes per AWS documentation`.

---

## Part 5: Finish

### Task 11: Whole-branch review and hand-off

- [ ] **Step 1: Full verification:** `rtk npm test`, `rtk npm run check`, `rtk npm run build`; expected all PASS (record counts).
- [ ] **Step 2: Manual checks with the user** on a database that already has old attempts: re-grade runs once, scores change as expected, the backup file exists, "most missed" and review boxes agree with the corrected bank, and `shared-responsibility`/question 25 shows the corrected answer.
- [ ] **Step 3: Whole-branch review by the orchestrator** against the spec's anti-goals (spec 3), re-grading findings by effect; Critical and Important findings get a failing test first; Minor ones are deferred and listed.
- [ ] **Step 4: Clean up** `.superpowers/diff-agents/2026-11-10-question-bank-audit/` when the user has accepted the audit reports; final report lists every ruling and deferred minor.
- [ ] **Step 5: Finish the branch** with `superpowers:finishing-a-development-branch`; merge, push and PR only with the user's permission.
