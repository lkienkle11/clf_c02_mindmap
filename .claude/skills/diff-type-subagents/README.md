# diff-type-subagents

Delegate work to AI agents of different vendors (CLI agents installed on your machine, or your host's own subagent mechanism). The agent session you are talking to stays the orchestrator: it plans the split, writes each worker's brief, checks every result and reviews the whole branch. The rules are in `SKILL.md`; this page is the short guide for people.

## Commands

| Type | When |
|---|---|
| `/diff-type-subagents` | Normal use. Uses your saved configuration and checks that it still fits this machine. If there is no configuration yet, it starts `setup`. |
| `/diff-type-subagents setup` | First time on a machine. It checks what the machine offers, asks about the few settings that have no default, asks which agent CLIs you have, and (with your permission, which you can remember) tests each one. Every file it writes is shown to you as a diff first. |
| `/diff-type-subagents reset` | Configure again from the start, for example after changing computer, operating system or the set of installed agents. It first moves your old configuration to `~/.claude/diff-type-subagents.bak-<YYYY-MM-DD-HHMM>/` (nothing is deleted), then runs `setup`. It refuses to run while any delegated run, or any folder or branch the skill made, is still unsettled in any topic of this project; the configuration is shared by every project on this machine, so make sure nothing is running in another project either. |
| `/diff-type-subagents target: opencode, minimax` | Use only these CLIs as workers for this run. A CLI new to your configuration is tested first; one already verified is only re-checked; the other CLIs are ignored. The host's own subagents are included only if you write `host` in the list, for example `target: host, opencode`. |

`/diff-type-subagents I installed: a, b` tells the skill that these CLIs exist (it is not a filter). On a machine that already has a configuration, `setup` works like `reset`. You never edit a configuration file by hand to get started.

## Where your configuration lives

In `~/.claude/diff-type-subagents/`, outside any project, so it is shared by every repository on this machine and is never committed:

- `policy.md`: your settings (which models are forbidden, fallback order, quota limits, how many runs at once, and so on), what the machine offers, and a first line `Configured for: <hostname> | <operating system and shell> | <date>`.
- `models.md`: what was verified on this machine about each CLI (models, what each can do, how to start it, how to list its sessions).

If the first line no longer matches the machine (you copied the folder, restored a backup, or changed computer), the skill asks you once whether to reconfigure, keep the configuration and update the line, or cancel. It changes nothing before you answer.

The skill folder itself holds only the rules and blank starting files (`references/templates/`).

## Fewer questions

The skill asks its questions in one list, once per topic, and only the ones it cannot already answer from your configuration, your command or the files of the topic. Every question has a default, and one reply ("accept the defaults") answers the whole list, except the questions about running a test of an agent, creating folders and branches, and choosing where agents write: those you always answer in words.

For a few questions (running the test of a new agent CLI, whether to use an independent reviewer, which kinds of mechanical edit may follow a change) you can answer "yes and remember". The answer is saved on this machine only, in your `policy.md`, after you confirm its diff. Say "forget <name>" to remove one, or use `reset`, which clears all of them.

Some things are always asked, whatever you saved: anything that cannot be undone or touches real data, writing outside the folders the approved plan names, merging into your own branch, merging into your main branch (the skill never does that itself), pushing, changing a worker after you approved the table (moving to a backup worker already listed in it is only reported), and the approval of the plan itself.

## Parallel work

Tasks that cannot touch each other (they share no file and do not depend on each other) are split into separate workspaces. Inside a workspace, tasks that run at the same time each get their own folder, and tasks that run alone use the workspace folder. Finished work is merged back step by step: each task into its workspace as it finishes, and at the end, only if you say yes, each workspace into your branch. If a merge conflicts, only that workspace stops, the skill undoes the half-done merge, and asks you to resolve it or give that workspace up.

How many runs go at once is capped by `Parallel limit` in your `policy.md` (3 by default) and by your quota, however many workspaces there are; the skill shows the number when it asks, and you can name another one.

The skill asks you before it creates any workspace folder or branch for this work, every time (the answer is never remembered), and never merges into your main branch by itself. The configuration folder, the probe folders and its own records under the handoff folder (made as soon as the work has a name) are not project files. At the end it asks whether to merge the workspaces into your branch, and then whether to remove the folders and branches it made. It keeps them unless you say yes, and it never removes your own branch, your own folders, or anything with unmerged or uncommitted work.

## Safe by default

Workers are read-only unless you allow writing, and then only in a branch or worktree you allow (never while your own working tree has uncommitted changes). The skill never installs anything and never uses a flag that skips an agent's permission checks.
