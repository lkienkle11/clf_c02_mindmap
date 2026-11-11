---
id: storage-instance-store-efs-fsx
title: "Instance store, Amazon EFS and Amazon FSx: choosing block, file or object"
required: true
videoQuery: EC2 instance store vs Amazon EFS vs Amazon FSx which to choose
---
## Beyond the overview

The overview lesson named these services. Here you learn how to **choose** between them, which is exactly what exam questions ask: "which storage service fits this requirement?"

## EC2 instance store

An **instance store** is block storage on disks physically attached to the host that runs your instance. It is included in the instance price and can be very fast, but it is **ephemeral**:

- Data is lost when the instance is **stopped, hibernated or terminated**, or if the underlying drive fails.
- Not every instance type has an instance store, and its size depends on the instance type.
- It cannot be detached and reattached to a different instance like an EBS volume.

Use it for caches, buffers, scratch data, or data you replicate across a fleet. Never use it as the only copy of data you need to keep. Exam clue: "ephemeral" or "deleted when the instance is stopped or terminated" means instance store.

## Amazon EFS

**Amazon Elastic File System (Amazon EFS)** is a managed, elastic file system for **Linux** workloads, accessed over the **Network File System (NFS)** protocol.

- Many clients can share it: EC2 instances, containers (Amazon ECS, Amazon EKS, AWS Fargate) and AWS Lambda functions. On-premises servers can reach it over AWS Direct Connect or VPN.
- **Regional** file systems store data across multiple Availability Zones; **One Zone** file systems keep it in one AZ for lower cost.
- Capacity is **elastic**: you do not provision a size, and you pay for what you store.
- **Storage classes** at overview level: Standard for frequently accessed files, Infrequent Access (IA) and Archive for colder files at lower storage prices. Lifecycle management can move files between them automatically based on access.
- Data can be encrypted at rest with AWS KMS (turn it on when you create the file system; the console enables it by default) and in transit with TLS (optional, enabled with a mount option).

Exam clue: "shared file system for many Linux instances", "NFS", "managed, grows automatically" point to EFS.

## Amazon FSx

**Amazon FSx** is a family of fully managed file systems, each built on a well-known technology. You pick the one that matches the software or protocol you already use.

| FSx type | Built on | Pick it when |
| --- | --- | --- |
| **FSx for Windows File Server** | Windows Server | You need native Windows file shares over **SMB**, with Microsoft Active Directory integration |
| **FSx for Lustre** | Lustre | You need very fast storage for high performance computing, machine learning or video processing, with Linux (POSIX) access and optional linkage to S3 |
| **FSx for NetApp ONTAP** | NetApp ONTAP | You already use NetApp, or need multi-protocol access (NFS, SMB, iSCSI) from Linux, Windows and macOS |
| **FSx for OpenZFS** | OpenZFS | You move Linux or ZFS file servers to AWS and access them over NFS |

FSx removes the work of provisioning servers, patching, backups and replacing failed hardware. Data is encrypted at rest with KMS keys.

## Block versus file versus object

| | Block | File | Object |
| --- | --- | --- | --- |
| AWS services | EBS, instance store | EFS, FSx | S3 |
| Access | Attached as a disk to one instance (EBS Multi-Attach is a special case) | Mounted by many clients over a network protocol | HTTPS API calls on whole objects |
| Scope | One AZ | Regional (EFS Regional, FSx Multi-AZ) or one AZ | Regional, virtually unlimited |
| Best for | Operating systems, databases | Shared files, home directories, Windows apps, HPC | Backups, media, data lakes, static content |
| Persistence | EBS persists; instance store does not | Persistent | Persistent |

How to read a question:

1. Does it need an operating-system disk or a database volume on one server? Block (EBS).
2. Is it a folder shared by many servers? File (EFS for Linux, FSx for Windows File Server for SMB).
3. Is it "store any amount of data at the lowest cost, accessed by URL or API"? Object (S3).
4. Is it temporary, super-fast scratch space? Instance store.

## Shared responsibility

AWS manages the hardware, the file system software and (for FSx and EFS) patching and replication. You manage who can access the data: security groups, IAM and Active Directory permissions, encryption choices and backups of what matters to you.

## Common traps

- EFS is for Linux; it is not the answer for Windows file shares.
- "Windows file server" or "SMB" is FSx for Windows File Server, not EFS.
- Instance store is fast but not durable.
- FSx is a family, so the question's keyword (Windows, Lustre, NetApp, ZFS) tells you which member.

## Key points

- Instance store: temporary, host-attached, lost on stop or terminate.
- EFS: managed NFS for Linux, multi-AZ, elastic, shared by many clients.
- FSx: Windows File Server (SMB), Lustre (HPC), NetApp ONTAP, OpenZFS.
- Match the access style: block for a disk, file for a shared folder, object for API access to any amount of data.

## Sources

- [Instance store temporary block storage for EC2 instances](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/InstanceStorage.html)
- [What is Amazon Elastic File System?](https://docs.aws.amazon.com/efs/latest/ug/whatisefs.html)
- [Amazon FSx](https://aws.amazon.com/fsx/)
