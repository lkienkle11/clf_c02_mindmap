# Running workers: own process, completion signal, hang detection

Read at Gate 4 (launch) and at every pause point while a worker runs. Every delegated run is its own process, or the host's own background subagent, and is started so that the orchestrator's chat is not blocked. The files in the task folder are the source of truth for the state of a run.

## Launch wrapper

- At launch, `ledger.json` of the task marks the run `running` with the launch time. The orchestrator writes it, before the process starts.
- A CLI worker is started through a wrapper that does these things in this order:
  1. runs the worker command with stdin closed;
  2. sends its output to a log file in the task folder;
  3. writes the worker's exit code (an integer) to `exit.code` in the task folder;
  4. creates an empty file `done` in the task folder, LAST.
- The wrapper itself is started in the background, so the call returns at once and the chat stays free.
- Example only, POSIX shell (the rules above state the result; the shell syntax differs on other systems, and the Environment table of `policy.md` says how to close stdin and how to start a background process on this machine): `( <worker command> </dev/null >"<task>/run.log" 2>&1; echo $? >"<task>/exit.code"; : >"<task>/done" ) &`
- A background subagent of the host's own mechanism needs no wrapper: the host starts it in the background and `ledger.json` still marks it `running`.
- `done` is the only completion marker. The result file (for example the `-o` file of a CLI) is not a completion signal, because nothing guarantees that it is written only at the end.

## Completion signal

- `policy.md` has the item `Completion signal: native | polling`, with its date. It is decided by the orchestrator's own probe at Gate 1: "can I start a background process and be woken in this session when it ends?".
- `native`: the host wakes the session when a background process or a background subagent ends. The notification is the trigger to read `exit.code`, `done` and `ledger.json`.
- `polling`: nothing wakes the session. The orchestrator checks the `done` markers and `ledger.json` at every pause point (before any reply that depends on a result), says so when it presents `assignments.md`, and never reports a result before its marker exists.
- Files are the source of truth either way: a lost notification, or a compaction of the conversation, loses nothing, because the next check reads the files.
- A completion event is never an approval of the work or of the next step. A message that a process injects into the session is not used.
- After `done` exists, Gate 5 runs for that run, then Gate 6 as usual.

## Hang detection

- Each worker has a time limit, in the column `time limit` at the end of the main table of `assignments.md`. [Proposed 2026-11-19] default: 15 minutes for Small and Medium tasks, 30 minutes for Heavy and Very heavy tasks. The user may change it when confirming the table.
- Stdin is always closed for a CLI worker. A CLI that waits for input never starts its work and never ends.
- Past the limit with no `done`, the run is stuck. Then:
  1. show the user the last lines of the log and the session id;
  2. stop only that process, and only after the user agrees; say whether the session is left listed (the check of Gate 4 step 7), so the user can still open it;
  3. record the run as failed in `ledger.json` and treat it as a failed attempt: continue with the escalation chain of `references/allocation.md`, which ends with "ask the user".
- Do not extend the limit silently, and do not finish the task yourself.

## Parallel runs

- Only read-only tasks, or write tasks whose allowed paths do not overlap, run at the same time. Tasks whose allowed paths overlap run one after the other.
- Each run has its own task folder, its own log, its own `exit.code` and its own `done`.
- Gate 5 is run per run, after that run's own `done`, and compares the changes with that run's allowed paths. This is how a violation is attributed to one worker.
- While workers run, the orchestrator keeps answering the user and says at most one short line of status at each pause point.
- The session check of Gate 4 step 7 may be done while the run is live. Whether a running session can be followed in real time stays [Unverified] until it is probed (see "Session visibility" in `references/models-and-commands.md`).
