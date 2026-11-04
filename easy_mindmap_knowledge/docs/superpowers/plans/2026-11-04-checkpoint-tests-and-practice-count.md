# Checkpoint tests, practice question count, Capstone exam and lesson expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let the learner pick the practice question count (10..pool), add four 65-question timed checkpoint exams (one per 3-topic group) that gate progress, turn Capstone into a 65-question domain-weighted exam, and grow the lessons to 8-14 per topic covering every service the questions mention.

**Architecture:** New feature `src/features/exam/` holds pure logic (time, groups, domains, allocation, question draw) and the exam screens. It reuses `PracticeSession` (clock, resume, submit) through a new `PracticeSession.startExam`, mirroring how `startReview` already works, so practice never imports exam. A migration adds a `checkpoint` attempt kind, `group_index` and `planned_count`. Gate state is derived from submitted attempts (never stored), like the existing topic colours.

**Tech Stack:** Svelte 5 runes, TypeScript, Tailwind 4, Tauri v2 + SQLite (`@tauri-apps/plugin-sql`), vitest + testing-library. No new dependency.

**Spec:** `docs/superpowers/specs/2026-11-04-checkpoint-tests-and-practice-count-design.md` (read it with this plan; section numbers below refer to it).

## Global Constraints

- Exam: **65** questions; **90** minutes, **120** with the extra-time option; short pool: `ceil(count × 90/65 × 60)` seconds (`× 120/65` with extra time); fewer than **10** questions: do not start.
- Pass mark **80%** (existing `passes()`); overall score only, no per-domain minimum.
- Groups: topics by `order`, **3 per group** (`CHECKPOINT_GROUP_SIZE = 3`), Capstone in no group. Next group's first topic (and Capstone) unlock only when the previous group's 3 topics are completed **and** a checkpoint for it is submitted with `passed`.
- Capstone split over 65 questions by domain 24/30/34/12 → 16/19/22/8 (largest remainder).
- Practice question count: integer, `10 ≤ n ≤ pool.length`, default 10.
- Exam mode: no knowledge review, answers only after submit, clock mode `run`, `onHidden = run`, Exit abandons (deletes) the attempt, crash keeps it, resume past the deadline auto-submits (unanswered = wrong, counts toward the gate).
- Re-draw order (checkpoints and Capstone): never-seen → seen and wrong (most misses first) → seen and right (random). Only submitted attempts count as "seen".
- Never edit `0001`-`0003` migrations; add `0004_*.sql` and register it in `src-tauri/src/lib.rs`.
- No new dependency. UI text in `src/i18n/en.json` and `vi.json` (parity is tested). Questions stay English.
- Commits: Conventional Commits `type(scope): description`; body has the four sections **Scope / What did / Reviewed / Tested**; no AI attribution or co-author trailer (repo `CLAUDE.md`).
- Run everything from `easy_mindmap_knowledge/`; use `npm`/`npx`, never pnpm.
- Workspace: do all work on a new branch from `main` (the previous feature branch is merged); creating it needs the user's permission (Step 3 of the workflow).

## Review Focus

- Resuming a checkpoint after its deadline passed while the app was closed: must auto-submit with unanswered = wrong, and the result must count for the gate (Task 8, Task 11 tests).
- A pool or domain bucket smaller than its allocation (e.g. a domain with 5 questions but 8 requested): total must still reach 65 by redistribution, never duplicate a question, never exceed the pool (Task 3, Task 4).
- Question-count input edge cases: empty, `9`, `10.5`, `abc`, more than the pool, a pool of exactly 10 (Task 6, Task 7).
- A passed checkpoint must never make a topic "completed" and must not appear as a topic in weak-topic stats or the topic history filter (Task 9, Task 14).
- Topics list not a multiple of 3, or `topics.json` reordered: groups must still partition the non-Capstone topics exactly once (Task 2).

---

### Task 1: Exam constants and time formula

**Files:**
- Create: `src/features/exam/logic/exam-config.ts`
- Test: `src/features/exam/logic/exam-config.test.ts`

**Interfaces:**
- Produces: `EXAM_QUESTION_COUNT = 65`, `EXAM_MINUTES = 90`, `EXAM_MINUTES_EXTRA = 120`, `EXAM_MIN_QUESTIONS = 10`, `examLimitMs(questionCount: number, extraTime: boolean): number` (milliseconds, whole seconds, rounded up).

- [ ] **Step 1: Write the failing test** `exam-config.test.ts`: `examLimitMs(65,false)===5_400_000`; `examLimitMs(65,true)===7_200_000`; `examLimitMs(20,false)===1_662_000` (20×5400/65 = 1661.5 s, rounded up); `examLimitMs(20,true)===Math.ceil(20*7200/65)*1000`; result is always a multiple of 1000.
- [ ] **Step 2: Run** `npx vitest run src/features/exam/logic/exam-config.test.ts` → FAIL (module missing).
- [ ] **Step 3: Implement** `examLimitMs` as `Math.ceil((count * minutes * 60) / EXAM_QUESTION_COUNT) * 1000` using integer arithmetic before the divide.
- [ ] **Step 4: Run** the same command → PASS.
- [ ] **Step 5: Commit** `feat(exam): add exam constants and time formula`.

### Task 2: Checkpoint groups and domain mapping

**Files:**
- Create: `src/features/exam/logic/groups.ts`, `src/features/exam/logic/domains.ts`
- Test: `src/features/exam/logic/groups.test.ts`, `src/features/exam/logic/domains.test.ts`

