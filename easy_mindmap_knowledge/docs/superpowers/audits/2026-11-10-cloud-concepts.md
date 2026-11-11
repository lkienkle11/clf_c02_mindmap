# Audit: cloud-concepts (47 questions, 10 lessons EN/VI)

Date: 2026-11-11. Workers: Codex gpt-6.1-sol high and Haiku 5.5 XHigh, read-only; compliance OK. Raw results: `.superpowers/diff-agents/2026-11-10-question-bank-audit/cloud-concepts/results/`.

Result: no answer key changed. 42 of 47 verified by both workers. The five flagged items keep their keys:
- `q_8848520dc9d5` (Free Tier expiry): A holds for Paid-plan accounts; the newer Free plan is suspended or closed instead of billed.
- `q_e682e17f95bc` (economies of scale), `q_37eca218d73d` (unpredictable demand; AWS's "stop guessing capacity" is not offered, scalable is the nearest), `auth-cloud-concepts-04`, `auth-cloud-concepts-10`.

## Applied after approval (flagged by both workers)
- `q_8848520dc9d5`: explanation and note for A now separate Paid-plan billing from the Free plan (no charge, account suspended or closed unless upgraded).
- Lesson 04 (EN+VI): right-sizing is usually iterative but can be one-off if the effort costs more than the savings.

## Listed, not applied (one worker only)
- `auth-cloud-concepts-10`: Codex says CPU below 15% alone does not prove that smaller instances suit the workload; Haiku verified.
- Codex lesson notes (about 8, minor): six-advantages wording, TCO components, 75% saving for part-time instances, horizontal scaling sizes, Lambda/DynamoDB scaling, Well-Architected Tool and Trusted Advisor.
