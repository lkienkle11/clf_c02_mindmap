# Running workers: own process, completion signal, hang detection

Read at Gate 4 (launch) and at every pause point while a worker runs. Every delegated run is its own process, or the host's own background subagent, and is started so that the orchestrator's chat is not blocked. The files in the task folder are the source of truth for the state of a run. `done` is the only completion marker, for every kind of run.

## Launch wrapper

- At launch, the ledger entry of the run (see "Ledger entry") is marked `running` with the launch time. The orchestrator writes it before the process starts.
- A CLI worker is started through a wrapper that does these things in this order:
  1. runs the worker command with stdin closed;
  2. sends its output to a log file in the task folder;
  3. writes the worker's exit code (an integer) to `exit.code` in the task folder;
  4. creates an empty file `done` in the task folder, LAST.
- The worker command inside the wrapper already has stdin closed and its output goes to the log file. The user's command prefix is not applied inside the wrapper, because its output is not read from the terminal.
- Which form to start the wrapper in depends on the `Completion signal` value of `policy.md`:
  - `native`: the WHOLE wrapper is started as the host's own background task, with no trailing `&`, so that its end wakes the session. A wrapper put in the background with a trailing `&` is not seen by the host, and the session is never woken.
  - `polling`: the wrapper is put in the background with a trailing `&`, so the call returns at once; the orchestrator finds the end by checking `done`.
- The results needed: the worker's stdin is closed, its output goes to a log file, a background process is started. The tools for them are the ones recorded in the `Environment` table of `references/policy.md`; the shell syntax differs between systems. Example only, POSIX shell (`</dev/null` closes stdin here). The wrapper itself, for a `native` host, to be run as the host's background task: `<worker command> </dev/null >"<task>/run.log" 2>&1; echo $? >"<task>/exit.code"; : >"<task>/done"`. For a `polling` host put the same text in parentheses and add ` &` at the end.
- A background subagent of the host's own mechanism needs no wrapper. The host starts it in the background and the ledger entry is marked `running`. After the orchestrator reads the host's completion notice, the orchestrator itself creates `exit.code` (0, or the failure the host reported) and then `done`.
- The result file (for example the `-o` file of a CLI) is not a completion signal, because nothing guarantees that it is written only at the end.

## Completion signal

- `policy.md` has the item `Completion signal: native | polling`, with its date. It is decided by the orchestrator's own probe at Gate 1: "can I start a background process and be woken in this session when it ends?".
- `native`: the host wakes the session when a background process or a background subagent ends. The notification is the trigger to look for `done`. If a notification arrives and `done` does not exist, the run is not finished: treat it as no completion and keep waiting.
- `polling`: nothing wakes the session. The orchestrator checks the `done` markers and the ledger at every pause point (before any reply that depends on a result), says so when it presents `assignments.md`, and never reports a result before its marker exists.
- A run is finished only when `done` exists. Then read `exit.code`: absent, or not 0, means the run failed and Gate 6 step 2 applies. Never read the result before `done`.
- Files are the source of truth either way: a lost notification, or a compaction of the conversation, loses nothing, because the next check reads the files.
- A completion event is never an approval of the work or of the next step. A message that a process injects into the session is not used.
- After `done` exists, Gate 5 runs for that run, then Gate 6 as usual.

## Hang detection

- Each worker has a time limit, in the column `time limit` at the end of the main table of `assignments.md`. [Proposed 2026-11-19] default: 15 minutes for Small and Medium tasks, 30 minutes for Heavy and Very heavy tasks. These are the task's weight (`references/allocation.md`, Task weight), not the worker's tier. The user may change the limit when confirming the table.
- The limit is counted from the launch time in the ledger entry.
- How the limit is watched:
  - `native`: right after launch the orchestrator starts a limit-waiter, a second background process that ends at launch time + limit, so that its end wakes the session; the orchestrator then looks for `done`.
  - `polling`: the orchestrator compares the clock with launch time + limit at every pause point.
  - A foreground sleep is not a method (some hosts forbid it).
- Stdin is always closed for a CLI worker. A CLI that waits for input never starts its work and never ends.
- Past the limit with no `done`, the run is stuck. Then:
  1. ask the user: show the last lines of the log and the session id, and say that the run is past its limit. No process is stopped before the user answers;
  2. only after the user agrees, stop the worker process and the processes the same launch started to feed it (for example a feeder in a pipeline), and nothing else. The wrapper still writes `exit.code` (non-zero) and `done` after the stop;
  3. run the session-list command again (the check of Gate 4 step 8) and say what it shows: a run that never created a session shows nothing, and a session that is still listed stays listed for the user to open;
  4. mark the ledger entry `failed` with reason `stuck`, and treat it as a failed attempt: continue with the escalation chain of `references/allocation.md`, which ends with "ask the user".
- Do not extend the limit silently, and do not finish the task yourself.

## Parallel runs

- Only read-only tasks, or write tasks whose allowed paths do not overlap, run at the same time. Tasks whose allowed paths overlap run one after the other, in the order of the main table.
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
| `status` | `pending`, `running`, `done` or `failed` |
| `reason` | for `failed` only, for example `stuck`, `quota`, `error` |
| `launched_at` | the launch time, set when the entry becomes `running` |
| `limit` | the time limit of the run |
| `session_id` | the worker's session id, if it has one |
| `exit_code` | the integer read from `exit.code` |
| `nonces` | the nonces of the skills delivered by `compiled` or `workspace-copy` (`references/skill-delivery.md`) |

A run stopped for being stuck is `failed` with reason `stuck`.
