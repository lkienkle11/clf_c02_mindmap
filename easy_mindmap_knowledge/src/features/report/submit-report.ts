import type { Services } from '@/app/composition';
import { buildReportRow, validateDraft } from './logic/report-draft';
import type { DraftProblem, ReportDraft } from './logic/report-draft';

/** The draft broke a rule (see validateDraft). Nothing was written. */
export class ReportInvalidError extends Error {
  readonly reason: DraftProblem;

  constructor(reason: DraftProblem) {
    super(`Report draft invalid: ${reason}`);
    this.name = 'ReportInvalidError';
    this.reason = reason;
  }
}

/** Saving a screenshot or the report row failed. No report row exists for this attempt. */
export class ReportSaveError extends Error {
  constructor(cause: unknown) {
    super('Report save failed', { cause });
    this.name = 'ReportSaveError';
  }
}

/**
 * Validates a draft, saves its screenshots in order (0..n-1), then creates the report row. The row is
 * written last, so a failure leaves no visible report; orphan image files are harmless. Each call uses a
 * fresh id, so a retry never collides with rows left behind by a failed attempt. Returns the report id.
 */
export async function submitReport(
  services: Services,
  draft: ReportDraft,
  meta: { appVersion: string; locale: 'en' | 'vi' },
): Promise<string> {
  const check = validateDraft(draft);
  if (!check.ok) throw new ReportInvalidError(check.reason);
  const id = services.newId();
  const row = buildReportRow(draft, { id, now: services.now(), appVersion: meta.appVersion, locale: meta.locale });
  try {
    const paths: string[] = [];
    for (let idx = 0; idx < draft.images.length; idx++) {
      paths.push(await services.reportStorage.saveImage(id, idx, draft.images[idx]));
    }
    await services.repos.reports.create(row, paths);
  } catch (cause) {
    throw new ReportSaveError(cause);
  }
  return id;
}
