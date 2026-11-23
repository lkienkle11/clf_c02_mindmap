# Models, commands, quota and fallback (this machine's record)

Template. `setup` copies this file to the per-user config folder as `models.md`. It holds what was verified on this machine: the models table, worker capabilities, the command shapes found for each CLI, pre-flight checks, session-list commands and quota notes. The generic procedure is in `references/models-and-commands.md`; the custom-CLI procedure is Gate 1B in `SKILL.md`. Never fill a row from memory: rows are added by the Gate 1 probes, each with its check date. A CLI or model that is not found on the machine is not used.

## Models and effort levels

| Vendor | Model | Effort | Notes |
|---|---|---|---|

## Worker capabilities (per CLI and mode)

Each cell is `yes`, `no` or `[Unverified]`, followed by the check date. Rows are added by the Gate 1B probe (step 3b in `SKILL.md`); none is written from memory.

| CLI and mode | Reads path | Reads outside folder | Runs commands | Writes files | Web | Sees skills itself |
|---|---|---|---|---|---|---|

## What each worker can and cannot do

Dated prose notes from probes on this machine (per CLI). Empty until a probe or a run records something worth keeping.

## Command shapes

One entry per CLI, found at Gate 1B from the CLI's own help or documentation: the read-only command, the write-mode command, stdin closed, the mode flag, and flags that must never be used (those that bypass approvals or the sandbox).

## Pre-flight check commands

| CLI | Login check | Live model list | Effort validity | Quota read | Session-list command |
|---|---|---|---|---|---|

## Session visibility

**Session-list table.**

| CLI | Command that lists every worker session | Running session followable in real time | Status |
|---|---|---|---|

## Quota notes

Thresholds, fallback order and equivalents are in `policy.md`.
