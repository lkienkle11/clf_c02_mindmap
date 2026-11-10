import { describe, expect, it } from 'vitest';
import { createFakeReportStorage } from '@/testing/fake-report-storage';
import { assertSafeRel, imageExtension, imageRelPath } from './report-storage';

const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1]);
const JPG = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 1]);

describe('assertSafeRel', () => {
  it('accepts plain relative paths', () => {
    expect(() => assertSafeRel('a.md')).not.toThrow();
    expect(() => assertSafeRel('sub/dir/a.png')).not.toThrow();
    expect(() => assertSafeRel('a..b.md')).not.toThrow();
  });
  it.each(['', '..', '../x', 'a/../b', 'a/..', '..\\x', 'a\\..\\b', '/etc/passwd', '\\x', 'C:\\x', 'C:/x', 'a\0b'])(
    'rejects %j',
    (rel) => {
      expect(() => assertSafeRel(rel)).toThrow();
    },
  );
});

describe('imageExtension / imageRelPath', () => {
  it('follows the file signature: png for PNG, jpg for JPEG, png when unknown', () => {
    expect(imageExtension(PNG)).toBe('png');
    expect(imageExtension(JPG)).toBe('jpg');
    expect(imageExtension(new Uint8Array([1, 2, 3]))).toBe('png');
    expect(imageExtension(new Uint8Array())).toBe('png');
  });
  it('builds report-images/<id>-<idx>.<ext> and keeps the id rules', () => {
    expect(imageRelPath('r1', 2, JPG)).toBe('report-images/r1-2.jpg');
    expect(imageRelPath('r1', 2, PNG)).toBe('report-images/r1-2.png');
    expect(imageRelPath('r1', 2)).toBe('report-images/r1-2.png');
    expect(() => imageRelPath('../x', 0, JPG)).toThrow();
    expect(() => imageRelPath('r1', -1, JPG)).toThrow();
  });
});

describe('fake report storage', () => {
  it('saves JPEG bytes as .jpg and PNG bytes as .png', async () => {
    const s = createFakeReportStorage();
    const jpg = await s.saveImage('r1', 0, JPG);
    const png = await s.saveImage('r1', 1, PNG);
    expect([jpg, png]).toEqual(['report-images/r1-0.jpg', 'report-images/r1-1.png']);
    expect(await s.readImage(jpg)).toEqual(JPG);
    expect(await s.readImage(png)).toEqual(PNG);
  });
  it('saves an image and reads the same bytes back under report-images/', async () => {
    const s = createFakeReportStorage();
    const png = new Uint8Array([1, 2, 3]);
    const rel = await s.saveImage('r1', 0, png);
    expect(rel).toBe('report-images/r1-0.png');
    expect(await s.readImage(rel)).toEqual(png);
  });
  it('readText of a missing file returns null; writeText then readText round-trips', async () => {
    const s = createFakeReportStorage();
    expect(await s.readText('/d', 'a.md')).toBeNull();
    await s.writeText('/d', 'a.md', 'hi');
    expect(await s.readText('/d', 'a.md')).toBe('hi');
  });
  it('writeBytes stores bytes', async () => {
    const s = createFakeReportStorage();
    await s.writeBytes('/d', 'img/a.png', new Uint8Array([9]));
    expect(s.files.get('/d/img/a.png')).toEqual(new Uint8Array([9]));
  });
  it('rejects unsafe rel values on write and read', async () => {
    const s = createFakeReportStorage();
    await expect(s.writeText('/d', '../x', 'x')).rejects.toThrow();
    await expect(s.writeBytes('/d', '/abs', new Uint8Array())).rejects.toThrow();
    await expect(s.readText('/d', 'a/../../x')).rejects.toThrow();
    await expect(s.readImage('../x.png')).rejects.toThrow();
  });
  it('rejects a report id that would escape report-images', async () => {
    const s = createFakeReportStorage();
    await expect(s.saveImage('../x', 0, new Uint8Array())).rejects.toThrow();
    await expect(s.saveImage('a/b', 0, new Uint8Array())).rejects.toThrow();
  });
  it('failNext makes exactly the next call of that op reject', async () => {
    const s = createFakeReportStorage();
    s.failNext('saveImage');
    await expect(s.saveImage('r1', 0, new Uint8Array())).rejects.toThrow();
    await expect(s.saveImage('r1', 0, new Uint8Array())).resolves.toBe('report-images/r1-0.png');
  });
  it('pickExportDir returns the configured folder or null', async () => {
    const s = createFakeReportStorage();
    expect(await s.defaultExportDir()).toBe('/app-data/reports');
    expect(await s.pickExportDir()).toBeNull();
    s.pickedDir = '/picked';
    expect(await s.pickExportDir()).toBe('/picked');
  });
});
