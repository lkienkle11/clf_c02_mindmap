# diff-type-subagents Portability Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the `diff-type-subagents` skill usable by an orchestrator of any vendor and any worker, by adding skill-root resolution, probed skill delivery with proof of reading, a written task-allocation algorithm, and recovery from files.

**Architecture:** Edit the skill in place. `SKILL.md` gets short steps at Gates 1B, 2, 4, 5, 6 and new red-flag rows. Long procedures go into two new reference files, `references/skill-delivery.md` and `references/allocation.md`. Machine and user settings go into `policy.md` and the models table. The skill's files are Markdown, so the "tests" are real scenario runs with exact expected results, written down before each edit (RED) and repeated after it (GREEN), as `writing-skills` requires.

**Tech Stack:** Markdown skill files; shell commands with the `rtk` prefix; throwaway fixture skills; Codex CLI and Agy CLI and the host's subagent tool for scenario runs; `shasum` for hashes.

**Spec:** `easy_mindmap_knowledge/docs/superpowers/specs/2026-11-19-diff-type-subagents-portability-design.md` (approved 2026-11-19). Read it with this plan. Section numbers below refer to it.

## Global Constraints

- Work only in the files listed per task under `.claude/skills/diff-type-subagents/`; no other skill is changed (spec section 9). `select-skills-usp` is not touched.
- Rules in `SKILL.md` and the new references name no vendor; vendor facts appear only in `policy.md` and the models table, each with a date and a verified/[Unverified] mark (G1).
- Never Opus as a worker or scenario runner; use Sonnet 5.5 Medium (heavy) or Haiku 5.5 XHigh (medium) for subagent scenario runs (D9, user memory).
- Shell commands carry the `rtk` prefix. Codex commands close stdin with `</dev/null`. No bypass flags.
- Commit message: `type(scope): description`, then four sections in this order, **Scope:**, **What did:**, **Reviewed:**, **Tested:**. Never an AI attribution or co-author line (project CLAUDE.md overrides the harness reminder). Commit steps run only after the user's go-ahead at execution time.
- Scenario fixtures and run logs live under `.superpowers/diff-agents/2026-11-19-portability/` (git-ignored). Do not put machine paths in tracked files.
- Anything not verified is written **[Unverified]** with the date.
- No branch or commit is created without the user's permission (Task 0).

## Review Focus

Failure modes the spec implies that no earlier task's tests would catch. Each has a test in the task named.

1. A skill folder whose path has a space or a non-ASCII character resolves correctly (Task 2).
2. A dangling or looping symlink in a root stops with a message instead of hanging or picking a wrong skill (Task 2).
3. `SKILL.md` links a file that does not exist: the resolution reports it and does not hash a partial set silently (Task 2).
4. `policy.md` has no "Skill source roots" section (first run on a new machine): the orchestrator asks the user, it does not guess (Task 2).
5. A context compaction or a closed session happens while `assignments.md` is still a draft: a draft is never treated as approved (Task 6).

---

### Task 0: Isolated branch (needs the user's permission)

**Files:** none changed.

- [ ] **Step 1:** Ask the user whether to create branch `feat/diff-type-subagents-portability` or a worktree. Do not create it before the answer.
- [ ] **Step 2:** After permission, from the main branch run `rtk git switch -c feat/diff-type-subagents-portability`. Expected: branch created, working tree clean.

### Task 1: Batch A baseline (RED) and fixtures

**Files:**
- Create (git-ignored): `.superpowers/diff-agents/2026-11-19-portability/fixtures/` with the layout below, and `baseline-A.md`.

**Interfaces:**
- Produces: fixture roots `roots/project/`, `roots/user/`; fixture skills used by Task 2's GREEN run:
  - `alpha` in `roots/user/` only, reached through a symlink `roots/project/alpha -> ../user/alpha`;
  - `beta` in both roots with different `SKILL.md` content (conflict);
  - `gamma` in neither root (missing);
  - `delta space` (folder name with a space) in `roots/user/`;
  - `epsilon` in `roots/user/` whose `SKILL.md` links `references/missing.md` (absent);
  - `zeta` in `roots/project/` as a symlink to a path that does not exist (dangling).

