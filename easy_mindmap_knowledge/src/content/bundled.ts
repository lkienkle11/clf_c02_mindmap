import { loadCatalog } from './load-catalog';
import type { Catalog, Lesson, Question } from './types';

type RawModules = Record<string, string>;

const files = import.meta.glob('/content/**', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as RawModules;

export interface FrontMatter {
  meta: Record<string, string>;
  body: string;
}

export function parseFrontMatter(text: string, path: string): FrontMatter {
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

const LESSON_PATH = /^\/content\/lessons\/(?:([^/]+)\/)?([^/]+)\.(en|vi)\.md$/;

export function buildLessons(all: RawModules): Lesson[] {
  type Part = { fm: FrontMatter; path: string };
  const byId = new Map<string, { topicId: string; order: number; en?: Part; vi?: Part }>();
  for (const [path, text] of Object.entries(all)) {
    const m = LESSON_PATH.exec(path);
    if (!m) continue;
    const [, topicId, name, lang] = m;
    if (!topicId) throw new Error(`lesson file has no topic folder: ${path}`);
    const prefix = /^(\d+)-/.exec(name);
    if (!prefix) throw new Error(`lesson filename needs a numeric NN- prefix: ${path}`);
    const fm = parseFrontMatter(text, path);
    const { id, title, required } = fm.meta;
    if (!id) throw new Error(`lesson front matter missing id in ${path}`);
    if (!title) throw new Error(`lesson front matter missing title in ${path}`);
    if (required !== undefined && required !== 'true' && required !== 'false') {
      throw new Error(`lesson front matter required must be true or false in ${path}`);
    }
    const entry = byId.get(id) ?? { topicId, order: parseInt(prefix[1], 10) };
    if (entry[lang as 'en' | 'vi']) throw new Error(`duplicate lesson id "${id}" for ${lang} in ${path}`);
    entry[lang as 'en' | 'vi'] = { fm, path };
    byId.set(id, entry);
  }
  return [...byId.entries()].map(([id, { topicId, order, en, vi }]) => {
    if (!en) throw new Error(`lesson ${id} is missing its .en.md file (has ${vi?.path})`);
    if (!vi) throw new Error(`lesson ${id} is missing its .vi.md file (has ${en.path})`);
    return {
      id,
      topicId,
      order,
      required: en.fm.meta.required !== 'false',
      title: { en: en.fm.meta.title, vi: vi.fm.meta.title },
      body: { en: en.fm.body, vi: vi.fm.body },
      ...(en.fm.meta.videoQuery ? { videoQuery: en.fm.meta.videoQuery } : {}),
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
