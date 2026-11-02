# AWS Mindmap Learning App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dựng app desktop Tauri học AWS CLF-C02 theo cây kiến thức (tán cây + dòng nước tiến trình), có bài học, thực hành, lịch sử, ôn tập ngắt quãng, chạy được trên macOS với nội dung đầy đủ cho 2 chủ đề đầu.

**Architecture:** Vite + Svelte 5 SPA (không SvelteKit) trong webview Tauri v2. Logic nghiệp vụ là TypeScript thuần trong `features/*/logic/` (không import Svelte, Tauri, persistence), kiểm thử bằng vitest. Persistence qua interface `SqlExecutor` mỏng: Tauri SQL plugin khi chạy app, `node:sqlite` khi test, cùng chạy một bộ file migration `.sql`. Nội dung (Markdown + JSON) được bundle cùng app; pipeline `scripts/import-cards` biến 672 card thành `content/questions/imported.json`.

**Tech Stack:** Tauri v2, Rust ≥ 1.90 (PATH cần `/opt/homebrew/opt/rustup/bin`), `tauri-plugin-sql` (sqlite), Svelte 5 (runes), Vite, Tailwind 4 (`@tailwindcss/vite`), TypeScript, vitest + jsdom + `@testing-library/svelte`, `marked`, `clsx` + `tailwind-merge`. Dùng `npm`/`npx tauri`, không dùng `pnpm tauri`.

**Spec:** `easy_mindmap_knowledge/docs/superpowers/specs/2026-11-02-aws-mindmap-learning-design.md` (executor đọc cả spec; mục "(my call)" đã được người dùng duyệt cùng spec).

**Phạm vi plan này:** toàn bộ app + importer + nội dung **chủ đề 1 và 2** (đúng thứ tự thực hiện ở spec mục 6). Nội dung chủ đề 3 đến 13 (bài học song ngữ, 5 đến 10 câu tự soạn, rà gán chủ đề cho 672 card) là các plan đợt sau, mỗi đợt dùng lại Task 18 làm khuôn. `topics.json` vẫn khai báo đủ 13 chủ đề; chủ đề chưa có nội dung hiển thị bình thường nhưng chưa đạt được cho tới khi có đợt nội dung.

## Global Constraints

- Tauri (không phải webapp localhost), Svelte 5 runes (không `export let`, `$:`, `on:click`, `<slot>`), Tailwind 4, SQLite lưu tiến trình, mọi code trong `easy_mindmap_knowledge/`.
- Giao diện i18n EN + VI; câu hỏi thực hành luôn tiếng Anh.
- Ngưỡng đạt: `correct * 100 >= 80 * total` (gồm đúng 80%). Chỉ lượt `practice` tính hoàn thành chủ đề.
- 10 câu mỗi lượt thực hành, Capstone (chủ đề 13) 30 câu; kho nhỏ hơn thì lấy hết.
- Chấm: câu nhiều đáp án đúng khi chọn đúng toàn bộ tập đáp án, không chấm từng phần.
- Xáo thứ tự câu và đáp án **một lần lúc bắt đầu lượt**, lưu cùng lượt; câu `orderDependent` giữ nguyên thứ tự đáp án.
- Đồng hồ: `freeze` (mặc định) hoặc `run`; xem lại kiến thức giữa bài thì đồng hồ vẫn chạy; hết giờ tự nộp; nút Thoát (có xác nhận) xóa lượt khỏi DB; crash giữ lượt `in_progress`.
- Leitner: hộp 0 đến 5 ứng với 1, 3, 7, 14, 30, 60 ngày; đúng thì lên một hộp, sai thì về hộp 0 (đến hạn sau 1 ngày); lịch ôn nằm sau interface `ReviewScheduler`.
- Ôn tập: lô 15 câu, tối thiểu 2 câu mỗi chủ đề, tối thiểu 8 câu mỗi bài ôn (bổ sung câu chưa đến hạn), chỉ câu thuộc chủ đề đã hoàn thành, modal tối đa một lần mỗi ngày lịch (`review_prompt_last_shown_date`).
- Màu: xanh lá = đã qua, xanh dương = sẽ học (đậm hơn khi hover), bạc + khóa = chưa mở; không dùng màu làm tín hiệu duy nhất (kèm ✓ ▶ 🔒); tôn trọng `prefers-reduced-motion`.
- Bắt buộc dùng bước test-first (RED xem fail, GREEN, rồi chạy cả suite) cho mọi code có logic.
- Commit theo CLAUDE.md của repo: `type(scope): description` + 4 mục **Scope / What did / Reviewed / Tested**, không có trailer đồng tác giả hay ghi AI. Người dùng duyệt plan này nghĩa là cho phép các commit cuối mỗi task; không push, không merge.
- Nhánh làm việc: `feat/aws-mindmap-learning` (giữ nguyên, không bao giờ làm trên `main`).
- Workflow CI Windows/Linux phải nằm ở `.github/workflows/` của gốc repo (GitHub chỉ đọc ở đó); không chạy, ghi rõ chưa kiểm chứng.

## Review Focus

Các đầu vào/điều kiện spec ngụ ý nhưng không task nào kiểm thử nếu không ghi ở đây (mỗi dòng đã có test ở task chủ):

1. **Card thô bất thường** (CRLF, khoảng trắng thừa, dòng đáp án khác thứ tự option, hai card trùng câu hỏi): importer không được sinh id trùng hay đáp án sai. → Task 2.
2. **Mở lại lượt `run` khi đã quá `deadline_at`** (hoặc đồng hồ máy lùi): tự nộp với các câu đã làm, không treo ở "Tiếp tục?". → Task 6.
3. **Crash giữa lúc nộp** (đã đánh dấu `submitted` nhưng `question_stats` chưa cập nhật): lần mở sau tự khớp lại, không cập nhật đôi. → Task 8.
4. **Chưa có câu nào đến hạn / chủ đề chưa hoàn thành**: không hiện modal, không hiện huy hiệu, nút Ôn tập ẩn hoặc tắt. → Task 10, 16.
5. **Chủ đề có ít câu hơn lượt cần** (đặc biệt chủ đề 3 đến 13 chưa có nội dung): lượt lấy hết số câu có, kho rỗng thì không cho bắt đầu và báo rõ. → Task 5, 14.

---

## Cấu trúc thư mục và module (để người dùng duyệt)

Shape: frontend có nhiều màn hình, chia theo **feature sản phẩm** kèm nền tảng có tên rõ ràng; `logic/` là lõi thuần kiểm thử được, `ui/` là Svelte. Không có `hexagon/`, `adapters/` hay `shared/`/`utils/`: chỉ một ranh giới thật (persistence và Tauri nằm ngoài logic) và nó được ép bằng test import.

