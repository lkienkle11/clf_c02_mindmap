# Policy (machine and user settings; not rules)

Configured for: <hostname> | <operating system and shell> | <date>

Template. `setup` copies this file to the per-user config folder as `policy.md` and fills it with the user (every write shows a diff first). Read at Gate 1. If the config is missing, or the user says the setup changed, ask the user for each item, then write the answers there and show the diff before saving. The rules in `SKILL.md` never name a vendor or a model; every such choice lives in the config. An item marked `[Proposed]` ships with a default that the user may change; an empty value is asked at setup.

| Item | Value |
|---|---|
| Orchestrator | the agent session running this skill; Gate 1 records its identity and the result of its self-probe (recorded per host) |
| Forbidden as worker | (empty: ask the user which models, model families or effort levels may never be a worker) |
| Effort ceiling | [Proposed] below the highest effort level of each CLI (the levels that delegate work automatically or raise cost), unless the user asks |
| Fallback order | (empty: ask the user.) A fallback after a quota stop or an error follows the escalation chain approved in `assignments.md` (`references/allocation.md`). When a row has no chain, the starting order is the user's order here, and each entry must still pass steps 2 to 4 of `references/allocation.md` for the task; after the last entry: stop, save the ledger, report the state to the user. Never a silent downgrade of tier |
| Equivalents when falling back | (empty: ask the user which row replaces which, and for which task weight) |
| Quota thresholds | [Proposed] 20% or more left = normal work. 5% to 20% = only small preparation tasks with a clear stopping point. Below 5% = start no new task and leave the rest for the user, because the quota is the user's personal subscription. Preparation output is a lead; the successor re-verifies the key claims |
| Spread | prefer (default) \| require \| off. Used at step 6 of `references/allocation.md`: `prefer` spreads equal choices across families and quota, `require` sends a task to a family not yet used in this run when two or more remain, `off` skips spreading |
| Completion signal | `polling` until the orchestrator's own Gate 1 probe ("can I start a background process and be woken in this session when it ends?") shows `native`, with the date and the host identity. The value is a property of the host, not of the machine: for any other host it is unknown until that host's own probe, and a host that has not been probed counts as `polling`. See `references/running-workers.md` |
| Parallel limit | [Proposed] 3. The most delegated runs that may be active at the same time; a group has at most `Parallel limit` members (`references/parallel-groups.md`). The quota thresholds above bound it further. The user may change it |
| Liveness window | [Proposed] 5 minutes. A run's log counts as still being written when its modification time is within this window of now (`references/running-workers.md`, resume) |
| Command prefix | (empty: ask the user whether commands the orchestrator runs and reads take a prefix; none is valid) |
| Handoff root | [Proposed] `.superpowers/diff-agents/` (must be ignored by git) |

## Environment

What the machine offers. The rules state the result they need; any tool that gives the same result may be used and is recorded here. Gate 1 probes each item read-only (first run on a machine, a missing table, or the user saying the setup changed), shows the user the diff, and writes it after the user confirms. The skill never installs anything: a missing tool is reported to the user, who decides.

| Item | Value | How checked | Date | Status |
|---|---|---|---|---|
| Hostname | | | | |
| Operating system and shell | | | | |
| Tool that gives the SHA-256 of a file | | | | |
| Tool that gives a real path (links followed) | | | | |
| How to close a process's standard input | | | | |
| How to start a background process | | | | |
| Terminal multiplexer | | | | |
| Scripting runtime for parsing JSON | | | | |
| How to wait a short interval | | | | |
| How to read the current time | | | | |

Other systems need the SAME results. Suggested equivalents, none tested on any machine: on Linux, `sha256sum`, `realpath`, `</dev/null`, `&` or the host's background facility, `tmux` if present; on Windows (PowerShell), a file-hash cmdlet (`Get-FileHash -Algorithm SHA256`), a path-resolution cmdlet (`Resolve-Path`, which does not by itself follow every kind of link), a null input redirection (`< NUL` in `cmd`, or no redirection with an explicit empty input in PowerShell), `Start-Process` or the host's background facility, and usually no multiplexer. All of these are [Unverified] until a Gate 1 probe on that machine fills this table with what it finds, with its own date and status.

## Tier map

Used by `references/allocation.md` (steps 4 and 5): a row's tier is compared with the weight of the task. Tier labels: Small, Medium, Heavy, Very heavy. A row is one model at one effort level; the mode comes from the capability table (`references/allocation.md`); a physical row that lists several efforts is expanded into one candidate per effort (`references/allocation.md`, Roles and families), and this map fixes the model and the effort of every row it names; the proposed effort rule of `references/allocation.md` (Roles and families) applies only to a model with no per-effort row here, never above the effort ceiling (when every level at or above the proposed one exceeds it, use the highest level under it; a model with none is not eligible). Family means the vendor line. Rows are the user's decisions (or a proposal the user has not confirmed, marked `[Proposed]`). A row that is NOT listed in this map starts at Small until a pilot passes and the user approves a higher tier at Gate 1A or 1B. A measured result matters for the pilot flag (`references/allocation.md` step 5), not for the tier of a listed row. This map gives tiers and families only; the tie-break order is the order of the models table in `models.md`.

| Family | Row (model, effort) | Tier | Status |
|---|---|---|---|
| any row not listed | (new CLI or model) | Small | until a pilot passes and the user approves a higher tier |

## Skill source roots

Where skills are looked up by name (`references/skill-delivery.md` section 1). Order is precedence: project level first, then user level. Patterns are project-relative or home-relative (`~/`); never write an absolute path here. A row is verified only after the Gate 1B skill-folder probe and the user's confirmation. The table is empty until the probe fills it.

| Path pattern | Scope | Agents that scan it | Status | Date |
|---|---|---|---|---|

Items marked **[Proposed]** are a proposal that the user has not confirmed.
