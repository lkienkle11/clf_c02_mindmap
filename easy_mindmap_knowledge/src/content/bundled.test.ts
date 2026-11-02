import { describe, expect, it } from 'vitest';
import { buildLessons, parseFrontMatter } from './bundled';

const P = '/content/lessons/compute/02-ec2';
const file = (fm: string, body = 'Body') => `---\n${fm}\n---\n${body}\n`;
const pair = (over: Record<string, string> = {}) => ({
  [`${P}.en.md`]: file('id: compute-ec2\ntitle: "EC2: basics"\nvideoQuery: aws ec2', 'English'),
  [`${P}.vi.md`]: file('id: compute-ec2\ntitle: Cơ bản EC2', 'Tiếng Việt'),
  ...over,
});

describe('parseFrontMatter', () => {
  it('parses quoted values and body', () => {
    const r = parseFrontMatter(file('id: a\ntitle: "x: y"'), 'f.md');
    expect(r.meta).toEqual({ id: 'a', title: 'x: y' });
    expect(r.body).toBe('Body');
  });
  it('throws naming the file when there is no front matter', () => {
    expect(() => parseFrontMatter('just text', '/content/x.md')).toThrow(/front matter.*\/content\/x\.md/);
  });
});

describe('buildLessons', () => {
  it('builds a lesson from the folder, NN prefix and front matter', () => {
    const [l] = buildLessons(pair());
    expect(l).toEqual({
      id: 'compute-ec2', topicId: 'compute', order: 2, required: true,
      title: { en: 'EC2: basics', vi: 'Cơ bản EC2' },
      body: { en: 'English', vi: 'Tiếng Việt' }, videoQuery: 'aws ec2',
    });
  });
  it('omits videoQuery when absent', () => {
    const files = pair({ [`${P}.en.md`]: file('id: compute-ec2\ntitle: T') });
    expect('videoQuery' in buildLessons(files)[0]).toBe(false);
  });
  it('parses required booleans', () => {
    const f = (v: string) => buildLessons(pair({ [`${P}.en.md`]: file(`id: compute-ec2\ntitle: T\nrequired: ${v}`) }))[0];
    expect(f('false').required).toBe(false);
    expect(f('true').required).toBe(true);
    expect(() => f('yes')).toThrow(/required.*\.en\.md/);
  });
  it('ignores non-lesson files', () => {
    expect(buildLessons({ ...pair(), '/content/topics.json': '[]' })).toHaveLength(1);
  });
  it('throws when id or title is missing', () => {
    expect(() => buildLessons(pair({ [`${P}.en.md`]: file('title: T') }))).toThrow(/id.*\.en\.md/);
    expect(() => buildLessons(pair({ [`${P}.en.md`]: file('id: compute-ec2') }))).toThrow(/title.*\.en\.md/);
  });
  it('throws when front matter is missing', () => {
    expect(() => buildLessons(pair({ [`${P}.vi.md`]: 'plain' }))).toThrow(/front matter.*\.vi\.md/);
  });
  it('throws when the folder has no topic', () => {
    const files = { '/content/lessons/02-ec2.en.md': file('id: a\ntitle: T'), '/content/lessons/02-ec2.vi.md': file('id: a\ntitle: T') };
    expect(() => buildLessons(files)).toThrow(/topic.*02-ec2\.en\.md/);
  });
  it('throws when the filename lacks an NN- prefix', () => {
    const files = { '/content/lessons/compute/ec2.en.md': file('id: a\ntitle: T') };
    expect(() => buildLessons(files)).toThrow(/NN-.*ec2\.en\.md/);
  });
  it('throws when a language partner is missing', () => {
    const files = { [`${P}.en.md`]: file('id: compute-ec2\ntitle: T') };
    expect(() => buildLessons(files)).toThrow(/compute-ec2.*\.vi\.md/);
  });
  it('throws when two files share id and language', () => {
    const files = pair({ '/content/lessons/compute/03-dup.en.md': file('id: compute-ec2\ntitle: T') });
    expect(() => buildLessons(files)).toThrow(/duplicate.*03-dup\.en\.md/);
  });
});