```text
easy_mindmap_knowledge/
├── package.json, vite.config.ts, svelte.config.js, tsconfig.json, index.html
├── content/                              # nội dung bundle cùng app
│   ├── topics.json                       # 13 chủ đề, 4 cấp, thứ tự, lessonIds
│   ├── lessons/<topic-id>/<NN-slug>.{en,vi}.md   # front matter: id, required, videoQuery
│   └── questions/
│       ├── imported.json                 # SINH RA từ scripts/import-cards, không sửa tay
│       └── authored/<topic-id>.json      # câu tự soạn + giải thích
├── scripts/import-cards/                 # pipeline nhập 672 card (chạy bằng tsx, ngoài app)
│   ├── parse-cards.ts                    # questions.txt -> RawCard[]
│   ├── stable-id.ts                      # id ổn định từ nội dung
│   ├── order-dependent.ts                # phát hiện "All of the above"...
│   ├── topic-rules.ts                    # từ khóa dịch vụ AWS -> topic-id
│   ├── classify.ts                       # RawCard -> topicId | null
│   └── build.ts                          # ghi content/questions/imported.json
├── src-tauri/
│   ├── Cargo.toml, tauri.conf.json, capabilities/default.json (sql:default, sql:allow-execute)
│   ├── migrations/0001_init.sql          # NGUỒN DUY NHẤT của schema, dùng cả cho test
│   └── src/{main.rs, lib.rs}             # lib.rs đăng ký plugin SQL + add_migrations(include_str!)
├── src/
│   ├── main.ts                           # mount App
│   ├── app/                              # composition root + shell
│   │   ├── composition.ts                # tạo executor, repositories, catalog, scheduler
│   │   ├── app-state.svelte.ts           # view hiện tại, tiến trình đã nạp, hành động cấp app
│   │   └── App.svelte                    # shell: điều hướng giữa các feature
│   ├── content/                          # kiểu nội dung + nạp/validate catalog
│   │   ├── types.ts                      # Topic, Lesson, Question, Catalog
│   │   ├── load-catalog.ts               # loadCatalog(raw): Catalog (validate)
│   │   └── bundled.ts                    # import.meta.glob các file content/
│   ├── persistence/                      # mọi thứ chạm SQL
│   │   ├── records.ts                    # kiểu bản ghi dùng chung: ClockState, AttemptRow, AttemptQuestionRow, QuestionStat (chỉ kiểu, logic được import type)
│   │   ├── sql-executor.ts               # interface SqlExecutor
│   │   ├── tauri-executor.ts             # cài bằng @tauri-apps/plugin-sql
│   │   ├── repositories/{lesson-progress,attempts,question-stats,settings}.ts
│   ├── features/
│   │   ├── mindmap/    logic/{topic-status,tree-layout,water-path}.ts · ui/{TreeCanvas,TopicBranch,LeafNode,TrunkWater}.svelte · index.ts
│   │   ├── lesson/     ui/{LessonPanel.svelte,markdown.ts} · index.ts
│   │   ├── practice/   logic/{pick-questions,shuffle,order-dependent,grading,attempt-clock}.ts
│   │   │               session.svelte.ts · ui/{PracticeSetup,PracticeSession,PracticeResult,ResumePrompt}.svelte · index.ts
│   │   ├── review/     logic/{scheduler,review-summary,build-review-plan,prompt-gate}.ts · stats-rebuild.ts (dịch vụ, không phải logic thuần)
│   │   │               ui/{DailyReviewModal,ReviewSession,ReviewButton}.svelte · index.ts
│   │   ├── history/    logic/history-stats.ts · ui/{HistoryScreen,ScoreChart,AttemptDetail}.svelte · index.ts
│   │   └── settings/   ui/SettingsScreen.svelte · index.ts
│   ├── ui/                               # design system: token + thành phần nền
│   │   ├── tokens.css                    # @theme: màu leaf-done/next/locked, spacing, type
│   │   ├── cn.ts                         # clsx + tailwind-merge
│   │   └── {Button,Modal,Badge,ProgressBar}.svelte
│   ├── i18n/{i18n.svelte.ts,en.json,vi.json}
│   └── testing/                          # CHỈ test được import
│       ├── node-sqlite-executor.ts       # SqlExecutor trên node:sqlite, nạp 0001_init.sql
│       └── fixtures.ts                   # catalog nhỏ, hàm dựng Question/Attempt
└── tests/architecture/boundaries.test.ts # ép hướng import
```

**Quy tắc đặt file mới:** hành vi của một màn/feature vào `features/<tên>/`; phần không cần Svelte vào `logic/` của feature đó; chạm SQL chỉ vào `persistence/`; thành phần dùng ở ≥ 2 feature và không mang nghiệp vụ vào `ui/`.

**Hướng import được phép:** `features/*/ui` → `features/*/logic` cùng feature, `ui/`, `i18n/`, `content/`, `app` store qua props/context; `features/*/logic` → `content/types`, `import type` từ `persistence/records` và logic cùng feature (cấm Svelte, `@tauri-apps/*`, mọi import khác từ `persistence/`); `persistence/` → `content/types`; `app/` (composition root) → mọi thứ; feature khác chỉ qua `index.ts`; `testing/` chỉ test import. `boundaries.test.ts` quét import và fail khi vi phạm.

**Cố ý không làm:** không router thư viện, không Svelte Flow, không store toàn cục `stores/`, không ports/adapters (chỉ interface `SqlExecutor` và `ReviewScheduler`, mỗi cái có ≥ 2 cài đặt hoặc lý do thay thế thật).

---

## Task 1: Scaffold project, toolchain, boundary test

**Files:**
- Create: toàn bộ khung trong cây trên (`package.json`, `vite.config.ts`, `svelte.config.js`, `tsconfig.json`, `index.html`, `src/main.ts`, `src/app/App.svelte`, `src/ui/tokens.css`, `src/ui/cn.ts`, `src-tauri/*`), `tests/architecture/boundaries.test.ts`
- Modify: không

**Interfaces:**
- Produces: `cn(...inputs: ClassValue[]): string` trong `src/ui/cn.ts`; script npm `dev`, `build`, `test` (`vitest run`), `tauri` (`tauri`); alias import `$lib`-style không dùng, import tương đối hoặc `@/` → `src/` (khai báo trong `tsconfig.json` và `vite.config.ts`).

- [ ] **Step 1:** Trước mọi thứ, chạy `git status` rồi commit riêng spec, plan và file chọn skill hiện chưa được theo dõi (`docs: add mindmap spec, plan and skill selection`). Đây là commit tài liệu đã được người dùng duyệt.
- [ ] **Step 2: Write the failing test** `tests/architecture/boundaries.test.ts`: test `logic folders import no svelte, tauri or persistence` quét `src/features/*/logic/**/*.ts` (trừ `*.test.ts`) và expect không có import khớp `/^(svelte|@tauri-apps)/` hay `persistence/` (ngoại lệ duy nhất: `import type ... from '.../persistence/records'`); test `features import other features only through index` ; test `testing/ is imported only by test files`. Test đầu tiên cũng expect `src/features` tồn tại để không pass rỗng.
- [ ] **Step 3:** Run: `npm test` → FAIL (chưa có project/thư mục).
- [ ] **Step 4:** Khởi tạo: Vite + `@sveltejs/vite-plugin-svelte` (Svelte 5, runes mode), `@tailwindcss/vite`, vitest (jsdom mặc định, `// @vitest-environment node` khi cần), `@tauri-apps/cli` + `@tauri-apps/api` + `@tauri-apps/plugin-sql`, `marked`, `clsx`, `tailwind-merge`, `tsx`. `npx tauri init` trỏ `frontendDist` vào `../dist`, `devUrl` Vite; `cargo add tauri-plugin-sql --features sqlite` trong `src-tauri`; `capabilities/default.json` thêm `sql:default`, `sql:allow-execute`. Tạo `src/features/<mỗi feature>/index.ts` rỗng có export tối thiểu để test có cái để quét.
- [ ] **Step 5:** Run: `npm test` → PASS; `npm run build` → thành công; `PATH=/opt/homebrew/opt/rustup/bin:$PATH cargo check --manifest-path src-tauri/Cargo.toml` → thành công.
- [ ] **Step 6:** Commit `chore(app): scaffold tauri svelte project with boundary test`.

