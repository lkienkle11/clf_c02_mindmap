# diff-type-subagents

Delegate work to AI agents of different vendors (CLI agents installed on your machine, or your host's own subagent mechanism). The agent session you are talking to stays the orchestrator: it plans the split, writes each worker's brief, checks every result and reviews the whole branch. The rules are in `SKILL.md`; this page is the short guide for people.

## Commands

| Type | When |
|---|---|
| `/diff-type-subagents` | Normal use. Uses your saved configuration and checks that it still fits this machine. If there is no configuration yet, it starts `setup`. |
| `/diff-type-subagents setup` | First time on a machine. It checks what the machine offers, asks about the few settings that have no default, asks which agent CLIs you have, and tests each one. Every file it writes is shown to you as a diff first. |
| `/diff-type-subagents reset` | Configure again from the start, for example after changing computer, operating system or the set of installed agents. It first moves your old configuration to `~/.claude/diff-type-subagents.bak-<date>-<time>/` (nothing is deleted), then runs `setup`. It refuses to run while a delegated run of the current topic is still going. |
| `/diff-type-subagents target: opencode, minimax` | Use only these CLIs as workers for this run. Each one is tested first; the others are ignored. The host's own subagents are included only if you write `host` in the list, for example `target: host, opencode`. |

You never edit a configuration file by hand to get started.

## Where your configuration lives

In `~/.claude/diff-type-subagents/`, outside any project, so it is shared by every repository on this machine and is never committed:

- `policy.md`: your settings (which models are forbidden, fallback order, quota limits, how many runs at once, and so on), what the machine offers, and a first line `Configured for: <hostname> | <operating system and shell> | <date>`.
- `models.md`: what was verified on this machine about each CLI (models, what each can do, how to start it, how to list its sessions).

If the first line no longer matches the machine (you copied the folder, restored a backup, or changed computer), the skill asks you once whether to reconfigure, keep the configuration and update the line, or cancel. It changes nothing before you answer.

The skill folder itself holds only the rules and blank starting files (`references/templates/`).

## Safe by default

Workers are read-only unless you allow writing, and then only in a separate branch or worktree. The skill never installs anything and never uses a flag that skips an agent's permission checks.
