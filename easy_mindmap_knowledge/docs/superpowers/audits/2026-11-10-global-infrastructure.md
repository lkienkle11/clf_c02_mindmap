# Audit: global-infrastructure (26 questions, 9 lessons EN/VI)

Date: 2026-11-11. Workers: Codex gpt-6.1-sol high and Haiku 5.5 XHigh, read-only; compliance OK. Raw results: `.superpowers/diff-agents/2026-11-10-question-bank-audit/global-infrastructure/results/`.

Result: no answer key changed. 24 of 26 verified by both workers. `q_aa55b1e4a4d7` (inbound data transfer is free) keeps key A: Codex only notes that RDS Multi-AZ replication also has no cross-AZ charge.

## Applied after approval (flagged by both workers)
- `q_be38c294a4ef`: the Wavelength note no longer says Wavelength is not for data residency (the AWS Wavelength page says it also serves data residency); Outposts keeps "supported" data on site.
- `auth-global-infrastructure-09`: explanation (authored file and overlay) and the note for option B mention AWS's exceptions (content may move only to provide the services the customer chose or to comply with law). Codex rated the question "wrong"; Haiku verified it. The key stays because option B is AWS's stated commitment.
- Lesson 02 (VI): added the "or sending users a download" example that the English text already had.
- Lesson 06 (EN+VI): "caching always points to CloudFront" now says caching of web content points to CloudFront and Global Accelerator does not cache content.

## Listed, not applied (Codex only, minor)
About 12 notes on lessons 01, 02, 04, 05, 06, 07 and 08: data-residency qualifiers, S3 bucket namespace wording, AZ-scoped resources, Global Accelerator health-check wording, Snow Family availability in the lesson 06 table, and the opt-in Region console note.
