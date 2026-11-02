---
id: pricing-billing-estimating
title: "Estimating and optimizing costs: Pricing Calculator, Migration Evaluator and Compute Optimizer"
required: true
videoQuery: AWS Pricing Calculator Migration Evaluator Compute Optimizer explained
---
## Before you build: AWS Pricing Calculator

**AWS Pricing Calculator** is a **free web tool** for estimating what a planned AWS workload will cost. You add services, describe how you will use them (instance type, hours, storage, requests, data transfer) and choose payment options, and it shows **upfront, monthly and yearly** estimates with the calculation behind each number.

- You do not need AWS experience to use the public website.
- Group services to match your architecture, save a link to share, or export to CSV or PDF.
- The estimate excludes taxes, and your real bill depends on actual usage.
- An **in-console** version can also apply your own discounts and existing commitments.

Exam clue: "estimate the monthly cost of a new application before deploying it" means the **Pricing Calculator**.

## Building a business case: Migration Evaluator

Total cost of ownership (TCO), from the cloud concepts topic, compares the **full** cost of running workloads on premises with running them on AWS. **Migration Evaluator** (formerly TSO Logic) is a **complimentary** AWS service that helps build that data-driven **business case for migration**:

- It discovers your current servers with an **agentless collector**, or you upload inventory exports from existing tools.
- It analyzes server configuration, utilization, running costs and license options, then matches workloads to right-sized EC2 options.
- It produces a business case comparing today's costs with several projected AWS scenarios.

Older study material may mention a separate "AWS TCO Calculator"; for a TCO assessment today, AWS guidance names Migration Evaluator.

## After you build: right-sizing with AWS Compute Optimizer

**AWS Compute Optimizer** analyzes the configuration and **CloudWatch utilization metrics** of resources such as EC2 instances, Auto Scaling groups, EBS volumes, Lambda functions and some databases. It reports whether each resource is **over-provisioned, under-provisioned or optimized**, flags idle resources and recommends a better size. You opt in first, and it needs some metric history before it can recommend.

## Choosing the right tool

- Estimate a **future** workload: Pricing Calculator.
- Justify a **migration** with an on-premises vs AWS comparison: Migration Evaluator.
- Shrink **running** resources that are too big: Compute Optimizer.
- See **past** spend and trends: Cost Explorer (previous lesson).

## Common traps

- Pricing Calculator **estimates**; it does not track what you actually spent.
- Compute Optimizer recommends sizes; it does not buy Savings Plans or change instances for you.
- Migration Evaluator is about the **business case**; moving the servers uses migration services (next topic).

## Key points

- Pricing Calculator: free estimates of planned AWS costs.
- Migration Evaluator: complimentary TCO business case for migrating to AWS.
- Compute Optimizer: right-sizing recommendations from utilization metrics.
- Match the tool to the moment: planning a build, planning a migration, or running workloads.

## Sources

- [What is AWS Pricing Calculator?](https://docs.aws.amazon.com/pricing-calculator/latest/userguide/what-is-pricing-calculator.html)
- [Migration Evaluator, AWS Prescriptive Guidance](https://docs.aws.amazon.com/prescriptive-guidance/latest/migration-tools/business-case-migration-evaluator.html)
- [What is AWS Compute Optimizer?](https://docs.aws.amazon.com/compute-optimizer/latest/ug/what-is-compute-optimizer.html)
