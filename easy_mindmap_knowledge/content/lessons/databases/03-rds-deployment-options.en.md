---
id: databases-rds-deployment-options
title: "Running Amazon RDS: Multi-AZ, read replicas, backups, storage and who manages what"
required: true
videoQuery: Amazon RDS Multi-AZ vs read replicas backups and storage autoscaling explained
---
## What you choose when you create a DB instance

The previous lesson introduced **Amazon RDS**. This one looks at the decisions behind a running **DB instance**, because exam questions often describe a symptom and ask which RDS feature fixes it.

- **Engine**: IBM Db2, MariaDB, Microsoft SQL Server, MySQL, Oracle Database or PostgreSQL.
- **Instance class**: the compute and memory (general purpose, memory optimized, compute optimized or burstable). You can change it later as needs change.
- **Storage**: **General Purpose SSD** for most workloads, or **Provisioned IOPS** for I/O-intensive production databases. Magnetic storage is deprecated.
- **Network**: the DB instance runs in your **VPC**, and a security group controls who can reach it.

## Who manages what

RDS is a managed service, but the shared responsibility model still applies.

| Task | You run it yourself on EC2 | Amazon RDS |
| --- | --- | --- |
| Hardware, power, cooling | AWS | AWS |
| Operating system install and patching | You | AWS |
| Database software install and patching | You | AWS |
| Backups and high availability mechanism | You | AWS |
| Query tuning and schema design | You | You |
| Who may connect, and whether to encrypt | You | You |

"AWS provides the mechanism" does not mean it is switched on for you. **You** choose Multi-AZ, the backup retention period and whether the instance is encrypted. Encryption at rest is set when you create the instance, using an AWS KMS key.

## Multi-AZ or read replica

| | Multi-AZ DB instance | Multi-AZ DB cluster | Read replica |
| --- | --- | --- | --- |
| Goal | High availability | High availability plus extra read capacity | Read scaling |
| Copies | One standby in another AZ | Two readable standbys in other AZs | Separate read-only DB instance |
| Replication | Synchronous | Semisynchronous | Asynchronous |
| Serves reads | No | Yes | Yes |
| Where | Same Region | Same Region | Same or another Region |
| After a failure | Automatic failover | Automatic failover to a reader | You promote it to a standalone instance |

Synchronous replication can add a little write latency, which is the price of not losing data when an AZ fails. A read replica can lag behind the primary, so reports on it may show slightly old data. The two features also combine: a Multi-AZ primary can have read replicas. RDS does not add or remove read replicas automatically.

## Backups and snapshots

- **Automated backups** run during the backup window and let you restore to any point in time inside the **retention period**, which you can set from 0 (off) to 35 days. Console-created instances default to 7 days. Deleting the instance also deletes its automated backups unless you choose to retain them.
- **Manual snapshots** are taken when you ask, stay until you delete them, and survive deletion of the instance.
- Backups are stored in Amazon S3, and RDS includes backup storage up to the size of your provisioned database storage in each Region.
- A restore always creates a **new** DB instance; it does not overwrite the old one.

## Storage autoscaling

If you turn on **storage autoscaling** and set a maximum storage threshold, RDS grows the storage when free space runs low, with no downtime. It only grows: allocated storage cannot be reduced later. It does not resize the instance class and does not add read replicas.

## Related features

- **Amazon RDS Proxy** pools and shares database connections, so the database is not overwhelmed by sudden bursts of connections. It also keeps application connections alive while RDS fails over to a standby.
- **Amazon RDS Custom** (Oracle and SQL Server only) is for legacy or packaged applications that need access to the database host and operating system; you take on more of the management.

## Pricing in one paragraph

You pay for DB instance hours (on-demand or reserved), provisioned storage, backup storage beyond the free allowance, and data transfer. Read replicas are billed like any other DB instance.

## Common traps

- "Survive an AZ failure with minimal downtime" is **Multi-AZ**. "Offload reporting queries" is a **read replica**.
- A Multi-AZ DB **instance** standby cannot serve reads; a read replica is not an automatic failover target.
- "Patching the operating system of an RDS instance" is AWS; "patching the OS of a database on EC2" is you.
- A recovery requirement of minutes points to Multi-AZ, not to snapshots or CloudFormation templates.

## Key points

- Choose engine, instance class and storage; RDS then handles OS and database patching, backups and failure recovery.
- Multi-AZ = availability (synchronous standby, automatic failover); read replicas = read scaling (asynchronous, can be cross-Region).
- Automated backups give point-in-time restore for up to 35 days; manual snapshots stay until deleted.
- Storage autoscaling grows storage only; you still own schema, tuning, access control and encryption choices.

## Sources

- [What is Amazon RDS?](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Welcome.html)
- [Working with DB instance read replicas](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_ReadRepl.html)
- [Introduction to backups](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_WorkingWithAutomatedBackups.html)
