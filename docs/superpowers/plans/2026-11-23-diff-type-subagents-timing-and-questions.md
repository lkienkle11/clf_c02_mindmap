# diff-type-subagents: when it applies, and fewer questions (batch 2) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add to the `diff-type-subagents` skill a "When this skill applies" section, one two-part question list (the intake) with defaults, and standing consents that the user can have remembered on this machine.

**Architecture:** Two new sections in `SKILL.md` (moment of effect; questions and standing consents), a `## Standing consents` table in the policy template, small edits to Gate 1, 1A, 1B, 2 and the Red flags row that mention the questions being replaced, and one README paragraph. No change to Gates 4 to 6, `allocation.md`, `parallel-groups.md`, `running-workers.md`, `skill-delivery.md`, `worker-rules.md`.

**Tech Stack:** Markdown skill files, bash/grep for checks, read-only scenario runs by a host subagent, git.

**Spec:** `docs/superpowers/specs/2026-11-23-diff-type-subagents-timing-and-questions-design.md` (read it first; it is the source of every value below). Batch 1 is merged (PR #28); the skill is at `.claude/skills/diff-type-subagents/`.

## Global Constraints

- `SKILL=.claude/skills/diff-type-subagents`. Base commit for diffs: the commit of this branch before Task 1 (`git merge-base main HEAD`, call it `BASE`).
- Hard rules of `SKILL.md` unchanged except path names. `git diff -U0 $BASE -- $SKILL/SKILL.md` must remove no line inside `## Hard rules`.
- Skill text is English and vendor-neutral. `RECORDED='codex|agy|haiku|sonnet|gemini|gpt-[0-9]|opus|rtk|macOS|Darwin|/Users/'` matches nothing in any `.md` under `$SKILL`. `DATED='2026-1[0-9]-[0-9]{2}'` matches nothing in `$SKILL/references/templates` and `$SKILL/README.md`.
- Consents are stored per machine in the user's `policy.md`, section `## Standing consents`, table columns `Consent | Covers | Granted | Scope`; scope is always "this machine". A consent is stored only after "yes and remember" and a confirmed diff. A missing section means no consent.
- The intake has two parts, each shown once per topic, only for unanswered questions. Part 1 (questions 1 to 3) when the command is typed; part 2 (questions 4 and 5, plus the reserved slot for parallel and workspace questions of batch 3) once the task list exists, before `assignments.md` is built. Defaults: question 1 the verified rows of the config; 2 yes for the CLIs the user listed; 3 only at execution; 4 yes; 5 the four classes. Remembered: 2, 4, 5 only.
- Never stored, always asked: anything irreversible or touching real data; a write outside the approved workspace or allowed paths; a merge, push or publish; a change of worker, model, effort, mode, write permission, scope, delivery mode or skill hash after approval (except a move along the approved chain); a Gate 5 violation; a failed or stopped run; quota exhausted at the end of the chain; a conflict, cycle or missing skill; the approval of the table.
- The table approval of Gate 2 step 4 stays unchanged. Delegation never starts without `Status: approved`.
- The skill text names no internal step of any other workflow: `grep -iE 'brainstorming|writing-plans|executing-plans|subagent-driven' ` finds nothing in the new "When this skill applies" section.
- Every write to the config shows its diff first. Commit rules (project `CLAUDE.md`): title `type(scope): description`; body with `**Scope:**`, `**What did:**`, `**Reviewed:**`, `**Tested:**` in that order; no AI attribution or co-author trailer. The user has allowed commits on this branch for this plan.
- Worker models for scenario runs: Sonnet 5.5 Medium or Haiku 5.5 XHigh; never Opus.

## Review Focus

- A CLI added after a consent was stored is not covered by it and is asked about. Pinned by scenario S5.
- The user's existing `policy.md` has no `## Standing consents` section: no consent, no error; the first stored consent adds the section through a diff. Pinned by S5.
- A consent never skips the Gate 1A re-check (login, live model list); it only removes the question. Pinned by S7.
- A topic resumed in a new session, or an older topic whose `assignments.md` has no `Intake` section, asks only the unanswered questions and reads the rest from the file. Pinned by S3.
- "No" at the intake for a CLI that is in a consent row applies to this run only; withdrawing is "forget <consent>" with a diff. Pinned by S5.

---

### Task 1: Policy template: standing consents and a clean header

**Files:**
- Modify: `$SKILL/references/templates/policy.md`

**Interfaces:**
- Produces: the section heading `## Standing consents` with the table header `| Consent | Covers | Granted | Scope |` (no rows) and one sentence saying that rows are added only after "yes and remember" with a diff, that `reset` clears them, and that a missing section means no consent. Consumed by Task 3 wording and Task 4 README.

- [ ] **Step 1: Write the failing check**

```bash
T=.claude/skills/diff-type-subagents/references/templates/policy.md
grep -q '^## Standing consents' $T || echo "FAIL: no Standing consents section"
grep -q '^| Consent | Covers | Granted | Scope |' $T || echo "FAIL: no consent table header"
grep -q 'ask the user for each item, then write the answers here' $T && echo "FAIL: stale header sentence"
```

- [ ] **Step 2: Run it.** Expected: all three `FAIL` lines.

- [ ] **Step 3: Edit the template.** Add the section after `## Skill source roots` (before the closing `Items marked **[Proposed]**` line), with the table header and the sentence above. In the header paragraph, replace "If the config is missing, or the user says the setup changed, ask the user for each item, then write the answers here and show the diff before saving." with "If the config is missing, or the user says the setup changed, run `setup` (see `SKILL.md`)."

- [ ] **Step 4: Run the Step 1 block.** Expected: no output. Also run the `RECORDED` and `DATED` searches on `references/templates/`: no match.

- [ ] **Step 5: Commit** `feat(skill): add standing consents to the policy template`.

---

### Task 2: SKILL.md: "When this skill applies"

**Files:**
- Modify: `$SKILL/SKILL.md` (new section `## When this skill applies` between `## Where the config lives` and `## Hard rules`)

**Interfaces:**
- Consumes: nothing. Produces: the section whose first paragraph says the trigger (the command or a request to delegate), then bullets headed `Moment of effect`, `With a workflow`, `With no workflow`, `Typed late`, and the sentence that Gate 1 and `setup` may run at any earlier time.

- [ ] **Step 1: Write the failing check**

```bash
S=.claude/skills/diff-type-subagents/SKILL.md
grep -q '^## When this skill applies' $S || echo "FAIL: no section"
sec=$(sed -n '/^## When this skill applies/,/^## /p' $S)
for w in 'Moment of effect' 'With a workflow' 'With no workflow' 'Typed late' 'overlay'; do echo "$sec" | grep -qF "$w" || echo "FAIL: missing $w"; done
echo "$sec" | grep -iE 'brainstorming|writing-plans|executing-plans|subagent-driven' && echo "FAIL: names an internal step"
```

- [ ] **Step 2: Run it.** Expected: `FAIL: no section` and the five `missing` lines.

- [ ] **Step 3: Write the section** (about 25 lines) with exactly the content of spec section 1: trigger; moment of effect (the earliest moment a decision about who does a piece of work is about to be taken, not earlier; Gate 1 and `setup` may run earlier and need no task list); with a workflow (overlay, never replaces it or weakens its gates, each step is a Gate 3 point, natural moment is when the tasks are about to be executed, for example when the user chooses how to execute an approved plan, earlier only when the user asks to delegate earlier work); with no workflow (a request to delegate is a one-step workflow: intake, table, approval, run, review); typed late (takes effect from the current step, reads the files on disk, never asks what they answer); the skill describes no other workflow's internal steps.

- [ ] **Step 4: Run the Step 1 block.** Expected: no output.

- [ ] **Step 5: Run the hard-rule check** (`git diff -U0 $BASE -- $SKILL/SKILL.md` removes nothing in `## Hard rules`).

- [ ] **Step 6: Commit** `feat(skill): state when the skill applies`.

---

### Task 3: SKILL.md: the intake, standing consents, and the edits to Gates 1, 1A, 1B, 2

**Files:**
- Modify: `$SKILL/SKILL.md` (new section `## Questions and standing consents` after `## When this skill applies`; edits to Gate 1, Gate 1A, Gate 1B step 2, Gate 2 steps 1 and 3b, one Red flags row)

**Interfaces:**
- Consumes: the `## Standing consents` table of Task 1 (policy template).
- Produces: the section `## Questions and standing consents` with the subsections `The intake`, `Standing consents`, `Never stored`; an `Intake` section of `assignments.md` (written once the intake is answered; read on resume).

- [ ] **Step 1: Write the failing check**

```bash
S=.claude/skills/diff-type-subagents/SKILL.md
grep -q '^## Questions and standing consents' $S || echo "FAIL: no section"
for w in 'Standing consents' 'yes and remember' 'accept the defaults' 'forget' 'Intake' 'Never stored' 'this machine'; do grep -qF "$w" $S || echo "FAIL: missing $w"; done
grep -q 'show the user the families that the table contains' $S && echo "FAIL: Gate 1A families question still there"
grep -q 'ask the user for each item in it, write the answers there' $S && echo "FAIL: stale Gate 1 sentence"
grep -q 'the user chooses them when confirming the table' $S && echo "FAIL: Gate 2 3b not updated"
```

- [ ] **Step 2: Run it.** Expected: the `no section`, seven `missing`, and the three stale-sentence `FAIL` lines.

- [ ] **Step 3: Write `## Questions and standing consents`** (about 45 lines): the intake (two parts and the six questions with defaults and the "remember" marks, in a table as in the spec; only unanswered questions are shown; one reply "accept the defaults"; answers not remembered go to the `Intake` section of `assignments.md`, and a resumed topic reads them from there); standing consents (stored in the policy table, only after "yes and remember" and a confirmed diff; what each consent covers exactly; a CLI outside a row is asked about; "no" at the intake for a row CLI is for this run only; "forget <consent>" removes a row with a diff; `reset` clears all; a missing section is no consent; a consent never skips the Gate 1A re-check); never stored (the list of Global Constraints, verbatim in meaning).

- [ ] **Step 4: Edit the gates.**
  - Gate 1: replace the sentence "If it is missing, or the user says the setup changed, ask the user for each item in it, write the answers there, and show the diff before saving." with "If it is missing, or the user says the setup changed, run `setup`." Keep every other sentence of that paragraph.
  - Gate 1A: delete the "families question" from the first sentence's exception list (it keeps the one-time host-probe question, now covered by question 2 when a consent exists) and replace the final "show the user the families ... ask ONCE whether another installed CLI should be added" sentence with: the question "another installed CLI?" is intake question 1, asked only when no list was typed after `setup` or `target:` and the config has no usable verified row; otherwise it is not asked.
  - Gate 1B step 2: add that the Hello-test question is intake question 2 and is skipped for a CLI named in a stored consent.
  - Gate 2 step 1: add that the intake part 2 is answered before the table is built and its answers are written to the `Intake` section of `assignments.md`.
  - Gate 2 step 3b: replace "the user chooses them when confirming the table" with: the table lists them per task; with a stored consent they are shown as already accepted, otherwise intake question 5 asks; the approval of the table still confirms them.
  - Red flags row about "show its families and ask once": reword to match Gate 1A.

- [ ] **Step 5: Run the Step 1 block.** Expected: no output.

- [ ] **Step 6: Run the hard-rule check, the `RECORDED` search on `$SKILL`, and**

```bash
git diff -U0 $BASE -- $SKILL/SKILL.md | grep '^-' | grep -v '^---' | cut -c1-80
```

Expected removed lines: only the edited Gate 1, 1A, 1B, 2 and Red flags lines; none inside `## Hard rules`.

- [ ] **Step 7: Commit** `feat(skill): add the intake and standing consents`.

---

### Task 4: README: "Fewer questions"

**Files:**
- Modify: `$SKILL/README.md`

**Interfaces:**
- Consumes: the wording of Task 3.

- [ ] **Step 1: Write the failing check**

```bash
R=.claude/skills/diff-type-subagents/README.md
grep -q '^## Fewer questions' $R || echo "FAIL: no section"
for w in 'remember' 'forget' 'reset' 'always ask'; do grep -qiF "$w" $R || echo "FAIL: missing $w"; done
```

- [ ] **Step 2: Run it.** Expected: `FAIL: no section` and missing lines.

- [ ] **Step 3: Add `## Fewer questions`** (about 12 lines) before `## Safe by default`: what is asked once per topic; that answers marked "yes and remember" are saved on this machine only; what is always asked (a short list); how to forget a consent; that `reset` clears them. No rule text copied.

- [ ] **Step 4: Run the Step 1 block and the `DATED` and `RECORDED` searches on the README.** Expected: no output.

- [ ] **Step 5: Commit** `docs(skill): describe fewer questions in the README`.

---

### Task 5: Verify with scenarios, then review the branch

**Files:**
- Create (git-ignored, not committed): `.superpowers/diff-agents/2026-11-23-batch2-scenarios/results.md`

- [ ] **Step 1: Static checks.** `RECORDED` and `DATED` searches clean; hard-rule check; the new sections exist; template headings still match `models-and-commands.md`.

- [ ] **Step 2: Write eight scenario prompts** for a fresh read-only worker (Sonnet 5.5 Medium or Haiku 5.5 XHigh, never Opus) that reads only the skill folder and answers "what exactly do you do, in order, what do you ask, when do you stop", quoting the line that tells it, and writing NOT STATED when the rules do not say. Situations and the points each answer must contain:
  - **S1** the user is in a Superpowers-style workflow and has just approved a plan: when the skill takes effect, that it is an overlay, that it names no internal step.
  - **S2** no workflow at all, the user asks "have opencode do this refactor": one-step workflow, intake, table, approval.
  - **S3** typed late: spec, plan and a ledger exist on disk, and an `assignments.md` with an `Intake` section answering questions 4 and 5 but not 2: asks only question 2 (and not 4 and 5), never re-asks what the files answer; and the older-topic case with no `Intake` section: asks only the unanswered.
  - **S4** first intake, no stored consent: two parts, defaults shown, "accept the defaults" answers all, questions already answered by the config or the typed command are not shown.
  - **S5** the user answers "yes and remember" to question 2 for cli-a: a diff is shown and confirmed before the row is written; a later session names cli-b: asked again; `policy.md` has no `Standing consents` section: no error, section added through a diff; the user says "no" for cli-a at one intake: this run only; "forget" removes the row with a diff; `reset` clears all.
  - **S6** a consent exists for each of questions 2, 4 and 5; the worker meets, in turn, an irreversible operation, a write outside the workspace, a merge, and a change of worker after approval: each is still asked.
  - **S7** after `setup`, and after `target: cli-a` with cli-a in a consent row: no "another installed CLI?" question, no Hello test for cli-a, but the Gate 1A re-check (login, live model list) still runs.
  - **S8** a consent exists and `assignments.md` has `Status: draft`: no delegation starts before the table is approved.

- [ ] **Step 3: Run the scenarios** (one worker each, read-only, in parallel; the orchestrator reads each answer against its points). A missing point is a defect in the skill text: fix `SKILL.md` or the README, rerun that scenario only. Record the outcome of every scenario in `results.md`. All eight must pass.

- [ ] **Step 4: Commit** any text fixes from Step 3 as `fix(skill): close gaps found by the batch 2 scenarios` (skip if none).

- [ ] **Step 5: Whole-branch review** by one fresh reviewer (not the author; never Opus) with the spec, this plan and the diff `main..HEAD`; re-grade findings by effect; fix Critical and Important ones with a failing check first, in one pass; record Minor ones as deferred. Then follow the finishing steps with the user.
