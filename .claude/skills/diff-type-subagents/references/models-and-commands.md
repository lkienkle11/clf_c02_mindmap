# Models, commands, quota and fallback (procedure)

This file holds the generic procedure. What was recorded on a machine (the models table, worker capabilities, command shapes, pre-flight checks, session-list rows, quota notes) lives in `models.md` of the config folder (see "Where the config lives" in `SKILL.md`); its blank form is `references/templates/models.md`, with the same headings as below. The custom-CLI procedure is Gate 1B in `SKILL.md`. The handoff folder and "one session per task" are Gate 4 in `SKILL.md`. Fallback order, equivalents, effort ceiling, quota thresholds and command prefix are in `policy.md` of the config folder. The recorded tables describe the machine where they were recorded: Gate 1 re-checks them, and a CLI or model that is not found there is not used.

## Models and effort levels

The models table is a record of what was verified, not a fixed list.

- **Keeping the table current [Decided].** Another machine may have other CLIs, other models or other CLI versions. So:
  - On a machine whose installed CLIs are unknown, or when the user lists other CLIs, discover them with the steps of Gate 1B in `SKILL.md` and then **update the table** (Gate 1B step 6 in `SKILL.md`).
  - On every use, compare the live model list (pre-flight check 2) with the table. A model that is missing from the table gets a new row (effort and quota marked **[Unverified]** until checked). A row whose model no longer exists, or whose CLI version changed, is re-verified, then corrected or removed.
  - Never rely on a row without a check date, and never use a model that is not in the table without first adding and verifying it.
- **How to write into the table [Decided 2026-11-12].**
  - **Append** a new row for a new CLI or a new model: place it at the end of that vendor's group, or at the end of the table when the vendor is new. Keep every existing row unchanged.
  - **Replace** an existing row only when pre-flight check 2 shows a mismatch (model gone, CLI version changed, effort levels changed). Correct or remove only the mismatching row and update the check date of that row only. Rows that did not mismatch keep their text and their date. Replacing a row on a mismatch keeps its `passed` lines only when the model, effort and CLI version are unchanged; otherwise they are removed with the old text. A permitted edit besides these: the Notes cell of an existing row may receive an appended dated line `passed (<effort>, <kind>): <date>`, written by Gate 6 step 1b, shown as a diff first. The config folder keeps the previous text of a changed file as `<file>.prev` (see Where the config lives in `SKILL.md`); do not keep old text in the file itself.
  - **Row format:** put the CLI version and the check date in the first column, for example `<cli> <version> (<date>)`. Existing rows that only carry the table's heading date stay as they are until they are re-verified.
  - **Show the diff first.** Show the user the diff of the file before writing it as final; the config folder is not a git repository, so there is nothing to commit.
- The effort ceiling is in `policy.md`.
- Prices, when recorded, are **[Unverified]** unless taken from the vendor's own page. The user's CLI accounts are usually subscriptions, so the real cost is usage quota, not money per token.

## Worker capabilities (per CLI and mode)

Capabilities belong to a CLI in one mode (rows of the recorded table); the host's own subagent mechanism is measured per model. Each cell is `yes`, `no` or `[Unverified]`, followed by the check date. A worker whose cell is `no` or `[Unverified]` in a column its task needs is not eligible for that task. Rows are added by the Gate 1B probe (step 3b in `SKILL.md`); none is written from memory.

| CLI and mode | Reads path | Reads outside folder | Runs commands | Writes files | Web | Sees skills itself |
|---|---|---|---|---|---|---|

A row is one CLI in one mode; its cells were measured in that mode only. A task is eligible for a row only if every column the task needs is `yes` in that row. Least permission: of the rows of one CLI that pass, a task that does not write uses a row whose `Writes files` is not `yes` when one passes (a read-only mode), and a write-mode row is allowed for it only when no read-only row passes (marked `(write-mode row for a read-only task)`, see `references/allocation.md` step 2); a task that writes uses only rows with `Writes files` = yes. The host-mechanism rows are dated per model. [Unverified] A host mechanism that lets the caller pick a model but not an effort level has that limit from the tool's parameters as listed, not from a probe. Row template for any other host: all six cells `[Unverified]` until the probe is run for it (Gate 1B for a CLI, the Gate 1A host sub-step for a host mechanism).

