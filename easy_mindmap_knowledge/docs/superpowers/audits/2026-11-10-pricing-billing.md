# Audit: pricing-billing (79 questions, 12 lessons EN/VI)

Date: 2026-11-11. Workers: Codex gpt-6.1-sol high and Haiku 5.5 XHigh, read-only; compliance OK. Raw results: `.superpowers/diff-agents/2026-11-10-question-bank-audit/pricing-billing/results/`.

Result: 72 of 79 verified by both workers; one answer key changed; four questions repaired by replacing options (key letters unchanged).

## Answer change (approved by the user, re-graded)
- `q_5b0dac58ac8d` (partial move to serverless, pay up front): key A (Convertible Reserved Instances) to D (Compute Savings Plan). Compute Savings Plans cover EC2, Fargate and Lambda and can be paid up front; Convertible RIs only discount EC2. Logged in `answer-corrections.json`.

## Options replaced (keys unchanged)
- `q_3c87bfb3302a`: Standard RIs became Dedicated Hosts and Convertible RIs became Dedicated Instances (a reservation can be cheaper depending on utilization).
- `q_f79117a86e9b`: On-Demand became Dedicated Hosts. `q_52472f8c8cc8`: Amazon EC2 became Amazon S3 (EC2 can also share AMIs). `q_61cea7a24ea1`: AWS Cost Explorer became AWS Budgets, the tool for staying within a budget.

## Wording (flagged by both workers)
- `q_21dcc39b6973`: the Savings Plan discount applies up to the hourly commitment; usage above it is billed On-Demand.
- `q_b10f0f7081a9`: QuickSight is now AWS Quick Sight; the Cost Explorer note was softened.
- Lesson 05 (EN+VI): Control Tower mandatory controls are applied to OUs by default, although landing zone 4.0 stopped deploying some. Lesson 07 (EN+VI): Cost Anomaly Detection needs no budget but alert subscriptions take a threshold.

## Left unchanged (one worker only)
- `q_8d9233b5eca9` (Cost Explorer shows rightsizing), `auth-pricing-billing-02` (100 GB free egress allowance wording) and about 15 minor Codex lesson notes (Free plan wording, cross-AZ exceptions, consolidated billing per seller of record, IAM billing access, Cost Explorer date ranges, Service Catalog Terraform External type, Marketplace buyers).
