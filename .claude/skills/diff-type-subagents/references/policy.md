# Policy (machine and user settings; not rules)

Read at Gate 1. If this file is missing, or the user says the setup changed, ask the user for each item, then write the answers here and show the diff before saving. The rules in `SKILL.md` never name a vendor or a model; every such choice lives here.

| Item | Value |
|---|---|
| Orchestrator | the agent session running this skill; Gate 1 records its identity and the result of its self-probe |
| Forbidden as worker | any Opus model (including `claude-opus-4-6-thinking` in Agy and Opus 5.5 through the Agent tool). Sonnet 5.5 is allowed as a worker (user decision 2026-11-19). Exception that stays: `claude-sonnet-4-6` in Agy is arbiter-only, a little, for disputed or low-confidence findings; it is not a writer |
| Effort ceiling | below `ultra` and `max`, unless the user asks (Codex `ultra` delegates tasks automatically, which raises cost and makes the agent wander) |
| Fallback order | Codex -> Agy -> Haiku 5.5 (Agent tool); Agy -> Codex -> Haiku 5.5 (Agent tool); after the last entry: stop, save the ledger, report the state to the user |
| Equivalents when falling back | Sol high -> Agy `claude-sonnet-4-6` or `gemini-3.8-flash-high`; Agy Gemini high -> Codex Sol medium; any -> Haiku 5.5 XHigh at the end |
| Quota thresholds [Proposed] | 20% or more left = normal work. 5% to 20% = only small preparation tasks with a clear stopping point (for example collecting official source URLs and excerpts into a notes file marked "unverified", or sorting work items by difficulty). Below 5% = start no new task, and leave the rest for the user, because the quota is the user's personal subscription. Preparation output is a lead; the successor re-verifies the key claims. |
| Spread | prefer (default) \| require \| off. Used at step 6 of `references/allocation.md`: `prefer` spreads equal choices across families and quota, `require` sends a task to a family not yet used in this run when two or more remain, `off` skips spreading |
| Command prefix | `rtk` |
| Handoff root | `.superpowers/diff-agents/` (must be ignored by git) |

## Tier map

Used by `references/allocation.md` (steps 4 and 5): a row's tier is compared with the weight of the task. Tier labels: Small, Medium, Heavy, Very heavy. Family means the vendor line. The Haiku and Sonnet rows are the user's decision of 2026-11-19; the Codex and Agy rows are a proposal to be checked by the user. A row with no measured result starts at Small until a pilot passes and the user approves a higher tier at Gate 1A or 1B. The table order is the tie-break order of step 6.

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
