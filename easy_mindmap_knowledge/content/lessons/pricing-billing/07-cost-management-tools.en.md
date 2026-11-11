---
id: pricing-billing-cost-management-tools
title: "Cost management tools in depth: which tool answers which question"
required: true
videoQuery: AWS Cost Explorer vs Budgets vs Cost and Usage Report vs Cost Anomaly Detection billing alarm explained
---
## One console, several tools

The **AWS Billing and Cost Management** console is the home of your bills, payments, credits and Free Tier usage, and the entry point to the cost tools below. The previous cost tracking lesson introduced them; this lesson adds what each can really do, so you can match a question to the right tool.

## AWS Cost Explorer

**AWS Cost Explorer** is a visual tool for analyzing what you have spent. Key facts:

- Shows up to the last **13 months** of cost and usage, grouped or filtered by service, account, Region, tag and more, plus a **forecast** of future spend.
- Has preconfigured views and custom reports; the console is **free**, while programmatic API requests are charged per request.
- Gives **recommendations**: purchase suggestions for **Savings Plans** and Reserved Instances, and **EC2 rightsizing recommendations** that point at idle or underused instances to downsize or terminate. This is why "which tools identify rightsizing opportunities for EC2" can include Cost Explorer as well as Compute Optimizer.
- AWS also offers **Cost Optimization Hub**, which pulls recommendations into one place and recommends it as the place to look for savings.

Cost Explorer **looks at history and trends**; it does not send threshold alerts.

## AWS Budgets

**AWS Budgets** lets you plan spend and **alert** when you cross a threshold. Budget types are **cost**, **usage**, **Reserved Instance utilization and coverage**, and **Savings Plans utilization and coverage**. You can alert on **actual** or **forecasted** amounts, notify by email or an Amazon SNS topic, and optionally attach a **budget action**, such as applying a restrictive IAM policy. **Budget reports** email you a regular summary of how you are doing against your budgets.

Budgets data refreshes up to three times a day, so there can be a delay between spend and an alert.

## Cost allocation tags and cost categories

Tags are key-value labels on resources. For cost reporting they come in two kinds:

- **AWS-generated tags** (with the `aws:` prefix, such as the creator of a resource), defined and applied by AWS.
- **User-defined tags** (prefix `user:`), which you create.

Both must be **activated as cost allocation tags** in the Billing console before they appear in Cost Explorer and cost reports. It can take up to 24 hours for tags to show, and in an organization the management account manages them. **Cost categories** go a step further by mapping costs to teams, applications or environments.

## Cost and Usage Report and Data Exports

The **AWS Cost and Usage Report (CUR)** holds the **most comprehensive** cost and usage data, with line items by the hour, day or month, delivered to an **Amazon S3 bucket** and refreshed at least daily. You query it with **Amazon Athena**, load it into **Amazon Redshift**, or visualize it in Amazon QuickSight (AWS now presents QuickSight as part of Amazon Quick). You create it in **AWS Data Exports**, which offers CUR 2.0 and legacy CUR exports among other tables. Pick CUR when the clue is "raw, detailed data in S3 for our own analysis or dashboards".

## AWS Cost Anomaly Detection

**Cost Anomaly Detection** uses **machine learning** to learn your normal spend pattern, including seasonality, and alerts you by email or Amazon SNS when spend looks abnormal. It shows **root causes** by service, account, Region and usage type. Unlike a budget, you do not define a spending limit, but each alert subscription still has a threshold that you set. It monitors AWS spend but not most third-party AWS Marketplace products.

## Billing alarms in Amazon CloudWatch

You can also create a **CloudWatch alarm on the EstimatedCharges metric**. You must first turn on **Receive CloudWatch Billing Alerts** in billing preferences, and the billing metric lives in **US East (N. Virginia)**. A billing alarm reacts to charges that **already exceed** the threshold; it does not use a forecast. A "notify me when cost reaches a threshold" item can therefore accept **AWS Budgets** or **Amazon CloudWatch**.

## Which tool answers which question?

| Question | Tool |
| --- | --- |
| What did we spend last quarter, and on what? | Cost Explorer |
| Alert me when spend or usage reaches or is forecast to reach a limit | AWS Budgets |
| Email me a scheduled budget status report | AWS Budgets reports |
| Give me every line item in S3 for Athena or dashboards | Cost and Usage Report (Data Exports) |
| Tell me when spend is unusual, without defining a budget | Cost Anomaly Detection |
| Split cost by project or department | Cost allocation tags |
| Alarm on estimated charges with a metric | CloudWatch billing alarm |

## Key points

- Cost Explorer analyzes history, forecasts, and gives purchase and rightsizing recommendations; Budgets alerts and reports; CUR gives the deepest data in S3.
- Cost Anomaly Detection learns normal spend itself (no budget needed), though its alert subscriptions take a threshold; billing alarms and Budgets need a threshold too.
- Tags must be activated as cost allocation tags; AWS-generated and user-defined both count.

## Sources

- [Analyzing your costs and usage with AWS Cost Explorer](https://docs.aws.amazon.com/cost-management/latest/userguide/ce-what-is.html)
- [Managing your costs with AWS Budgets](https://docs.aws.amazon.com/cost-management/latest/userguide/budgets-managing-costs.html)
- [What are AWS Cost and Usage Reports?](https://docs.aws.amazon.com/cur/latest/userguide/what-is-cur.html)
