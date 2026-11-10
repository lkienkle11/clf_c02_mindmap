/** What the practice clock does while the page is hidden, or while a report dialog is open. */
export type HiddenPolicy = 'freeze' | 'run';

export interface ClockState {
  mode: 'freeze' | 'run';
  onHidden: HiddenPolicy;
  /** What the clock does while the report dialog is open (visible time only; hidden time follows onHidden). */
  onReport: HiddenPolicy;
  limitMs: number | null;
  remainingMs: number | null;
  deadlineAt: number | null;
}

export interface AttemptRow {
  id: string;
  kind: 'practice' | 'review' | 'checkpoint';
  topicId: string | null;
  status: 'in_progress' | 'submitted';
  startedAt: number;
  submittedAt: number | null;
  submitReason: 'manual' | 'timeout' | null;
  reviewAllowed: boolean;
  clock: ClockState;
  heartbeatAt: number | null;
  scorePct: number | null;
  passed: boolean | null;
  /** Checkpoint attempts only (set exactly when kind is 'checkpoint'). */
  groupIndex: number | null;
  /** Question count the attempt was planned with; null for attempts that predate it. */
  plannedCount: number | null;
}

export interface AttemptQuestionRow {
  attemptId: string;
  position: number;
  questionId: string;
  optionOrder: string[];
  selected: string[];
  isCorrect: boolean | null;
}

export interface QuestionStat {
  questionId: string;
  topicId: string | null;
  box: number;
  dueAt: number;
  timesSeen: number;
  timesCorrect: number;
  lastSeenAt: number;
  lastCorrect: boolean;
}

export type ReportType = 'question' | 'lesson' | 'system';
export type ReportStatus = 'new' | 'handled';

export interface ReportRow {
  id: string;
  type: ReportType;
  status: ReportStatus;
  createdAt: number;
  statusUpdatedAt: number;
  body: string;
  appVersion: string;
  locale: 'en' | 'vi';
  sourceScreen: string | null;
  questionId: string | null;
  lessonId: string | null;
  attemptId: string | null;
  position: number | null;
  optionOrder: string[] | null;
  selected: string[] | null;
  isCorrect: boolean | null;
  /** Relative image paths, in attachment order. */
  images: string[];
}
