---
id: global-infrastructure-regions
title: AWS Regions and how to choose one
required: true
videoQuery: AWS Regions explained how to choose a Region
---
## What a Region is

An **AWS Region** is a geographic area of the world where AWS clusters its data centers. AWS runs dozens of Regions on several continents, and adds new ones over time (check the AWS Global Infrastructure page for the current list).

What makes a Region important for the exam:

- Each Region is made of **multiple, isolated, physically separate Availability Zones**. AWS builds public Regions with **at least three** Availability Zones.
- Regions are **isolated and independent** from each other, so a failure in one Region does not affect normal operations in another.
- **Your data stays in the Region you choose.** Resources you create in one Region do not appear in another Region unless you explicitly copy or replicate them.
- Most services are **regional** (you pick a Region when you create the resource). A few, such as AWS Identity and Access Management (IAM), Amazon Route 53 and Amazon CloudFront, are **global**.

## How to choose a Region

AWS suggests four factors. A handy order of thinking is: rules first, then users, then cost and features.

| Factor | Question to ask | Example |
| --- | --- | --- |
| Compliance and data residency | Does a law or contract require the data to stay in a country? | A bank must keep customer data inside its home country |
| Latency (proximity) | Where are most of the users? | A game for players in Japan runs in an Asia Pacific Region close to them |
| Cost | Is the same service cheaper in another Region? | Prices for the same resource differ between Regions |
| Service and feature availability | Does the Region offer every service the workload needs? | A brand-new service may launch in only some Regions first |

Compliance usually wins: if the law says "keep data in this country", you cannot pick a cheaper Region abroad.

## Why use more than one Region

- **Disaster recovery and business continuity**: keep a copy of the workload in another Region in case a whole Region is impaired.
- **Lower latency for users** in different parts of the world.
- **Data sovereignty**: run separate copies in each country whose rules require local storage.

## Key points

- A Region = a geographic area with multiple isolated Availability Zones (at least three in public Regions).
- Regions are isolated from each other; data does not leave a Region unless you move it.
- Choose a Region by compliance, latency, cost and service availability.
- Multiple Regions help with disaster recovery, global latency and data sovereignty.

## Sources

- [Regions, AWS Fault Isolation Boundaries](https://docs.aws.amazon.com/whitepapers/latest/aws-fault-isolation-boundaries/regions.html)
- [What to consider when selecting a Region for your workloads (AWS Architecture Blog)](https://aws.amazon.com/blogs/architecture/what-to-consider-when-selecting-a-region-for-your-workloads/)
- [AWS Global Infrastructure: Regions and Availability Zones](https://aws.amazon.com/about-aws/global-infrastructure/regions_az/)