**Interfaces:**
- Produces (`groups.ts`): `CHECKPOINT_GROUP_SIZE = 3`; `interface CheckpointGroup { index: number /* 1-based */; topicIds: string[] }`; `checkpointGroups(topics: Topic[]): CheckpointGroup[]` (topics sorted by `order`, `tier === 'capstone'` excluded, chunked by 3, last chunk may be short); `gateBefore(topics: Topic[], topicId: string): CheckpointGroup | null` (previous group for the first topic of a group with index > 1; the last group for the Capstone topic; otherwise null).
- Produces (`domains.ts`): `type DomainId = 'concepts' | 'security' | 'technology' | 'billing'`; `DOMAIN_WEIGHTS: Record<DomainId, number>` = 24/30/34/12; `DOMAIN_OF_TOPIC: Record<string, DomainId>` per spec §7 (concepts: cloud-concepts, migration-caf; security: shared-responsibility, iam-security; technology: global-infrastructure, compute, storage, networking, databases, deploy-operate, support-ai-other; billing: pricing-billing).

- [ ] **Step 1: Write failing tests.** `groups.test.ts`: with the real 13 topics (from `loadBundledCatalog().topics`) `checkpointGroups` returns 4 groups with indexes 1-4 and the exact topic ids {cloud-concepts, global-infrastructure, compute} / {storage, networking, databases} / {deploy-operate, shared-responsibility, iam-security} / {pricing-billing, migration-caf, support-ai-other}; with 7 synthetic topics returns groups of 3, 3, 1 covering each id once; `gateBefore(topics,'storage')` is group 1; `gateBefore(topics,'networking')` is null; `gateBefore(topics,'capstone')` is group 4; `gateBefore(topics,'cloud-concepts')` is null. `domains.test.ts`: every non-Capstone topic id in the real catalog has an entry; weights sum to 100.
- [ ] **Step 2: Run** both files → FAIL.
- [ ] **Step 3: Implement** both modules as pure functions/constants; no imports from other features except `@/content/types`.
- [ ] **Step 4: Run** both → PASS.
- [ ] **Step 5: Commit** `feat(exam): add checkpoint groups and domain mapping`.

### Task 3: Proportional allocation with caps

**Files:**
- Create: `src/features/exam/logic/allocate.ts`
- Test: `src/features/exam/logic/allocate.test.ts`

**Interfaces:**
- Produces: `allocate(weights: Record<string, number>, caps: Record<string, number>, total: number, minEach = 0): Record<string, number>` — largest-remainder proportional split of `min(total, sum(caps))`; each bucket ≤ its cap; leftovers from capped buckets go to buckets with spare capacity by weight; `minEach` applied to buckets with cap ≥ minEach first.

- [ ] **Step 1: Write failing tests:** domain weights with big caps and total 65 → `{concepts:16, security:19, technology:22, billing:8}`; same with `billing` cap 5 → billing 5 and the sum still 65; total larger than sum(caps) → every bucket equals its cap; weights = caps = {a:153, b:176, c:212} (checkpoint-style pool sizes) with total 65 sums to 65 and `minEach = 1` gives every bucket ≥ 1; a bucket with weight 0 receives 0 unless needed to reach total; deterministic (same input, same output).
- [ ] **Step 2: Run** → FAIL.
- [ ] **Step 3: Implement** with integer floors, then distribute the remainder by largest fractional part (ties by key order), then a capped-redistribution loop.
- [ ] **Step 4: Run** → PASS.
- [ ] **Step 5: Commit** `feat(exam): add capped proportional allocation`.

### Task 4: Question draw (unseen → wrong → right) and plan helper

**Files:**
- Create: `src/features/exam/logic/draw-exam.ts`
- Modify: `src/features/practice/logic/pick-questions.ts` (extract `planQuestions`), `src/persistence/repositories/attempts.ts` (add `listGradedAnswers`)
- Test: `src/features/exam/logic/draw-exam.test.ts`, `src/features/practice/logic/pick-questions.test.ts` (update), `src/persistence/repositories/attempts.test.ts` (add case)

**Interfaces:**
- Produces (`pick-questions.ts`): `planQuestions(questions: Question[], rng: () => number): PlannedQuestion[]` — shuffles the questions and each option order (kept for `orderDependent`), no slicing; `planAttempt` becomes `planQuestions(shuffle(pool).slice(0,count))`-equivalent with unchanged behaviour. `practiceCount` remains (default 10) but the Capstone special case (30) is removed and `buildPool` still returns the whole catalog for Capstone.
- Produces (`attempts.ts`): `listGradedAnswers(): Promise<{ questionId: string; isCorrect: boolean }[]>` — graded rows of **submitted** attempts only.
- Produces (`draw-exam.ts`): `interface AnswerHistory { seen: Set<string>; misses: Map<string, number> }`; `historyOf(rows: { questionId: string; isCorrect: boolean }[]): AnswerHistory`; `drawBucket(pool: Question[], n: number, history: AnswerHistory, rng: () => number): Question[]`; `drawCheckpoint(catalog: Catalog, group: CheckpointGroup, history: AnswerHistory, rng: () => number): Question[]`; `drawCapstone(catalog: Catalog, history: AnswerHistory, rng: () => number): Question[]`.