## Task 2: Parse 672 card và id ổn định

**Files:**
- Create: `scripts/import-cards/{parse-cards,stable-id,order-dependent}.ts` và `*.test.ts` bên cạnh
- Test: `npm test scripts/import-cards`

**Interfaces:**
- Produces:
  - `interface RawCard { text: string; options: { key: string; text: string }[]; correctKeys: string[]; multi: boolean }`
  - `parseCards(raw: string): RawCard[]` — tách theo dòng `===`, chuẩn hóa CRLF/khoảng trắng; `multi` khi câu hỏi chứa `(Choose two` (không phân biệt hoa thường) hoặc `correctKeys.length > 1`; đáp án khớp **theo văn bản option** (dòng sau `---` trùng text option) rồi đổi thành key.
  - `stableQuestionId(card: RawCard): string` — `q_` + 12 hex đầu của sha1 trên `text` đã chuẩn hóa; hai card trùng `text` nhưng khác option phải ra id khác (băm cả option text đã sắp xếp theo key).
  - `isOrderDependent(optionTexts: string[]): boolean` — true khi có option khớp `/all of the above|none of the above|both [A-F] and [A-F]|\b(options?|answers?) [A-F]\b/i`.

- [ ] **Step 1: Write the failing tests** (Review Focus 1): với chuỗi mẫu 3 card lấy từ `questions.txt` ("Snowball Edge", "Trusted Advisor – Choose two", "CloudFormation"), expect `parseCards` trả đúng 3 card, card 2 có `multi === true` và `correctKeys` `['C','D']`; input CRLF cho kết quả giống LF; dòng đáp án đảo thứ tự vẫn ra cùng tập `correctKeys`; chạy trên file thật `export_cards_to_knowt/results/questions.txt` expect đúng **672** card, **81** `multi`, mọi card `correctKeys.length >= 1` và mỗi key tồn tại trong `options`; `stableQuestionId` duy nhất trên 672 card (set size = 672) và ổn định giữa hai lần chạy; `isOrderDependent(['A','All of the above'])` true, `['Amazon S3','Amazon EC2']` false.
- [ ] **Step 2:** Run → FAIL (module chưa có).
- [ ] **Step 3:** Implement các hàm trên đúng chữ ký. Nếu có card không khớp đáp án với option nào, `parseCards` ném `Error` kèm số thứ tự card (không đoán).
- [ ] **Step 4:** Run → PASS. Nếu test trên file thật lộ card lạ, sửa parser theo dữ liệu thật rồi ghi nhận trong commit.
- [ ] **Step 5:** Commit `feat(import): parse knowt cards with stable ids`.

## Task 3: Phân loại chủ đề và sinh `imported.json`

**Files:**
- Create: `scripts/import-cards/{topic-rules,classify,build}.ts`, `content/questions/imported.json` (sinh ra), `content/review/topic-assignment-sample.md` (sinh ra), `*.test.ts`
- Consumes: Task 2; `Question` từ Task 4 (thứ tự: làm Task 4 trước Step 3 của task này, hoặc khai báo tạm cùng shape rồi chuyển import; executor chọn thứ tự Task 4 → Task 3 nếu muốn tránh tạm)

**Interfaces:**
- Produces:
  - `TOPIC_RULES: { topicId: string; keywords: RegExp[] }[]` — 12 chủ đề đầu (1 đến 12) theo spec mục 6; chủ đề 13 không có luật.
  - `classifyCard(card: RawCard): string | null` — topic có nhiều từ khóa khớp nhất trong `text` + option; hòa hoặc không khớp → `null` (thuộc nhóm "Tổng hợp").
  - `buildImported(cards: RawCard[]): Question[]` với `source: 'imported'`, `topicId` từ `classifyCard`, `orderDependent` từ `isOrderDependent`.
  - `build.ts` ghi `content/questions/imported.json` (mảng `Question[]`, khóa sắp xếp ổn định) và `content/review/topic-assignment-sample.md` (30 card ngẫu nhiên cố định seed, kèm chủ đề được gán) để người dùng duyệt mẫu.

- [ ] **Step 1: Write the failing tests:** `classifyCard` gán `Amazon S3 ... Glacier` → `storage`, câu về `AWS Trusted Advisor` + `Support plan` → `support-ai-other` hoặc `pricing-billing` theo luật bạn khai báo, câu không từ khóa → `null`; `buildImported` giữ nguyên số lượng (672) và `id` duy nhất; chạy ghi file vào thư mục tạm (không đụng `content/`) rồi đọc lại bằng `JSON.parse`.
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Implement. Luật từ khóa khai báo tường minh (tên dịch vụ AWS), không dùng ML. `npx tsx scripts/import-cards/build.ts` ghi file thật.
- [ ] **Step 4:** Run `npm test scripts/import-cards` → PASS; chạy `build.ts`; báo cho người dùng tỉ lệ `null` và đường dẫn file mẫu (việc rà là không chặn, theo spec mục 6).
- [ ] **Step 5:** Commit `feat(import): classify cards by topic and generate question bank`.

## Task 4: Kiểu nội dung và `loadCatalog`

**Files:**
- Create: `src/content/{types,load-catalog,bundled}.ts`, `src/content/load-catalog.test.ts`, `content/topics.json`, `src/testing/fixtures.ts`
- Test: `npm test src/content`

**Interfaces:**
- Produces:
  - `type Tier = 'introduction' | 'core' | 'advanced' | 'capstone'`
  - `type Localized = { en: string; vi: string }`
  - `interface Topic { id: string; order: number; tier: Tier; title: Localized; lessonIds: string[] }` — id theo spec mục 6: `cloud-concepts, global-infrastructure, compute, storage, networking, databases, deploy-operate, shared-responsibility, iam-security, pricing-billing, migration-caf, support-ai-other, capstone`.
  - `interface Lesson { id: string; topicId: string; order: number; required: boolean; title: Localized; body: Localized; videoQuery?: string }`
  - `interface Question { id: string; topicId: string | null; text: string; options: { key: string; text: string }[]; correct: string[]; multi: boolean; orderDependent: boolean; explanation?: string; source: 'imported' | 'authored' }`
  - `interface Catalog { topics: Topic[]; lessons: Lesson[]; questions: Question[]; lessonsOf(topicId: string): Lesson[]; questionsOf(topicId: string): Question[]; topic(id: string): Topic }`
  - `loadCatalog(raw: { topics: unknown; lessons: unknown; questions: unknown }): Catalog` — ném lỗi có thông điệp rõ khi: id trùng, `lessonIds` trỏ bài không tồn tại, `correct` không nằm trong `options`, `multi` không khớp `correct.length > 1`, chủ đề không theo thứ tự `order` liên tục 1..13.
  - `bundled.ts`: `loadBundledCatalog(): Catalog` — dùng `import.meta.glob('/content/**', { eager: true, query: '?raw' })`, ghép lesson `.en.md`/`.vi.md` theo `id` ở front matter.

- [ ] **Step 1: Write the failing tests:** catalog hợp lệ nhỏ từ `fixtures.ts` nạp được và `questionsOf('compute')` trả đúng câu; mỗi ca lỗi ở trên ném `Error` với message chứa từ khóa (`duplicate`, `unknown lesson`, `correct key`, `multi`, `order`); câu `topicId: null` không xuất hiện trong `questionsOf` của chủ đề nào.
- [ ] **Step 2:** Run → FAIL. **Step 3:** Implement. **Step 4:** Run → PASS (kèm test: `loadBundledCatalog()` trên `content/` thật nạp được sau khi Task 3 và 18 xong; đánh dấu test này `it.skip` cho tới Task 18, bật lại ở đó).
- [ ] **Step 5:** Commit `feat(content): add catalog types and validated loader`.

