# Parallel groups: which tasks of a list may run at the same time

Gate 2 step 3f. Run it on the tasks that will be delegated (writes, read-only runs, reviews and scenario runs alike), after the ripple scan (step 3a) and before the table is shown. Every step below is mechanical: two agents given the same task list must reach the same edges, groups and split line. Where a fact is missing, ask the user or mark it [Unverified]; never guess an edge away.

## Inputs

Per task, listed in plan order:

- the files it writes (the plan's files plus its ripple list);
- the files it reads as input (including the files its checks read);
- what it produces and what it consumes, each as a name, a signature, a heading, a table, a column, or content (the result of a run, probe results, resolved paths, a result file);
- the ordering constraints found by the ripple scan (Gate 2 step 3a);
- whether it is read-only;
- whether it is irreversible (Gate 2 step 3b-bis).

## Conflict edges

The file is the unit: two tasks that edit different parts of one file still conflict. An edge between two tasks is one of:

- (a) **write-write:** both write the same file or the same generated artifact.
- (b) **write-read:** one writes a file that the other reads as input.
- (c) **dependency:** one consumes what the other produces.
  - HARD: the consumer uses content that the producer's run creates (probe results, resolved paths, a result file). The producer goes first for every part of the consumer.
  - SOFT: the consumer uses only a name or a shape that the plan's Interfaces block already fixes. For a part of the consumer that writes only its own files the edge is ignored; for the consumer's integration part (edits of shared files) and for its checks the edge applies.
- (d) **ordering constraint** of the ripple scan (a change that would make a check red or break a running consumer if it ran earlier or alone).
- (e) both touch the same irreversible resource, or both need a guard check that cannot run twice at once.
- (f) **shared folder:** a read-only run that cannot get its own working folder conflicts with every write run active in the same folder; it goes to a later group.

Orientation: for (a) and (b) the task listed first goes first; for (c) the producer goes first; for (d) the order the ripple scan gives; for (e) the task listed first goes first. A task queued behind a pilot (`references/allocation.md` step 5) has an edge to the PILOT TASK itself (done AND reviewed, Gate 6 step 1), so it goes to a later group than the pilot. Pilot flags are known only at allocation step 5, so the groups are provisional until allocation has run group by group, and they are re-evaluated for the queued tasks before the table is shown. An edge (e) applies to read-only tasks too (a shared guard that cannot run twice at once).

## Groups

1. Take the tasks in plan order.
2. Orient every edge by its direction (Orientation above: a dependency puts the producer first, the other edges follow plan order). Put each task into the earliest group such that, for every edge, the task that goes first is in an EARLIER group, taking edges to later-listed tasks into account (a later-listed producer is placed before its consumer), and that group has fewer members than `Parallel limit` (never more than the limit). If that group is full, take the next one. A cycle among the edges stops the evaluation: ask the user.
3. A read-only task follows the same rule, using only edges (b), (c) and (e). Read-only tasks never conflict with one another otherwise.
4. Name the groups `G1`, `G2` and so on, in order.

The members of one group start together, unless the parallel limit forces them to start in parts. Write members of one group run at the same time only in separate worktrees (each its own working folder) or clones that the user allowed; without them, the write members run one after the other in group order (a group is then run one write member at a time). A later group starts when the tasks it depends on are done and reviewed (Gate 6 step 1).

## Splitting

The own-file part of a task X is the set of files X writes that no task listed BEFORE X writes (tasks listed after X are ordered after it and do not constrain its own part). The rest of X (its integration part) is its other written files; its checks are NOT parts, so a task whose only remainder is checks is not a candidate. A task is a **candidate** when it has a non-empty own-file part and a non-empty rest.

1. Count the groups of the whole list as it stands.
2. Evaluate the MAXIMAL split: split every candidate at once; do not search subsets. The parts keep plan order, own-file part first, the integration part directly after it, and the integration part has an edge to its own-file part. Every part of a split task inherits EVERY read and EVERY hard dependency of the task; a SOFT dependency is ignored for an own-file part and applies to the integration part. An output (a name, a table, content) belongs to the part that writes the file that holds it: content recorded in a shared file belongs to the integration part, content recorded in the part's own file to the own-file part; an edge to a split task points to the part that holds the output. All other edges of this file apply to the parts as to tasks. Count the groups.
3. Propose the split only when it REDUCES the number of groups (a tie gives no gain and costs extra briefs). When it reduces, write the line `split recommended: <n> groups against <m>` (n = with the split, m = without), then describe the parts, the rows and the approval as in step 4. Otherwise write the line `split not recommended: <n> groups against <m>` and keep the tasks whole.
4. A proposed split changes the scope. Each part is its own row of the main table, with its own allowed paths, ripple list and skills; the row of the integration part names the own-file part it waits for. It is shown with the table, approved by the user, and never applied silently (Gate 2 step 6).

## Limits

- `Parallel limit` in `references/policy.md` ([Proposed 2026-11-19] 3; the user may change it) is the most tasks that run at the same time, counting ALL active runs at launch: a member of a group starts when the number of active runs is below `Parallel limit`, so a group may start in parts, in the order of the table. The quota thresholds of the policy bound it further: at 5% to 20% left the limit is 1 run at a time; below 5% none starts.
- Tasks that write at the same time need separate worktrees (each its own working folder) or clones that the user allowed (ask at Gate 2 step 5), because in a shared working tree one task's checks would read another's half-written files. Without that permission they run one after the other. A read-only task that is active at the same time as a write task needs its own working folder (a separate worktree or a copy of the committed state) or, if it cannot, has edge (f) and goes to a later group, so that its "no change" check (Gate 5) is not disturbed by the writer.
- Each run has its own task folder, log, `exit.code` and `done` (`references/running-workers.md`, Parallel runs).
- Parallelism does not depend on the vendor: the members of a group may be of one family or of several. Allocation (`references/allocation.md`) is run group by group, in order, so that the Spread step counts the members of one group together.

## Record

- Append a column `parallel group` at the END of the main table's column list in `assignments.md`; do not rewrite the other columns.
- Add the section `Parallel groups` to `assignments.md`: the groups in order with their members; the edges that forced an order, one line per pair of tasks (earlier, then later) naming every kind that applies and the reason, and no line for two tasks of the same group (for example `T3 after T2: (a) both write SKILL.md; (b) T3 reads the Gate 1B step list that T2 writes`); the split evaluation line (`split recommended: ...` or `split not recommended: ...`); the limit applied and whether a worktree was requested.
- It is shown to the user with the table and approved with it. The Status rules of Gate 2 apply: any change to the groups sets `Status: draft` again.
