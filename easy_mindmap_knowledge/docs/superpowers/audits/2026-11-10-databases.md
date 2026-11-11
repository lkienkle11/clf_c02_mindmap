# Audit: databases (48 questions, 12 lessons EN/VI)

Date: 2026-11-11. Workers: Codex gpt-6.1-sol high and Haiku 5.5 XHigh, read-only; compliance OK. Raw results: `.superpowers/diff-agents/2026-11-10-question-bank-audit/databases/results/`.

Result: no answer key changed. 44 of 48 verified by both workers. The four flagged items keep their keys:
- `q_acb80c2b7edb` (unstructured data): DynamoDB is the best listed option; Codex also allows RDS/Aurora, Haiku notes S3 is the usual answer but is not offered.
- `q_65d7a063cbc7` (sub-millisecond key-value): DynamoDB; microsecond reads need DAX.
- `q_b7001545285b` (millions of queries per second): DynamoDB; Codex also allows ElastiCache for Memcached (not a durable primary store).
- `q_7b025a8943a2` (time-series): Timestream; the LiveAnalytics edition is closed to new customers since 2025-06-20.

## Applied after approval (flagged by both workers)
- `q_acb80c2b7edb`, `q_65d7a063cbc7`: removed "unstructured" and "the exam expects" wording; DAX gives microsecond cached reads.
- `q_f4f00538be9a` (note D) and `q_61a1c6b38011`: encryption is on by default (DynamoDB; new Aurora clusters) but the customer chooses and manages the key type.
- `q_7b025a8943a2`: added the LiveAnalytics availability note and dropped "the exam expects".
- Lessons 06, 08, 09 (EN+VI): TTL deletes are free only in the origin Region (replicated deletes consume write capacity in global tables); Redshift Serverless has no compute charge while idle but managed storage is billed.

## Listed, not applied (one worker only)
Codex: about 10 minor lesson notes (RDS Proxy failover, Aurora endpoints and cross-Region options, DAX consistency, MemoryDB vs ElastiCache, Spectrum vs Athena, Athena reserved capacity). Haiku: RDS default wording, EC2 vs RDS Custom, "data warehouse is always Redshift", Quick naming (Codex and Haiku disagree on Amazon vs AWS Quick). Also single-worker question notes: auth-databases-03 OS patching wording, q_e903abcd5b35 Multi-AZ instance vs cluster.
