# Running workers: own process, completion signal, hang detection

Read at Gate 4 (launch) and at every pause point while a worker runs. Every delegated run is its own process, or the host's own background subagent, and is started so that the orchestrator's chat is not blocked. The files in the task folder are the source of truth for the state of a run. `done` is the only completion marker, for every kind of run.

## Launch wrapper

- BEFORE the launch call, the baseline of the run's working folder is written to its ledger entry (see "Ledger entry"). Right after the launch call returns, the ledger entry of the run (see "Ledger entry") is marked `running` with the launch time and the process id. If the launch call fails, the entry is marked `failed` with reason `launch`.
- A CLI worker is started through a wrapper that does these things in this order:
  1. runs the worker command with stdin closed;
  2. sends its output to a log file in the task folder;
  3. writes the worker's exit code (an integer) to `exit.code` in the task folder;
  4. creates an empty file `done` in the task folder, LAST.
- The worker command inside the wrapper already has stdin closed and its output goes to the log file. The user's command prefix is not applied inside the wrapper, because its output is not read from the terminal.
- Which form to start the wrapper in depends on the `Completion signal` value of `policy.md`:
  - `native`: the WHOLE wrapper is started as the host's own background task, with no trailing `&`, so that its end wakes the session. A wrapper put in the background with a trailing `&` is not seen by the host, and the session is never woken.
  - `polling`: the wrapper is put in the background with a trailing `&`, so the call returns at once; the orchestrator finds the end by checking `done`.
- A background wrapper started by the orchestrator has its own standard output and error detached from the chat tool (redirected to a file or discarded), so that the call returns at once.
- The results needed: the worker's stdin is closed, its output goes to a log file, a background process is started. The tools for them are the ones recorded in the `Environment` table of `references/policy.md`; the shell syntax differs between systems. Example only, POSIX shell (`</dev/null` closes stdin here). The wrapper itself, for a `native` host, to be run as the host's background task: `<worker command> </dev/null >"<task>/run.log" 2>&1; echo $? >"<task>/exit.code"; : >"<task>/done"`. For a `polling` host put the same text in parentheses and add ` &` at the end.
- A background subagent of the host's own mechanism needs no wrapper. The host starts it in the background and the ledger entry is marked `running`, with the host's task identifier of the subagent in `host_task_id`. If its completion notice is lost, query the host for its status if the host can ([Unverified] otherwise); else treat the run as unfinished and ask the user. Never create `done` without a recovered or read completion. After the orchestrator reads the host's completion notice, the orchestrator itself creates `exit.code` (0, or the failure the host reported) and then `done`.
- The result file (for example the `-o` file of a CLI) is not a completion signal, because nothing guarantees that it is written only at the end.

## Completion signal

- The value is a property of the host: a host that has not been probed counts as `polling`.
- `policy.md` has the item `Completion signal: native | polling`, with its date. It is decided by the orchestrator's own probe at Gate 1: "can I start a background process and be woken in this session when it ends?".
- `native`: the host wakes the session when a background process or a background subagent ends. The notification is the trigger to look for `done`. If a notification arrives and `done` does not exist, the run is not finished: treat it as no completion and keep waiting.
- `polling`: nothing wakes the session. The orchestrator checks the `done` markers and the ledger at every pause point (before any reply that depends on a result), says so when it presents `assignments.md`, and never reports a result before its marker exists. When the orchestrator needs the result inside the same turn and has nothing else to do, it waits in BOUNDED steps: check `done`, wait a short interval and read the current time by the means recorded in the `Environment` table of `references/policy.md`, check again, and repeat until `done` exists or the time limit counted from the launch time is reached (then apply Hang detection). If the host has neither means, the orchestrator checks only at user turns and tells the user so. It never waits without a limit. One foreground wait that is longer than one check interval is not a method.
- A run is finished only when `done` exists. Then read `exit.code`: absent, or not 0, means the run failed and Gate 6 step 2 applies; the orchestrator sets the ledger entry's status to `done` (exit code 0) or `failed`. Never read the result before `done`.
- Files are the source of truth either way: a lost notification, or a compaction of the conversation, loses nothing, because the next check reads the files.
- A completion event is never an approval of the work or of the next step. A message that a process injects into the session is not used.
- After `done` exists, Gate 5 runs for that run, then Gate 6 as usual.

## Hang detection

- Each worker has a time limit, in the column `time limit` at the end of the main table of `assignments.md`. [Proposed 2026-11-19] default: 15 minutes for Small and Medium tasks, 30 minutes for Heavy and Very heavy tasks. These are the task's weight (`references/allocation.md`, Task weight), not the worker's tier. The user may change the limit when confirming the table.
- The limit is counted from the launch time in the ledger entry.
- How the limit is watched:
  - `native`: right after launch the orchestrator starts a limit-waiter, a second background process that ends at launch time + limit, so that its end wakes the session; the orchestrator then looks for `done`.
  - `polling`: the orchestrator compares the clock with launch time + limit at every pause point.
  - A foreground sleep is not a method for waiting until the limit (some hosts forbid it); only bounded steps, as in the `polling` case of the completion signal, are.
