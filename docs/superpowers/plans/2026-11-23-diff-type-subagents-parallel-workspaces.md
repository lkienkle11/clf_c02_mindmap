# diff-type-subagents: two-level parallel work, workspaces and wrap-up (batch 3) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let the `diff-type-subagents` skill split tasks into workspaces (connected parts of the file-conflict graph), run writing tasks of a round in their own task folders when they run together, merge everything back, and clean up only what it created after asking.

**Architecture:** A new section `## Workspaces, merge and wrap-up` in `SKILL.md` holds the model (ownership, names, states, git mechanics, wrap-up). `references/parallel-groups.md` gains the workspace and folder rules. Intake question 6 (reserved by batch 2) becomes 6a to 6c. Gate 2 steps 1, 4 and 5, Gate 4 step 7, the "Never stored" sentence and the `reset` guard are edited to match. README gains a paragraph. Hard rules, `allocation.md`, `skill-delivery.md` and `worker-rules.md` are not changed.

**Tech Stack:** Markdown skill files, bash/grep for checks, read-only scenario runs by a host subagent, git.

**Spec:** `docs/superpowers/specs/2026-11-23-diff-type-subagents-parallel-workspaces-design.md` (read it first; it is the source of every value below). Batches 1 and 2 are merged (PR #28, #29).

## Global Constraints

- `SKILL=.claude/skills/diff-type-subagents`; `BASE=$(git merge-base main HEAD)`.
- The block between `## Hard rules` and `## The gates` of `SKILL.md` is byte-identical to the base: `diff <(git show $BASE:$SKILL/SKILL.md | sed -n '/^## Hard rules/,/^## The gates/p') <(sed -n '/^## Hard rules/,/^## The gates/p' $SKILL/SKILL.md)` prints nothing.
- Skill text is English and vendor-neutral. `RECORDED='codex|agy|haiku|sonnet|gemini|gpt-[0-9]|opus|rtk|macOS|Darwin|/Users/'` matches nothing in any `.md` under `$SKILL`; `DATED='2026-1[0-9]-[0-9]{2}'` matches nothing in `$SKILL/references/templates` and `$SKILL/README.md`.
- Workspace = connected part of the conflict graph of `references/parallel-groups.md` (edges (a) to (f)); rounds = the existing groups computed per workspace. Folder decision (a round with two or more writing tasks gives each its own task folder; a round with one task, or only read-only tasks, uses the workspace folder; a read-only run in a round with writers gets its own detached copy) is made when the table is built, fixed at approval, and a later change needs approval again (Gate 2 step 6).
- Names: workspace folder `<handoff-root>/worktrees/<topic>/<workspace>/`, branch `diff-agents/<topic>/<workspace>`; task folder `<handoff-root>/worktrees/<topic>/<workspace>--<task-id>/`, branch `diff-agents/<topic>/<workspace>--<task-id>`. No branch name nests inside another.
- States of an entry in the `Workspaces` section of `assignments.md`: `planned` (written when the table is approved, before creation), `created`, `committed`, `merged`, `stopped (<reason>)`, `kept (user decision)`, `cleaned`.
- Question 6: 6a parallel work up to `Parallel limit` (default yes when the graph allows it; not remembered); 6b may the skill create the workspace and task folders and branches under the handoff root for this topic and merge task branches into the topic's own branches as they finish (default no; never remembered); 6c only when no base workspace exists: current branch or isolated (default isolated). "No" to 6a or 6b = one workspace folder, tasks in order, as today.
- Merge: precondition a clean, committed base (else stop and ask). Round order: Gate 5 check, commit by the orchestrator, review, merge task branches into the workspace branch in table order, heavy checks once in the workspace folder, next round cut from the updated workspace branch. Workspace branch into base from inside the clean, idle base folder. Real merge commits only (no squash, no rebase). A conflict or a failed check after a merge stops that workspace and asks; other workspaces continue. 6b covers merges into the topic's own branches and into a base that is not the repository's default branch; a merge into the default branch or an unknown-privacy branch is never stored and always asked.
- Wrap-up: one question after the final review, default keep, only entries of `Workspaces`, never the base or a workflow-created workspace, never `git worktree remove --force` or `git branch -D`; a folder with only ignored files is offered with its file count and, after yes, emptied by `git clean -fdX` in that folder then removed; any other untracked or uncommitted file = "not clean": reported, never offered; kept entries settle as `kept (user decision)`.
- `reset` guard: stop when any topic of the handoff root has a pending or running run, or an entry in state `planned`, `created`, `committed`, `merged` (not yet asked about) or `stopped`; `kept (user decision)` and `cleaned` do not block.
- `Parallel limit` counts all active runs across all workspaces; workspaces never raise it.
- Every write to the config shows a diff first. Commit rules (project `CLAUDE.md`): title `type(scope): description`; body `**Scope:**`, `**What did:**`, `**Reviewed:**`, `**Tested:**` in that order; no AI attribution. The user has allowed the plan's commits.
- Worker models for scenario runs: Sonnet 5.5 Medium or Haiku 5.5 XHigh; never Opus.

## Review Focus

- The base workspace has uncommitted or untracked files (this repository often does): the skill stops before any workspace is cut and asks. Pinned by scenario S4.
- A branch name that nests inside another (`a/b` and `a/b/c`): never produced. Pinned by S8.
- A folder that holds only ignored build output versus one with other untracked files: the first is offered with a count and emptied only after yes; the second is only reported. Pinned by S6.
- The orchestrator loses its context in the middle of a round: the `Workspaces` states let a new session resume, and no folder exists without an entry. Pinned by S8.
- Three workspaces with two writers each and `Parallel limit` 3: never more than 3 active runs. Pinned by S3.

---

### Task 1: parallel-groups.md: workspaces and folders

**Files:**
- Modify: `$SKILL/references/parallel-groups.md`

**Interfaces:**
- Produces: a section `## Workspaces and folders` after `## Groups`, with the bullets `Workspace`, `Rounds`, `Folder decision`, `Read-only runs`, `Split evaluation`, `Limit`. Consumed by Tasks 2 and 3.

- [ ] **Step 1: Write the failing check**

```bash
F=.claude/skills/diff-type-subagents/references/parallel-groups.md
grep -q '^## Workspaces and folders' $F || echo "FAIL: no section"
for w in 'connected part' 'per workspace' 'fixed at approval' 'across all workspaces' 'detached copy'; do grep -qF "$w" $F || echo "FAIL: missing $w"; done
grep -q 'only in separate worktrees (each its own working folder) or clones that the user allowed; without them' $F && echo "FAIL: old write-members sentence"
```

- [ ] **Step 2: Run it.** Expected: `FAIL: no section`, five missing, and the old-sentence failure.

- [ ] **Step 3: Add the section** (about 14 lines) with the contents of spec section 1 and the read-only and split rules of section 4b. Replace the sentence in `## Groups` "Write members of one group run at the same time only in separate worktrees ... run one after the other in group order" by: write members of a round run at the same time only in the task folders the approved table names (see `Workspaces, merge and wrap-up` in `SKILL.md`); without intake question 6b answered yes they run one after the other in group order. In `## Limits`, change the first bullet to say the limit counts all active runs across all workspaces. In `## Record`, add that the `Workspaces` section of `assignments.md` is written with the groups and approved with them.

- [ ] **Step 4: Run the Step 1 block.** Expected: no output. Run the `RECORDED` search on the file: no match.

- [ ] **Step 5: Commit** `feat(skill): add workspaces and folders to parallel groups`.

---

### Task 2: SKILL.md: the workspaces section, question 6, never stored, reset

**Files:**
- Modify: `$SKILL/SKILL.md` (new section `## Workspaces, merge and wrap-up` between `## Questions and standing consents` and `## Hard rules`; intake row 6; the `Never stored` sentence; the `reset` row of How to use)

**Interfaces:**
- Consumes: Task 1's section names.
- Produces: the section with the subsections `Ownership and names`, `States`, `Merge`, `Wrap-up`, `Reset guard`, used by Task 3's edits.

- [ ] **Step 1: Write the failing check**

```bash
S=.claude/skills/diff-type-subagents/SKILL.md
grep -q '^## Workspaces, merge and wrap-up' $S || echo "FAIL: no section"
for w in 'diff-agents/<topic>/<workspace>--<task-id>' 'kept (user decision)' 'git clean -fdX' 'real merge commits' 'planned' 'stopped' '6b' '6c'; do grep -qF -- "$w" $S || echo "FAIL: missing $w"; done
grep -q '^| 6 | 2 | Reserved' $S && echo "FAIL: question 6 still reserved"
grep -q 'a merge, a push or a publish;' $S && echo "FAIL: never-stored sentence not changed"
grep -q 'If a run of the current topic is still' $S && echo "FAIL: old reset guard"
```

- [ ] **Step 2: Run it.** Expected: `no section`, eight missing, and the three stale failures.

- [ ] **Step 3: Write the section** (about 55 lines) from spec sections 2, 4, 4b and 5: ownership (the workflow owns the base workspace; the skill owns only what it creates and records); names and branches; the state list and the rule that an entry is written as `planned` at approval and before creation; the merge precondition, round order, merge kind, conflict rule and what question 6b covers; the wrap-up question and what it lists, offers, never touches and how it removes (no force flags); the reset guard. Replace the intake row 6 by three rows 6a, 6b, 6c exactly as in Global Constraints (all part 2, none remembered). Change "a merge, a push or a publish" in `Never stored` to "a merge outside the topic's own branches, a push or a publish". Replace the guard sentence of the `reset` row by the guard of Global Constraints.

- [ ] **Step 4: Run the Step 1 block.** Expected: no output.

- [ ] **Step 5: Run the hard-rules diff of Global Constraints and the `RECORDED` search.** Expected: no output, no match.

- [ ] **Step 6: Commit** `feat(skill): add workspaces, merge and wrap-up`.

---

### Task 3: SKILL.md: gates edited to use the workspace model

**Files:**
- Modify: `$SKILL/SKILL.md` (Gate 2 steps 1, 4, 5; Gate 4 step 7; Gate 6 step 1)

**Interfaces:**
- Consumes: the section of Task 2.

- [ ] **Step 1: Write the failing check**

```bash
S=.claude/skills/diff-type-subagents/SKILL.md
grep -q 'ask the user whether it writes on the current branch or in an isolated worktree. Never assume.' $S && echo "FAIL: old Gate 2 step 5 question"
grep -q 'write members only in separate worktrees (each its own working folder) or clones that the user allowed, otherwise one after another in group order' $S && echo "FAIL: old Gate 4 step 7 text"
grep -qF 'the `Workspaces` section' $S || echo "FAIL: Workspaces section not in Gate 2"
grep -qF 'created from its `planned` entry before launch' $S || echo "FAIL: launch rule"
grep -qF 'merged as the Workspaces section says' $S || echo "FAIL: Gate 6 merge rule"
```

- [ ] **Step 2: Run it.** Expected: the two old-text failures and three missing lines.

- [ ] **Step 3: Edit the gates.**
  - Gate 2 step 1: add `Workspaces` to the list of sections of `assignments.md` (path, branch, parent, state, per-round folder decision).
  - Gate 2 step 4: the table is shown "with the `Delivery table`, the `Parallel groups` section and the `Workspaces` section"; approving it approves the workspaces and the folder decisions.
  - Gate 2 step 5: replace the sentence from "If any worker needs write access, ask ..." to "... a branch alone does not give a second working folder." by a pointer to questions 6a to 6c of the intake and to the `Workspaces, merge and wrap-up` section; keep the rest of the step (the working folder of every concurrent run is named in the table cell).
  - Gate 4 step 7: replace "write members only in separate worktrees (each its own working folder) or clones that the user allowed, otherwise one after another in group order" by: write members run in the folders the approved table names, each created from its `planned` entry before launch (state `created`); without question 6b yes they run one after another.
  - Gate 6 step 1: add that after a round's review its task branches are merged as the Workspaces section says, and that a stop of one workspace does not stop the others.

- [ ] **Step 4: Run the Step 1 block.** Expected: no output.

- [ ] **Step 5: Run the hard-rules diff and the `RECORDED` search.** Expected: nothing. List the removed lines: `git diff -U0 $BASE -- $SKILL/SKILL.md | grep '^-' | grep -v '^---' | cut -c1-70`; each must be an edited gate line, a table row, or a sentence named above.

- [ ] **Step 6: Commit** `feat(skill): use workspaces in the gates`.

---

### Task 4: README: "Parallel work"

**Files:**
- Modify: `$SKILL/README.md`

- [ ] **Step 1: Write the failing check**

```bash
R=.claude/skills/diff-type-subagents/README.md
grep -q '^## Parallel work' $R || echo "FAIL: no section"
for w in 'workspace' 'asks you' 'keeps' 'Parallel limit'; do grep -qiF "$w" $R || echo "FAIL: missing $w"; done
```

- [ ] **Step 2: Run it.** Expected: `no section` and missing lines.

- [ ] **Step 3: Add `## Parallel work`** (about 12 lines) before `## Safe by default`: tasks that cannot touch each other are split into workspaces; inside a workspace, tasks that run together get their own folder; the number of runs at once is capped by `Parallel limit` (and your quota); the skill asks before creating any folder or branch (every time) and again at the end before removing anything, and keeps by default; what the skill never removes. No rule text copied.

- [ ] **Step 4: Run the Step 1 block, then the `DATED` and `RECORDED` searches on the README.** Expected: no output.

- [ ] **Step 5: Commit** `docs(skill): describe parallel work in the README`.

---

### Task 5: Verify with scenarios, then review the branch

**Files:**
- Create (git-ignored, not committed): `.superpowers/diff-agents/2026-11-23-batch3-scenarios/results.md`

- [ ] **Step 1: Static checks.** Hard-rules diff, `RECORDED` and `DATED` searches, the new sections exist, template headings match `models-and-commands.md`.

- [ ] **Step 2: Write nine scenario prompts** for a fresh read-only worker (Sonnet 5.5 Medium or Haiku 5.5 XHigh, never Opus) that reads only the skill folder and answers, quoting the line that tells it and writing NOT STATED when the rules do not say. Situations and the points each answer must contain:
  - **S1** six tasks: T1 writes `a.ts`; T2 writes `b.ts` and depends on T1's output; T3 writes `c.ts`; T4 writes `d.ts`, reads `c.ts`; T5 writes `e.ts`; T6 writes `e.ts`. Expect three workspaces (`{T1,T2}`, `{T3,T4}`, `{T5,T6}`), derived from the conflict edges.
  - **S2** inside one workspace round 1 has two tasks that write different files and round 2 has one: round 1 gives each its own task folder, round 2 uses the workspace folder; the decision is in the approved table; changing it later needs approval again.
  - **S3** three workspaces with two writers each, `Parallel limit` 3: never more than 3 active runs in total; rounds of different workspaces do not wait for each other.
  - **S4** question 6b answered no: nothing is created, tasks run in order in one folder. Second case: 6b yes but the base has uncommitted files: stop before any workspace is cut and ask.
  - **S5** a merge conflict in one workspace and a failed check after a merge in another: each stops only its workspace and asks; the others continue.
  - **S6** wrap-up: three entries (merged and clean; merged with only ignored build output; holding uncommitted files) plus the base workspace: the question lists each with its state, defaults to keep, offers the first two (the second with a file count and `git clean -fdX` after yes), only reports the third, never touches the base, never uses force.
  - **S7** `reset` typed with: a running run in another topic (stop); an entry `kept (user decision)` only (does not block); an entry `stopped` (blocks).
  - **S8** the order of a round (check, commit, review, merge, heavy checks, next round) and the branch names (no name nests inside another); an orchestrator that lost its context in the middle of a round resumes from the `Workspaces` states and finds no unrecorded folder.
  - **S9** a read-only run in a round with two writers gets its own detached copy, and the heavy checks run in the idle workspace folder after the merge.

- [ ] **Step 3: Run the scenarios** (one worker each, read-only, in parallel; read each answer against its points). A missing point is a defect in the skill text: fix `SKILL.md`, the README or `parallel-groups.md`, rerun that scenario only. Record every outcome in `results.md`. All nine must pass.

- [ ] **Step 4: Commit** any text fixes as `fix(skill): close gaps found by the batch 3 scenarios` (skip if none).

- [ ] **Step 5: Whole-branch review** by one fresh reviewer (not the author; never Opus) with the spec, this plan and the diff `main..HEAD`; re-grade findings by effect; fix Critical and Important ones with a failing check first, in one pass; record Minor ones as deferred. Then follow the finishing steps with the user.
