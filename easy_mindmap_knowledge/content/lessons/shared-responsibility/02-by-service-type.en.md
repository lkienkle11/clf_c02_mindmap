---
id: shared-responsibility-by-service
title: "How the line moves: EC2, RDS, Lambda and S3"
required: true
videoQuery: AWS shared responsibility model EC2 vs RDS vs Lambda who patches what
---
## The rule of thumb

**The more AWS manages, the less you configure, but you never hand over your data or access control.** Three groups:

- **Infrastructure services** such as **Amazon EC2** (IaaS): you get a virtual server and configure almost everything above the virtualization layer.
- **Managed services** such as **Amazon RDS**: AWS also runs the operating system and the database software.
- **Abstracted services** such as **AWS Lambda, Amazon S3 and Amazon DynamoDB**: AWS runs the infrastructure, operating system and platform.

## Who does what

| Task | Amazon EC2 | Amazon RDS | AWS Lambda / Amazon S3 |
| --- | --- | --- | --- |
| Physical security, hardware, host OS, hypervisor | AWS | AWS | AWS |
| Guest OS install and patching | Customer | AWS | AWS |
| Database or runtime software patching | Customer (if installed) | AWS, in a maintenance window the customer chooses (a mandatory update can still be applied after its apply date) | AWS (Lambda managed runtimes; applied automatically in the default Auto mode) |
| Application code and its libraries | Customer | Customer (schema, queries) | Customer (function code, dependencies) |
| Network access rules | Customer (security groups, NACLs) | Customer (DB security group) | Customer (bucket policies, function permissions) |
| Encryption choices (keys, extra options, encryption in transit) | Customer | Customer | Customer (S3 and DynamoDB encrypt at rest by default) |
| Data and IAM permissions | Customer | Customer | Customer |

## Amazon EC2 in detail

EC2 is close to running your own server: you patch the **guest operating system**, update applications, configure **security groups**, manage key pairs and back up EBS volumes. AWS secures the host, hypervisor and data center.

## Amazon RDS in detail

AWS applies the required operating system and database engine patches (optional operating system updates are applied only when you choose), runs automated backups and, with Multi-AZ, handles failover. **You** choose the weekly **maintenance window** when required patches are applied, control network access with security groups, create database users, decide whether to enable encryption at rest, and tune your queries.

## AWS Lambda and Amazon S3 in detail

- **Lambda**: there is no server for you to patch. For managed runtimes, Lambda applies runtime security updates automatically by default. You own the **function code**, the **libraries you package**, the function's **IAM permissions** and its configuration.
- **S3**: AWS runs the storage infrastructure. You decide **who can access** buckets and objects (policies, Block Public Access), extra encryption options, versioning and lifecycle rules.

## Common traps

- "Who patches the guest OS on EC2?" The **customer**.
- "Who patches the database engine on RDS?" **AWS**, during the maintenance window **the customer** chooses (a mandatory update can still be applied after its apply date).
- "Who patches the OS under Lambda?" **AWS**.
- "Who configures the security group of an RDS instance?" The **customer**, even though RDS is managed.

## Key points

- EC2: customer handles guest OS, apps, firewall rules and data.
- RDS: AWS patches OS and engine; customer chooses the maintenance window and controls access and data.
- Lambda and S3: AWS runs everything below your code and data.
- Data, IAM and encryption choices remain the customer's for every service.

## Sources

- [Shared responsibility model](https://aws.amazon.com/compliance/shared-responsibility-model/)
- [Maintaining a DB instance](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_UpgradeDBInstance.Maintenance.html)
- [Understanding how Lambda manages runtime version updates](https://docs.aws.amazon.com/lambda/latest/dg/runtimes-update.html)
