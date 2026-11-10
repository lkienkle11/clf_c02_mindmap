import type { SqlExecutor } from '../sql-executor';
import type { ReportRow, ReportStatus, ReportType } from '../records';

interface ReportDb {
  id: string;
  type: ReportType;
  status: ReportStatus;
  created_at: number;
  status_updated_at: number;
  body: string;
  app_version: string;
  locale: 'en' | 'vi';
  source_screen: string | null;
  question_id: string | null;
  lesson_id: string | null;
  attempt_id: string | null;
  position: number | null;
  option_order: string | null;
  selected: string | null;
  is_correct: number | null;
}

export interface ReportQuery {
  type?: ReportType;
  status?: ReportStatus;
  fromMs?: number;
  toMs?: number;
  /** Case-insensitive (Unicode) literal substring of the body. */
  text?: string;
  /** 1-based. */
  page: number;
  pageSize: number;
}

const json = (v: string | null): string[] | null => (v === null ? null : (JSON.parse(v) as string[]));

const toReport = (r: ReportDb, images: string[]): ReportRow => ({
  id: r.id,
  type: r.type,
  status: r.status,
  createdAt: r.created_at,
  statusUpdatedAt: r.status_updated_at,
  body: r.body,
  appVersion: r.app_version,
  locale: r.locale,
  sourceScreen: r.source_screen,
  questionId: r.question_id,
  lessonId: r.lesson_id,
  attemptId: r.attempt_id,
  position: r.position,
  optionOrder: json(r.option_order),
  selected: json(r.selected),
  isCorrect: r.is_correct === null ? null : r.is_correct === 1,
  images,
});

export function createReportsRepo(db: SqlExecutor) {
  /** Most ids per `IN (...)` query, well under SQLite's bound-parameter limit. */
  const CHUNK = 500;

  async function withImages(rows: ReportDb[]): Promise<ReportRow[]> {
    const byId = new Map<string, string[]>(rows.map((r) => [r.id, []]));
    const ids = [...byId.keys()];
    for (let i = 0; i < ids.length; i += CHUNK) {
      const chunk = ids.slice(i, i + CHUNK);
      const marks = chunk.map((_, j) => `$${j + 1}`).join(', ');
      const imgs = await db.select<{ report_id: string; path: string }>(
        `SELECT report_id, path FROM report_images WHERE report_id IN (${marks}) ORDER BY report_id, idx`,
        chunk,
      );
      for (const im of imgs) byId.get(im.report_id)?.push(im.path);
    }
    return rows.map((r) => toReport(r, byId.get(r.id) ?? []));
  }

  return {
    /** Images first, report row LAST: a kill midway leaves invisible orphan images, never a half-report. */
    async create(row: Omit<ReportRow, 'images'>, imagePaths: string[]): Promise<void> {
      for (let i = 0; i < imagePaths.length; i++) {
        await db.execute('INSERT INTO report_images (report_id, idx, path) VALUES ($1, $2, $3)', [row.id, i, imagePaths[i]]);
      }
      await db.execute(
        `INSERT INTO reports
           (id, type, status, created_at, status_updated_at, body, app_version, locale, source_screen,
            question_id, lesson_id, attempt_id, position, option_order, selected, is_correct)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
        [
          row.id, row.type, row.status, row.createdAt, row.statusUpdatedAt, row.body, row.appVersion, row.locale,
          row.sourceScreen, row.questionId, row.lessonId, row.attemptId, row.position,
          row.optionOrder === null ? null : JSON.stringify(row.optionOrder),
          row.selected === null ? null : JSON.stringify(row.selected),
          row.isCorrect === null ? null : row.isCorrect ? 1 : 0,
        ],
      );
    },

    async get(id: string): Promise<ReportRow | null> {
      const rows = await db.select<ReportDb>('SELECT * FROM reports WHERE id = $1', [id]);
      if (rows.length === 0) return null;
      return (await withImages(rows))[0];
    },

    async list(q: ReportQuery): Promise<{ items: ReportRow[]; total: number }> {
      const where: string[] = [];
      const params: unknown[] = [];
      const add = (clause: string, value: unknown) => {
        params.push(value);
        where.push(clause.replace('?', `$${params.length}`));
      };
      if (q.type !== undefined) add('type = ?', q.type);
      if (q.status !== undefined) add('status = ?', q.status);
      if (q.fromMs !== undefined) add('created_at >= ?', q.fromMs);
      if (q.toMs !== undefined) add('created_at <= ?', q.toMs);
      const clause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';
      const order = 'ORDER BY created_at DESC, id DESC';
      if (q.text !== undefined && q.text !== '') {
        // SQLite LOWER() folds ASCII only, so the text match runs here with full Unicode lowercasing.
        const needle = q.text.toLowerCase();
        const matched = (await db.select<ReportDb>(`SELECT * FROM reports ${clause} ${order}`, params)).filter((r) =>
          r.body.toLowerCase().includes(needle),
        );
        const start = (Math.max(q.page, 1) - 1) * q.pageSize;
        return { items: await withImages(matched.slice(start, start + q.pageSize)), total: matched.length };
      }
      const totalRows = await db.select<{ n: number }>(`SELECT COUNT(*) AS n FROM reports ${clause}`, params);
      const n = params.length;
      const rows = await db.select<ReportDb>(
        `SELECT * FROM reports ${clause} ${order} LIMIT $${n + 1} OFFSET $${n + 2}`,
        [...params, q.pageSize, (Math.max(q.page, 1) - 1) * q.pageSize],
      );
      return { items: await withImages(rows), total: totalRows[0]?.n ?? 0 };
    },

    async setStatus(id: string, status: ReportStatus, at: number): Promise<void> {
      await db.execute('UPDATE reports SET status = $1, status_updated_at = $2 WHERE id = $3', [status, at, id]);
    },

    async counts(): Promise<{ total: number; newCount: number; byType: Record<ReportType, number> }> {
      const rows = await db.select<{ type: ReportType; status: ReportStatus; n: number }>(
        'SELECT type, status, COUNT(*) AS n FROM reports GROUP BY type, status',
      );
      const out = { total: 0, newCount: 0, byType: { question: 0, lesson: 0, system: 0 } as Record<ReportType, number> };
      for (const r of rows) {
        out.total += r.n;
        out.byType[r.type] += r.n;
        if (r.status === 'new') out.newCount += r.n;
      }
      return out;
    },

    async listAll(): Promise<ReportRow[]> {
      return withImages(await db.select<ReportDb>('SELECT * FROM reports ORDER BY created_at DESC, id DESC'));
    },
  };
}

export type ReportsRepo = ReturnType<typeof createReportsRepo>;
