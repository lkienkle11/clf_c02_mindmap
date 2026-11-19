# Skill delivery

How the orchestrator finds the skills a worker must read and proves what it found. Section 1 is used at Gate 2 (resolve) and Gate 4 (re-check).

## 1. Resolving a skill

Input: a skill name from the cell "skills the worker must read" of `assignments.md`, and the ordered list in the section "Skill source roots" of `references/policy.md`. Output: one row in the section `Skill resolution` of `assignments.md`, or a stop.

**Before the walk.** If `references/policy.md` has no "Skill source roots" section (first run on a new machine), stop. Ask the user, and run the skill-folder probe of Gate 1B. Never guess the roots.

**The walk.**

1. Expand each root pattern (`~` is the user's home, a project-relative pattern starts at the project root). Visit the roots in the policy's order; order is precedence, project level first.
2. In each root, look for a folder named exactly as the skill, with a `SKILL.md` inside. The name may contain a space: quote every path in every command, or pass paths null-delimited (`find ... -print0`, `xargs -0`). Never split a path on spaces.
3. Turn each hit into its real path with `realpath` (this follows symlinks). If the link is dangling or loops, stop and say so: "dangling symlink" or "symlink loop", with the link path. Do not skip it and do not take the next root silently.
4. Hits whose real paths are equal are one skill reached twice (for example a project link into the user folder). Record the real path once. This is not a conflict.
5. Compute the combined hash of each distinct real path (below). Two distinct real paths with the same name and the same combined hash are identical copies: record the first one by root order. Two with different combined hashes are a conflict: stop and tell the user, naming both roots, both real paths and both hashes. Never pick one ("first root wins" is not allowed); the user decides.
6. No hit in any root: stop and ask the user where the skill lives. Do not guess a path.

**The combined hash.**

1. Covered files = `SKILL.md` plus every file it references by a relative path in one of three forms: (a) a markdown link target, (b) a backticked path, (c) a bare token that contains a `/` and starts with `references/`, `scripts/`, `assets/`, `templates/` or `examples/`. Ignore anything inside a fenced code block, URLs, absolute paths and anchors (strip the `#fragment`); strip trailing punctuation; resolve each path against the skill's own folder. One level deep: files named inside those files are not followed. A path that resolves outside the folder is reported but not covered, and is not a stop. A symlinked covered file is hashed by its content.
2. If a covered file does not exist inside the folder, stop: report the missing file and the skill. Do not publish a combined hash for that skill as if it were complete.
3. For each covered file run `shasum -a 256 "<file>"` (use `sha256sum` where `shasum` is missing), from inside the skill folder, so the path is relative.
4. Sort the lines `<sha256>  <relative path>` by relative path (byte order). The combined hash is the SHA-256 of that text, one line per file, each ending with a newline.

**Stop cases** (each stops and tells the user; none is guessed):

1. Same name, different combined hashes: name both roots.
2. Not found in any root: ask the user.
3. Dangling or looping symlink: say so.
4. `SKILL.md` of any candidate names a file inside its folder that does not exist: report the file. The whole resolution of that name stops and no combined hash is published for it, even if another candidate was already hashed.
5. No "Skill source roots" section in `references/policy.md`: ask the user and run the Gate 1B skill-folder probe.

**The table.** Write one row per resolved skill in the section `Skill resolution` of `assignments.md`:

| skill | real path | root | combined hash | covered files |
|---|---|---|---|---|

`root` is the policy entry that holds the real path. `covered files` lists the relative paths that went into the hash. The table is shown to the user with the rest of `assignments.md` at Gate 2.

**Re-check.** Right before a brief is written (Gate 4 step 2a), recompute the combined hash of every skill the brief names and compare it with the table. A different hash is a stop: tell the user, and update the row only after the user agrees.

## 2. Delivery modes

Input: a (worker, skill) pair, the skill's row in `Skill resolution`, and the worker's cells in the table `Worker capabilities (per CLI)` of `references/models-and-commands.md`. Output: one row in the section `Delivery table` of `assignments.md` (`worker | skill | mode | proof | confidence`). Choose the first mode in this order that the cells allow. A cell that is `no` or `[Unverified]` does not allow a mode; never assume.

1. **`path`.** Allowed when `Reads path` is `yes`, AND (`Reads outside folder` is `yes` OR the skill's real path is inside the worker's working folder), AND the worker's log shows file opens (a log that cannot show them rules `path` out for a skill whose reading must be proved). The brief names the real path with the sentence "Read this file first and follow its method: <path>. Read only this file and the files it links; change nothing else."
2. **`workspace-copy`.** The orchestrator copies the skill folder (`SKILL.md` plus every covered file, same relative layout) into `<task folder>/skills/<skill name>/`, inside the worker's working folder. The copy must equal the original except one planted line `NONCE: SKILLNONCE-<12 hex>` as the first body line after the front matter. Check: hash the copy with the nonce line removed (section 1, same procedure) and compare with the combined hash of the table; a difference is a stop. The worker must quote the nonce in its report. The brief names the copy's path with the same sentence as `path`.
3. **`compiled`.** The orchestrator turns the skill into a checklist inside the brief, in the format of section 4. The worker returns evidence per step and quotes the nonce; the orchestrator re-runs the skill's verification commands itself.
4. **`orchestrator-keeps`.** The part of the work that needs the skill, and that the worker cannot do, stays with the orchestrator or goes to another agent that can, and is verified there. The delivery table records who holds it.

**Nonce.** `SKILLNONCE-` plus 12 hex characters, fresh per worker, per skill and per run, never reused. The orchestrator keeps it with the run records, to check the report against.

**When no mode works.** Stop and ask the user: change the worker, or allow the work without that skill. Never drop the skill by default.

## 3. Proof of reading

A worker's own statement that it followed a skill is never evidence. Proof depends on the mode, and sets the confidence label of the result:

| Mode | Proof | Confidence |
|---|---|---|
| `path` | An open event for the skill file in the worker's log, before the first step of the work (see below). | high |
| `workspace-copy` | The nonce quoted in the report, no open event needed; the copy's hash (nonce line removed) equals the table. | medium |
| `compiled` | Evidence per step, the nonce quoted, and the orchestrator re-ran the verification commands. | lower |
| `orchestrator-keeps` | Verified by whoever holds the work. | that holder's proof |

**"Before the first step."** In a run that changes files: before the first change. In a read-only run: before the first step of the work in log order; when the worker's log cannot show order, the nonce must appear in the answer, and the run is judged as `workspace-copy`.

**Closer review.** A result from `workspace-copy` or `compiled` gets a closer review by the orchestrator, like a fallback to a weaker model.

**Failure.** A `path` skill with no open event, or a required nonce that is missing, makes the run invalid (Gate 5). Then: stop; tell the user which skill; mark the capability that failed [Unverified] in the capability table, with the date, showing the diff first; choose the next mode of section 2; ask the user to approve the changed delivery table before the run is repeated. If no mode is left, follow "When no mode works".

## 4. Compiled checklist format

The checklist sits in the brief, right after the rules blocks. Its first line is `NONCE: SKILLNONCE-<12 hex>` (section 2). It then holds, in this order:

1. Source: the skill's real path and combined hash from `Skill resolution`.
2. Ordered steps, numbered. One action per step.
3. For each step, the exact command (with the command prefix of the policy, if any), and the evidence the worker returns (command and its output, or the value found).
4. Pass or fail rule for each step, stated so that no judgment is needed.
5. Stop conditions: what makes the worker stop and report instead of going on.
6. A line telling the worker to quote the nonce and return the evidence per step.

Never summarise a skill's rule in words that change its meaning; copy the rule. The orchestrator re-runs every verification command of the checklist after the run.
