import { isGateOpen, passedCheckpointGroups } from '@/features/exam';
import { completedTopicIds, topicStatuses } from '@/features/mindmap';
import type { TopicStatus } from '@/features/mindmap';
import { makeRng } from '@/random/seeded-random';
import {
  buildReviewPlan,
  localDateString,
  reconcileStats,
  reviewSummaries,
  shouldShowDailyPrompt,
} from '@/features/review';
import type { ReviewMode, ReviewPlan, ReviewRun, TopicReviewSummary } from '@/features/review';
import type { AttemptQuestionRow, AttemptRow, QuestionStat } from '@/persistence';
import type { Locale } from '@/i18n/i18n.svelte';
import type { Services } from './composition';

export type Route =
  | { view: 'tree' }
  | { view: 'lesson'; topicId: string; lessonId: string }
  | { view: 'practice'; topicId: string }
  | { view: 'review' }
  | { view: 'checkpoint'; groupIndex: number }
  | { view: 'history'; topicId?: string }
  | { view: 'settings' };

export type View = Route['view'];

export const SETTING_LOCALE = 'locale';
export const SETTING_PROMPT_DATE = 'review_prompt_last_shown_date';
export const SETTING_BUTTON_HIDDEN_DATE = 'review_button_hidden_date';

export class AppState {
  route = $state.raw<Route>({ view: 'tree' });
  statuses = $state.raw<Map<string, TopicStatus>>(new Map());
  completed = $state.raw<Set<string>>(new Set());
  /** Checkpoint groups with a submitted passed exam; they open the next topic group. */
  passedGroups = $state.raw<Set<number>>(new Set());
  readIds = $state.raw<Set<string>>(new Set());
  summaries = $state.raw<TopicReviewSummary[]>([]);
  /** Decided once in load(); only dismissDailyPrompt() (the user's choice) clears it. */
  dailyPromptVisible = $state(false);
  stats = $state.raw<QuestionStat[]>([]);
  reviewButtonHidden = $state(false);
  resumeAttempt = $state.raw<{ attempt: AttemptRow; questions: AttemptQuestionRow[] } | null>(null);
  submittedAttempts = $state.raw<AttemptRow[]>([]);
  /** The batched review in progress; the review route reads it, and it is cleared when that route closes. */
  reviewRun = $state.raw<ReviewRun | null>(null);

  private readonly services: Services;
  private refreshSeq = 0;

  constructor(services: Services) {
    this.services = services;
  }

  get view(): View {
    return this.route.view;
  }

  /** The Review button is always on the main view (spec 5.1) unless "Don't ask today" hid it for the day. */
  get reviewButtonVisible(): boolean {
    return !this.reviewButtonHidden;
  }

  /** Reconciles derived stats first, then loads everything. Returns the saved locale, if any. */
  async load(): Promise<Locale | null> {
    await reconcileStats(this.services.rebuildDeps);
    const [saved] = await Promise.all([this.services.repos.settings.get(SETTING_LOCALE), this.refresh()]);
    await this.#decideDailyPrompt();
    return saved === 'en' || saved === 'vi' ? saved : null;
  }

  /** Only the most recent call applies its result; older, slower calls are dropped silently. */
  async refresh(): Promise<void> {
    const seq = ++this.refreshSeq;
    const { repos, catalog } = this.services;
    const now = this.services.now();
    const [readIds, submitted, resume, stats, hiddenDate] = await Promise.all([
      repos.lessonProgress.readIds(),
      repos.attempts.listSubmitted(),
      repos.attempts.findInProgress(),
      repos.questionStats.listAll(),
      repos.settings.get(SETTING_BUTTON_HIDDEN_DATE).catch((e: unknown) => {
        console.error('Could not read the review button setting', e);
        return null;
      }),
    ]);
    if (seq !== this.refreshSeq) return;
    const completed = completedTopicIds(submitted);
    const passedGroups = passedCheckpointGroups(submitted);
    const summaries = reviewSummaries(stats, completed, now);
    this.readIds = readIds;
    this.submittedAttempts = submitted;
    this.resumeAttempt = resume;
    this.completed = completed;
    this.passedGroups = passedGroups;
    this.statuses = topicStatuses(catalog.topics, completed, isGateOpen(catalog.topics, passedGroups));
    this.summaries = summaries;
    this.stats = stats;
    this.reviewButtonHidden = hiddenDate === localDateString(now);
  }

  /**
   * Shown at most once per calendar day: the date is saved the moment the modal opens, so even
   * killing the app with it open will not bring it back the same day (spec 5.1).
   */
  async #decideDailyPrompt(): Promise<void> {
    // A settings failure must never break startup, and must never risk showing the modal twice a day:
    // persist first, show only if that worked, and treat an unreadable date as "do not show".
    try {
      const today = localDateString(this.services.now());
      const lastShown = await this.services.repos.settings.get(SETTING_PROMPT_DATE);
      if (!shouldShowDailyPrompt({ summaries: this.summaries, lastShownDate: lastShown, today })) return;
      await this.services.repos.settings.set(SETTING_PROMPT_DATE, today);
      this.dailyPromptVisible = true;
    } catch (e) {
      console.error('Could not decide the daily review prompt', e);
    }
  }

  dismissDailyPrompt(): void {
    this.dailyPromptVisible = false;
  }

  async hideReviewButtonToday(): Promise<void> {
    const today = localDateString(this.services.now());
    await this.services.repos.settings.set(SETTING_BUTTON_HIDDEN_DATE, today);
    this.reviewButtonHidden = true;
  }

  planReview(mode: ReviewMode): ReviewPlan {
    const now = this.services.now();
    return buildReviewPlan({
      stats: this.stats, completed: this.completed, mode, now, rng: makeRng(now % 0x100000000),
    });
  }

  open(route: Route): void {
    this.route = route;
  }
}
