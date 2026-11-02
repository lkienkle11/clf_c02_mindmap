---
id: global-infrastructure-availability-zones
title: Availability Zones and high availability
required: true
videoQuery: AWS Availability Zones high availability multi-AZ explained
---
## What an Availability Zone is

An **Availability Zone (AZ)** is **one or more discrete data centers** inside a Region, each with redundant power, networking and connectivity. Think of a Region as a city area and its AZs as separate buildings spread across it.

How AWS keeps AZs independent:

- **Physically apart**: AZs in a Region are a meaningful distance from each other (many kilometers), yet within about 100 km (60 miles), to avoid shared disasters such as fire, flood or a power-grid problem.
- **No shared single points of failure**: power, cooling and generators are not shared between AZs.
- **Close enough to work together**: AZs are linked by high-bandwidth, low-latency, redundant private fiber, fast enough for synchronous replication between them.

## Why multiple AZs matter

If an application runs in only one data center, a single power cut can take it down. When it runs in **two or more AZs**, a problem in one AZ leaves the copies in the others running.

| Design | What happens if one AZ fails |
| --- | --- |
| Single AZ | The application may go down |
| Multi-AZ (same Region) | Traffic continues in the healthy AZs |
| Multi-Region | Survives even a Region-wide problem, at higher cost and complexity |

## Words the exam uses

- **High availability**: the system stays up and usable most of the time, usually by running copies in several AZs behind a load balancer.
- **Fault tolerance**: the system keeps working **even while** a component has failed, with no noticeable interruption to users.
- **Disaster recovery**: getting a workload back after a large event, often by using another Region.

A common scenario: "A company wants its application to stay available if a data center fails. What should it do?" Answer: **deploy across multiple Availability Zones**. Running more instances in the same AZ does not protect against that AZ failing.

## Relationships to remember

- A Region contains multiple AZs; an AZ contains one or more data centers.
- An AZ belongs to exactly one Region.
- Edge locations are separate from AZs and sit closer to end users (next lesson).

## Key points

- AZ = one or more discrete data centers with redundant power, networking and connectivity.
- AZs in a Region are physically separated but connected with low-latency links.
- Multi-AZ deployment is the standard way to get high availability on AWS.
- AZs do not share single points of failure.

## Sources

- [Availability Zones, AWS Fault Isolation Boundaries](https://docs.aws.amazon.com/whitepapers/latest/aws-fault-isolation-boundaries/availability-zones.html)
- [Global infrastructure, Overview of Amazon Web Services](https://docs.aws.amazon.com/whitepapers/latest/aws-overview/global-infrastructure.html)
- [AWS Global Infrastructure: Regions and Availability Zones](https://aws.amazon.com/about-aws/global-infrastructure/regions_az/)
