---
id: storage-ebs-volumes-snapshots
title: "Amazon EBS in depth: volume types, snapshots and encryption"
required: true
videoQuery: Amazon EBS volume types gp3 io2 st1 sc1 snapshots encryption explained
---
## Where EBS fits

**Amazon Elastic Block Store (Amazon EBS)** provides block volumes for EC2 instances. The overview lesson explained the basics; this one covers the details that exam questions use to separate one answer from another: which volume type, what a snapshot really is, and how encryption works.

## Two families: SSD and HDD

EBS volume types fall into two groups according to what they are optimized for.

| Family | Volume types | Optimized for | Typical use |
| --- | --- | --- | --- |
| SSD, General Purpose | **gp3** (and older gp2) | Balanced price and performance, IOPS | Boot volumes, small and medium databases, dev and test, virtual desktops |
| SSD, Provisioned IOPS | **io2** (Block Express) and io1 | Highest IOPS and lowest latency | I/O-intensive databases that need sustained IOPS |
| HDD, Throughput Optimized | **st1** | Throughput for large sequential reads and writes | Big data, data warehouses, log processing |
| HDD, Cold | **sc1** | Lowest cost for infrequently accessed data | Throughput-oriented data where cost matters most |

Rules of thumb for the exam:

- **SSD** volumes suit transactional workloads with many small reads and writes, where IOPS matters most.
- **HDD** volumes suit large streaming workloads, where throughput matters most. They **cannot be boot volumes**.
- **Provisioned IOPS SSD** is the answer when a question stresses very high or guaranteed IOPS for a critical database. **io2 Block Express** is designed for 99.999% durability, higher than the 99.8% to 99.9% of the other types.
- **Multi-Attach**, which lets one volume attach to several instances, is supported only on Provisioned IOPS SSD volumes.
- **General Purpose SSD** (gp3) is the sensible default when no extreme requirement is stated.

You do not need to memorize maximum IOPS numbers; knowing which family fits which workload is enough.

## Volumes live in one Availability Zone

An EBS volume is created in a single Availability Zone, and it can be attached only to an instance in that **same AZ**. Data is replicated within the AZ, not across AZs. A volume is independent of the instance: you can detach it and attach it to another instance in the same AZ, and it keeps its data. You pay for the provisioned volume while it exists, even if it is detached.

To move data to another AZ or Region, you use a snapshot.

## Snapshots: your backups

An **EBS snapshot** is a point-in-time backup of a volume.

- **Incremental**: the first snapshot copies the written data; later snapshots save only blocks that changed since the previous one. Each snapshot still contains everything needed to restore the volume.
- **Stored in Amazon S3**, in buckets that AWS manages for you. You cannot see them in the S3 console; you manage them through EC2.
- **Replicated across the Availability Zones of the Region**, so you can create a new volume from a snapshot in **any AZ** of that Region.
- **Copyable to another Region**, for disaster recovery or to launch resources there.
- **Not automatic**: AWS does not back up your volumes for you. You create snapshots yourself or automate them with **Amazon Data Lifecycle Manager** or **AWS Backup**.
- **Billed by stored data.** Because they are incremental, deleting one snapshot may free little space when later snapshots still reference its blocks.

**Recycle Bin** can keep accidentally deleted snapshots (and volumes and EBS-backed AMIs) for a retention period you set, so you can restore them.

## Encryption

EBS encryption uses **AWS KMS** keys. When a volume is encrypted, the data at rest, the data moving between the instance and the volume, the snapshots made from it, and any volume created from those snapshots are all encrypted. You do not manage key infrastructure yourself. Practical points:

- You can turn on **encryption by default** for an account in a Region.
- You cannot encrypt an existing unencrypted volume in place. Take a snapshot, then create a new encrypted volume from it (or make an encrypted copy of the snapshot).
- Snapshots of encrypted volumes are always encrypted.

## EBS-backed storage versus instance store

EBS persists independently of the instance. **Instance store** is temporary and tied to the host; the next lesson compares them. If a question says data must survive instance termination, think EBS (or S3 or EFS), not instance store.

## Shared responsibility

AWS runs the EBS infrastructure and replicates volume data within the AZ. You choose the volume type, create snapshots, decide on encryption and clean up unused volumes and snapshots, because they keep costing money.

## Common traps

- A volume cannot be attached across AZs; use a snapshot to move it.
- HDD volumes cannot be boot volumes.
- Snapshots are not automatic and are not visible in your S3 buckets.

## Key points

- SSD (gp3, io2) for IOPS and transactions; HDD (st1, sc1) for throughput and cold data.
- A volume is tied to one AZ; snapshots are incremental, live in S3 and restore into any AZ or can be copied to another Region.
- You must schedule snapshots, for example with Data Lifecycle Manager or AWS Backup.
- Encryption uses KMS; encrypt an existing volume through a snapshot copy.

## Sources

- [Amazon EBS volume types](https://docs.aws.amazon.com/ebs/latest/userguide/ebs-volume-types.html)
- [Amazon EBS snapshots](https://docs.aws.amazon.com/ebs/latest/userguide/ebs-snapshots.html)
- [Amazon EBS encryption](https://docs.aws.amazon.com/ebs/latest/userguide/ebs-encryption.html)
