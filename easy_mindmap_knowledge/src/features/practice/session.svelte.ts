import type { Services } from '@/app/composition';
import { AttemptMissingError } from '@/persistence';
import type { AttemptQuestionRow, AttemptRow, ClockState } from '@/persistence';
import { advanceFreeze, isExpired, remainingAt, resolveOnResume, settleHidden as settleClockHidden, startClock } from './logic/attempt-clock';
import { gradeQuestion, passes } from './logic/grading';
import { buildPool, planAttempt, practiceCount } from './logic/pick-questions';
import { makeRng, shuffle } from '@/random/seeded-random';
import { CorruptAttemptError, KnowledgeNotAllowedError, NoQuestionsError } from './errors';
import { saveLastOptions } from './options';
import type { PracticeOptions } from './options';

export interface SubmitResult {
  scorePct: number;
  correct: number;
  total: number;
  passed: boolean;
  items: { questionId: string; selected: string[]; correct: string[]; isCorrect: boolean; explanation?: string }[];
}

export interface SessionQuestion {
  position: number;
  questionId: string;
  optionOrder: string[];
  multi: boolean;
  selected: string[];
}

type Reason = 'manual' | 'timeout';
const CLOCK_SAVE_EVERY_MS = 5000;
/**
 * Most elapsed time one tick may charge in FREEZE mode. Ticks come once a second, so a longer gap means
 * the app was suspended or asleep; that counts as an app problem and the clock stands still (spec 4.3).
 * Run mode derives time from the deadline and needs no cap.
 */
export const FREEZE_MAX_TICK_MS = 3000;

const view = (q: SessionQuestion): SessionQuestion =>
  Object.freeze({ ...q, optionOrder: Object.freeze([...q.optionOrder]) as string[], selected: Object.freeze([...q.selected]) as string[] });

/**
 * One practice attempt. Time comes only from `services.now()` (never Date.now) so tests and
 * resume logic are deterministic. The session never imports AppState: the UI passes
 * `onSubmitted` (normally `appState.refresh`).
 */
export class PracticeSession {
  readonly attemptId: string;
  readonly kind: AttemptRow['kind'];
  readonly topicId: string | null;
  readonly allowReview: boolean;

  // $state.raw + frozen items: components cannot mutate selections and bypass persistence.
  #questions = $state.raw<readonly SessionQuestion[]>([]);
  #index = $state(0);
  #remainingMs = $state<number | null>(null);
  #submitted = $state(false);
  #result = $state.raw<SubmitResult | null>(null);
  #knowledgeOpen = $state(false);
  #submitReason = $state<Reason | null>(null);

  #clock: ClockState;
  #sinceSave = 0;
  /** Set synchronously when submit/exit begins so no further mutation or timeout can interleave. */
  #closed = false;
  /** Set synchronously by exit(); permanent. Nothing may write to a discarded attempt. */
  #exited = false;
  #exitPromise: Promise<void> | null = null;
  #inflight: Promise<SubmitResult> | null = null;

