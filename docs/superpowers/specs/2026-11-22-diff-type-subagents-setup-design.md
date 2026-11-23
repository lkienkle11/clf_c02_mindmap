# diff-type-subagents: setup, reset and machine-config separation (batch 1 of 3)

Date: 2026-11-22. Status: draft, waiting for the user's approval.
Skill under change: `.claude/skills/diff-type-subagents/` (tracked in this repository).

## Intent and why

A person who installs `diff-type-subagents` today cannot tell how to configure it, how to reconfigure it after moving to another machine, another operating system or another set of installed AI CLIs, or which files hold the configuration. Worse, `references/policy.md` and `references/models-and-commands.md` are committed with the first user's own machine data (macOS and zsh, the `rtk` command prefix, their models, tier map and quota choices), so anyone who copies the skill inherits values that are wrong for them. The skill only re-probes when the operating-system-and-shell cell differs, so a second macOS machine would silently keep the first machine's table.

The user wants: install the skill, type one command, and be configured; reconfigure by typing one command; pick the worker CLIs with a short, explicit syntax such as `target: opencode, minimax`.

## Goals

1. Machine data lives outside the skill, in one per-user folder, created on first use.
2. A short "How to use" section at the top of `SKILL.md`, readable by a person, that names four entry modes: no argument, `setup`, `reset`, `target:`.
3. A `README.md` in the skill folder for people (what the skill is, the modes, where the config lives, how to reset).
4. A shorter `description` that states only when the skill applies.
5. A marker in the config that says which machine it was made for, so that a copied or restored config is detected on any machine, even one with the same operating system.
6. The user's existing configuration is moved to the new place, not lost.

## Non-goals (later batches, do not touch in this batch)

- When the skill is loaded and how it combines with Superpowers, OpenSpec or a standalone request (batch 2).
- One question list instead of many small stops; stored consent (batch 2).
- Two-level parallel work, workspaces, worktree ownership, merge and clean-up (batch 3).
- Gates 2 to 6 of `SKILL.md`, `allocation.md`, `parallel-groups.md`, `running-workers.md`, `skill-delivery.md`, `worker-rules.md`: only their path references change.

## Anti-goals (would make this a failure even if it works)