- [ ] **Step 1: Build the fixtures** with the layout above. Each `SKILL.md` has a `name:` and `description:` header and one body line. Expected: `rtk find .superpowers/diff-agents/2026-11-19-portability/fixtures` lists all six skills.
- [ ] **Step 2: Baseline run.** Give a fresh subagent (Sonnet 5.5 Medium) the current `SKILL.md` and `policy.md` plus the six skill names and the two roots, and ask it to follow the skill and produce the paths and hashes for a brief. Save its answer to `baseline-A.md`.
- [ ] **Step 3: Verify the baseline fails.** Expected, written in `baseline-A.md`: no step in the skill tells it how to resolve a name, so it invents a method, or reports the real path and a hash for none of the six in the formats of spec section 6, or misses the `beta` conflict. If it passes cleanly, stop and tell the user: the premise of P2 is wrong.

### Task 2: Batch A, skill source roots and path resolution

**Files:**
- Modify: `references/policy.md`, `SKILL.md` (Gate 1B, Gate 2, Gate 4 step 2a, red flags).
- Create: `references/skill-delivery.md` (section 1 only now).

**Interfaces:**
- Produces: `policy.md` section `## Skill source roots` (table: path pattern, scope, agents that scan it, status, date; order = precedence; default proposal: project before user) and the changed row `Orchestrator`. `skill-delivery.md` heading `## 1. Resolving a skill` with the procedure of spec section 6. `assignments.md` section name `Skill resolution` with columns `skill | real path | root | combined hash | covered files`.
- Consumes: Gate 1B step list, Gate 2 step 1, Gate 4 step 2a of the current `SKILL.md`.

