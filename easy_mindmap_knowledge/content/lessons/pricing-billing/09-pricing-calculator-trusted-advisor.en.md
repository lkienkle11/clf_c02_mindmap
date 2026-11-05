---
id: pricing-billing-pricing-calculator-trusted-advisor
title: "Pricing Calculator, Trusted Advisor and Compute Optimizer: estimate, check and right-size"
required: true
videoQuery: AWS Trusted Advisor vs Compute Optimizer vs Cost Explorer vs Pricing Calculator explained
---
## Three tools, three moments

The estimating lesson placed the **AWS Pricing Calculator** before a build and **AWS Compute Optimizer** after it. This lesson adds the details that decide close exam questions, and introduces **AWS Trusted Advisor**, the account-wide health check.

## AWS Pricing Calculator

**AWS Pricing Calculator** is a free, web-based planning tool. It estimates; it never reports what you actually spent.

- It answers "what would this cost?" for a design you have not built, or for a change such as adding instances. It shows upfront, monthly and annual figures.
- Prices come from the AWS Price List. The estimate excludes taxes, and if marketing pages and the calculator ever differ, AWS uses the marketing-page prices.
- Exam contrast: it can **project future monthly costs**. It cannot show **historical** costs or your **monthly bill**; those are Cost Explorer and the Bills page.
- The Billing and Cost Management console also contains an in-console calculator, which can reflect your own discounts and purchase commitments. For migration TCO, AWS pairs it with Migration Evaluator (previous lesson).

## AWS Trusted Advisor

**AWS Trusted Advisor** inspects your AWS environment and recommends actions against AWS best practices. Its checks fall into six categories:

| Category | Example of what it looks for |
| --- | --- |
| **Cost optimization** | Idle or low-utilization resources, unused resources you can remove |
| **Performance** | Settings that could improve speed and responsiveness |
| **Security** | Risky settings, such as overly open access |
| **Fault tolerance** | Redundancy gaps and overused resources |
| **Service limits** (quotas) | Usage approaching or exceeding a quota |
| **Operational excellence** | Help operating the environment effectively and at scale |

Older material lists **five** categories (cost optimization, performance, security, fault tolerance, service limits); operational excellence is the newer sixth. Both versions describe the same service.

How to read results: each check shows **action recommended** (red), **investigation recommended** (yellow) or **no problems detected** (green). If you use AWS Organizations, the **organizational view** reports across member accounts.

Access depends on your AWS Support plan. With the free **Basic** plan you can open Trusted Advisor and see all **service limits** checks plus a selected set of **security** and **fault tolerance** checks. The **full** set of checks, with automatic weekly refresh, comes with the higher paid support plans. The plans themselves are described in the support topic.

Trusted Advisor gives **broad advice across the account**, not a deep analysis of one resource type. Do not confuse it with:

- **AWS Well-Architected Tool**: you answer questions about a workload against the pillars; Trusted Advisor inspects the live account.
- **Amazon Inspector** or **Security Hub**: dedicated security services; Trusted Advisor's security category is a lighter check of common settings.
- **Cost Explorer**: shows spend history; Trusted Advisor flags waste.

Typical exam wording: "recommendations in categories such as cost, performance, service limits, fault tolerance and security" means Trusted Advisor.

## AWS Compute Optimizer

**AWS Compute Optimizer** analyzes the configuration and **Amazon CloudWatch utilization metrics** of your resources, using machine learning, to give **rightsizing recommendations** and to identify **idle resources**. It reports whether a resource is optimal and shows utilization graphs and projected utilization for each alternative so you can weigh price against performance.

- **Resources covered** include Amazon **EC2 instances**, **EC2 Auto Scaling groups**, **EBS volumes**, **AWS Lambda functions** and **Amazon ECS services on AWS Fargate**, plus several database and other resource types.
- You must **opt in** first. By default it looks at the last **14 days** of metrics; an optional paid feature, enhanced infrastructure metrics, extends the lookback to 93 days.
- Compute Optimizer itself has **no additional charge**.
- With the management account opted in, you see recommendations across the organization.
- It recommends; you decide and act. It does not purchase plans or resize resources for you.

Right-sizing as a design idea, matching resources to real demand, is explained in the right-sizing lesson of the cloud concepts topic. Compute Optimizer is the AWS tool that supplies the evidence.

### Compute Optimizer, Cost Explorer or Trusted Advisor?

All three can point to waste, so read the clue:

| Clue | Tool |
| --- | --- |
| Estimate a planned workload | Pricing Calculator |
| Right-size EC2, Auto Scaling, EBS or Lambda from utilization metrics | Compute Optimizer |
| Rightsizing recommendations inside the cost console, or spend history | Cost Explorer |
| Best-practice check across cost, security, fault tolerance, performance and limits | Trusted Advisor |

If both Compute Optimizer and Cost Explorer appear as answers for "identify rightsizing opportunities for EC2", both are valid.

## Key points

- Pricing Calculator: free forward-looking estimates; no history or bills.
- Trusted Advisor: best-practice checks in six categories; Basic Support includes service limit checks and selected security and fault tolerance checks.
- Compute Optimizer: opt-in, no extra charge, utilization-based rightsizing for EC2, Auto Scaling, EBS, Lambda and more.
- Cost Explorer also offers EC2 rightsizing recommendations.

## Sources

- [What is AWS Pricing Calculator?](https://docs.aws.amazon.com/pricing-calculator/latest/userguide/what-is-pricing-calculator.html)
- [AWS Trusted Advisor](https://docs.aws.amazon.com/awssupport/latest/user/trusted-advisor.html)
- [What is AWS Compute Optimizer?](https://docs.aws.amazon.com/compute-optimizer/latest/ug/what-is-compute-optimizer.html)
