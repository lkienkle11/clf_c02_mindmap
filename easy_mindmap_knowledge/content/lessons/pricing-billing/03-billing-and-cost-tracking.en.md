---
id: pricing-billing-cost-tracking
title: "Consolidated billing and tracking costs: Budgets, Cost Explorer, CUR and tags"
required: true
videoQuery: AWS consolidated billing Budgets Cost Explorer Cost and Usage Report explained
---
## Consolidated billing with AWS Organizations

When you group accounts in **AWS Organizations**, the **management account** pays the charges of all **member accounts**. Consolidated billing gives you:

- **One bill** for many accounts, with costs still visible per account.
- **Combined usage**: usage from all accounts is added together, so the organization reaches **volume pricing tiers** sooner.
- **Shared discounts**: **Reserved Instance** and **Savings Plans** discounts bought in one account can apply to matching usage in other accounts. The management account can turn this sharing off.
- **No extra fee** for consolidated billing.

## The Billing and Cost Management console

This console is where you see **bills and invoices**, payments, credits and Free Tier usage, and where you reach the cost tools below. By default, IAM users and roles cannot open billing pages until IAM access to billing is activated.

## Tools to track and control costs

| Tool | Use it to | Exam clue |
| --- | --- | --- |
| AWS Budgets | Set a cost, usage, RI or Savings Plans budget and **alert** (email or Amazon SNS) on actual or **forecasted** amounts | "Notify me before we overspend" |
| AWS Cost Explorer | **Visualize and analyze** costs and usage over time, filter and group by service, account or tag, and **forecast** spend | "Which service drove last quarter's increase?" |
| AWS Cost and Usage Report (CUR) | Deliver the **most detailed** cost and usage data, line by line, to an **S3 bucket** for analysis with tools such as Amazon Athena | "Hourly, line-item billing data for our own analytics" |
| AWS Cost Anomaly Detection | Use **machine learning** to spot **unusual spend** and alert you, with likely root causes | "Unexpected spike in spending" |

CUR is now created through **AWS Data Exports**, where **CUR 2.0** is the recommended format.

## Cost allocation tags

A **tag** is a key and value on a resource, such as `Project=web` or `CostCenter=123`. To see costs by tag, you must **activate** the tag as a **cost allocation tag** in the Billing console; then Cost Explorer and cost reports can group spending by project, team or environment. Both **user-defined** and **AWS-generated** tags must be activated.

## Common traps

- Budgets **alerts** on future or current spend; Cost Explorer **analyzes** past spend. A budget does not stop resources unless you configure a budget action.
- A tag that is applied but **not activated** does not appear in cost reports.
- Consolidated billing **combines usage**, so an organization can pay less than the same accounts billed separately.

## Key points

- Organizations consolidated billing: one bill, combined volume discounts, shared RIs and Savings Plans, no extra fee.
- Budgets = alerts; Cost Explorer = visual analysis and forecast; CUR = most detailed data in S3.
- Cost Anomaly Detection flags unusual spend with machine learning.
- Activate cost allocation tags to track costs by project or team.

## Sources

- [Consolidating billing for AWS Organizations](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/consolidated-billing.html)
- [Managing your costs with AWS Budgets](https://docs.aws.amazon.com/cost-management/latest/userguide/budgets-managing-costs.html)
- [Organizing and tracking costs using AWS cost allocation tags](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/cost-alloc-tags.html)
