---
id: support-ai-other-support-plans
title: "AWS Support plans: Basic, Business Support+, Enterprise Support and Unified Operations"
required: true
videoQuery: AWS Support plans Business Support+ Enterprise Support Unified Operations explained
---
## Four plans today

AWS currently lists four AWS Support plans. Every account has **AWS Basic Support**; the other three are paid plans billed monthly, with no long-term contract.

- **Basic Support** (included, no extra cost): 24/7 customer service for **account and billing questions** and **service quota increases**, documentation, whitepapers and AWS re:Post, the AWS Health Dashboard, and the **core** AWS Trusted Advisor checks. Basic does **not** include technical support cases with engineers.
- **AWS Business Support+**: AWS calls it the minimum recommended plan for **production workloads**. It adds **24/7 phone, web and chat access to Cloud Support Engineers**, AI-powered contextual help, the **full set** of Trusted Advisor checks, the **AWS Support API** and the AWS Health API, help with common third-party software on EC2, and unlimited cases opened by any user with permission. It starts at **$29 per month** per account.
- **AWS Enterprise Support**: everything in Business Support+, plus a **designated Technical Account Manager (TAM)**, a faster response for production-critical cases, strategic business reviews, access to AWS Security Incident Response, Trusted Advisor Priority and AWS Countdown support for critical events such as launches. The minimum is **$5,000 per month**.
- **AWS Unified Operations**: the highest level, with a designated TAM and **Domain Specialist Engineers**, application architecture guidance, infrastructure event management and critical workload reviews. The minimum is $50,000 per month with a 90-day commitment.

## Comparing the plans

| Need | Lowest plan that meets it |
| --- | --- |
| Account and billing help, documentation, core checks | Basic |
| 24/7 access to engineers, full Trusted Advisor checks, Support API | Business Support+ |
| A designated TAM and strategic reviews | Enterprise Support |
| Domain specialists for mission-critical applications | Unified Operations |

## Response targets

You choose a **severity** when you open a case in the **AWS Support Center**. AWS describes the first-response times as targets it makes every reasonable effort to meet.

| Severity | First response |
| --- | --- |
| General guidance | 24 hours |
| System impaired | 12 hours |
| Production system impaired | 4 hours |
| Production system down | 1 hour |
| Business-critical system down | Business Support+ under 30 minutes; Enterprise Support under 15 minutes; Unified Operations 5 minutes from an Incident Management Engineer |

## Older plan names

Many exam questions use the previous plans: **Developer**, **Business**, **Enterprise On-Ramp** and **Enterprise**. AWS discontinues Developer, Business and Enterprise On-Ramp on **January 1, 2027** (they stay available in AWS GovCloud (US)). Developer and Business customers can move to Business Support+, and Enterprise On-Ramp customers are being moved to Enterprise Support during 2026.

| Older plan | What AWS documents | Today |
| --- | --- | --- |
| AWS Developer Support | Business-hours email access to Cloud Support engineers | Business Support+ |
| Business | Production-system-down response within 1 hour; the full set of Trusted Advisor checks | Business Support+ |
| AWS Enterprise On-Ramp Support | TAMs, business-critical response under 30 minutes, one AWS Countdown engagement a year | Enterprise Support |
| Enterprise | Designated TAM, response under 15 minutes | Enterprise Support |

When an older question asks for "the lowest-cost plan with the full set of Trusted Advisor checks", its answer was Business; today the matching plan is Business Support+. A question that asks which plans provide a **TAM** expects Enterprise On-Ramp and Enterprise.

## Where exam wording and AWS documentation differ

- Some older questions key **Developer** for programmatic case management. AWS's Support API page says a Business Support+, Enterprise Support or Unified Operations plan is required, so treat the older key as exam wording, not current fact.
- "Developer Forums are free with any plan" refers to the community forums that **AWS re:Post** replaced.

## Common traps

- Basic gives no technical cases with engineers; account, billing and quota requests only.
- A **designated TAM** points to Enterprise Support or higher, never Business Support+.
- The **full set** of Trusted Advisor checks and the Support API start at Business Support+.

## Key points

- Basic is free for everyone; Business Support+ is the recommended start for production.
- Enterprise Support adds a designated TAM; Unified Operations adds domain specialists.
- Developer, Business and Enterprise On-Ramp end on January 1, 2027; exam questions may still use them.

## Sources

- [AWS Support plans](https://docs.aws.amazon.com/awssupport/latest/user/aws-support-plans.html)
- [Developer, Business, and Enterprise On-Ramp end of support](https://docs.aws.amazon.com/awssupport/latest/user/support-plans-eos.html)
- [Compare AWS Support plans](https://aws.amazon.com/premiumsupport/plans/)
