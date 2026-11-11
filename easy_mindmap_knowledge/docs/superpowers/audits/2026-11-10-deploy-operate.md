# Audit: deploy-operate (70 questions, 13 lessons EN/VI)

Date: 2026-11-11. Workers: Codex gpt-6.1-sol high and Haiku 5.5 XHigh, read-only; compliance OK. Raw results: `.superpowers/diff-agents/2026-11-10-question-bank-audit/deploy-operate/results/`.

Result: 63 of 70 verified by both workers. No answer key changed; three questions were repaired by replacing one option text (the key letter stays, so no re-grade).

## Applied after the user's decisions
- `q_900fc170ef5e` (CI/CD): AWS CodeStar is in full shutdown (end of support 2024-07-25); option D is now AWS CodePipeline, key D unchanged.
- `q_b447fe78db1e` (web application calling AWS services): option D is now AWS SDK instead of AWS CLI, key D unchanged; the explanation no longer says "the exam expects".
- `q_baa5e508c05c` (copies of resources across Regions): option A is now Amazon Cognito instead of Amazon ElastiCache (Global Datastore creates cross-Region replicas); key B unchanged; Systems Manager note softened.
- `q_9945ee071a0a`: notes for CodeBuild and CodePipeline no longer overstate (CodePipeline has its own deploy actions).
- Lesson 03 (EN+VI): CodeDeploy blue/green applies to EC2, Lambda and ECS. Lesson 12 (EN+VI): Step Functions Standard is exactly-once unless Retry is set.

## Left unchanged
- `q_c584da768fe8` (Parameter Store vs Secrets Manager, most cost-effective): key A; Haiku notes AWS recommends Secrets Manager for credentials (one worker).
- `q_a871f520588b`, `q_be5053cc8134`, `auth-deploy-operate-03`: Codex "ambiguous", Haiku verified; keys stay.
- Single-worker lesson notes (about 17, mostly minor): CloudFormation DeletionPolicy and rollback options, CodeBuild billing, CodePipeline action categories, CloudWatch resolution, Systems Manager managed-node wording, SQS visibility timeout, SNS filter policies, AWS Health API support plans (Codex says Business Support+; not verified), Health Dashboard vs EventBridge wording.
