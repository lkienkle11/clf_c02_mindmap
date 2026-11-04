# Results review, history and lesson-navigation fixes — design

Date: 2026-11-04. Status: APPROVED by the user (2026-11-04), content scope = full (option 1). App: `easy_mindmap_knowledge` (Svelte 5 + Tauri + vitest).

## Intent

The user is using the app to study for AWS CLF-C02 and found six problems while reviewing a practice result and the history screen. Each is real in the code (root causes below). Goal: the result and history screens teach the user *why* an answer was wrong, and the lesson flow never dead-ends.

## Problems and root causes (verified in code)

1. **Explanation does not match the user's wrong choice.** Q10 (Local Zones): user picked CloudFront edge locations, explanation only contrasts with Outposts. `Question.explanation` is a single paragraph written once per question; it never addresses the other options.
2. **Some questions have explanations, some do not.** `content/questions/imported.json`: 0 of 668 have `explanation`. `content/questions/authored/*.json`: 130 of 130 have it. So every question taken from the exam dump has none (`PracticeResult.svelte` / `AttemptDetail.svelte` only render the block `{#if explanation}`).
3. **Result does not show the other options.** `PracticeResult.svelte` and `AttemptDetail.svelte` print only "your answer" and "correct answer" texts, not the full option list.
4. **Duplicate table in History.** `ScoreChart.svelte` has a "show table" toggle that renders a table with the same Date/Topic/Mode/Score columns as `AttemptsTable.svelte` directly below it. Not a rendering bug; it is two tables of the same data.
5. **"Câu hay sai nhất" layout.** `Insights.svelte` puts it beside "Chủ đề cần chú ý" in a 2-column grid and shows only five questions with "Sai x/y lần"; no way to see what was chosen, the explanation, or to browse all.
6. **"Bài kế tiếp" dead end.** `LessonPanel.svelte`: `next` is `null` on the last lesson of a topic, so the button is disabled. Practice (a separate `practice` route) is only reachable by going back to the tree.

## Goals

- G1/G2/G3: result review (right after submit, and in history attempt detail) shows **all options**, marking *your pick* and *correct*, and an explanation for **every** question that also says why *the option the user picked* is wrong.
- G4: one table in History only.
- G5: new Insights layout + "most-missed" dialog (list, search, topic filter, pagination).
- G6: Next on the last lesson goes to that topic's practice; disabled only when practice is locked, with the reason shown.

## Non-goals / anti-goals

- No change to grading, spaced-repetition scheduling, unlock rules, or the database schema (attempt rows already store `selected` and `optionOrder`; that is enough).
- No new dependency. No change to the English-only question text (explanations stay English like the question; UI labels go in `en.json` + `vi.json`).
- Anti-goal: shipping per-option notes that are wrong. Content must be fact-checked, not just generated.

## Design

### A. Content: per-option notes (G1, G2)
- Add optional `optionNotes?: Record<string, string>` to `Question` (key → one short sentence: why this option is right/wrong). Keep `explanation` for the overall reasoning. Validation in `load-catalog.ts`: keys must be real option keys; notes non-empty strings.
- Result UI: for each option show text + badges (`Your answer` / `Correct`), and under every option the user picked or that is correct, its note when present. Falls back to the plain `explanation` when no note exists, so nothing regresses mid-migration.
- Fill content for all 798 questions (668 imported + 130 authored): `explanation` for imported, `optionNotes` for all. Done in batches per topic file with a fact-review pass per batch (same method as the earlier content batches, see commits `fix(content): resolve fact-review findings…`).
- Tests: loader validation; bundled-content test asserting every question has an explanation and a note for every wrong option (this is the guard against item 2 recurring).

### B. Result and attempt detail (G3)
- Shared `OptionReview.svelte` (in `features/practice/ui/`) used by both `PracticeResult.svelte` and `AttemptDetail.svelte`, replacing their duplicated answer-listing code. Options shown in the order the attempt displayed them (`optionOrder`) in the history; in the order of the question for the immediate result unless the item carries it.
- State is never colour-only: text badges + ✓/✗ marks.

