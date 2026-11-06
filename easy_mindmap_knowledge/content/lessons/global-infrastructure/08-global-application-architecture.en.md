---
id: global-infrastructure-global-application-architecture
title: Putting it together for a global application
required: false
videoQuery: AWS multi-AZ vs multi-Region architecture global application Route 53 CloudFront
---
## Two different goals

Questions about global applications mix two goals that need different tools.

- **High availability** (survive the loss of a data center): use **several Availability Zones in one Region**. Place EC2 instances in subnets in different zones behind a load balancer. Managed Multi-AZ options for databases follow the same idea.
- **Disaster recovery and global reach** (survive the loss of a Region, or serve distant users): use **several Regions**. Keep a copy of the application and its data in a second Region.

A single Availability Zone is a single point of failure. A single Region is a good place to start for most workloads, but it is not the answer when a question says "an entire Region becomes unavailable".

## The roles of the edge services

| Service | Role in a global design |
| --- | --- |
| **Amazon Route 53** | DNS: sends users to the right endpoint, for example by latency or health |
| **Amazon CloudFront** | Caches content near users and reduces load on the origin |
| **AWS Global Accelerator** | Static IPs and the AWS network path for TCP/UDP or fixed-IP needs |
| **Elastic Load Balancing** | Spreads traffic across instances in several zones of one Region |

They are often combined: CloudFront for static and cacheable content, a load balancer in each Region for the application, and Route 53 or Global Accelerator to direct users to a healthy Region.

## Data across Regions

Compute is easy to copy, data is the hard part. At this exam's depth, remember that services offer ways to copy data to another Region, such as Amazon S3 replication or global database options. You decide whether this is allowed by your data-residency rules, because data does not leave a Region on its own. The storage and databases topics cover the details.

## Exam-style thinking

1. Is the requirement about a zone failing, a Region failing, or distant users? That decides multi-AZ or multi-Region.
2. Is there a legal limit on where data may live? That limits which Regions you may use.
3. Is it cacheable content (CloudFront) or a non-HTTP or fixed-IP need (Global Accelerator)?

## Key points

- Multi-AZ gives high availability; multi-Region gives disaster recovery and lower latency for distant users.
- Route 53, CloudFront and Global Accelerator each play a different role; combine them rather than choosing one.
- Replicating data to another Region is your decision and must respect residency rules.

## Sources

- [AWS Global Infrastructure: Regions and Availability Zones](https://aws.amazon.com/about-aws/global-infrastructure/regions_az/)
- [Regions, AWS Fault Isolation Boundaries](https://docs.aws.amazon.com/whitepapers/latest/aws-fault-isolation-boundaries/regions.html)
