# Exam help powers, show-answer in practice, CLS fix and sticky Start bar: design

Date: 2026-11-21. Status: DRAFT, waiting for the user's approval.

## Intent and why

Learners who are unsure about a question want to peek at the answer and its explanation while practising, and in the checkpoint exam (the "session" exam, "Bài kiểm tra mốc") they want a limited set of helps. The Capstone exams stay as the strict, real-exam-like test. Two UX defects are fixed in the same change: the question number grid shifts layout when a question is answered (CLS), and the Start button on the setup screens is out of sight until scrolled to.

## Terminology (confirmed with the user)

- **Practice**: "Luyện tập: <topic>". Setup in `features/practice/ui/PracticeSetup.svelte`. `kind = 'practice'`, topic is not a capstone.
- **Checkpoint exam** = "bài session" = "Bài kiểm tra mốc {n}". `kind = 'checkpoint'`. Setup in `features/exam/ui/ExamSetup.svelte`.
- **Capstone**: `kind = 'practice'` with `topicId` `capstone-exam-1` or `capstone-exam-2`, also set up by `ExamSetup.svelte`. Gets no help of any kind.
- **Review** (`kind = 'review'`): out of scope, no help.

## Goals

1. Practice: an opt-in setup tick "Cho phép hiển thị đáp án". When ticked, the question screen has a "Hiển thị đáp án" button, unlimited uses.
2. Checkpoint exam: an opt-in setup tick "Sử dụng quyền trợ giúp". When ticked, two powers, 3 uses each for the whole attempt, with the remaining count shown while answering:
   - **Hiện đáp án đúng** (same behaviour as practice show-answer, but capped at 3 questions).
   - **Loại 2 đáp án sai** (3 questions).
3. Show answer: marks the correct options green, a picked wrong option red with a text badge, and shows the explanation, all in the same style and wording as the result screen. The user can still change their selection afterwards.
4. Using help never changes scoring. A question that had its answer shown is graded normally from the final selection.
5. Help state survives closing and resuming the app (the app resumes unfinished attempts through `ResumeGate`), so closing the app cannot refill the 3 uses.
6. No layout shift when a question is answered: remove the "✓" from the question number grid and change only colour.
7. The "Bắt đầu" / "Bắt đầu thi" button sits in a fixed bar at the bottom of both setup screens.

## Non-goals and anti-goals

- No help in Capstone or Review. No indication of help use on the result screen or in history (not asked for; can be added later).
- Anti-goal: any way to gain extra uses (closing the app, re-clicking, switching questions).
- Do not edit or delete any shipped migration. Do not change how scoring, pass thresholds or spaced-repetition stats work.

## Constraints

- The app auto-updates and installed databases must migrate in place. New migration `src-tauri/migrations/0009_*.sql` is registered in `src-tauri/src/lib.rs` like 0001-0008. Columns are added with defaults only, so attempts that were in progress before the update resume with no help used.
- Svelte 5, Tailwind semantic tokens, existing `Button`, `cn`, i18n (`vi` and `en` strings). Accessibility: icon/colour state must also be text or aria (the grid already has aria-labels for answered state).
- Tests first (TDD) for session logic, migration, and components.

## Approaches considered

1. **A. In-memory help state** in `PracticeSession`. No DB change. Rejected: the app resumes attempts after it is closed, so the counters would reset and the user would get fresh uses.
2. **B. Persist help state with the attempt (chosen by the user).** New columns, migration 0009, saved immediately on each use, restored on resume. Costs a migration and repository changes but is the only approach without the loophole.
3. Reusing `OptionReview` as the in-exam answer view was rejected: it is a read-only list, and the user must be able to change the selection after the reveal. The radios/checkboxes stay and are decorated in place.

## Design

### Data (migration 0009)

- `attempts.help_mode TEXT NOT NULL DEFAULT 'off' CHECK (help_mode IN ('off','reveal','powers'))`. Set at start: practice with the tick = `reveal`, checkpoint with the tick = `powers`, everything else `off`.
- `attempt_questions.revealed INTEGER NOT NULL DEFAULT 0`.
- `attempt_questions.eliminated TEXT NOT NULL DEFAULT '[]'` (JSON array of option keys).
- Uses left are derived, not stored: `3 - count(revealed questions)` and `3 - count(questions with eliminated non-empty)`. This leaves no counter that can drift.
- Types in `persistence/records.ts` (`AttemptRow.helpMode`, `AttemptQuestionRow.revealed/eliminated`), the attempts repository (create, load/resume, `saveReveal`, `saveEliminated`), and the in-memory repo used by tests.

