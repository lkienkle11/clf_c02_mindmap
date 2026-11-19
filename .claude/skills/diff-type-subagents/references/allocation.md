# Task allocation (which worker gets which task)

Used at Gate 2 step 3, and again for every move that Gate 2 step 6 or Gate 6 step 1a calls for. The result is the same for the same inputs, whichever agent runs it: follow the steps in order, change nothing by taste, and write every decision into `assignments.md` when it is made. Vendor and model names, tiers and settings come from `references/policy.md` (tier map, spread, forbidden models, quota thresholds) and from `references/models-and-commands.md` (capability cells, session-list commands); nothing here names a vendor.

Inputs, all from files: the tasks (kind, files, plan steps, risk flag, needs, independence constraint), the worker rows (family, tier from the policy's tier map, capability cells, session-list verified, quota state, forbidden or not, delivery modes that work), the policy settings, and the per-family task counts and per-row results in `ledger.json`. Process the tasks one at a time, in plan order, and count the tasks already given earlier in this table.

## Roles and families

- The orchestrator is not a row. It never writes or reviews as a worker; its own review (Gate 6 step 1a) runs in every case and is separate from row R. Independence below is compared between worker rows only.
- "Family" means the vendor line, as the user uses the word (several models of one vendor are one family; each other vendor is another family). Which row belongs to which family is recorded in the models table and the policy's tier map.
- A "row" is one model at one effort level of one CLI (or of the host's own subagent mechanism), as listed in the tier map. The same row may be given several tasks, one fresh session each (Gate 4 step 4).
- The price per token is information only: it is shown in the table and never used to rank (the user's accounts are subscriptions, so the real cost is quota).

## Task weight

Labels: Small, Medium, Heavy, Very heavy (in this order, one level = one step up). Rows carry the same labels as their tier. Thresholds are [Proposed 2026-11-19], to be tuned after the first runs. Compute in this order:

1. Files: count the files in "allowed paths", ripple list included. Up to 2 files: Small. 3 to 8: Medium. Over 8: Heavy. A read-only task with 0 files is Small.
2. If the plan gives no exact steps for the task, add one level.
3. If the task already failed once, add one level. (Never go above Very heavy.)
4. If the task has the high-risk flag (data, security, public contract), the weight is at least Heavy.
5. If the task is hard, the weight is Very heavy. Hard means: the task needs a design decision that the plan does not give, or it already failed twice. This is the orchestrator's call; write the reason.
6. A review or an arbitration takes exactly the weight of the task it reviews, and none of the signals above.

Write the weight and the signals that made it into the Allocation record.

## Algorithm

Run steps 0 to 8 for each task. "Out" means the row is dropped for this task; write the step and the reason for every row that goes out.

0. **Weight.** Find the task's weight (section above).
1. **Mechanical work.** If a script can do the task, use a script, write that in the record, and stop for this task.
2. **Hard filter.** Keep a row only if all of these are true: it is not forbidden by the policy; its session-list command is verified (Gate 1); its quota is normal (a low quota passes only for small preparation work, by the policy's thresholds); every capability column the task needs is `yes` in the capability table (`no` and `[Unverified]` are both out); and at least one delivery mode works for every skill of the task (`references/skill-delivery.md` section 2). If no row is left, stop and ask the user (step 4 gives the message).
3. **Independence filter.** This step applies to a review or an arbitration of work W (a task, or the whole branch for row R). Drop every row of the same family as the row that wrote W. For row R (whole-branch review), W is the task with the highest risk (the high-risk flag first, then the larger weight, then the earlier task); row R must differ in family from the writer of that task. If no row is left, relax to "different session, same family": keep rows of the writer's family, label the independence `low`, and tell the user. Never the same session as the writer. A task that is not a review or arbitration skips this step.
4. **Tier filter.** Keep rows whose tier is at least the task's weight. If no row is left, stop and ask the user (change a worker, relax a need, or accept a lower tier). Never downgrade silently. Say the reason in one sentence: for example "no row has the needed tier", "no row can run commands", or, when every task ends with rows of one family only, "only one family passes step 2" (and then Spread cannot be applied; say so too).
5. **Rank.** Rank by tier only: the lowest tier that is at least the weight goes first. Keep the rows of that lowest tier; they tie. If one row is left, it is chosen. Pilot rule: a row with no recorded result in `ledger.json` for this kind of task may be chosen; the task is marked `pilot` and gets a closer review, and no further task of that kind goes to that row before the pilot's review passes (a later task of that kind may be assigned in the table but is queued, and starts only after that review). There is no separate pilot task.
6. **Tie-break** (only among the rows that tie after step 5, applied in this order; stop at the first that leaves one row):
   - Affinity: if the task shares ripple files with a task that is already assigned, keep the rows of that task's family, unless Spread is `require`.
   - Spread (`references/policy.md`): `prefer` = keep the rows whose family has the fewest tasks in this run (count from `ledger.json` and the tasks already given in this table), then the rows with the most quota. `require` = when two or more families remain after step 5, the task goes to a family not yet used in this run, unless the reason is recorded. `off` = skip this part.
   - Table order: the row listed first in the tier map.
7. **Escalation chain.** For the chosen row, name its next rows now (section "Escalation chain") and write them into the record.
8. **Record.** Write one line in the `Allocation record` (section below): the chosen row, the step that decided, and every dropped alternative with its reason. The user approves the whole table, chains included, before anything is delegated (Gate 2 step 4).

## Escalation chain

Each row of the Allocation record names its next rows in advance. Build the chain from the chosen row:

1. The same family, one tier up (the row of that family with the next higher tier, ties by table order), if it still passes steps 2 to 4 for this task.
2. Then the lowest-tier row of another family that passes steps 2 to 4 for this task (ties by table order). For a review, step 3 applies against the original writer, so the chain never contains a row that fails independence.
3. Then continue the same way from the last row added (same family one tier up first, then another family), without repeating a row.
4. Stop at three rows including the chosen one [Proposed 2026-11-19, the orchestrator's call; the user may lengthen it], or when no row qualifies. The last item of every chain is "ask the user".

Use: a run that fails (tests still red after the allowed attempts, or the review rejects it) moves to the next row of its chain. A stuck run counts as a failed attempt. The user approves the whole chain with the table, so a move along it needs no new approval, but it is told to the user and written to the record and the ledger. Any other change (a row not in the chain, a changed effort, write permission or scope) follows Gate 2 step 6. A failure raises the task's weight by one level (step 3 of "Task weight"); the next row must still pass step 4 at the new weight.

## Allocation record

A section of `assignments.md` (git-ignored), written as decisions are made, one row per task and one for row R:

| task | weight | chosen row | deciding step | alternatives dropped and why | escalation chain |
|---|---|---|---|---|---|

- `weight`: the label and the signals that made it.
- `chosen row`: the row, with the marks `(pilot)` and, for a review, `(independence low)` when they apply. A queued task also says "starts after the pilot review of <task>".
- `deciding step`: the step number that left one row, plus the earlier steps that dropped rows.
- `alternatives dropped and why`: every other row, with the step and the reason (for example "step 2: Web is `no`"). Show the price per token in a note, as information.
- `escalation chain`: the next rows in order, ending with "ask the user".

Show the table and the chains to the user with the Delivery table. Nothing is delegated before the user confirms.
