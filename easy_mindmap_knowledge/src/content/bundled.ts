import { loadCatalog } from './load-catalog';
import type { Catalog, Lesson, Question } from './types';

type RawModules = Record<string, string>;

const files = import.meta.glob('/content/**', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as RawModules;

interface FrontMatter {
  meta: Record<string, string>;
  body: string;
}

function parseFrontMatter(text: string, path: string): FrontMatter {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(text);
  if (!m) throw new Error(`missing front matter in ${path}`);
  const meta: Record<string, string> = {};
  for (const line of m[1].split(/\r?\n/)) {
    const i = line.indexOf(':');
    if (i < 0) continue;
    meta[line.slice(0, i).trim()] = line
      .slice(i + 1)
      .trim()
      .replace(/^(['"])(.*)\1$/, '$2');
  }
  return { meta, body: m[2].trim() };
}

function buildLessons(all: RawModules): Lesson[] {
  const byId = new Map<string, { en?: FrontMatter; vi?: FrontMatter }>();
  for (const [path, text] of Object.entries(all)) {
    const m = /\.(en|vi)\.md$/.exec(path);
    if (!m || !path.startsWith('/content/lessons/')) continue;
    const fm = parseFrontMatter(text, path);
    const id = fm.meta.id;
    if (!id) throw new Error(`lesson front matter missing id in ${path}`);
    const entry = byId.get(id) ?? {};
    entry[m[1] as 'en' | 'vi'] = fm;
    byId.set(id, entry);
  }
  return [...byId.entries()].map(([id, { en, vi }]) => {
    if (!en || !vi) throw new Error(`lesson ${id} needs both .en.md and .vi.md`);
    return {
      id,
      topicId: en.meta.topicId,
      order: Number(en.meta.order),
      required: en.meta.required !== 'false',
      title: { en: en.meta.title, vi: vi.meta.title },
      body: { en: en.body, vi: vi.body },
      ...(en.meta.videoQuery ? { videoQuery: en.meta.videoQuery } : {}),
    };
  });
}

function buildQuestions(all: RawModules): Question[] {
  return Object.entries(all)
    .filter(([path]) => path.startsWith('/content/questions/') && path.endsWith('.json'))
    .flatMap(([, text]) => JSON.parse(text) as Question[]);
}

export function loadBundledCatalog(): Catalog {
  const topicsRaw = files['/content/topics.json'];
  if (topicsRaw === undefined) throw new Error('content/topics.json is missing');
  return loadCatalog({
    topics: JSON.parse(topicsRaw),
    lessons: buildLessons(files),
    questions: buildQuestions(files),
  });
}
