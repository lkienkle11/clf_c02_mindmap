# Worker rules

Copy these two blocks word for word into `brief.md`. Do not rewrite, shorten or weaken them. Line 5 of CODE WORKER RULES starts with "In Svelte files": it applies only when the task touches such files, so it stays in the block for every project.

Workers do not know this project's rules. In a test on 2026-11-10, Codex CLI and Agy CLI did not load the project rule file or the host's skills (both answered `UNKNOWN`). Whether a subagent of the host's own mechanism sees them is **[Unverified]**; assume it does not. A worker has only what is inside its `brief.md`.

## WORKER RULES (every worker)

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

## CODE WORKER RULES (workers that write code, placed right after WORKER RULES)

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

## Notes for the orchestrator

- For a plan task, copy that task's steps into the brief, below these blocks. They carry the TDD and verification steps the worker must follow.
- Technical limits come first, instructions second. Audits run read-only (sandbox), so a worker cannot write even if it ignores the rules. A worker that writes code runs only inside an isolated worktree or branch that the user allowed, with write access limited to the allowed paths where the CLI supports it (Codex `-s workspace-write`, Agy `--mode accept-edits`).
- **Naming a skill is not enough; giving the file path can work for Codex [Partly verified 2026-11-10].** Never write only "use the TDD skill". In a test, Codex (`gpt-6.1-sol`, effort low) followed the Claude Code TDD skill when its brief said "read this file and follow its method" and gave the absolute path of the `SKILL.md`: it read the file and a sibling file that the skill links, saw the test fail twice before writing the code, and its report matched the log. A control run without the path wrote the test and the code together and never saw a failing test. The evidence is one run per side, one small task, Codex only. Agy in headless mode cannot run tests, and Haiku was not tested; do not rely on this for them.
- Skills are not optional extras. For every skill that applies to the task, `SKILL.md` Gate 4 step 2a requires the brief to name the absolute path of that skill file as "read and follow", limited with "read only this file and the files it links; change nothing else", next to the CODE WORKER RULES block and the plan task's steps. After the run, Gate 5 requires checking the log for the order of events (the skill file opened before the first change). A worker's own report is never proof.
- Compliance check after every run: see Gate 5 in `SKILL.md`.