## Task 5: Chọn câu, xáo, chấm điểm

**Files:**
- Create: `src/features/practice/logic/{pick-questions,shuffle,grading}.ts` + `*.test.ts`

**Interfaces:**
- Consumes: `Question`, `Catalog` (Task 4)
- Produces:
  - `practiceCount(topicId: string): number` — 30 nếu `capstone`, ngược lại 10.
  - `buildPool(catalog: Catalog, topicId: string): Question[]` — capstone: mọi câu (kể cả `topicId: null`); khác: `catalog.questionsOf(topicId)`.
  - `makeRng(seed: number): () => number` (mulberry32), `shuffle<T>(items: readonly T[], rng: () => number): T[]` (không đổi mảng gốc).
  - `interface PlannedQuestion { questionId: string; optionOrder: string[] }` (`optionOrder` là danh sách `key` theo thứ tự hiển thị)
  - `planAttempt(pool: Question[], count: number, rng: () => number): PlannedQuestion[]` — lấy `min(count, pool.length)` câu không lặp; `orderDependent` giữ `optionOrder` gốc, còn lại xáo.
  - `gradeQuestion(correct: readonly string[], selected: readonly string[]): boolean` — so sánh tập, bỏ qua thứ tự, selected rỗng là sai.
  - `passes(correctCount: number, total: number): boolean` — `total > 0 && correctCount * 100 >= 80 * total`.

- [ ] **Step 1: Write the failing tests:** `passes(8,10)` true, `passes(7,10)` false, `passes(0,0)` false, `passes(24,30)` true; `gradeQuestion(['C','D'], ['D','C'])` true, `(['C','D'], ['C'])` false, `(['A'], [])` false; `planAttempt` với pool 4 câu và count 10 trả 4 câu không trùng (Review Focus 5); với pool rỗng trả `[]`; cùng seed cùng kết quả, khác seed khác thứ tự; câu `orderDependent` có `optionOrder` bằng thứ tự gốc dù seed nào; `practiceCount('capstone') === 30`.
- [ ] **Step 2:** Run → FAIL. **Step 3:** Implement theo chữ ký. **Step 4:** Run toàn suite → PASS.
- [ ] **Step 5:** Commit `feat(practice): add question planning, shuffle and grading`.

## Task 6: Đồng hồ lượt làm bài

**Files:**
- Create: `src/features/practice/logic/attempt-clock.ts` + test, `src/persistence/records.ts` (chỉ chứa `ClockState` ở task này; Task 7 và 8 thêm các kiểu còn lại)

**Interfaces:**
- Produces:
  - `interface ClockState` (khai báo trong `src/persistence/records.ts`, `attempt-clock.ts` import type và re-export) `{ mode: 'freeze' | 'run'; limitMs: number | null; remainingMs: number | null; deadlineAt: number | null }`
  - `startClock(limitMs: number | null, mode: 'freeze' | 'run', now: number): ClockState` — `deadlineAt = now + limitMs` khi `run`.
  - `advanceFreeze(state: ClockState, elapsedMs: number): ClockState` — chỉ trừ `remainingMs` khi `mode === 'freeze'` (không âm).
  - `remainingAt(state: ClockState, now: number): number | null` — `null` nếu không giới hạn; `run`: `max(0, deadlineAt - now)`; `freeze`: `remainingMs`.
  - `isExpired(state: ClockState, now: number): boolean`.
  - `resolveOnResume(state: ClockState, now: number, savedAt: number): { state: ClockState; autoSubmit: boolean }` — `run` quá hạn → `autoSubmit: true`; đồng hồ máy lùi (`now < savedAt`) với `run` giữ `deadlineAt` nhưng kẹp `remaining` ≤ `limitMs`; `freeze` luôn `autoSubmit` chỉ khi `remainingMs === 0`.

- [ ] **Step 1: Write the failing tests** (Review Focus 2): `startClock(null,'freeze',0)` → `remainingAt` là `null`; freeze 60_000 trừ 10_000 còn 50_000, không trừ quá 0; `run` đặt hạn 5 phút, `remainingAt(now+299_000)` = 1000; `resolveOnResume` với `run`, `now > deadlineAt` → `autoSubmit: true`; `now < savedAt` không ném lỗi và `remainingAt` ≤ `limitMs`; freeze còn 40_000 khi mở lại → `autoSubmit: false`, vẫn 40_000.
- [ ] **Step 2:** Run → FAIL. **Step 3:** Implement. **Step 4:** Run → PASS.
- [ ] **Step 5:** Commit `feat(practice): add freeze and run attempt clock`.

## Task 7: Persistence: SqlExecutor, migration, repositories

**Files:**
- Create: `src/persistence/records.ts` (thêm `AttemptRow`, `AttemptQuestionRow`, `QuestionStat`), `src-tauri/migrations/0001_init.sql`, `src-tauri/src/lib.rs` (đăng ký plugin + migration), `src/persistence/{sql-executor,tauri-executor}.ts`, `src/persistence/repositories/{lesson-progress,attempts,question-stats,settings}.ts` + tests, `src/testing/node-sqlite-executor.ts`
- Test: `npm test src/persistence` (môi trường `node`, dùng `node:sqlite`)

**Interfaces:**
- Produces:
  - `interface SqlExecutor { execute(sql: string, params?: unknown[]): Promise<void>; select<T>(sql: string, params?: unknown[]): Promise<T[]> }` (không có `transaction`, xem Ruling ở Task 8).
  - `createNodeSqliteExecutor(): Promise<SqlExecutor>` — mở `:memory:`, chạy mọi file `src-tauri/migrations/*.sql` theo tên.
  - Bảng đúng như spec mục 5 (`lesson_progress, attempts, attempt_questions, question_stats, settings`), thêm `settings` key `review_prompt_last_shown_date`.
  - `interface AttemptRow { id: string; kind: 'practice' | 'review'; topicId: string | null; status: 'in_progress' | 'submitted'; startedAt: number; submittedAt: number | null; submitReason: 'manual' | 'timeout' | null; reviewAllowed: boolean; clock: ClockState; heartbeatAt: number | null; scorePct: number | null; passed: boolean | null }`
  - `interface AttemptQuestionRow { attemptId: string; position: number; questionId: string; optionOrder: string[]; selected: string[]; isCorrect: boolean | null }`
  - Repos (hàm trả `Promise`): `lessonProgress.markRead(lessonId, at)`, `.readIds(): Set<string>`; `attempts.create(row, questions)`, `.saveAnswer(attemptId, position, selected)`, `.saveClock(attemptId, clock, heartbeatAt)`, `.markSubmitted(attemptId, {scorePct, passed, reason, at, grades})`, `.findInProgress(): {attempt, questions} | null`, `.discard(attemptId)` (xóa cả `attempt_questions`), `.listSubmitted(): AttemptRow[]`, `.questionsOf(attemptId)`; `questionStats.get(id)`, `.upsert(stat)`, `.listAll()`; `settings.get(key)`, `.set(key, value)`.
  - `interface QuestionStat { questionId: string; topicId: string | null; box: number; dueAt: number; timesSeen: number; timesCorrect: number; lastSeenAt: number; lastCorrect: boolean }`

