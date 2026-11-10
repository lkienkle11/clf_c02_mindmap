# Report feature design (in-app reports with screenshots)

Date: 2026-11-10. Status: DRAFT, awaiting user approval. Nothing is built.

Legend: **[User]** = decided by the user. **[Call]** = the agent's decision, open to veto. **[Guess]** = unverified assumption.

## 1. Intent and why

The question bank (668 imported questions) contains wrong or debatable answers. Today the user reports these by chatting, one at a time. The user wants a **Report** feature inside the app so that each report is a stored record (text + screenshot + references) that the user, or an AI agent, can later read and fix without a chat. [User]

Release this feature **before** manually verifying and cleaning the question bank. [User]

Success: the user can report a question, a lesson or a system bug in a few clicks; an AI agent can read all new reports from disk and has enough context (text, screenshot, exact question/lesson/attempt references) to fix content or code; fixed reports are marked so they are not fixed twice.

## 2. Goals / non-goals / anti-goals

Goals
- Three report types with one shared Dialog. [User]
- Reports stored in the local SQLite database; screenshots stored as files. [User chose local DB + export]
- An export that writes reports to a folder an agent can read. [User]
- Report status: `new` / `handled`. [User]

Non-goals
- No server, no network, no third-party service. [User chose local]
- No editing or reply thread on a report. [Call]
- No automatic fixing inside the app. The agent works from the export. [Call]

Anti-goals
- Opening the report Dialog must never be a way to freeze the exam timer and cheat (see 6). [User]
- Do not copy question or lesson content into the report; store ids. [User]
- Do not change the meaning of the existing "tab hidden" time option. [User]

## 3. The three report types and where the button appears

Button style: pale yellow, but prominent and easy to see. [User] Label: "Báo cáo" / "Report" (i18n, vi + en). [Call]

**Type 1: question report.** Button on each question frame at:
1. Practice/exam result screen (`PracticeResult`, per-question view). [User]
2. History, "view past attempt" modal (`AttemptDetail`). [User]
3. During an attempt: left of the "Thoát" button at the bottom (`PracticeSessionView`). [User]
4. "Câu hỏi sai nhiều nhất" dialog (`MissedQuestionsDialog`), per question. [User]
5. Review (ôn tập) session: left of "Thoát". [User]
It appears for every question state: correct, wrong, unanswered. [User]

**Type 2: knowledge/lesson report.** Button at:
1. Lesson screen, above "Bài kế tiếp". [User]
2. "Xem lại kiến thức" modal during practice/exam, next to "Quay lại câu hỏi" (`KnowledgeOverlay`). [User]
3. The same modal during review. [User]

**Type 3: system report.** Button below the Language section in Settings. [User]

Component locations are the agent's reading of the code and need confirming in the plan. [Guess]

## 4. The Dialog

Shared shell for all three types. [User]
- Title depends on type (see below).
- Footer, fixed: "Nộp báo cáo" and "Đóng". [User]
- Close, or click outside the Dialog, opens a second confirmation dialog: "Bạn có chắc chắn muốn đóng báo cáo không?". [User]
- Body part 1: rich text input with a type-specific placeholder, max 1500 characters. [User]
- Body part 2: screenshot (type-specific).

| Type | Title | Placeholder | Screenshot |
|------|-------|-------------|------------|
| 1 | "Báo cáo câu hỏi sai" / "Report wrong question" | "Bạn có góp ý gì đối với câu hỏi này?" | Button captures the visible question frame: question, options, and if already answered also correct/wrong marks and the explanation |
| 2 | "Báo cáo kiến thức sai" / "Report wrong knowledge" | "Bạn có góp ý gì với kiến thức này?" | Button captures the frame of the lesson or knowledge currently open |
| 3 | "Báo cáo hệ thống" / "Report system issue" | "Hệ thống đang có bug gì?" | Upload up to 3 images (no capture button) |

Screenshot behaviour for type 1 and 2: pressing the capture button renders the target frame to an image **without the Dialog in it**, shows a small preview, and allows delete and re-capture. The screenshot is optional; a report can be submitted without it. [User chose "preview + delete/retake"; "optional" is a Call]

Capture technique: render the DOM frame to an image inside the webview. A library choice (e.g. html-to-image vs html2canvas vs a Tauri-side capture) must be verified against Tauri webviews and Tailwind 4 styling. [Guess, research needed in the plan]

Rich text: the exact editor and its sanitising is the builder's call. Stored as sanitised text or restricted markup. The 1500 limit counts visible characters. [Call]

## 5. What is stored

Reference by id, do not copy content. [User]

Common: `id`, `type` (question | lesson | system), `status` (new | handled), `created_at`, `handled_at`, `body` (rich text), `app_version`, `locale`.

Type 1 adds: `question_id` and `source_screen` (required); `attempt_id`, `position`, `option_order`, `selected`, `is_correct` are **nullable** because the missed-questions dialog and some review views have no attempt. The question text and options are **not** copied; the id points at `content/questions`. [User for id-only; nullability is a Call]
Type 2 adds: `lesson_id` and the locale shown. No content copy. [User]
Type 3 adds nothing. [User]

