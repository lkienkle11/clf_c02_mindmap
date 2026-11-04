import { loadCatalog } from './load-catalog';
import type { Catalog, Lesson, Question } from './types';

type RawModules = Record<string, string>;

// content/review/ holds import notes for humans; they are never bundled into the app.
const files = import.meta.glob(['/content/**', '!/content/review/**'], {
  eager: true,
  query: '?raw',
  import: 'default',
}) as RawModules;

/** Paths of the bundled content files (for tests and diagnostics). */
export function bundledPaths(): string[] {
  return Object.keys(files);
}

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
    const order = parseInt(prefix[1], 10);
    const entry = byId.get(id) ?? { topicId, order };
    if (entry[lang as 'en' | 'vi']) throw new Error(`duplicate lesson id "${id}" for ${lang} in ${path}`);
    if (entry.topicId !== topicId || entry.order !== order) {
      const partner = (entry.en ?? entry.vi)?.path;
      throw new Error(`lesson ${id}: ${partner} and ${path} must share the topic folder and the NN- prefix`);
    }
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

/** JSON.parse whose error names the content file. */
export function parseJson(text: string, path: string): unknown {
  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error(`invalid JSON in ${path}: ${e instanceof Error ? e.message : String(e)}`);
  }
}

export function buildQuestions(all: RawModules): Question[] {
  return Object.entries(all)
    .filter(([path]) => path.startsWith('/content/questions/') && path.endsWith('.json'))
    .flatMap(([path, text]) => {
      const parsed = parseJson(text, path);
      if (!Array.isArray(parsed)) throw new Error(`${path} must contain a JSON array of questions`);
      return parsed as Question[];
    });
}

export interface ExplanationEntry {
  explanation?: string;
  optionNotes?: Record<string, string>;
}
export type ExplanationOverlay = Record<string, ExplanationEntry>;

const EXPLANATION_PATH = /^\/content\/explanations\/[^/]+\.json$/;

/** Reads content/explanations/*.json (question id -> explanation/optionNotes) into one overlay. */
export function buildExplanations(all: RawModules): ExplanationOverlay {
  const overlay: ExplanationOverlay = {};
  for (const [path, text] of Object.entries(all)) {
    if (!EXPLANATION_PATH.test(path)) continue;
    const parsed = parseJson(text, path);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      throw new Error(`${path} must contain a JSON object keyed by question id`);
    }
    for (const [id, entry] of Object.entries(parsed as ExplanationOverlay)) {
      if (Object.hasOwn(overlay, id)) throw new Error(`duplicate explanation for question id "${id}" in ${path}`);
      overlay[id] = entry;
    }
  }
  return overlay;
}

/** Overlay wins over an inline explanation; an id with no matching question is an error. */
export function applyExplanations(questions: Question[], overlay: ExplanationOverlay): Question[] {
  const ids = new Set(questions.map((q) => q.id));
  for (const id of Object.keys(overlay)) {
    if (!ids.has(id)) throw new Error(`explanations overlay references unknown question id "${id}"`);
  }
  return questions.map((q) => {
    const e = overlay[q.id];
    if (!e) return q;
    return {
      ...q,
      ...(e.explanation !== undefined ? { explanation: e.explanation } : {}),
      ...(e.optionNotes !== undefined ? { optionNotes: e.optionNotes } : {}),
    };
  });
}

export function loadBundledCatalog(): Catalog {
  const topicsRaw = files['/content/topics.json'];
  if (topicsRaw === undefined) throw new Error('content/topics.json is missing');
  return loadCatalog({
    topics: parseJson(topicsRaw, '/content/topics.json'),
    lessons: buildLessons(files),
    questions: applyExplanations(buildQuestions(files), buildExplanations(files)),
  });
}
