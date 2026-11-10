<!-- rtk-instructions v2 -->
# RTK (Rust Token Killer) - Token-Optimized Commands

## Golden Rule

**Always prefix commands with `rtk`**. If RTK has a dedicated filter, it uses it. If not, it passes through unchanged. This means RTK is always safe to use.

**Important**: Even in command chains with `&&`, use `rtk`:
```bash
# ❌ Wrong
git add . && git commit -m "msg" && git push

# ✅ Correct
rtk git add . && rtk git commit -m "msg" && rtk git push
```

## RTK Commands by Workflow

### Build & Compile (80-90% savings)
```bash
rtk cargo build         # Cargo build output
rtk cargo check         # Cargo check output
rtk cargo clippy        # Clippy warnings grouped by file (80%)
rtk tsc                 # TypeScript errors grouped by file/code (83%)
rtk lint                # ESLint/Biome violations grouped (84%)
rtk prettier --check    # Files needing format only (70%)
rtk next build          # Next.js build with route metrics (87%)
```

### Test (60-99% savings)
```bash
rtk cargo test          # Cargo test failures only (90%)
rtk go test             # Go test failures only (90%)
rtk jest                # Jest failures only (99.5%)
rtk vitest              # Vitest failures only (99.5%)
rtk playwright test     # Playwright failures only (94%)
rtk pytest              # Python test failures only (90%)
rtk rake test           # Ruby test failures only (90%)
rtk rspec               # RSpec test failures only (60%)
rtk test <cmd>          # Generic test wrapper - failures only
```

### Git (59-80% savings)
```bash
rtk git status          # Compact status
rtk git log             # Compact log (works with all git flags)
rtk git diff            # Compact diff (80%)
rtk git show            # Compact show (80%)
rtk git add             # Ultra-compact confirmations (59%)
rtk git commit          # Ultra-compact confirmations (59%)
rtk git push            # Ultra-compact confirmations
rtk git pull            # Ultra-compact confirmations
rtk git branch          # Compact branch list
rtk git fetch           # Compact fetch
rtk git stash           # Compact stash
rtk git worktree        # Compact worktree
```

Note: Git passthrough works for ALL subcommands, even those not explicitly listed.

### GitHub (26-87% savings)
```bash
rtk gh pr view <num>    # Compact PR view (87%)
rtk gh pr checks        # Compact PR checks (79%)
rtk gh run list         # Compact workflow runs (82%)
rtk gh issue list       # Compact issue list (80%)
rtk gh api              # Compact API responses (26%)
```

### JavaScript/TypeScript Tooling (70-90% savings)
```bash
rtk pnpm list           # Compact dependency tree (70%)
rtk pnpm outdated       # Compact outdated packages (80%)
rtk pnpm install        # Compact install output (90%)
rtk npm run <script>    # Compact npm script output
rtk npx <cmd>           # Compact npx command output
rtk prisma              # Prisma without ASCII art (88%)
rtk uv run <cmd>        # Compact uv project command output
```

### Files & Search (60-75% savings)
```bash
rtk ls <path>           # Tree format, compact (65%)
rtk read <file>         # Code reading with filtering (60%)
rtk grep <pattern>      # Search grouped by file (75%). Format flags (-c, -l, -L, -o, -Z) run raw.
rtk find <pattern>      # Find grouped by directory (70%)
```

### Analysis & Debug (70-90% savings)
```bash
rtk err <cmd>           # Filter errors only from any command
rtk log <file>          # Deduplicated logs with counts
rtk json <file>         # JSON structure without values
rtk deps                # Dependency overview
rtk env                 # Environment variables compact
rtk summary <cmd>       # Smart summary of command output
rtk diff                # Ultra-compact diffs
```

### Infrastructure (85% savings)
```bash
rtk docker ps           # Compact container list
rtk docker images       # Compact image list
rtk docker logs <c>     # Deduplicated logs
rtk kubectl get         # Compact resource list
rtk kubectl logs        # Deduplicated pod logs
```

