# diff-type-subagents setup, reset and config separation (batch 1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move all machine data out of the `diff-type-subagents` skill into a per-user folder, and give the skill four documented entry modes (`/diff-type-subagents`, `setup`, `reset`, `target:`), a machine marker, a shorter description and a README.

**Architecture:** The skill keeps rules and blank templates under `references/templates/`. Recorded data (policy values, models table, capability results, session-list rows) lives in `~/.claude/diff-type-subagents/{policy.md,models.md}`, created by `setup`. The rules keep the logical names "policy" and "the models table"; one new section of `SKILL.md` defines what they mean.

**Tech Stack:** Markdown skill files, bash/grep for checks, git. No product code.

**Spec:** `docs/superpowers/specs/2026-11-22-diff-type-subagents-setup-design.md` (read it first; it is the source of every value below).

## Global Constraints

- Skill path: `SKILL=.claude/skills/diff-type-subagents`. Base commit of the original content: `BASE=449457f`.
- Config folder (fixed, no override): `~/.claude/diff-type-subagents/` with exactly `policy.md` and `models.md`.
- Marker, first non-title line of the user's `policy.md`: `Configured for: <hostname> | <operating system and shell> | <date>`. Hard keys: operating system and shell. The date is never compared. A hostname-only difference asks the same three-way question once.
- Three-way question on mismatch or missing marker: (a) reconfigure for this machine (same as `reset`), (b) keep the config and update the marker, (c) cancel. Nothing changes before the answer.
- `reset` moves the folder to `~/.claude/diff-type-subagents.bak-<YYYY-MM-DD-HHMM>/` (never deletes), then runs `setup`. `reset` stops and tells the user if a run of the current topic is still `pending` or `running`.
- `target: a, b` is a per-run hard filter, not stored. The host's subagent mechanism is in the pool only when the list contains the word `host`. An unknown name is reported, never guessed. An empty list asks the user.
- New description, word for word: "Delegate work to subagents of different vendors (CLI agents installed on the machine, or the host's own subagent mechanism), with the current session as orchestrator and reviewer. Use when the user types /diff-type-subagents or asks to delegate work to other agents or CLIs."
- Hard rules of `SKILL.md` stay word for word, except path names.
- Every write of the config shows a diff first and waits for the user's confirmation. The skill never installs anything.
- The templates keep vendor-neutral `[Proposed]` defaults (Spread `prefer`, Parallel limit 3, Liveness window 5 minutes, quota thresholds 20% and 5%, Completion signal `polling`, Handoff root `.superpowers/diff-agents/`). Every row that names a vendor or a model is empty.
- Check variables used below:
  - `RECORDED='codex|agy|haiku|sonnet|gemini|gpt-[0-9]|opus|rtk|macOS|Darwin|/Users/'` must match nothing in any `.md` under `$SKILL` when the plan is finished.
  - `DATED='2026-1[0-9]-[0-9]{2}'` must match nothing in `$SKILL/references/templates/` and `$SKILL/README.md`.
- Commit rules (project `CLAUDE.md`): title `type(scope): description`; body has four sections in order, `**Scope:**`, `**What did:**`, `**Reviewed:**`, `**Tested:**`; no AI attribution or co-author trailer. A commit needs the user's permission when the plan is run.
- Worker models for any scenario run: Sonnet 5.5 Medium or Haiku 5.5 XHigh; never Opus.

## Review Focus

- Config folder exists with only one of the two files (setup was interrupted): the config counts as incomplete, `setup` resumes, a half config is never used. Pinned by scenario S6 in Task 6.
- `$HOME` unset or the folder cannot be created or written: report to the user and stop; never write the config anywhere else. Pinned by S7.
- `target:` with an empty list, or naming the same CLI twice: ask on empty, deduplicate silently otherwise. Pinned by S5.
- `reset` while a run is `pending` or `running`: stop and tell the user; nothing is moved. Pinned by S4.
- A config copied from another machine (synced dotfiles, restored backup) with the same OS and shell: the hostname-only difference asks once and answer (b) stops the repeat. Pinned by S3.

---

### Task 1: Snapshot the current data and write the blank templates

**Files:**
- Create: `$SKILL/references/templates/policy.md`
- Create: `$SKILL/references/templates/models.md`
- Create (git-ignored staging, not committed): `.superpowers/diff-agents/migration-source/policy.md`, `.superpowers/diff-agents/migration-source/models-and-commands.md`

