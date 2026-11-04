---
id: storage-block-file
title: "Block and file storage: Amazon EBS, instance store, Amazon EFS and Amazon FSx"
required: true
videoQuery: Amazon EBS vs EFS vs S3 vs instance store explained
---
## Three kinds of storage

| Type | How you use it | AWS services |
| --- | --- | --- |
| Object | Whole files over an API, from anywhere | Amazon S3 |
| Block | A disk attached to one server | Amazon EBS, instance store |
| File | A shared folder that many servers mount | Amazon EFS, Amazon FSx |

Exam clue: "a disk for a database on EC2" is block, "a file system shared by many instances" is file, "store any amount of backups" is object.

## Amazon EBS: network disks for EC2

An **Amazon Elastic Block Store (EBS) volume** behaves like a hard drive attached to an EC2 instance. Key facts:

- The volume and the instance must be in the **same Availability Zone**.
- A volume **persists independently** of the instance, so data survives a stop and start.
- Data is replicated across multiple servers **within its AZ**.
- Volume types are **SSD-backed** (transactional workloads such as databases) or **HDD-backed** (throughput-heavy workloads).

**EBS snapshots** are point-in-time, **incremental** backups of a volume: only blocks changed since the last snapshot are saved. Snapshots are stored in Amazon S3 for you and can restore volumes in any AZ of the Region or be copied to another Region. AWS does not back up volumes automatically; you create or schedule snapshots.

## Instance store: fast but temporary

An **instance store** is block storage on disks **physically attached to the host** computer. It is fast and included in the instance price, but data is **lost when the instance stops, hibernates or terminates**. Use it for caches, buffers and scratch data.

## Amazon EFS: shared Linux file system

**Amazon Elastic File System (EFS)** is a fully managed, serverless file system that uses the **NFS** protocol. Many EC2 instances, containers and Lambda functions can mount it at the same time. It **grows and shrinks automatically** as files are added and removed, and Regional file systems store data across multiple AZs. EFS is not supported for Windows instances.

## Amazon FSx: managed third-party file systems

**Amazon FSx** offers fully managed file systems built on popular technologies:

- **FSx for Windows File Server**: native Windows file shares over **SMB**, integrated with Microsoft Active Directory.
- **FSx for Lustre**: high-performance file storage for HPC and machine learning.
- **FSx for NetApp ONTAP** and **FSx for OpenZFS**: managed versions of those file systems.

## Common traps

- "Shared file storage for Linux" means EFS; "Windows file shares" or "SMB" means FSx for Windows File Server.
- Instance store is not durable storage for important data.

## Key points

- Object = S3, block = EBS or instance store, file = EFS or FSx.
- EBS persists beyond the instance; instance store does not.
- EBS snapshots are incremental backups you schedule.
- EFS is shared NFS storage that scales automatically.

## Sources

- [Amazon EBS volumes](https://docs.aws.amazon.com/ebs/latest/userguide/ebs-volumes.html)
- [Instance store temporary block storage for EC2 instances](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/InstanceStorage.html)
- [What is Amazon Elastic File System?](https://docs.aws.amazon.com/efs/latest/ug/whatisefs.html)
