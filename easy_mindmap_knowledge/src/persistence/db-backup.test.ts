// @vitest-environment node
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { createNodeSqliteExecutor } from '@/testing/node-sqlite-executor';
import { backupFileName, createDbBackup } from './db-backup';

let dir: string;
const now = Date.UTC(2026, 10, 11, 0, 15, 0, 123);

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'mindmap-backup-test-'));
});

afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

it('backupFileName puts the clock time in the file name', () => {
  expect(backupFileName(Date.UTC(2026, 10, 11, 0, 15, 0, 123))).toBe(
    'mindmap-before-regrade-2026-11-11T00-15-00-123Z.db',
  );
});

it('writes a readable copy of the database to the resolved path', async () => {
  const db = await createNodeSqliteExecutor();
  await db.execute('INSERT INTO settings (key, value) VALUES ($1, $2)', ['k', 'v']);
  const path = join(dir, 'backup.db');
  const backup = createDbBackup(db, {
    resolvePath: async () => path,
    now: () => now,
  });

  await backup();

  const copy = new DatabaseSync(path);
  try {
    expect(copy.prepare("SELECT value FROM settings WHERE key = 'k'").get()?.value).toBe('v');
  } finally {
    copy.close();
  }
});

it('asks for the path once, with the timestamped file name', async () => {
  const db = await createNodeSqliteExecutor();
  const resolvePath = vi.fn(async (fileName: string) => join(dir, fileName));
  const backup = createDbBackup(db, { resolvePath, now: () => now });

  await backup();

  expect(resolvePath).toHaveBeenCalledTimes(1);
  expect(resolvePath).toHaveBeenCalledWith(backupFileName(now));
});

it('rejects when the target file already exists, and leaves the first copy intact', async () => {
  const db = await createNodeSqliteExecutor();
  await db.execute('INSERT INTO settings (key, value) VALUES ($1, $2)', ['k', 'v']);
  const path = join(dir, backupFileName(now));
  const backup = createDbBackup(db, {
    resolvePath: async () => path,
    now: () => now,
  });

  await backup();
  await db.execute('UPDATE settings SET value = $1 WHERE key = $2', ['changed', 'k']);
  await expect(backup()).rejects.toThrow();

  const copy = new DatabaseSync(path);
  try {
    expect(copy.prepare("SELECT value FROM settings WHERE key = 'k'").get()?.value).toBe('v');
  } finally {
    copy.close();
  }
});

it('rejects when the path cannot be resolved, and does not touch the database', async () => {
  const db = await createNodeSqliteExecutor();
  const executor = { ...db, execute: vi.fn(db.execute) };
  const error = new Error('Cannot resolve backup path');
  const backup = createDbBackup(executor, {
    resolvePath: async () => { throw error; },
    now: () => now,
  });

  await expect(backup()).rejects.toBe(error);
  expect(executor.execute).not.toHaveBeenCalled();
});
