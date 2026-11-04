---
id: shared-responsibility-responsibility-storage-databases
title: "Storage, databases and serverless: how the line shifts"
required: true
videoQuery: shared responsibility model S3 EBS RDS DynamoDB Lambda Fargate who is responsible
---
## The gradient: more managed, more AWS

Think of a slider. At one end you run a server yourself and own almost everything above the hypervisor. At the other end you call a service and AWS runs everything below your code and data. The slider only moves the **operational** layers. Your **data**, your **access decisions** and your **encryption choices** stay with you at every position.

## Amazon S3

**Amazon S3** is an abstracted service. AWS operates the storage infrastructure and the servers behind it, and is responsible for keeping that infrastructure secure and durable. The S3 documentation lists the customer side:

- Managing your data, including object ownership and encryption.
- **Classifying** your assets.
- Managing access with IAM roles, bucket policies and other settings.
- Enabling detective controls such as AWS CloudTrail or Amazon GuardDuty.

An exam trap: a bucket that is publicly readable is a customer configuration problem, not an AWS failure.

## Amazon EBS and snapshots

**Amazon EBS** volumes are the block disks of EC2 instances. AWS owns the storage hardware and facilities. Because a volume is attached to your instance, what is on it is yours: the file system, the data, your decision to encrypt the volume, your backup routine and who may use or share your snapshots. Whoever patches the guest operating system on EC2 does not change the fact that the disk content belongs to you.

## Amazon RDS

**Amazon RDS** is a managed database service.

| Task | Who is responsible |
| --- | --- |
| Hardware, facilities, host and database software installation | AWS |
| Operating system and database engine patching | AWS (you pick the maintenance window) |
| Backup and failover mechanisms | AWS provides them; you choose to use and configure them |
| Database users and permissions | Customer |
| Network access (VPC and security groups) | Customer |
| Parameter settings, schema and queries | Customer |
| Encryption choices (at rest, in transit) | Customer |
| Application-level security | Customer |

The RDS documentation notes that you only configure security for your own use cases, not for processes RDS manages, such as creating backups or replicating to a read replica. It also lists the controls you do own: running in a VPC, IAM policies for managing RDS resources, security groups for who can connect, SSL/TLS connections, encryption of instances and snapshots at rest, and engine-level login controls.

## Amazon DynamoDB

**Amazon DynamoDB** is abstracted like S3. There are no servers, operating system or database software for you to patch. You decide who may read and write tables (IAM policies), how sensitive the items are, and your encryption and backup choices. As with all services, your share is "determined by the AWS service you use", in the words of the AWS documentation.

## Lambda and serverless

With **AWS Lambda** managed runtimes, AWS provides the servers, operating system and runtime updates. You own the function code, the libraries you package with it and the IAM permissions of the function. Serverless does not mean "no security work"; it means the work moves up to code and permissions.

## Containers on AWS Fargate

**AWS Fargate** runs containers without servers for you to manage. AWS documentation states that with Fargate you are not responsible for securing the compute infrastructure, and Fargate provisions and patches it. You remain responsible for:

- Network configuration (VPC, network ACLs, security groups, route tables).
- Storage encryption.
- Your **container images**.
- IAM permissions through the task role.

If you instead run containers on EC2 instances, you also maintain those instances, including the AMI, its patching and hardening, and the ECS agent.

## Summary slider

| Service | Customer effort on the platform | Customer still owns |
| --- | --- | --- |
| EC2 | High: guest OS, patches, software | Data, access, encryption choices |
| RDS | Medium: settings, users, network | Data, access, encryption choices |
| Fargate | Lower: images, task role, network | Data, access, encryption choices |
| Lambda, S3, DynamoDB | Lowest: code and permissions or access policies | Data, access, encryption choices |

## Key points

- More managed means more AWS responsibility, but never for your data, access control or encryption decisions.
- S3: AWS runs the infrastructure; you control access, classification and encryption.
- RDS: AWS patches the OS and engine; you handle users, network rules and settings.
- Fargate: AWS patches the compute layer; you own images, task role and network.
- Lambda: you own code, libraries and function permissions.

## Sources

- [Security in Amazon S3](https://docs.aws.amazon.com/AmazonS3/latest/userguide/security.html)
- [Security in Amazon RDS](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/UsingWithRDS.html)
- [Shared responsibility model for Amazon ECS](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/security-shared-model.html)
