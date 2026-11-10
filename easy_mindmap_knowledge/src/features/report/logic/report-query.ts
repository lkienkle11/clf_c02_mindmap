import type { ReportStatus, ReportType } from '@/persistence/records';

/** What the filter controls hold; an empty string means "no filter". */
export interface ReportFilters {
  type: ReportType | '';
  status: ReportStatus | '';
  /** `YYYY-MM-DD` as an <input type="date"> gives it, in local time. */
  from: string;
  to: string;
  text: string;
}

export interface ListQuery {
  type?: ReportType;
  status?: ReportStatus;
  fromMs?: number;
  toMs?: number;
  text?: string;
  page: number;
  pageSize: number;
}

export const emptyFilters = (): ReportFilters => ({ type: '', status: '', from: '', to: '', text: '' });

/** Local midnight `plusDays` after the given calendar date, or undefined when it is not a real date. */
function localDay(value: string, plusDays: number): number | undefined {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!m) return undefined;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const date = new Date(y, mo - 1, d);
  if (date.getFullYear() !== y || date.getMonth() !== mo - 1 || date.getDate() !== d) return undefined;
  return new Date(y, mo - 1, d + plusDays).getTime();
}

export function buildReportQuery(f: ReportFilters, page: number, pageSize: number): ListQuery {
  const q: ListQuery = { page, pageSize };
  if (f.type !== '') q.type = f.type;
  if (f.status !== '') q.status = f.status;
  const from = localDay(f.from, 0);
  if (from !== undefined) q.fromMs = from;
  const toNext = localDay(f.to, 1);
  if (toNext !== undefined) q.toMs = toNext - 1;
  const text = f.text.trim();
  if (text !== '') q.text = text;
  return q;
}

/** The first `max` characters of a body on one line, with an ellipsis when it was cut. */
export function excerpt(body: string, max: number): string {
  const chars = Array.from(body.replace(/\s+/g, ' ').trim());
  return chars.length <= max ? chars.join('') : `${chars.slice(0, max).join('')}…`;
}
