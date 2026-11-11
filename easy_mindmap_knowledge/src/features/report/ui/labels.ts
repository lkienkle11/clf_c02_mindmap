import type { ReportStatus, ReportType } from '@/persistence';

// Literal keys (not built from a template) so the unused-key check in the i18n test can see them.
export const TYPE_KEY = {
  question: 'report.type.question',
  lesson: 'report.type.lesson',
  attempt: 'report.type.attempt',
  system: 'report.type.system',
} as const satisfies Record<ReportType, string>;

export const STATUS_KEY = {
  new: 'report.status.new',
  handled: 'report.status.handled',
} as const satisfies Record<ReportStatus, string>;

export const REPORT_TYPES: ReportType[] = ['question', 'lesson', 'attempt', 'system'];
export const REPORT_STATUSES: ReportStatus[] = ['new', 'handled'];

export interface ReportCounts {
  total: number;
  newCount: number;
  byType: Record<ReportType, number>;
}