- [ ] **Step 1: Write failing tests** `draw-exam.test.ts` with small synthetic catalogs: `drawBucket` returns unseen first; when unseen < n it appends seen-wrong ordered by misses descending, then seen-right; never returns duplicates; returns `min(n, pool.length)`; `drawCheckpoint` over the group's topics returns 65 distinct questions when the pools hold ≥ 65, split by `allocate(weights = caps = pool sizes, 65, minEach 1)`, all from the group's topics, and the returned list is shuffled (not grouped by topic for a fixed seed); a group pool of 40 returns 40; `drawCapstone` returns 16/19/22/8 questions per domain with distinct ids, uses `topicId === null` questions only to top up a short domain, and returns 65 on the real bundled catalog (`loadBundledCatalog()`). `pick-questions.test.ts`: `planQuestions` keeps option order for an `orderDependent` question; `buildPool(catalog,'capstone')` still returns all questions; `practiceCount('capstone')` is 10. `attempts.test.ts`: `listGradedAnswers` excludes in-progress attempts and ungraded rows.
- [ ] **Step 2: Run** `npx vitest run src/features/exam src/features/practice/logic src/persistence` → FAIL.
- [ ] **Step 3: Implement** the three pieces; `drawBucket` sorts seen-wrong by `misses` descending then rng tiebreak; `drawCapstone` groups questions by `DOMAIN_OF_TOPIC` of `question.topicId`.
- [ ] **Step 4: Run** the same command → PASS.
- [ ] **Step 5: Commit** `feat(exam): draw exam questions by seen/wrong history`.

### Task 5: Migration `0004`, attempt records and repo

**Files:**
- Create: `src-tauri/migrations/0004_checkpoint_attempts.sql`
- Modify: `src-tauri/src/lib.rs` (register version 4), `src/persistence/records.ts`, `src/persistence/repositories/attempts.ts`, `src/testing/fixtures.ts` (and any helper that builds `AttemptRow`)
- Test: `src/persistence/migrations.test.ts`, `src/persistence/repositories/attempts.test.ts`

**Interfaces:**
- Produces: `AttemptRow.kind: 'practice' | 'review' | 'checkpoint'`; `AttemptRow.groupIndex: number | null`; `AttemptRow.plannedCount: number | null`. Table rebuild: `attempts` gains `group_index INTEGER`, `planned_count INTEGER`, and `CHECK (kind IN ('practice','review','checkpoint'))` plus `CHECK ((kind = 'checkpoint') = (group_index IS NOT NULL))`; all existing columns (including `clock_on_hidden`) and data are preserved.

- [ ] **Step 1: Write failing tests:** migrations test applies 0001-0004 in order on an empty DB and on a DB seeded at 0003 with one practice row (row survives with `group_index`/`planned_count` NULL); inserting `kind='checkpoint'` with `group_index NULL` is rejected; `kind='practice'` with a `group_index` is rejected; the repo round-trips a checkpoint attempt (`create` then `findInProgress`) including `groupIndex` and `plannedCount`.
- [ ] **Step 2: Run** `npx vitest run src/persistence` → FAIL.
- [ ] **Step 3: Implement:** SQL = create `attempts_new`, `INSERT ... SELECT` with explicit columns, `DROP TABLE attempts`, rename; map the two new columns in `toAttempt`/`create`; update fixtures with the new fields.
- [ ] **Step 4: Run** `npx vitest run src/persistence` and `npm run check` → PASS.
- [ ] **Step 5: Commit** `feat(persistence): add checkpoint attempt kind and planned count`.

### Task 6: Practice question count (logic, session, resume)

**Files:**
- Create: `src/features/practice/logic/question-count.ts`
- Modify: `src/features/practice/options.ts`, `src/features/practice/session.svelte.ts`
- Test: `src/features/practice/logic/question-count.test.ts`, `src/features/practice/options.test.ts`, `src/features/practice/session.test.ts`

**Interfaces:**
- Produces: `MIN_PRACTICE_QUESTIONS = 10`; `validateQuestionCount(value: unknown, poolSize: number): { ok: true; count: number } | { ok: false; reason: 'notInteger' | 'tooFew' | 'tooMany' }`; `quickCounts(poolSize: number): (number | 'all')[]` (10; 20 and 50 only when `< poolSize`; `'all'` when `poolSize > 10`).
- Modifies: `PracticeOptions` gains `questionCount: number` (default `DEFAULT 10`; `parse()` accepts stored objects without it); `PracticeSession.start(services, topicId, options, onSubmitted)` draws `options.questionCount` clamped by the pool and stores `plannedCount` on the attempt; `PracticeSession.resume` replaces `expected = min(practiceCount…)` with `attempt.plannedCount` (NULL → skip the partial check).

- [ ] **Step 1: Write failing tests:** `validateQuestionCount('', 50)` → notInteger; `(9,50)` → tooFew; `(10.5,50)` → notInteger; `(51,50)` → tooMany; `(10,10)` and `(50,50)` ok; `quickCounts(26)` → `[10,20,'all']`, `quickCounts(113)` → `[10,20,50,'all']`, `quickCounts(10)` → `[10]`. `options.test.ts`: stored JSON without `questionCount` loads as 10. `session.test.ts`: starting with `questionCount: 25` on a 40-question topic creates 25 `attempt_questions` and `plannedCount = 25`; resuming that attempt succeeds; deleting one question row then resuming throws `CorruptAttemptError('partial attempt')`; an attempt with `plannedCount = null` resumes without the check.
- [ ] **Step 2: Run** `npx vitest run src/features/practice` → FAIL.
- [ ] **Step 3: Implement** as specified; validation lives only in `question-count.ts`.
- [ ] **Step 4: Run** the same command → PASS.
- [ ] **Step 5: Commit** `feat(practice): choose the number of practice questions`.

### Task 7: Question count control in the practice setup

**Files:**
- Modify: `src/features/practice/ui/PracticeSetup.svelte`, `src/i18n/en.json`, `src/i18n/vi.json`
- Test: `src/features/practice/ui/PracticeSetup.test.ts`

