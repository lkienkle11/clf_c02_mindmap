---
id: migration-caf-services
title: "Moving workloads: AWS Transform MGN, data transfer services and Well-Architected reviews"
required: true
videoQuery: AWS Application Migration Service MGN rehost demo and AWS migration services overview
---
## Rehosting servers: AWS Transform MGN

**AWS Transform MGN**, formerly named **AWS Application Migration Service** (MGN), is AWS's main service for **rehost (lift-and-shift)** migrations. Exam questions may use either name.

- It migrates **physical, virtual and cloud servers** running Windows or Linux to AWS.
- It runs **continuous block-level replication** of each source server into AWS while the source keeps serving users.
- You **launch test instances** to check the copy, then perform a **cutover** with **minimal downtime**, typically minutes.
- Servers can be grouped into applications and **waves** to migrate many at once.
- After the move, you can replatform or refactor on AWS, so rehosting becomes a fast first step toward modernization.

## Moving databases and data (recaps)

- **AWS Database Migration Service (AWS DMS)** moves databases with minimal downtime, and **DMS Schema Conversion** or the **AWS Schema Conversion Tool (AWS SCT)** converts the schema for heterogeneous moves (see the databases topic).
- **AWS DataSync** copies large file and object datasets **online** to Amazon S3, Amazon EFS or Amazon FSx (see the storage topic).
- **AWS Transfer Family** gives partners and customers a fully managed **SFTP, FTPS, FTP or AS2** endpoint that stores files in Amazon S3 or Amazon EFS, so existing file-transfer workflows move without changing their clients.
- **AWS Snowball Edge** (offline transfer by shipped device) is closed to new customers; see the storage topic for its status.

## After the move: Well-Architected reviews

The **AWS Well-Architected Framework** (cloud concepts topic) gives the six pillars to judge a workload against: Operational Excellence, Security, Reliability, Performance Efficiency, Cost Optimization and Sustainability. The **AWS Well-Architected Tool** in the console lets a team answer the framework's questions for a workload, see **high-risk issues**, get an **improvement plan**, and save **milestones** to track progress over time. It is a good check right after a migration wave.

## Which service fits?

| Need | Service |
| --- | --- |
| Lift and shift hundreds of servers with minutes of downtime | AWS Transform MGN (Application Migration Service) |
| Move an Oracle database to Amazon Aurora | AWS DMS plus schema conversion |
| Copy file shares to Amazon S3 over the network | AWS DataSync |
| Keep partners uploading files by SFTP, but into S3 | AWS Transfer Family |
| Review a migrated workload against best practices | AWS Well-Architected Tool |

## Common traps

- MGN moves **whole servers**; DMS moves **databases**; DataSync moves **files and objects**.
- MGN keeps the source running during replication; downtime happens only at cutover.
- The Well-Architected Tool reviews architecture; it does not migrate anything.

## Key points

- AWS Transform MGN (formerly Application Migration Service) = rehost servers with continuous replication.
- DMS for databases, DataSync for files, Transfer Family for SFTP and similar protocols.
- Review migrated workloads with the Well-Architected Tool.

## Sources

- [What is AWS Transform MGN?](https://docs.aws.amazon.com/mgn/latest/ug/what-is-application-migration-service.html)
- [What is AWS Transfer Family?](https://docs.aws.amazon.com/transfer/latest/userguide/what-is-aws-transfer-family.html)
- [AWS Well-Architected Tool](https://aws.amazon.com/well-architected-tool/)
