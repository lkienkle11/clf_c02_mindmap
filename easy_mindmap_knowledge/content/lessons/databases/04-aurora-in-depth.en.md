---
id: databases-aurora-in-depth
title: "Amazon Aurora in depth: shared storage, replicas, Serverless, Global Database and Aurora vs RDS"
required: true
videoQuery: Amazon Aurora architecture Serverless Global Database vs RDS explained
---
## What makes Aurora different

**Amazon Aurora** is a fully managed relational database built by AWS and offered through the Amazon RDS console and API. It comes in a **MySQL-compatible** and a **PostgreSQL-compatible** edition, so existing code, drivers and tools work with little or no change. AWS positions it as commercial-grade reliability at the cost-effectiveness of open source databases.

The key idea is that Aurora **separates compute from storage**.

- **Compute**: a **DB cluster** has one **writer** instance and up to **15 Aurora Replicas** (readers).
- **Storage**: one shared **cluster volume** on SSDs. It keeps **six copies of your data across three Availability Zones**, even if the cluster has a single instance.

Because every instance attaches to the same volume, adding a replica does not copy any data, and a replica can take over quickly if the writer fails. Aurora fails over automatically, and you can set a failover priority for each replica. Storage **grows automatically** as data grows, and you pay only for the space you actually use.

## Endpoints and backups

- The **cluster endpoint** always points to the writer; the **reader endpoint** spreads read connections across the replicas.
- Backups are **continuous and incremental**, stored in Amazon S3, with a retention period of 1 to 35 days. They cause no performance impact, and you cannot switch them off. **Snapshots** you take yourself do not expire.
- **Cloning** creates a new cluster that initially uses almost no extra space, because data is copied only as it changes.

## Aurora Serverless

Aurora **serverless** capacity adjusts automatically with the workload. You set a minimum and maximum in **Aurora capacity units (ACUs)**, where one ACU is roughly 2 GiB of memory plus matching CPU and networking. Aurora scales in steps as small as 0.5 ACU without disconnecting clients, and billing follows the capacity used, measured per second. In recent engine versions the minimum can even be zero, so an idle database pauses and its compute charge stops (storage is still billed).

Choose it for **variable or unpredictable** workloads, new applications whose size is unknown, and development and test databases. A steady, predictable workload fits a **provisioned** cluster. Exam wording may say "Aurora Serverless". AWS documentation now calls the current feature simply Aurora serverless, and the older Serverless v1 architecture is deprecated.

## Aurora Global Database

An **Aurora global database** spans several Regions: one **primary Region** takes all writes, and up to **10 read-only secondary Regions** receive the data through the storage layer, with replication latency typically under a second. Use it for:

- **Local reads** for users around the world.
- **Disaster recovery**: if the primary Region has an outage, you can fail over to a secondary Region quickly.

This is different from RDS **cross-Region read replicas**, which are separate DB instances fed by engine-level asynchronous replication.

## Aurora or RDS?

| | Amazon RDS | Amazon Aurora |
| --- | --- | --- |
| Engines | Db2, MariaDB, SQL Server, MySQL, Oracle, PostgreSQL | MySQL-compatible, PostgreSQL-compatible |
| Storage | Volume for your instance; you pick type and size | Shared cluster volume across 3 AZs, grows automatically |
| Read scaling | Read replicas, each with its own storage | Up to 15 Aurora Replicas on the shared volume |
| Availability | Multi-AZ standby | Failover to an Aurora Replica |
| Backups | 0 to 35 days; can be turned off | Continuous, 1 to 35 days; cannot be turned off |
| Multi-Region | Cross-Region read replicas | Aurora Global Database |
| Serverless option | No | Yes |

A simple rule for exam wording: a question that names **Oracle, SQL Server, Db2 or MariaDB**, or asks for a plain managed relational database, points to **RDS**. A question that describes a service **compatible with MySQL and PostgreSQL**, with storage across three AZs, up to 15 replicas, a serverless relational option or global reach, points to **Aurora**. When a question only asks for a managed MySQL or PostgreSQL database, both RDS and Aurora qualify, and a choose-two question may list both.

## Pricing in a nutshell

Aurora is pay-as-you-go: instance (or ACU) usage plus the storage you use, plus backup storage. It has two storage configurations. **Aurora Standard** also charges per million I/O requests and suits moderate I/O. **Aurora I/O-Optimized** has no per-I/O charge and AWS recommends it when I/O is about 25% or more of your Aurora spend.

## Common traps

- "Storage replicated across three AZs, MySQL or PostgreSQL compatible" means **Aurora**, not DynamoDB or Redshift.
- "Unpredictable workload, no capacity planning, relational" means **Aurora serverless**; "unpredictable key-value" means DynamoDB on-demand.
- Aurora Replicas improve reads and availability; a copy in another Region needs **Global Database**.

## Key points

- Aurora = MySQL/PostgreSQL-compatible engine with a shared cluster volume (six copies, three AZs) that grows on its own.
- One writer plus up to 15 Aurora Replicas; automatic failover to a replica.
- Serverless scales ACUs for variable workloads; Global Database adds read-only secondary Regions and fast Regional recovery.
- Pick RDS for other engines or simple needs, Aurora for high availability and scale with MySQL or PostgreSQL.

## Sources

- [Amazon Aurora storage](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/Aurora.Overview.StorageReliability.html)
- [How Aurora serverless works](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/aurora-serverless-v2.how-it-works.html)
- [Using Amazon Aurora Global Database](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/aurora-global-database.html)