- Stdin is always closed for a CLI worker. A CLI that waits for input never starts its work and never ends.
- Past the limit with no `done`, the run is stuck. Then:
  1. ask the user: show the last lines of the log and the session id, and say that the run is past its limit. No process is stopped before the user answers;
  2. only after the user agrees, stop the worker process and the processes the same launch started to feed it (for example a feeder in a pipeline), and nothing else. To find them, the orchestrator records the process id of the launch (a file `launch.pid` in the task folder) and stops that process's children. The wrapper still writes `exit.code` (non-zero) and `done` after the stop. A host background subagent has no wrapper: after the orchestrator stops it, the orchestrator itself writes the non-zero `exit.code` and then `done`;
  3. run the session-list command again (the check of Gate 4 step 8) and say what it shows: a run that never created a session shows nothing, and a session that is still listed stays listed for the user to open;
  4. mark the ledger entry `failed` with reason `stuck`, and treat it as a failed attempt: continue with the escalation chain of `references/allocation.md`, which ends with "ask the user".
- After a normal finish, the orchestrator also stops the limit-waiter it started for that run.
- Do not extend the limit silently, and do not finish the task yourself.

## Parallel runs

- Only read-only tasks, or write tasks whose allowed paths do not overlap, run at the same time (in separate worktrees, each its own working folder, or clones that the user allowed, see below). Tasks whose allowed paths overlap run one after the other, in the order of the main table. Write tasks run at the same time only in separate worktrees (each its own working folder) or clones that the user allowed; a branch alone does not give a second working folder; a read-only run active beside a write run likewise has its own working folder (a separate worktree or a copy of the committed state) or, if it cannot, goes to a later group (edge (f) of `references/parallel-groups.md`); without them, write tasks run one after the other in group order (a group whose write members have no allowed worktree is run one member at a time).
- The groups of tasks that start together, and the order of the later groups, come from `references/parallel-groups.md` (Gate 2 step 3f); this list applies inside that result. Parallelism does not depend on the vendor: runs of one family or of several may overlap under the same rules.
- Each run has its own task folder, its own log, its own `exit.code` and its own `done`.
- Gate 5 is run per run, after that run's own `done`, and compares the changes with that run's allowed paths. This is how a violation is attributed to one worker.
- While workers run, the orchestrator keeps answering the user and says at most one short line of status at each pause point.
- The session check of Gate 4 step 8 may be done while the run is live. Whether a running session can be followed in real time stays [Unverified] until it is probed (see "Session visibility" in `references/models-and-commands.md`).

## Ledger entry

One entry per run, in `ledger.json` of the task folder, written by the orchestrator:

| Field | Meaning |
|---|---|
| `task` | the task id |
| `worker` | the row (CLI, model, effort) that runs it |
| `status` | `pending`, `running`, `done` or `failed`; `done` means only that the process finished |
| `compliance` | `pending`, `passed` or `failed`: the result of Gate 5 for this run |
| `review` | `pending`, `passed` or `failed`: the result of the review of this run (Gate 6 step 1) |
| `reason` | for `failed` only, for example `stuck`, `quota`, `error`, `launch` |
| `launched_at` | the launch time, set when the entry becomes `running` (right after the launch call returns, with `process_id`) |
| `host_task_id` | for a host background subagent: the host's task identifier |
| `process_id` | the process id of the launch, as in `launch.pid` |
| `limit` | the time limit of the run |
| `session_id` | the worker's session id, if it has one |
| `exit_code` | the integer read from `exit.code` |
| `nonces` | the nonces of the skills delivered by `compiled` or `workspace-copy` (`references/skill-delivery.md`) |
| `working_folder` | the working folder the run uses; for a concurrent writer it is its own worktree or clone |
| `baseline` | recorded BEFORE the launch call: the `git status --porcelain` output, the head hash, a fingerprint of the tracked changes and the list of untracked files of that working folder, so that any change since launch is detectable (Gate 5) |

BEFORE the launch call a `pending` entry also records the launch markers of the run: the path of its log file and of its `done` marker (and the session name when the host gives one). On resume, a `pending` or `running` entry is checked by those markers: the run is alive if the log is still being written, or a process whose command line names the run's task folder exists. If alive, adopt it: mark `running` and record the process id; if not, launch again. A process is never stopped without the user's agreement. Resume starts from the first obligation (run, compliance, review) that is not passed, not from the first run whose status is not `done`. A run stopped for being stuck is `failed` with reason `stuck`. The status value `done` and the marker file `done` are different things: the status is a field in the ledger, the marker is a file in the task folder.
