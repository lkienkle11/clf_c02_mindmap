# Audit: unassigned (17 imported questions, no lessons)

Date: 2026-11-11. Workers: Codex gpt-6.1-sol high and Haiku 5.5 XHigh, read-only; compliance OK. Raw results: `.superpowers/diff-agents/2026-11-10-question-bank-audit/unassigned/results/`.

Result: no answer key changed. 15 of 17 verified by both workers.

## Applied after the user's decisions
- `q_04a9f4df9512` (Savings Plans, choose two): the AWS Savings Plans types page now lists Database Savings Plans covering RDS and DynamoDB, so four options were correct. The user chose to keep the key A (EC2) + C (SageMaker) and replace the two extra correct options with services Savings Plans do not cover: B is now Amazon S3, E is now Amazon CloudFront. The key is unchanged, so no re-grade; explanation and notes rewritten. Redshift stays as a wrong option.
- `q_a9d4cd2d30b3` (carbon emissions tool): AWS now presents the capability as AWS Sustainability (page renamed); key B stays, explanation and note say so. Codex's claim of a deprecation on 2026-06-30 was not confirmed by the page.

## Left unchanged
- `q_54edb01c38ac` (software licence cost): Codex verified, Haiku unsure; key stays.
- `q_368f262368d2` (SNS for a CloudWatch alarm): Codex notes EventBridge is also possible; the key stays (SNS is the direct alarm action).
