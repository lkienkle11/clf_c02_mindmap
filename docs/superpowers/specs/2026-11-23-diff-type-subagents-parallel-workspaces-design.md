# diff-type-subagents: two-level parallel work, workspaces and wrap-up (batch 3 of 3)

Date: 2026-11-23. Status: draft, waiting for the user's approval.
Skill under change: `.claude/skills/diff-type-subagents/` (tracked in this repository).
Follows batch 1 (setup, reset, `target:`, per-user config; PR #28) and batch 2 (when the skill applies, the intake, standing consents; PR #29).

## Intent and why

The skill already groups tasks that may run at the same time (`references/parallel-groups.md`), but only one level deep: every task that writes at the same time needs a separate working folder, the skill never says who creates it, in which branch, how the results come back, or who removes it, and it forbids two writers in one folder. The user wants a bigger split: several workspaces, one per set of tasks that do not touch each other, and inside each workspace more than one task running together, finished with a clean merge and a clean-up that never removes anything without asking.

## Goals

1. **Workspaces from the conflict graph.** Tasks are divided into workspaces mechanically: the connected parts of the existing file-conflict graph. Tasks in different parts cannot conflict, so their workspaces can merge without conflicts by construction.
2. **Parallel tasks inside a workspace, rule (c).** Inside a workspace the existing group rule gives the rounds. A round with two or more writing tasks gives each of them its own task folder, made from the workspace and merged back into it when the round is reviewed. A round with one task runs in the workspace folder.
3. **Who owns what.** The workflow in use owns the base workspace (the branch or worktree it created with the user's permission). This skill owns only the workspace and task folders it creates, and records every one of them.
4. **Questions at the intake** for parallel work and workspaces, in the slot batch 2 reserved (question 6).
5. **Merge and wrap-up.** Task folders merge into their workspace, workspaces merge into the base, a conflict stops and asks. At the end, one question about clean-up, default keep, only what the skill created.
6. **`reset` guard.** `reset` stops when any topic of the handoff root has a pending or running run, or a recorded entry in state `planned`, `created`, `committed`, `merged` (not yet asked about) or `stopped`; entries `kept (user decision)` and `cleaned` do not block it.

## Non-goals

- Automatic approval of the assignment table; changes to `allocation.md`, `skill-delivery.md`, `worker-rules.md`; the merge of the base into the main branch, a push or a publish (those stay with the workflow and the user).
- Sharing build caches between folders (left out; see Anti-goals for the cost bound).

## Anti-goals (a failure even if it works)

- Two writers in one folder at the same time.
- A worker running a git command (WORKER RULES stay as they are: the orchestrator creates, commits, merges and removes).
- Removing a branch or folder the skill did not create, one holding unmerged work, or any without the user's answer.
- Creating a branch or worktree without the user's permission (project rule).
- A full build or test of the whole application inside a task folder; heavy checks run once, in the workspace folder, after a round is merged.

## Constraints

- Skill text English and vendor-neutral. Hard rules of `SKILL.md` unchanged except path names and the one sentence changed in "Never stored" below (the hard-rules block stays byte-identical).
- `Parallel limit` of the policy counts ALL active runs across all workspaces, and the quota thresholds bound it further; workspaces do not raise it. The user may raise the limit (cost: quota).
- Every write to the config shows a diff first (existing rule).
- Project commit rules; the orchestrator commits a worker's uncommitted changes in a task folder to that folder's branch.

## Approaches considered

| | Tasks that run together in a workspace | Trade-off |
|---|---|---|
| A | Every task always gets its own folder | Simple, one rule; most folders and merges even for tasks that run alone |
| B | All write in one shared folder | No extra folders, but a task can read another's half-written file, and nothing separates two tasks that touch the same file |
| C | A task gets its own folder only when it runs together with another writing task | Same safety as A where it matters; lower peak disk (at most `Parallel limit` task folders alive at once); one more rule (the folder decision is made when the table is built) |

The user picked **C** on 2026-11-23. Measured on this repository: a task folder costs about 12 MB of tracked files (the `.git` store is shared); untracked trees (`node_modules` about 170 MB, the Rust `target` about 6 GB) are not copied, which is why heavy builds are not run in task folders.

## Design

### 1. Workspaces and rounds

- **Workspace = connected part of the conflict graph** built by Gate 2 step 3f (edges (a) to (f) of `parallel-groups.md`). Two tasks are in the same workspace when a path of edges joins them; tasks with no path are in different workspaces. A part with one task is a workspace of one.
- **Rounds inside a workspace** are the existing groups `G1`, `G2` and so on, computed on that part only. The existing group rule, the split evaluation and the `Parallel limit` apply unchanged.
- **Folder decision, made when the table is built and fixed at approval:** a round with two or more tasks that write gives each its own task folder; a round with one task, or with only read-only tasks, uses the workspace folder (read-only tasks keep the existing rules: their own copy of the committed state, or a later round, edge (f)). A change of this decision after approval is a change of scope and needs approval again (Gate 2 step 6).
- **Across workspaces** everything may run at the same time up to `Parallel limit`; workspace A's rounds do not wait for workspace B.

### 2. Names and places

- Base workspace: the one the workflow created. If there is none and the skill needs write isolation, it asks (question 6c) before creating anything.
- Workspace folder and branch: `<handoff-root>/worktrees/<topic>/<workspace>/`, branch `diff-agents/<topic>/<workspace>`, made from the base.
- Task folder and branch: a task folder is never inside the workspace folder (that would put one working tree inside another). It sits beside it: `<handoff-root>/worktrees/<topic>/<workspace>--<task-id>/`, branch `diff-agents/<topic>/<workspace>--<task-id>`, made from the workspace branch. (Branch names never nest one inside another: git cannot hold a branch `a/b` and a branch `a/b/c` together.)
- The handoff root is git-ignored (existing rule), and these folders stay clear of the `.worktrees/` and `worktrees/` locations the workflow's own clean-up looks at.
- Every folder and branch is recorded in a `Workspaces` section of `assignments.md` as `planned` when the table is approved (together with the per-round folder decision of section 1), and its state is updated at every step: `planned`, `created`, `committed`, `merged`, `stopped (<reason>)`, `kept (user decision)`, `cleaned`. An entry is written before the folder is created, so a folder is never unrecorded; a new orchestrator session resumes from these states.

### 3. Intake question 6 (slot reserved by batch 2; part 2 of the intake)

| # | Question | Default | Can be remembered |
|---|---|---|---|
| 6a | Run tasks in parallel, up to the `Parallel limit` (shown with its value) | yes when the conflict graph gives more than one task in some round or workspace | no |
| 6b | May the skill create the workspace and task folders and branches under the handoff root for this topic, and merge the task branches back into the topic's own branches as they finish | no, and nothing is created until yes | no (the project requires permission each time) |
| 6c | Only if no base workspace exists: work on the current branch, or in an isolated workspace | isolated | no |

An answer "no" to 6a or 6b gives one workspace folder and all tasks in order, as today. The table of Gate 2 shows the `Workspaces` section next to `Parallel groups`; approving the table approves both.

### 4. Merge

- After a round is done and reviewed (Gate 6 step 1), the orchestrator commits each task folder's changes to its branch and merges the task branches into the workspace branch, one by one in table order. After the last round of a workspace and its review, the workspace branch is merged into the base branch.
- Heavy checks (the project's build or full test) run once in the workspace folder after each round's merge, not in task folders.
- A merge conflict, a failed check after a merge, or a branch that does not merge cleanly stops that workspace, tells the user, and changes nothing else; other workspaces may continue.
- The merge of the base into the main branch, a push and a publish stay with the workflow and the user.

### 4b. Git mechanics (order, precondition, merge kind)

- **Precondition.** Before any workspace is cut, the base workspace is clean and everything the workers need is committed (the spec and plan included); if it is not, the skill stops and asks the user to commit or stash. Workers read inputs that are not committed (briefs, results, skills) by absolute path, as briefs already do.
- **Order for a round**, per run: the Gate 5 check against the run's own baseline, then the orchestrator commits that folder's changes to that folder's branch (a round that ran in the workspace folder commits to the workspace branch, and that commit comes before any task folder of the next round is cut), then the review (Gate 6 step 1) of the branch, then the merges of the task branches into the workspace branch in table order, then the heavy checks in the workspace folder, then the next round is cut from the updated workspace branch. The workspace branch is merged into the base from inside the base folder, which must be clean and idle at that moment; a base that moved since the cut is a normal non-fast-forward merge, and a conflict stops and asks.
- **Merge kind.** Real merge commits only (no squash and no rebase), so that `git branch -d` works and no force flag is needed.
- **Read-only runs.** With 6b yes, a read-only run in a round with writers gets its own folder: a detached copy of the committed state of the workspace branch, recorded and cleaned like the others (the "has its own folder" default of edge (f) holds). The workspace folder is therefore idle when the heavy checks run. Groups and the split evaluation are computed per workspace.
- **Worker inputs.** Briefs and skill delivery use absolute paths, which a task folder does not change. A skill copy placed in a worker's working folder by the `workspace-copy` mode is never committed (the orchestrator excludes it before the commit; how is left to the builder). Tracked deliverables are written inside the task folder and travel with its branch.
- **Which merges 6b covers.** Task branch into workspace branch, workspace branch into the base, when the base is not the repository's default branch. A merge into the default branch, or into a branch the skill cannot tell is private, is never stored and always asked.

### 5. Wrap-up and clean-up

When every workspace is merged and the final review (Gate 6 step 1a) is recorded, the orchestrator asks one question: remove the folders and branches the skill created? The question lists each one with its state (merged and clean, or not). Default: keep. Nothing that holds unmerged work or uncommitted changes is offered for removal; it is only reported. Only entries in the `Workspaces` section of `assignments.md` are eligible; the base workspace and anything the workflow created are never touched. A failed, paused or violating run keeps its folder and is not cleaned. Removal runs from outside the folder and updates the state in `assignments.md`. Never `git worktree remove --force` and never `git branch -D`. A folder that holds only ignored files (build output) is offered as removable with its file count shown; after the user's yes the skill empties it with `git clean -fdX` inside that folder and then removes it; any other untracked or uncommitted file makes the folder "not clean": reported, never offered. Once the user has answered the question, every entry that was kept settles as `kept (user decision)`.

### 6. Changes to existing text

- `SKILL.md` "Never stored": "a merge, a push or a publish" becomes "a merge outside the topic's own branches, a push or a publish". The hard-rules block is not changed.
- Gate 2 step 5 (working folders) and Gate 4 step 7 (launch) are rewritten to use the workspace and folder model above; the sentence of Gate 2 step 5 about "separate worktrees or clones that the user allowed" now points to question 6b.
- `parallel-groups.md` gains the workspace rule and the round-to-folder rule; its group rules are unchanged.
- `reset` (batch 1): the guard now reads "stop when any topic of the handoff root has a pending or running run, or a recorded entry that is not settled (see Goal 6)".
- README: a short "Parallel work" paragraph.

## Decisions made by the author (user may override)

- Workspaces are the connected parts of the conflict graph, not groups the user names.
- Folders live under `<handoff-root>/worktrees/` with the names above, so the workflow's clean-up never sees them.
- Question 6b is never remembered (project rule: permission each time) and also covers merging task branches into the topic's own branches; merges outside those stay never-stored.
- Heavy checks run once per round in the workspace folder; task folders get light, per-file checks only.
- The `reset` guard scans every topic folder of the handoff root.
- The user's `Parallel limit` is shown at question 6a and may be raised there; it is not changed by the skill.

Calls added after the builder check (author's calls, user may override):

- Branch names never nest (`diff-agents/<topic>/<workspace>` and `diff-agents/<topic>/<workspace>--<task-id>`).
- A clean, committed base is a precondition; the skill stops and asks otherwise.
- Real merge commits only; ignored build output is removed only after the user's yes, by `git clean -fdX` in that folder, never by a force flag on `worktree remove` or `branch`.
- `kept (user decision)` and `cleaned` settle an entry for the `reset` guard.
- The state list in section 2 is written before creation (`planned`), so a lost context can resume.
- A read-only run in a round with writers gets its own detached copy.
- Question 6b covers merges into the topic's own branches and into a base that is not the default branch.

## Left to the builder

- Exact wording of the sections and the README paragraph; the commit and merge command details (merge or squash, message text per the project rules); how a task folder is made read-only for a read-only task; the plan's order of tasks.

## Success checks

1. A task list with two independent parts gives two workspaces; a task that depends on another is in the same workspace (scenario, with the conflict edges written out).
2. A round with two writers gives two task folders; a round with one writer gives none (scenario); the decision is in the approved table and a later change needs re-approval.
3. The number of active runs never exceeds `Parallel limit` across workspaces (scenario with 3 workspaces and limit 3).
4. No folder, branch or merge is made before question 6b is answered yes (scenario); a "no" gives today's one-folder sequence.
5. A merge conflict stops only its workspace and asks; a workspace that fails does not stop the others.
6. The clean-up question lists each created folder with its state, defaults to keep, never lists unmerged or dirty ones as removable, never touches the base workspace or a workflow-created one, never uses force (scenarios).
7. `reset` stops for a running run in any topic and for an uncleaned recorded folder (scenario).
8. No two branch names nest; the order of a round is check, commit, review, merge, heavy checks, next round (scenario); a dirty base stops before any workspace is cut; `kept (user decision)` does not block `reset`, `stopped` does (scenarios).
9. The hard-rules block of `SKILL.md` is byte-identical to the base; no recorded machine value in tracked files (same searches as batches 1 and 2).