Note: the session-list command of the host's own subagent mechanism is [Unverified] until the user confirms how the host shows its subagent runs (see the Session-list table below).

## What each worker can and cannot do

Dated prose notes from probes and runs, per CLI, recorded in `models.md`. No worker's "verified" is evidence: for every disputed item, and for a sample of "verified" ones, the orchestrator reads the newest official page itself (Gate 6). A worker's JSON is always parsed, and the worker is asked again when parsing fails.

## Command shapes

The shape of each worker command is recorded per CLI in `models.md`, found at Gate 1B from the CLI's own help or official documentation (the command prefix of `policy.md` is never part of a shape). Rules that hold for every shape:

- A worker command is run through the launch wrapper of `references/running-workers.md` (own process, log file, `exit.code`, `done` last), never as a blocking command in the chat. Inside the wrapper the worker command already has stdin closed and its output goes to the log file; the user's command prefix is not applied inside the wrapper, because its output is not read from the terminal.
- The mode flag of each shape comes from the chosen row's mode, and a run started in another mode than the row's is invalid.
- Close stdin when a CLI is started from an automated shell, so that it does not wait for input.
- Never a flag that bypasses approvals or the sandbox, and never a flag that the CLI's documentation says skips permissions, approvals or the sandbox. Record such flags in `models.md` as data, to avoid them.
- A headless run that cannot ask for permission is a safe default for read-only work: a tool that needs a permission is denied and the run ends. Do not add a bypass flag to work around it.
- Effort must be valid for the model, as recorded in the models table (some models have a fixed effort and reject an effort flag).
- If writes are needed, use the CLI's write mode only inside an isolated worktree or branch that the user allowed.

## Pre-flight check commands

Data for Gate 1A in `SKILL.md`: one row per CLI in the recorded table, the commands that were verified for it. Gate 1A runs the checks recorded there for each CLI in the models table; a CLI with no row is not re-checked from memory but goes through Gate 1B. Commands run read-only, without the command prefix of `policy.md` inside any wrapper.

| CLI | Login check | Live model list | Effort validity | Quota read | Session-list command |
|---|---|---|---|---|---|
| Any other CLI | its own login-status command, or a successful query as an inference, found at Gate 1B | its own model-list command, found at Gate 1B | as recorded in the models table | [Unverified] until found | as recorded in "Session visibility" |

## Session visibility

**Session-list table** (one row per CLI in the recorded table; a CLI is added at Gate 1B and re-checked at Gate 1A). The rule in `SKILL.md` ("Every worker session must be listed") uses these rows.

| CLI | Command that lists every worker session | Running session followable in real time | Status |
|---|---|---|---|

Notes:

- A non-interactive run may be hidden from the CLI's default session list; find the flag or command that shows it at Gate 1B.
- A CLI may tie a session to the working directory; sessions started in another directory are **[Unverified]** until checked.
- Run a worker from the directory the user will look in when the work is read-only. Work that writes runs in an isolated worktree, so its sessions are found with the CLI's all-directories option, if it has one.
- Only when the user wants to watch a whole live conversation, run an interactive session in the project directory through a terminal multiplexer, if the `Environment` table of `policy.md` says one exists (otherwise use the CLI's non-interactive command, or ask the user to run the interactive session in their own terminal and report what they see), exit it cleanly, and give the user the session ID and the captured screen. Never install a multiplexer.
- Resuming a CLI session non-interactively is not verified until it is checked; check before relying on it.

## Quota notes

Thresholds, fallback order and equivalents are in `policy.md`. When no command to read the quota percentage is found for a CLI, running out of quota is detected reactively (see Gate 6 in `SKILL.md`); record the exact message text for running out of quota in `models.md` once it has been seen.
