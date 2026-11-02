// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { DatabaseSync } from 'node:sqlite';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createNodeSqliteExecutor } from '@/testing/node-sqlite-executor';

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

  it('applying all migrations twice is harmless (IF NOT EXISTS)', () => {
    const db = new DatabaseSync(':memory:');
    for (const f of files) db.exec(sql(f));
    for (const f of files) db.exec(sql(f));
    expect(indexes(db)).toContain('idx_attempt_questions_question');
  });

  it('lib.rs registers every migration file once, with version = file number, in order', () => {
    const lib = readFileSync(join(ROOT, 'src-tauri', 'src', 'lib.rs'), 'utf8');
    const registered = [...lib.matchAll(/version:\s*(\d+)[\s\S]*?include_str!\("\.\.\/migrations\/([^"]+)"\)/g)]
      .map((m) => ({ version: Number(m[1]), file: m[2] }));
    expect(registered).toEqual(files.map((file, i) => ({ version: i + 1, file })));
  });
});
