# Question bank and lesson quality audit: design

Date: 2026-11-10. Status: draft, waiting for the user's approval.
Skills selection: `docs/usp-select-skills/2026-11-10-question-bank-and-lesson-quality-audit-skills.md`.
Background: `.context/handoff-report-feature-session4.md` (section 4b) and `.context/handoff-report-feature-session5.md` (section 6).

Marking used below: **[User]** = decided by the user. **[Agent's call]** = chosen by the agent, the user has not agreed to it and may change it.

## 1. Intent and why

The app teaches AWS Certified Cloud Practitioner (CLF-C02) through lessons and a question bank. The user found that the bank contains wrong or outdated answers. Example: question `q_9e6c9d987920` (topic `compute`, "Which responsibility belongs to AWS when hosting databases on EC2?") has the answer "Operating system patches", but AWS documentation says the customer patches the guest OS on EC2 (AWS Well-Architected Security Pillar, Amazon ECS shared responsibility page). One wrong answer means the user no longer trusts the rest, so everything is checked again.

The user wants correct knowledge and to pass the exam. **[User]** The source of truth is current official AWS documentation. **[User]** Where a bank answer disagrees with it, the answer is changed to the AWS-correct one (policy "B").

CLF-C02 was confirmed as the current exam (official exam-guide page, searched 2026-11-10; no CLF-C03 found). The exam guide's domains were not read in full yet; the builder must read the official guide first.

## 2. Scope [User]

- 668 imported questions: `content/questions/imported.json` (588 single-answer, 80 multi-answer, 17 without a topic).
- 130 agent-authored questions: `content/questions/authored/<topic>.json` (10 per topic, 13 topics).
- Explanations and option notes: `content/explanations/<topic>.json` (14 files) and the `explanation` field of authored questions.
- Lessons: `content/lessons/<topic>/*.en.md` and `*.vi.md` (13 topics).
- Work is done topic by topic, so that questions, explanations and lessons about the same knowledge are fixed together.
- The app's change to history and review data (section 6).

## 3. Goals, non-goals, anti-goals

Goals
- Every question text, option, correct answer, explanation, option note and lesson claim agrees with current official AWS documentation.
- Every changed answer has: old answer, new answer, reason, official source link, confidence level, and the user's approval.
- Old attempts and review data are consistent with the corrected bank.
- Import bugs (for example multi-answer questions that lost an option) are found and fixed.

Non-goals
- No new features, no UI redesign, no new questions or lessons, except where a fix needs a replacement sentence or option.
- No changes to the Report feature.
- No support for other certifications.

Anti-goals (what would make this a failure even if the app works)
- A correct answer changed to a wrong one, or changed on the strength of an unofficial source.
- The app contradicts itself: answer changed but explanation, option notes or a lesson (EN or VI) still say the old thing, or the EN and VI lessons differ.
- Wrong questions missed because only the "the exam expects" notes (42 of them in 9 files) were checked.
- Old history left inconsistent with the corrected bank (a green tick next to an option now shown as wrong).
- Answers silently overwritten by a re-run of the import script.
- Anything written to `main`, committed, merged or pushed without the user's permission.

## 4. Method

Phase A, audit (read-only, no repository content changes). **[User]** per topic, then user review.
1. For each topic, worker agents (assignment in section 9c) compare every question, correct answer, explanation, option note and lesson claim with official AWS documentation. Primary sources first (docs.aws.amazon.com, aws.amazon.com, whitepapers, the official CLF-C02 exam guide). Blogs and study sites are leads only and never the deciding source.
2. Output: one audit report per topic, written outside `content/`. Each finding has: id, location, current text/answer, proposed correction, official source URL, confidence (high / medium / low), and the kind of finding (wrong answer, outdated, ambiguous, import bug, explanation or lesson mismatch).
3. Questions with several defensible answers, or where documentation is unclear, are reported as "unsure" and are never changed on the agent's own judgement.
4. Import bugs are reported in their own section, separate from knowledge findings.

Phase B, review. **[User]** The user approves each answer change one by one, seeing old answer, new answer, source and confidence. **[Agent's call]** Explanation/lesson wording fixes that do not change a claimed fact (typos, unclear wording) can be reviewed in a batch per topic.

Phase C, fix (starts only after this spec and the plan are approved, on a new branch with the user's permission). Per topic: apply approved changes to the answer, the explanation, the option notes and the EN and VI lessons together.

## 5. Constraints

- Subagents: this work uses the `/diff-type-subagents` rules in the repository `CLAUDE.md` (section "Mixed-Vendor Subagents Flag"). Workers are Haiku 5.5, Codex CLI models and Agy CLI models. The Claude Code session (Sonnet 5.5) only orchestrates and reviews; there are no Sonnet subagents. Never Opus of any kind. See section 9c.
- Project rules from the repository `CLAUDE.md`: Superpowers order with approval gates, `rtk`-prefixed commands, commit format `type(scope): description` with body sections Scope / What did / Reviewed / Tested, no AI attribution or co-author trailer, no commit before the user says so.
- Question ids are a hash of question text and options (`scripts/import-cards/stable-id.ts`), not of the answer. Changing only `correct` keeps the id. Changing question text or options changes the id and breaks history and report links, so any such edit needs an id mapping. [Agent's call: avoid text/option edits; if one is unavoidable, record an old-id to new-id mapping and migrate history.]
- `imported.json` is generated by `scripts/import-cards/` from `export_cards_to_knowt/results/questions.txt`. Re-running the import would overwrite fixes.
- Existing SQLite migrations `0001` to `0005` must not be edited.
- Reports store ids, so existing reports stay valid; their stored `is_correct` is historical context.

## 6. Decisions about history and review data

**[User]** After a correction, old history is **re-graded with the new answer**.
- For every changed question, recompute `attempt_questions.is_correct` for all submitted attempts from the stored `selected` keys against the new `correct`; recompute each affected attempt's `score_pct` and `passed`; recompute `question_stats` (box, due date, times correct, last correct) and the "most missed" statistics for the changed questions.
- The user accepts that old scores can change.
- **[User, 2026-11-11]** Learning progress follows the re-graded `passed` values and is revoked when a re-grade turns a passed attempt into a failed one: a topic is complete only while it has a passed practice attempt (`completedTopicIds`), a checkpoint counts as passed only while it has a passed checkpoint attempt (`passedCheckpointGroups`), and gates close again when their checkpoint is no longer passed. No separate record of "unlocks already earned" is kept. This is the behaviour of the existing code and needs no new mechanism, but it must be covered by a test (plan Task 6) and shown to the user in the real-database scenario (plan Task 11).

**[Agent's call]** How it is done (the builder may refine):
- A content revision number is stored in the `settings` table. At app start, if the bank's revision is newer than the stored one, run the re-grade for the questions listed in the corrections log, then store the new revision. Safe to run twice (idempotent).
- Copy `mindmap.db` to a backup file before the first re-grade.
- `question_stats` cannot be rebuilt exactly from attempts (it is incremental); recompute from the graded attempt rows of the changed question, in time order, using the same scheduler rules (`features/review/logic/scheduler.ts`). If an exact rebuild is not possible, document the approximation.
- Checkpoint attempts (`kind = 'checkpoint'`) and any pass/fail rule use the same re-grade.
- The review screen already reads the live `question.correct`, so it needs no change.

## 7. Where corrections are stored [Agent's call]

- Fix `content/questions/imported.json` directly and add `content/review/answer-corrections.json` (id, old answer, new answer, reason, source URLs, confidence, approval date). It is the audit trail and the input of the re-grade.
- Add a short note (README or comment in `scripts/import-cards/`) that the import must not be re-run over the fixed file, and make `npm test` fail if `imported.json` and the corrections log disagree.
- Alternatives considered and not chosen: a separate override file read by the app (needs app code change), or fixing `questions.txt` too (outside the app; the user may ask for it).

## 8. Consistency checks [Agent's call]

Add tests that run with the normal suite:
- every question has a valid `correct` key set, matching `multi`;
- every explanation entry and option note refers to an existing question and option;
- the corrections log matches the bank;
- re-grade logic is covered by tests (idempotent, multi-answer, checkpoint).
Whether lesson text can be checked automatically is left to the builder; lessons are checked by the audit and by review.

## 9. Left to the builder

- Order of topics (suggestion: `shared-responsibility`, then `compute`, then the rest by number of "the exam expects" notes).
- Exact audit report format and file location, as long as it holds the fields in section 4.
- Parallelism of subagents and batching.
- Exact structure of the corrections log and the test details.

## 9b. Calls made after the builder check [Agent's call, all]

1. **17 questions without a topic:** audited as their own batch, topic name `unassigned` (an explanations file `unassigned.json` already exists). Assigning them a topic is out of scope unless the audit shows a question belongs to a topic.
2. **Definition of done:** every one of the 798 questions is checked, not a sample. Each question gets a one-line verdict ("verified" or a finding) with at least one official source URL. The user reviews after each topic, before that topic's fixes start; items marked "unsure" are decided by the user.
3. **Question text or option edits:** not forbidden, but avoided. If the audit finds a real import bug that needs an option restored, the id changes by the hash rule. The id-mapping and history migration are built only if the audit finds such a case, and decided in the plan after the audit. Until then they are not part of the plan.
4. **Changing between single and multiple answers:** `multi` may be edited together with `correct`. The stored `selected` is always a list of option keys, so re-grade works in both directions. The consistency test requires `multi` to be true exactly when `correct` has more than one key.
5. **`question_stats` after re-grade:** an approximation is acceptable. What must be exact are the tick/cross marks, `score_pct`, `passed` and the "most missed" counts. Due dates and boxes are rebuilt by replaying graded attempts and the approximation is documented.
6. **In-progress attempts and checkpoint exams:** in-progress attempts are graded at submit against the live bank, so they should need no re-grade; the builder verifies this in the code before relying on it. Checkpoint attempts follow the same re-grade as other submitted attempts. If any table stores a copy of the answers, that copy is updated too.
7. **Vietnamese lessons:** a fix is written in English first, then applied to the Vietnamese lesson in the same task. Both go through the same approval gate; the user reads Vietnamese and checks the wording.
8. **Audit reports:** `docs/superpowers/audits/2026-11-10-<topic>.md`, tracked in git, so Phase C and later sessions can read them.

## 9c. Agents that do the work [User decided the roles; the assignment is the agent's proposal]

The full rules (models, effort levels, pre-flight checks, handoff, quota, fallback chains) live in the repository `CLAUDE.md`, section "Mixed-Vendor Subagents Flag". This spec only states how they apply here.

**[User]**
- The Claude Code session (Sonnet 5.5) reviews every task and the whole branch. It re-checks the official source of every proposed answer change itself. It is not a worker.
- Workers: Haiku 5.5, Codex CLI, Agy CLI. `claude-sonnet-4-6` inside Agy is used a little, only to arbitrate the hardest findings. Never Opus.
- The user approves every answer change one by one (section 4, Phase B).
- Fallback: Codex, then Agy, then Claude (Haiku); or Agy, then Codex, then Claude. If Claude is exhausted, stop and report.

**[Agent's call]** Assignment (a proposal, to be confirmed by the pilot below):
- Audit of questions and answers: Codex `gpt-6.1-sol`, effort high, batches of 25-30 questions.
- Explanations and option notes against the answer: Haiku 5.5, XHigh.
- Lesson claims, EN and VI: Agy `gemini-3.8-flash-high`.
- Disputed or low-confidence findings: Agy `claude-sonnet-4-6` (effort cannot be set).
- Merging and formatting reports: Agy `gpt-oss-120b-medium` (effort fixed).
- Import-bug detection and applying approved changes to JSON: scripts, no model.
- Re-grade code and tests (Phase C): Codex `gpt-6.1-sol`, effort xhigh, write access only in an isolated worktree that the user allowed.
- Never use effort `ultra` or `max`.

**Pilot first [Agent's call]:** before the full audit, run one small topic (suggestion: `shared-responsibility`, 29 questions) with Haiku XHigh, Sol high and Gemini Flash high on the same batch, read-only. The orchestrator checks accuracy against official documentation and records the quota each one used. The cheapest model that is accurate enough then takes each kind of task. The pilot's result decides the final assignment.

**Handoff and state:** every delegated task has a folder with `brief.md`, `ledger.json`, `notes.md` and one result file per batch, so that another agent can continue after a quota or error stop without redoing finished batches. **[User]** The path is `.superpowers/diff-agents/2026-11-10-question-bank-audit/<task-id>/` (for example `.../shared-responsibility/`), at the repository root. It is already ignored by git, so this working state is never committed, and it is deleted when the audit is accepted. Workers write only inside their own task folder; the orchestrator creates it and saves each batch result there.

The audit reports in section 9b item 8 are the tracked deliverables, stored at `easy_mindmap_knowledge/docs/superpowers/audits/2026-11-10-<topic>.md`. They are built from the `results/` files and are not stored in the task folder.

**Not yet known:** how to read the quota percentage of Codex and Agy, the exact message when a quota runs out, and whether Codex Luna and Terra use the same quota as Sol. These are checked before the pilot and recorded in `CLAUDE.md`.

## 10. Risks and open items

- Official documentation can change; each source gets a retrieval date.
- Some questions have no clear official source; they stay "unsure" and are decided by the user.
- Re-grading changes historical scores (accepted by the user).
- Quota: Codex and Agy run on the user's personal subscriptions. A worker can run out of quota midway, and draining it to zero takes away the user's own use. Mitigation: small batches, results written after every batch, the thresholds and fallback chains in `CLAUDE.md`.
- A task finished after a fallback to a weaker model has lower confidence and gets a more careful review.
- Cost: roughly 800 questions plus lessons in two languages means many research calls. A pilot on one topic gives the real cost before the remaining topics.
- Open for the user to decide after the audit: whether to also fix `questions.txt`, and whether to expose "corrected on" information in the app (not planned).