### C. History: remove duplicate table (G4)
- Remove the "show table" toggle and inline table from `ScoreChart.svelte`. The attempts table below is the accessible alternative; keep the SVG `aria-label` summary and add a pointer to the table in the chart's caption for screen readers.
- Remove the now-unused i18n keys and update `ScoreChart.test.ts`.

### D. Insights + most-missed dialog (G5)
- `Insights.svelte`: stacked single column. Order: "Chủ đề cần chú ý" list, then "Câu hay sai nhất" heading with a button **"Xem câu hỏi sai nhiều"** (the 5-item preview list is removed; the button carries the count, e.g. "(12)").
- New `MissedQuestionsDialog.svelte` using the existing `Modal`. Each entry: question text, topic, times wrong (`Sai x/y lần`), and for the **latest wrong attempt**: your answer vs correct answer, option notes/explanation (via `OptionReview`). My call: show the latest wrong answer only, with a count of how many different wrong answers were given if >1.
- Search box (case-insensitive substring over question text), topic filter (`<select>`: all + topics that have misses), pagination 5 per page (my call) with Prev/Next and "Page n of m"; filters reset to page 1. Sort: most misses first, then miss rate, then id (reuse `mostMissed` with no limit).
- New pure logic `missedDetails(rows, questions)` in `history-stats.ts` (tested): builds entries from attempt rows already loaded by `HistoryScreen`; honours the existing topic filter of the history route.

### E. Lesson Next → Practice (G6)
- `LessonPanel.svelte`: when `next === null`, the primary footer button becomes "Luyện tập" (`nav.practice`) → `appState.open({view:'practice', topicId})`. If `practiceUnlocked` is false (a required lesson unread), it stays disabled and shows `mindmap.practiceLockedLessons` as the reason. The optional-last-lesson case from the screenshot becomes: Next = Practice.
- Also affects the last *required* lesson when it is last overall: same rule, no special case.

## Constraints

- Svelte 5 runes; follow `svelte-core-bestpractices`; run `svelte-autofixer` on every component. Tailwind tokens already in `tokens.css`. Accessibility: dialog focus handled by `Modal`; filter/search labelled; pagination buttons with `aria-label`.
- TDD per task; `npm test`, `npm run check` green before completion.

## Left to the builder / my calls (mark for review)

- Pagination size 5; latest-wrong-answer display; removing (not hiding) the chart table; label text wording in vi/en.
- Batch size and ordering of content writing; fact-review method.

## Calls made after the builder check (mine, change if you disagree)

- **Order of work:** code and UI first (with the fallback to `explanation`), then content batch by batch per topic on the same branch. The "every question has explanation + notes" guard test is added in the last task, once content is complete; until then it is not in the suite.
- **Multi-answer questions (80 imported):** notes are required for every wrong option and for every correct option (so a partly right answer still explains both halves). Badges are per option: an option you picked that is correct shows "Bạn chọn · Đúng", one you picked that is wrong shows "Bạn chọn · Sai", a correct option you missed shows "Đáp án đúng". For `orderDependent` questions the options are listed in the order the user saw them and the correct order is stated in the explanation text.
- **Option order in the immediate result:** extend the result item with `optionOrder` (a read-only field copied from the attempt, no grading change) so the result shows the same order the user just saw; the history detail already has it.
- **Most-missed data:** the dialog reads the same rows `HistoryScreen` already loads (all submitted attempts for the current filter, not paginated). Its topic select starts from the route filter and can be changed inside the dialog; no new query.
- **Button count "(12)":** number of questions with at least one miss under the current filter; the dialog lists exactly those.
- **"Different wrong answers":** two answers are the same if they select the same set of keys, regardless of order.
- **Locked practice on the last lesson:** `practiceUnlocked` is a pure function of the topic's lessons and `appState.readIds`, both available to `LessonPanel`; the i18n key `mindmap.practiceLockedLessons` already exists and is reused. Practice is also blocked when the topic is locked, which cannot happen here because the lesson screen only opens for unlocked topics.

## Open decision for the user

Content scope for A: (1) full — explanation + per-option notes for all 798 questions (recommended; this is what actually fixes problems 1 and 2, but it is a large content job done in ~13 topic batches), or (2) minimal — write the explanation for the 668 imported ones only, and show "why wrong" only where notes exist.