### Session logic (`features/practice/session.svelte.ts`)

- `reveal(position)`: allowed when `helpMode` is `reveal`, or `powers` with reveals used < 3 (re-revealing an already revealed question is free and idempotent). Persist first, then update memory (same pattern as `select`).
- `eliminate(position)`: only when `helpMode = 'powers'`, uses < 3, the question is not revealed and has no elimination yet. Picks `min(2, number of wrong options)` wrong options at random, persists the choice, never removes a correct option. If a removed option was selected, the selection is cleared (and saved).
- A revealed question cannot use "Loại 2 đáp án sai" any more. Eliminating then revealing is allowed.
- `select` is unchanged except that eliminated options cannot be selected.
- Resume restores `revealed`, `eliminated` and `helpMode`.

### UI

- **QuestionNav**: delete the `✓` span. Answered state is `border-primary bg-muted` only. Keep the aria-label that already says answered/unanswered, so nothing is conveyed by colour alone for screen readers.
- **QuestionPanel**: when revealed, each option row is marked in place (green for correct, red plus ✗ for a picked wrong one, text badge reusing the `practice.result.badge.*` strings and `optionNotes`), and the explanation block (`question.explanation`) appears below the options. Eliminated options are greyed, struck through and disabled. Extract the shared state-to-style logic from `OptionReview.svelte` so both use one source.
- **PracticeSessionView**: in the bottom action row, on the right, a "Hiển thị đáp án" button (practice with `reveal`) or two buttons with remaining counts, "Hiện đáp án đúng (2/3)" and "Loại 2 đáp án sai (3/3)" (checkpoint with `powers`). Disabled with a reason when no uses are left or the rule above forbids it. Not rendered at all when `helpMode = 'off'`. Announce the change via the existing `aria-live` status region.
- **PracticeSetup**: a tick "Cho phép hiển thị đáp án", remembered in `practice_last_options` (default off, old saved options load as off).
- **ExamSetup**: for checkpoint only, a tick "Sử dụng quyền trợ giúp" (default off). The rules list must not claim "Đáp án và lời giải chỉ hiện sau khi bạn nộp bài" when the tick is on; Capstone setup is unchanged. Whether the checkpoint tick is remembered is the builder's call (default: not remembered, to keep exams deliberate).
- **Sticky Start bar** on both setup screens: a bottom-fixed bar containing the submit button, with bottom padding on the page so the last option is never hidden, safe for the keyboard, and the locked reason / error message stays visible near it.

### Interactions and edge cases

- Timer, freeze/run policies, submit, grading and unanswered display are unaffected.
- Practice show-answer is unlimited and has no persisted counter, but `revealed` is still saved so the coloured state survives resume.
- A question with fewer than 2 wrong options eliminates what exists; if none, the button is disabled with a reason.
- Multi-answer questions: reveal marks every correct option; elimination only touches wrong ones.

## Testing

- Migration test: 0009 applies on a DB at 0008 with an in-progress attempt, which resumes with `help_mode = 'off'` and nothing revealed.
- Session tests: caps (4th reveal and 4th elimination refused), idempotent re-reveal, elimination blocked after reveal, correct option never eliminated, selection cleared when an eliminated option was selected, persistence failure rolls back memory, resume restores state and counts, scoring identical with and without help.
- Component tests: nav has no `✓` and the cell size does not depend on answered state; buttons render only per `helpMode`; reveal styling; setup ticks; sticky bar present on both setups.

## Left to the builder (decisions made by the agent, not the user)

- Each power is spent once per question; the random choice of two wrong options is stored.
- Selection is cleared when its option is eliminated.
- Question-level spaced-repetition stats are not changed by help.
- Exact Vietnamese/English wording of the new strings, following existing i18n key style.
- Checkpoint help tick is not remembered between runs.

## Resolved with the user

- "Loại 2 đáp án sai" works on a question that already has a selection and removes only wrong options (including a wrong option the user picked). A correct option is never removed. (Confirmed 2026-11-21.)

## Open questions

None for the user.
