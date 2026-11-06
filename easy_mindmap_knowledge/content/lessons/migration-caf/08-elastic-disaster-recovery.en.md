---
id: migration-caf-elastic-disaster-recovery
title: "AWS Elastic Disaster Recovery: low-cost DR for servers"
required: true
videoQuery: AWS Elastic Disaster Recovery DRS how it works staging area drill failback
---
## What it is

**AWS Elastic Disaster Recovery** (AWS DRS) protects server-based applications by continuously copying them into AWS, so that you can start them in AWS within minutes if the original site fails. The source can be a physical server, a virtual machine on VMware vSphere or Microsoft Hyper-V, a server in another cloud, or an Amazon EC2 instance in another Availability Zone or Region.

It is the implementation of the **pilot light** idea from the previous lesson: data is always replicating, while the full-size recovery servers are not running until you need them.

## How it works

1. **Install the AWS Replication Agent** on each source server.
2. The agent performs **continuous block-level replication** of the server's disks into a **staging area subnet** in your AWS account and in the Region you choose.
3. The staging area uses **affordable storage and minimal compute** (small replication servers) to keep replication going. This is why standby cost stays low.
4. During normal operation you can run **drills** that launch recovery instances without disturbing the source or stopping replication.
5. In a real event, you **launch recovery instances**. DRS automatically converts the servers so they boot and run natively on AWS, using the latest state or an earlier **point in time**.
6. When the original site is repaired, you start replication back and **fail back**, or you simply keep running on AWS.

AWS describes the typical **RTO** as minutes (dependent on operating system boot time) and the typical **RPO** as sub-second.

## Pricing and responsibility

Pricing is pay as you go: you pay for the replicated servers and the staging resources, and you pay for full recovery compute only while you run drills or a real recovery. This avoids paying for an idle second data center. You remain responsible for choosing the target Region, testing drills regularly, and securing the accounts and networks involved.

## Status and older names

AWS Elastic Disaster Recovery is the current AWS service. **CloudEndure Disaster Recovery** was the earlier product; AWS calls Elastic Disaster Recovery its next generation, and CloudEndure Disaster Recovery was discontinued on September 29, 2025 (except in the China Regions). The current service FAQ says there is no upgrade path, so new protection starts in AWS DRS. If an old study resource says CloudEndure, read it as the predecessor.

## Where it fits among lookalikes

| Need | Best fit |
| --- | --- |
| Restore files, volumes or databases to an earlier version; keep history | **AWS Backup** or snapshots (storage topic) |
| Bring a whole server-based application up quickly in AWS after an outage | **AWS Elastic Disaster Recovery** |
| Permanently move servers to AWS | **AWS Application Migration Service** (earlier lesson) |
| Keep a scaled-down copy of everything running in another Region | Warm standby built with your own services |

Backups and DR are complementary. Backups keep historical copies for recovering lost or damaged data; DR restores access to the application after an outage.

## DRS and Application Migration Service

The two services share block-level replication technology and both use a staging area. The main differences:

- Migration Service launches **test and cutover** instances to move a server for good; DRS launches **drill and recovery** instances to protect a server that stays where it is.
- DRS can **fail back** to the source environment; Migration Service cannot.
- One server cannot run both agents at the same time.

Exam wording matters here. An exam question that asks how to move servers or migrate EC2 instances between Regions is keyed to **AWS Application Migration Service**, even though AWS notes that DRS can technically be used for a migration when it offers a feature the migration service lacks. A question about disaster recovery of on-premises servers points to DRS.

## Common traps

- DRS is not a backup tool and does not replace AWS Backup.
- Replication runs continuously, but you pay for large recovery servers only when you launch them.
- Replicated data stays in your own AWS account.

## Key points

- Elastic Disaster Recovery = continuous block-level replication to a low-cost staging area, drills, recovery and failback.
- Typical RTO is minutes and RPO sub-second, according to AWS.
- It follows the pilot light model; backups are for history, DR is for fast service recovery.
- It is the successor to CloudEndure Disaster Recovery, which is discontinued.

## Sources

- [What is AWS Elastic Disaster Recovery?](https://docs.aws.amazon.com/drs/latest/userguide/what-is-drs.html)
- [Elastic Disaster Recovery FAQ](https://docs.aws.amazon.com/drs/latest/userguide/FAQ.html)
- [AWS Elastic Disaster Recovery product page](https://aws.amazon.com/disaster-recovery/faqs/)