**Interfaces:**
- Consumes: Task 6 (`validateQuestionCount`, `quickCounts`, `PracticeOptions.questionCount`).
- Produces: a labelled number input (`practice.setup.countLabel`) plus quick buttons (`practice.setup.countAll` etc.), an error `role="alert"` for each invalid reason, the Start button disabled while invalid; the header line shows the chosen count; the chosen count is saved with the other last options. When time limiting is on, the minutes/seconds fields are pre-filled once from `ceil(count × 90/65)` minutes only if the user has not edited them (Spec §5).

- [ ] **Step 1: Write failing tests** (testing-library): typing `9` shows the too-few alert and disables Start; `1000` shows too-many; quick button `20` sets the input to 20; `All` sets it to the pool size; starting with 15 creates a session of 15 questions; the saved choice is restored on the next render; the input is labelled (accessible name).
- [ ] **Step 2: Run** `npx vitest run src/features/practice/ui/PracticeSetup.test.ts` → FAIL.
- [ ] **Step 3: Implement** with Svelte 5 runes; run the `svelte-autofixer` MCP on the component after editing and fix reported issues; add the i18n keys to both files.
- [ ] **Step 4: Run** the test file and `npx vitest run src/i18n` → PASS.
- [ ] **Step 5: Commit** `feat(practice): add question count control to the setup screen`.

### Task 8: `PracticeSession.startExam` and exam-aware resume

**Files:**
- Modify: `src/features/practice/session.svelte.ts`, `src/features/practice/index.ts`
- Test: `src/features/practice/session-exam.test.ts` (new)

**Interfaces:**
- Consumes: Task 4 `PlannedQuestion[]`, Task 5 records.
- Produces: `PracticeSession.startExam(services: Services, input: { kind: 'checkpoint' | 'practice'; topicId: string | null; groupIndex: number | null; plan: PlannedQuestion[]; limitMs: number }, onSubmitted: () => Promise<void>): Promise<PracticeSession>` — creates the attempt with `reviewAllowed: false`, clock `run` / `onHidden: 'run'`, `plannedCount = plan.length`; `PracticeSession.resume` handles `kind === 'checkpoint'` (requires `groupIndex`, else `CorruptAttemptError`) and `kind === 'practice'` with `topicId === 'capstone'` through the same `plannedCount` check; `session.kind` exposes `'checkpoint'`.

- [ ] **Step 1: Write failing tests** with a fake clock (`services.now`): after `startExam` the session reports `allowReview === false` and `openKnowledge()` throws `KnowledgeNotAllowedError`; ticking past `limitMs` auto-submits with `submitReason === 'timeout'` and unanswered questions graded wrong; resume of a `run`-mode checkpoint whose deadline passed returns `autoSubmit: true` and, after `submit('timeout')`, the stored attempt has `status 'submitted'` and `passed` computed from answered questions only; `exit()` deletes the attempt; a checkpoint attempt with `groupIndex = null` makes `resume` throw `CorruptAttemptError`.
- [ ] **Step 2: Run** `npx vitest run src/features/practice/session-exam.test.ts` → FAIL.
- [ ] **Step 3: Implement** `startExam` next to `startReview`, reusing `startClock(limitMs, 'run', now, 'run')`; no change to grading.
- [ ] **Step 4: Run** `npx vitest run src/features/practice` → PASS.
- [ ] **Step 5: Commit** `feat(practice): start exam-mode sessions`.

### Task 9: Gates in topic status and app state

**Files:**
- Modify: `src/features/mindmap/logic/topic-status.ts`, `src/features/mindmap/index.ts`, `src/app/app-state.svelte.ts`, `src/features/history/logic/history-stats.ts`
- Test: `src/features/mindmap/logic/topic-status.test.ts`, `src/app/app-state.test.ts`, `src/features/history/logic/history-stats.test.ts`

**Interfaces:**
- Consumes: Task 2 `checkpointGroups`, `gateBefore`.
- Produces: `passedCheckpointGroups(attempts: AttemptRow[]): Set<number>` (submitted, `kind === 'checkpoint'`, `passed === true`, by `groupIndex`); `checkpointState(group: CheckpointGroup, completed: Set<string>, passed: Set<number>): 'locked' | 'available' | 'passed'` (locked until all topics of the group are in `completed`); `topicStatuses(topics, completed, passedGroups: Set<number>)` — the first not-done topic is `current` only if `gateBefore(...)` is null or already passed, otherwise it and everything after are `locked`; `completedTopicIds` still ignores checkpoints. `AppState.passedGroups: Set<number>` set in `refresh()`; `Route` gains `{ view: 'checkpoint'; groupIndex: number }`; history `ScorePoint.kind` widens to include `'checkpoint'` and `weakTopics` keeps ignoring non-practice kinds.

- [ ] **Step 1: Write failing tests:** with topics 1-3 completed and no passed group, `topicStatuses` marks topic 4 `locked` and no topic `current`; adding group 1 to `passedGroups` makes topic 4 `current`; Capstone stays locked until group 4 is passed; a submitted passed checkpoint attempt does **not** appear in `completedTopicIds`; `passedCheckpointGroups` ignores failed and in-progress attempts; `checkpointState` returns locked/available/passed correctly; `AppState.refresh()` fills `passedGroups` from a seeded passed checkpoint; `weakTopics` ignores checkpoint attempts.
- [ ] **Step 2: Run** `npx vitest run src/features/mindmap src/app src/features/history/logic` → FAIL.
- [ ] **Step 3: Implement**; keep the existing two-argument call sites compiling by passing `appState.passedGroups` where `topicStatuses` is used.
- [ ] **Step 4: Run** the same command and `npm run check` → PASS.
- [ ] **Step 5: Commit** `feat(mindmap): gate topic groups behind checkpoint exams`.

### Task 10: Exam orchestration and saved options

