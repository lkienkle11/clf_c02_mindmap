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

export type View = 'tree' | 'lesson' | 'practice' | 'review' | 'history' | 'settings';

export const SETTING_LOCALE = 'locale';
export const SETTING_PROMPT_DATE = 'review_prompt_last_shown_date';

export class AppState {
  view = $state<View>('tree');
  viewParams = $state<Record<string, unknown>>({});
  statuses = $state.raw<Map<string, TopicStatus>>(new Map());
  completed = $state.raw<Set<string>>(new Set());
  readIds = $state.raw<Set<string>>(new Set());
  summaries = $state.raw<TopicReviewSummary[]>([]);
  dailyPromptVisible = $state(false);
  resumeAttempt = $state.raw<{ attempt: AttemptRow; questions: AttemptQuestionRow[] } | null>(null);
  submittedAttempts = $state.raw<AttemptRow[]>([]);

  private readonly services: Services;

  constructor(services: Services) {
    this.services = services;
  }

  /** Reconciles derived stats first, then loads everything. Returns the saved locale, if any. */
  async load(): Promise<Locale | null> {
    await reconcileStats(this.services.rebuildDeps);
    await this.refresh();
    const saved = await this.services.repos.settings.get(SETTING_LOCALE);
    return saved === 'en' || saved === 'vi' ? saved : null;
  }

  async refresh(): Promise<void> {
    const { repos, catalog } = this.services;
    const now = this.services.now();
    const [readIds, submitted, resume, stats, lastShown] = await Promise.all([
      repos.lessonProgress.readIds(),
      repos.attempts.listSubmitted(),
      repos.attempts.findInProgress(),
      repos.questionStats.listAll(),
      repos.settings.get(SETTING_PROMPT_DATE),
    ]);
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

  open(view: View, params: Record<string, unknown> = {}): void {
    this.viewParams = params;
    this.view = view;
  }
}
