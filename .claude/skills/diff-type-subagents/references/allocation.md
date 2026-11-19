# Task allocation (which worker gets which task)

Used at Gate 2 step 3, and again for every move that Gate 2 step 6 or Gate 6 step 1a calls for. The result is the same for the same inputs, whichever agent runs it: follow the steps in order, change nothing by taste, and write every decision into `assignments.md` when it is made. Vendor and model names, tiers and settings come from `references/policy.md` (tier map, spread, forbidden models, quota thresholds) and from `references/models-and-commands.md` (capability cells, session-list commands); nothing here names a vendor.

Inputs, all from files: the tasks (kind, files, plan steps, risk flag, needs, independence constraint), the worker rows (family, tier from the policy's tier map, capability cells, session-list verified, quota state, forbidden or not, delivery modes that work), the policy settings, and the per-family task counts and per-row results in `ledger.json`. Process the tasks one at a time, in plan order, and count the tasks already given earlier in this table.

## Roles and families

- The orchestrator is not a row. It never writes or reviews as a worker; its own review (Gate 6 step 1a) runs in every case and is separate from row R. Independence below is compared between worker rows only.
- "Family" means the vendor line, as the user uses the word (several models of one vendor are one family; each other vendor is another family). Which row belongs to which family is recorded in the models table and the policy's tier map.
- A "row" is one model at one effort level of one CLI (or of the host's own subagent mechanism). The same row may be given several tasks, one fresh session each (Gate 4 step 4).
- "Table order" means the order of the Worker rows table of the input; on a real machine, the order of the models table in `references/models-and-commands.md` (not the tier map).
- The price per token is information only: it is shown in the table and never used to rank (the user's accounts are subscriptions, so the real cost is quota).
- Kinds of task (used by the pilot rule): `research` (read-only), `write` (with or without tests), `review` (a review or an arbitration).
- A model fixed by the task's own spec or plan is an input: check that row against steps 2 to 4 and keep it if it passes; if it fails, stop and ask the user.
- An arbiter-only row named in the policy is a user-approved exception outside this algorithm: arbitration by it is chosen by the user, never by the steps, and it is never a writer or a member of a chain.

## Task weight

Labels: Small, Medium, Heavy, Very heavy (in this order, one level = one step up). Rows carry the same labels as their tier. Thresholds are [Proposed 2026-11-19], to be tuned after the first runs. Compute in this order:

1. Files: count the files in "allowed paths", ripple list included. Up to 2 files: Small. 3 to 8: Medium. Over 8: Heavy. A read-only task with 0 files is Small.
2. If the plan gives no exact steps for the task, add one level.
3. If the task already failed once, add one level. (Never go above Very heavy.)
4. If the task has the high-risk flag (data, security, public contract), the weight is at least Heavy.
5. If the task is hard, the weight is Very heavy. Hard means: the task needs a design decision that the plan does not give, or it already failed twice; this is the orchestrator's call, and the reason is written down.
6. A review or an arbitration takes exactly the weight of the task it reviews, and none of the signals above. Row R (whole-branch review), and an arbitration of a whole-branch finding, take the weight of the highest-risk task of the branch.

Write the weight and the signals that made it into the Allocation record.

## Algorithm

Run steps 0 to 8 for each task, in plan order, counting the tasks already given earlier in this table. "Out" means the row is dropped for this task; write the step and the reason for every row that goes out.

0. **Weight.** Find the task's weight (section above).
1. **Mechanical work.** Work is mechanical when a command or a fixed transformation fully determines it, with no judgment (formatting, counting, merging reports). Then use a script, write that in the record, and stop for this task. Anything else is not mechanical.
2. **Hard filter.** Keep a row only if all of these are true: it is not forbidden by the policy; its session-list command is verified (Gate 1); its quota is normal (a low quota passes only for small preparation work, that is, a task whose weight is Small, by the policy's thresholds); every capability column the task needs is `yes` in the capability table (`no` and `[Unverified]` are both out); and at least one delivery mode works for every skill of the task (`references/skill-delivery.md` section 2). If no row is left, stop and ask the user.
   If the rows left for all the tasks of this run belong to one family, say "only one family passes step 2" to the user and go on; Spread then does not apply, and the report says so.
3. **Independence filter.** Applies only to a review or an arbitration of work W (a task, or the whole branch for row R); any other task skips it. Drop every row of the same family as the row that wrote W. For row R, W is the highest-risk task of the branch (the high-risk flag first, then the larger weight, then the earlier task): row R must differ in family from the writer of that task.
4. **Tier filter.** Keep rows whose tier is at least the task's weight. If no row is left, stop and ask the user (change a worker, relax a need, or accept a lower tier). Never downgrade silently. Say why in one sentence, for example "no row has the needed tier" or "no row can run commands".
   Relaxation of independence: if steps 3 and 4 together leave no row (step 3 leaves none, or step 3 leaves rows and step 4 removes them all), repeat steps 3 and 4 without the family exclusion, that is, allow rows of the writer's family in a different session. Label the independence `low` and tell the user. Never the same session as the writer. If still no row is left, stop and ask the user.
5. **Rank.** Rank by tier only: keep the rows of the lowest tier that is at least the weight; they tie. If one row is left, it is chosen. Pilot rule: a row with no recorded result for this kind of task may be chosen. "No recorded result" means no passed review for that row and that kind, recorded in the models table notes or in `ledger.json`. The task is then marked `pilot` and gets a closer review, and no further task of that kind goes to that row before the pilot's review passes (such a task may be assigned in the table but is queued, and starts only after that review). There is no separate pilot task. If a pilot's review fails, the flagged task and every queued task of that kind move to the next row of the chain. The pilot flag never changes which row wins steps 2 to 6; a row that wins only by tie-break (step 6) and has no recorded result for the kind is also a pilot. A queued task stays assigned to its row and waits for the pilot's review, and it counts toward Spread (tasks assigned in this run, queued or not). A pilot flag for one kind does not stop that row from taking tasks of another kind.
6. **Tie-break** (only among the rows that tie after step 5, applied in this order; stop at the first part that leaves one row):
   - Affinity: if the task shares ripple files with a task that is already assigned, keep the rows of that task's family, unless Spread is `require`.
   - Spread (`references/policy.md`): `prefer` = keep the rows whose family has the fewest tasks in this run (count per family, from `ledger.json` and the tasks already given in this table), then the rows with the most quota; quota values that are only `normal`, or that cannot be read, do not separate rows. `require` = when two or more families remain after step 5, the task goes to a family not yet used in this run, unless the reason is recorded. `off` = skip this part.
   - Table order: the row listed first in the table order defined above.
7. **Escalation chain.** For the chosen row, build its chain now (section "Escalation chain") and write it into the record.
8. **Record.** Write one line in the `Allocation record`: the chosen row, the step that decided, and every dropped alternative with its reason. The user approves the whole table, chains included, before anything is delegated (Gate 2 step 4).

## Escalation chain

Build the chain as one loop. Start with the chosen row as the first row of the chain. Repeat until three rows are listed:

1. From the last row added, take the same family one tier up: the next row of that family by tier, among the rows that pass steps 2 to 4 for this task; if two rows of that family share the next higher tier, take the one listed first in table order. For a review, step 3 applies strictly against the original writer: the independence relaxation of step 4 is used only to find the chosen row when steps 3 and 4 leave none, and is never applied again to a later chain slot.
2. If there is none, take the lowest-tier row of another family that passes steps 2 to 4 for this task (ties by table order). "Another family" means a family different from the family of the last row added.
3. Never repeat a row. If no row can be added, stop the loop.

The chain always ends with the item "ask the user". Three rows is a proposal [Proposed 2026-11-19]; the user may lengthen it.

Weight along the chain: rows are chosen at the task's current weight and keep it along the chain. The extra level for a failed attempt (Task weight step 3) applies only if the task is planned again through steps 0 to 8.

Use: a run that fails (tests still red after the allowed attempts, or the review rejects it) moves to the next row of its chain. A stuck run counts as a failed attempt. The user approves the whole chain with the table, so a move along it needs no new approval, but it is told to the user and written to the record and the ledger. A fallback caused by quota or an error follows the same chain. Any other change (a row not in the chain, a changed effort, write permission or scope) follows Gate 2 step 6.

## Allocation record

A section of `assignments.md` (git-ignored), written as decisions are made, one row per task and one for row R:

| task | weight | chosen row | deciding step | alternatives dropped and why | escalation chain |
|---|---|---|---|---|---|

- `weight`: the label and the signals that made it.
- `chosen row`: the row, with the marks `(pilot)` and, for a review, `(independence low)` when they apply. A queued task also says "starts after the pilot review of <task>".
- `deciding step`: the step number that left one row, plus the earlier steps that dropped rows.
- `alternatives dropped and why`: every other row, with the step and the reason (for example "step 2: Web is `no`"). Show the price per token in a note, as information.
- `escalation chain`: the rows in order, ending with "ask the user".

Show the table and the chains to the user with the Delivery table. Nothing is delegated before the user confirms.
