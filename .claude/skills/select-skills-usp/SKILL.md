---
name: select-skills-usp
description: Select all skills relevant to the task, record them in a selection file, and get the user's confirmation before each Superpowers workflow step. Use when the user types /select-skills-usp (short for select-skills-using-superpowers). Load it at Step 0, right after using-superpowers, and apply it before every workflow step.
---

### Select Skills Flag (`/select-skills-usp`)

`/select-skills-usp` (short for select-skills-using-superpowers) means: SELECT ALL SKILLS RELEVANT TO THIS TASK, record them, and get the user's confirmation before each workflow step. It applies only when the user includes the flag in the request.

**Scope: it runs inside the Superpowers workflow only.** Apply it in each Superpowers step, starting immediately after Step 0 (`using-superpowers`). It is not a standalone flag outside the Superpowers workflow.

**Selecting the task skills (right after Step 0):**

- Immediately after Step 0 (`using-superpowers`), re-check all available skills and pick every skill relevant to the task.
- Check whether the selection file exists: `<docs-root>/usp-select-skills/YYYY-MM-DD-<topic>-skills.md`. `<docs-root>` is the project's documentation folder; if it is not clear, ask the user once.
- If the agent has not yet selected skills for this task (the file does not exist), select them now and write the file immediately. Never overwrite an existing file; reuse it and only append.
- Required structure, one line per skill in the form `<skill-name> --- <purpose for this task>`:

```markdown
## CHOOSEN SKILLS FOR THIS TASK
- web-research --- for finding any services or existing flow documentation
- structure-codebase --- for structuring files and modules into meaningfully named folders, avoiding flattening everything into the top-level folder
```

**Per-step selection (Step 1 and every step after it):**

1. Before each workflow step, choose the skills relevant to that step, only from the skills listed in the selection file.
2. Append them to the END of the same file, before doing anything else for that step:

```markdown
## STEP 1:
- web-research
- find-workflow
```

3. STOP. Do not load those skills and do not start the step. Tell the user which skills were selected for the step and wait for the user to review.
4. Only after the user confirms, LOAD the step's skills and then perform the step.
5. Repeat items 1-4 for every following step, exactly the same way.

This flag adds an extra confirmation gate; it never replaces or weakens the approval gates in the Superpowers Workflow rule.
