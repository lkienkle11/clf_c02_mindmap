# diff-type-subagents: when it applies, and fewer questions (batch 2 of 3)

Date: 2026-11-23. Status: draft, waiting for the user's approval.
Skill under change: `.claude/skills/diff-type-subagents/` (tracked in this repository).
Follows batch 1 (setup, reset, `target:`, per-user config; merged as PR #28). Batch 3 (two-level parallel work, worktree ownership, wrap-up and clean-up) comes after this one.

## Intent and why

Two problems the user raised after batch 1:

1. **Timing.** The skill says it loads "at Step 0" and applies "at every workflow step", but nothing says what that means beside Superpowers, beside OpenSpec or any plan-following workflow, when the user asks to delegate with no workflow at all, or when the user asks late in a workflow. Loading too early keeps the whole skill in context through brainstorming for nothing and is easy to lose after a compaction. Loading too late lets decisions about who does the work be taken without it.
2. **Too many questions.** The user wants whole tasks done with as few interruptions as possible. Today the skill stops many times in small, separate questions (one set per CLI at setup, the question "another installed CLI?" again after setup, the independent-reviewer question, the ripple classes, consent for each probe), and every session asks the same things again.

## Goals

1. A short section "When this skill applies" in `SKILL.md` stating when the skill is used, when it takes effect, and how it combines with any workflow, with no workflow, and when typed late.
2. One question list ("intake"), asked once per topic, at the first moment the skill governs a decision, replacing the scattered small questions. Each question has a stated default; one reply may accept all defaults.
3. Standing consents: answers the user chooses to remember for this machine, stored in the user's `policy.md`, so later sessions do not ask again.
4. A fixed list of things that are never stored and always asked.
5. The deferred batch-1 minors that belong here are closed: Gate 1A no longer asks "another installed CLI?" after `setup` or `target:`; the stale "missing config" wording is removed.

## Non-goals (do not touch in this batch)

- Parallel groups, worktree and workspace questions, wrap-up and clean-up, the `reset` guard for "current topic" (batch 3). The intake has a reserved slot for the batch-3 questions and nothing else about them.
- Gates 4 to 6, `allocation.md`, `parallel-groups.md`, `running-workers.md`, `skill-delivery.md`, `worker-rules.md`: only references to the questions change.
- Any weakening of a hard rule of `SKILL.md`.
- Automatic approval of the assignment table (see Approaches).

## Anti-goals (a failure even if it works)

- A stored consent that covers something irreversible, something that touches real data, a write outside the approved workspace, a merge or push, or a bypass flag.
- A consent stored without the user choosing to store it, or widened silently (a new CLI that was not in the consented list is asked about).
- The skill delegating before `Status: approved` in `assignments.md` (the table approval stays).
- A reader of `SKILL.md` unable to tell, for a given workflow, at which step the skill takes effect.

## Constraints

- Skill text stays English and vendor-neutral; consents name no vendor except as data the user's own config holds.
- Every write to the config shows its diff first (existing rule), including storing a consent.
- Hard rules unchanged except path names, as in batch 1.
- Project rules: commit format, approval gates of `CLAUDE.md`.

## Approaches considered

| | Idea | Trade-off |
|---|---|---|
| A | One intake list at the first governed decision, with defaults and "remember" options; consents stored per machine in `policy.md`; the table approval stays | Large cut in questions, keeps the one human gate before delegation. Still one list and one approval per topic. |
| B | A, plus a pre-approved envelope under which the table is approved automatically (for example read-only tasks, worker families from a list, no writes) | Fewest stops, but delegation could start without the user having seen the table; harder to audit; a mistake in the envelope is silent. |
| C | Only de-duplicate the existing questions, no storing | Safest and smallest, but the same questions come back every session. |

The author's pick is **A**. B is a possible later step once A has run for a while; the spec does not prevent it.

## Design

### 1. When this skill applies (new section in `SKILL.md`)

- **Trigger.** The user types `/diff-type-subagents`, or asks to delegate work to other agents or CLIs. (Unchanged; kept short.)
- **Takes effect** at the earliest moment a decision it governs, who does a piece of work, is about to be taken, and not earlier. Setup and the Gate 1 checks may run at any earlier time and need no task list.
- **With a workflow** (Superpowers, OpenSpec, or any plan-following one): the skill is an overlay and never replaces the workflow or weakens its approval gates. Each step of the workflow is a Gate 3 point. The natural moment is when the tasks are about to be executed: with Superpowers, when the user chooses how to execute the approved plan (delegating is a third way beside the two the plan offers); with a spec-driven workflow, when its tasks are about to be applied; with any plan, before the first task. It takes effect earlier only when the user asks to delegate earlier work such as research or reconnaissance.
- **At Step 0 of a workflow** the skill asks nothing by itself. The single choice it needs is "delegate from the start, or only at execution?", and it is part of the intake (below), asked when the user has typed the command at that point.
- **With no workflow:** one request to delegate is a one-step workflow: intake, table, approval, run, review.
- **Typed late:** it takes effect from the current step on, using the files already on disk (spec, plan, ledger, `assignments.md`) and never asking again what they answer.
- The skill does not describe the internal steps of other workflows; it names only the moment ("tasks about to be executed").

### 2. The intake

A single list, shown once per topic, when the first delegation decision is reached (after the task list exists, before `assignments.md` is built). The list contains only questions whose answer is not already known from the config, the standing consents, the typed command or the files of the topic. A question already answered is not shown.

| # | Question | Default | Can be remembered |
|---|---|---|---|
| 1 | Which CLIs (only if no `target:` was typed and the config has no usable verified row) | the verified rows of the config | no (the config itself records them) |
| 2 | Consent to run the Hello test and capability probes for each CLI that needs them | yes for CLIs the user listed | yes |
| 3 | Delegate from the start, or only at execution (only when typed at Step 0 of a workflow) | only at execution | no |
| 4 | Independent reviewer for the final review (row "R" of `assignments.md`) | yes | yes |
| 5 | Ripple classes (the four kinds of mechanical edit of Gate 2 step 3b) allowed in the files of each task's ripple list | the four classes | yes (the kinds; the files are still shown per task in the table) |
| 6 | Reserved: parallel work and workspace questions (batch 3) | n/a | n/a |

Each question offers: yes, no, and, where marked, "yes and remember". One reply such as "accept the defaults" answers the whole list. The intake runs before the table, and the table approval of Gate 2 step 4 stays exactly as it is.

### 3. Standing consents

- Stored in the user's `policy.md` in a new section `## Standing consents`, a table `Consent | Covers | Granted | Scope`, scope always "this machine" (the user's pick on 2026-11-23). The template gets the empty section.
- A consent is stored only when the user answers "yes and remember", through the usual diff and confirmation.
- A consent covers exactly what the table row says: question 2 covers the Hello test and capability probes for the CLIs named in the row; a CLI that is not in the row is asked about; question 4 covers the choice of reviewer; question 5 covers the four classes by name.
- `reset` moves the config, so every consent is gone after it. The user may also say "forget <consent>"; the removal shows a diff first.
- A missing section means no consent. The author's existing `policy.md` needs no migration: the section is added at the first stored consent.

