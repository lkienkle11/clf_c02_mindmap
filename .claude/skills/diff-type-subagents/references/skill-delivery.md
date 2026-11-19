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

1. Covered files = `SKILL.md` plus every file inside the skill's own folder that `SKILL.md` names by a relative path (a markdown link, a backticked path, or a bare path such as `references/x.md`), one level deep: files named inside those files are not followed. A named path that leaves the skill's folder is not covered; list it in the report.
2. If a named file does not exist, stop: report the missing file and the skill. Do not publish a combined hash for that skill as if it were complete.
3. For each covered file run `shasum -a 256 "<file>"` (use `sha256sum` where `shasum` is missing), from inside the skill folder, so the path is relative.
4. Sort the lines `<sha256>  <relative path>` by relative path (byte order). The combined hash is the SHA-256 of that text, one line per file, each ending with a newline.

**Stop cases** (each stops and tells the user; none is guessed):

1. Same name, different combined hashes: name both roots.
2. Not found in any root: ask the user.
3. Dangling or looping symlink: say so.
4. `SKILL.md` names a file that does not exist: report the file; no combined hash.
5. No "Skill source roots" section in `references/policy.md`: ask the user and run the Gate 1B skill-folder probe.

**The table.** Write one row per resolved skill in the section `Skill resolution` of `assignments.md`:

| skill | real path | root | combined hash | covered files |
|---|---|---|---|---|

`root` is the policy entry that holds the real path. `covered files` lists the relative paths that went into the hash. The table is shown to the user with the rest of `assignments.md` at Gate 2.

**Re-check.** Right before a brief is written (Gate 4 step 2a), recompute the combined hash of every skill the brief names and compare it with the table. A different hash is a stop: tell the user, and update the row only after the user agrees.
