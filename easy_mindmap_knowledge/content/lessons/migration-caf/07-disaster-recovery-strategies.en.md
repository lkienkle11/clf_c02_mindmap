---
id: migration-caf-disaster-recovery-strategies
title: "Disaster recovery strategies: RTO, RPO and the four AWS approaches"
required: true
videoQuery: AWS disaster recovery strategies backup restore pilot light warm standby multi-site explained
---
## Why plan for disaster recovery

A **disaster** is any event that stops a workload from doing its job: a failed data center, a regional outage, a faulty deployment, or deleted data. **Disaster recovery (DR)** is the plan and the technology that bring the workload back. AWS recommends that the DR plan is part of a wider business continuity plan, and that the effort is matched to business impact. A critical payment system deserves more protection than an internal wiki, and for some low-risk systems no DR at all can be a valid, informed choice.

## Two numbers that drive every decision

- **Recovery Time Objective (RTO)**: the maximum acceptable delay between the interruption of service and its restoration. It answers "how long can we be down?"
- **Recovery Point Objective (RPO)**: the maximum acceptable amount of time since the last recovery point. It answers "how much recent data can we lose?"

Remember the pair as **T**ime to be back up and **P**oint in time of the data you get back. A tight RTO needs resources ready to run; a tight RPO needs data copied often or continuously. The business sets both numbers, and the cost of the recovery option should not exceed the cost of the failure.

## Multi-AZ first, multi-Region when needed

A highly available workload spread across several **Availability Zones** in one Region already survives the loss of a data center, because each zone is isolated from faults in the others. For extra assurance, copy data and configuration to **another Region**, which keeps the DR plan down to backup and restore. Move to the multi-Region strategies below when the disaster you must survive is the loss of a whole Region, or when regulation requires it. The same strategies can also be built with Availability Zones when a country has only one Region.

## The four strategies

The AWS Well-Architected whitepaper on disaster recovery describes four approaches, ordered from lowest cost and complexity to highest.

| Strategy | What runs in the recovery site | Recovery time | Cost and complexity |
| --- | --- | --- | --- |
| **Backup and restore** | Only backups of data, configuration and templates; everything is rebuilt after the disaster | Longest | Lowest |
| **Pilot light** | Data replicated and core resources such as databases always on; application servers switched off | Shorter | Low to moderate |
| **Warm standby** | A scaled-down but fully working copy that can serve traffic at reduced capacity | Shorter still | Moderate to high |
| **Multi-site active/active** | Full copies serving users in several Regions at once | Near zero for most disasters | Highest |

Only the ordering is taken from the whitepaper. Real recovery times depend on automation, data size and testing, so do not memorize hour or minute figures.

## How to tell the middle two apart

Both pilot light and warm standby keep a copy of the workload in the recovery Region. **Pilot light cannot process requests until you switch on servers and scale up**, while **warm standby can handle traffic immediately** at reduced capacity and only needs to scale up. Use the name as a hint: a pilot light is a small flame that can light the whole furnace; a warm standby is already warm.

## Choosing a strategy

| Situation | Typical fit |
| --- | --- |
| Internal tool, hours of downtime and some data loss are acceptable | Backup and restore |
| Core data must be current, but a short manual start-up is acceptable | Pilot light |
| Customer-facing system that must recover in minutes | Warm standby |
| Business-critical system that cannot tolerate visible downtime | Multi-site active/active |

## Supporting ideas

- **Backups** from services such as **AWS Backup** can be copied to another Region or account (see the storage topic). Backups protect against corruption and deletion; continuous replication alone may copy the damage.
- **Infrastructure as code**, for example **AWS CloudFormation**, lets you rebuild environments quickly and identically.
- **Amazon Route 53** and **AWS Global Accelerator** can redirect users to a healthy Region.
- A DR plan that is never tested cannot be trusted; run regular drills.

## Common traps

- RTO is about **time to restore service**; RPO is about **data loss**. Do not swap them.
- Multi-AZ gives high availability inside a Region; it is not protection against a whole-Region disaster.
- Higher cost does not mean "better" for every workload. The right strategy is the cheapest one that meets the RTO and RPO.

## Key points

- RTO = how long you can be down; RPO = how much data you can lose.
- Four strategies from cheapest and slowest to costliest and fastest: backup and restore, pilot light, warm standby, multi-site active/active.
- Pilot light needs servers switched on; warm standby already serves traffic at reduced size.
- Choose the least expensive strategy that still meets the objectives.

## Sources

- [Disaster recovery options in the cloud, AWS whitepaper](https://docs.aws.amazon.com/whitepapers/latest/disaster-recovery-workloads-on-aws/disaster-recovery-options-in-the-cloud.html)
- [Business continuity plan and recovery objectives, AWS whitepaper](https://docs.aws.amazon.com/whitepapers/latest/disaster-recovery-workloads-on-aws/business-continuity-plan-bcp.html)
- [Disaster recovery is different in the cloud, AWS whitepaper](https://docs.aws.amazon.com/whitepapers/latest/disaster-recovery-workloads-on-aws/disaster-recovery-is-different-in-the-cloud.html)