- [ ] **Step 1: Write the failing tests:** migration chạy hai lần không lỗi (`CREATE TABLE IF NOT EXISTS`); `attempts.create` rồi `findInProgress` khôi phục **y nguyên** `optionOrder`, `selected`, `clock`; `saveAnswer` ghi đè đáp án; `discard` xóa lượt và mọi `attempt_questions` của nó; `listSubmitted` không trả lượt `in_progress`; `settings.set/get` round-trip; `markRead` hai lần không lỗi.
- [ ] **Step 2:** Run → FAIL. **Step 3:** Implement; `tauri-executor.ts` bọc `Database.load('sqlite:mindmap.db')` (`execute`/`select`). `lib.rs` nạp migration bằng `include_str!("../migrations/0001_init.sql")`, `Builder::default().add_migrations("sqlite:mindmap.db", ...)`.
- [ ] **Step 4:** Run → PASS; `cargo check` → thành công.
- [ ] **Step 5:** Commit `feat(persistence): add sqlite schema, executor and repositories`.

## Task 8: Cập nhật `question_stats` và khớp lại sau crash

**Files:**
- Create: `src/features/review/logic/scheduler.ts` + test, `src/features/review/stats-rebuild.ts` + test (xuất qua `src/features/review/index.ts`: `rebuildStatsFor`, `reconcileStats`, `LeitnerScheduler`)

**Ruling (quyết định thiết kế, thay cho giao dịch SQL):** Tauri SQL plugin dùng connection pool nên `BEGIN/COMMIT` qua nhiều lời gọi không đáng tin. Vì vậy `question_stats` được coi là **bộ nhớ đệm có thể dựng lại từ lịch sử** các lượt `submitted`. Nộp bài = (1) ghi chấm từng câu, (2) đánh dấu `submitted`, (3) `rebuildStatsFor(questionIds)`. Mở app luôn chạy `reconcileStats()`. Cập nhật đôi là không thể vì stat luôn được tính lại từ đầu.

**Interfaces:**
- Produces:
  - `interface ReviewScheduler { next(prev: QuestionStat | null, correct: boolean, now: number, ref: { questionId: string; topicId: string | null }): QuestionStat }`
  - `class LeitnerScheduler implements ReviewScheduler` — `INTERVAL_DAYS = [1, 3, 7, 14, 30, 60]`; `prev === null` bắt đầu từ hộp 0; đúng: `box = min(box + 1, 5)`, sai: `box = 0`; `dueAt = now + INTERVAL_DAYS[box] * 86_400_000`.
  - `rebuildStatsFor(deps: { executor: SqlExecutor; scheduler: ReviewScheduler }, questionIds: string[]): Promise<void>` — với mỗi câu: lấy mọi lần xuất hiện trong lượt `submitted` (cả `practice` lẫn `review`) theo `submitted_at` tăng dần, replay qua `scheduler.next`, `upsert`.
  - `reconcileStats(deps): Promise<void>` — dựng lại cho mọi câu xuất hiện trong lượt đã nộp.

- [ ] **Step 1: Write the failing tests:** Leitner: câu mới đúng → hộp 1, `dueAt = now + 3 ngày`; hộp 5 đúng giữ hộp 5; đúng ở hộp 3 rồi sai → hộp 0, `dueAt = now + 1 ngày`. Rebuild (Review Focus 3): tạo lượt `submitted` nhưng **không** gọi cập nhật stat (mô phỏng crash), chạy `reconcileStats` → stat đúng; chạy lần hai → kết quả y hệt (idempotent, `timesSeen` không tăng đôi).
- [ ] **Step 2:** Run → FAIL. **Step 3:** Implement. **Step 4:** Run toàn suite → PASS.
- [ ] **Step 5:** Commit `feat(review): add leitner scheduler and idempotent stats rebuild`.

## Task 9: Trạng thái chủ đề và mở khóa

**Files:**
- Create: `src/features/mindmap/logic/topic-status.ts` + test

**Interfaces:**
- Consumes: `Topic`, `Lesson` (Task 4); `passes` (Task 5); `AttemptRow`
- Produces:
  - `type TopicStatus = 'done' | 'current' | 'locked'`
  - `completedTopicIds(attempts: AttemptRow[]): Set<string>` — chủ đề có ≥ 1 lượt `practice`, `submitted`, `passed === true`.
  - `topicStatuses(topics: Topic[], completed: Set<string>): Map<string, TopicStatus>` — `done` nếu đã hoàn thành; `current` là chủ đề đầu tiên chưa hoàn thành mà mọi chủ đề trước đã hoàn thành; còn lại `locked` (chủ đề sau `current` luôn `locked`, kể cả khi chính nó từng hoàn thành thì vẫn `done`).
  - `practiceUnlocked(lessons: Lesson[], readIds: Set<string>): boolean` — mọi bài `required` đã đọc.
  - `currentLesson(lessons: Lesson[], readIds: Set<string>): Lesson | null` — bài bắt buộc đầu tiên chưa đọc.
  - Gợi ý chủ đề khóa không có hàm riêng: UI dùng khóa i18n `mindmap.lockedHint` với tham số tên chủ đề trước.

- [ ] **Step 1: Write the failing tests:** không lượt nào → chủ đề 1 `current`, còn lại `locked`; lượt practice 80/100 passed ở chủ đề 1 → 1 `done`, 2 `current`; lượt `review` đạt 100% không làm `done`; lượt `in_progress` hoặc `passed: false` không làm `done`; chủ đề 2 `done` nhưng 1 chưa (dữ liệu bất thường) → 1 `current`, 2 vẫn `done`; `practiceUnlocked` false khi còn bài bắt buộc, true khi chỉ còn bài không bắt buộc (video).
- [ ] **Step 2:** Run → FAIL. **Step 3:** Implement. **Step 4:** Run → PASS.
- [ ] **Step 5:** Commit `feat(mindmap): add topic status and unlock rules`.

## Task 10: Tóm tắt ôn tập, kế hoạch lô, cổng modal

**Files:**
- Create: `src/features/review/logic/{review-summary,build-review-plan,prompt-gate}.ts` + tests

**Interfaces:**
- Consumes: `QuestionStat`, `Catalog`, `makeRng`, `shuffle`
- Produces:
  - `type Urgency = 'urgent' | 'soon'`
  - `interface TopicReviewSummary { topicId: string; dueCount: number; daysOverdue: number; urgency: Urgency }`
  - `reviewSummaries(stats: QuestionStat[], completed: Set<string>, now: number): TopicReviewSummary[]` — chỉ chủ đề trong `completed` và câu có `topicId` khác `null`; sắp theo `daysOverdue` giảm dần; `urgent` khi `daysOverdue >= 3` (hằng số my call).
  - `type ReviewMode = { kind: 'full' } | { kind: 'quick' } | { kind: 'custom'; topicIds: string[] }`
  - `interface ReviewPlan { batches: string[][]; total: number }` (mỗi phần tử là `questionId`)
  - `buildReviewPlan(input: { stats: QuestionStat[]; completed: Set<string>; mode: ReviewMode; now: number; rng: () => number }): ReviewPlan` — `full`: mọi chủ đề có câu đến hạn, mỗi chủ đề ≥ 2 câu (lấy câu đến hạn trước, thiếu thì lấy câu của chủ đề đó sắp đến hạn); `quick`: tổng ~15 câu từ chủ đề quên nhiều nhất; `custom`: chỉ các `topicIds`; tổng < 8 thì bổ sung câu chưa đến hạn từ cùng các chủ đề (lấy hết nếu không đủ); ưu tiên câu `lastCorrect === false` rồi câu `lastSeenAt` cũ; cắt thành lô 15.
  - `shouldShowDailyPrompt(input: { summaries: TopicReviewSummary[]; lastShownDate: string | null; today: string }): boolean` — `today` dạng `YYYY-MM-DD` theo giờ máy; false khi `summaries` rỗng hoặc `lastShownDate === today`.
  - `localDateString(now: number): string`.

