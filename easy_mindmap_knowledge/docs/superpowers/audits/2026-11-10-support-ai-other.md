# Audit: support-ai-other (68 questions, 13 lessons EN/VI)

Date: 2026-11-11. Workers: Codex gpt-6.1-sol high and Haiku 5.5 XHigh, read-only; compliance OK. Raw results: `.superpowers/diff-agents/2026-11-10-question-bank-audit/support-ai-other/results/`.

Result: 56 of 68 verified by both workers. One answer key changed; eleven questions repaired by replacing options (key letters unchanged).

## Answer change (approved by the user, re-graded)
- `q_12fe20e3c20a` (operational readiness for a launch at no additional charge): key A (Business Support) to D (Enterprise Support). Enterprise Support includes TAM-led readiness reviews and AWS Countdown; Business Support+ lists neither. Option A is now "AWS Business Support+". Logged in `answer-corrections.json`.

## Options replaced (keys unchanged)
- Support plans: Business Support became Business Support+ (Business closed to new subscriptions on 2025-12-02) in `q_19754cd5f1ee`, `q_147574dbaa2c`, `q_8bc907a66e58`; in `q_4d61f5df0c2f` (Support API) option B is now Business Support+ and C is Developer Support, because the Support API needs Business Support+ or higher.
- Closed or retired services: Amazon Kendra became Amazon Bedrock Knowledge Bases (`q_7880cdf20a82`, `q_7fa6e2082917`); Amazon QuickSight Q became Amazon Q in QuickSight (`q_126ab4125066`); Amazon Elastic Transcoder became AWS Elemental MediaConvert (`q_72e2c61d3ddd`).
- Arguable options: `q_b2d5da578047` (consultative review became a free exam voucher), `q_a8863202916c` (SageMaker became Amazon Polly), `q_559c800b1841` (AppStream 2.0 became Amazon Connect).

## Lessons (EN+VI)
- Lesson 01: the Support API needs Business Support+ or higher; the full Trusted Advisor answer is Business Support+. Lesson 04: Countdown is included with Enterprise Support (Business Support+ can add Countdown Premium).

## Left unchanged (one worker only)
About 8 minor Codex lesson notes (Lex and Polly, Rekognition API wording, SQS retention, WorkSpaces Personal and Pools) and one Haiku note (WorkSpaces Applications startup time).