- [ ] **Step 1: Write the GREEN scenario as expected results** in `fixtures/expected-A.md`: `alpha` resolves to its real path under `roots/user/` with one combined hash; `beta` stops with a conflict naming both roots; `gamma` stops with "not found, ask the user"; `delta space` resolves with the space intact; `epsilon` reports the missing linked file and does not hash silently; `zeta` stops with "dangling symlink"; a run with `policy.md` lacking the roots section asks the user (Review Focus 1 to 4).
- [ ] **Step 2: Edit `policy.md`:** add `## Skill source roots` with the table header and, as its only data rows, the roots of this machine marked [Unverified] with today's date; rewrite the `Orchestrator` row as in spec section 6.
- [ ] **Step 3: Write `skill-delivery.md` section 1:** the walk in root order, `realpath`, per-file `shasum` over `SKILL.md` plus the files it links one level deep, the combined hash over the sorted per-file hashes, the five stop cases of Step 1, and the table format.
- [ ] **Step 4: Edit `SKILL.md`:** in Gate 1B add the skill-folder probe step; in Gate 2 add the "resolve skills" step pointing to `skill-delivery.md`; in Gate 4 step 2a replace "the base directory shown when the skill is loaded" with "the real path from the Skill resolution table", and require the hash to be re-checked before the brief is written; add two red-flag rows ("I know where this skill lives", "the skill is the same in both folders").
- [ ] **Step 5: GREEN run.** A fresh subagent (a different one from Step 2 of Task 1) follows the edited skill on the same fixtures. Compare with `expected-A.md`. Expected: every line matches.
- [ ] **Step 6: Commit** (after the user's go-ahead): `docs(diff-type-subagents): resolve skills from ordered source roots`.

### Task 3: Batch B, capability probe

**Files:**
- Modify: `SKILL.md` (Gate 1B), `references/models-and-commands.md` (table columns and the host-mechanism row template).

**Interfaces:**
- Produces: models-table columns `Reads path | Reads outside folder | Runs commands | Web | Sees skills itself`, each value `yes`, `no` or `[Unverified]` with a date; a row template for "the host's own subagent mechanism" valid for any host.
- Consumes: the Gate 1B step list from Task 2.

- [ ] **Step 1: Write the expected result** in `fixtures/expected-B1.md`: a probe run on a CLI with a verified Gate 1B yields five filled cells; an unprobed cell shows `[Unverified]`; a worker with `[Unverified]` in a needed column is reported not eligible for that task.
- [ ] **Step 2: Baseline.** With the current skill, ask a fresh subagent to say which capabilities of a new CLI it would record. Expected: it records only login, models, and session-list (the current Gate 1B), and nothing about reading paths. Save to `baseline-B1.md`.
- [ ] **Step 3: Edit Gate 1B** to add the probe step (read an absolute path inside the working folder, read one outside, run a harmless command, fetch a page, list visible skills), each tested by a small read-only prompt after the user's "Hello" consent. Edit the models table header and the template row.
- [ ] **Step 4: Probe run** on the CLIs present on this machine (Codex first; Agy only after its Gate 1B has the user's consent). Record the cells with today's date. Expected: Codex reads a path inside and outside; Agy headless cannot read outside its folder (matches the 2026-11-10 note).
- [ ] **Step 5: Commit** (after the user's go-ahead): `docs(diff-type-subagents): probe worker capabilities at Gate 1B`.

### Task 4: Batch B, delivery modes and proof of reading

**Files:**
- Modify: `references/skill-delivery.md` (sections 2 to 4), `SKILL.md` (Gate 2 table columns, Gate 4 step 2a, Gate 5 skill-read check, red flags), `references/worker-rules.md` (notes).

**Interfaces:**
- Produces: `skill-delivery.md` headings `## 2. Delivery modes` (`path`, `workspace-copy`, `compiled`, `orchestrator-keeps`, chosen in that order from the probe), `## 3. Proof of reading` (per mode, nonce rule, confidence labels), `## 4. Compiled checklist format` (ordered steps, exact commands, pass/fail rules, stop conditions, source path and hash, nonce on the first line). `assignments.md` section `Delivery table` with columns `worker | skill | mode | proof | confidence`.
- Consumes: capability cells from Task 3; Skill resolution table from Task 2.

- [ ] **Step 1: Write expected results** in `fixtures/expected-B2.md`: Codex with `path` shows an open event for the skill file before its first change, confidence high; a worker that cannot read the path gets `workspace-copy` and quotes the nonce from the copy, confidence medium; a worker that cannot read files gets `compiled`, returns evidence per step and quotes the nonce, and the orchestrator re-runs the verification commands, confidence lower; with all modes failing the skill stops and asks the user; a worker whose log shows no open event for a `path` skill is an invalid run (Gate 5), the capability is marked [Unverified], the next mode is chosen and the delivery table needs re-approval.
- [ ] **Step 2: Baseline.** Give a fresh subagent the current skill and a worker that cannot read the path. Expected: the only answer available is "paste inline", with no proof method. Save to `baseline-B2.md`.
- [ ] **Step 3: Write sections 2 to 4** of `skill-delivery.md` and the edits to `SKILL.md` and `worker-rules.md` so each expected line of Step 1 follows from the text. Add red-flag rows ("it cannot read the path, so skip the skill", "it quoted the skill, so it read it").
- [ ] **Step 4: GREEN runs.** (a) Codex on a tiny read-only task with the fixture skill `alpha` by `path`; (b) the same task on a worker that cannot read the path, by `workspace-copy`, then by `compiled`. Compare with `expected-B2.md`. Expected: every line matches. If Agy has not passed Gate 1B, report that run as not done; do not substitute it silently.
- [ ] **Step 5: Commit** (after the user's go-ahead): `docs(diff-type-subagents): deliver skills by probed mode with proof of reading`.

### Task 4b: Batch B, workers as separate processes with a completion signal

**Files:**
- Create: `references/running-workers.md`.
- Modify: `SKILL.md` (Gate 1 probe of the orchestrator, Gate 4 launch and session check, Gate 5 completion check, red flags), `references/policy.md` (item `Completion signal`), `references/models-and-commands.md` (command shapes through the wrapper).

**Interfaces:**
- Produces: `policy.md` item `Completion signal: native | polling` with a date; in each task folder `exit.code` (integer) and `done` (empty file, created last); `assignments.md` column `time limit`; `running-workers.md` headings `## Launch wrapper`, `## Completion signal`, `## Hang detection`, `## Parallel runs`.
- Consumes: task folder layout of Gate 4 step 1; the escalation step of Task 5 (a stuck run counts as a failed attempt).

- [ ] **Step 1: Write expected results** in `fixtures/expected-B4.md`: a CLI worker started through the wrapper returns control to the orchestrator at once; the orchestrator answers a user message before the worker ends; when the worker ends, `exit.code` and `done` exist and the completion is noticed (by the host's notification if `native`, otherwise at the next pause point); a worker with open stdin and a 60-second limit is reported as stuck with its last log lines, and is stopped only after the user agrees; two write tasks with overlapping allowed paths are run one after the other; under `polling` the orchestrator says so in the table it presents and never reports a result without its marker.
- [ ] **Step 2: Baseline.** With the current skill, a fresh orchestrator is asked to start two workers and report when they finish. Expected: it runs them as blocking commands, or invents its own waiting method, and nothing says what happens on a hang. Save to `baseline-B4.md`.
- [ ] **Step 3: Write `running-workers.md` and the edits** so each line of `expected-B4.md` follows from the text, including the red-flag rows ("it should be done by now", "the notification will come").
- [ ] **Step 4: GREEN run** of `expected-B4.md` with a Codex read-only task and a deliberately hung one (stdin left open, 60-second limit). Expected: every line matches. Report any host whose wake-up could not be tested as [Unverified].
- [ ] **Step 5: Commit** (after the user's go-ahead): `docs(diff-type-subagents): run workers as separate processes with a completion signal`.

### Task 5: Batch B, allocation algorithm

**Files:**
- Create: `references/allocation.md`.
- Modify: `references/policy.md` (items `Spread`, `Tier map`, worker permissions per D9), `SKILL.md` (Gate 2 steps 3 and 6, Gate 6 step 1a row R, red flags).

**Interfaces:**
- Produces: `allocation.md` headings `## Roles and families`, `## Task weight`, `## Algorithm` (the eight steps of spec 7.3, verbatim), `## Escalation chain`, `## Allocation record`. `policy.md` items `Spread: prefer | require | off` (default prefer) and a `Tier map` table. `assignments.md` section `Allocation record` with columns `task | weight | chosen row | deciding step | alternatives dropped and why | escalation chain`.
- Consumes: capability cells (Task 3), delivery table (Task 4), tier proposals of spec 7.3.

- [ ] **Step 1: Write expected results** in `fixtures/expected-B3.md` for two inputs: (a) the six tasks and six-row pool of the worked example given in the spec discussion, expecting T1 to Haiku High, T2 and T3 to the OpenCode row, T4 to Codex sol, T5 to Sonnet Medium, T4 review to Sonnet Medium; (b) the real inputs of `.superpowers/diff-agents/2026-11-18-capstone-exams/assignments.md` on this machine's models table, expecting all tasks to Codex sol and the message "only one family passes step 2". Add a case with an empty pool (step 4 stops and asks) and one where the only candidate is the writer's family (step 3 relaxes and labels independence low).
- [ ] **Step 2: Baseline.** Give two fresh orchestrators (a Sonnet subagent, and Codex via `rtk codex exec -s read-only ... </dev/null` with the current skill text) input (a) and ask for an assignment table. Expected: the tables differ, or both ignore the family and tier. Save to `baseline-B3.md`.
- [ ] **Step 3: Write `allocation.md`, the policy items and the `SKILL.md` edits** so Step 1's expectations follow from the text. Include the `Sonnet` change of D9 and keep Opus forbidden.
- [ ] **Step 4: GREEN run.** Repeat Step 2 with the edited skill. Expected: both orchestrators produce the table of `expected-B3.md` for (a) and (b), and the empty-pool and relaxed-independence cases behave as written.
- [ ] **Step 5: Commit** (after the user's go-ahead): `docs(diff-type-subagents): add a deterministic task-allocation algorithm`.

### Task 6: Batch C, neutral wording and recovery

**Files:**
- Modify: `SKILL.md` (Gate 2 selection-file wording, new Gate 6 step 6 "Resume point", red flags), `references/policy.md`, `references/models-and-commands.md`, `references/worker-rules.md` (wording only).

**Interfaces:**
- Produces: `assignments.md` top lines `Status: draft | approved` and `Next step: <text>` (updated after every launch, result, question and answer; per-task `ledger.json` keeps run entries only); `assignments.md` header line `Status: draft | approved`; Gate 6 step 6 text "after compaction or a reopened session read `SKILL.md`, `policy.md`, `assignments.md`, `ledger.json` before delegating or reviewing".
- Consumes: Tasks 2 to 5.

- [ ] **Step 1: Write expected results** in `fixtures/expected-C.md`: (a) a fresh agent that is not Claude, given only the files, runs Gate 1 and Gate 2 on a toy task up to the approval stop, without delegating; (b) a new session given only the task folder continues from the `Next step` line of `assignments.md`; (c) a draft `assignments.md` is never treated as approved, even if a summary says the user "seemed fine" (Review Focus 5); (d) no sentence in `SKILL.md` or the references names a vendor outside `policy.md` and the models table, except dated test notes; (e) without a selection file Gate 2 uses the orchestrator's judgment; (f) Gate 1 probes the environment and fills the `Environment` table of `policy.md` (operating system and shell, SHA-256 tool, real-path tool, how to close stdin, how to start a background process, terminal multiplexer yes or no), each cell dated and marked; (g) with no terminal multiplexer the "Hello" test falls back to the CLI's non-interactive command or to the user running the session, and the skill never installs a tool; (h) no sentence in the rules gives a Unix-only command as the only way to get a result, and the command prefix never appears inside a command given to a worker.
- [ ] **Step 2: Baseline.** Run (a) to (c) against the unedited skill with fresh agents. Expected: (a) the agent assumes a Claude host or stops at the base-directory step; (b) there is no the `Next step` line of `assignments.md` to read; (c) status is unspecified. Save to `baseline-C.md`. Check (d) with `rtk grep -n -i "claude\|codex\|agy\|haiku" .claude/skills/diff-type-subagents/SKILL.md` and list the hits.
- [ ] **Step 3: Edit** to satisfy `expected-C.md`: neutralise the hits, add the `## Environment` table to `policy.md` and the Gate 1 environment probe (tmux optional with the two fallbacks, the skill never installs a tool, results stated instead of Unix commands in `skill-delivery.md` and `running-workers.md` if it exists by then), add the `Status` line rule, the the `Next step` line of `assignments.md` rule, Gate 6 step 6, the selection-file-optional wording, and red-flag rows ("my summary says it was approved", "I remember the decision").
- [ ] **Step 4: GREEN run** of (a) to (e), with Codex as the orchestrator for (a). Expected: all match; Claude-specific hits remain only in dated notes.
- [ ] **Step 5: Commit** (after the user's go-ahead): `docs(diff-type-subagents): neutral wording and recovery after compaction`.

### Task 7: Verification and whole-branch review

**Files:** none changed unless a finding requires it.

- [ ] **Step 1 (verification-before-completion):** re-run every GREEN comparison of Tasks 2 to 6 on the final files and read the output. Expected: all pass; list any that did not.
- [ ] **Step 2: Whole-branch review.** Use the host's review mechanism on the whole branch at **medium** effort (instruction text that changes behaviour, small diff), then one fresh independent reviewer if the user chose one. Re-grade findings by effect; fix Critical and Important ones with a failing scenario first; record Minor ones as deferred.
- [ ] **Step 3:** Report to the user: every ruling made, every deferred minor, and the checks that could not run (for example Agy without a verified session-list command). Merge, push or deleting the branch needs the user's permission.
