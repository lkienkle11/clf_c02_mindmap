---
id: global-infrastructure-global-vs-regional-services
title: Global, Regional and Availability Zone scoped services
required: true
videoQuery: AWS global vs regional vs availability zone services explained
---
## Why scope matters

Every AWS resource lives at a certain **scope**: the whole account (global), one Region, or one Availability Zone. Exam questions use scope to test whether you understand what happens when something fails, where you must create a resource, and what you must do to make an application highly available.

A useful rule of thumb: the smaller the scope, the more you must plan yourself. An Availability Zone scoped resource disappears with its zone unless you build a copy elsewhere.

## The three scopes

| Scope | Meaning | Examples |
| --- | --- | --- |
| Global | Not tied to one Region; you manage it without choosing a Region | **AWS Identity and Access Management (IAM)**, **Amazon Route 53**, **Amazon CloudFront**, **AWS WAF** for CloudFront, **AWS Global Accelerator** |
| Regional | You choose a Region; the resource is usually spread across the zones of that Region (S3 One Zone classes deliberately use one zone) | **Amazon VPC**, **Amazon S3** (data of a bucket), Elastic Load Balancing, Amazon DynamoDB, AWS Lambda |
| Availability Zone | The resource sits in one zone | **Amazon EC2** instances, **Amazon EBS** volumes, **subnets**, single-AZ database instances |

A few details that cause mistakes:

- **IAM** users, roles and policies work across all Regions of your account, so you do not create a user per Region. (Behind the scenes AWS keeps a single control plane for this, but you treat IAM as global.)
- **Route 53** is a global DNS service; hosted zones are not placed in a Region.
- **CloudFront** distributions are global and serve content from edge locations. **AWS WAF** can protect a CloudFront distribution (the global, edge side) and also Regional resources such as an Application Load Balancer or an API Gateway REST API, so check which resource a question protects.
- **Amazon S3** bucket names must be unique across AWS, but a bucket and its objects are stored in the one Region you choose. "Unique name globally" does not mean "data stored globally".
- A **VPC** belongs to one Region and spans all of its Availability Zones, while each **subnet** must sit in exactly one Availability Zone. This is why high availability means creating subnets in several zones.
- An **EBS volume** can be attached only to an EC2 instance in the same Availability Zone. To move data to another zone, create a snapshot and restore from it.

## Where it appears in the exam

1. **High availability**: "The application runs in one Availability Zone. How can it stay available if that zone fails?" The answer is to run EC2 instances in several zones behind a load balancer, because instances are zonal.
2. **Disaster recovery**: Regional resources do not appear in another Region, so DR needs a copy there.
3. **Account setup**: "Which services do not require you to select a Region?" Think IAM, Route 53, CloudFront.
4. **Console confusion**: if resources look missing, the usual cause is that the console is showing a different Region. IAM users, by contrast, are visible everywhere.

## Common traps

- Do not assume that S3 is global because bucket names are unique worldwide; it is a Regional service.
- Do not assume a Regional service is protected against Region failure; Regional means spread over zones, not over Regions.
- Services that use edge locations (CloudFront, Route 53) are global, but edge locations are not Availability Zones.
- Some features are available in only some Regions, so always check the Regional Services List when a question mentions availability.

## Key points

- Three scopes: global, Regional, Availability Zone.
- IAM, Route 53, CloudFront and Global Accelerator are global; VPC and S3 are Regional; EC2, EBS and subnets are zonal.
- Regional means multi-AZ inside one Region, not multi-Region.
- Design highly available workloads by using more than one zone, and recoverable workloads by using more than one Region.

## Sources

- [Global services, AWS Fault Isolation Boundaries](https://docs.aws.amazon.com/whitepapers/latest/aws-fault-isolation-boundaries/global-services.html)
- [What is Amazon VPC?](https://docs.aws.amazon.com/vpc/latest/userguide/what-is-amazon-vpc.html)
- [What is AWS WAF? (protected resource types)](https://docs.aws.amazon.com/waf/latest/developerguide/waf-chapter.html)
