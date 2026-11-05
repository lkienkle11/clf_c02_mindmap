---
id: pricing-billing-savings-plans-and-reserved
title: "Savings Plans, Reserved Instances and data transfer: choosing a pricing model"
required: true
videoQuery: Savings Plans vs Reserved Instances vs Spot vs On-Demand explained AWS data transfer costs
---
## Why pricing models matter

The earlier lessons gave the principle: commit to save, or stay flexible and pay more. This lesson goes deeper into **how each model trades commitment for discount**, which is what pricing questions test. The discounts below are the "up to" figures AWS publishes against On-Demand prices; the real percentage depends on instance type, Region, term and payment option.

## Models compared

| Model | You commit to | Discount | Flexibility |
| --- | --- | --- | --- |
| **On-Demand** | Nothing | None (baseline) | Total: start and stop any time |
| **Compute Savings Plans** | A dollar amount per hour, 1 or 3 years | Up to 66% | Any instance family, size, Region, OS or tenancy; also covers **AWS Fargate** and **AWS Lambda** |
| **EC2 Instance Savings Plans** | A dollar amount per hour, 1 or 3 years, for one instance family in one Region | Up to 72% | Any size, OS or tenancy inside that family and Region |
| **Standard Reserved Instances** | A specific instance configuration, 1 or 3 years | Up to 72% | Lowest; can be sold on the Reserved Instance Marketplace |
| **Convertible Reserved Instances** | A configuration, 1 or 3 years | Up to 66% | Can be exchanged for other Convertible RIs of equal or greater value |
| **Spot Instances** | Nothing | Up to 90% | AWS can take the capacity back |
| **Dedicated Hosts** | A whole physical server | Billed On-Demand, through Dedicated Host Reservations, or covered by Savings Plans | Chosen for licensing and compliance, not for price |

## Savings Plans

A **Savings Plan** commits you to a steady amount of compute spend measured in **dollars per hour**. Usage up to the commitment gets the lower price; usage above it is billed at On-Demand rates. You can pay **All Upfront, Partial Upfront or No Upfront**, and the plan **cannot be cancelled** during its term. The one exception is a purchase mistake: a plan with a commitment of $100 per hour or less can be **returned within 7 days of purchase and in the same calendar month**. A Savings Plan gives no capacity reservation, and it does not apply to Spot usage. AWS also sells SageMaker AI Savings Plans and, more recently, Database Savings Plans for several managed database services; the exam focus is Compute and EC2 Instance plans.

## Reserved Instances

A **Reserved Instance (RI)** is a billing discount for a matching instance configuration, not a physical instance. Terms are 1 or 3 years, and the **3-year term saves more**. The more you pay up front, the larger the discount: **All Upfront > Partial Upfront > No Upfront**. With Partial or No Upfront the rest is paid monthly. A Regional RI covers any Availability Zone in the Region; a zonal RI also reserves capacity in one zone.

If a **Standard** RI no longer fits (say you moved to a different instance family), you can list it on the **Amazon EC2 Reserved Instance Marketplace**, an EC2 feature, not the AWS Marketplace software catalog. Only Standard RIs can be sold there; Convertible RIs cannot.

## Picking a model: exam clues

- Short, unpredictable, seasonal (a couple of months a year) or "a few hours a week", and must not be interrupted: **On-Demand**.
- Steady for 1 to 3 years, uninterruptible, known configuration: **Reserved Instances or Savings Plans**, with Standard RIs or EC2 Instance Savings Plans for the deepest discount and **All Upfront** for the most saving.
- A **dollars-per-hour** commitment, or usage that spans EC2, Fargate and Lambda: **Compute Savings Plans**. AWS documents them as the more flexible choice, because they apply automatically without exchanges. Exam trap: when an item talks about **reserving** instances, paying **up front** and possibly **exchanging** later, and lists both Convertible RIs and Compute Savings Plans, the expected answer has been **Convertible Reserved Instances**. Choose Compute Savings Plans when the clue is the hourly spend commitment or Lambda/Fargate usage without reservation wording.
- Interruptible, fault-tolerant batch work: **Spot**. Server-bound software licenses: **Dedicated Hosts**.
- Several accounts: the discounts are shared across the organization (next lessons).

## Data transfer rules

Data transfer is a pricing topic of its own:

- **Into AWS from the internet: free**, for all services in all Regions.
- **Out to the internet: charged** per GB, with a small monthly free allowance and cheaper tiers at higher volume.
- **Between Regions: charged.**
- **Between Availability Zones in a Region: charged.** Within the **same** Availability Zone, traffic is free.
- Data from an S3 bucket to other AWS services in the **same Region**, and from S3 to CloudFront, is free.
- Traffic through a **NAT gateway** adds a per-GB processing charge; VPC gateway endpoints for S3 and DynamoDB add no data transfer charge in the same Region.

So if an item asks which 2 TB transfer costs nothing, the answer is **inbound from the internet**; outbound, inter-Region and cross-AZ transfers all cost money.

## Key points

- More commitment or less flexibility means a bigger discount: On-Demand < Compute Savings Plans < EC2 Instance Savings Plans and Standard RIs; Spot is cheapest but interruptible.
- Savings Plans commit dollars per hour; Reserved Instances commit a configuration.
- 3 years beats 1 year; All Upfront beats Partial beats No Upfront.
- Standard RIs can be sold on the Reserved Instance Marketplace; Convertible RIs can be exchanged.
- Data in is free; data out, between Regions and between AZs is charged.

## Sources

- [Compute Savings Plans and Reserved Instances](https://docs.aws.amazon.com/savingsplans/latest/userguide/sp-ris.html)
- [Amazon EC2 Reserved Instances pricing](https://aws.amazon.com/ec2/pricing/reserved-instances/)
- [Overview of data transfer costs for common architectures](https://aws.amazon.com/blogs/architecture/overview-of-data-transfer-costs-for-common-architectures/)