**Files:**
- Create: `src/features/exam/start-exam.ts`, `src/features/exam/options.ts`, `src/features/exam/index.ts`
- Test: `src/features/exam/start-exam.test.ts`, `src/features/exam/options.test.ts`

**Interfaces:**
- Consumes: Tasks 1, 2, 4, 8.
- Produces: `interface ExamOptions { extraTime: boolean }`; `loadExamOptions(settings: SettingsRepo): Promise<ExamOptions>` / `saveExamOptions(...)` (settings key `exam_last_options`, default `{ extraTime: false }`, never throws on bad data); `startCheckpoint(services: Services, groupIndex: number, options: ExamOptions, onSubmitted: () => Promise<void>): Promise<PracticeSession>`; `startCapstoneExam(services, options, onSubmitted): Promise<PracticeSession>`; both throw `ExamNotAvailableError` when fewer than `EXAM_MIN_QUESTIONS` questions can be drawn, and `startCheckpoint` also throws it for an unknown `groupIndex`. Whether the group's topics are completed is **not** checked here: the UI (Task 11) enforces availability, which keeps this layer pure and testable.

- [ ] **Step 1: Write failing tests** using `buildServices` with the real bundled catalog and a seeded history: `startCheckpoint(…, 1, {extraTime:false})` creates an attempt with 65 questions, `limitMs === 5_400_000`, kind `checkpoint`, `groupIndex 1`; with `extraTime:true` the limit is 7_200_000; a second call after submitting the first (all answered) draws questions disjoint from the first as long as unseen questions remain; with a fake catalog of 7 questions it throws `ExamNotAvailableError`; with 40 questions the limit is `examLimitMs(40,false)`; `startCapstoneExam` creates a `practice` attempt with `topicId 'capstone'`, 65 questions and the 16/19/22/8 domain split; saved options round-trip and a corrupt stored value yields the default.
- [ ] **Step 2: Run** `npx vitest run src/features/exam` → FAIL.
- [ ] **Step 3: Implement** by composing `historyOf(await repos.attempts.listGradedAnswers())`, the draw functions, `planQuestions`, `examLimitMs` and `PracticeSession.startExam`; seed the rng with `services.now() % 0x100000000` like the existing code.
- [ ] **Step 4: Run** `npx vitest run src/features/exam` → PASS.
- [ ] **Step 5: Commit** `feat(exam): start checkpoint and Capstone exams`.

### Task 11: Exam setup screen, routes and resume

**Files:**
- Create: `src/features/exam/ui/ExamSetup.svelte`, `src/features/exam/ui/ExamScreen.svelte`
- Modify: `src/app/App.svelte`, `src/app/AppHeader.svelte`, `src/features/practice/ui/PracticeScreen.svelte`, `src/features/practice/ui/PracticeSessionView.svelte`, `src/features/practice/ui/ResumeGate.svelte` (only if its route logic needs it), `src/i18n/en.json`, `src/i18n/vi.json`
- Test: `src/features/exam/ui/ExamSetup.test.ts`, `src/features/exam/ui/ExamScreen.test.ts`, `src/app/App.test.ts`

**Interfaces:**
- Consumes: Tasks 9, 10.
- Produces: `ExamScreen` props `{ services, appState, groupIndex: number | null /* null = Capstone */, initialSession?: PracticeSession | null }`; `ExamSetup` shows title, rules (65 questions, minutes, no review, one sitting), the extra-time checkbox (saved), the computed time, and a Start button disabled when the group is not `available` (message names what is missing); `PracticeScreen` renders `ExamScreen` with `groupIndex = null` when `topicId === 'capstone'`; `App.svelte` routes `view: 'checkpoint'`; `onresumed` opens the checkpoint route for `session.kind === 'checkpoint'` and the practice route for Capstone; the header nav is hidden on the checkpoint route like on practice.

- [ ] **Step 1: Write failing tests:** ExamSetup for group 1 with only 2 topics completed shows the locked reason and a disabled Start; with all 3 completed Start is enabled and shows "90 minutes", toggling extra time shows "120 minutes" and saves the choice; starting opens the session view with the timer and **no** "Review knowledge" button; Exit asks for confirmation and abandons the attempt (row deleted); `App` routes `{view:'checkpoint', groupIndex:1}` to the exam screen; a resumed in-progress checkpoint opens the checkpoint route.
- [ ] **Step 2: Run** `npx vitest run src/features/exam/ui src/app` → FAIL.
- [ ] **Step 3: Implement** reusing `PracticeSessionView` for the running exam; run `svelte-autofixer` on every new/changed `.svelte` file; add i18n keys to both locale files.
- [ ] **Step 4: Run** the same command and `npx vitest run src/i18n` → PASS.
- [ ] **Step 5: Commit** `feat(exam): add exam setup and screens`.

### Task 12: Exam results and unlock messaging

**Files:**
- Create: `src/features/exam/ui/ExamBreakdown.svelte`
- Modify: `src/features/practice/ui/PracticeResult.svelte`, `src/features/practice/ui/PracticeScreen.svelte`, `src/features/exam/ui/ExamScreen.svelte`, `src/i18n/en.json`, `src/i18n/vi.json`
- Test: `src/features/exam/ui/ExamBreakdown.test.ts`, `src/features/practice/ui/PracticeResult.test.ts`, `src/features/practice/ui/PracticeScreen.test.ts`

**Interfaces:**
- Produces: `ExamBreakdown` props `{ services, items: SubmitResult['items'] }` — per-topic correct/total (unassigned shown in the overall score only, not as a domain row); `PracticeResult` gains `mode: 'practice' | 'review' | 'exam'` (exam shows pass/fail against 80% and the breakdown, and the retry button starts a **new draw**); `PracticeScreen` stops saying the next topic unlocked when the finished topic is the last of its group and shows the "take the checkpoint" hint instead (`practice.result.checkpointNext`).

