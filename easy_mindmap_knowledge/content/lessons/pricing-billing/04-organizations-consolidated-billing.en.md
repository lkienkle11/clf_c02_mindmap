---
id: pricing-billing-organizations-consolidated-billing
title: "AWS Organizations: multiple accounts, OUs, SCPs and consolidated billing"
required: true
videoQuery: AWS Organizations explained management account member accounts OU SCP consolidated billing
---
## What AWS Organizations does

**AWS Organizations** lets you centrally manage many AWS accounts as one environment. You can **create accounts**, **group them** into organizational units, **apply policies** to groups, and **pay for everything with one payment method**. It has no additional charge: you pay only for the resources in the accounts.

Key terms:

- **Organization**: the whole structure, with a **root** at the top.
- **Management account**: the account that created the organization. It pays the charges of every other account.
- **Member accounts**: all the other accounts in the organization.
- **Organizational unit (OU)**: a group of accounts, for example Production, Development or one per business unit. OUs can be nested.

The classic exam clue: "one bill for many accounts" means **Organizations consolidated billing**, not Cost Explorer or Budgets, which only analyze or alert on costs.

## Service control policies (overview)

A **service control policy (SCP)** sets the **maximum permissions** that IAM users and roles in member accounts can ever have, including the root user of a member account. Key facts:

- An SCP **never grants** permissions; it only limits. People still need IAM policies that allow the action.
- SCPs **do not affect the management account**.
- SCPs need the organization to have **all features** enabled. An organization that uses only the consolidated billing feature set cannot use them.

SCPs are a guardrail on *what* can be done; they say nothing about *what you pay*.

## Consolidated billing

Consolidated billing is the billing half of Organizations:

- **One bill** for all accounts, paid by the management account. Member accounts can still see their own usage and charges.
- **Combined usage for volume discounts**: AWS treats the accounts as one for tiered pricing such as data transfer out and Amazon S3, so you reach cheaper tiers sooner and then allocates each account its share.
- **Shared commitment discounts**: Reserved Instance and Savings Plans discounts bought in one account can apply to matching usage in other accounts. The management account can switch this sharing off per account, and AWS notes that doing so can raise the bill.
- **Free Tier counted once**: for services with a free tier, AWS applies it to the combined usage of the organization, not to each account separately, so extra accounts do not multiply free allowances.
- **Credits can be shared**: AWS promotional credits are shared across the organization by default, and the management account can turn credit sharing off.
- **No extra fee.**

Your bill does **not** mirror the OU structure. To see costs by team or project inside the bill, use **cost allocation tags** (see the cost management tools lesson).

## Why use more than one account

An AWS account is a natural boundary for permissions, security, cost and workloads. Common reasons for several accounts:

- **Separate environments**: production, test and development get different controls.
- **Limit the blast radius**: a mistake or compromise in one account stays contained.
- **Protect sensitive data** in a dedicated account with fewer people allowed in.
- **Cost reporting and chargeback**: an account is the default unit for allocating cost, so one account per department or workload makes it easy to see who spent what.
- **Spread quotas**: service quotas and API rate limits apply per account.

An exam item about charging departments back for their share usually points to **multiple accounts plus consolidated billing**.

## Common traps

- **Organizations vs IAM Identity Center**: Organizations manages accounts, policies and billing; signing users in to many accounts with one login is IAM Identity Center (security topic).
- **Organizations vs Control Tower**: Organizations gives the building blocks; Control Tower adds an opinionated, automated setup (next lesson).
- **Organizations vs CloudFormation**: Organizations groups and governs accounts; CloudFormation deploys resources (StackSets can deploy a template to many accounts).
- Consolidated billing **combines** usage; it does not make data transfer between your accounts free.

## Key points

- Organizations = create, group and govern accounts with one payer; no additional charge.
- Management account pays; member accounts are billed through it.
- Consolidated billing gives one bill, combined volume discounts and shared Reserved Instance and Savings Plans discounts.
- SCPs set maximum permissions for member accounts, never grant access, and skip the management account.
- Free Tier applies to the organization as a whole.

## Sources

- [What is AWS Organizations?](https://docs.aws.amazon.com/organizations/latest/userguide/orgs_introduction.html)
- [Consolidating billing for AWS Organizations](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/consolidated-billing.html)
- [Service control policies (SCPs)](https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_policies_scps.html)
