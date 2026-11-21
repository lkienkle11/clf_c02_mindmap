## CHOOSEN SKILLS FOR THIS TASK
- superpowers:brainstorming --- mandatory first step for new features (show-answer in practice, help powers in session exams)
- superpowers:writing-plans --- turn the approved spec into a test-first plan
- superpowers:using-git-worktrees --- isolated branch/worktree before any code
- superpowers:subagent-driven-development --- execute the plan task by task with subagents
- superpowers:executing-plans --- alternative inline execution if the user chooses it
- superpowers:test-driven-development --- failing test first for every task
- superpowers:systematic-debugging --- if any test or layout shift behaves unexpectedly
- superpowers:verification-before-completion --- evidence before claiming done
- superpowers:requesting-code-review --- whole-branch review
- superpowers:receiving-code-review --- verify each per-task and whole-branch review finding before acting on it
- superpowers:dispatching-parallel-agents --- run independent tasks in parallel groups (up to the parallel limit)
- superpowers:finishing-a-development-branch --- integrate the branch
- diff-type-subagents --- delegate work to subagents of different vendors (user typed the flag)
- web-research --- research how practice-exam apps handle hints/show-answer, and CLS best practice for selection states
- business-analyst --- domain rules for help powers: limits, per-question interactions, edge cases, scoring impact
- svelte-code-writer --- required when editing .svelte components
- svelte-core-bestpractices --- reactivity/state for the new help and reveal state
- frontend-ui-engineering --- accessible, layout-stable exam UI (no CLS on select)
- ui-ux-pro-max --- design of the Show answer button, help counters, option toggle
- tailwind-guidelines --- project styles with Tailwind semantic tokens (confirmed in code)
- run --- launch the dev app for manual checks and the dev build the user will test
- structure-codebase --- where new logic files and the sticky bar component belong
- refactoring --- reuse the existing result-screen answer/explanation rendering instead of duplicating it

## STEP 1:
- superpowers:brainstorming
- diff-type-subagents
- ui-ux-pro-max
- frontend-ui-engineering
- business-analyst
- web-research

## STEP 2:
- superpowers:writing-plans
- diff-type-subagents
- svelte-core-bestpractices
- refactoring

## STEP 3:
- superpowers:using-git-worktrees

## STEP 4:
- superpowers:subagent-driven-development
- superpowers:test-driven-development
- diff-type-subagents
- svelte-code-writer
- svelte-core-bestpractices
- refactoring
- frontend-ui-engineering
- ui-ux-pro-max
- tailwind-guidelines
- systematic-debugging
- run
- verification-before-completion
- structure-codebase
- superpowers:dispatching-parallel-agents
- superpowers:receiving-code-review