- [ ] **Step 1: Write the failing tests** (Review Focus 4): không câu đến hạn → `reviewSummaries` rỗng và `shouldShowDailyPrompt` false; chủ đề chưa `completed` không xuất hiện dù có stat; 40 câu đến hạn trải 3 chủ đề → 3 lô (15, 15, 10) và mỗi chủ đề ≥ 2 câu; chỉ 3 câu đến hạn → plan có ≥ 8 câu (bổ sung) hoặc đúng số câu có nếu kho ít hơn; `quick` tổng ≤ 15; `custom` không chứa chủ đề ngoài danh sách; `shouldShowDailyPrompt` false khi `lastShownDate === today`, true ngày hôm sau; câu `topicId: null` không tạo summary.
- [ ] **Step 2:** Run → FAIL. **Step 3:** Implement. **Step 4:** Run → PASS.
- [ ] **Step 5:** Commit `feat(review): add review summaries, batch planning and prompt gate`.

## Task 11: Thống kê lịch sử

**Files:**
- Create: `src/features/history/logic/history-stats.ts` + test

**Interfaces:**
- Produces:
  - `scoreSeries(attempts: AttemptRow[]): { attemptId: string; at: number; scorePct: number; kind: 'practice' | 'review'; topicId: string | null }[]` — chỉ lượt đã nộp, theo thời gian.
  - `weakTopics(attempts: AttemptRow[], limit: number): { topicId: string; avgPct: number }[]` — trung bình điểm các lượt practice, thấp nhất trước.
  - `mostMissed(rows: { questionId: string; isCorrect: boolean }[], limit: number): { questionId: string; misses: number; seen: number }[]`.

- [ ] **Step 1: Write the failing tests:** chuỗi 3 lượt cho thứ tự thời gian đúng; lượt `in_progress` bị bỏ; `weakTopics` xếp thấp nhất trước và tôn trọng `limit`; `mostMissed` đếm đúng và bỏ câu `misses === 0`.
- [ ] **Step 2:** Run → FAIL. **Step 3:** Implement. **Step 4:** Run → PASS.
- [ ] **Step 5:** Commit `feat(history): add score series and weak-topic stats`.

## Task 12: i18n, design tokens, thành phần nền

**Files:**
- Create: `src/i18n/{i18n.svelte.ts,en.json,vi.json}`, `src/ui/{tokens.css,Button.svelte,Modal.svelte,Badge.svelte,ProgressBar.svelte}` + test cho i18n và Modal
- Test: `npm test src/i18n src/ui`

**Interfaces:**
- Produces:
  - `class I18n { locale: 'en' | 'vi' (state); t(key: string, params?: Record<string, string | number>): string; setLocale(l): void }` và `createI18n(initial)`; thiếu khóa trả chính khóa (không ném).
  - `tokens.css` dùng `@import "tailwindcss"` và `@theme` định nghĩa: `--color-leaf-done` (xanh lá), `--color-leaf-next` (xanh dương) + `--color-leaf-next-hover` (đậm hơn), `--color-leaf-locked` (bạc), `--color-water`, nền/chữ/viền; quy tắc `@media (prefers-reduced-motion: reduce)` tắt animation.
  - `Button` (`variant: 'primary' | 'secondary' | 'ghost'`, map `Record` + `cn`), `Modal` (`open`, `title`, `onclose`, focus được giữ, `Esc` đóng, `role="dialog" aria-modal`), `Badge` (`tone: 'done' | 'next' | 'locked' | 'review'`), `ProgressBar`.
  - Test kiểm tra: `en.json` và `vi.json` có **cùng tập khóa**.

- [ ] **Step 1: Write the failing tests:** `t('x', {n: 3})` thay tham số; khóa thiếu trả khóa; đổi locale cập nhật; hai file locale cùng tập khóa; `Modal` render `role="dialog"` khi `open` và gọi `onclose` khi nhấn `Escape`.
- [ ] **Step 2:** Run → FAIL. **Step 3:** Implement (Svelte 5 runes, `$props`, snippet cho nội dung; style bằng Tailwind utilities, CSS riêng chỉ cho keyframe). **Step 4:** Run → PASS.
- [ ] **Step 5:** Commit `feat(ui): add i18n, design tokens and base components`.

## Task 13: Composition root và trạng thái ứng dụng

**Files:**
- Create: `src/app/{composition.ts,app-state.svelte.ts,App.svelte}`; Modify: `src/main.ts`
- Test: `src/app/app-state.test.ts`

**Interfaces:**
- Consumes: mọi repo (Task 7), `loadBundledCatalog` (Task 4), `LeitnerScheduler`, `reconcileStats` (Task 8), `topicStatuses`/`completedTopicIds` (Task 9), `reviewSummaries`/`shouldShowDailyPrompt` (Task 10)
- Produces:
  - `interface Services { catalog: Catalog; executor: SqlExecutor; scheduler: ReviewScheduler; repos: {...Task 7}; now(): number }`
  - `createServices(): Promise<Services>` (Tauri) và trong test dùng `createNodeSqliteExecutor`.
  - `class AppState { view: 'tree' | 'lesson' | 'practice' | 'review' | 'history' | 'settings'; statuses; readIds; summaries; dailyPromptVisible: boolean; load(): Promise<void>; refresh(): Promise<void>; open(view, params?): void }` — `load()` chạy `reconcileStats` rồi nạp tiến trình và tính `dailyPromptVisible` bằng `shouldShowDailyPrompt`.

- [ ] **Step 1: Write the failing test:** với services giả (executor node, fixture catalog): `load()` khi DB rỗng → chủ đề 1 `current`, `dailyPromptVisible` false; sau khi tạo lượt practice passed cho chủ đề 1 và stat đến hạn rồi `refresh()` → chủ đề 2 `current` và `dailyPromptVisible` true; lượt `in_progress` tồn tại → `AppState.resumeAttempt` khác `null`.
- [ ] **Step 2:** Run → FAIL. **Step 3:** Implement; `App.svelte` chỉ là shell chuyển view, mọi thứ nhận qua context (`createContext`). **Step 4:** Run → PASS; `npm run build` → thành công.
- [ ] **Step 5:** Commit `feat(app): add composition root and app state`.

## Task 14: Cây kiến thức, dòng nước, bài học

**Files:**
- Create: `src/features/mindmap/logic/{tree-layout,water-path}.ts` + tests, `src/features/mindmap/ui/{TreeCanvas,TopicBranch,LeafNode,TrunkWater}.svelte`, `src/features/lesson/ui/{LessonPanel.svelte,markdown.ts}` + test
- Consumes: Task 9, Task 12, Task 13

