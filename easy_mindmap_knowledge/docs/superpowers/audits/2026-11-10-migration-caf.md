# Audit: migration-caf (83 questions, 10 lessons EN/VI)

Date: 2026-11-11. Workers: Codex `gpt-6.1-sol` high (primary) and Haiku 5.5 XHigh (second opinion), both read-only. Compliance check after the runs: working tree identical to the snapshot taken before (`2b9fde2a…`), HEAD unchanged (`0ce1f15`). Raw results: `.superpowers/diff-agents/2026-11-10-question-bank-audit/migration-caf/results/`.

Result: 83 questions, 6 batches of output all valid JSON. 72 verified by both workers with no issue on the key. Items needing a decision are below. Orchestrator verification used the official pages listed per item.

## A. Answer changes (both workers agree, orchestrator verified)

| # | Question | Current | AWS says | Evidence |
|---|---|---|---|---|
| A1 | `q_79a6198b037a` "capability of the Business perspective" | A Program and project management | **B Data science**. Program and project management is a Governance capability. | CAF Business perspective (8 capabilities: strategy mgmt, portfolio mgmt, innovation mgmt, product mgmt, strategic partnership, data monetization, business insights, data science); CAF Governance perspective |
| A2 | `q_af399656dd4d` "capabilities of the Governance perspective (choose two)" | C Portfolio management + D Risk management | **A Program and project management + D Risk management**. Portfolio management is a Business capability (Governance has *Application* portfolio management). | same two pages |
| A3 | `q_170468ef4f96` "design principle of the Performance efficiency pillar" | B Scaling horizontally | **A Using serverless architectures** (listed principle). Horizontal scaling is a Reliability principle. | Performance efficiency design principles page |

The existing explanations already admit the conflict ("this item conflicts with the current framework"); they would be rewritten to match the new keys.

## B. Questions with no defensible answer or unclear stem (need a decision)

- `q_8dbda4b2d28d` "concept = ability to remain functional when it encounters operational problems": options Consistency / Elasticity / Durability / Latency. Both workers: no option matches (AWS calls this resiliency / fault tolerance; durability is about data persistence). Current key C.
- `q_ea907910d5b1` "Which CAF perspective will meet these requirements?": the requirements are missing from the stem, so no key can be justified (explanation already says "looks incomplete"). Current key B (People).
- `q_677db91ace22` "CMS incompatible with cloud, migrate with LEAST effort (choose two)": keys Retire + Rehost. Both workers: ambiguous. Retire decommissions rather than migrates; Rehost needs no changes, which an incompatible app cannot satisfy; Repurchase is defensible. No second answer is established.

## C. Application Discovery Service closed to new customers (4 questions)

Official page: ADS stopped accepting new customers on 2025-11-07; AWS recommends AWS Transform. Questions `q_2bfa37b37f25`, `q_6e5055488b62`, `q_6ac10c72e267`, `q_cefaa55a11e3` still key ADS, and no AWS Transform option exists, so ADS is still the only fitting option (Codex "ambiguous" / Haiku "outdated" are both about availability, not a different key). Proposal: keep the keys and add a sentence to each explanation (and to the lesson) that the service is closed to new customers.

## D. Explanation fixes (flagged by both workers or verified)

- `q_daf8d9c909b5`: option note C implies data governance is not a Governance capability; Governance lists Data governance and Data curation. Reword.
- `q_8e424f1d0bf8`: "Automatically scale to meet demand" is a paraphrase of "Stop guessing capacity"; minor wording.
- Notes for A1–A3, B and C items are rewritten as part of those decisions.
- Single-worker notes (not applied, listed only): Codex on `q_c89119db5dfb` (end-to-end wording), `q_d4d093462288`, `q_bf2cd57e6a78` (option A note); Haiku on `q_bf2cd57e6a78` (no AWS list of migration types, left unsure).

## E. Lessons

Verified by the orchestrator, proposed for the wording batch (EN, then VI mirrored):
- L1 `02-migration-strategies`: "Move as-is, fastest, no code changes → Rehost". AWS: Relocate is "the quickest way to migrate"; Rehost = no changes. Fix: drop "fastest"; add a Relocate row. (Both workers.)
- L2 `09-data-transfer-services`: "Petabytes with weak networking → Snow family". AWS: Snow Family devices are no longer offered to new customers; alternatives are DataSync (online) and AWS Data Transfer Terminal (physical). (Haiku; verified.)
- L3 `07-disaster-recovery-strategies`: cost rule lacks the exception ("unless a secondary driver such as regulatory requirements"). (Haiku; verified on the BCP page.)
- L4 lesson mention of ADS: add the closed-to-new-customers sentence (ties to section C).

Listed, not applied (single worker, or not verified):
- `05-discovery…`: Agentless Collector and network connections. AWS pages contradict each other (overview text says it cannot see connections; comparison table says it collects TCP connections). Both workers flagged it, but in opposite directions; recommend softening to "see the Discovery Agent for process and dependency detail" only if you want it.
- `05-discovery…`: "agentless option exists for VMware" (Codex says MGN agentless replication is closed to new deployments). The page I fetched returned no content, so this is unverified.
- Codex: Transfer Family AS2 does not support EFS; MGN 90 days vs 2,160 hours; DataSync Enhanced-mode per-task charge; DMS heterogeneous paths; repurchase example. All minor, single worker.
- Haiku: "Availability Zones when a country has only one Region" (low confidence; the BCP page says multi-AZ may already meet much of the risk need, so the sentence is not contradicted).

## F. Data finding

Card 333 ("Which options are AWS CAF perspectives? Choose two") is not in the bank because the deck marks only one key. CAF perspectives are Business, People, Governance, Platform, Security, Operations (verified by Haiku on the CAF foundational-capabilities page); a restored question could use correct keys.
