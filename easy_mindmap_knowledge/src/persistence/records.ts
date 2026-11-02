export interface ClockState {
  mode: 'freeze' | 'run';
  limitMs: number | null;
  remainingMs: number | null;
  deadlineAt: number | null;
}

export interface AttemptRow {
  id: string;
  kind: 'practice' | 'review';
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