### Network (65-70% savings)
```bash
rtk curl <url>          # Compact HTTP responses (70%)
rtk wget <url>          # Compact download output (65%)
```

### Meta Commands
```bash
rtk gain                # View token savings statistics
rtk gain --history      # View command history with savings
rtk discover            # Analyze Claude Code sessions for missed RTK usage
rtk proxy <cmd>         # Run command without filtering (for debugging)
rtk init                # Add RTK instructions to CLAUDE.md
rtk init --global       # Add RTK to ~/.claude/CLAUDE.md
```

## Token Savings Overview

| Category | Commands | Typical Savings |
|----------|----------|-----------------|
| Tests | vitest, playwright, cargo test | 90-99% |
| Build | next, tsc, lint, prettier | 70-87% |
| Git | status, log, diff, add, commit | 59-80% |
| GitHub | gh pr, gh run, gh issue | 26-87% |
| Package Managers | pnpm, npm, npx | 70-90% |
| Files | ls, read, grep, find | 60-75% |
| Infrastructure | docker, kubectl | 85% |
| Network | curl, wget | 65-70% |

Overall average: **60-90% token reduction** on common development operations.
<!-- /rtk-instructions -->

 
<!-- begin-rule-commit-->

## Git Commit Rules

- Follow the project's Commitlint configuration and Conventional Commits specification.
- Commit title must use the format: `type(scope): description`.
- Commit body must contain all four sections, in this order:

  **Scope:**
  Describe the affected scope.

  **What did:**
  Summarize the changes made.

  **Reviewed:**
  Summarize what was reviewed.

  **Tested:**
  List tests executed and their results.

- Never include AI attribution or co-author trailers, including `Co-Authored-By: Claude`, `Co-Authorized by: Claude`, or any other AI model name.
- Do not append automatically generated attribution to commit messages.

<!-- end-rule-commit-->

<!-- begin:research-before-design-rule:start -->

### Research Before Design

- Keep Superpowers as the primary brainstorming, planning, and development workflow.
- For new ideas, features, business workflows, or external integrations, conduct relevant research before recommending solutions:
  - **`business-analyst`**: Investigate business requirements, domain rules, stakeholder needs, business processes, and established best practices.
  - **`workflow-mapping`**: Explore and optimize business workflows, user journeys, state transitions, edge cases, failure scenarios, and recovery paths.
  - **`web-research`**: Research existing solutions, official documentation, SDKs, APIs, libraries, frameworks, cloud services, and integration patterns.

### Research Guidelines

- Prioritize official documentation, primary sources, and reputable GitHub repositories.
- Verify current versions, compatibility, limitations, and recommended integration practices.
- Investigate existing solutions and proven patterns before proposing new implementations.
- Compare relevant alternatives, including their advantages, disadvantages, and trade-offs.
- Clearly distinguish verified facts, assumptions, and recommendations.
- Provide source references for important research findings.

### Workflow Integration

- Perform relevant research before recommending architecture, features, workflows, or implementation approaches.
- Use research findings to inform Superpowers brainstorming and design decisions.
- Activate only the skills relevant to the current task; do not invoke all three unnecessarily.
- Skip extensive research for trivial or well-understood tasks.
- Continue with the standard Superpowers planning and implementation workflow after design approval.

<!-- end:research-before-design-rule:end -->

<!-- begin:superpowers-workflow-rule:start -->

### Superpowers Workflow (Mandatory Order and Approval Gates)

When a request involves building or changing anything, follow the Superpowers workflow in exactly this order. Never jump to code because a request is detailed. Never perform an action (creating files, branches, commits, installs, deletions) that the user has not explicitly allowed.

