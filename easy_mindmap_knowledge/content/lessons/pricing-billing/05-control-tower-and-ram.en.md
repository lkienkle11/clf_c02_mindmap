---
id: pricing-billing-control-tower-and-ram
title: "AWS Control Tower, AWS RAM and Billing Conductor: governing and sharing across accounts"
required: true
videoQuery: AWS Control Tower landing zone guardrails account factory and AWS Resource Access Manager explained
---
## From many accounts to a governed setup

Once a company runs many accounts, three needs appear: set them up in a consistent, secure way; share some resources without copying them into every account; and present costs to teams in a way that matches the business. This lesson covers one service for each.

## AWS Control Tower

**AWS Control Tower** is the easiest way to **set up and govern a secure, multi-account AWS environment** based on best practices. It orchestrates other services, including **AWS Organizations**, **AWS Service Catalog** and **AWS IAM Identity Center**, to build a **landing zone**. It adds no charge of its own; you pay for the underlying services it configures, such as AWS CloudTrail and AWS Config.

Its main parts:

- **Landing zone**: a well-architected multi-account environment, holding your OUs, accounts and users, built to security and compliance best practices.
- **Controls** (formerly called **guardrails**): plain-language rules that provide ongoing governance. They apply to an entire OU, so every account in it is covered. Three kinds exist:

| Type | What it does | Built with |
| --- | --- | --- |
| **Preventive** | Stops an action from happening | Service control policies (and resource control policies) |
| **Detective** | Detects and reports non-compliance | AWS Config rules |
| **Proactive** | Blocks non-compliant resources before they are provisioned | AWS CloudFormation hooks |

Controls are also graded **mandatory** (always on), **strongly recommended** or **elective**.

- **Account Factory**: a configurable template that standardizes creating new accounts with pre-approved settings, so teams can get an account quickly.
- **Dashboard**: one view of provisioned accounts, enabled controls and non-compliant resources.

### How it differs from lookalikes

- **Organizations** provides the account structure, SCPs and consolidated billing. **Control Tower** sits on top and automates a recommended setup with ready-made controls. Organizations alone is the right answer for "create accounts, group them, apply policies" or "consolidate the bill".
- **CloudFormation** deploys resources from a template; it does not set up a multi-account environment by itself.
- Typical exam wording: "set up a **new multi-account environment** following best practices", "landing zone", "guardrails across accounts". All point to Control Tower.

The management account of an organization is deliberately exempt from controls, so it can never lock itself out.

## AWS Resource Access Manager (AWS RAM)

**AWS RAM** lets you **share AWS resources you own with other accounts** instead of creating duplicates in each one. You create a resource once, put it in a **resource share**, and name the principals: specific accounts, an OU, or the whole organization (some resource types can also be shared with individual IAM roles and users).

- Shareable resources include **VPC subnets**, **Transit Gateways**, **Route 53 Resolver rules** and **License Manager license configurations**. A common pattern is a central network account that shares subnets with application accounts.
- The **owner keeps ownership**. The other accounts use the resource as if it were their own, under permissions attached to the share.
- Benefits: less operational overhead, one set of permissions to manage, and visibility through Amazon CloudWatch and AWS CloudTrail.
- There is **no additional charge** for RAM. You pay normal prices for the shared resources.
- You create a resource share in one Region, and the Regional resources in it must be in that same Region.

Do not confuse RAM with IAM Identity Center, which signs people in to accounts, or with Organizations, which groups the accounts that RAM then shares between.

## AWS Billing Conductor

**AWS Billing Conductor** is for **showback and chargeback**. You group accounts into **billing groups**, and apply pricing rules, margins and custom charges or credits to produce a second, **pro forma** version of the cost data. It is used by AWS Channel Partners and by companies that bill internal departments at their own rates.

It does **not change your real AWS invoice** and it is not an optimization tool: it does not recommend savings. Questions about reducing EC2 cost point to Compute Optimizer or Cost Explorer, not Billing Conductor.

## Key points

- Control Tower: automated landing zone for a multi-account setup, with controls (preventive, detective, proactive) and Account Factory; built on Organizations, Service Catalog and IAM Identity Center; no extra charge.
- Organizations is the foundation; Control Tower is the guided, governed layer.
- RAM shares subnets, Transit Gateways and similar resources across accounts without duplicating them, at no extra charge.
- Billing Conductor creates custom pro forma billing groups for chargeback; the real bill is unchanged.

## Sources

- [What is AWS Control Tower?](https://docs.aws.amazon.com/controltower/latest/userguide/what-is-control-tower.html)
- [What is AWS Resource Access Manager?](https://docs.aws.amazon.com/ram/latest/userguide/what-is.html)
- [What is AWS Billing Conductor?](https://docs.aws.amazon.com/billingconductor/latest/userguide/what-is-billingconductor.html)
