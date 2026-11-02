import type { Services } from '@/app/composition';
import type { AttemptQuestionRow, AttemptRow, ClockState } from '@/persistence';
import { rebuildStatsFor } from '@/features/review';
import { advanceFreeze, isExpired, remainingAt, resolveOnResume, startClock } from './logic/attempt-clock';
import { gradeQuestion, passes } from './logic/grading';
import { buildPool, planAttempt, practiceCount } from './logic/pick-questions';
import { makeRng } from './logic/shuffle';
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
 * One practice attempt. Time comes only from `services.now()` (never Date.now) so tests and
 * resume logic are deterministic. The session never imports AppState: the UI passes
 * `onSubmitted` (normally `appState.refresh`).
 */
export class PracticeSession {
  readonly attemptId: string;
  readonly kind: AttemptRow['kind'];
  readonly topicId: string | null;
  readonly allowReview: boolean;

  #questions = $state<SessionQuestion[]>([]);
  #index = $state(0);
  #remainingMs = $state<number | null>(null);
  #submitted = $state(false);
  #result = $state.raw<SubmitResult | null>(null);
  #knowledgeOpen = $state(false);

  #clock: ClockState;
  #sinceSave = 0;
  /** Set synchronously when submit/exit begins so no further mutation or timeout can interleave. */
  #closed = false;
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
    this.#questions = questions.map((q) => ({
      position: q.position,
      questionId: q.questionId,
      optionOrder: [...q.optionOrder],
      multi: byId.get(q.questionId)?.multi ?? false,
      selected: [...q.selected],
    }));
  }

  get questions(): readonly SessionQuestion[] { return this.#questions; }
  get index(): number { return this.#index; }
  get remainingMs(): number | null { return this.#remainingMs; }
  get submitted(): boolean { return this.#submitted; }
  get result(): SubmitResult | null { return this.#result; }
  get knowledgeOpen(): boolean { return this.#knowledgeOpen; }

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
    const clock = startClock(options.limitMs, options.clockMode, now);
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

  static async resume(
    services: Services,
    found: { attempt: AttemptRow; questions: AttemptQuestionRow[] },
    onSubmitted: () => Promise<void>,
  ): Promise<{ session: PracticeSession; autoSubmit: boolean }> {
    const { attempt } = found;
    const questions = [...found.questions].sort((a, b) => a.position - b.position);
    if (questions.length === 0) throw new CorruptAttemptError('no questions');
    const known = new Set(services.catalog.questions.map((q) => q.id));
    if (questions.some((q) => !known.has(q.questionId))) throw new CorruptAttemptError('unknown question');
    if (attempt.kind === 'practice') {
      if (attempt.topicId === null) throw new CorruptAttemptError('practice attempt without topic');
      const expected = Math.min(practiceCount(attempt.topicId), buildPool(services.catalog, attempt.topicId).length);
      if (questions.length < expected) throw new CorruptAttemptError('partial attempt');
    }
    const now = services.now();
    const resolved = resolveOnResume(attempt.clock, now, attempt.heartbeatAt ?? attempt.startedAt);
    const session = new PracticeSession(services, onSubmitted, attempt, questions, resolved.state);
    return { session, autoSubmit: resolved.autoSubmit };
  }

  goTo(index: number): void {
    if (this.#closed) return;
    if (!Number.isInteger(index) || index < 0 || index >= this.#questions.length) return;
    this.#index = index;
  }

  async select(position: number, keys: string[]): Promise<void> {
    if (this.#closed) return;
    const q = this.#questions[position];
    if (!q) return;
    const selected = q.multi ? [...keys] : keys.slice(0, 1);
    this.#questions[position] = { ...q, selected };
    await this.services.repos.attempts.saveAnswer(this.attemptId, position, selected);
  }

  /** Advance the clock. Not re-entrant-safe by design: UI calls it from one interval. */
  async tick(elapsedMs: number): Promise<void> {
    if (this.#closed || this.#clock.limitMs === null) return;
    const now = this.services.now();
    if (this.#clock.mode === 'freeze') {
      this.#clock = advanceFreeze(this.#clock, elapsedMs);
    } else {
      this.#clock = { ...this.#clock, remainingMs: remainingAt(this.#clock, now) };
    }
    this.#remainingMs = remainingAt(this.#clock, now);
    if (isExpired(this.#clock, now)) {
      await this.submit('timeout');
      return;
    }
    this.#sinceSave += Math.max(0, elapsedMs);
    if (this.#sinceSave >= CLOCK_SAVE_EVERY_MS) await this.flushClock();
  }

  async flushClock(): Promise<void> {
    if (this.#closed || this.#clock.limitMs === null) return;
    this.#sinceSave = 0;
    await this.services.repos.attempts.saveClock(this.attemptId, this.#clock, this.services.now());
  }

  openKnowledge(): void {
    if (!this.allowReview) throw new KnowledgeNotAllowedError();
    if (this.#closed) return;
    this.#knowledgeOpen = true; // the clock is deliberately not paused
  }

  closeKnowledge(): void {
    this.#knowledgeOpen = false;
  }

  submit(reason: Reason): Promise<SubmitResult> {
    if (this.#result) return Promise.resolve(this.#result);
    if (this.#inflight) return this.#inflight;
    if (this.#closed) return Promise.reject(new Error('Session was exited'));
    this.#closed = true;
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
        grades: items.map((it, position) => ({ position, isCorrect: it.isCorrect })),
      });
    } catch (e) {
      this.#closed = false; // nothing was committed as submitted; allow a retry
      throw e;
    }
    // From here the attempt IS submitted in the DB. Expose the result before any follow-up
    // work so a failure below cannot hide it; the error is still rethrown. Stats are a cache
    // rebuilt from history, and startup reconcile repairs them if rebuild or refresh failed.
    this.#result = result;
    this.#submitted = true;
    this.#knowledgeOpen = false;
    await rebuildStatsFor(this.services.rebuildDeps, items.map((i) => i.questionId));
    await this.onSubmitted();
    return result;
  }

  async exit(): Promise<void> {
    if (this.#closed && this.#result) return;
    this.#closed = true;
    this.#knowledgeOpen = false;
    await this.services.repos.attempts.discard(this.attemptId);
  }
}
