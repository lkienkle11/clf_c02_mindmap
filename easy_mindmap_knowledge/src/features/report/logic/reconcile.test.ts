import { describe, expect, it } from 'vitest';
import { reconcile } from './reconcile';

const db = [
  { id: 'a', status: 'new' as const, statusUpdatedAt: 100 },
  { id: 'b', status: 'handled' as const, statusUpdatedAt: 300 },
  { id: 'c', status: 'new' as const, statusUpdatedAt: 200 },
];

describe('reconcile', () => {
  it('takes the file when it is newer', () => {
    const r = reconcile(db, new Map([['a', { status: 'handled' as const, statusUpdatedAt: 150 }]]));
    expect(r).toEqual({ toDb: [{ id: 'a', status: 'handled', at: 150 }], toFiles: [] });
  });
  it('adopts a newer time when the status is the same', () => {
    const r = reconcile(db, new Map([['a', { status: 'new' as const, statusUpdatedAt: 150 }]]));
    expect(r).toEqual({ toDb: [{ id: 'a', status: 'new', at: 150 }], toFiles: [] });
  });
  it('rewrites the file when the database is newer', () => {
    const r = reconcile(db, new Map([['b', { status: 'new' as const, statusUpdatedAt: 250 }]]));
    expect(r).toEqual({ toDb: [], toFiles: [{ id: 'b', status: 'handled', at: 300 }] });
  });
  it('keeps the database and writes nothing on a tie', () => {
    const r = reconcile(db, new Map([['c', { status: 'handled' as const, statusUpdatedAt: 200 }]]));
    expect(r).toEqual({ toDb: [], toFiles: [] });
  });
  it('ignores a file for an unknown id and a database row without a file', () => {
    const r = reconcile(db, new Map([['zzz', { status: 'handled' as const, statusUpdatedAt: 9_999 }]]));
    expect(r).toEqual({ toDb: [], toFiles: [] });
  });
});