**Interfaces:**
- Produces: `templates/policy.md` with the same item rows as the current `policy.md` (Orchestrator, Forbidden as worker, Effort ceiling, Fallback order, Equivalents when falling back, Quota thresholds, Spread, Completion signal, Parallel limit, Liveness window, Command prefix, Handoff root), the `## Environment` table (same nine items, empty value/date/status), `## Tier map` (header paragraph and the single row `any row not listed | Small`), `## Skill source roots` (header and empty table), and the marker line `Configured for: <hostname> | <operating system and shell> | <date>` directly under the title.
- Produces: `templates/models.md` with the headings `## Models and effort levels`, `## Worker capabilities (per CLI and mode)`, `## What each worker can and cannot do`, `## Command shapes`, `## Pre-flight check commands`, `## Session visibility`, `## Quota notes`, each holding only an empty table header (or an empty list) with the same column names as `models-and-commands.md` at `$BASE`.
- Consumed by Tasks 2, 3, 5.

- [ ] **Step 1: Write the failing check**

```bash
SKILL=.claude/skills/diff-type-subagents
RECORDED='codex|agy|haiku|sonnet|gemini|gpt-[0-9]|opus|rtk|macOS|Darwin|/Users/'
DATED='2026-1[0-9]-[0-9]{2}'
test -f $SKILL/references/templates/policy.md && test -f $SKILL/references/templates/models.md && echo FILES_OK
grep -niE "$RECORDED|$DATED" $SKILL/references/templates/*.md || echo CLEAN
for item in Orchestrator "Forbidden as worker" "Effort ceiling" "Fallback order" "Equivalents when falling back" "Quota thresholds" Spread "Completion signal" "Parallel limit" "Liveness window" "Command prefix" "Handoff root"; do grep -q "^| $item" $SKILL/references/templates/policy.md || echo "MISSING ITEM: $item"; done
```

- [ ] **Step 2: Run it to verify it fails**

Run the block above. Expected: `FILES_OK` is not printed (files do not exist).

- [ ] **Step 3: Snapshot the originals into staging**

```bash
mkdir -p .superpowers/diff-agents/migration-source
git show 449457f:.claude/skills/diff-type-subagents/references/policy.md > .superpowers/diff-agents/migration-source/policy.md
git show 449457f:.claude/skills/diff-type-subagents/references/models-and-commands.md > .superpowers/diff-agents/migration-source/models-and-commands.md
```

- [ ] **Step 4: Create the two templates** with the structures in the Interfaces block. Copy the generic prose of each section from the originals; remove every vendor, model, `rtk`, home path and dated value. Defaults are the `[Proposed]` ones in Global Constraints, without dates. The Environment "Other systems" paragraph keeps the Linux and Windows suggestions and states that none of them was tested on any machine (drop the sentence about macOS).

- [ ] **Step 5: Run the Step 1 block again.** Expected: `FILES_OK`, `CLEAN`, and no `MISSING ITEM` line.

- [ ] **Step 6: Commit** `feat(skill): add blank config templates` (Scope: `.claude/skills/diff-type-subagents/references/templates`; Tested: the Step 1 block output).

---

### Task 2: SKILL.md: how to use, where the config lives, marker, description

**Files:**
- Modify: `$SKILL/SKILL.md` (frontmatter `description`; new sections after the `**Announce:**` line and before `## Hard rules`; Gate 1 intro; `## Reference files`)

**Interfaces:**
- Consumes: template paths and headings from Task 1.
- Produces: sections `## How to use` and `## Where the config lives` in `SKILL.md`, using the headings `Modes`, `target:`, `The marker`, `First run and reset`.

- [ ] **Step 1: Write the failing check**

```bash
SKILL=.claude/skills/diff-type-subagents
grep -q '^## How to use' $SKILL/SKILL.md && grep -q '^## Where the config lives' $SKILL/SKILL.md && echo SECTIONS_OK
for w in 'setup' 'reset' 'target:' 'Configured for:' 'diff-type-subagents.bak-' '~/.claude/diff-type-subagents/'; do grep -qF -- "$w" $SKILL/SKILL.md || echo "MISSING: $w"; done
sed -n 1,5p $SKILL/SKILL.md | grep -q 'Load it at Step 0' && echo "OLD DESCRIPTION STILL THERE"
```

