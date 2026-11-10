// @vitest-environment node
import { describe, expect, expectTypeOf, it } from 'vitest';
import { DatabaseSync } from 'node:sqlite';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createNodeSqliteExecutor } from '@/testing/node-sqlite-executor';
import type { ReportRow, ReportStatus, ReportType } from '@/persistence/records';

const ROOT = process.cwd();
const DIR = join(ROOT, 'src-tauri', 'migrations');
const files = readdirSync(DIR).filter((f) => f.endsWith('.sql')).sort();
const sql = (f: string) => readFileSync(join(DIR, f), 'utf8');
const indexes = (db: DatabaseSync) =>
  (db.prepare("SELECT name FROM sqlite_master WHERE type = 'index' AND name NOT LIKE 'sqlite_%'").all() as { name: string }[])
    .map((r) => r.name);

describe('migrations', () => {
  it('are numbered 0001.. without gaps', () => {
    expect(files.length).toBeGreaterThanOrEqual(2);
    files.forEach((f, i) => expect(f).toMatch(new RegExp(`^${String(i + 1).padStart(4, '0')}_[a-z0-9_]+\\.sql$`)));
  });

  it('a fresh database gets every migration, including the question-history index', async () => {
    const db = await createNodeSqliteExecutor();
    const rows = await db.select<{ name: string }>("SELECT name FROM sqlite_master WHERE type = 'index' AND name = 'idx_attempt_questions_question'");
    expect(rows).toHaveLength(1);
  });

  it('0002 on top of an existing 0001 database keeps the data and adds the index', () => {
    const db = new DatabaseSync(':memory:');
    db.exec(sql(files[0]));
    db.exec("INSERT INTO attempts (id, kind, topic_id, status, started_at, clock_mode) VALUES ('a1', 'practice', 't', 'submitted', 1, 'freeze')");
    db.exec("INSERT INTO attempt_questions (attempt_id, position, question_id, option_order) VALUES ('a1', 0, 'q1', '[\"A\"]')");
    db.exec("INSERT INTO settings (key, value) VALUES ('locale', 'en')");
    for (const f of files.slice(1)) db.exec(sql(f));
    expect(indexes(db)).toContain('idx_attempt_questions_question');
    expect(db.prepare('SELECT question_id FROM attempt_questions').all()).toEqual([{ question_id: 'q1' }]);
    expect(db.prepare('SELECT value FROM settings').all()).toEqual([{ value: 'en' }]);
    const plan = db.prepare("EXPLAIN QUERY PLAN SELECT * FROM attempt_questions WHERE question_id = 'q1'").all() as { detail: string }[];
    expect(plan.map((p) => p.detail).join(' ')).toContain('idx_attempt_questions_question');
  });

  it('re-applying the IF NOT EXISTS migrations is harmless (ALTER TABLE ones run once, tracked by the plugin)', () => {
    const db = new DatabaseSync(':memory:');
    for (const f of files) db.exec(sql(f));
    for (const f of files.filter((n) => !/ALTER TABLE/i.test(sql(n)))) db.exec(sql(f));
    expect(indexes(db)).toContain('idx_attempt_questions_question');
  });

  describe('0004 checkpoint attempts', () => {
    const upTo = (n: number) => {
      const db = new DatabaseSync(':memory:');
      for (const f of files.slice(0, n)) db.exec(sql(f));
      return db;
    };
    const insert = (db: DatabaseSync, kind: string, groupIndex: number | null, plannedCount: number | null = null) =>
      db.prepare(
        "INSERT INTO attempts (id, kind, status, started_at, clock_mode, group_index, planned_count) VALUES ('x', ?1, 'in_progress', 1, 'freeze', ?2, ?3)",
      ).run(kind, groupIndex, plannedCount);

    it('is the fourth migration file', () => {
      expect(files[3]).toBe('0004_checkpoint_attempts.sql');
    });

    it('on an empty database adds group_index and planned_count', () => {
      const db = upTo(4);
      const cols = (db.prepare('PRAGMA table_info(attempts)').all() as { name: string }[]).map((c) => c.name);
      expect(cols).toEqual(expect.arrayContaining(['group_index', 'planned_count', 'clock_on_hidden']));
    });

    it('keeps a version-3 practice row with NULL group_index and planned_count', () => {
      const db = upTo(3);
      db.exec(
        "INSERT INTO attempts (id, kind, topic_id, status, started_at, clock_mode, clock_on_hidden, review_allowed, score_pct, passed) VALUES ('a1', 'practice', 't', 'submitted', 5, 'run', 'run', 1, 80.5, 1)",
      );
      db.exec(sql(files[3]));
      expect(db.prepare('SELECT * FROM attempts').all()).toEqual([
        expect.objectContaining({
          id: 'a1', kind: 'practice', topic_id: 't', status: 'submitted', started_at: 5, clock_mode: 'run',
          clock_on_hidden: 'run', review_allowed: 1, score_pct: 80.5, passed: 1, group_index: null, planned_count: null,
        }),
      ]);
    });

    it('accepts a checkpoint with a group_index and a practice without', () => {
      const db = upTo(4);
      expect(() => insert(db, 'checkpoint', 2, 40)).not.toThrow();
      db.exec('DELETE FROM attempts');
      expect(() => insert(db, 'practice', null)).not.toThrow();
    });

    it('rejects a checkpoint with a NULL group_index', () => {
      expect(() => insert(upTo(4), 'checkpoint', null)).toThrow(/CHECK/i);
    });

    it('rejects a practice or review attempt that has a group_index', () => {
      expect(() => insert(upTo(4), 'practice', 1)).toThrow(/CHECK/i);
      expect(() => insert(upTo(4), 'review', 1)).toThrow(/CHECK/i);
    });

    it('rejects an unknown kind', () => {
      expect(() => insert(upTo(4), 'bogus', null)).toThrow(/CHECK/i);
    });

    it('keeps the 16 original columns exactly as version 3 defined them (name, type, notnull, default, pk)', () => {
      const info = (db: DatabaseSync) =>
        (db.prepare('PRAGMA table_info(attempts)').all() as { name: string; type: string; notnull: number; dflt_value: unknown; pk: number }[])
          .map(({ name, type, notnull, dflt_value, pk }) => ({ name, type, notnull, dflt_value, pk }));
      const before = info(upTo(3));
      expect(before).toHaveLength(16);
      const after = info(upTo(4));
      expect(after.filter((c) => before.some((b) => b.name === c.name))).toEqual(before);
      expect(after.map((c) => c.name).slice(16)).toEqual(['group_index', 'planned_count']);
    });

    it('still enforces the other CHECK constraints on the rebuilt table', () => {
      const bad = (column: string, value: string) => {
        const db = upTo(4);
        const cols = { status: "'in_progress'", clock_mode: "'freeze'", clock_on_hidden: "'freeze'", submit_reason: 'NULL' } as Record<string, string>;
        cols[column] = `'${value}'`;
        return () =>
          db.exec(
            `INSERT INTO attempts (id, kind, status, started_at, clock_mode, clock_on_hidden, submit_reason) VALUES ('x', 'practice', ${cols.status}, 1, ${cols.clock_mode}, ${cols.clock_on_hidden}, ${cols.submit_reason})`,
          );
      };
      expect(bad('status', 'bogus')).toThrow(/CHECK/i);
      expect(bad('clock_mode', 'bogus')).toThrow(/CHECK/i);
      expect(bad('clock_on_hidden', 'bogus')).toThrow(/CHECK/i);
      expect(bad('submit_reason', 'bogus')).toThrow(/CHECK/i);
      expect(bad('submit_reason', 'timeout')).not.toThrow();
    });
  });

  describe('0005 reports', () => {
    const MIGRATION = '0005_reports.sql';
    const migrateTo = (n: number) => {
      const db = new DatabaseSync(':memory:');
      for (const f of files.slice(0, n)) db.exec(sql(f));
      return db;
    };
    const columns = (db: DatabaseSync, table: string) =>
      (db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[]).map((c) => c.name);
    const insertReport = (db: DatabaseSync, id: string, type: string, status: string) =>
      db.prepare(
        'INSERT INTO reports (id, type, status, created_at, status_updated_at, body, app_version, locale) VALUES (?1, ?2, ?3, 1, 1, ?4, ?5, ?6)',
      ).run(id, type, status, 'body', '1.0.0', 'en');

    it('0005 creates reports and report_images and keeps existing attempts (clock_on_report defaults to freeze)', () => {
      expect(files[4]).toBe(MIGRATION);
      const db = migrateTo(4);
      db.exec("INSERT INTO attempts (id, kind, topic_id, status, started_at, clock_mode) VALUES ('a1', 'practice', 't', 'submitted', 1, 'freeze')");
      db.exec(sql(MIGRATION));
      expect(db.prepare('SELECT id, clock_on_report FROM attempts').all()).toEqual([{ id: 'a1', clock_on_report: 'freeze' }]);
      expect(columns(db, 'reports')).toEqual([
        'id', 'type', 'status', 'created_at', 'status_updated_at', 'body', 'app_version', 'locale', 'source_screen',
        'question_id', 'lesson_id', 'attempt_id', 'position', 'option_order', 'selected', 'is_correct',
      ]);
      expect(columns(db, 'report_images')).toEqual(['report_id', 'idx', 'path']);
      const indexColumns = (db.prepare("PRAGMA index_list('reports')").all() as { name: string }[]).map((i) =>
        (db.prepare(`PRAGMA index_info('${i.name}')`).all() as { name: string }[]).map((c) => c.name),
      );
      expect(indexColumns).toContainEqual(['status', 'created_at']);
      insertReport(db, 'r1', 'question', 'new');
      expect(db.prepare('SELECT status FROM reports').all()).toEqual([{ status: 'new' }]);
    });

    it('reports rejects an unknown type or status', () => {
      const db = migrateTo(5);
      expect(() => insertReport(db, 'r1', 'question', 'new')).not.toThrow();
      expect(() => insertReport(db, 'r2', 'bogus', 'new')).toThrow(/CHECK/i);
      expect(() => insertReport(db, 'r3', 'lesson', 'bogus')).toThrow(/CHECK/i);
    });

    it('attempts.clock_on_report accepts only freeze or run', () => {
      const db = migrateTo(5);
      const insert = (id: string, value: string) =>
        db.prepare("INSERT INTO attempts (id, kind, status, started_at, clock_mode, clock_on_report) VALUES (?1, 'practice', 'in_progress', 1, 'freeze', ?2)").run(id, value);
      expect(() => insert('a1', 'run')).not.toThrow();
      expect(() => insert('a2', 'bogus')).toThrow(/CHECK/i);
    });
  });

  describe('report record types', () => {
    it('ReportRow mirrors the reports columns, with images as ordered relative paths', () => {
      expectTypeOf<ReportType>().toEqualTypeOf<'question' | 'lesson' | 'system'>();
      expectTypeOf<ReportStatus>().toEqualTypeOf<'new' | 'handled'>();
      expectTypeOf<ReportRow>().toEqualTypeOf<{
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
        images: string[];
      }>();
    });
  });

  it('lib.rs registers every migration file once, with version = file number, in order', () => {
    const lib = readFileSync(join(ROOT, 'src-tauri', 'src', 'lib.rs'), 'utf8');
    const registered = [...lib.matchAll(/version:\s*(\d+)[\s\S]*?include_str!\("\.\.\/migrations\/([^"]+)"\)/g)]
      .map((m) => ({ version: Number(m[1]), file: m[2] }));
    expect(registered).toEqual(files.map((file, i) => ({ version: i + 1, file })));
  });
});