- [ ] **Step 1: Write failing tests:** breakdown rows sum to the overall correct count; an exam result at 79% shows "not passed", at 80% "passed"; finishing topic 3 for the first time shows the checkpoint hint and not the "next topic unlocked" text; finishing topic 2 still shows the normal unlock text; retry on an exam result calls the start function again and the new attempt id differs.
- [ ] **Step 2: Run** `npx vitest run src/features/exam/ui src/features/practice/ui` → FAIL.
- [ ] **Step 3: Implement**, `svelte-autofixer` on changed components, i18n keys in both files.
- [ ] **Step 4: Run** the same command → PASS.
- [ ] **Step 5: Commit** `feat(exam): show exam results and checkpoint hints`.

### Task 13: Checkpoint nodes on the tree

**Files:**
- Create: `src/features/mindmap/ui/CheckpointNode.svelte`
- Modify: `src/features/mindmap/logic/tree-layout.ts`, `src/features/mindmap/ui/TreeCanvas.svelte`, `src/features/mindmap/ui/TrunkWater.svelte` (only if the water must stop at an unpassed gate), `src/i18n/en.json`, `src/i18n/vi.json`
- Test: `src/features/mindmap/logic/tree-layout.test.ts`, `src/features/mindmap/ui/TreeScreen.test.ts`

**Interfaces:**
- Consumes: Task 9 `checkpointState`, `CheckpointGroup`.
- Produces: `TreeLayout.checkpoints: { groupIndex: number; y: number; afterTopicId: string }[]`; `layoutTree(topics, { expandedTopicId })` inserts `CHECKPOINT_GAP = 70` of extra vertical space after the last topic of each group and places each node on the trunk centre line between that branch and the next; `CheckpointNode` shows state (locked 🔒 / available / passed ✓, never colour only), has an accessible name with the group number, and opens `{ view: 'checkpoint', groupIndex }` when available.

- [ ] **Step 1: Write failing tests:** the 13-topic layout has 4 checkpoints, each `y` strictly between the surrounding branch `y` values, branches after a checkpoint are shifted by `CHECKPOINT_GAP`, existing branch geometry before the first checkpoint is unchanged; rendering the tree with topics 1-3 completed shows checkpoint 1 as available and clicking it navigates to the checkpoint route; with nothing completed it is locked and not clickable; with group 1 passed it shows ✓.
- [ ] **Step 2: Run** `npx vitest run src/features/mindmap` → FAIL.
- [ ] **Step 3: Implement**; before finalising, open the real app (`run` skill: `npx tauri dev`) and check the tree visually, including reduced-motion; run `svelte-autofixer`.
- [ ] **Step 4: Run** `npx vitest run src/features/mindmap` and `npm run check` → PASS.
- [ ] **Step 5: Commit** `feat(mindmap): show checkpoint exam nodes on the tree`.

### Task 14: History for checkpoint attempts

**Files:**
- Modify: `src/features/history/ui/AttemptsTable.svelte`, `src/features/history/ui/ScoreChart.svelte`, `src/features/history/ui/HistoryScreen.svelte`, `src/features/history/logic/missed-filter.ts` (if it assumes a topic), `src/i18n/en.json`, `src/i18n/vi.json`
- Test: `src/features/history/ui/HistoryScreen.test.ts`, `src/features/history/ui/ScoreChart.test.ts`, `src/features/history/ui/MissedQuestionsDialog.test.ts`, `src/features/history/logic/missed-filter.test.ts`

**Interfaces:**
- Produces: kind label `history.kind.checkpoint` ("Checkpoint" / "Kiểm tra nhóm"); pass/fail shown for `practice` and `checkpoint`; chart legend and a third marker shape for checkpoints; the topic filter still lists only catalog topics, and "All" includes checkpoint attempts; missed-question counting includes checkpoint answers.

- [ ] **Step 1: Write failing tests:** a seeded checkpoint attempt (topicId null, groupIndex 2) appears in the table with the checkpoint label and a pass/fail mark; it renders a chart marker with `data-kind="checkpoint"`; selecting a topic in the filter hides it, "All" shows it; its wrong answers appear in the most-missed dialog.
- [ ] **Step 2: Run** `npx vitest run src/features/history` → FAIL.
- [ ] **Step 3: Implement**; `svelte-autofixer` on changed components; i18n keys in both files.
- [ ] **Step 4: Run** `npx vitest run src/features/history src/i18n` → PASS.
- [ ] **Step 5: Commit** `feat(history): list checkpoint attempts`.

### Task 15: Lesson contract update and service-coverage guard

**Files:**
- Create: `scripts/content/measure-coverage.ts`, `content/review/service-coverage.json`, `src/content/service-coverage.test.ts`
- Modify: `src/content/bundled-content.test.ts`
- Test: those two test files

**Interfaces:**
- Produces: contract change in `bundled-content.test.ts`: lessons per topic **8-14** (Capstone: 5-8), required ≥ 3, optional ≥ 1 with every optional having a `videoQuery`, required prose words **250-900** (existing lessons stay valid; new lessons target 600-900 per spec §8); `service-coverage.json` shape `{ "services": [{ "name": string, "aliases": string[], "topicId": string }] }`; `measure-coverage.ts` prints every `Amazon|AWS …` name found in `content/questions/imported.json` that no lesson body contains (output only, run with `npx tsx scripts/content/measure-coverage.ts`); `service-coverage.test.ts` fails when a listed service (name or any alias, case-insensitive, hyphen/space tolerant) is missing from every lesson body of its `topicId`.

