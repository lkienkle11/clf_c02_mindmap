# Make `diff-type-subagents` work with any orchestrator and any worker: design

Date: 2026-11-19. Status: approved by the user on 2026-11-19, including section 7.4 (D13, D14); the environment and portability part of section 8 (D15, D16, problem 21) was added and approved the same day; reopened again to add section 7.5 (D17, evaluation of a task list for parallel groups, problem 22), which needs the user's approval.
Source handoff: `.context/handoff-diff-type-subagents-skill-portability.md`.
Skill under change: `.claude/skills/diff-type-subagents/` (`SKILL.md`, `references/policy.md`, `references/models-and-commands.md`, `references/worker-rules.md`).
Skill left unchanged: `.claude/skills/select-skills-usp/SKILL.md`.

## 1. Intent and why

One orchestrator that can be any AI agent (Claude Code, Codex, Agy, Qwen, Cursor, OpenCode, Grok, MiniMax, Kiro, or one that does not exist yet) delegates to many other kinds of agents. Every worker must be able to read and follow the skills the orchestrator relies on. A worker that cannot read a skill must never ignore it and improvise.

Today the skill's rules are vendor-neutral on paper, but in practice: (a) nothing says where skills live or how a skill name becomes a file path; (b) workers start empty and only Codex was ever tested reading a skill by path; (c) the only fallback is pasting text inline, which cannot be checked; (d) real runs gave every task to one vendor, because the "every worker session must be listed" rule leaves only Codex eligible; (e) nothing tells the orchestrator how to split tasks among models of the same family or of different vendors; (f) nothing covers context compaction; (g) nothing says that a worker runs as its own process, or how the orchestrator learns that it has finished; (h) the skill assumes a Unix machine with tmux, a SHA-256 tool, `realpath`, `</dev/null` and the user's command prefix, and nothing probes or records the environment.

Success: an orchestrator of any vendor can run the skill from files alone, resolve every skill to a verified path, deliver it to each worker by a mode that fits that worker's proven capabilities, choose workers by a written algorithm, and recover after compaction by re-reading files.

## 2. Goals, non-goals, anti-goals

Goals
- G1. Rules name no vendor. Vendor facts are data in `policy.md` and the models table, each with a check date and a verified/[Unverified] mark.
- G2. A skill name resolves to an absolute, real path plus a content hash, from an ordered list of skill source roots.
- G3. Each (worker, skill) pair gets a delivery mode chosen from probed capabilities, with proof of reading proportional to the mode and a confidence label on the result.
- G4. A written, deterministic task-allocation algorithm covering same-family tiers and cross-vendor choices.
- G5. All state needed to continue lives in files, so the orchestrator survives context compaction and a change of orchestrator.

Non-goals
- No scripts in this change (path resolution, hashing and probing are written as procedures the agent performs). Scripts are a later option.
- No change to `select-skills-usp` and no change to the selection file format.
- No new vendor rows are added to the models table by this change; rows appear only through Gate 1B probes on a real machine.
- No change to the approval gates of the workflow in use (spec, plan, branch, commit, merge, push).

Anti-goals (would be a failure even if it technically works)
- A fixed orchestrator, or a list of vendors written into the rules.
- "Do not assign the task" as the default answer when a worker cannot read a skill.
- Forcing diversity of vendors for its own sake.
- Absolute machine paths committed to the repository.

## 3. Constraints

- The user's rules: prefix shell commands with `rtk`; no AI attribution in commits; never Opus as a worker; replies in Vietnamese; no branch, commit or edit of skill files before the user allows it.
- `writing-skills`: no skill edit without a failing test first. Each batch therefore starts with a baseline run that shows the current skill failing, then the edit, then the same run passing.
- Gate rules already in the skill stay: user approves `assignments.md`; session-list rule; compliance check; final whole-branch review.
- Facts about each CLI's skill folders come from official documentation and from probes on the machine; anything else is marked [Unverified].

## 4. Approaches considered

