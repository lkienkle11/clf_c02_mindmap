import type { Services } from '@/app/composition';
import { NoQuestionsError, PracticeSession } from '@/features/practice';
import type { SubmitResult } from '@/features/practice';
import type { ReviewPlan } from './logic/build-review-plan';

/**
 * Drives a review plan (batches of questions) inside one UI session. Each batch is an independent
 * attempt, so stopping between batches loses nothing that was already submitted.
 */
export class ReviewRun {
  #session = $state.raw<PracticeSession>() as PracticeSession;
  #batchIndex = $state(0);
  /** Results of batches before the current one. */
  #prior = $state.raw<readonly SubmitResult[]>([]);
  #stopped = $state(false);
  #starting = false;

  private constructor(
    private readonly services: Services | null,
    private readonly onSubmitted: () => Promise<void>,
    private readonly batches: readonly (readonly string[])[],
    session: PracticeSession,
  ) {
    this.#session = session;
  }

  static async start(services: Services, plan: ReviewPlan, onSubmitted: () => Promise<void>): Promise<ReviewRun> {
    const first = plan.batches[0];
    if (!first || first.length === 0) throw new NoQuestionsError('review');
    const session = await PracticeSession.startReview(services, first, onSubmitted);
    return new ReviewRun(services, onSubmitted, plan.batches, session);
  }

  /** Wraps a resumed in-progress review attempt as a single-batch run. */
  static adoptSingle(session: PracticeSession): ReviewRun {
    return new ReviewRun(null, async () => {}, [session.questions.map((q) => q.questionId)], session);
  }

  get session(): PracticeSession { return this.#session; }
  get batchIndex(): number { return this.#batchIndex; }
  get batchCount(): number { return this.batches.length; }
  get results(): readonly SubmitResult[] {
    const current = this.#session.result;
    return current ? [...this.#prior, current] : this.#prior;
  }
  get stopped(): boolean { return this.#stopped; }

  get answeredSoFar(): number {
    return this.results.reduce((n, r) => n + r.total, 0);
  }

  get remainingAfterCurrent(): number {
    return this.batches.slice(this.#batchIndex + 1).reduce((n, b) => n + b.length, 0);
  }

  get finished(): boolean {
    return !this.#stopped && this.#session.submitted && this.#batchIndex >= this.batches.length - 1;
  }

  async nextBatch(): Promise<void> {
    if (this.#stopped) return;
    if (!this.#session.submitted) throw new Error('Current review batch is not submitted yet');
    const next = this.batches[this.#batchIndex + 1];
    if (!next) throw new Error('No more review batches');
    if (!this.services) throw new Error('This review run cannot start further batches');
    if (this.#starting) throw new Error('Next batch is already starting');
    const done = this.#session.result;
    if (!done) throw new Error('Current review batch has no result');
    this.#starting = true;
    try {
      const session = await PracticeSession.startReview(this.services, [...next], this.onSubmitted);
      this.#prior = [...this.#prior, done];
      this.#session = session;
      this.#batchIndex += 1;
    } finally {
      this.#starting = false;
    }
  }

  /** "Dừng ở đây": submitted batches stay; an unsubmitted current batch is discarded like Thoát. */
  async stop(): Promise<void> {
    if (this.#stopped) return;
    this.#stopped = true;
    await this.#session.exit();
  }
}
