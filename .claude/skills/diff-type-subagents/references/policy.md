# Policy (machine and user settings; not rules)

Read at Gate 1. If this file is missing, or the user says the setup changed, ask the user for each item, then write the answers here and show the diff before saving. The rules in `SKILL.md` never name a vendor or a model; every such choice lives here.

| Item | Value |
|---|---|
| Orchestrator | the agent session running this skill; Gate 1 records its identity and the result of its self-probe |
| Forbidden as worker | any Opus model (including `claude-opus-4-6-thinking` in Agy and Opus 5.5 through the Agent tool); Sonnet as a worker (it only orchestrates and reviews); exception: `claude-sonnet-4-6` in Agy, a little, as an arbiter for disputed or low-confidence findings |
| Effort ceiling | below `ultra` and `max`, unless the user asks (Codex `ultra` delegates tasks automatically, which raises cost and makes the agent wander) |
| Fallback order | Codex -> Agy -> Haiku 5.5 (Agent tool); Agy -> Codex -> Haiku 5.5 (Agent tool); after the last entry: stop, save the ledger, report the state to the user |
| Equivalents when falling back | Sol high -> Agy `claude-sonnet-4-6` or `gemini-3.8-flash-high`; Agy Gemini high -> Codex Sol medium; any -> Haiku 5.5 XHigh at the end |
| Quota thresholds [Proposed] | 20% or more left = normal work. 5% to 20% = only small preparation tasks with a clear stopping point (for example collecting official source URLs and excerpts into a notes file marked "unverified", or sorting work items by difficulty). Below 5% = start no new task, and leave the rest for the user, because the quota is the user's personal subscription. Preparation output is a lead; the successor re-verifies the key claims. |
| Command prefix | `rtk` |
| Handoff root | `.superpowers/diff-agents/` (must be ignored by git) |

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
