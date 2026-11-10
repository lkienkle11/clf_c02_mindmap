import type { ReportRow, ReportStatus, ReportType } from '@/persistence/records';

export interface ExportedReport {
  id: string;
  type: ReportType;
  status: ReportStatus;
  createdAt: number;
  statusUpdatedAt: number;
  body: string;
  locale: string;
  appVersion: string;
  refs: {
    questionId: string | null;
    lessonId: string | null;
    attemptId: string | null;
    position: number | null;
    optionOrder: string[] | null;
    selected: string[] | null;
    isCorrect: boolean | null;
    sourceScreen: string | null;
  };
  images: string[];
}

/** Ids become file names, so only a single safe path segment is exported or synced. */
export const isSafeReportId = (id: string): boolean => /^[A-Za-z0-9_-]+$/.test(id);

/** The exported name of a stored image (`report-images/<id>-<idx>.<ext>` becomes `images/<id>-<idx>.<ext>`). */
export function exportedImageName(storedRel: string): string {
  const base = storedRel.split(/[\\/]+/).pop() ?? storedRel;
  return `images/${base}`;
}

export function toExportedReport(r: ReportRow): ExportedReport {
  return {
    id: r.id,
    type: r.type,
    status: r.status,
    createdAt: r.createdAt,
    statusUpdatedAt: r.statusUpdatedAt,
    body: r.body,
    locale: r.locale,
    appVersion: r.appVersion,
    refs: {
      questionId: r.questionId,
      lessonId: r.lessonId,
      attemptId: r.attemptId,
      position: r.position,
      optionOrder: r.optionOrder,
      selected: r.selected,
      isCorrect: r.isCorrect,
      sourceScreen: r.sourceScreen,
    },
    images: r.images.map(exportedImageName),
  };
}

export function exportReadme(): string {
  return `# Reports exported from the app

Each \`<id>.json\` file in this folder is one report written by a learner. \`index.json\` lists them all.

## How to read a report

- \`type\`: \`question\` (the question is wrong), \`lesson\` (the knowledge text is wrong) or \`system\` (an app bug).
- \`body\`: the learner's text (a small Markdown subset).
- \`refs\`: where it came from. \`questionId\` / \`lessonId\` point at the content by id; \`attemptId\`, \`position\`,
  \`optionOrder\`, \`selected\`, \`isCorrect\` describe the attempt in which the learner saw the question.
- \`images\`: screenshots, relative to this folder (for example \`images/<id>-0.png\`).

## Where the content lives

Find the question or lesson by its id in the repository: questions in \`content/questions\`, lessons in
\`content/lessons\`, explanations in \`content/explanations\`.

## REQUIRED after you fix a report

Fixing the content alone does NOT change the report. When the report is handled, edit that report's \`<id>.json\`:

1. Set \`"status": "handled"\`.
2. Set \`statusUpdatedAt\` to the current time in milliseconds since the epoch (it must be newer than the old value).

Change nothing else in the file; only \`status\` and \`statusUpdatedAt\` are read back.

The app picks the change up on the next sync: opening the Reports tab or pressing Export.
`;
}

const MAX_TIME = 8.64e15;

/** Reads only `status` and `statusUpdatedAt` from untrusted file content; null when anything is off. */
export function parseExportedStatus(text: string): { status: ReportStatus; statusUpdatedAt: number } | null {
  let data: unknown;
  try {
    // Windows editors may prepend a byte order mark.
    data = JSON.parse(text.charCodeAt(0) === 0xfeff ? text.slice(1) : text);
  } catch {
    return null;
  }
  if (typeof data !== 'object' || data === null || Array.isArray(data)) return null;
  const status: unknown = (data as Record<string, unknown>).status;
  const at: unknown = (data as Record<string, unknown>).statusUpdatedAt;
  if (status !== 'new' && status !== 'handled') return null;
  if (typeof at !== 'number' || !Number.isSafeInteger(at) || at < 0 || at > MAX_TIME) return null;
  return { status, statusUpdatedAt: at };
}
