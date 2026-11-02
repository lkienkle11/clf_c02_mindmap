---
id: pricing-billing-fundamentals
title: "How AWS pricing works: pay as you go, commit to save, and data transfer"
required: true
videoQuery: How AWS pricing works pay as you go data transfer costs explained
---
## Three pricing principles

AWS describes its pricing with a few simple ideas:

- **Pay as you go**: pay only for the services you use, for as long as you use them, with no long-term contract and no upfront hardware purchase. Stop a resource and its compute charge stops.
- **Save when you commit**: agree to a steady amount of usage for one or three years (Savings Plans, Reserved Instances) and pay a lower rate than On-Demand.
- **Pay less by using more**: many services use **tiered pricing**. For example, Amazon S3 storage and data transfer out get cheaper per GB as your monthly volume grows.

## What drives the bill

Most costs come from three things: **compute** (billed per second or per hour while it runs), **storage** (usually per GB per month) and **outbound data transfer**. Requests, API calls and extra features add smaller charges for some services.

## Data transfer rules

| Direction | Typical charge |
| --- | --- |
| Into AWS from the internet | Free |
| Out of AWS to the internet | Charged per GB, cheaper per GB at higher volume |
| Between AWS Regions | Generally charged |
| Between services in the same Region | Often free, but check the service (for example, traffic across Availability Zones can be charged) |

So designs that keep data and the compute that uses it in the **same Region** usually cost less, and a CDN such as Amazon CloudFront can reduce data sent from your origin.

## Buying compute: a quick recap

The purchasing options (On-Demand, Savings Plans, Reserved Instances, Spot and Dedicated Hosts) were covered in the compute topic. The pricing idea to remember here: **the more commitment or flexibility you give AWS, the bigger the discount**. Spot gives the deepest discount in exchange for possible interruption; a 3-year commitment saves more than a 1-year one.

## Other things you pay for

- **Paid AWS Support plans** add their own charge on top of service usage; support is covered in the support topic.
- Many management services, such as IAM, AWS Organizations consolidated billing and AWS CloudFormation (for AWS resources), have no additional charge; you pay for the resources they create or manage.

## Common traps

- "Upload 10 TB of data into Amazon S3": the **transfer in** is free; the **storage** is not.
- Replicating data to another Region adds **inter-Region transfer** charges.
- Pay-as-you-go does not mean "free when idle" for everything: stored data and allocated resources such as EBS volumes keep costing money.

## Key points

- Pay as you go, save when you commit, pay less by using more.
- Main cost drivers: compute, storage, data transfer out.
- Data in is free; data out and between Regions is charged.
- Commitment and flexibility buy discounts.

## Sources

- [AWS Pricing](https://aws.amazon.com/pricing/)
- [COST08-BP02 Select components to optimize data transfer cost](https://docs.aws.amazon.com/wellarchitected/latest/cost-optimization-pillar/cost_data_transfer_optimized_components.html)
- [Amazon EC2 billing and purchasing options](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/instance-purchasing-options.html)