- Any machine-specific value (a model name, `rtk`, a path under a user's home, a tier choice) left in a tracked file of the skill.
- The skill deleting or overwriting a user's config without a backup and the user's confirmation.
- Any hard rule of `SKILL.md` weakened (no bypass flags, read-only by default, worker sessions listed, workers never review their own output, probes confined to the probe folder).
- The user having to know a file name to configure the skill.

## Constraints

- The skill text stays English and vendor-neutral; vendor and model names live only in the config.
- The skill never installs anything (existing rule); setup reports missing tools to the user.
- Every write of the config shows a diff first and waits for the user's confirmation (existing rule, kept).
- Project rules: commit message format and approval gates of `CLAUDE.md`; this batch is a docs-and-rules change with no product code.

## Approaches considered

| | Where the machine data lives | Trade-off |
|---|---|---|
| A | `*.local.md` next to the skill, git-ignored, templates shipped | Simple, but a skill update or reinstall (plugin cache) can overwrite or drop the local files |
| B | Same files, add a "Configured for" marker; reset to template on mismatch | Smallest change, but the files stay tracked, so the first user's data is still shared and two users on one repo overwrite each other |
| C | A per-user folder `~/.claude/diff-type-subagents/`; the skill ships only rules and blank templates | One more location to document, but config is per machine, shared by every repo, survives any update, and cannot be committed by mistake |

The user picked **C** on 2026-11-22.

## Design

### 1. Where things live

```
.claude/skills/diff-type-subagents/        (tracked; rules and templates only)
├── SKILL.md                                 + "How to use" and "Where the config lives" sections, shorter description
├── README.md                                new, for people
└── references/
    ├── templates/
    │   ├── policy.md                        blank policy: every item, empty value, one-line meaning
    │   └── models.md                        blank models table, capability table, session-list table
    ├── models-and-commands.md               keeps only facts about the CLIs themselves (command shapes, pre-flight checks, how sessions are listed, how to update a table); the recorded rows move out
    └── (allocation, parallel-groups, running-workers, skill-delivery, worker-rules: path text only)

~/.claude/diff-type-subagents/             (per user; created by setup; never committed)
├── policy.md                                machine and user settings, with the marker line
└── models.md                                models table, worker capabilities, session-list confirmations, quota notes
```

`SKILL.md` and the reference files keep calling the files "policy" and "the models table". One section at the top of `SKILL.md`, "Where the config lives", states that these names mean the two files in `~/.claude/diff-type-subagents/`. Only that section and the places that create or write the files name the real path.

Split rule for `models-and-commands.md` (the builder applies it, listing each moved block in the plan): a fact about how a CLI behaves in general stays in the skill; anything recorded from this machine (a row, a probe result, a date, a user confirmation, a quota reading) moves to the user's `models.md`.

The tier map, the skill source roots and the Environment table in the current `policy.md` are user or machine data: they move to the user's `policy.md`; the template keeps the structure with empty rows.

### 2. The marker

The first lines of the user's `policy.md` carry: `Configured for: <hostname> | <operating system and shell> | <date>`.

Every session, before Gate 1, the skill compares the marker with the live machine. Match: continue. Mismatch or no marker: stop and ask the user to choose (a) reconfigure for this machine (same as `reset`), (b) keep the config and only update the marker, (c) cancel. Nothing is changed before the answer. This replaces the current check that compares only the operating-system cell, and keeps the Environment table check as a second guard.

### 3. The four entry modes

| Typed | Meaning | What happens |
|---|---|---|
| `/diff-type-subagents` | Use the current config | If the config folder is missing, run `setup` first. Otherwise marker check, then Gate 1A as today. |
| `/diff-type-subagents setup` | Configure this machine | Create the folder from the templates. Probe the Environment table, ask for each policy item, ask which CLIs are installed and run Gate 1B for them, probe skill roots. Every write shows its diff and waits for confirmation. |
| `/diff-type-subagents reset` | Start the configuration again | Ask for confirmation. Move the existing folder to `~/.claude/diff-type-subagents.bak-<YYYY-MM-DD-HHMM>/` (never delete), then run `setup`. |
| `/diff-type-subagents target: a, b` | Use only these CLIs as workers for this run | A hard filter. If the config is missing, run `setup` first. Run Gate 1B for each named CLI (verified rows are recorded in `models.md` as usual). Other CLIs in the table are ignored for this run. The host's own subagent mechanism is in the pool only when the list contains the word `host` (for example `target: host, opencode`). A name that matches no installed program is reported and not guessed. |

The older free-text form `I installed: ...` keeps working and means "these CLIs exist", which is not a filter.

`target:` is per run: it is not stored in the config.

### 4. Shorter description

Proposed text: "Delegate work to subagents of different vendors (CLI agents installed on the machine, or the host's own subagent mechanism), with the current session as orchestrator and reviewer. Use when the user types /diff-type-subagents or asks to delegate work to other agents or CLIs." The sentence "Load it at Step 0... apply it at every workflow step" is removed from the description; batch 2 decides its replacement in the body. Until batch 2, the body keeps the behavior it has today.

### 5. README.md (for people)

Short: what the skill does, the four modes with one example each, where the config lives and what is in it, how to reset, what `reset` does with the old config, and the privacy note that nothing in the config folder is committed. No rule text is copied from `SKILL.md`.

### 6. Migration of the existing configuration

The values in the tracked `policy.md` and the recorded rows of `models-and-commands.md` are this user's. The implementation moves them into `~/.claude/diff-type-subagents/` unchanged (with the marker added for this machine, hostname read by the builder), and replaces the tracked copies by the templates. Writing outside the repository is a step that needs the user's permission when the plan reaches it.

## Decisions made by the author (user may override)

- `reset` backs up the old folder and never deletes it.
- `target:` is not persisted.
- The command prefix and the handoff root stay items of `policy.md`, asked once at `setup`; the handoff root default stays `.superpowers/diff-agents/` relative to the project and must be ignored by git.
- The marker uses hostname, operating system and shell, and a date.
- The folder `~/.claude/diff-type-subagents/` is fixed; no environment-variable override in this batch.

Calls added after the builder check (author's calls, user may override):

- **One folder for every orchestrator.** `~/.claude/diff-type-subagents/` is the single location whatever vendor orchestrates; the skill text calls it "the per-user config folder". Items that depend on the host (`Orchestrator`, `Completion signal`) are recorded per host in `policy.md`, as the existing `Completion signal` rule already requires.
- **Hard rules and path names.** The hard rules stay word for word, except that a path name in them (`references/policy.md`, `references/models-and-commands.md`) is allowed to change or to be redefined by the new "Where the config lives" section. Success check 6 reads: "unchanged except path names".
- **Template defaults.** The blank templates keep the vendor-neutral proposed defaults (`Spread`, `Parallel limit`, `Liveness window`, the quota thresholds, the effort ceiling) marked `[Proposed]`; every row that names a vendor or model (forbidden models, fallback order, equivalents, tier map, models table) is empty. Setup asks only for the items that have no default, so it asks as few questions as possible.
- **`target:` and the other gates.** No change to `allocation.md` or the fallback text. Escalation chains and fallback entries are limited to the targeted CLIs. If a step leaves no row, the existing rule applies: stop and ask the user, who may widen the list. A named CLI whose Gate 1B fails or is only partly verified is recorded as `[Unverified]` by the existing rule and is not used.
- **Marker comparison.** Operating system and shell are the hard keys. The date is never compared. If only the hostname differs (a network-dependent hostname), the skill asks the same three-way question once, and answer (b) updates the marker so the question does not repeat.
- **Success check 1 scope.** The search covers recorded values (a model name, `rtk`, a path under a user's home, a tier choice, a probe date), not generic guidance. The cross-system "Suggested equivalents" paragraph and the Environment-table structure stay in the skill, as guidance, not as recorded values.
- **Migration.** A gated task in the plan: back up first, write to `~/.claude/diff-type-subagents/` only with the user's permission at that step, then replace the tracked copies by the templates. Success check 7 compares the migrated config with the pre-change files.

## Left to the builder

- Exact wording of the new `SKILL.md` sections and the README.
- Which blocks of `models-and-commands.md` move, by the split rule above.
- How to read the hostname on each operating system (an Environment-table item with a probe, like the others).
- The order of the plan's tasks.

## Success checks

1. No tracked file under `.claude/skills/diff-type-subagents/` contains a recorded machine value (search for the current user's model names, `rtk`, `macOS`, `/Users/`, dates of probes).
2. With the config folder absent (test with a temporary `HOME`), `/diff-type-subagents` starts `setup`, writes nothing before a confirmed diff, and ends with a working config.
3. A changed marker triggers the three-way question and changes nothing before the answer.
4. `reset` leaves a backup folder and a fresh config; the backup is complete.
5. `target: a, b` limits allocation to those CLIs, excludes the host unless `host` is listed, and reports an unknown name without guessing.
6. Every hard rule of `SKILL.md` is word for word unchanged, except path names; a diff of the batch shows edits only in the new sections, the description, path references and the moved blocks.
7. The migrated config on this machine reproduces the pre-change behavior (same models table and policy values).