- **Step 0 — `using-superpowers`:** Before any response or action, including clarifying questions, check which skills apply and invoke them. A request to build something means `brainstorming` comes first, not code.
- **Step 1 — `brainstorming`:**
  - The first message contains only two things: one line saying the user may skip the questions and let the agent start, and ONE open question. If the user skips, state the main technology choices in one line and continue through the normal workflow (spec and plan are still written).
  - Each later message ends with a single question. Do not ask what the user has already stated in the request.
  - Cover: what the thing is, why now and what success looks like, goals / non-goals / anti-goals, prior art, current state, details the user cares about, and how it gets made (platform, language, libraries).
  - Offer reconnaissance (codebase, user files, web) and say what will be looked for; the user decides.
  - Play back understanding in about 200-300 words per part, mark guesses as guesses, and ask what is wrong or missing.
  - Offer the visual companion only in its own message, only when seeing would help, and only once unless the user raises it again.
  - Run research per the "Research Before Design" rule when the idea, feature, or integration is new.
  - For a project, write the design to `docs/superpowers/specs/YYYY-MM-DD-<topic>-design.md` (in this repository under `easy_mindmap_knowledge/docs/superpowers/specs/`). Then run the builder check with a fresh subagent and sort its questions into: already answered (put in the spec), minor (decide and mark as the agent's call), and the user's (ask once, most important first).
  - **GATE:** Do not build anything (no product code, scaffolding, dependency installs, project creation) until the user approves the written design.
- **Step 2 — `writing-plans`:** After the spec is approved, announce "I'm using the writing-plans skill to create the implementation plan", save the plan to `docs/superpowers/plans/YYYY-MM-DD-<feature>.md` with the required header (Goal, Architecture, Tech Stack, Spec, Global Constraints, Review Focus), bite-sized tasks with exact files, interfaces, and test-first steps, then self-review it.
  - **GATE:** The user reads the plan and chooses the execution method (subagent-driven or native). Recommend one with a one-sentence reason. Do not start implementation before the user answers. "Go ahead" after approving the spec is not approval of the plan or of the execution method.
- **Step 3 — isolated workspace (`using-git-worktrees`):** Work in an isolated worktree or branch. Never work on main/master without explicit consent. Creating a branch or worktree requires the user's permission.
- **Step 4 — execution (`executing-plans` or `subagent-driven-development`):** Keep a ledger, run `test-driven-development` for every task (a failing test first, watched failing; minimal code; full suite green), follow each task's steps in order, commit as the plan says, and record every deviation as a `Ruling:`. Stop only for destructive or irreversible operations, security-sensitive actions, side effects outside the workspace (merge, push, publish), or a plan too broken to follow.
- **Step 5 — `verification-before-completion`:** Never claim work is done, fixed, or passing until the verification command has been run and its output read.
- **Step 6 — review (`requesting-code-review`):** One fresh reviewer checks the whole branch. Re-grade findings by effect; fix Critical and Important findings with a failing test first; record Minor findings as deferred.
- **Step 7 — `finishing-a-development-branch`:** Decide how to integrate. Merge, push, and publish require the user's permission. The final report lists every ruling made and every deferred minor.

Order summary: using-superpowers -> brainstorming (+ research) -> spec -> [user approves spec] -> writing-plans -> [user approves plan and picks execution method] -> branch/worktree (with permission) -> execution with TDD -> verification -> review -> finishing the branch.

When the user says "start over" (or an equivalent), restart this workflow from Step 0. Do not ask again about things the user already specified, and do not continue previous work that was never approved.

<!-- end:superpowers-workflow-rule:end -->

<!-- begin:select-skills-usp-rule:start -->

### Select Skills Flag (`/select-skills-usp`)

`/select-skills-usp` (short for select-skills-using-superpowers) means: SELECT ALL SKILLS RELEVANT TO THIS TASK, record them, and get the user's confirmation before each workflow step. It applies only when the user includes the flag in the request.

**Selecting the task skills (right after Step 0):**

- Immediately after Step 0 (`using-superpowers`), re-check all available skills and pick every skill relevant to the task.
- Check whether the selection file exists: `easy_mindmap_knowledge/docs/usp-select-skills/YYYY-MM-DD-<topic>-skills.md`.
- If the agent has not yet selected skills for this task (the file does not exist), select them now and write the file immediately. Never overwrite an existing file; reuse it and only append.
- Required structure, one line per skill in the form `<skill-name> --- <purpose for this task>`:

```markdown
## CHOOSEN SKILLS FOR THIS TASK
- web-research --- for finding any services or existing flow documentation
- structure-codebase --- for structuring files and modules into meaningfully named folders, avoiding flattening everything into the top-level folder
```

**Per-step selection (Step 1 and every step after it):**

1. Before each workflow step, choose the skills relevant to that step, only from the skills listed in the selection file.
2. Append them to the END of the same file, before doing anything else for that step:

```markdown
## STEP 1:
- web-research
- find-workflow
```

3. STOP. Do not load those skills and do not start the step. Tell the user which skills were selected for the step and wait for the user to review.
4. Only after the user confirms, LOAD the step's skills and then perform the step.
5. Repeat items 1-4 for every following step, exactly the same way.

This flag adds an extra confirmation gate; it never replaces or weakens the approval gates in the Superpowers Workflow rule.

<!-- end:select-skills-usp-rule:end -->

<!-- begin:diff-type-subagents-rule:start -->

### Mixed-Vendor Subagents Flag (`/diff-type-subagents`)

`/diff-type-subagents` means: delegate work to subagents of different vendors (Haiku through the Agent tool, Codex CLI, Agy CLI) under the rules below, with Claude Code as orchestrator and reviewer. It applies only when the user includes the flag in the request. Without the flag, the existing subagent-model memory rules apply. This flag never replaces or weakens the Superpowers approval gates (spec, plan, branch, commit, merge, push).

Status of this section: written on 2026-11-10 for the user to check. Items marked **[Decided]** were decided by the user. Items marked **[Proposed]** are the agent's proposal and have not been measured or confirmed. Items marked **[Unverified]** must be checked before being relied on.

#### Installed CLIs: default assumption and custom lists **[Decided]**

- The sections below assume that **Codex CLI and Agy CLI are installed** (verified on 2026-11-10 on the user's machine). The models, effort levels, commands, quota rules and fallback chains below are verified only for these two CLIs.
- If the user types the flag with no list (`/diff-type-subagents`), assume Codex CLI and Agy CLI and run the pre-flight checks below.
- If the user adds a list of installed CLIs to the flag (example: `/diff-type-subagents I installed: opencode CLI, minimax CLI, AGY CLI`), do **not** reuse the tables below for any CLI on that list. Treat every CLI on the list as unverified and go back to the first step, in this order:
  1. **Check auth for each CLI.** Find that CLI's own way to show login status. If it has none, use a successful query (for example listing its models) as the evidence, and say that this is an inference. Do not assume it is logged in.
  2. **Ask the user whether to spawn a "Hello" test task for each CLI**, and state the purpose in the question: to confirm that the CLI is logged in, that its non-interactive command works, and that the session is saved and visible in that CLI's `/resume`. Do not spawn the test before the user agrees. If the user declines, do not use that CLI as a subagent until it has been verified, unless the user explicitly says to skip verification.
  3. **If the user agrees, run the test.** Run an interactive session in the intended working directory (through `tmux`, see "Session visibility"), in the safest mode (read-only, no dangerous or bypass flags), send `Hello`, and exit cleanly. Give the user the exact input, the exact output and the session ID, so the user can compare them with what that CLI's `/resume` shows. Wait for the user to confirm that the session is visible and matches.
  4. **After the user confirms, list that CLI's models and effort levels** from the CLI's own commands or official documentation: the models, the minimum and maximum effort, which models have a fixed or non-adjustable effort, and whether quota or usage can be read. Record these facts for the current task and say which are verified and which are not.
  5. **Only then may that CLI's agents be used as subagents.** Add a new CLI to the fallback chains and to a task's assignment only by the user's decision: propose a place for it and ask, never invent its position.
  6. **Record what was discovered in this file. This step is mandatory.** Before the CLI's agents are used for real work, update "Models and effort levels" below: add a row for every discovered model (vendor and CLI version, model id, effort levels, notes such as "effort fixed" or "not adjustable"), and update the commands, pre-flight checks and quota notes if this CLI differs from Codex and Agy. Mark anything not verified as **[Unverified]**, and write the date. Tell the user which rows were added. Do not leave discovered models only in the conversation.
- The Haiku (Agent tool) route and the orchestrator rules do not depend on any CLI and are always available.

#### Roles

- **[Decided] Orchestrator = the Claude Code session (Sonnet 5.5).** It coordinates, writes task briefs, talks to the user, and **reviews every task and the whole branch**. When a worker proposes a change to a factual claim, it re-checks the official source itself and never trusts a worker's report.
- **[Decided] No Sonnet subagents.** Sonnet is only the reviewer. Workers are Haiku 5.5, Codex CLI models, and Agy CLI models.
- **[Decided] Never spawn or call any Opus model**, including `claude-opus-4-6-thinking` inside Agy and Opus 5.5 through the Agent tool.
- **[Decided] `claude-sonnet-4-6` inside Agy may be used a little**, as an arbiter for the hardest items (disputed or low-confidence findings).
- A worker never reviews its own output. Whoever writes a change does not approve it.

#### Models and effort levels (checked on 2026-11-10 on the user's machine)

| Vendor | Model | Effort | Notes |
|---|---|---|---|
| Haiku (Agent tool, `model: haiku`) | Haiku 5.5 | High / XHigh | Keep each prompt under 100K tokens (third-party sources say prices multiply by 5 above that) |
| Codex CLI 0.167.0 | `gpt-6.1-sol` | low, medium, high, xhigh, max, ultra | Default workhorse |
| Codex CLI | `gpt-6-astra` | same | "Frontier intelligence", for the most demanding work only |
| Codex CLI | `gpt-6.1-terra`, `gpt-6-luna` | luna: low to max (no ultra) | Terra balanced, Luna fast and cheap, for easier tasks |
| Agy CLI | `gemini-3.8-flash-low`, `-medium`, `-high` | Chosen by the model name | `--effort` also exists (`low\|medium\|high\|xhigh\|max`) |
| Agy CLI | `claude-sonnet-4-6` (Thinking) | **Not adjustable**: `--effort` is rejected for this model | Arbiter only |
| Agy CLI | `gpt-oss-120b-medium` | **Fixed at medium**: `--effort` conflicts with the model name | Only for very low-effort mechanical work (formatting, counting, merging reports) |

- **Keeping this table current [Decided].** The table is a record of what was verified, not a fixed list. It was checked on one machine on 2026-11-10; another machine may have other CLIs, other models or other CLI versions. So:
  - On a machine whose installed CLIs are unknown, or when the user lists other CLIs, discover them with the steps in "Installed CLIs" and then **update this table** (step 6 there).
  - On every use, compare the live model list (pre-flight check 2) with the table. A model that is missing from the table gets a new row (effort and quota marked **[Unverified]** until checked). A row whose model no longer exists, or whose CLI version changed, is re-verified, then corrected or removed.
  - Never rely on a row without a check date, and never use a model that is not in the table without first adding and verifying it.
- Never use effort `ultra` (Codex automatically delegates tasks, which raises cost and makes the agent wander) or `max`, unless the user asks.
- Prices are **[Unverified]**, taken from third-party sites (not the vendors' pages): Haiku 5.5 about $0.10 input / $0.50 output per million tokens; Gemini 3.8 Flash $0.75 / $3.75 (promotional until 2026-12-31, then reported to double); GPT-6.1 Sol $2 / $10 (one site says $1 / $5). The user's Codex and Agy accounts are subscriptions (ChatGPT login, Google AI Pro), so the real cost is usage quota, not money per token. Prices only show which model uses more quota relatively.

#### Assigning tasks to models

- Which model does which task is decided per task, in that task's own spec or plan. This file only holds the general rules.
- Pick the cheapest model that is accurate enough for the kind of task. When accuracy for a kind of task is not known, measure it on one small, read-only sample before relying on the choice.
- Use a script instead of a model for mechanical work.

#### Pre-flight checks before delegating

1. Codex auth: `codex login status` must print "Logged in". Agy auth: `agy models` must return the model list (Agy has no login-status command; a successful query is the evidence).
2. Model exists: `codex debug models` (parse the JSON, do not print it whole) and `agy models`. Compare the result with "Models and effort levels" and update that table if they differ.
3. Effort is valid for the model (see the table). Do not pass `--effort` to Claude or GPT-OSS models in Agy.
4. Run read-only unless the user explicitly allowed writes for this task. Never use `--dangerously-bypass-approvals-and-sandbox` or `--dangerously-skip-permissions`. If writes are needed: Codex `-s workspace-write` and Agy `--mode accept-edits`, only inside an isolated worktree or branch that the user allowed.
5. Run in the intended working directory, not a temp directory, when the user wants to see the session later (see "Session visibility").
6. Read the quota percentage if a way exists (see "Quota rules"). **[Unverified]** no command for it was found in Codex or Agy on 2026-11-10.
7. Give each worker a task folder with a brief, a ledger and a single output file (see "Handoff").

Non-interactive command shapes (add the `rtk` prefix as the project rule says):

- Codex: `codex exec -m <model> -c model_reasoning_effort=<effort> -s read-only --skip-git-repo-check -o <last-message-file> "<prompt>" </dev/null`. Always close stdin with `</dev/null` when it is started from an automated shell: on 2026-11-10 two runs without it hung for 7+ minutes at "Reading additional input from stdin..." and never started a session, while the same runs with it finished normally. Add `-C <dir>` to choose the working directory.
- Agy headless runs (`--print`) cannot ask for permission: a tool that needs the "command" permission is denied automatically and the run ends with a "no output produced" message. This is a safe default for read-only audits. Do not add `--dangerously-skip-permissions` to work around it.
- Agy: `agy --print "<prompt>" --model <model-id> [--effort <effort>] --output-format text` (Agy supports `--json-schema` to force a structured result, and exits with code 3 when `--print-timeout` cuts a turn short)
- Haiku: Agent tool with `model: haiku`.

#### Session visibility

- `codex exec` and `agy --print` create non-interactive sessions.
- **Codex:** `/resume` hides `exec` sessions by default. To see them, run `codex resume --include-non-interactive` in the project directory **[Verified 2026-11-10]**. The filter `Cwd` shows only sessions started in the current directory; use `--all` (or the `All` filter) for sessions started elsewhere, such as an isolated worktree. The flag `--thread-source cli` does **not** make an `exec` session visible; do not use it for this.
- **Agy:** both Agy and Codex tie a session to the working directory. Whether `agy --print` sessions appear in Agy's `/resume` is **[Unverified]**; check before relying on it.
- Run a worker from the directory the user will look in (`-C "$(pwd)"` for Codex) when the work is read-only. Work that writes runs in an isolated worktree, so its sessions are found with `--all`.
- Only when the user wants to watch a whole live conversation, run an interactive session in the project directory through `tmux`, exit it cleanly, and give the user the session ID and the captured screen.

#### Keeping workers on task (anti-wandering)

- One task, one output file with a fixed schema. List the paths a worker may read and write, a stop condition, and "do nothing outside this list".
- Run non-interactive so workers cannot ask questions back.
- Small batches that finish quickly, with results written to disk after every batch.
- The Codex model catalog contains "persistent mode" instructions that tell the model to proactively do follow-up work. **[Unverified]** whether it is active by default, so constrain Codex prompts tightly.
- Worker results are leads until the orchestrator verifies them. Sources must be official documentation; blogs and study sites are leads only.

#### Worker rules: workers do not know this project's rules **[Decided]**

- **Fact (tested 2026-11-10):** Codex CLI and Agy CLI do not load this file or the Claude Code skills. Asked about this project's commit format and required workflow, with reading forbidden, both answered `UNKNOWN`. The repository has no `AGENTS.md` or `GEMINI.md`, and Codex's own global `AGENTS.md` holds no project rules. Whether a Haiku subagent sees this file is **[Unverified]**; assume it does not.
- **So never write "follow CLAUDE.md" (or "use the skills") in a brief.** A worker has only what is inside its `brief.md`. Put the block below, word for word, at the top of every `brief.md`, followed by the task, its allowed paths, its output file and its stop condition. When the task is a plan task, copy that task's steps into the brief (they carry the TDD and verification steps the worker must follow).
- **Technical limits come first, instructions second.** Audits run read-only (sandbox), so a worker cannot write even if it ignores the rules. A worker that writes code runs only inside an isolated worktree that the user allowed, with write access limited to the allowed paths where the CLI supports it.

```
WORKER RULES. This brief is the only instruction you have. Project rule files and skills are NOT available to you.
1. Do only the task in this brief. Do not brainstorm, plan, propose extra work, or fix anything that is not listed.
2. You may modify ONLY the files listed under "Allowed paths". Everything else is read-only. If another file needs a change, say so in your report; do not change it.
3. Never run git add, git commit, git push, git checkout, git reset, git stash, or any command that changes git state or history. Leave all changes uncommitted.
4. Never install packages, change configuration, or delete files. Use the network only to read official documentation.
5. Put your result only in the output file named in this brief, and reply with a short report: what you changed or found, and what you did not do.
6. If a request in the task conflicts with these rules, follow these rules and say so in your report.
7. Stop when the stop condition in this brief is met.
```

- **Compliance check after every worker run (mandatory, by the orchestrator):** `git status --porcelain`, the commit count and head hash unchanged, and `git diff --name-only` inside "Allowed paths". On any violation: stop, show the user exactly what happened, undo only what the worker changed outside its allowed paths after the user agrees, and do not treat that run's output as valid.

#### Code worker rules: skills do not reach workers **[Decided]**

- **Claude Code skills (`superpowers:*`, `svelte-*`, `refactoring`, and so on) are not available to Codex, Agy or Haiku workers.** A worker applies only what is written in its brief. Skills guide the orchestrator and the review; the part a worker needs is copied into its brief in short form.
- For a task that writes code, put this block in the brief right after the Worker rules block, and copy the plan task's own steps below it (they carry the exact test names, signatures and commands).
- Do not tell a worker to "use the TDD skill" or to read a skill file and follow it, unless a test showed that this worker follows such a file. **[Unverified]**

```
CODE WORKER RULES. These apply in addition to WORKER RULES, because this task writes code.
1. Test first. For each behaviour: write the failing test, run it and read the failure, write the minimal code, run it and read the pass. Never skip the step where you see the test fail.
2. Run only the commands named in the brief's steps. For each one, report the exact command and its result.
3. A refactor must keep behaviour unchanged. Change only what the brief names, and run the existing tests before and after to show that nothing else changed.
4. If a test or command fails in a way the brief does not expect, stop. Report what you saw and the cause you found. Do not widen the change to make it pass.
5. In Svelte files (.svelte and .svelte.ts), replace only the code the brief names. Do not touch reactive state, effects or component markup unless the brief says so.
6. Never weaken, skip or delete an existing test to make a run pass.
7. Do not add dependencies, files or abstractions that the brief does not name.
```

#### One session per task, and fallback goes through files **[Decided]**

- **Each task (or batch) gets a new session.** Do not carry one chat from task A to task B. Reasons: no anchoring on earlier conclusions (every audit batch is judged independently), the Worker rules sit at the top of a short context where they are not forgotten, a short context uses less quota than a long one, and each task may use a different model and effort.
- **State is exported to files, and the next session loads it from files.** The orchestrator (not the worker) writes `ledger.json`, `notes.md` and `results/` after each task. The next task's `brief.md` contains the Worker rules, the new task, and only the part of `notes.md` that the task needs. A worker's own statement that it followed the rules is never evidence; the compliance check above is.
- **Reusing a session is allowed only for a retry or a small correction of the same task** (for example, fixing a wrong output format after review) while the context is still small. The files remain the source of truth.
- **Fallback to another vendor works the same way.** The new agent never receives the old agent's session. The orchestrator builds a new brief from the files: "continue from the first batch that is not done". Only what was written to files is handed over; the old agent's private reasoning is lost, so `notes.md` must record sources found, items still unsure and conventions agreed. A batch that was being written when the old agent stopped counts as not done and is redone, and the newest "done" batch is checked for truncation first.
- Resuming a CLI session non-interactively was not verified for Codex or Agy (Agy has `--continue` and `--conversation <id>`; Codex has `resume`). Check before relying on it.

#### Handoff, so another agent can continue

Agents do not share memory; the only thing a successor knows is what is in files. **[Decided]** For every delegated task the orchestrator creates this folder, at the repository root (this path is already ignored by git through `.superpowers/` in `.gitignore`, so working state is never committed):

```
.superpowers/diff-agents/YYYY-MM-DD-<topic>/<task-id>/
├── brief.md          goal, scope, allowed paths, output format, stop condition
├── ledger.json       each batch marked pending, running, done, or failed, with the agent and model that ran it
├── notes.md          sources found, items still unsure, decisions taken
└── results/
    └── batch-NN.json one result file per batch, written as soon as the batch finishes
```

- A worker writes only inside its own task folder. The orchestrator creates the folder and passes the exact path in the brief. A worker never picks a location itself and never writes anywhere else in the project.
- Read-only workers return their result to the orchestrator (Codex with `-o <file>` inside the task folder, Agy by redirecting output into it); the orchestrator saves it as the batch file and updates the ledger.
- Deliverables that the user reviews or that belong in the project (reports, specs, plans) are not stored here. They go to the tracked location that the task's spec or plan names, and are built from the `results/` files.
- The folder is disposable working state. Delete it when the task is finished and the user has accepted the deliverables.

When a worker stops (quota, error, timeout), the orchestrator: reads the ledger, checks the last "done" batch for truncation, then gives the successor the brief, the finished results and the notes with the instruction "continue from the first batch that is not done; do not redo done batches". The orchestrator does not take the task over itself and does not restart it from zero.

#### Quota rules

- **[Proposed]** Thresholds (the user decides): 20% or more left = normal work. Between 5% and 20% = only small preparation tasks with a clear stopping point, for example collecting official source URLs and excerpts into a notes file marked "unverified", or sorting work items by difficulty. Below 5% = start no new task, and leave the rest for the user's own use, because the quota is the user's personal subscription.
- Preparation output is a lead. The successor re-verifies the key claims before using them.
- **[Unverified]** Whether `gpt-6-luna` or `gpt-6.1-terra` use the same quota as Sol (then switching to them saves nothing) is not known. Check before relying on it.
- Because no quota command is known, detect running out reactively: a non-zero exit code, a rate-limit or usage-limit message in the output, or HTTP 429. The exact message text for running out of quota has not been captured yet. Do this check once and record the text here.

#### Fallback chains **[Decided]**

- Codex, when exhausted -> Agy, when exhausted -> Claude (Haiku 5.5 through the Agent tool; never Opus, and Sonnet only reviews).
- Agy, when exhausted -> Codex, when exhausted -> Claude (same).
- Claude exhausted -> stop. Save the ledger, report the state to the user, and do not continue.

Rules for a fallback:

- Switch to the equivalent model: Sol high -> Agy `claude-sonnet-4-6` or `gemini-3.8-flash-high`; Agy Gemini high -> Codex Sol medium; either -> Haiku 5.5 XHigh at the end.
- Hand over through the task folder (see "Handoff"), never by retelling from memory.
- A result produced after a fallback to a weaker model gets a lower confidence label and a more careful review by the orchestrator. For high-value work where accuracy matters, tell the user that waiting for the quota to reset may be better than a weaker model, and let the user choose.
- Tell the user each time a fallback happens: which agent, which task, which batch, and why.

<!-- end:diff-type-subagents-rule:end -->