1. **Edit in place, long parts in reference files (chosen by the user).** One skill. `SKILL.md` gets short steps at Gates 1B, 2, 4, 6; new reference files hold the details; `policy.md` gets new items. Smallest change; a worker needs to know only one skill. Cost: `SKILL.md` grows, so details go to references.
2. Companion skills (a path-resolver skill, a task-allocation skill). Reusable, but every agent must then find more skills, which reintroduces the path problem for this skill itself.
3. Helper scripts from the start. Same result across vendors, but needs an interpreter on every machine and a test burden, and some harnesses strip executable bits. Deferred.

## 5. Decisions taken with the user

| # | Decision |
|---|---|
| D1 | Three batches in one spec, order A, B, C. Each ends with a real run. |
| D2 | Skill source roots and each new CLI's capabilities are found by Gate 1B probing; the user confirms before anything is written to `policy.md` or the models table. The orchestrator probes itself the same way. |
| D3 | The selection file keeps names and purposes only. Paths are resolved when `assignments.md` is built (Gate 2). |
| D4 | The orchestrator compiles a skill into a checklist (mode `compiled`). |
| D5 | When several workers fit equally, prefer spreading across families and quota; never force it. |
| D6 | After compaction or a new session: re-read files first; write every allocation decision to a file at once; keep the `Status:` and `Next step:` lines at the top of `assignments.md` (topic level, it exists from Gate 2), while each per-task `ledger.json` keeps the run entries. |
| D7 | The whole-branch independent reviewer (row R) must differ in family from the writer of the highest-risk task. |
| D8 | The 8-step allocation algorithm in section 7.3 goes into the skill as written. |
| D9 | Sonnet 5.5 may work as a worker (High: very heavy, Medium: heavy). Opus stays forbidden. Haiku 5.5 XHigh: medium, High: small. This replaces the old "Sonnet is never a worker" item in `policy.md`. |
| D10 | The session-list rule is not relaxed: a CLI whose session-list command is not verified is not used as a worker (existing hard rule). |
| D11 | "Family" means the vendor line, as the user used the word: Opus, Sonnet and Haiku are one family; Codex, Agy, MiniMax, Cursor, OpenCode, Grok and so on are other families. |
| D12 | The orchestrator is never a worker row. It runs its own review mechanism at Gate 6 step 1a; row R is a separate, optional worker. |
| D13 | Mandatory, for every worker of any family: each delegated run is its own process (or the host's own background subagent) and does not block the orchestrator's chat, and its completion returns the orchestrator to the main session. |
| D14 | When the orchestrator's host has no native wake-up, the skill uses polling of completion markers, says so in `policy.md` and when it presents `assignments.md`, and never claims a result before the marker exists. A message injected into the session by a process is not used and is never an approval. |
| D15 | Gate 1 probes the environment and records it in a `policy.md` table `Environment` (operating system and shell, SHA-256 tool, real-path tool, how to close stdin, how to start a background process, whether a terminal multiplexer exists), each cell dated and marked verified or [Unverified]. The rules state the result needed (SHA-256 of the file bytes; the real path after links are followed), not a command; any tool that gives the same result may be used and is recorded. |
| D16 | A terminal multiplexer is optional: without it the "Hello" test uses the CLI's non-interactive command, or the user runs the interactive session in their own terminal. The skill never installs anything; a missing tool is reported to the user, who decides. Only macOS was available for real runs; Linux and Windows stay [Unverified]. |
| D17 | Gate 2 evaluates the whole task list for parallel groups: it builds a conflict graph from the tasks' write sets, read inputs, interface dependencies and ordering constraints, shows the groups in the table for approval, proposes (never silently applies) splitting tasks that conflict only through a shared file, and spreads the members of a group across families. Parallelism does not depend on the vendor. |
| D18 | [Approved 2026-11-20: the user chose "Duyệt D18 (Recommended)" in answer to "Duyệt D18 như viết để tôi commit vào spec, thêm Task 9 vào plan, chạy RED/GREEN rồi sửa skill?"] From a measured run on the real pool (mixed-needs list: Agy and Codex both chosen; every host-subagent row dropped at the hard filter because its capability cells are [Unverified] and its session list is unconfirmed; a write task reached a row measured only in a read-only mode): (a) the capability table gets a column `Writes files` (measured per CLI and mode, like the others) and the hard filter requires it for any task that writes; (b) the host's own subagent mechanism is probed with the same five checks as a CLI (read-only worker, results dated and marked) so its rows can pass the hard filter, while the one-time user confirmation of how the host shows its subagent runs stays required; (c) two unclear points are fixed: a review task states the family of the writer of the work it reviews as an input (unknown = ask the user), and a task moved along an escalation chain onto a row that is queued behind a pilot of the same kind waits like any queued task. The ranking algorithm (lowest sufficient tier, then affinity, spread, table order) is NOT changed; no rule names a vendor or ties a vendor to a role. |

## 6. Batch A: skill source roots and path resolution (problems P1, P2)

Changes
- `references/policy.md`: new section "Skill source roots": an ordered list. Each entry: path pattern, scope (project, user, plugin), which agents scan it, status (verified or [Unverified]), check date. Order is precedence; the proposed default order is project level before user level. The "Orchestrator" row becomes "the agent session running this skill; Gate 1 records its identity and the result of its self-probe".
- `SKILL.md` Gate 1B: add the skill-folder probe (where does this agent find skills, does it scan a folder by itself). Probing is read-only; results are shown to the user and written only after confirmation.
- `SKILL.md` Gate 2: new step "resolve skills". For each skill name in the cell "skills the worker must read": walk the roots in order; follow symlinks to the real path; compute a hash of `SKILL.md` and of every file inside the skill's folder that `SKILL.md` links (one level), then one combined hash over the sorted list of those per-file hashes (the orchestrator's call); write one row `skill | real path | root | combined hash | covered files` into a new section "Skill resolution" of `assignments.md` (git-ignored). Same name with different hashes in two roots: stop and ask. Not found: ask the user. The hash is checked again at Gate 4 so a skill that changed in between is noticed.
- `SKILL.md` Gate 4 step 2a: remove "the base directory shown when the skill is loaded"; the brief takes the path from the resolution table.
- The orchestrator's own roots: found by the same probe applied to itself (ask the host, else ask the user).

