---
id: migration-caf-data-transfer-services
title: "Moving data and databases: DataSync, DMS and schema conversion"
required: false
videoQuery: AWS DataSync vs AWS Database Migration Service which to use data migration
---
## Servers, files and databases are different jobs

Application Migration Service copies whole servers. Files and databases have their own tools, and exam questions test whether you pick the right one.

## AWS DataSync

**AWS DataSync** moves **file or object data** over the network, quickly and securely, between storage systems and AWS storage services.

- Sources include on-premises **NFS**, **SMB**, Hadoop (HDFS) and object storage, plus storage in some other clouds.
- Destinations include **Amazon S3**, **Amazon EFS** and several **Amazon FSx** file systems. It can also copy between AWS storage services.
- For on-premises sources you deploy a DataSync **agent**; transfers are encrypted and checked with **data integrity validation**, so the data arrives intact.
- Use it for one-time migrations of millions of files, recurring replication, and archiving cold data.
- Pricing: a per-gigabyte charge for data copied, plus normal charges for the storage you use.

**Offline alternative:** when the network is too slow or unavailable, shipped devices from the AWS Snow family move data physically. Snowball Edge is closed to new customers, and AWS points new customers to DataSync or AWS Data Transfer Terminal; AWS pages give different end-of-support dates, so see the Snow Family lesson in the storage topic.

## AWS Database Migration Service (AWS DMS)

**AWS DMS** moves **databases and other data stores** to AWS with minimal downtime. The source database stays operational during the migration, and DMS can keep replicating ongoing changes until you switch over.

- **Homogeneous** migration: same engine on both sides, such as MySQL to Amazon RDS for MySQL.
- **Heterogeneous** migration: different engines, such as Oracle to Amazon Aurora PostgreSQL, or a NoSQL source to Amazon DynamoDB.
- Under the hood it is a replication server in AWS that runs tasks; you pay for what you use.

## Schema conversion

Different engines use different data types, code and table structures. **DMS Schema Conversion** assesses and converts schemas and code objects automatically. You can also use the downloadable **AWS Schema Conversion Tool (AWS SCT)**. The usual pairing is **SCT (or DMS Schema Conversion) for the schema, then DMS for the data**. A same-engine move does not need schema conversion.

## Which service moves what

| What you are moving | Service |
| --- | --- |
| Whole physical or virtual servers | AWS Application Migration Service |
| File shares and objects over the network | AWS DataSync |
| Data between AWS storage services | AWS DataSync |
| A database to a managed engine | AWS DMS |
| A commercial database to an open-source engine | DMS plus SCT or DMS Schema Conversion |
| Partner uploads by SFTP into S3 | AWS Transfer Family (see the migration services lesson) |
| Petabytes with weak networking | Snow family (storage topic) |

## Common traps

- Do not use DMS for plain files or DataSync for databases.
- Heterogeneous migrations need schema conversion first; homogeneous ones usually do not.

## Key points

- DataSync = online file and object transfer with encryption and integrity checks.
- DMS = database migration with minimal downtime and continuous replication.
- SCT or DMS Schema Conversion handles the schema for heterogeneous moves.

## Sources

- [What is AWS DataSync?](https://docs.aws.amazon.com/datasync/latest/userguide/what-is-datasync.html)
- [What is AWS Database Migration Service?](https://docs.aws.amazon.com/dms/latest/userguide/Welcome.html)
- [AWS DataSync pricing](https://aws.amazon.com/datasync/pricing/)