- [ ] **Step 2: Run it.** Expected: `SECTIONS_OK` absent, six `MISSING` lines, and `OLD DESCRIPTION STILL THERE`.

- [ ] **Step 3: Replace the frontmatter `description`** with the text in Global Constraints (word for word). Keep `name:` unchanged.

- [ ] **Step 4: Add `## How to use`** (English, readable by a person, at most about 40 lines) holding: the four modes in a table (typed, meaning, what happens) with exactly the behaviors of Global Constraints and of the spec's section 3; the rule that the old `I installed: ...` form keeps working and means "these CLIs exist", not a filter; `reset` stops when a run is `pending` or `running`; `target:` rules (hard filter, per run, `host` only when listed, unknown name reported, empty list asks, duplicates ignored).

- [ ] **Step 5: Add `## Where the config lives`** holding: the folder and its two files; the sentence that "policy" and "the models table" (and the tables the reference files call Worker capabilities, Pre-flight check commands and Session-list) mean the files in that folder, so the rules keep their names; that the folder is the same whatever vendor orchestrates, with host-dependent items recorded per host; the marker line, its comparison rule and the three-way question; that a missing folder, or a folder with only one of the two files, is treated as no config and starts `setup`; that if the folder cannot be created or written the skill reports it and stops, writing nothing elsewhere.

- [ ] **Step 6: Edit Gate 1** so that before "Read `references/policy.md` first" it runs the missing-config check and the marker check of Step 5, and the Environment comparison remains the second guard. Change only that paragraph and the first three bullets' opening condition ("config missing" replaces "table is missing or empty" as the setup trigger); keep every other sentence.

- [ ] **Step 7: Update `## Reference files`**: add `references/templates/` and `README.md`, and say that `policy.md` and `models-and-commands.md` entries describe the user's config files (the second also names the generic procedure kept in the skill, Task 3).

- [ ] **Step 8: Run the Step 1 block.** Expected: `SECTIONS_OK`, no `MISSING`, no `OLD DESCRIPTION STILL THERE`.

- [ ] **Step 9: Run the hard-rule check**

```bash
git diff -U0 449457f -- $SKILL/SKILL.md | grep '^[-+]' | grep -v '^+++\|^---' | grep '^-' 
```

Expected: the removed lines are only the old `description:` line, the edited Gate 1 lines and the edited `## Reference files` lines. Any removed line inside `## Hard rules` is a failure.

- [ ] **Step 10: Commit** `feat(skill): document setup, reset, target and config location`.

---

### Task 3: Make models-and-commands.md generic and remove the tracked policy.md

**Files:**
- Modify: `$SKILL/references/models-and-commands.md`
- Delete: `$SKILL/references/policy.md`
- Modify (path text only, if a sentence names the deleted file as a skill file): `$SKILL/references/{allocation,running-workers,skill-delivery,parallel-groups}.md`

**Interfaces:**
- Consumes: staging copies from Task 1 (the recorded data is already preserved there; nothing is lost by deleting).
- Produces: `models-and-commands.md` with the same section headings as `templates/models.md`, each holding generic procedure only.

- [ ] **Step 1: Write the failing check**

```bash
SKILL=.claude/skills/diff-type-subagents
RECORDED='codex|agy|haiku|sonnet|gemini|gpt-[0-9]|opus|rtk|macOS|Darwin|/Users/'
grep -rniE "$RECORDED" $SKILL --include='*.md' | grep -v 'references/templates' ; echo "---"; test -f $SKILL/references/policy.md && echo "POLICY STILL TRACKED"
```

- [ ] **Step 2: Run it.** Expected: many matches in `models-and-commands.md` and `policy.md`, and `POLICY STILL TRACKED`.

