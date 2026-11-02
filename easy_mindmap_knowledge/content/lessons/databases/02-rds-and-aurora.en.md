---
id: databases-rds-aurora
title: "Relational databases: Amazon RDS and Amazon Aurora"
required: true
videoQuery: Amazon RDS Multi-AZ vs read replicas and Amazon Aurora explained
---
## Amazon RDS

**Amazon Relational Database Service (RDS)** runs a relational database for you. You choose an engine you already know: **MySQL, PostgreSQL, MariaDB, Oracle, Microsoft SQL Server or IBM Db2**. You pick an instance class for compute and memory, and storage for your data.

RDS takes over routine work: provisioning, operating system and database patching, backups, failure detection and recovery. You still own the schema, query tuning, database users, and network access (for example the **security group** of the DB instance).

## Backups

- **Automated backups**: RDS backs up the whole DB instance during its **backup window** and keeps backups for the **retention period** you set (up to 35 days). You can restore to **any point in time** inside that period.
- **Manual snapshots**: you take them when you want, and they stay until you delete them, even after the DB instance is deleted.

## Multi-AZ or read replicas

This pair is a classic exam trap.

| Feature | Multi-AZ DB instance | Read replica |
| --- | --- | --- |
| Main goal | High availability and failover | Read scaling |
| Copy is | Standby in another AZ | Read-only copy (same or other Region) |
| Replication | Synchronous | Asynchronous |
| Serves reads? | No, the standby only waits | Yes |
| On failure | Automatic failover to the standby | You can promote it to a standalone DB |

Multi-AZ also reduces the impact of operating system maintenance: RDS patches the standby first, then fails over. RDS also offers Multi-AZ **DB clusters** whose reader instances can serve reads, but the classic exam idea is: **availability = Multi-AZ, read performance = read replicas**.

## Maintenance windows

Each DB instance has a weekly **maintenance window** that **you** can choose. AWS applies required patches during it, so pick a quiet time.

## Amazon Aurora

**Amazon Aurora** is a relational engine built by AWS and managed through RDS. It is **compatible with MySQL and PostgreSQL**, so existing tools keep working.

- Its storage is a shared **cluster volume** with copies of the data across **three Availability Zones**, and it **grows automatically** as data grows.
- **Aurora Replicas** read from the same shared storage and can take over if the writer fails.
- **Aurora Serverless** adjusts database capacity automatically for variable or unpredictable workloads.
- **Aurora Global Database** spans several Regions: one primary Region for writes and read-only secondary Regions for fast local reads and disaster recovery.

## Common traps

- "Survive an AZ failure with automatic failover" means **Multi-AZ**, not read replicas.
- "Reporting queries slow down the production database" means **read replicas**.
- "MySQL or PostgreSQL compatible with storage replicated across three AZs" means **Aurora**.

## Key points

- RDS = managed relational database with six engine choices.
- Automated backups give point-in-time restore inside the retention period.
- Multi-AZ for availability; read replicas for reads.
- Aurora: MySQL/PostgreSQL compatible, storage across three AZs, Serverless and Global options.

## Sources

- [What is Amazon RDS?](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Welcome.html)
- [Working with DB instance read replicas](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_ReadRepl.html)
- [What is Amazon Aurora?](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/CHAP_AuroraOverview.html)
