---
id: migration-caf-strategies
title: "The 7 Rs: choosing a migration strategy for each application"
required: true
videoQuery: AWS 7 Rs migration strategies rehost replatform refactor explained
---
## One portfolio, many strategies

A company rarely moves every application the same way. During planning, each application gets one of seven **migration strategies**, known as the **7 Rs**.

## The seven strategies

- **Retire**: switch the application off or archive it, because it has no business value left. Example: a reporting tool nobody has opened in months.
- **Retain**: keep the application where it is for now, perhaps to migrate later. Reasons include data residency rules, a recent hardware upgrade, dependencies that must move first, or hardware with no cloud equivalent.
- **Rehost** ("lift and shift"): move the application to AWS **without changing it**, for example from an on-premises server to an Amazon EC2 instance. It is fast and lets you modernize later, once you are already in the cloud.
- **Relocate**: move many servers at once from an on-premises platform to the **cloud version of that same platform**, without buying hardware or rewriting applications. Example: moving VMware-based workloads to a VMware environment running on AWS. It also covers moving resources to another VPC, Region or account.
- **Repurchase** ("drop and shop"): replace the application with a different product, usually **software as a service (SaaS)**. Example: replacing a self-hosted CRM with a SaaS CRM.
- **Replatform** ("lift, tinker and shift" or "lift and reshape"): move the application and make **some optimizations** without changing its core architecture. Example: moving a self-managed SQL Server database to **Amazon RDS for SQL Server**.
- **Refactor or re-architect**: redesign the application with **cloud-native features**, such as microservices, containers or serverless, to gain agility, performance and scale. It is the most complex and costly strategy.

## Exam keyword map

| Scenario keyword | Strategy |
| --- | --- |
| Decommission, no longer needed | Retire |
| Not ready yet, must stay on premises for now | Retain |
| Move as-is, no code changes | Rehost |
| Quickest move: same hypervisor platform moved to its cloud version | Relocate |
| Switch to a SaaS product | Repurchase |
| Move to a managed service with small changes | Replatform |
| Rebuild as microservices or serverless | Refactor |

## Common traps

- Rehost and replatform both move the application. If the scenario adds a **managed service** or a small optimization, it is **replatform**.
- Repurchase means **buying a different product**; moving your own licensed copy to EC2 is rehost.
- For large migrations, AWS recommends rehosting, relocating or replatforming first and modernizing after the move, because refactoring during a migration is hard to manage at scale.

## Key points

- 7 Rs: Retire, Retain, Rehost, Relocate, Repurchase, Replatform, Refactor.
- Rehost = lift and shift; Replatform = lift and reshape; Repurchase = drop and shop.
- Refactor gives the most cloud benefit but costs the most effort.

## Sources

- [About the migration strategies, AWS Prescriptive Guidance](https://docs.aws.amazon.com/prescriptive-guidance/latest/large-migration-guide/migration-strategies.html)