- [ ] **Step 3: Rewrite `models-and-commands.md`.** Apply the split rule: keep in the skill the intro (reworded: this file is procedure; recorded rows live in the user's `models.md`), "Keeping this table current" and "How to write into the table" (remove dated or vendor examples, keep the row-format rule with a neutral example such as `<cli> <version> (<date>)`), the explanatory paragraphs of Worker capabilities (the six columns, eligibility, least-permission rule, row template) with an empty table, the generic command-shape rules (stdin closed, mode flag from the chosen row, a run in another mode is invalid, never a bypass flag, effort valid for the model), the Pre-flight table header and the "Any other CLI" row, the Session-list header and the generic notes (run from the directory the user will look in, multiplexer only if the Environment table says one exists, resuming not verified until checked), and the generic quota line (running out is detected reactively). Everything else in the file (all rows, dated notes, vendor command shapes, prices, tested prose) is recorded data: it stays only in the staging copy for Task 5.

- [ ] **Step 4: Delete the tracked policy** with `git rm $SKILL/references/policy.md`. In the four other reference files, change only a sentence that tells the reader to open `references/policy.md` as a skill file, so it says "the policy (see Where the config lives in `SKILL.md`)". Do not touch any other sentence.

- [ ] **Step 5: Run the Step 1 block.** Expected: no matches before `---`, and no `POLICY STILL TRACKED`.

- [ ] **Step 6: Run the coherence check**

```bash
for h in "Models and effort levels" "Worker capabilities" "Command shapes" "Pre-flight check commands" "Session visibility" "Quota notes"; do grep -q "^## $h" $SKILL/references/models-and-commands.md && grep -q "^## $h" $SKILL/references/templates/models.md || echo "HEADING MISMATCH: $h"; done
grep -rn 'references/policy.md' $SKILL --include='*.md' | grep -v 'Where the config lives'
```

Expected: no `HEADING MISMATCH`; every remaining `references/policy.md` mention is either a logical-name mention covered by the new section or replaced; fix any that is not.

- [ ] **Step 7: Commit** `refactor(skill): keep only procedure in the models file and drop tracked policy`.

---

### Task 4: README for people

**Files:**
- Create: `$SKILL/README.md`

**Interfaces:**
- Consumes: the modes and folder of Task 2.

- [ ] **Step 1: Write the failing check**

```bash
SKILL=.claude/skills/diff-type-subagents
DATED='2026-1[0-9]-[0-9]{2}'
test -f $SKILL/README.md || echo NO_README
for w in '/diff-type-subagents setup' '/diff-type-subagents reset' '/diff-type-subagents target:' '~/.claude/diff-type-subagents/' 'bak'; do grep -qF -- "$w" $SKILL/README.md 2>/dev/null || echo "MISSING: $w"; done
grep -nE "$DATED" $SKILL/README.md 2>/dev/null
```

- [ ] **Step 2: Run it.** Expected: `NO_README` and five `MISSING` lines.

- [ ] **Step 3: Write `README.md`** (about 40 lines): what the skill does in two sentences; the four modes with one example each (`/diff-type-subagents target: opencode, minimax`, `/diff-type-subagents target: host, opencode`); where the config lives and what each file holds; how to reset and what happens to the old config; that nothing in the config folder is committed; a link to `SKILL.md` for the rules. Do not copy rule text from `SKILL.md`.

- [ ] **Step 4: Run the Step 1 block.** Expected: no output.

- [ ] **Step 5: Commit** `docs(skill): add a README for people`.

---

### Task 5: Migrate this machine's configuration (gated; the orchestrator does it, not a worker)

**Files:**
- Create (outside the repository): `~/.claude/diff-type-subagents/policy.md`, `~/.claude/diff-type-subagents/models.md`

**Interfaces:**
- Consumes: staging copies `.superpowers/diff-agents/migration-source/{policy.md,models-and-commands.md}` (Task 1).

- [ ] **Step 1: Stop and ask the user** for permission to write under `~/.claude/diff-type-subagents/` (it is outside the repository). Do not continue without a yes in this conversation. If the folder already exists, move it to `~/.claude/diff-type-subagents.bak-<YYYY-MM-DD-HHMM>/` first (with the same permission).

- [ ] **Step 2: Write the failing check**

```bash
BASE=449457f
SKILL=.claude/skills/diff-type-subagents
CFG=~/.claude/diff-type-subagents
test -f $CFG/policy.md && test -f $CFG/models.md || echo NO_CONFIG
for f in policy.md models-and-commands.md; do git show $BASE:$SKILL/references/$f | grep '^|' | while IFS= read -r line; do cat $CFG/policy.md $CFG/models.md 2>/dev/null | grep -qxF -- "$line" || echo "MISSING ROW"; done; done | sort | uniq -c
```

- [ ] **Step 3: Run it.** Expected: `NO_CONFIG` and a nonzero `MISSING ROW` count.

- [ ] **Step 4: Create the config.**
  - `policy.md` = the staged `policy.md` unchanged, plus the marker line directly under the title, filled for this machine (`hostname`, the operating system and shell read from the Environment table, today's date).
  - `models.md` = the staged `models-and-commands.md` with its generic intro replaced by one line saying the file is this machine's record, keeping every table row, every dated note and every vendor command shape unchanged, under the headings of `templates/models.md`.
  - Show the user the diff of each file against its staged source (only the marker and the intro should differ) before writing.

- [ ] **Step 5: Run the Step 2 block.** Expected: no `NO_CONFIG` and no `MISSING ROW` line (every table row of the originals exists verbatim in the migrated files).

- [ ] **Step 6: No commit** (nothing in the repository changed). Record the result in the run notes.

---

### Task 6: Verify the whole change with scenarios and the success checks

**Files:**
- Create (git-ignored, not committed): `.superpowers/diff-agents/2026-11-23-setup-scenarios/S1.md` to `S7.md` (task folders; each holds `brief.md` and the saved reply)

**Interfaces:**
- Consumes: the finished skill (Tasks 1 to 4) and the spec's success checks.

- [ ] **Step 1: Run the static checks of the spec**

```bash
SKILL=.claude/skills/diff-type-subagents
RECORDED='codex|agy|haiku|sonnet|gemini|gpt-[0-9]|opus|rtk|macOS|Darwin|/Users/'
DATED='2026-1[0-9]-[0-9]{2}'
grep -rniE "$RECORDED" $SKILL --include='*.md' || echo CHECK1_OK
grep -rnE "$DATED" $SKILL/references/templates $SKILL/README.md || echo CHECK1_DATES_OK
git diff -U0 449457f -- $SKILL/SKILL.md | sed -n '/## Hard rules/,/## The gates/p' | grep '^-' || echo CHECK6_OK
```

Expected: `CHECK1_OK`, `CHECK1_DATES_OK`, `CHECK6_OK`.

- [ ] **Step 2: Write seven scenario briefs.** Each brief tells a fresh read-only worker (Sonnet 5.5 Medium or Haiku 5.5 XHigh, never Opus) to read only the skill folder and answer "what exactly do you do, in order, and what do you write, when ..." for one situation, imagining the config folder state given. The orchestrator saves the reply. Scenarios and the expected answer (each point must appear):
  - **S1** no config folder, user types `/diff-type-subagents`: runs `setup`, creates the folder from the templates, shows a diff and waits before every write, asks only for items without a default, ends with the marker written.
  - **S2** config exists, marker matches: continues to Gate 1A, writes nothing.
  - **S3** marker hostname differs, OS and shell equal: asks the three-way question once, changes nothing before the answer, answer (b) updates only the marker.
  - **S4** user types `reset` while a ledger entry is `running`: stops, tells the user, moves nothing. With no run active: asks to confirm, moves the folder to the `.bak-` name, runs `setup`.
  - **S5** `target: opencode, opencode`, then `target:` empty, then `target: host, opencode`, then `target: nonexistentcli`: deduplicates; asks on empty; includes the host only in the third; reports the unknown name without guessing; runs Gate 1B for each named CLI; ignores other table rows.
  - **S6** the folder has `policy.md` but no `models.md`: treats the config as incomplete and starts `setup`; never uses the half config.
  - **S7** `$HOME` unset or not writable: reports and stops; writes the config nowhere else.

- [ ] **Step 3: Run the scenarios** (one worker per scenario, read-only; the orchestrator launches them as the skill's Gate 4 describes, or directly through the host's subagent tool for these short read-only runs) and read each saved reply against its expected points. A missing point is a defect in the skill text: fix `SKILL.md` or the README and rerun that scenario only. Worker replies are leads; the orchestrator checks each claim against the skill text.

- [ ] **Step 4: Record the outcomes** in `.superpowers/diff-agents/2026-11-23-setup-scenarios/results.md` (scenario, pass or fail, fix made). All seven must pass.

- [ ] **Step 5: Commit** any text fixes from Step 3 as `fix(skill): close gaps found by the setup scenarios` (skip if none).

- [ ] **Step 6: Whole-branch review** by one fresh reviewer (not the author) with the spec and this plan; re-grade findings by effect; fix Critical and Important findings first; record Minor ones as deferred.
