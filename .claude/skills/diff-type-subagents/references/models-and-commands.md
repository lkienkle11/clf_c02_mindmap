# Models, commands, quota and fallback

This file holds machine data (the models table, worker capabilities as tested on one machine) and command shapes. The custom-CLI procedure ("Installed CLIs") is Gate 1B in `SKILL.md`. The handoff folder and "one session per task" are Gate 4 in `SKILL.md`. Fallback order, equivalents, effort ceiling, quota thresholds and command prefix are in `policy.md`. When this skill is used on another machine, the table and the "tested" notes below describe the machine where they were recorded: Gate 1 re-checks them, and a CLI or model that is not found there is not used.

## Models and effort levels (checked on 2026-11-10 on the machine where this table was recorded)

| Vendor | Model | Effort | Notes |
|---|---|---|---|
| Haiku (Agent tool, `model: haiku`) | Haiku 5.5 | High / XHigh | Keep each prompt under 100K tokens (third-party sources say prices multiply by 5 above that) |
| Codex CLI 0.170.0 (2026-11-19) | `gpt-6.1-sol` | low, medium, high, xhigh, max, ultra | Default workhorse |
| Codex CLI | `gpt-6-astra` | same | "Frontier intelligence", for the most demanding work only |
| Codex CLI | `gpt-6.1-terra`, `gpt-6-luna` | luna: low to max (no ultra) | Terra balanced, Luna fast and cheap, for easier tasks |
| Agy CLI | `gemini-3.8-flash-low`, `-medium`, `-high` | Chosen by the model name | `--effort` also exists (`low\|medium\|high\|xhigh\|max`) |
| Agy CLI | `claude-sonnet-4-6` (Thinking) | **Not adjustable**: `--effort` is rejected for this model | Arbiter only |
| Agy CLI | `gpt-oss-120b-medium` | **Fixed at medium**: `--effort` conflicts with the model name | Only for very low-effort mechanical work (formatting, counting, merging reports) |

- **Keeping this table current [Decided].** The table is a record of what was verified, not a fixed list. It was checked on one machine on 2026-11-10; another machine may have other CLIs, other models or other CLI versions. So:
  - On a machine whose installed CLIs are unknown, or when the user lists other CLIs, discover them with the steps in "Installed CLIs" and then **update this table** (step 6 there).
  - On every use, compare the live model list (pre-flight check 2) with the table. A model that is missing from the table gets a new row (effort and quota marked **[Unverified]** until checked). A row whose model no longer exists, or whose CLI version changed, is re-verified, then corrected or removed.
  - Never rely on a row without a check date, and never use a model that is not in the table without first adding and verifying it.
- **How to write into the table [Decided 2026-11-12].**
  - **Append** a new row for a new CLI or a new model: place it at the end of that vendor's group, or at the end of the table when the vendor is new. Keep every existing row unchanged.
  - **Replace** an existing row only when pre-flight check 2 shows a mismatch (model gone, CLI version changed, effort levels changed). Correct or remove only the mismatching row and update the check date of that row only. Rows that did not mismatch keep their text and their date. Git history is the record of old values; do not keep old text in the file.
  - **Row format:** put the CLI version and the check date in the first column, for example `opencode CLI 1.4.2 (2026-11-12)`. Existing rows that only carry the table's heading date stay as they are until they are re-verified.
  - **Show the diff first.** Show the user the diff of this file before writing it as final, and commit only when the user allows it.