### 4. Never stored, always asked

Anything irreversible or touching real data (existing rule of Gate 2 step 3b-bis); a write outside the approved workspace or outside the allowed paths; a merge, a push or a publish; any change of worker, model, effort, mode, write permission, scope, delivery mode or skill hash after approval (existing re-approval rule of Gate 2 step 6, except a move along the approved chain); a violation found at Gate 5; a failed or stopped run; quota exhausted at the end of the chain; a conflict, cycle or missing skill; the approval of the table itself.

### 5. Closing the deferred minors that belong here

- Gate 1A: the question "another installed CLI?" is not asked after `setup` or `target:` (it is part of the intake only when no list was typed and the config has no usable row).
- The Gate 1 sentence "If it is missing, or the user says the setup changed, ask the user for each item" and the same sentence in the policy template header are replaced by a pointer to `setup`.

### 6. Documentation

`README.md` gets a short "Fewer questions" paragraph: what is asked once, what can be remembered, what is always asked, and how to forget a consent.

## Decisions made by the author (user may override)

- Standing consents are per machine, stored in `policy.md`, never per project (user's choice).
- The intake is shown once per topic and only for unanswered questions.
- Question 5 stores the kinds of ripple edit only; the files stay per task in the table.
- The table approval is not made automatic (approach B left for later).
- The list of things never stored is the one in section 4.
- The skill text names the moment of taking effect for Superpowers and a spec-driven workflow in general words, not by their internal step names.

Calls added after the builder check (author's calls, user may override):

- **The intake has two parts, each shown once per topic.** Part 1 (questions 1 to 3, about CLIs, probe consent and when to delegate) is asked when the command is typed, before the Gate 1 probes that it covers. Part 2 (questions 4 and 5, plus the reserved slot for batch 3) is asked once the task list exists, before `assignments.md` is built.
- **What question 2 covers.** Its consent covers the Gate 1B Hello test and capability probes and the Gate 1A host-probe question, for the CLIs named in the stored row. The Gate 1A "families" question is dropped (the config's verified rows are the default for question 1). In `setup` the same question is asked with the same "yes and remember" option, and the stored consent goes through the usual diff.
- **Ripple classes and the table.** The table still lists the four classes per task and its approval still confirms them (Gate 2 step 4 unchanged). A stored consent only removes the separate question: with it, the table shows the classes as already accepted; without it, question 5 is asked.
- **What a topic is.** The folder `<handoff-root>/YYYY-MM-DD-<topic>/` is the topic. The answers that are not remembered (questions 3, 4, 5 when not stored) are written in an `Intake` section of its `assignments.md`; a topic resumed in a new session reads them from there and does not ask again. Batch 3 may refine the notion for the `reset` guard.
- **Question 4 stores a choice, not a cost waiver.** "Yes and remember" and "no and remember" are both possible; a stored choice replaces the default; with nothing stored the default (yes) applies.
- **`target:` and `I installed:` with a consented CLI.** A named CLI that is in a consent row skips the Hello test (it goes to Gate 1A as in batch 1). A "no" at the intake for a CLI that is in a row applies to this run only and leaves the consent in place; the user withdraws it by saying "forget <consent>".

## Left to the builder

- Exact wording of the new sections, the intake wording and the README paragraph.
- Where in `SKILL.md` the intake sits (before Gate 2 step 1) and how Gate 1B step 2 and Gate 1A refer to the stored consents.
- The plan's order of tasks.

## Success checks

1. `SKILL.md` has a section "When this skill applies" covering: trigger, moment of effect, with a workflow, no workflow, typed late; it names no workflow's internal step.
2. The intake exists once; every row has a default and a "remember" mark as in section 2; a question already answered by the config, the typed command or the topic files is not asked (checked by scenario).
3. A stored consent is written only after "yes and remember" and a confirmed diff; a CLI outside a consent's list is asked; `reset` clears all consents (scenarios).
4. Every item of section 4 is still asked after a consent exists (scenario for each of: irreversible, write outside workspace, merge or push, a change after approval).
5. After `setup` or `target:`, no "another installed CLI?" question (scenario).
6. Hard rules unchanged except path names; no recorded machine value in tracked files (same searches as batch 1 pass).
7. Delegation never starts without `Status: approved` (scenario with a consent present).