- [ ] **Step 1: Write the failing contract test edits** (new ranges) and `service-coverage.test.ts` against an initial `service-coverage.json` containing the 27 uncovered and 10 thin services from spec §8 mapped to their topic from the per-topic table in Task 17. The new contract tests fail because current topics have 5 lessons; the coverage test fails for every uncovered service.
- [ ] **Step 2: Run** `npx vitest run src/content` → FAIL (expected until Task 17 batches land).
- [ ] **Step 3: Implement** `measure-coverage.ts`; run it once, review the printed list with the user's spec list, and finalise `service-coverage.json` (the guard is only added to the suite when a topic's batch lands: mark each entry with `"active": false` until its topic batch task sets it `true`, and have the test skip inactive entries).
- [ ] **Step 4: Run** `npx vitest run src/content` → contract tests for not-yet-expanded topics must be skipped via the same "active topics" list that Task 17 extends, so the suite stays green at this commit.
- [ ] **Step 5: Commit** `test(content): widen lesson contract and add service coverage guard`.

### Task 16: Capstone lessons match the official exam

**Files:**
- Modify: `content/lessons/capstone/01-exam-format.en.md`, `content/lessons/capstone/01-exam-format.vi.md`, `content/lessons/capstone/04-final-review.{en,vi}.md` (if they quote 30 questions)
- Create: `content/lessons/capstone/06-exam-registration-and-accommodations.{en,vi}.md`
- Modify: `content/topics.json` (`capstone.lessonIds`)
- Test: `src/content/bundled-content.test.ts`

**Interfaces:**
- Produces: the exam-format lesson states 65 questions (50 scored + 15 unscored), 90 minutes, +30 minutes for non-native English speakers (request once before registering, "ESL +30 MINUTES"), pass 700/1000, four domains with 24/30/34/12%; its "How this app compares" section says checkpoints and Capstone are 65 questions in 90 (120) minutes with an 80% pass mark and no unscored questions; the new lesson covers registration, online vs test centre, accommodations. Sources: only `docs.aws.amazon.com` / `aws.amazon.com` links already verified in spec §11.

- [ ] **Step 1: Write the failing assertion** in `bundled-content.test.ts`: the exam-format lesson (en) contains `90 minutes` and `ESL` and does not contain `30 questions`; Capstone has 6 lessons.
- [ ] **Step 2: Run** `npx vitest run src/content/bundled-content.test.ts` → FAIL.
- [ ] **Step 3: Write** the EN and VI lesson text (EN first, then VI), update `topics.json`.
- [ ] **Step 4: Run** the same command → PASS.
- [ ] **Step 5: Commit** `docs(content): align the Capstone exam lesson with the official exam`.

### Task 17: Lesson batches, one task per topic (17.1-17.12)

Each batch is its own task and its own commit. All twelve follow the same steps; the table fixes what each batch adds. Existing lesson ids stay; files are renumbered with `git mv` so the `NN-` prefix follows reading order; each topic keeps its `*-further` lesson last and optional.

