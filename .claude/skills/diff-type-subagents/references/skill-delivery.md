# Skill delivery

How the orchestrator finds the skills a worker must read and proves what it found. Section 1 is used at Gate 2 (resolve) and Gate 4 (re-check).

## 1. Resolving a skill

Input: a skill name from the cell "skills the worker must read" of `assignments.md`, and the ordered list in the section "Skill source roots" of `references/policy.md`. Output: one row in the section `Skill resolution` of `assignments.md`, or a stop.

**Before the walk.** If `references/policy.md` has no "Skill source roots" section (first run on a new machine), stop. Ask the user, and run the skill-folder probe of Gate 1B. Never guess the roots.

**The walk.**

1. Expand each root pattern (`~` is the user's home, a project-relative pattern starts at the project root). Visit the roots in the policy's order; order is precedence, project level first.
2. In each root, first inspect the directory ENTRIES whose name matches the skill (broken and looping links included), and only then test for a `SKILL.md` inside, so that a broken link is reported (step 3) and never skipped because another root has a valid copy. The name may contain a space: quote every path in every command, or pass paths null-delimited (`find ... -print0`, `xargs -0`, or any way that does not split paths on spaces). Never split a path on spaces.
3. Turn each hit into its real path, the path after every link is followed, with the tool recorded in the `Environment` table of `references/policy.md` (for example `realpath`). If the link is dangling or loops, stop and say so: "dangling symlink" or "symlink loop", with the link path. Do not skip it and do not take the next root silently.
4. Hits whose real paths are equal are one skill reached twice (for example a project link into the user folder). Record the real path once: when the same real path is reached from two roots the table has one row for it. The combined hash compares relative paths and contents, so a symlink to the same folder is never a conflict.
5. Compute the combined hash of each distinct real path (below). Two distinct real paths with the same name and the same combined hash are identical copies: record the first one by root order. Two with different combined hashes are a conflict: stop and tell the user, naming both roots, both real paths and both hashes. Never pick one ("first root wins" is not allowed); the user decides.
6. No hit in any root: stop and ask the user where the skill lives. Do not guess a path.

**The combined hash.**

1. Covered files = `SKILL.md` plus every file it references by a relative path in one of three forms: (a) a markdown link target, (b) a backticked path, (c) a bare token that contains a `/` and starts with `references/`, `scripts/`, `assets/`, `templates/` or `examples/`. Ignore anything inside a fenced code block, URLs, absolute paths and anchors (strip the `#fragment`); strip trailing punctuation; resolve each path against the skill's own folder. One level deep: files named inside those files are not followed. A path that resolves outside the folder is reported but not covered, and is not a stop. A symlinked covered file is hashed by its content.
2. If a covered file does not exist inside the folder, stop: report the missing file and the skill. Do not publish a combined hash for that skill as if it were complete.
3. For each covered file get the SHA-256 of the file bytes with the tool recorded in the `Environment` table of `references/policy.md` (for example `shasum -a 256 "<file>"`, or `sha256sum`), from inside the skill folder, so the path is relative. Record the SHA-256 digest only (the 64 hexadecimal characters), without a trailing file name or dash.
4. Sort the lines `<sha256>  <relative path>` by relative path (byte order). The combined hash is the SHA-256 of that text (the same tool), one line per file, each ending with a newline.

**Stop cases** (each stops and tells the user; none is guessed):

1. Same name, different combined hashes: name both roots.
2. Not found in any root: ask the user.
3. Dangling or looping symlink: say so. A dangling link is a link whose target does not exist; the target must exist (for example `test -e` after `test -L`).
4. `SKILL.md` of any candidate names a file inside its folder that does not exist: report the file. The whole resolution of that name stops and no combined hash is published for it, even if another candidate was already hashed.
5. No "Skill source roots" section in `references/policy.md`: ask the user and run the Gate 1B skill-folder probe.
6. The machine has no SHA-256 tool or no real-path tool (see the `Environment` table of `references/policy.md`): report it to the user and stop skill resolution. Never invent a method.

**The table.** Write one row per resolved skill in the section `Skill resolution` of `assignments.md`:

| skill | real path | root | combined hash | covered files | note |
|---|---|---|---|---|---|

`root` is decided by the REAL path only, never by where the link was found. Resolve each policy root's own folder to its real path, then take the policy root whose real folder is a prefix, by whole path components (so `user` does not match `user2`), of the skill's real path (if several roots match, the one with the longest real folder). Example: `project/alpha` is a link to `../user/alpha`; the real path is `<user root>/alpha`, so `root` is the user root, not the project root, even though the walk found the link under the project root first. Write the root that reached it (here the project root) only in the `note` column of the row, never in `root`. If no policy root's real folder is a prefix of the real path, write `outside` in `root` and name the root through which it was reached in the `note` column. `covered files` lists the relative paths that went into the hash. The table is shown to the user with the rest of `assignments.md` at Gate 2.

**Re-check.** Right before a brief is written (Gate 4 step 2a), recompute the combined hash of every skill the brief names and compare it with the table. A different hash is a stop: tell the user, and update the row only after the user agrees.

## 2. Delivery modes

Input: a (worker, skill) pair, the skill's row in `Skill resolution`, and the worker's cells in the table `Worker capabilities (per CLI and mode)` of `references/models-and-commands.md`. Output: one row in the section `Delivery table` of `assignments.md` (`worker | skill | mode | proof | confidence`; `worker` is the worker with its mode: CLI, model, mode). Choose the first mode in this order that the cells allow. A cell that is `no` or `[Unverified]` does not allow a mode; never assume.

1. **`path`.** Allowed when `Reads path` is `yes`, AND (`Reads outside folder` is `yes` OR the skill's real path is inside the worker's working folder), AND the worker's log shows file opens. That last fact is not a table cell: it is judged per run from the worker's log format (a CLI whose log shows reads in a structured mode may note that in the notes of the capability table). A log that cannot show opens, or cannot show their order, rules `path` out. An **open event** is a log entry showing that the worker read the skill file: a read-file tool event naming the path, or a command event whose command text contains the skill's real path (a read-type command, whatever prefix or wrapper surrounds it). The brief names the real path with the sentence "Read this file first and follow its method: <path>. Read only this file and the files it links; change nothing else."
2. **`workspace-copy`.** Allowed when `Reads path` is `yes` AND the copy's folder `<task folder>/skills/<skill name>/` lies inside the worker's working folder (if false, fall through to `compiled`). The orchestrator copies the skill folder (`SKILL.md` plus every covered file, same relative layout) there. The copy must equal the original except one planted line `NONCE: SKILLNONCE-<12 hex>` as the first body line after the front matter. Check: remove only the line that begins `NONCE: SKILLNONCE-`; the result must equal the original file byte for byte, so the combined hash (section 1) equals the table's; a difference is a stop. The worker must quote the NONCE line of the copy in its report. The brief names the copy's path with the same sentence as `path`, and says only "quote the NONCE line of the copy"; it never states the nonce.
3. **`compiled`.** Allowed when the skill has verification commands, or only instructions the worker can follow in text; any step that runs a command needs `Runs commands` = `yes`. A skill that needs judgment the orchestrator cannot spell out as steps is not compiled: it goes to `orchestrator-keeps`. The orchestrator turns the skill into a checklist inside the brief, in the format of section 4. The worker returns evidence per step and quotes the nonce; the orchestrator re-runs the skill's verification commands itself.
4. **`orchestrator-keeps`.** Allowed only with a NAMED holder and a concrete division of the work, both written before the delivery table is approved. The part that stays is a check or a read-only step, never the writing of the change, and its holder is never the writer of the same change (whoever writes does not approve). The holder is another worker that can read the skill, or the orchestrator for a check it can do itself. It is verified there, and the delivery table records the holder. If no holder qualifies, apply "When no mode works".

**Nonce.** `SKILLNONCE-` plus 12 hex characters, fresh per worker, per skill and per run, never reused. The orchestrator writes it to `<task folder>/ledger.json` in the run's entry as `"nonces": {"<skill>": "SKILLNONCE-<12 hex>"}`, to check the report against. `ledger.json` is not in the worker's list of readable paths, but it sits in the task folder, which can be the worker's working folder, so a `workspace-copy` worker could read the nonce: the nonce is evidence, not proof. Keep the ledger outside the worker's working folder when the host allows it; otherwise lower the confidence label of that run by one level (`compiled` is already the lowest label and stays there).

**When no mode works.** Stop and ask the user: change the worker, or allow the work without that skill. Never drop the skill by default.

## 3. Proof of reading

A worker's own statement that it followed a skill is never evidence. Proof depends on the mode, and sets the confidence label of the result:

| Mode | Proof | Confidence |
|---|---|---|
| `path` | An open event (section 2) for the skill file in the worker's log, before the first step of the work. | high |
| `workspace-copy` | The NONCE line of the copy quoted in the report, no open event needed; the copy's integrity check (section 2) passed. | medium |
| `compiled` | Evidence for every step, and the orchestrator's re-run of the verification commands agrees. The nonce is in the brief, so quoting it proves only that the worker saw the brief; the rank rests on the per-step evidence and the re-run. | lower |
| `orchestrator-keeps` | Verified by whoever holds the work. | the label of the holder's own mode (high, medium or lower), recorded in the Delivery table |

**"Before the first step of the work."** Before the first action that is part of the task's work. Reading the brief, or a user-level rule file, earlier does not count as work. A `path` run whose log cannot show the order of events is not allowed: the orchestrator chooses `workspace-copy` at Gate 2 (label medium). A `path` skill has no planted nonce.

**Closer review.** A result from `workspace-copy` or `compiled` gets a closer review by the orchestrator, like a fallback to a weaker model.

**Failure.** The run is invalid; stop and tell the user which skill. Then the next step depends on the mode:
- `path` with no open event: mark `Reads path` [Unverified] in the capability table with the date, showing the diff first; take the next mode of section 2.
- `workspace-copy` with a missing nonce: mark `Reads path` [Unverified] (same rule); take `compiled`.
- `compiled` with a step lacking evidence, a missing nonce, or a re-run that disagrees: the result does not stand; take `orchestrator-keeps`.
- `orchestrator-keeps` has no next mode: if its holder cannot verify, or no holder qualifies, apply "When no mode works" (stop and ask the user).
In every case ask the user to approve the changed delivery table before the run is repeated.

## 4. Compiled checklist format

The checklist sits in the brief, right after the rules blocks. Its first line is `NONCE: SKILLNONCE-<12 hex>` (section 2). It then holds, in this order:

1. Source: the skill's real path and combined hash from `Skill resolution`.
2. Ordered steps, numbered. One action per step.
3. For each step, the exact command (without the command prefix of the policy, which is never part of a command given to a worker), and the evidence the worker returns (command and its output, or the value found). A skill with no verification commands is written as the line `Commands: none`.
4. Pass or fail rule for each step, stated so that no judgment is needed.
5. Stop conditions: what makes the worker stop and report instead of going on.
6. A line telling the worker to quote the nonce and return the evidence per step.

Never summarise a skill's rule in words that change its meaning; copy the rule. The orchestrator re-runs every verification command of the checklist after the run.