- The effort ceiling is in `policy.md`.
- Prices are **[Unverified]**, taken from third-party sites (not the vendors' pages): Haiku 5.5 about $0.10 input / $0.50 output per million tokens; Gemini 3.8 Flash $0.75 / $3.75 (promotional until 2026-12-31, then reported to double); GPT-6.1 Sol $2 / $10 (one site says $1 / $5). The user's CLI accounts are subscriptions, so the real cost is usage quota, not money per token. Prices only show which model uses more quota relatively.

## Worker capabilities (per CLI)

Capabilities belong to the CLI, not to the model. Each cell is `yes`, `no` or `[Unverified]`, followed by the check date. A worker whose cell is `no` or `[Unverified]` in a column its task needs is not eligible for that task. Rows are added by the Gate 1B probe (step 3b in `SKILL.md`); none is written from memory.

| CLI | Reads path | Reads outside folder | Runs commands | Web | Sees skills itself |
|---|---|---|---|---|---|
| Codex CLI 0.170.0 (2026-11-19) | yes (2026-11-19, read-only sandbox (`-s read-only`), gpt-6.1-sol low) | yes (2026-11-19, read-only sandbox (`-s read-only`), gpt-6.1-sol low) | yes (2026-11-19, read-only sandbox (`-s read-only`), gpt-6.1-sol low) | no (2026-11-19, read-only sandbox (`-s read-only`), gpt-6.1-sol low; read-only sandbox with default flags; [Unverified] whether a flag or another mode enables web access) | yes (2026-11-19, read-only sandbox (`-s read-only`), gpt-6.1-sol low; user-level skills and rule files only, listed from its catalog without opening them; project-level skills of the repository are not seen, so a brief must still name each project skill by path) |
| Agy CLI 1.5.11 (2026-11-19) | yes (2026-11-19, `--mode plan`, headless; only inside the working folder) | no (2026-11-19, `--mode plan`, headless; the read tool's permission is auto-denied in headless mode; [Unverified] whether another mode allows it; no bypass flag was tried) | no (2026-11-19, `--mode plan`, headless; the command permission is auto-denied headless; same caveat) | no (2026-11-19, `--mode plan`, headless; the agent replied CANNOT) | [Unverified] (2026-11-19, `--mode plan`, headless; the check was blocked by a command-permission denial, with no listing and no "none" reply) |
| The host's own subagent mechanism (row template, valid for any host) | [Unverified] | [Unverified] | [Unverified] | [Unverified] | [Unverified] |

Agy's `--version` printed 1.5.11 while its interactive banner showed 1.5.12 (discrepancy noted). On 2026-11-19 a skill file copied into the worker's own working folder was read correctly by `agy --print` (check g), which supports the `workspace-copy` delivery mode.

Note: the session-list command of the host's own subagent mechanism is [Unverified] until it is probed.

## What each worker can and cannot do (tested on 2026-11-10)

The per-CLI results of the Gate 1B probe are in the table "Worker capabilities (per CLI)" above; the notes below are prose from the first test.

- **Codex CLI (`gpt-6.1-sol`):** can read a file given by absolute path. It was observed opening web pages by itself while read-only on 2026-11-10 (built-in tool, no shell command needed), but the 2026-11-19 probe in read-only with default flags got CANNOT (see the table "Worker capabilities (per CLI)"). An audit batch of 8 to 29 questions took 2 to 3 minutes and about 76k to 88k tokens, and returned valid JSON in 2 of 2 runs.
- **Agy CLI, headless (`agy --print`):** cannot browse (its web tool needs the "command" permission, which is auto-denied) and cannot read a file outside its working folder (`read_file` is auto-denied), so pass the input inline in the prompt. It answers from memory, so treat every URL it cites as unverified: in the test one cited CAF URL returned HTTP 404. Run time for similar batches varied from 158 s to 501 s.
- **Haiku 5.5 (Agent tool):** has WebSearch and WebFetch. A batch took about 200 s and 100k to 133k tokens. In 1 of 2 runs one JSON item was syntactically broken (a missing key name), so always parse a worker's JSON and ask again when it fails.
- **No worker's "verified" is evidence.** In a control batch of 8 known-defective questions, two of three workers said "verified" with high confidence on the same outdated question (they cited an older page of the AWS documentation, while a newer page of the same documentation said otherwise). AWS pages can disagree with each other, so for every disputed item, and for a sample of "verified" ones, the orchestrator reads the newest official page itself.

## Command shapes (add the command prefix from `policy.md`, if any)

A worker command below is run through the launch wrapper of `references/running-workers.md` (own process, log file, `exit.code`, `done` last), never as a blocking command in the chat. Inside the wrapper the worker command already has stdin closed and its output goes to the log file, so the shapes below need no extra stdin redirection or output capture there; the user's command prefix is not applied inside the wrapper, because its output is not read from the terminal.

- Codex: `codex exec -m <model> -c model_reasoning_effort=<effort> -s read-only --skip-git-repo-check -o <last-message-file> "<prompt>" </dev/null`. Always close stdin with `</dev/null` when it is started from an automated shell: on 2026-11-10 two runs without it hung for 7+ minutes at "Reading additional input from stdin..." and never started a session, while the same runs with it finished normally. Add `-C <dir>` to choose the working directory.
- Agy headless runs (`--print`) cannot ask for permission: a tool that needs the "command" permission is denied automatically and the run ends with a "no output produced" message. This is a safe default for read-only audits. Do not add `--dangerously-skip-permissions` to work around it.
- Agy: `agy --print "<prompt>" --model <model-id> [--effort <effort>] --output-format text` (Agy supports `--json-schema` to force a structured result, and exits with code 3 when `--print-timeout` cuts a turn short)
- Haiku: Agent tool with `model: haiku`.
- If writes are needed: Codex `-s workspace-write` and Agy `--mode accept-edits`, only inside an isolated worktree or branch that the user allowed.

## Session visibility

**Session-list commands per CLI** (one row per CLI; a CLI is added here at Gate 1B and re-checked at Gate 1A). The rule in `SKILL.md` ("Every worker session must be listed") uses these rows.

| CLI | Command that lists every worker session | Running session followable in real time | Status |
|---|---|---|---|
| Codex CLI 0.170.0 (2026-11-19) | `codex resume --include-non-interactive --all` | not checked | **[Verified 2026-11-19]** the combined command runs and its picker lists non-interactive (`codex exec`) worker sessions. Both flags exist in `codex resume --help`. **[Unverified]** that `--all` shows sessions started in another directory (every listed session was started in this project directory, and no CWD column appeared on screen) |
| Agy CLI 1.5.11 (2026-11-19) | `/resume` typed inside an interactive `agy` started in the project directory (Agy has no list subcommand: `agy --help` shows `--continue` and `--conversation <id>` only; it keeps conversations under its own data folder) | not checked | **[Verified 2026-11-19]** by the user: an interactive session and a non-interactive `agy --print` session, both started in the project directory, appeared in that list with content matching what was run. **[Unverified]**: sessions started in another directory; whether a running session can be followed in real time |
| Claude Code | `claude --resume` | not checked | **[Unverified]** |
| Subagent of the host's own mechanism (for example the Agent tool) | not known | not checked | **[Unverified]** whether it has a session list of its own |

Notes from the first test (2026-11-10):

- `codex exec` and `agy --print` create non-interactive sessions.
- **Codex:** `/resume` hides `exec` sessions by default. To see them, run `codex resume --include-non-interactive` in the project directory **[Verified 2026-11-10]**. The filter `Cwd` shows only sessions started in the current directory; use `--all` (or the `All` filter) for sessions started elsewhere, such as an isolated worktree. The flag `--thread-source cli` does **not** make an `exec` session visible; do not use it for this.
- **Agy:** both Agy and Codex tie a session to the working directory. `agy --print` sessions started in the same directory appear in Agy's `/resume` **[Verified 2026-11-19]**; sessions started in another directory are **[Unverified]**.
- Run a worker from the directory the user will look in (`-C "$(pwd)"` for Codex) when the work is read-only. Work that writes runs in an isolated worktree, so its sessions are found with `--all`.
- Only when the user wants to watch a whole live conversation, run an interactive session in the project directory through `tmux`, exit it cleanly, and give the user the session ID and the captured screen.
- Resuming a CLI session non-interactively was not verified for Codex or Agy (Agy has `--continue` and `--conversation <id>`; Codex has `resume`). Check before relying on it.

## Quota notes

Thresholds, fallback order and equivalents are in `policy.md`.

- **[Unverified]** Whether `gpt-6-luna` or `gpt-6.1-terra` use the same quota as Sol (then switching to them saves nothing) is not known. Check before relying on it.
- No command to read the quota percentage was found in Codex or Agy on 2026-11-10. Running out of quota is detected reactively (see Gate 6 in `SKILL.md`). The exact message text for running out of quota has not been captured yet. Do this check once and record the text here.
