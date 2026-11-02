import type { AppState } from '@/app/app-state.svelte';
import type { Services } from '@/app/composition';
import { NoQuestionsError } from '@/features/practice';
import type { ReviewMode } from './logic/build-review-plan';
import { ReviewRun } from './review-run.svelte';

/** Which friendly message the UI should show; never the raw error text. */
export type ReviewNotice = 'empty' | 'startFailed' | 'hideFailed';

/** Turns the user's choices in the review prompts into app state changes. */
export class ReviewLauncher {
  notice = $state<ReviewNotice | null>(null);
  #starting = false;

  constructor(
    private readonly services: Services,
    private readonly appState: AppState,
  ) {}

  async start(mode: ReviewMode): Promise<void> {
    if (this.#starting) return;
    this.#starting = true;
    this.notice = null;
    try {
      const plan = this.appState.planReview(mode);
      if (plan.total === 0) {
        this.notice = 'empty';
        return;
      }
      const run = await ReviewRun.start(this.services, plan, () => this.appState.refresh());
      this.appState.reviewRun = run;
      this.appState.open({ view: 'review' });
    } catch (e) {
      if (!(e instanceof NoQuestionsError)) console.error('Could not start the review', e);
      this.notice = e instanceof NoQuestionsError ? 'empty' : 'startFailed';
    } finally {
      this.#starting = false;
    }
  }

  /** "Don't ask today": the prompt is already closed by the caller; a failed save only costs a notice. */
  async dismissToday(): Promise<void> {
    try {
      await this.appState.hideReviewButtonToday();
    } catch (e) {
      console.error('Could not hide the review button for today', e);
      this.notice = 'hideFailed';
    }
  }

  clearNotice(): void {
    this.notice = null;
  }
}
