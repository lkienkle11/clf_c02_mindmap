## CHOOSEN SKILLS FOR THIS TASK
- superpowers:brainstorming --- Step 1: pin down what "correct" means (AWS docs vs real exam), scope (668 imported + 130 authored questions, explanations, lessons EN/VI), and the policy for answers that disagree with current AWS docs
- web-research --- verify each question, answer and lesson claim against official AWS documentation (primary sources first) and give source links with confidence levels
- business-analyst --- exam domain rules and CLF-C02 exam guide scope, so the audit matches what the exam actually covers
- structure-codebase --- decide where corrected answers and audit reports live so re-running `scripts/import-cards` cannot overwrite them
- superpowers:writing-plans --- Step 2: turn the approved spec into per-topic audit and fix tasks
- superpowers:using-git-worktrees --- Step 3: isolated branch for content fixes (with the user's permission)
- superpowers:subagent-driven-development --- Step 4: per-topic audit and fix execution, Sonnet 5.5 High / Haiku 5.5 only, never Opus
- superpowers:test-driven-development --- Step 4: content-integrity tests (answers, explanations, option notes and lessons stay consistent)
- superpowers:verification-before-completion --- Step 5: run the tests and checks before claiming anything is done
- superpowers:requesting-code-review --- Step 6: one fresh reviewer for the whole branch
- superpowers:finishing-a-development-branch --- Step 7: integrate (merge/push only with the user's permission)
- svelte-code-writer --- added after the first selection: tasks 3 and 6 edit Svelte modules (`session.svelte.ts`, `app-state.svelte.ts`); the orchestrator checks them with the Svelte MCP tools
- svelte-core-bestpractices --- added: Svelte 5 reactivity and module rules for those two edits
- refactoring --- added: task 3 replaces inline scoring in `session.svelte.ts` with a shared function and must keep behaviour unchanged
- superpowers:systematic-debugging --- added: when a worker's test or build fails unexpectedly, find the cause before fixing

## STEP 1:
- superpowers:brainstorming
- web-research
- business-analyst

## STEP 2:
- superpowers:writing-plans
- structure-codebase

## STEP 3:
- superpowers:using-git-worktrees (dropped by the user's decision: no worktree; the branch was renamed to `fix/question-bank-audit` with plain git commands)

## STEP 4:
- superpowers:subagent-driven-development
- superpowers:test-driven-development
- svelte-code-writer
- svelte-core-bestpractices
- refactoring
- superpowers:systematic-debugging
- superpowers:requesting-code-review
- superpowers:verification-before-completion
