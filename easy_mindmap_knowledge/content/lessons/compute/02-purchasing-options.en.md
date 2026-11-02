---
id: compute-purchasing-options
title: EC2 purchasing options: On-Demand, Savings Plans, Reserved, Spot and Dedicated
required: true
videoQuery: EC2 pricing models On-Demand Reserved Instances Savings Plans Spot explained
---
## Same server, different deals

The same EC2 instance can be bought in several ways. The right choice depends on three questions: **How long** will the workload run? **Can it be interrupted?** Are there **licensing or compliance** rules about the hardware?

## The options

- **On-Demand Instances**: pay for compute while the instance runs, with no commitment. Best for short-term, spiky or unpredictable workloads.
- **Savings Plans**: commit to a steady amount of compute spend (measured in dollars per hour) for **1 or 3 years** and get lower prices. **Compute Savings Plans** are the most flexible: they apply across instance families, sizes and Regions, and also to AWS Fargate and AWS Lambda. **EC2 Instance Savings Plans** give a deeper discount in exchange for committing to one instance family in one Region.
- **Reserved Instances (RIs)**: commit to a specific instance configuration, such as the instance type and Region, for **1 or 3 years**. Good for steady, predictable workloads that will not change shape.
- **Spot Instances**: use spare EC2 capacity at a steep discount. AWS can **reclaim** the instance when it needs the capacity back, giving a **two-minute warning**. Only for workloads that are flexible and can be interrupted, such as batch jobs and data analysis.
- **Dedicated Hosts**: a whole physical server for your use, with visibility of its sockets and cores. Use it to **bring your own** per-socket, per-core or per-VM software licenses, or for compliance needs.
- **Dedicated Instances**: instances that run on hardware dedicated to your account, without the host-level visibility and control of Dedicated Hosts.
- **On-Demand Capacity Reservations**: reserve capacity in a specific Availability Zone for any duration so it is there when you need it. They guarantee capacity but give no discount by themselves.

## Quick decision table

| Scenario clue | Best fit |
| --- | --- |
| Unknown or short-lived usage, must not be interrupted | On-Demand |
| Steady usage for a year or more, flexible across services | Compute Savings Plans |
| Steady usage of a fixed instance type in one Region | Reserved Instances or EC2 Instance Savings Plans |
| Fault-tolerant work that can stop and restart | Spot |
| Existing server-bound licenses (per socket or core) | Dedicated Hosts |

## Common traps

- "Lowest cost" alone is not enough to pick Spot: if the job **cannot be interrupted**, Spot is wrong.
- A 24-hour job that runs once a year has no long-term pattern, so a 1-year commitment wastes money; On-Demand fits.
- Dedicated Hosts, not Dedicated Instances, are the answer when the question mentions **sockets, cores or licenses**.

## Key points

- On-Demand: flexibility, no commitment.
- Savings Plans and Reserved Instances: 1- or 3-year commitments for lower prices.
- Spot: biggest discount, but can be interrupted with two minutes' notice.
- Dedicated Hosts: physical server for licensing and compliance.

## Sources

- [Amazon EC2 billing and purchasing options](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/instance-purchasing-options.html)
- [Savings Plans types](https://docs.aws.amazon.com/savingsplans/latest/userguide/plan-types.html)
- [Spot Instance interruption notices](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/spot-instance-termination-notices.html)
