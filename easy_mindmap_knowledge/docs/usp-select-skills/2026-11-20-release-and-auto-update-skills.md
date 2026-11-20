## CHOOSEN SKILLS FOR THIS TASK
- superpowers:using-superpowers --- Step 0: skill check before any action
- select-skills-usp --- per-step skill selection and user confirmation gates
- diff-type-subagents --- delegate research, plan tasks and review to workers of other vendors; orchestrator reviews
- superpowers:brainstorming --- Step 1: clarify release, auto-update and dev/prod split, write the design spec
- web-research --- verify official Tauri v2 docs: updater plugin, signing keys, latest.json, GitHub Releases, tauri-action, per-OS bundle targets, code signing and notarization
- business-analyst --- release and update requirements, stakeholders, constraints (free distribution, unsigned apps on macOS and Windows)
- structure-codebase --- where update logic, release workflow and build-channel config live in src, src-tauri and .github
- svelte-core-bestpractices --- Svelte 5 code for the settings update UI and modal
- svelte-code-writer --- required whenever editing .svelte or .svelte.ts files
- frontend-ui-engineering --- accessible Settings section, update modal, progress states
- ui-ux-pro-max --- UX of Download update (xxx MB), Install update and the "update available" modal
- design --- development-build icon variant distinct from the production mindmap-tree icon
- security-review --- updater signing key handling, update endpoint trust, CSP connect-src change, CI secrets
- superpowers:writing-plans --- Step 2: implementation plan
- superpowers:using-git-worktrees --- Step 3: isolated workspace
- superpowers:subagent-driven-development --- Step 4: execution through workers
- superpowers:test-driven-development --- Step 4: failing test first for version, channel and update-check logic
- superpowers:verification-before-completion --- Step 5
- superpowers:requesting-code-review --- Step 6
- superpowers:finishing-a-development-branch --- Step 7

## STEP 1:
- superpowers:brainstorming
- web-research
- business-analyst
- diff-type-subagents

## STEP 2:
- superpowers:writing-plans
- structure-codebase
- security-review
- diff-type-subagents

## STEP 3:
- superpowers:using-git-worktrees

## STEP 4:
- superpowers:subagent-driven-development
- superpowers:test-driven-development
- diff-type-subagents
- svelte-code-writer
- svelte-core-bestpractices
- frontend-ui-engineering
- ui-ux-pro-max
- design
- structure-codebase
- security-review
