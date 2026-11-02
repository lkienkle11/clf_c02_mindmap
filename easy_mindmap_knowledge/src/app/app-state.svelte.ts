import { completedTopicIds, topicStatuses } from '@/features/mindmap';
import type { TopicStatus } from '@/features/mindmap';
import {
  localDateString,
  reconcileStats,
  reviewSummaries,
  shouldShowDailyPrompt,
} from '@/features/review';
import type { TopicReviewSummary } from '@/features/review';
import type { AttemptQuestionRow, AttemptRow } from '@/persistence';
import type { Locale } from '@/i18n/i18n.svelte';
import type { Services } from './composition';

export type Route =
  | { view: 'tree' }
  | { view: 'lesson'; topicId: string; lessonId: string }
  | { view: 'practice'; topicId: string }
  | { view: 'review' }
  | { view: 'history' }
  | { view: 'settings' };

export type View = Route['view'];

export const SETTING_LOCALE = 'locale';
export const SETTING_PROMPT_DATE = 'review_prompt_last_shown_date';

export class AppState {
  route = $state.raw<Route>({ view: 'tree' });
  statuses = $state.raw<Map<string, TopicStatus>>(new Map());
  completed = $state.raw<Set<string>>(new Set());
  readIds = $state.raw<Set<string>>(new Set());
  summaries = $state.raw<TopicReviewSummary[]>([]);
  dailyPromptVisible = $state(false);
  resumeAttempt = $state.raw<{ attempt: AttemptRow; questions: AttemptQuestionRow[] } | null>(null);
  submittedAttempts = $state.raw<AttemptRow[]>([]);

  private readonly services: Services;
  private refreshSeq = 0;

  constructor(services: Services) {
    this.services = services;
  }

  get view(): View {
    return this.route.view;
  }

  /** Reconciles derived stats first, then loads everything. Returns the saved locale, if any. */
  async load(): Promise<Locale | null> {
    await reconcileStats(this.services.rebuildDeps);
    const [saved] = await Promise.all([this.services.repos.settings.get(SETTING_LOCALE), this.refresh()]);
    return saved === 'en' || saved === 'vi' ? saved : null;
  }

  /** Only the most recent call applies its result; older, slower calls are dropped silently. */
  async refresh(): Promise<void> {
    const seq = ++this.refreshSeq;
    const { repos, catalog } = this.services;
    const now = this.services.now();
    const [readIds, submitted, resume, stats, lastShown] = await Promise.all([
      repos.lessonProgress.readIds(),
      repos.attempts.listSubmitted(),
      repos.attempts.findInProgress(),
      repos.questionStats.listAll(),
      repos.settings.get(SETTING_PROMPT_DATE),
    ]);
    if (seq !== this.refreshSeq) return;
    const completed = completedTopicIds(submitted);
    const summaries = reviewSummaries(stats, completed, now);
    this.readIds = readIds;
    this.submittedAttempts = submitted;
    this.resumeAttempt = resume;
    this.completed = completed;
    this.statuses = topicStatuses(catalog.topics, completed);
    this.summaries = summaries;
    this.dailyPromptVisible = shouldShowDailyPrompt({
      summaries,
      lastShownDate: lastShown,
      today: localDateString(now),
    });
  }

  open(route: Route): void {
    this.route = route;
  }
}
