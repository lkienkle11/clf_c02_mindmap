---
id: storage-hybrid-backup
title: "Hybrid storage, data transfer and AWS Backup"
required: true
videoQuery: AWS Storage Gateway DataSync AWS Backup explained
---
## Bridging on-premises and AWS

These services connect on-premises data to AWS, move it, or protect it.

## AWS Storage Gateway: hybrid cloud storage

**AWS Storage Gateway** connects an appliance in your data center (usually a virtual machine) to AWS storage. On-premises applications keep using familiar protocols, and a local cache gives low-latency access to recent data.

- **Amazon S3 File Gateway**: applications store and read files over **NFS or SMB**, and the files are kept as objects in Amazon S3.
- **Tape Gateway**: replaces a physical tape library with **virtual tapes** archived in AWS.
- **Volume Gateway**: cloud-backed block storage volumes that on-premises servers mount over iSCSI.

(Amazon FSx File Gateway is no longer available to new customers.)

## AWS DataSync: online transfer

**AWS DataSync** is an **online** transfer service that copies files or objects over the network between on-premises storage (NFS, SMB, HDFS, object storage), other clouds, and AWS storage such as Amazon S3, Amazon EFS and Amazon FSx. It automates the transfer and adds encryption and integrity checks. Use it for migrations, archiving cold data and recurring copies.

## AWS Snow Family: offline transfer and edge devices

The **AWS Snow Family** (for example **AWS Snowball Edge**) is a set of rugged devices that AWS ships to you. You load data locally and ship the device back, which suits very large datasets or sites with poor connectivity. Note: [Snowball Edge is no longer available to new customers](https://docs.aws.amazon.com/snowball/latest/developer-guide/snowball-edge-availability-change.html) (since November 2025), and AWS pages give different end-of-support dates (see the Snow Family lesson). AWS points new customers to DataSync, the AWS Data Transfer Terminal or AWS Partner solutions. Exam questions may still mention Snowball Edge.

## AWS Backup: one place for backup policy

**AWS Backup** is a fully managed service to **centralize and automate** data protection across AWS services, such as Amazon EC2, Amazon EBS, Amazon S3, Amazon EFS, Amazon FSx, Amazon RDS and Amazon DynamoDB, and some on-premises workloads. You define **backup plans** (schedule, retention, copies to other Regions) and assign resources to them, for example by tag.

## Which one fits?

| Need | Service |
| --- | --- |
| On-premises apps need file access to data kept in S3 | S3 File Gateway |
| Replace a physical tape library | Tape Gateway |
| Migrate large file shares to AWS over the network | AWS DataSync |
| One backup policy across many AWS services | AWS Backup |

## Common traps

- Storage Gateway gives **ongoing hybrid access**; DataSync **moves** data.

## Key points

- Storage Gateway links on-premises apps to AWS storage using standard protocols.
- DataSync is the online way to move large amounts of data into AWS.
- Snowball Edge is offline transfer; closed to new customers; AWS pages give different end-of-support dates.
- AWS Backup centralizes and automates backups.

## Sources

- [What is Amazon S3 File Gateway](https://docs.aws.amazon.com/filegateway/latest/files3/what-is-file-s3.html)
- [What is AWS DataSync?](https://docs.aws.amazon.com/datasync/latest/userguide/what-is-datasync.html)
- [What is AWS Backup?](https://docs.aws.amazon.com/aws-backup/latest/devguide/whatisbackup.html)