Screenshots: files in the app data directory, the database keeps relative paths. Type 3: up to 3 files. [Call]

Storage: new migration `0005_reports.sql` (never edit shipped migrations). Tables `reports` and `report_images`. [Call; follows existing migration rule]

Caveat to record: content ids reference the current bundled content. If question text changes later, the stored screenshot is the evidence of what the user saw. [Call]

## 6. Timer rule while a report Dialog is open (timed attempts only)

- Existing setting "Khi đổi tab hoặc thu nhỏ cửa sổ" (freeze / run) is **not changed**. [User]
- New option "Khi mở báo cáo lúc đang làm bài" with "Đóng băng thời gian" / "Thời gian tiếp tục trôi". The existing hidden-window option lives in the practice setup screen (chosen per attempt, saved with the attempt), so the new option goes in the same screen, directly under it, and is saved with the attempt in the same way. [User confirmed, corrects the earlier "in Settings" wording] Default: freeze. [Call]
- Exam and checkpoint attempts have no such setup option; they start with "run". [Call]
- Anti-cheat: the clock is frozen only if every active condition allows freezing. If the window is hidden while the report Dialog is open, the old setting applies; if it says "run", the clock runs. [User]
- Untimed attempts: no effect. [Call]

## 7. Export for the agent and status sync

Export writes reports to a folder: one JSON per report (with `status` and `status_updated_at`) plus its PNG files, plus an index. [User chose local + export]

Folder: the user picks it in a folder dialog (remembered), defaulting to a `reports` folder under the app data directory resolved through Tauri's path API. **No OS-specific hardcoded paths**; the app targets macOS, Windows and Linux. [Call, OS-neutral is User]

Status sync. [User requirement: status must reflect reality whether the user clicks in the app, edits a file or the DB, or an agent edits it]
- The DB is the source of truth.
- On opening the Reports tab and on every export, the app reconciles the DB with the exported JSON files: for each report the newer `status_updated_at` wins and is written to the other side. [Call]
- The user can mark `handled` in the app; an agent only needs to set `"status": "handled"` (and bump `status_updated_at`) in the JSON file. Direct DB edits are read live. [Call]

Agent guide: every export also writes a short `README.md` into the export folder explaining how to read a report (JSON fields, screenshot paths, id references to `content/questions` and lessons) and the required step after fixing: set `"status": "handled"` and bump `status_updated_at` in that report's JSON. Fixing content alone does not change status. The status shown in the app updates on the next sync (opening the Reports tab or exporting), not instantly. [User approved adding this]

## 7a. Reports tab (management screen) [User]

New "Báo cáo" / "Reports" tab on the main navigation bar, with a badge of `new` reports. [User chose the tab]
- A summary (counts by type and status).
- Paginated list with filters: type, status, date range, text search. [filters are a Call]
- Detail view: text, screenshot(s), references (question/lesson/attempt), a link to open the referenced item if feasible, and a button to mark handled / reopen. [Call]
- Export button lives here. [Call]

## 8. Constraints

- Stack: Tauri v2, Svelte 5, Tailwind 4, SQLite via `@tauri-apps/plugin-sql`; Tauri capabilities may need file permissions for screenshots and export. [read from code]
- Reuse `src/ui/Modal.svelte` and `Button.svelte`. [Call]
- Feature code goes in a new `src/features/report/` following the existing `features/<name>/{logic,ui}` layout, with persistence in `src/persistence/repositories/`. [Call, per structure-codebase]
- TDD for logic and persistence; UI tests per existing patterns. [project rule]
- All strings in `src/i18n/en.json` and `vi.json`. [Call]

- CSP is `img-src 'self' data:`; showing stored screenshots needs data URIs or an allowed asset path. Builder to resolve. [read from code]
- Tauri needs new plugins/permissions for file writes and a folder dialog. [Call]
- `tauri.conf.json` currently bundles target `app` only; building for all three OSes is outside this feature. [read from code]

## 9. Calls made after the builder check

- First task of the plan is a spike for screenshot capture in the Tauri webview (WKWebView/WebView2/WebKitGTK, Tailwind 4 colors, scrolled frames). If capture fails at runtime the report still submits without an image; fallback is a Tauri-side capture. [Call]
- Rich text is minimal: bold, italic, lists, line breaks; stored as markdown; live counter of 1500. [Call]
- The knowledge overlay and review use the same pause mechanism as the practice session; the plan must verify there is one clock owner. [Call]
- The plan must verify that lesson ids are stable and that the overlay maps to exactly one lesson. [Call]

## 10. Left to the builder

Capture library, rich text editor, image file naming, export folder layout, exact component hooks per screen, accessibility details of the confirm dialog.

## 11. Open items to confirm

- Default of the new timer setting (freeze) and "untimed has no effect".
- Export folder behaviour (dialog with a default).