Not changed: `select-skills-usp` and the selection file.

Real-run check for A: create throwaway fixture skills in three roots (one reached through a symlink, one name present twice with different content, one missing). Run the resolution. Expected: real paths and hashes for the first two, a stop for the conflict, a question for the missing one. Baseline: the current skill has no way to do this.

## 7. Batch B: delivery of skills and allocation of tasks (problems P3, P4, and the allocation gap)

### 7.1 Capability probe (extends Gate 1B)
For each new CLI, record in the models table: can it read a file by absolute path; can it read a file outside its working folder; can it run commands (for example run tests); can it use the web; does it see skills by itself and where. Each answer is tested, not assumed. An unprobed capability is [Unverified]; a worker lacking a needed capability is not eligible for the task. The session-list rule is not relaxed (D10): Batch B's real run on Agy therefore starts with Gate 1B for Agy, including the user-approved "Hello" test; if Agy's session-list command cannot be verified, the run uses another verified CLI and the Agy part is reported as not run.

### 7.2 Delivery modes, chosen per (worker, skill) from the probe
1. `path`: the brief names the real path; the worker reads it. Proof: the worker's log shows the file opened before its first change (existing Gate 5 check).
2. `workspace-copy`: the orchestrator copies the skill and the files it links into the task folder; the brief names the copy. Proof: log event for the copy, plus a nonce.
3. `compiled`: the orchestrator turns the skill into a checklist in the brief: ordered steps, exact commands, pass/fail rules, stop conditions, the source path and hash, and a nonce on its first line. The worker returns evidence per step and quotes the nonce. The orchestrator re-runs the skill's verification commands (Gate 6).
4. `orchestrator-keeps`: the part the worker cannot do (for example running tests) stays with the orchestrator, or goes to another agent that can, and is verified there.
Selection: the first mode in this order that the probe shows works for that worker. If none works, stop and ask the user (change worker, or allow the work without that skill). Results from modes 2 and 3 carry a lower confidence label and get a closer review, the same way a fallback to a weaker model does. The delivery table (worker, skill, mode, proof) is a section of `assignments.md` and is approved with the table. If a worker's real behaviour contradicts the probe (nonce missing, no open event in the log, file not read), the run is invalid, as Gate 5 already says: stop, tell the user, mark that capability [Unverified] in the models table (diff shown first), choose the next mode, and ask the user to approve the changed delivery table before the run is repeated.