  private constructor(
    private readonly services: Services,
    private readonly onSubmitted: () => Promise<void>,
    attempt: AttemptRow,
    questions: AttemptQuestionRow[],
    clock: ClockState,
  ) {
    this.attemptId = attempt.id;
    this.kind = attempt.kind;
    this.topicId = attempt.topicId;
    this.allowReview = attempt.reviewAllowed;
    this.#clock = clock;
    this.#remainingMs = remainingAt(clock, services.now());
    const byId = new Map(services.catalog.questions.map((q) => [q.id, q]));
    this.#questions = questions.map((q) =>
      view({
        position: q.position,
        questionId: q.questionId,
        optionOrder: q.optionOrder,
        multi: byId.get(q.questionId)?.multi ?? false,
        selected: q.selected,
      }),
    );
  }

  get questions(): readonly SessionQuestion[] { return this.#questions; }
  get index(): number { return this.#index; }
  get remainingMs(): number | null { return this.#remainingMs; }
  get submitted(): boolean { return this.#submitted; }
  get result(): SubmitResult | null { return this.#result; }
  get knowledgeOpen(): boolean { return this.#knowledgeOpen; }
  /** Why the attempt is (being) submitted; set by the first submit request, cleared if that submit fails. */
  get submitReason(): Reason | null { return this.#submitReason; }

  static async start(
    services: Services,
    topicId: string,
    options: PracticeOptions,
    onSubmitted: () => Promise<void>,
  ): Promise<PracticeSession> {
    const pool = buildPool(services.catalog, topicId);
    if (pool.length === 0) throw new NoQuestionsError(topicId);
    const now = services.now();
    // Shuffles happen exactly once, here; resume replays the stored order.
    const plan = planAttempt(pool, practiceCount(topicId), makeRng(now % 0x100000000));
    const clock = startClock(options.limitMs, options.clockMode, now, options.onHidden);
    const attempt: AttemptRow = {
      id: services.newId(), kind: 'practice', topicId, status: 'in_progress', startedAt: now,
      submittedAt: null, submitReason: null, reviewAllowed: options.allowReview, clock,
      heartbeatAt: now, scorePct: null, passed: null,
    };
    const rows: AttemptQuestionRow[] = plan.map((p, position) => ({
      attemptId: attempt.id, position, questionId: p.questionId, optionOrder: p.optionOrder,
      selected: [], isCorrect: null,
    }));
    await saveLastOptions(services.repos.settings, options);
    await services.repos.attempts.create(attempt, rows);
    return new PracticeSession(services, onSubmitted, attempt, rows, clock);
  }

  /**
   * Starts a review batch: questions in the GIVEN order (the plan already shuffled them), options
   * shuffled once and stored, no time limit, no topic. Leaves `practice_last_options` alone.
   */
  static async startReview(
    services: Services,
    questionIds: string[],
    onSubmitted: () => Promise<void>,
  ): Promise<PracticeSession> {
    if (questionIds.length === 0) throw new NoQuestionsError('review');
    const dup = questionIds.find((id, i) => questionIds.indexOf(id) !== i);
    if (dup !== undefined) throw new Error(`Duplicate question id "${dup}" in review batch`);
    const byId = new Map(services.catalog.questions.map((q) => [q.id, q]));
    const now = services.now();
    const rng = makeRng(now % 0x100000000);
    const rows: AttemptQuestionRow[] = [];
    const id = services.newId();
    questionIds.forEach((questionId, position) => {
      const q = byId.get(questionId);
      if (!q) throw new Error(`Unknown question id "${questionId}" in review batch`);
      const keys = q.options.map((o) => o.key);
      rows.push({
        attemptId: id, position, questionId, optionOrder: q.orderDependent ? keys : shuffle(keys, rng),
        selected: [], isCorrect: null,
      });
    });
    const clock = startClock(null, 'freeze', now, 'freeze');
    const attempt: AttemptRow = {
      id, kind: 'review', topicId: null, status: 'in_progress', startedAt: now,
      submittedAt: null, submitReason: null, reviewAllowed: true, clock,
      heartbeatAt: now, scorePct: null, passed: null,
    };
    await services.repos.attempts.create(attempt, rows);
    return new PracticeSession(services, onSubmitted, attempt, rows, clock);
  }

  static async resume(
    services: Services,
    found: { attempt: AttemptRow; questions: AttemptQuestionRow[] },
    onSubmitted: () => Promise<void>,
  ): Promise<{ session: PracticeSession; autoSubmit: boolean }> {
    const { attempt } = found;
    const questions = [...found.questions].sort((a, b) => a.position - b.position);
    if (questions.length === 0) throw new CorruptAttemptError('no questions');
    if (questions.some((q, i) => q.position !== i)) throw new CorruptAttemptError('positions are not 0..n-1');
    const known = new Set(services.catalog.questions.map((q) => q.id));
    if (questions.some((q) => !known.has(q.questionId))) throw new CorruptAttemptError('unknown question');
    if (attempt.kind === 'practice') {
      if (attempt.topicId === null) throw new CorruptAttemptError('practice attempt without topic');
      const expected = Math.min(practiceCount(attempt.topicId), buildPool(services.catalog, attempt.topicId).length);
      // Depends on the CURRENT catalog: a content update that shrinks a pool relaxes the check, and one that
      // grows it may flag an old attempt as partial; accepted, since the cost is only a discarded attempt.
      if (questions.length < expected) throw new CorruptAttemptError('partial attempt');
    }
    const now = services.now();
    const resolved = resolveOnResume(attempt.clock, now, attempt.heartbeatAt ?? attempt.startedAt);
    const session = new PracticeSession(services, onSubmitted, attempt, questions, resolved.state);
    return { session, autoSubmit: resolved.autoSubmit };
  }

  goTo(index: number): void {
    if (this.#closed || this.#exited) return;
    if (!Number.isInteger(index) || index < 0 || index >= this.#questions.length) return;
    this.#index = index;
  }

  async select(position: number, keys: string[]): Promise<void> {
    if (this.#closed || this.#exited) return;
    const prev = this.#questions[position];
    if (!prev) return;
    const selected = prev.multi ? [...keys] : keys.slice(0, 1);
    const next = view({ ...prev, selected });
    this.#questions = this.#questions.with(position, next);
    try {
      await this.services.repos.attempts.saveAnswer(this.attemptId, position, selected);
    } catch (e) {
      // Keep memory equal to the DB: undo, unless a newer select already replaced ours.
      if (this.#questions[position] === next) this.#questions = this.#questions.with(position, prev);
      throw e;
    }
  }

  /** Advance the clock. Not re-entrant-safe by design: UI calls it from one interval. */
  async tick(elapsedMs: number): Promise<void> {
    if (this.#closed || this.#exited || this.#clock.limitMs === null) return;
    const now = this.services.now();
    const frozen = this.#clock.mode === 'freeze';
    const charged = frozen ? Math.min(Math.max(0, elapsedMs), FREEZE_MAX_TICK_MS) : elapsedMs;
    if (frozen) {
      this.#clock = advanceFreeze(this.#clock, charged);
    } else {
      this.#clock = { ...this.#clock, remainingMs: remainingAt(this.#clock, now) };
    }
    this.#remainingMs = remainingAt(this.#clock, now);
    if (isExpired(this.#clock, now)) {
      await this.submit('timeout');
      return;
    }
    this.#sinceSave += Math.max(0, charged);
    if (this.#sinceSave >= CLOCK_SAVE_EVERY_MS) await this.flushClock();
  }

  /** Apply the tab-switch policy for `hiddenMs` the page spent hidden, then persist or time out. */
  async settleHidden(hiddenMs: number): Promise<void> {
    if (this.#closed || this.#exited || this.#clock.limitMs === null) return;
    const now = this.services.now();
    this.#clock = settleClockHidden(this.#clock, hiddenMs);
    this.#remainingMs = remainingAt(this.#clock, now);
    if (isExpired(this.#clock, now)) {
      await this.submit('timeout');
      return;
    }
    await this.flushClock();
  }

  async flushClock(): Promise<void> {
    if (this.#closed || this.#exited || this.#clock.limitMs === null) return;
    this.#sinceSave = 0;
    await this.services.repos.attempts.saveClock(this.attemptId, this.#clock, this.services.now());
  }

  openKnowledge(): void {
    if (!this.allowReview) throw new KnowledgeNotAllowedError();
    if (this.#closed || this.#exited) return;
    this.#knowledgeOpen = true; // the clock is deliberately not paused
  }

  closeKnowledge(): void {
    this.#knowledgeOpen = false;
  }

  submit(reason: Reason): Promise<SubmitResult> {
    if (this.#result) return Promise.resolve(this.#result);
    if (this.#inflight) return this.#inflight;
    if (this.#exited) return Promise.reject(new Error('Session was exited'));
    if (this.#closed) return Promise.reject(new Error('Session is closed'));
    this.#closed = true;
    this.#submitReason = reason;
    const run = this.#doSubmit(reason).finally(() => {
      this.#inflight = null;
    });
    this.#inflight = run;
    return run;
  }

  async #doSubmit(reason: Reason): Promise<SubmitResult> {
    const byId = new Map(this.services.catalog.questions.map((q) => [q.id, q]));
    const items: SubmitResult['items'] = this.#questions.map((sq) => {
      const cq = byId.get(sq.questionId);
      const correct = cq?.correct ?? [];
      return {
        questionId: sq.questionId,
        selected: [...sq.selected],
        correct: [...correct],
        isCorrect: gradeQuestion(correct, sq.selected),
        ...(cq?.explanation !== undefined ? { explanation: cq.explanation } : {}),
      };
    });
    const total = items.length;
    const correctCount = items.filter((i) => i.isCorrect).length;
    const result: SubmitResult = {
      scorePct: total === 0 ? 0 : Math.round((correctCount * 100) / total),
      correct: correctCount,
      total,
      passed: passes(correctCount, total),
      items,
    };
    try {
      await this.services.repos.attempts.markSubmitted(this.attemptId, {
        scorePct: result.scorePct,
        passed: result.passed,
        reason,
        at: this.services.now(),
        grades: items.map((it, position) => ({ position, isCorrect: it.isCorrect, selected: it.selected })),
      });
    } catch (e) {
      // Nothing was committed as submitted; allow a retry, but never resurrect an exited session.
      if (!this.#exited) {
        this.#closed = false;
        this.#submitReason = null;
      }
      throw e;
    }
    // From here the attempt IS submitted in the DB. Expose the result before any follow-up
    // work so a failure below cannot hide it; the error is still rethrown. Stats are a cache
    // rebuilt from history, and startup reconcile repairs them if rebuild or refresh failed.
    this.#result = result;
    this.#submitted = true;
    this.#knowledgeOpen = false;
    // Both follow-ups always run so UI state refreshes even if the stats rebuild failed; first error wins.
    let failure: { error: unknown } | null = null;
    try {
      await this.services.rebuildStats(items.map((i) => i.questionId));
    } catch (error) {
      failure = { error };
    }
    try {
      await this.onSubmitted();
    } catch (error) {
      failure ??= { error };
    }
    if (failure) throw failure.error;
    return result;
  }

  /**
   * Leave and discard. If a submit is in flight we wait for it to settle first (the user chose to
   * leave, so the attempt is then discarded anyway) and do NOT expose its result: the attempt no
   * longer exists, so `result` is cleared and stats are rebuilt without it. After a completed
   * submit, exit() is a no-op: the submitted attempt is history and must be kept.
   *
   * After a rejected discard the attempt row is re-checked. If it still exists nothing meaningful was
   * deleted, so the session is restored (answerable and submittable, or still showing a committed
   * result) and exit() may be called again. If the row is gone (half-failed discard) the session stays
   * exited, exit() rejects with AttemptMissingError, and a retry removes the leftover question rows.
   */
  exit(): Promise<void> {
    if (this.#exitPromise) return this.#exitPromise;
    if (this.#result && !this.#inflight) return Promise.resolve();
    this.#exited = true;
    this.#knowledgeOpen = false;
    this.#exitPromise = (async () => {
      const pending = this.#inflight;
      if (pending) await pending.catch(() => {});
      const kept = this.#result;
      this.#result = null;
      this.#submitted = false;
      try {
        await this.services.repos.attempts.discard(this.attemptId);
      } catch (e) {
        this.#exitPromise = null;
        // If the check itself fails, assume the row survived (restore, as before).
        const stillThere = await this.services.repos.attempts.exists(this.attemptId).catch(() => true);
        if (!stillThere) throw new AttemptMissingError(this.attemptId); // stays exited: not answerable
        this.#exited = false;
        if (kept) {
          // The submit committed before the discard failed: it is history now, show it.
          this.#result = kept;
          this.#submitted = true;
        } else {
          // A submit that failed while we waited left the session closed; reopen it for a retry.
          this.#closed = false;
          this.#submitReason = null;
        }
        throw e;
      }
      if (kept) {
        // The attempt was submitted for a moment: drop its contribution to the stats cache.
        await this.services.rebuildStats(kept.items.map((i) => i.questionId));
        await this.onSubmitted();
      }
    })();
    return this.#exitPromise;
  }
}
