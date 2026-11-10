# AWS CLF-C02 Mindmap

An offline desktop app (Tauri v2 + Svelte 5 + Tailwind 4) for learning and practising the AWS Certified Cloud Practitioner (CLF-C02) exam. Topics are shown as a mindmap tree; each topic has bilingual (EN/VI) lessons, practice attempts, spaced review, history and settings. Progress is stored locally in SQLite.

Status: all 13 topics have lessons and authored questions. There are 140 lessons (each in EN and VI), 130 authored questions and 668 imported questions.

## Prerequisites

- Node.js (22 or newer) and npm
- Rust >= 1.90 via [rustup](https://rustup.rs) (on Homebrew: `PATH=/opt/homebrew/opt/rustup/bin:$PATH`)
- Xcode command line tools (`xcode-select --install`), macOS 13 or newer

## Commands

Run from this directory (`easy_mindmap_knowledge/`). Use `npm` / `npx`, not pnpm.

| Command | What it does |
| --- | --- |
| `npm install` | Install dependencies |
| `npm run dev` | Vite dev server only (browser). The app needs Tauri APIs (SQLite, opener), so this alone is not the real app |
| `npx tauri dev` | The real app in a Tauri window with hot reload |
| `npm test` | Vitest suite |
| `npm run check` | svelte-check / TypeScript |
| `npm run build` | Production frontend build into `dist/` |
| `npx tauri build --bundles app` | Unsigned macOS `.app` |

### Building the macOS app

```sh
PATH=/opt/homebrew/opt/rustup/bin:$PATH npx tauri build --bundles app
```

Output: `src-tauri/target/release/bundle/macos/AWS CLF-C02 Mindmap.app`. The app is unsigned and not notarized. To open it the first time, right-click it and choose Open, or clear the quarantine flag:

```sh
xattr -dr com.apple.quarantine "src-tauri/target/release/bundle/macos/AWS CLF-C02 Mindmap.app"
```

## Practice and exams

- **Practice**: choose the number of questions per attempt, from 10 up to the number of questions in the topic (quick buttons 10, 20, 50 and All; default 10). A topic with fewer than 10 questions uses all of them.
- **Checkpoint exams**: topics are grouped in threes by order (1-3, 4-6, 7-9, 10-12). After you finish the three topics of a group, each with a practice attempt of at least 80%, a 65-question checkpoint exam appears on the tree. It must be passed (80%) before the next group unlocks.
- **Capstone exam**: a 65-question exam split by the real exam domain weights: Cloud Concepts 24%, Security and Compliance 30%, Cloud Technology and Services 34%, Billing, Pricing and Support 12%. It unlocks after the last group's checkpoint is passed. The Capstone draws 16, 19, 22 and 8 questions per domain (24/30/34/12), and the ten authored Capstone questions are mapped to domains (`CAPSTONE_QUESTION_DOMAIN`) so they are drawn like any other question.
- **Exam rules** (checkpoint and Capstone):
  - 65 questions, or fewer if the pool is smaller; an exam does not start with fewer than 10.
  - 90 minutes, or 120 minutes with the "extra 30 minutes" option (the ESL accommodation of the real exam). With fewer than 65 questions the time is scaled per question.
  - The clock always runs, including when the window is hidden.
  - No lessons can be opened and no answers are shown until you submit. You can move between questions and change answers until you submit.
  - Leaving the exam abandons the attempt. After a crash the attempt is kept; resuming after the deadline submits it automatically.
- A few lessons keep one inline source link outside the Sources section; these are volatile status claims (for example a service's retirement or availability date) where the reader should be able to check the page directly.
- **Retakes** draw questions you have never seen first, then questions you got wrong (most misses first), then the rest.
- The real exam facts used by the app come from the official AWS pages: 65 questions (50 scored and 15 unscored), 90 minutes, passing score 700/1000. The app uses a simpler 80% pass mark and counts every question.

## Reports

Learners can report a wrong question, wrong lesson knowledge or a system problem. Reports stay on your machine.

- **Stored**: tables `reports` and `report_images` in `mindmap.db` (migration `0005_reports.sql`, which also adds `clock_on_report` to `attempts`). A report stores ids, not content: the question or lesson id and, for questions, the attempt details (position, option order, selected answers, correct or not). Question text and options are not copied. Screenshots are PNG or JPEG files in `report-images/` under the app data directory; the database keeps their relative paths.
- **Where**: the Tauri app data directory (`appDataDir()`, identifier `app.awsclf.mindmap`):
  - macOS: `~/Library/Application Support/app.awsclf.mindmap/`
  - Windows: `%APPDATA%\app.awsclf.mindmap\`
  - Linux: `$XDG_DATA_HOME/app.awsclf.mindmap/`, or `~/.local/share/app.awsclf.mindmap/` when `XDG_DATA_HOME` is unset
  - `mindmap.db` itself stays in the app config directory (see User data). That is the same folder as the data directory on macOS and Windows, but not on Linux.
- **Where to report**:
  - Wrong question (5 places): the practice, exam and review result screens; the history attempt view; the "most missed questions" dialog; the footer of a practice, exam or review session.
  - Wrong knowledge (3 places): the lesson screen; the knowledge overlay during a practice or exam; the same overlay during a review.
  - System issue (1 place): Settings, below the Language section.
- **Report dialog**: the text (bold, italic, lists; up to 1500 visible characters). Question and lesson reports take one optional screenshot of the content on screen, taken without the dialog. System reports attach up to 3 PNG or JPEG images of 5 MB or less each. Closing the dialog always asks for confirmation and then discards the text.
- **Timed attempts**: the practice setup screen has "When you open a report during a session", with "Freeze the time" (default) or "Let the time keep running". It is chosen per attempt, applies only while the window is visible, and does nothing for untimed attempts. A hidden window still follows "When you switch tabs or minimize". Exam and checkpoint attempts always keep the clock running.
- **Reports tab**: a summary (counts by type and status), filters (type, status, date range, text search), a list of 10 per page, and a detail view with the text, screenshots and references. Mark a report "Handled" or reopen it there. The tab shows how many reports are new.
- **Export**: "Export reports" on the Reports tab writes to the default folder `reports/` under the app data directory, or to a folder you choose (the choice is remembered). The folder holds:
  - `README.md`: how to read a report and how to mark it handled (rewritten on every export)
  - `index.json`: one entry per report
  - `<id>.json`: one report, with `status` and `statusUpdatedAt`
  - `images/<id>-<idx>.png` or `.jpg`: the screenshots
- **Marking a report handled from a file**: in `<id>.json`, set `"status": "handled"` and set `statusUpdatedAt` to the current time in milliseconds since the epoch, which must be newer than the old value. Fixing the content alone does not change the status. The app reads the change when the Reports tab opens or when you export, and writes its own status changes back to the files on the same sync. For each report the newer `statusUpdatedAt` wins. Files stamped more than 24 hours in the future are ignored.

## User data

All progress lives in a SQLite file `mindmap.db` in the app config directory of the bundle identifier `app.awsclf.mindmap`. On macOS: `~/Library/Application Support/app.awsclf.mindmap/mindmap.db`. To reset the app, quit it and delete that directory. The schema is created on first launch by the embedded migrations in `src-tauri/migrations/`.

Migration `0004_checkpoint_attempts.sql` adds the `checkpoint` attempt kind and the `group_index` and `planned_count` columns, and rebuilds the `attempts` table to do so.

Never edit a migration that has shipped (for example `0001_init.sql`): installed apps have already applied it and will not run it again. Change the schema only by adding a new `NNNN_description.sql` file and registering it in `src-tauri/src/lib.rs` with the next version number. The tests apply every file in that folder in name order.

## Content

```
content/
  topics.json                      the 13 topics
  lessons/<topic>/<NN>-slug.{en,vi}.md   lessons (front matter + Markdown)
  questions/authored/<topic>.json  hand-authored questions
  questions/imported.json          questions generated from the card deck
  review/                          notes on import exclusions and topic assignment
  review/service-coverage.json     AWS services each topic must teach
```

`content/questions/imported.json` is generated by the importer; re-run it with:

```sh
npx tsx scripts/import-cards/build.ts
```

### Lesson contract and coverage checks

The lesson contract is in `src/content/bundled-content.test.ts` (`EXPANDED_TOPICS`): expanded topics have 8-14 lessons, Capstone has 5-8, and each topic has at least 3 required lessons. Every optional lesson needs a `videoQuery`. Required lessons are 250-900 English prose words and have Key points and Sources sections.

`content/review/service-coverage.json` lists the AWS services that each topic must teach. `src/content/service-coverage.test.ts` checks that every listed service is taught in a lesson of its topic. To find services that the questions mention but no lesson contains, run:

```sh
npx tsx scripts/content/measure-coverage.ts
```

### Adding a topic's content

Follow the conventions set by the topics 1 and 2 content (Task 18 of the plan):

1. Lessons: one pair of files per lesson, `content/lessons/<topic>/<NN>-slug.en.md` and `<NN>-slug.vi.md`. The front matter has `id`, `title`, `required` (true/false) and `videoQuery`; the body is Markdown. Both files of a pair must sit in the same topic folder and share the same `NN-` prefix.
2. Topic: in `content/topics.json`, set the topic's `lessonIds` to the lesson ids of that folder, in `NN-` order. The list must match the lesson files exactly (same ids, same order, no extra or missing id); the app refuses to start otherwise, and the error names the topic and the ids. A topic may have no lessons yet: it can still be practised and shows that lessons come in a later update.
3. Authored questions: `content/questions/authored/<topic>.json`, same shape as the existing files. Option keys and option texts must be unique within a question.
4. Run `npm test`, which validates the catalog.

## Windows and Linux: NOT VERIFIED

Only macOS was built and run by the author. The workflow `.github/workflows/mindmap-build.yml` (at the repository root) builds Windows (NSIS) and Linux (deb) bundles, but it has not been run, and nothing about those platforms has been verified.

## Documents

- Spec: [docs/superpowers/specs/2026-11-02-aws-mindmap-learning-design.md](docs/superpowers/specs/2026-11-02-aws-mindmap-learning-design.md)
- Plan: [docs/superpowers/plans/2026-11-02-aws-mindmap-learning.md](docs/superpowers/plans/2026-11-02-aws-mindmap-learning.md)
- Checkpoint tests and practice count spec: [docs/superpowers/specs/2026-11-04-checkpoint-tests-and-practice-count-design.md](docs/superpowers/specs/2026-11-04-checkpoint-tests-and-practice-count-design.md)
- Checkpoint tests and practice count plan: [docs/superpowers/plans/2026-11-04-checkpoint-tests-and-practice-count.md](docs/superpowers/plans/2026-11-04-checkpoint-tests-and-practice-count.md)
