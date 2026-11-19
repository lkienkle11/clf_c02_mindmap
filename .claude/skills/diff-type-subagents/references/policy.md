# Policy (machine and user settings; not rules)

Read at Gate 1. If this file is missing, or the user says the setup changed, ask the user for each item, then write the answers here and show the diff before saving. The rules in `SKILL.md` never name a vendor or a model; every such choice lives here.

| Item | Value |
|---|---|
| Orchestrator | the agent session running this skill; Gate 1 records its identity and the result of its self-probe |
| Forbidden as worker | any Opus model (including `claude-opus-4-6-thinking` in Agy and Opus 5.5 through the Agent tool). Sonnet 5.5 is allowed as a worker (user decision 2026-11-19). Exception that stays: `claude-sonnet-4-6` in Agy is arbiter-only, a little, for disputed or low-confidence findings; it is not a writer |
| Effort ceiling | below `ultra` and `max`, unless the user asks (Codex `ultra` delegates tasks automatically, which raises cost and makes the agent wander) |
| Fallback order | A fallback after a quota stop or an error follows the escalation chain approved in `assignments.md` (`references/allocation.md`). When a row has no chain, the starting order is Codex -> Agy -> Haiku 5.5 (Agent tool) or Agy -> Codex -> Haiku 5.5 (Agent tool), and each entry must still pass steps 2 to 4 for the task; after the last entry: stop, save the ledger, report the state to the user. Never a silent downgrade of tier |
| Equivalents when falling back | Sol high -> Agy `gemini-3.8-flash-high` (only for a task of weight Medium or lower; otherwise ask the user); Agy Gemini high -> Codex Sol medium; any -> Haiku 5.5 XHigh at the end, only if its tier fits the task's weight. The arbiter-only row is never an equivalent of a writer |
| Quota thresholds [Proposed] | 20% or more left = normal work. 5% to 20% = only small preparation tasks with a clear stopping point (for example collecting official source URLs and excerpts into a notes file marked "unverified", or sorting work items by difficulty). Below 5% = start no new task, and leave the rest for the user, because the quota is the user's personal subscription. Preparation output is a lead; the successor re-verifies the key claims. |
| Spread | prefer (default) \| require \| off. Used at step 6 of `references/allocation.md`: `prefer` spreads equal choices across families and quota, `require` sends a task to a family not yet used in this run when two or more remain, `off` skips spreading |
| Completion signal | `native` (verified 2026-11-19: a background shell command and a background subagent each woke the main session when they finished). Note: `native` \| `polling`; any other host: [Unverified], and the orchestrator's own Gate 1 probe ("can I start a background process and be woken in this session when it ends?") decides it, with the date. See `references/running-workers.md` |
| Command prefix | `rtk` |
| Handoff root | `.superpowers/diff-agents/` (must be ignored by git) |

## Tier map

Used by `references/allocation.md` (steps 4 and 5): a row's tier is compared with the weight of the task. Tier labels: Small, Medium, Heavy, Very heavy. Family means the vendor line. The Haiku and Sonnet rows are the user's decision of 2026-11-19; the Codex and Agy rows are a proposal to be checked by the user. Listed rows take the tier shown (a tier that is [Proposed] is used as written). A row that is NOT listed in this map starts at Small until a pilot passes and the user approves a higher tier at Gate 1A or 1B. A measured result matters for the pilot flag (`references/allocation.md` step 5), not for the tier of a listed row. This map gives tiers and families only; the tie-break order is the order of the models table in `references/models-and-commands.md`.

| Family | Row (model, effort) | Tier | Status |
|---|---|---|---|
| Claude | Haiku 5.5 High | Small | user decision 2026-11-19 |
| Claude | Haiku 5.5 XHigh | Medium | user decision 2026-11-19 |
| Claude | Sonnet 5.5 Medium | Heavy | user decision 2026-11-19 |
| Claude | Sonnet 5.5 High | Very heavy | user decision 2026-11-19 |
| Codex | `gpt-6-luna` | Small | [Proposed 2026-11-19] |
| Codex | `gpt-6.1-terra` | Medium | [Proposed 2026-11-19] |
| Codex | `gpt-6.1-sol` | Heavy | [Proposed 2026-11-19] |
| Codex | `gpt-6-astra` | Very heavy | [Proposed 2026-11-19] |
| Agy | `gemini-3.8-flash-low`, `gemini-3.8-flash-medium` | Small | [Proposed 2026-11-19] |
| Agy | `gemini-3.8-flash-high` | Medium | [Proposed 2026-11-19] |
| any row not listed | (new CLI or model) | Small | until a pilot passes and the user approves a higher tier |

## Skill source roots

Where skills are looked up by name (`references/skill-delivery.md` section 1). Order is precedence: project level first, then user level. Patterns are project-relative or home-relative (`~/`); never write an absolute path here. A row is verified only after the Gate 1B skill-folder probe and the user's confirmation.

| Path pattern | Scope | Agents that scan it | Status | Date |
|---|---|---|---|---|
| `.claude/skills` | project | [Unverified] | [Unverified] | 2026-11-19 |
| `~/.claude/skills` | user | [Unverified] | [Unverified] | 2026-11-19 |
| `~/.agents/skills` | user | [Unverified] | [Unverified] | 2026-11-19 |
| `~/.qwen/skills` | user | [Unverified] | [Unverified] | 2026-11-19 |
| `~/.codex/skills` | user | [Unverified] | [Unverified] | 2026-11-19 |
| `~/.cursor/skills` | user | [Unverified] | [Unverified] | 2026-11-19 |

Items marked **[Proposed]** are a proposal that the user has not confirmed. Anything else is a user decision recorded on 2026-11-10 to 2026-11-12.