**Per-batch files:** `content/lessons/<topic>/NN-<slug>.{en,vi}.md` (new, front matter `id: <topic>-<slug>`, `title`, `required`, and `videoQuery` for optional lessons), `content/topics.json` (`lessonIds` in file order), `content/review/service-coverage.json` (set the topic's entries `"active": true`), the active-topics list in `src/content/bundled-content.test.ts` and `src/content/service-coverage.test.ts`.

**Per-batch steps:**
- [ ] **Step 1: Re-run** `npx tsx scripts/content/measure-coverage.ts` and list the services of this topic still missing; confirm the table row below covers them (add a lesson or a section if not).
- [ ] **Step 2: Research** each service on the official AWS documentation (`web-research` skill); keep one or two source links per required lesson from `docs.aws.amazon.com` / `aws.amazon.com`; discard anything not verified.
- [ ] **Step 3: Write** each new lesson in English then Vietnamese: sections as in existing lessons, a `## Key points` (`## Ý chính`) section and a final `## Sources` (`## Nguồn`) section with 1-3 links on required lessons; required lessons 600-900 prose words (EN); no h1.
- [ ] **Step 4: Fact review:** a fresh reviewer re-reads every claim against its source and the batch's questions in `imported.json`; fix findings before the next step.
- [ ] **Step 5: Update** `topics.json`, `service-coverage.json` (activate) and the active-topics lists; run `npx vitest run src/content` → PASS and `npm test` → PASS.
- [ ] **Step 6: Commit** `docs(content): expand <topic> lessons` with the four-section body.

| Task | Topic | New lessons (slug — required?) | Services that must appear |
| --- | --- | --- | --- |
| 17.1 | cloud-concepts | traditional-it-to-cloud (R), well-architected-pillars (R), right-sizing-and-elasticity (R), well-architected-tool (O), sustainability-carbon-footprint (O) | Well-Architected Tool, Customer Carbon Footprint Tool |
| 17.2 | global-infrastructure | region-selection-and-residency (R), global-vs-regional-services (R), global-accelerator-transfer-acceleration (R), global-application-architecture (O) | Global Accelerator, S3 Transfer Acceleration |
| 17.3 | compute | ec2-access-and-connectivity (R), ami-and-image-builder (R), elastic-load-balancing (R), auto-scaling-groups (R), ec2-placement-and-hosts (R), lightsail-batch-apprunner (O) | Image Builder, Auto Scaling, Placement Groups, Lightsail, App Runner, OpsWorks |
| 17.4 | storage | ebs-volumes-snapshots (R), instance-store-efs-fsx (R), s3-security-encryption (R), s3-versioning-replication-lifecycle (R), snow-family (R), s3-website-express-one-zone (O) | Snowmobile, Snowball Edge, Express One Zone, FSx |
| 17.5 | networking | vpc-subnets-gateways (R), vpc-endpoints-privatelink (R), vpc-peering-transit-gateway (R), site-to-site-and-client-vpn (R), flow-logs-network-monitoring (O) | PrivateLink, VPC Endpoint, Transit Gateway, Client VPN, Network Firewall |
| 17.6 | databases | rds-deployment-options (R), aurora-in-depth (R), dynamodb-global-tables (R), elasticache-in-depth (R), analytics-redshift-emr-athena (R), quicksight-glue-lake-formation (O) | QuickSight, EMR, Glue, Lake Formation, DocumentDB, Neptune, Timestream, QLDB |
| 17.7 | deploy-operate | cloudformation-and-cdk (R), elastic-beanstalk-and-app-runner (R), developer-tools (R), systems-manager (R), cloudwatch-in-depth (R), cloudtrail-config-health (R), eventbridge-sqs-sns (O) | Cloud9, CodeGuru, CodeStar, Step Functions, Fault Injection Simulator, Amazon MQ, AppSync |
| 17.8 | shared-responsibility | responsibility-iam-ec2 (R), responsibility-storage-databases (R), patching-and-configuration (R), acceptable-use-and-pen-testing (O) | Artifact |
| 17.9 | iam-security | iam-users-groups-policies (R), iam-roles-and-sts (R), mfa-and-access-keys (R), identity-center-cognito-directory (R), kms-and-cloudhsm (R), acm-and-secrets-manager (R), ddos-waf-shield-firewall-manager (R), guardduty-inspector-macie (R), config-security-hub-detective (R), access-analyzer-and-root-user (O) | STS, Directory Service, Certificate Manager, Firewall Manager, Detective, IAM Access Analyzer |
| 17.10 | pricing-billing | organizations-consolidated-billing (R), control-tower-and-ram (R), savings-plans-and-reserved (R), cost-management-tools (R), pricing-calculator-trusted-advisor (R), service-catalog-and-quotas (R), marketplace-and-license-manager (O) | Service Catalog, Control Tower, Resource Access Manager, License Manager, Service Quotas, Savings Plans, Cost Anomaly Detection, Billing Conductor, Data Exchange |
| 17.11 | migration-caf | disaster-recovery-strategies (R), elastic-disaster-recovery (R), discovery-and-migration-service (R), migration-hub-and-evaluator (R), data-transfer-services (O) | Elastic Disaster Recovery, Application Migration Service, Migration Hub, DataSync |
| 17.12 | support-ai-other | rekognition-textract-comprehend (R), transcribe-polly-translate-lex (R), sagemaker-kendra-personalize-forecast (R), workspaces-and-appstream (R), iot-core-and-ground-station (O), amplify-and-device-farm (O), partners-iq-repost-knowledge-center (R), managed-and-professional-services (R) | Personalize, Forecast, Ground Station, Pinpoint, WorkSpaces, AppStream, IQ, re:Post, Managed Services, Developer Support |

(Slugs and the R/O flag are the builder's starting point; adjust a slug or merge two lessons when the measure-coverage output or the official docs justify it, but keep each topic within 8-14 lessons, ≥ 3 required, ≥ 1 optional with a `videoQuery`.)

### Task 18: Documentation and final verification

**Files:**
- Modify: `README.md`, `docs/usp-select-skills/2026-11-04-checkpoint-tests-and-practice-count-skills.md` (append the steps used)

**Interfaces:** none.

- [ ] **Step 1: Update** `README.md`: status line (lessons per topic, 668 + authored questions), a "Checkpoint exams" paragraph (groups, 65 questions, 90/120 minutes, 80%, gate), the new migration note, and the content procedure for lessons and `service-coverage.json`.
- [ ] **Step 2: Run** `npm test`, `npm run check`, `npm run build` → all pass, output read.
- [ ] **Step 3: Run the real app** (`run` skill, `npx tauri dev`) and walk through: practice with a custom count; finish topics 1-3 and see checkpoint 1 become available; start it, confirm the 90-minute timer and no review button; close the app mid-exam and reopen to the resume prompt; submit; confirm group 2 unlock only after a pass; Capstone reachable only after checkpoint 4.
- [ ] **Step 4: Request** one fresh whole-branch review (`requesting-code-review`), fix Critical/Important findings test-first, record Minor ones as deferred.
- [ ] **Step 5: Commit** `docs(readme): document checkpoint exams and lesson coverage`.

---

## Self-review (spec coverage)

- §5 practice count → Tasks 6, 7. §6.1-6.3 groups, draw, time → Tasks 1-4, 10. §6.4 exam mode, resume, exit → Tasks 8, 11. §6.5 re-draw → Tasks 4, 10. §6.6 gate → Tasks 2, 9, 13. §6.7 stats and history → Tasks 12, 14 (stats rebuild reads all submitted attempts by `question_id`, so checkpoint answers feed `question_stats` with no code change; asserted in Task 10 tests via a rebuild check). §7 Capstone → Tasks 3, 4, 10, 11, 16. §8 lessons → Tasks 15-17. §10.1 DB representation → Task 5. §11b decisions → Tasks 5, 6, 9, 10.
- Type consistency: `CheckpointGroup`, `AnswerHistory`, `ExamOptions`, `PlannedQuestion`, `AttemptRow.groupIndex/plannedCount` are defined once and reused with the same names.
- Gap noted: spec §8's 600-900 words is the authoring target; the enforced test range stays 250-900 because the 65 existing lessons are shorter (plan ruling, change the test floor later if all lessons are lengthened).
