# Unanswered handling, attempt report (type 4), and result search/filter: design

Date: 2026-11-11. Status: draft, waiting for the user's approval. Stack: the existing one (Svelte 5, Tauri, SQLite, Vitest). No new dependencies. The user skipped the questions, so every item marked **[Call]** is the agent's decision; everything else is the user's request.

## 1. Intent

Three small additions to the practice/exam flow, all in the existing features.

## 2. Feature A: what to show for unanswered questions

**Where.** Practice setup (`PracticeSetup.svelte`), as a new fieldset directly under the "when the report dialog is open" option (`onReport`). **[Call]** Unlike the clock options (shown only for timed attempts), this fieldset is always shown, because unanswered questions exist in untimed attempts too.

**Legend:** "Xử lý các câu chưa làm sau khi kết thúc bài" / English equivalent. Two radio options:
1. **Hiển thị đáp án đúng và giải thích**: unanswered questions show all options, the correct ones marked, and the explanation (today's behavior).
2. **Chỉ hiển thị đáp án**: unanswered questions show all options as plain choices, with no correct-answer marking, no option notes and no explanation.

**Default:** option 1 (today's behavior, so nothing changes for existing users). **[Call]**

**Scope of the effect.** Only questions with no selected option. Answered questions (right or wrong) always show everything as now. Scoring is unchanged: an unanswered question still counts as wrong.

**Where it is applied.** The result page (`PracticeResult`, all three modes) and the past-attempt dialog (`AttemptDetail`). The choice is saved with the attempt (new column, like `clock_on_report`) so the history dialog follows the choice made for that attempt. Old attempts load as option 1. **[Call]**

**Exam (checkpoint) attempts.** The exam setup has no such option and does not get one **[User, confirmed 2026-11-11]**. Exam attempts keep option 1.

**Remembered:** stored with the other last-used practice options, with the same tolerant parsing (a missing value loads as option 1).

**Review (ôn tập) attempts.** They never pass through the practice setup, so they have no control and always use option 1. **[Call, from builder check]**

## 3. Feature B: report type 4, attempt report

**Button.** On the result page, in the sticky bottom bar, at the right side, next to "Về sơ đồ" and "Làm lại". Same yellow report button as the others. It appears in all three modes of `PracticeResult` (practice, exam, review) because the three share the bar. **[Call]**

**Behavior.** Opens the existing report dialog (body text up to the same limit, up to one screenshot like question/lesson reports). **[Call]** The screenshot target is the whole result content.

**Stored.** New type `attempt` with `attempt_id` and `source_screen` (`result`). No question id, position, or selection.

**Database.** The `reports.type` column has a CHECK that allows only question, lesson and system, and SQLite cannot change a CHECK in place. A new migration (`0006_*.sql`, never edit shipped ones) rebuilds the table with the new value and copies every row and image row across. The migration test must prove existing rows survive.

**Everywhere reports are listed.** The Reports tab labels, the type filter and the summary counts, the detail view, and the agent export (format text explains `attempt`, with `attemptId` in `refs`). The export folder naming and image handling stay the same.

**Review runs with several batches.** Each batch is its own attempt, so a report filed from a batch's result points to that batch's attempt id only. **[Call, from builder check]**

**Timer rule.** Not applicable: the attempt is already finished.

## 4. Feature C: search and filter on the result page and the past-attempt dialog

**Where.** Above the question list on `PracticeResult` (all modes) and in `AttemptDetail`. One shared component and one shared pure filter function, used by both. **[Call]**

**Controls.** One text input plus a filter: Tất cả / Đúng / Sai.

**Search, one input, matches a question when any of these holds** (case-insensitive, ignoring Vietnamese and other diacritics **[Call]**):
- the question number equals the number typed (typing `34` finds Câu 34);
- the question title contains the text;
- any option text contains the text.

It never searches explanations or option notes.

**Filter:** Đúng shows correct answers; Sai shows wrong **and unanswered** ones. **[Call]**

**Behavior.** The two controls combine (filter AND search). The list shows a count ("x / n câu"). When nothing matches, an empty message. Question numbers keep their original numbers while filtered. The exam breakdown block (`ExamBreakdown`) is not filtered. **[Call]** Search state is not saved and resets when the page or dialog closes.

## 5. Goals, non-goals, anti-goals

- Goals: the three features above, in vi and en, accessible (labels, `role`, focus), covered by tests.
- Non-goals: changing scoring; changing the exam setup; the missed-questions dialog; saving search state; searching explanations.
- Anti-goals: any change to existing attempt data; hiding the correct answer anywhere except for unanswered questions under option 2.

## 6. Left to the builder

File and component names (guide: shared search/filter in the history/practice feature layer, not a global bucket), exact i18n keys and wording, styling, and the migration file name.

## 7. Open questions

None left. Both were answered by the user on 2026-11-11 (exam setup: no; history dialog button: yes).
