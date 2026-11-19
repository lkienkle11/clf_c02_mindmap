# Capstone Exams Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a CAPSTONE tier with two real topics, each holding one CLF-C02-style exam (65 questions: 50 scored + 15 unscored, pass at 70% of scored), and remove "Luyện tập" from the Tổng kết topic.

**Architecture:** Two new topics `capstone-exam-1` and `capstone-exam-2` (new tier `exam`, no lessons) sit between topic 12 and the existing `capstone` (Tổng kết) topic. The existing status chain (first not-done topic is current, the rest locked) gives the unlock order for free. Attempts stay `kind: 'practice'` with `topicId: 'capstone-exam-N'`; scoring and the pass mark are chosen by `topicId`; a new `attempt_questions.unscored` column marks the 15 unscored rows.

**Tech Stack:** Svelte 5 (runes), TypeScript, Vitest, Tauri 2 + SQLite (`src-tauri/migrations`).

**Spec:** `docs/superpowers/specs/2026-11-18-capstone-exams-design.md` (read it first; section 7b holds the settled calls).

## Global Constraints

- Exam: 65 questions = 50 scored + 15 unscored. Scored split by domain weights 24/30/34/12 over 50 = 12 / 15 / 17 / 6 (concepts / security / technology / billing).
- Pass = at least 70% of the 50 scored questions (35/50 passes, 34/50 fails). All other attempts keep 80% inclusive.
- Time: 90 minutes, 120 with extra time (`EXAM_MINUTES`, `EXAM_MINUTES_EXTRA` unchanged).
- Unscored questions are not marked during the exam; the post-submit review marks them "not scored".
- Topic ids: `capstone-exam-1` (order 13), `capstone-exam-2` (order 14), tier `exam`; existing `capstone` becomes order 15, id unchanged.
- Titles: vi "Capstone - Bài kiểm tra thứ nhất" / "Capstone - Bài kiểm tra thứ hai"; en "Capstone - Exam 1" / "Capstone - Exam 2". Tier banner `exam`: vi/en "CAPSTONE". Existing `capstone` tier and topic en label becomes "Summary" so the two do not share a name (agent's call, vi stays "Tổng kết").
- Unlock: exam 1 after checkpoint group 4 passed; exam 2 after exam 1 passed; `capstone` after both. Passing an exam topic = a submitted practice attempt with `passed === true` on that topic.
- Legacy attempts (`topicId: 'capstone'`) stay in history but never complete `capstone` and never unlock the new exams.
- Never edit a shipped migration; add `0008_attempt_question_unscored.sql` and register it in `src-tauri/src/lib.rs`.
- Commit rules (project `CLAUDE.md`): Conventional Commits `type(scope): description`; body has the four sections **Scope:**, **What did:**, **Reviewed:**, **Tested:** in that order; no AI attribution or co-author trailer; prefix commands with `rtk`.
- Run tests with `rtk npm test` (vitest) and type-check with `rtk npm run check` from `easy_mindmap_knowledge/`.

## Review Focus

1. Resuming an in-progress capstone exam after an app restart: the attempt must reopen in the exam screen with its `unscored` flags intact.
2. Startup regrade (`reconcileAnswers`) must not re-score a capstone attempt at 80% or count unscored rows; a stored `passed` must survive a restart.
3. A timed-out or manual submit with unanswered scored questions: denominator stays 50, unanswered scored = wrong.
4. A domain pool smaller than its share (or an empty bank): still 65 questions when the bank allows, and unscored questions never inflate the domain split.
5. A user with a legacy passed `capstone` attempt and a full history: tree loads, exam 1 is the current topic, Tổng kết shows locked.

---

## Worker assignment (`/diff-type-subagents`) — PROPOSAL, not yet measured or approved

Orchestrator and reviewer of every task: Claude Code (Sonnet 5.5). No Opus, no Sonnet subagent. A worker never reviews its own task. Checked 2026-11-18: Codex CLI 0.167.1 logged in; `agy models` returns its list. Each task gets a fresh session, a brief with WORKER RULES + CODE WORKER RULES, a task folder under `.superpowers/diff-agents/2026-11-18-capstone-exams/<task-id>/`, and the compliance check (`git status --porcelain`, HEAD unchanged, changed files inside the task's files list) after every run.

| Task | Worker | Effort | Why |
|---|---|---|---|
| 1 Content, tier, constants | Haiku 5.5 (Agent tool) | High | Small JSON and constants edit |
| 2 Unlock order, Tổng kết completion | Codex `gpt-6.1-sol` | medium | Touches the status chain and app-state |
| 3 Scoring rules | Haiku 5.5 | High | Small pure functions |
| 4 Unscored column (migration) | Codex `gpt-6.1-sol` | medium | SQL migration, Rust registration, repository |
| 5 Draw 50 + 15 | Codex `gpt-6.1-sol` | medium | Allocation edge cases |
| 6 Start, grade, resume | Codex `gpt-6.1-sol` | high | Scoring and restart-safety; errors change learners' results |
| 7 Roadmap tier and nodes | Codex `gpt-6.1-sol` | medium | Layout plus Svelte |
| 8 Exam screens, result, review | Codex `gpt-6.1-sol` | medium | Svelte and i18n |
| 9 End-to-end flow test | Haiku 5.5 | High | One flow test over finished code |

Fallback if Codex is exhausted: Agy `gemini-3.8-flash-high`, then Haiku 5.5. Agy in headless mode cannot run commands, so it cannot run the tests: use it only for a task whose tests the orchestrator then runs itself, and say so in the brief. Quota cannot be read by command; detect exhaustion from a non-zero exit code or a usage-limit message.

Before relying on this table: (a) pilot Task 1 with its assigned worker and review the result closely, to measure accuracy; (b) the live Codex model list differs from the table in `CLAUDE.md` (new models; version 0.167.1 vs 0.167.0): `gpt-6.1-sol` is a known row, no new model is used; the table update is a separate step the user approves. Where workers write (this directory on branch `feat/capstone-exams`, or a separate worktree) is the user's decision.

## File Structure

- Create `src/content/capstone-exams.ts`: constants and predicate for the exam topics (shared by `practice` and `exam`, which must not import each other).
- Create `src-tauri/migrations/0008_attempt_question_unscored.sql`.
- Modify: `content/topics.json`, `src/content/types.ts`, `src/features/exam/logic/{groups,draw-exam}.ts`, `src/features/exam/start-exam.ts`, `src/features/exam/ui/{ExamSetup,ExamScreen,ExamBreakdown}.svelte`, `src/features/practice/logic/{grading,regrade}.ts`, `src/features/practice/{answers-reconcile.ts,session.svelte.ts}`, `src/features/practice/ui/PracticeResult.svelte`, `src/features/mindmap/logic/{topic-status,tree-layout}.ts`, `src/features/mindmap/ui/{TreeCanvas,TopicBranch}.svelte`, `src/persistence/{records.ts,repositories/attempts.ts}`, `src-tauri/src/lib.rs`, `src/app/{App.svelte,app-state.svelte.ts}`, `src/i18n/{en,vi}.json`. Tests sit next to each file (`*.test.ts`).

---

### Task 1: Content, tier and shared constants

**Files:**
- Create: `src/content/capstone-exams.ts`, `src/content/capstone-exams.test.ts`
- Modify: `content/topics.json`, `src/content/types.ts`, `src/i18n/en.json`, `src/i18n/vi.json`, `src/content/bundled-content.test.ts`

**Interfaces:**
- Produces: `CAPSTONE_EXAM_TOPIC_IDS: readonly ['capstone-exam-1', 'capstone-exam-2']`; `isCapstoneExamTopic(topicId: string | null): boolean`; `Tier` now includes `'exam'`.

- [ ] **Step 1: Write failing tests.** `capstone-exams.test.ts`: `isCapstoneExamTopic('capstone-exam-1')` and `'capstone-exam-2'` are true; `'capstone'`, `'compute'`, `null` are false. In `bundled-content.test.ts`: change "loads 13 topics" to 15; assert topics 13 and 14 are `capstone-exam-1/-2` with tier `exam` and `lessonIds` equal to `[]`; assert `capstone` has `order` 15 and keeps its 6 `lessonIds`; assert both exam titles equal the strings in Global Constraints for `vi` and `en`.
- [ ] **Step 2: Run** `rtk npm test -- capstone-exams bundled-content` and confirm they fail.
- [ ] **Step 3: Implement** the constants file, add `'exam'` to `Tier`, edit `topics.json` (two new topics, `capstone` order 15), add `mindmap.tier.exam` to both i18n files and change `mindmap.tier.capstone` en to "Summary". Keep `CONTENT_TOPICS` in `bundled-content.test.ts` unchanged (exam topics have no lessons, the drift guard stays true).
- [ ] **Step 4: Run** `rtk npm test -- capstone-exams bundled-content` and `rtk npm run check`; expect PASS.
- [ ] **Step 5: Commit** `feat(content): add the Capstone exam topics and tier`.

### Task 2: Unlock order and Tổng kết completion

**Files:**
- Modify: `src/features/exam/logic/groups.ts`, `src/features/mindmap/logic/topic-status.ts`, `src/app/app-state.svelte.ts`
- Test: `src/features/exam/logic/groups.test.ts`, `src/features/exam/logic/gates.test.ts`, `src/features/mindmap/logic/topic-status.test.ts`, `src/app/app-state.test.ts`

**Interfaces:**
- Consumes: `isCapstoneExamTopic` (Task 1).
- Produces: `checkpointGroups` ignores tiers `capstone` and `exam`; `gateBefore(topics, 'capstone-exam-1')` returns the last group, and `null` for `'capstone-exam-2'` and `'capstone'`; `completedTopicIds(attempts)` skips attempts whose `topicId === 'capstone'`; `withSummaryCompleted(completed: Set<string>, topics: Topic[], lessonsOf: (topicId: string) => Lesson[], readIds: Set<string>): Set<string>` adds `'capstone'` only when both exam topics are completed and every required `capstone` lesson is read.

- [ ] **Step 1: Write failing tests.** groups: 12 non-capstone topics still give 4 groups of 3 (exam topics excluded); gate for exam 1 = group 4, exam 2 = null, `capstone` = null. topic-status: a passed legacy attempt on `capstone` is not completed; with exam 1 passed and group 4 passed, statuses are `capstone-exam-1: done`, `capstone-exam-2: current`, `capstone: locked`; with both exams done and no lesson read, `capstone` stays `current`; after reading all required lessons it is `done` (via `withSummaryCompleted`). app-state: `refresh()` produces these statuses from stored attempts and read ids.
- [ ] **Step 2: Run** the four test files; confirm FAIL.
- [ ] **Step 3: Implement** the changes above; in `app-state.svelte.ts` `refresh()` compute `completed = withSummaryCompleted(completedTopicIds(submitted), catalog.topics, (id) => catalog.lessonsOf(id), readIds)` before `topicStatuses`.
- [ ] **Step 4: Run** the same files plus `rtk npm test`; expect PASS.
- [ ] **Step 5: Commit** `feat(mindmap): unlock Capstone exams in order before the summary`.

### Task 3: Scoring rules

**Files:**
- Modify: `src/features/practice/logic/grading.ts`, `src/features/practice/logic/regrade.ts`
- Test: `src/features/practice/logic/grading.test.ts`, `src/features/practice/logic/regrade.test.ts`

**Interfaces:**
- Consumes: `isCapstoneExamTopic` (Task 1).
- Produces: `passThresholdPct(topicId: string | null): 70 | 80`; `passes(correctCount: number, total: number, thresholdPct?: number): boolean` (default 80, inclusive, integer math); `attemptScore(correctCount: number, total: number, thresholdPct?: number): { scorePct: number; passed: boolean }`; `StoredAnswer` gains `unscored: boolean` and `regradeAnswers` leaves it untouched.

- [ ] **Step 1: Write failing tests.** `passThresholdPct('capstone-exam-1') === 70`, `('compute') === 80`, `(null) === 80`. `passes(35, 50, 70) === true`, `passes(34, 50, 70) === false`, `passes(40, 50) === true`, `passes(39, 50) === false`. `attemptScore(35, 50, 70)` gives `{ scorePct: 70, passed: true }`.
- [ ] **Step 2: Run** `rtk npm test -- grading regrade`; confirm FAIL.
- [ ] **Step 3: Implement** with the existing integer-math style; keep default behavior byte-identical for existing callers.
- [ ] **Step 4: Run** `rtk npm test -- grading regrade`; expect PASS.
- [ ] **Step 5: Commit** `feat(practice): add the 70% Capstone pass mark`.

### Task 4: Persist the unscored flag

**Files:**
- Create: `src-tauri/migrations/0008_attempt_question_unscored.sql`
- Modify: `src-tauri/src/lib.rs`, `src/persistence/records.ts`, `src/persistence/repositories/attempts.ts`
- Test: `src/persistence/migrations.test.ts`, `src/persistence/repositories/repositories.test.ts`

**Interfaces:**
- Produces: `AttemptQuestionRow.unscored: boolean`; the repository writes it in `create` and returns it from `questionsOf` / `questionsOfMany`; the migration is `ALTER TABLE attempt_questions ADD COLUMN unscored INTEGER NOT NULL DEFAULT 0`.

- [ ] **Step 1: Write failing tests.** migrations: file list index 7 is `0008_attempt_question_unscored.sql`, registered in `lib.rs` with version 8; applying it to a version-7 database with rows keeps them and defaults `unscored` to 0. repositories: a row created with `unscored: true` reads back `true`; rows created without the flag read back `false`.
- [ ] **Step 2: Run** `rtk npm test -- migrations repositories`; confirm FAIL.
- [ ] **Step 3: Implement** the migration, the `Migration { version: 8, ... }` entry, the record field and both repository directions (INTEGER 0/1 <-> boolean, same style as `is_correct`). Update every `AttemptQuestionRow` literal the type checker flags (set `unscored: false`).
- [ ] **Step 4: Run** `rtk npm test` and `rtk npm run check`; expect PASS.
- [ ] **Step 5: Commit** `feat(persistence): store which exam questions are unscored`.

### Task 5: Draw the 50 + 15 exam

**Files:**
- Modify: `src/features/exam/logic/draw-exam.ts`
- Test: `src/features/exam/logic/draw-exam.test.ts`

**Interfaces:**
- Produces: `drawCapstone(catalog: Catalog, history: AnswerHistory, rng: () => number): { scored: Question[]; unscored: Question[] }`; constants `CAPSTONE_SCORED_COUNT = 50` and `CAPSTONE_UNSCORED_COUNT = 15` in `exam-config.ts` (`EXAM_QUESTION_COUNT` stays 65).

- [ ] **Step 1: Write failing tests** with a synthetic catalog: `scored` has 50 questions split exactly 12/15/17/6 by domain; `unscored` has 15; the two sets share no question id; domains inferred with `DOMAIN_OF_TOPIC` / `CAPSTONE_QUESTION_DOMAIN` as today. Priority (unseen, then missed, then right) holds inside each domain bucket. A catalog whose billing pool has 4 questions: `scored` still has 50, the shortfall comes from other domains or unassigned questions, `unscored` is 15 from what remains. A catalog of 30 questions: `scored.length + unscored.length === 30`, scored filled first.
- [ ] **Step 2: Run** `rtk npm test -- draw-exam`; confirm FAIL.
- [ ] **Step 3: Implement.** Allocate 50 across domains with `allocate(DOMAIN_WEIGHTS, sizes, CAPSTONE_SCORED_COUNT)` and draw with `drawBucket`; shortfall from unassigned questions as today; then `unscored` = `drawBucket` over every question not in `scored`, ignoring domain, count 15. Keep `drawCheckpoint` untouched.
- [ ] **Step 4: Run** `rtk npm test -- draw-exam`; expect PASS.
- [ ] **Step 5: Commit** `feat(exam): draw 50 scored and 15 unscored Capstone questions`.

### Task 6: Start, grade and resume a Capstone attempt

**Files:**
- Modify: `src/features/exam/start-exam.ts`, `src/features/practice/session.svelte.ts`, `src/features/practice/answers-reconcile.ts`
- Test: `src/features/exam/start-exam.test.ts`, `src/features/practice/session-exam.test.ts`, `src/features/practice/answers-reconcile.test.ts`

**Interfaces:**
- Consumes: `drawCapstone` (Task 5), `passThresholdPct` and `attemptScore` (Task 3), `AttemptQuestionRow.unscored` (Task 4).
- Produces: `startCapstoneExam(services: Services, topicId: 'capstone-exam-1' | 'capstone-exam-2', options: ExamOptions, onSubmitted: () => Promise<void>): Promise<PracticeSession>`; `PracticeSession.startExam` input gains `unscoredIds?: ReadonlySet<string>`; `SubmitResult.items[]` gains `unscored: boolean`; `SubmitResult.total` and `correct` count scored items only.

- [ ] **Step 1: Write failing tests.** start-exam: started attempt has `topicId` `capstone-exam-1`, `plannedCount` 65, 15 rows with `unscored: true`, `limitMs` 90 min (120 with extra time); unscored rows are not distinguishable by position. session-exam: submitting 35 correct of 50 scored plus all 15 unscored wrong gives `passed: true`, `scorePct: 70`, `total: 50`; 34 correct gives `passed: false`; unanswered scored questions count wrong; a restored (`resume`) session keeps `unscored` per row. answers-reconcile: a submitted capstone attempt with 35/50 scored correct and 15 wrong unscored stays `passed: true`, `scorePct: 70` after reconcile; a non-capstone attempt still uses 80%.
- [ ] **Step 2: Run** `rtk npm test -- start-exam session-exam answers-reconcile`; confirm FAIL.
- [ ] **Step 3: Implement.** `startCapstoneExam` flattens `scored` + `unscored` into the plan and passes `unscoredIds`; `startExam` writes `unscored` on rows; `#doSubmit` grades all items, then computes `correct`/`total`/score from items with `unscored === false`, with `passThresholdPct(attempt.topicId)`; `reconcileAnswers` excludes unscored rows and uses `passThresholdPct(attempt.topicId)`.
- [ ] **Step 4: Run** the same files plus `rtk npm test`; expect PASS.
- [ ] **Step 5: Commit** `feat(exam): grade Capstone attempts on scored questions at 70%`.

### Task 7: Roadmap shows the CAPSTONE tier and drops "Luyện tập" from Tổng kết

**Files:**
- Modify: `src/features/mindmap/logic/tree-layout.ts`, `src/features/mindmap/ui/TreeCanvas.svelte`, `src/features/mindmap/ui/TopicBranch.svelte`
- Test: `src/features/mindmap/logic/tree-layout.test.ts`, `src/features/mindmap/ui/TreeScreen.test.ts`

**Interfaces:**
- Consumes: `isCapstoneExamTopic` (Task 1), statuses from Task 2.
- Produces: `layoutTree` gives an expanded `capstone` topic only its lesson leaves (no `practice` leaf) and an `exam`-tier topic no leaves; tier marks include `exam` before `capstone`.

- [ ] **Step 1: Write failing tests.** layout: expanding `capstone` yields 6 lesson leaves and no leaf with `kind: 'practice'`; expanding `capstone-exam-1` yields no leaves; `tierMarks` order is introduction, core, advanced, exam, capstone. TreeScreen: the CAPSTONE banner renders between "Bài kiểm tra mốc 4" and the TỔNG KẾT banner; exam 1 node is enabled after group 4 is passed and exam 2 shows locked until exam 1 is passed; clicking an enabled exam node opens route `{ view: 'practice', topicId: 'capstone-exam-1' }`; the Tổng kết topic has no "Luyện tập" node; a locked topic shows its lock reason (exam 2: needs exam 1; Tổng kết: needs both exams).
- [ ] **Step 2: Run** `rtk npm test -- tree-layout TreeScreen`; confirm FAIL.
- [ ] **Step 3: Implement.** In `layoutTree`, the `practice` leaf is appended only for topics whose tier is not `capstone` or `exam`. In `TreeCanvas`, `withQuestions` also includes exam-tier topics; the exam-tier node activates `openPractice(topicId)`. Add the lock-reason strings in Task 8.
- [ ] **Step 4: Run** `rtk npm test` and `rtk npm run check`; expect PASS.
- [ ] **Step 5: Commit** `feat(mindmap): add the CAPSTONE tier and remove Practice from the summary`.

### Task 8: Exam screens, result and review

**Files:**
- Modify: `src/app/App.svelte`, `src/features/exam/ui/{ExamSetup,ExamScreen,ExamBreakdown}.svelte`, `src/features/practice/ui/PracticeResult.svelte`, `src/i18n/{en,vi}.json`
- Test: `src/app/App.test.ts`, `src/features/exam/ui/ExamSetup.test.ts`, `src/features/exam/ui/ExamScreen.test.ts`, `src/features/practice/ui/PracticeResult.test.ts`, `src/i18n/i18n.test.ts`

**Interfaces:**
- Consumes: `startCapstoneExam` and `SubmitResult.items[].unscored` (Task 6), `passThresholdPct` (Task 3).
- Produces: `ExamScreen` / `ExamSetup` take `capstoneTopicId: string | null` next to `groupIndex: number | null` (exactly one is non-null); routing sends `practice` routes whose topic satisfies `isCapstoneExamTopic` to `ExamScreen`; i18n keys for the exam titles, lock reasons ("finish Capstone - Exam 1 first", "finish both Capstone exams first"), the pass-mark line ("Pass mark: 70% of 50 scored questions") and the review label "Not scored".

- [ ] **Step 1: Write failing tests.** App: route `practice/capstone-exam-2` renders `ExamScreen`, route `practice/capstone` renders the normal practice screen or nothing exam-related. ExamSetup: title is the topic title; start is blocked with the correct lock reason until the gate opens; the duration shown is 90 (120 with extra time); text states 65 questions of which 15 are not scored (shown at setup, since the real exam says so). ExamScreen/PracticeResult: result shows score on 50 scored questions and the 70% pass mark; the review marks exactly the 15 unscored items "Not scored" and they do not show as the pass/fail cause; during the exam no question is marked. i18n: en and vi both define every new key (existing i18n parity test).
- [ ] **Step 2: Run** `rtk npm test -- App ExamSetup ExamScreen PracticeResult i18n`; confirm FAIL.
- [ ] **Step 3: Implement** the props, routing and strings. Keep the Svelte 5 runes style used in these files (`$derived` for values depending on props, no new effects).
- [ ] **Step 4: Run** `rtk npm test` and `rtk npm run check`; expect PASS.
- [ ] **Step 5: Commit** `feat(exam): Capstone exam screens with scored/unscored result and review`.

### Task 9: End-to-end check and notes

**Files:**
- Test: `src/app/learning-flow.test.ts`
- Modify: `README.md` (one short paragraph on the Capstone tier, only if the README lists the roadmap structure)

**Interfaces:**
- Consumes: everything above.

- [ ] **Step 1: Write the failing flow test** in `learning-flow.test.ts`: with an in-memory database, pass groups 1 to 4, then assert exam 1 is current; submit a 35/50 attempt on `capstone-exam-1`, assert exam 2 is current and `capstone` locked; submit 35/50 on exam 2, assert `capstone` is current; read its required lessons, assert it is done. Add the legacy case: a passed `topicId: 'capstone'` attempt does not change any of these statuses.
- [ ] **Step 2: Run** `rtk npm test -- learning-flow`; confirm it fails only if an earlier task is missing something, then fix the gap in the owning task's code.
- [ ] **Step 3: Run the full suite and type-check:** `rtk npm test` and `rtk npm run check`; expect all green.
- [ ] **Step 4: Manual check** with `rtk npm run dev` (browser mode if supported) or `rtk npm run tauri dev`: reach the CAPSTONE tier, start exam 1, close and reopen the app mid-exam (resume), submit, check the review marks. Record what was and was not checked.
- [ ] **Step 5: Commit** `test(app): cover the Capstone unlock flow end to end`.