### 7.3 Task allocation algorithm
Inputs, all in files: tasks (kind, weight, needs, risk flag, independence constraint), the models table rows (family, maximum tier, capability flags, session-list verified, quota state; the price per token is shown to the user for information only and is never used to rank, because the user's accounts are subscriptions whose real cost is quota), policy settings (forbidden models, spread, quota thresholds), and per-worker task counts from `ledger.json`.

Step 0, weight of a task from observable signals (thresholds are [Proposed], to be tuned after the pilot): files in "allowed paths" including the ripple list: up to 2 is Small, 3 to 8 is Medium, over 8 is Heavy; a plan with no exact steps adds one level; a high-risk flag (data, security, public contract) makes it at least Heavy; a hard task is Very heavy (hard = the task needs a design decision the plan does not give, or it already failed twice; the orchestrator's call); a task that already failed once adds one level.
1. Mechanical work: use a script and stop.
2. Hard filter: keep rows that are not forbidden, have a verified session-list command, have normal quota (low quota only for small preparation work, per policy thresholds), have every capability the task needs, and have at least one working delivery mode for every skill of the task.
3. Independence filter: a review or arbitration of work W excludes rows of the same family as W's writer. If nothing is left, relax to "different session, same family", label the independence as low and tell the user. Never the same session.
4. Tier filter: keep rows whose maximum tier is at least the task's weight. If none is left, stop and ask the user; never downgrade silently.
5. Rank: lowest adequate tier first. A row with no recorded result for this kind of task may be chosen; the task is then flagged `pilot` (it gets a closer review, and no later task of that kind goes to that row before the pilot's review passes). This replaces the separate small read-only pilot task of the original Gate 2 step 3 (ruling of 2026-11-19: the pilot flag costs no extra task and keeps the same safeguard of a closer review before the row is relied on).
6. Tie-break among equals: if the task shares ripple files with an already assigned task, prefer that task's family (avoids style drift), unless spread is set to required; otherwise prefer the family with the fewest tasks and the most quota; still tied: the row listed first in the table.
7. Escalation: each row in `assignments.md` names its next row in advance and the user approves the whole chain once. On failure (tests still red after the allowed attempts, or review rejects) move up one tier in the same family, then to another family, then ask the user. A move inside the pre-approved chain needs no new approval; any move outside it follows the existing Gate 2 step 6.
8. Record in `assignments.md` the chosen row, the step that decided, and the alternatives dropped with the reason. The user approves the table before anything is delegated.

Settings in `policy.md`: `Spread: prefer | require | off` (default prefer, as chosen by the user); the tier map for models (D9). The algorithm gives the same result for the same inputs whichever agent runs it.

The whole-branch review row R follows step 3 with the rule of D7.

Roles and families (D11, D12). The orchestrator is not a row of the allocation and never writes or reviews as a worker. Independence is compared between worker rows only, by family. The orchestrator's own review mechanism (Gate 6 step 1a) runs in every case and is separate from row R.

Tier labels. The task weights Small, Medium, Heavy, Very heavy are the same labels as the "maximum tier" of a models-table row, so step 4 compares like with like. A row that has no measured result gets Small until a pilot passes; a higher tier is written to the table only after a pilot and the user's approval at Gate 1A or 1B. Proposed starting map (the user checks it when approving this spec): Haiku 5.5 High = Small; Haiku 5.5 XHigh = Medium; Sonnet 5.5 Medium = Heavy; Sonnet 5.5 High = Very heavy (from D9); Codex luna = Small, terra = Medium, sol = Heavy, astra = Very heavy [Proposed, from the models table notes]; Agy gemini flash low and medium = Small, flash high = Medium [Proposed].

Real-run check for B: (1) baseline: show the current skill gives no path-reading proof for a worker that cannot read the path; (2) give one small task to a worker that reads paths (Codex) and one to a worker that cannot (Agy headless once its session-list command is verified, mode `workspace-copy` or `compiled`), then check the nonce, the log events and the confidence labels; (3) dry-run the algorithm on the inputs of the existing capstone-exams assignments and on one hypothetical pool, and confirm that two different orchestrators produce the same table. The dry run is expected to show that on this machine only one family passes step 2 and to say so.

### 7.4 Running workers: own process, completion signal, hang detection (D13, D14)

- Every delegated run is a separate process (or the host's own background subagent), started so that the orchestrator's chat is not blocked. A CLI worker is launched through a wrapper that runs the command, writes its exit code to `exit.code` and then creates `done` in the task folder; its output goes to a log file in that folder.
- Probe, at Gate 1, applied to the orchestrator itself: "can I start a background process and be woken in this session when it ends?" The answer is recorded in a `policy.md` item `Completion signal` with the date: `native` (the host wakes the session) or `polling` (no wake-up). Observed 2026-11-19 on the host that ran this design session: its background subagent tool delivers a completion notification. A background shell command that ended at 23:18:58 on the same day also woke the main session (verified 2026-11-19). Everything about other hosts is [Unverified].
- With `native`, the notification is the trigger. With `polling`, the orchestrator checks the `done` markers and `ledger.json` at every pause point (before any reply that depends on a result), says so when it presents `assignments.md`, and never reports a result before its marker exists. Files stay the source of truth either way, so a lost notification or a compaction loses nothing.
- Hang detection: each worker has a time limit in `assignments.md` (proposed default [Proposed]: 15 minutes for Small and Medium tasks, 30 for Heavy and Very heavy; the user may change it). Past the limit with no `done` marker the run counts as stuck: show the user the last log lines and the session id, stop only that process after the user agrees, and treat it as a failed attempt under step 7 of the algorithm. CLI workers always get stdin closed (`</dev/null`), because a missing close hung two runs on 2026-11-10.
- Parallel runs: only read-only tasks, or write tasks whose allowed paths do not overlap, run at the same time. Overlapping tasks run one after the other.
- A completion event is never an approval. The Gate 4 step 7 session check still runs right after each launch.

Real-run check for 7.4: start one read-only worker in the background and confirm the orchestrator answers a user message before it ends; confirm the completion is noticed (native or polling); then start a worker whose stdin is left open, with a short limit, and confirm it is reported as stuck. Baseline: the current skill has no wrapper, marker or limit.

### 7.5 Evaluating a task list for parallel groups (D17)

New Gate 2 step "parallel groups", detail in a new reference `references/parallel-groups.md` (headings `## Inputs`, `## Conflict edges`, `## Groups`, `## Splitting`, `## Limits`, `## Record`). It runs after the ripple scan (3a) and before allocation, on the tasks that will be delegated (writes, read-only runs, reviews and scenario runs alike).

- **Inputs, per task:** the allowed paths with the ripple list, split into the files it writes and the files it reads as input; what it produces and consumes (a name, a signature, a heading, a table, a column); the ordering constraints found by the ripple scan; whether it is read-only; whether it is irreversible (3b-bis).
- **Conflict edges** (the file is the unit; two tasks that edit different parts of one file still conflict): (a) both write the same file or generated artifact; (b) one writes a file the other reads as input or whose checks read it; (c) a dependency: one consumes what the other produces, so the producer goes first; a dependency is HARD when the consumer uses content that the producer's run creates (probe results, resolved paths, a result file), and then the producer goes first for every part of the consumer; it is SOFT when the consumer uses only a name or a shape that the plan's Interfaces block already fixes, and then only the integration and the checks of the consumer wait for the producer, while an own-file part of the consumer may be drafted at the same time; (d) an ordering constraint of the ripple scan; (e) both touch the same irreversible resource or a guard check that cannot run twice at once.
- **Groups:** order the tasks by dependency into layers; inside a layer, the tasks with no conflict edge between them form a group that starts together, taken in plan order; a task with an edge to a group member goes to the next group. Read-only tasks have no write edges, so they join any group whose inputs they do not read before it is done. Each group has a name `G1`, `G2`, and so on; a later group starts when the tasks it depends on are done and reviewed.
- **Splitting (proposal only):** when two tasks conflict only because both edit one shared file, the orchestrator proposes splitting each into "own-file part" (a file only that task writes, parallelisable) and a short "integration part" (the shared file, one after the other); the orchestrator counts the groups of the critical path with and without the split (each split task becomes two parts in plan order, own-file part first, and every edge of 7.5 applies to the parts); it proposes the split only when it REDUCES the number of groups (a tie gives no gain and costs extra briefs), writing `split recommended: <n> groups against <m>`; otherwise it writes `split not recommended: <n> groups against <m>` and keeps the task whole; every part inherits every read and every hard dependency of the task, an output belongs to the part that writes the file that holds it, and the rest of a task means its other written files (checks are not parts); a proposed split is approved by the user with the table and is never applied silently, because it changes the scope (Gate 2 step 6).
- **Limits:** a maximum number of runs at the same time, `Parallel limit` in `policy.md` ([Proposed] 3), also bounded by the quota thresholds; write tasks run at the same time only in separate worktrees or branches that the user allowed (the shared working tree would let one task's checks read another's half-written files); each run has its own task folder.
- **Record:** a column `parallel group` appended at the end of the main assignments table and a section `Parallel groups` in `assignments.md` listing each group, the edges that forced an order ("T3 after T2: consumes the capability cells"), and the split proposals; approved with the table. Allocation (7.3) then runs per task; for the members of one group the Spread step counts them together, so independent members land on different families when they tie. Parallelism does not depend on the vendor: members of one group may be of the same or of different families.

Real-run check for 7.5: baseline: two orchestrators of different vendors list the parallel groups of the plan's own task list with the current skill (they must invent a method and will differ); after the edit both must produce the same groups and the same edges and propose the same splits for the controller's expected result.

## 8. Batch C: remove the Claude Code tilt and add recovery (problems P5, compaction)

- Wording in `SKILL.md`, `policy.md` and the references that assumes Claude Code is neutralised; the one verified skill-reading test stays as dated data.
- `references/models-and-commands.md`: add a row template for "the host's own subagent mechanism", valid for any host; its session-list command is [Unverified] until probed.
- Use without `select-skills-usp` (my call): when no selection file exists, Gate 2's "skills the worker must read" uses the orchestrator's judgment of what applies (the existing text already allows it); the skill says so explicitly. The selection file is optional input, not required.
- Recovery (D6): new step in Gate 6: after context compaction, or when a session is reopened, read `SKILL.md`, `policy.md`, `assignments.md` and `ledger.json` before delegating or reviewing anything. Every allocation decision is written to a file when it is made. `assignments.md` carries `Status:` and `Next step:` lines at its top, updated after each launch and each result.
- `Orchestrator` successor rule (Gate 6 step 5) stays; it now relies on the same files.
- Environment and portability (D15, D16): the `Environment` table in `policy.md`, the Gate 1 environment probe, wording that states results instead of Unix commands (the SHA-256 and real-path steps of `skill-delivery.md`, the completion wrapper of section 7.4 and `</dev/null` become "close stdin by the means in the Environment table"), the tmux step marked optional with the two fallbacks, and the rule that the skill never installs a tool. The user's command prefix stays in `policy.md` only and is never part of a command given to a worker.

Real-run check for C: run Gate 1 and Gate 2 on a toy task with a non-Claude orchestrator (for example Codex); then force a compaction (or a fresh session) mid-run and show that the agent continues from the files. Baseline: the same scenario with the current skill, to record what is missing.

## 9. Files changed

`.claude/skills/diff-type-subagents/SKILL.md` (short steps and red-flag rows), `references/policy.md` (roots, spread, tier map, orchestrator row, worker permissions), `references/models-and-commands.md` (capability columns, host-mechanism row template), `references/worker-rules.md` (delivery-mode wording, nonce quoting), and four new files (the fourth is `references/parallel-groups.md`, section 7.5): `references/skill-delivery.md` (roots resolution, modes, proof, checklist format), `references/allocation.md` (the algorithm of section 7.3) and `references/running-workers.md` (section 7.4). The new files are named and linked from `SKILL.md`. No other skill is changed.

## 10. Verified facts, assumptions, unknowns

Verified (read in this session): the current text of all four skill files and of `select-skills-usp`; two real `assignments.md` files in `.superpowers/diff-agents/` where every task went to Codex; the local skill folders found on this machine (`~/.claude/skills`, `~/.agents/skills`, `~/.qwen/skills`, `~/.codex/skills`, `~/.cursor/skills`).

From official documentation, read as search summaries only (full pages still to be opened during the build): Cursor reads `.cursor/skills`, `.agents/skills`, `.claude/skills`, `.codex/skills`; Codex reads `.agents/skills` up to the repository root and `~/.agents/skills` (an open community report says `~/.agents/skills` was not found in one session); Antigravity prefers `.agents/skills`, still accepts `.agent/skills`, and reads `~/.gemini/antigravity-cli/skills/` and `~/.gemini/skills/` (sources disagree on the global path); Qwen reads `.qwen/skills` and `~/.qwen/skills`.

[Unverified]: whether `agy --print` can read a skill placed in its working folder; which agents besides those above scan `.agents/skills`; the thresholds in step 0; whether Codex terra and luna use the same quota as sol; Haiku and Sonnet reading a skill by path and running tests as workers; session-list commands for Agy, Claude Code and the Agent tool.

## 11. Left to the builder

Exact wording of the new `SKILL.md` steps and red-flag rows; the layout of the new tables in `assignments.md`; the nonce format; how many attempts count as "failure" in step 7 (propose 2, mark as a default); how the fixture skills for the batch A check are laid out; opening the official pages named in section 10.

### Calls made by the orchestrator while writing this spec (the user can overturn any)

- The hash covers `SKILL.md` plus the files it links, one level deep (section 6).
- A "hard" task is defined as needing a design decision the plan lacks, or having failed twice (section 7.3, step 0).
- A probe contradicted by real behaviour makes the run invalid and needs a re-approval of the delivery table (section 7.2).
- The starting tier map for Codex and Agy models is a proposal (section 7.3); Haiku and Sonnet tiers come from the user's saved preference.
- The session-list rule stays as it is, so Batch B's Agy run depends on a Gate 1B check first (section 7.1).
- "Family" means the vendor line, and the orchestrator is never a worker (D11, D12).
- The number of attempts that counts as a failure is proposed as 2.
- The time limits of 15 and 30 minutes in section 7.4 are proposals, to be tuned after the first real runs.
- Section 7.4 sits in Batch B (it changes how workers are launched, which Batch B already touches); the user can move it to its own batch.

## 12. Sources

- Cursor: https://cursor.com/docs/skills
- Codex: https://developers.openai.com/codex/skills
- Qwen Code: https://qwenlm.github.io/qwen-code-docs/en/users/features/skills/
- Antigravity: https://antigravity.google/docs/skills
