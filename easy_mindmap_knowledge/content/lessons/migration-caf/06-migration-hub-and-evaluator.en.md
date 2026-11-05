---
id: migration-caf-migration-hub-and-evaluator
title: "Migration Hub and Migration Evaluator: tracking and business case"
required: true
videoQuery: AWS Migration Hub and Migration Evaluator explained business case tracking migration
---
## Two different questions

A large migration raises two planning questions. "Is it worth it, and what will it cost?" is answered with a **business case**. "How far along are we?" is answered with a **tracking** view. **AWS Migration Evaluator** handles the first; **AWS Migration Hub** handles the second.

## AWS Migration Evaluator

**Migration Evaluator** (formerly **TSO Logic**) helps you build a data-driven business case for moving to AWS. It is a **complimentary** service: requesting an assessment or business case and using its collector cost nothing, although you pay for any AWS resources later.

The flow:

1. **Collect inventory and utilization.** Either install the free **agentless collector** (a virtual machine in your network that gathers data with standard protocols, with no agents on your servers), or upload exports from other tools.
2. **Quick Insights** gives an early view of projected Amazon EC2, Amazon EBS and licensing costs.
3. A **business case** report compares the current on-premises cost with several AWS options, such as right-sized instances and different pricing models. It can show how reusing existing software licenses changes cost.

It matches exam wording like "baseline of what the company runs on premises and the projected cost in AWS", or "complimentary tool that creates data-driven business cases".

Do not confuse it with other cost tools. **AWS Pricing Calculator** estimates new workloads you describe by hand; **AWS Cost Explorer** and **AWS Budgets** analyze or track cost and usage you already have in AWS (Budgets against thresholds you set); **Migration Evaluator** starts from what is running on premises.

## AWS Migration Hub

**Migration Hub** is a single place to see discovered servers, group them into applications and **track the status of each application migration**, whatever tool does the moving. It receives status from **AWS Application Migration Service** and **AWS Database Migration Service**, and shows discovery data from Application Discovery Service. Your tracking data is stored in a chosen **home Region**, while the migrated resources can land in any supported Region.

Migration Hub also grew related capabilities:

- **Strategy Recommendations**: suggests migration and modernization paths for applications.
- **Refactor Spaces**: a starting point for incremental refactoring into microservices.
- **Orchestrator**: predefined workflow templates that automate and track server and enterprise application migrations.

**Status:** AWS Migration Hub, including these capabilities, has been closed to new customers since November 7, 2025. Existing customers can continue to use it for ongoing projects, and AWS points to **AWS Transform** for similar capabilities. Exam questions written earlier still use Migration Hub as the answer for "single location to track migration progress".

Migration Hub does not move servers itself. It tracks, groups and reports.

## Putting the services on the migration timeline

| Phase | Typical activity | Services met in this topic |
| --- | --- | --- |
| Assess | Readiness assessment, first business case | CAF, Migration Evaluator |
| Mobilize | Detailed discovery, landing zone, choose a strategy per application | Application Discovery Service, Migration Hub |
| Migrate and modernize | Move servers and data in waves, then improve | Application Migration Service, DMS, DataSync |

Disaster recovery (Elastic Disaster Recovery) is a separate, ongoing need rather than a phase. See the earlier lesson on phases for the full description of assess, mobilize, and migrate and modernize. The CAF gives the organization-wide view with its six perspectives, while these services are tools for the migration work itself.

## Choosing quickly

| Need | Service |
| --- | --- |
| Business case and TCO from on-premises usage | Migration Evaluator |
| Inventory servers and dependencies | Application Discovery Service |
| One dashboard of migration progress across tools | Migration Hub |
| Copy the servers | Application Migration Service |
| Check readiness and capability gaps across the organization | AWS CAF |

## Common traps

- A question about **readiness assessment** points to the **AWS CAF**, not Migration Hub.
- **Tracking** is Migration Hub; **discovery** is Application Discovery Service; **replicating** is Application Migration Service.
- Migration Evaluator is about money and sizing, not about moving workloads.

## Key points

- Migration Evaluator (formerly TSO Logic) = complimentary, data-driven business case using an agentless collector.
- Migration Hub = track discovery and migration status in one place, with a home Region.
- Migration Hub and its related capabilities are closed to new customers since November 7, 2025; AWS Transform is the suggested alternative.

## Sources

- [What is AWS Migration Hub?](https://docs.aws.amazon.com/migrationhub/latest/ug/whatishub.html)
- [Introducing Migration Evaluator, AWS announcement](https://aws.amazon.com/about-aws/whats-new/2020/07/introducing-migration-evaluator-fast-track-business-case-aws)
- [AWS Migration Evaluator FAQ, Quick Insights and agentless collector](https://aws.amazon.com/migration-evaluator/faqs/)