**Interfaces:**
- Produces:
  - `layoutTree(topics: Topic[], opts: { expandedTopicId: string | null; lessonCounts: Record<string, number> }): TreeLayout` với `TreeLayout { trunk: { x: number; y1: number; y2: number }; tierMarks: { tier: Tier; y: number }[]; branches: { topicId: string; side: 'left' | 'right'; y: number; leaves: { lessonId: string | 'practice'; x: number; y: number; side: 'above' | 'below' }[] }[]; height: number }` — cành xen kẽ trái/phải theo `order`; chỉ `expandedTopicId` có `leaves`, lá so le trên/dưới (xương cá), `practice` là lá cuối.
  - `waterPath(layout: TreeLayout, progress: { currentTopicId: string | null; readLessonIds: Set<string>; lessonsOf(id): Lesson[]; practiceUnlocked: boolean; completedTopicIds: Set<string> }): { segments: { x1: number; y1: number; x2: number; y2: number }[]; stopAt: { x: number; y: number } | null }` — nước tới bài bắt buộc chưa đọc đầu tiên; hết bài bắt buộc thì dừng ở lá `practice`; chủ đề hiện tại đã hoàn thành thì chảy về thân xuống chủ đề kế.
  - `renderLessonBody(markdown: string): string` (bằng `marked`, đồng bộ, nội dung bundle tin cậy).
  - Hành vi UI: bấm chủ đề `current`/`done` mở hoặc thu gọn; chủ đề `locked` hiện gợi ý bằng `title` + `aria-label` ("Cần đạt trên 80% ở … để mở"); `LessonPanel` có "Đánh dấu hoàn thành" gọi `lessonProgress.markRead` rồi `appState.refresh()`; nút Thực hành bị `disabled` khi `practiceUnlocked` false hoặc kho câu rỗng (hiện thông báo "chưa có câu hỏi", Review Focus 5); lá video không bắt buộc có ký hiệu ▶ và dùng `https://www.youtube.com/results?search_query=` + `videoQuery`.

- [ ] **Step 1: Write the failing tests:** `layoutTree` đặt chủ đề 1 bên trái, 2 bên phải, 3 bên trái; chỉ chủ đề được mở có `leaves` và lá cuối là `practice`; lá luân phiên `above`/`below`; `waterPath` với 0 bài đã đọc dừng ở bài 1, đọc hết bài bắt buộc dừng ở `practice`, chủ đề hoàn thành thì `stopAt` nằm ở chủ đề kế; test component (`@testing-library/svelte`): `LeafNode` locked có `aria-label` và biểu tượng 🔒, nút Thực hành `disabled` khi còn bài chưa đọc; `LessonPanel` nhấn "Đánh dấu hoàn thành" gọi callback đúng `lessonId`.
- [ ] **Step 2:** Run → FAIL. **Step 3:** Implement (SVG, tọa độ chỉ từ `layoutTree`; nước dùng animation CSS `stroke-dashoffset` và tắt khi giảm chuyển động; điều khiển bàn phím cho mọi nút). **Step 4:** Run → PASS.
- [ ] **Step 5:** Mở `npm run tauri dev`, kiểm bằng mắt cây với 13 chủ đề và nước đúng bài; chụp màn hình để so với mockup. Ghi kết quả vào báo cáo task.
- [ ] **Step 6:** Commit `feat(mindmap): add tree canvas, water progress and lesson panel`.

## Task 15: Thực hành: thiết lập, làm bài, kết quả, khôi phục

**Files:**
- Create: `src/features/practice/session.svelte.ts` + test, `src/features/practice/ui/{PracticeSetup,PracticeSession,PracticeResult,ResumePrompt}.svelte` + test

**Interfaces:**
- Consumes: Task 5, 6, 7, 8
- Produces:
  - `interface PracticeOptions { allowReview: boolean; limitMs: number | null; clockMode: 'freeze' | 'run' }`; mặc định `{ allowReview: false, limitMs: null, clockMode: 'freeze' }`, các lựa chọn gần nhất lưu qua `settings` (key `practice_last_options`).
  - `class PracticeSession` (runes): `static start(services, topicId, options): Promise<PracticeSession>` (bốc + xáo một lần, `attempts.create`); `static resume(services, found): PracticeSession` (dùng `resolveOnResume`); trạng thái `index`, `selected` theo câu, `remainingMs`; `select(position, keys)` ghi ngay vào DB (`saveAnswer`); `tick(elapsedMs)` ghi `saveClock` mỗi ~5 giây; `openKnowledge()` chỉ khi `allowReview`; `submit(reason: 'manual' | 'timeout'): Promise<SubmitResult>`; `exit(): Promise<void>` (gọi `attempts.discard`).
  - `submit` thứ tự: chấm từng câu → `attempts.markSubmitted` → `rebuildStatsFor(questionIds)` → `appState.refresh()`.
  - `interface SubmitResult { scorePct: number; correct: number; total: number; passed: boolean; items: { questionId: string; selected: string[]; correct: string[]; isCorrect: boolean; explanation?: string }[] }`.
  - `ResumePrompt`: "Bạn có bài đang làm dở. Tiếp tục không?" với Tiếp tục / Bỏ (bỏ = `discard`, bắt đầu lượt mới sẽ bốc lại).

- [ ] **Step 1: Write the failing tests:** bắt đầu lượt lưu đúng số câu và `optionOrder` vào DB; `resume` sau khi "crash" (tạo session mới từ `findInProgress`) có cùng thứ tự câu, thứ tự đáp án và đáp án đã chọn; `select` ghi vào DB ngay; `submit('manual')` với 8/10 đúng → `passed: true`, lượt `submitted`, `question_stats` có hộp tương ứng; `tick` vượt `remaining` ở freeze → tự `submit('timeout')` chỉ một lần; `exit()` làm `findInProgress()` trả `null` và không để lại `attempt_questions`; `openKnowledge()` ném lỗi/không làm gì khi `allowReview` false và đồng hồ vẫn chạy khi mở; test component: `PracticeSetup` hiển thị 3 cặp lựa chọn, ẩn lựa chọn chế độ đồng hồ khi chọn "Không set giờ"; nút Thoát cần xác nhận.
- [ ] **Step 2:** Run → FAIL. **Step 3:** Implement; đồng hồ UI dùng một `setInterval` trong `PracticeSession.svelte` gọi `session.tick`; câu nhiều đáp án hiện checkbox, một đáp án hiện radio, hiển thị "Choose two" theo `multi`. **Step 4:** Run toàn suite → PASS.
- [ ] **Step 5:** Kiểm tay trong `tauri dev`: đặt giờ 1 phút ở chế độ `run`, đóng app, mở lại sau 2 phút → tự nộp (Review Focus 2); đóng app giữa lượt → hỏi tiếp tục.
- [ ] **Step 6:** Commit `feat(practice): add practice setup, session, result and resume`.

## Task 16: Ôn tập ngắt quãng (modal, phiên ôn, huy hiệu)

**Files:**
- Create: `src/features/review/ui/{DailyReviewModal,ReviewSession,ReviewButton}.svelte` + test; Modify: `src/features/mindmap/ui/TopicBranch.svelte` (huy hiệu), `src/app/app-state.svelte.ts` (hành động review)
- Consumes: Task 10, 15

**Interfaces:**
- Produces:
  - `DailyReviewModal` props: `summaries`, `onstart(mode: ReviewMode)`, `onlater()`, `ondismissToday()`; mọi nút đều ghi `review_prompt_last_shown_date = today` ngay khi modal hiện lần đầu trong ngày; gọn danh sách sau ~5 dòng với "+ K chủ đề khác"; ba lựa chọn độ dài Đầy đủ (mặc định) / Nhanh / Tùy chọn (tick chủ đề).
  - `ReviewSession`: dùng lại `PracticeSession` cho từng lô (`kind: 'review'`, `topicId: null`, không đồng hồ, `allowReview: true`); cuối lô hiện kết quả lô cùng "Ôn tiếp lô sau (còn N câu)" / "Dừng ở đây".
  - `ReviewButton`: "Ôn tập (N)" cố định ở màn chính; ẩn khi `summaries` rỗng; "Đừng hỏi hôm nay" chỉ ẩn nút trong ngày hiện tại.
  - Huy hiệu "cần ôn" (kèm số ngày) trên chủ đề `done` có câu đến hạn, không đổi màu xanh lá.

- [ ] **Step 1: Write the failing tests:** modal không render khi `dailyPromptVisible` false; modal hiện chỉ một lần trong ngày sau khi bấm "Để sau" và mở lại app cùng ngày; ba nút đều chặn lần hiện thứ hai; "Để sau" để lại `ReviewButton`; "Dừng ở đây" sau lô 1 không làm mất cập nhật stat của lô 1 (stat đã có trước khi dừng); huy hiệu xuất hiện trên chủ đề `done` có stat đến hạn và không xuất hiện trên chủ đề chưa hoàn thành; làm lại chủ đề cũ với điểm thấp không đổi `topicStatuses` thành khác `done` (Global Constraints).
- [ ] **Step 2:** Run → FAIL. **Step 3:** Implement. **Step 4:** Run toàn suite → PASS.
- [ ] **Step 5:** Commit `feat(review): add daily review modal, batched review session and badges`.

## Task 17: Lịch sử, cài đặt, menu chủ đề

**Files:**
- Create: `src/features/history/ui/{HistoryScreen,ScoreChart,AttemptDetail}.svelte`, `src/features/settings/ui/SettingsScreen.svelte` + test; Modify: `TopicBranch.svelte` (menu: Làm lại bài thực hành / Xem lại bài học / Lịch sử)

**Interfaces:**
- Consumes: Task 11, 12, 13
- Produces: `ScoreChart` vẽ SVG điểm theo lượt với đường ngưỡng 80% (có `aria-label` mô tả); `HistoryScreen` hiện bảng lượt (ngày, điểm, chế độ), chủ đề cần chú ý, câu hay sai nhất; `AttemptDetail` liệt kê từng câu đúng/sai; `SettingsScreen` đổi ngôn ngữ và lưu vào `settings` key `locale`.

- [ ] **Step 1: Write the failing tests:** `ScoreChart` render một điểm cho mỗi lượt đã nộp và một đường ở 80%; chọn ngôn ngữ `vi` cập nhật chuỗi giao diện và lưu `locale`; mở lại app đọc `locale` đã lưu; `AttemptDetail` đánh dấu đúng/sai theo `isCorrect`.
- [ ] **Step 2:** Run → FAIL. **Step 3:** Implement. **Step 4:** Run toàn suite → PASS.
- [ ] **Step 5:** Commit `feat(history): add history, settings and topic menu`.

## Task 18: Nội dung chủ đề 1 và 2 (và khuôn cho các đợt sau)

**Files:**
- Create: `content/topics.json` (đủ 13 chủ đề), `content/lessons/cloud-concepts/*.{en,vi}.md`, `content/lessons/global-infrastructure/*.{en,vi}.md`, `content/questions/authored/{cloud-concepts,global-infrastructure}.json`; Modify: bật lại test `loadBundledCatalog` (Task 4)

**Interfaces:**
- Consumes: kiểu `Lesson`/`Question` (Task 4); exam guide CLF-C02 v1.0 (Domain 1 Cloud Concepts, Domain 3 hạ tầng toàn cầu) và tài liệu AWS chính thức làm nguồn, ghi nguồn cuối mỗi bài.
- Produces: mỗi chủ đề 3 đến 6 bài (có ≥ 1 bài `required`, tùy chọn có `videoQuery`), 5 đến 10 câu tự soạn tiếng Anh **có `explanation`**; `topics.json` khai báo `lessonIds` rỗng cho chủ đề 3 đến 13. Đây là khuôn cho các plan nội dung đợt sau.

- [ ] **Step 1: Write the failing test:** `loadBundledCatalog()` nạp được thư mục thật; chủ đề 1 và 2 mỗi chủ đề có ≥ 3 bài, mỗi bài có cả `en` và `vi` không rỗng, ≥ 5 câu `authored` mỗi chủ đề và mọi câu `authored` có `explanation`; tổng chủ đề = 13.
- [ ] **Step 2:** Run → FAIL. **Step 3:** Viết nội dung (bài học song ngữ cô đọng; không sao chép nguyên văn tài liệu AWS), chạy lại `npx tsx scripts/import-cards/build.ts` nếu luật chủ đề đổi. **Step 4:** Run toàn suite → PASS; báo người dùng đường dẫn các bài tiếng Việt để đọc thử (không chặn).
- [ ] **Step 5:** Commit `feat(content): add lessons and authored questions for topics 1 and 2`.

## Task 19: Đóng gói macOS, CI Windows/Linux, kiểm chứng cuối

**Files:**
- Create: `.github/workflows/mindmap-build.yml` (gốc repo), `easy_mindmap_knowledge/README.md` (cách chạy, build, chạy test); Modify: `src-tauri/tauri.conf.json` (tên app, bundle)

- [ ] **Step 1:** Workflow CI matrix `windows-latest`, `ubuntu-latest`, `macos-latest` chạy `npm ci`, `npm test`, `npx tauri build`; ghi chú đầu file "chưa chạy/chưa kiểm chứng ở Windows và Linux".
- [ ] **Step 2: Verification (không đoán):** chạy `npm test` (toàn suite xanh, in số test), `npm run build`, `cargo check`, rồi `PATH=/opt/homebrew/opt/rustup/bin:$PATH npx tauri build` ra `.app` không ký; mở `.app` và đi qua checklist: mở app → đọc hết bài bắt buộc chủ đề 1 → làm Thực hành với giờ → nộp ≥ 80% → chủ đề 2 mở và nước chảy xuống; đóng đột ngột giữa lượt → tiếp tục đúng; huy hiệu "cần ôn" và modal ôn hiện sau khi chỉnh `due_at` trong DB; đổi sang VI; chủ đề 3 bấm Thực hành báo chưa có câu hỏi.
- [ ] **Step 3:** Commit `chore(app): add macos build, ci workflow and readme`.

---

## Self-Review (đã chạy)

- **Spec coverage:** 4.1 cây + nước → Task 14; 4.2 bài học → 14; 4.3 thực hành, clock, crash → 5, 6, 15; 4.4 mở khóa → 9, 16; 4.5 ôn tập → 10, 16; 4.6 lịch sử → 11, 17; mục 5 dữ liệu và 5.1 quy tắc → 7, 8, 10; mục 6 nội dung → 2, 3, 18 (13 chủ đề khai báo đủ, nội dung 3 đến 13 theo đợt sau đã ghi rõ ở phạm vi); mục 7 công nghệ → 1, 7; mục 8 i18n/truy cập → 12, 14; mục 9 đa nền tảng → 19. Spec 5 ghi "cập nhật `question_stats` khi nộp": thực hiện bằng rebuild idempotent (Ruling ở Task 8), cùng kết quả quan sát.
- **Nhất quán kiểu:** `Question`, `Topic`, `Lesson`, `Catalog` (Task 4); `QuestionStat`, `AttemptRow` (Task 7); `ReviewScheduler` (Task 8); `ClockState` (Task 6) dùng đúng tên ở các task sau. Task 3 dùng `Question` của Task 4 nên thứ tự thực hiện thực tế là 1, 2, 4, 3, 5…; đã ghi ở Task 3.
- **Hằng số "my call" mới do plan thêm:** ngưỡng `urgent` = `daysOverdue >= 3`; khóa settings `practice_last_options`, `locale`. Cần người dùng biết khi duyệt.
