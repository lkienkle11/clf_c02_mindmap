---
id: storage-s3-security-encryption
title: "Securing Amazon S3: access control, encryption and monitoring"
required: true
videoQuery: Amazon S3 security bucket policy Block Public Access SSE-S3 SSE-KMS explained
---
## Private by default

The basics lesson said buckets are private by default. This lesson explains **who can be given access**, how data is **encrypted**, and what **you** versus AWS must do.

## Controlling access

| Mechanism | What it is | Typical use |
| --- | --- | --- |
| **IAM policy** | Identity-based: attached to a user, group or role | "This role may read this bucket" |
| **Bucket policy** | Resource-based: attached to the bucket | Cross-account access, allow only HTTPS, restrict by VPC endpoint |
| **ACL** | Legacy per-bucket or per-object grants | Rarely needed |
| **S3 Block Public Access** | Account or bucket switch that overrides policies and ACLs that would make data public | Safety net against accidental exposure |

Points to remember:

- **ACLs are disabled by default** on new buckets (S3 Object Ownership set to "bucket owner enforced"), and AWS recommends keeping them off. Access is then managed by policies.
- A request is allowed only if the policies permit it and nothing denies it. An explicit deny always wins.
- Applications on EC2 or Lambda should use **IAM roles** with temporary credentials, never access keys stored in code.
- Apply **least privilege**: grant only the actions and buckets a task needs.
- For temporary access to a single private object, you can create a **pre-signed URL**; the optional lesson on website hosting covers it.

## Finding exposure: IAM Access Analyzer for S3

**IAM Access Analyzer for S3** alerts you when a bucket is configured to allow access to anyone on the internet or to other AWS accounts, including accounts outside your organization. It reports whether the access comes from an ACL, a bucket policy or an access point policy. Exam clue: "review which buckets are public or shared" points here. Other services that look at S3: **Amazon Macie** discovers sensitive data such as PII in buckets, and **Amazon GuardDuty** detects suspicious activity on S3 data.

## Encryption at rest

Since January 2023 S3 encrypts every new object automatically at no extra cost. Your options for server-side encryption (the service encrypts as it writes):

| Option | Who manages the key | Notes |
| --- | --- | --- |
| **SSE-S3** | Amazon S3 | The default; AES-256 |
| **SSE-KMS** | **AWS KMS** keys you can see, control and audit in CloudTrail | Choose when you need key policies and audit trails |
| **DSSE-KMS** | AWS KMS | Two layers of encryption, for stricter compliance rules |
| **SSE-C** | You supply the key with every request | AWS does not store the key; S3 now disables it by default on new buckets, so you must deliberately turn it on |

With **client-side encryption** you encrypt the data yourself before uploading, and you manage the keys and the process. Exam shortcut: "AWS manages everything" is SSE-S3, "control and audit keys in KMS" is SSE-KMS, "we provide the key" is SSE-C, "encrypt before upload" is client-side.

## Encryption in transit

S3 is reached over HTTPS (TLS). To force encrypted connections, a bucket policy can deny requests that do not use secure transport (the `aws:SecureTransport` condition).

## Shared responsibility for S3

| AWS is responsible for | You are responsible for |
| --- | --- |
| The durability and availability of the infrastructure, hardware, and the S3 service software | Who can access buckets and objects: policies, Block Public Access |
| Encrypting new objects by default | Choosing the encryption type, managing KMS keys and any client-side keys |
| Physical security of the data centers | Versioning, replication, lifecycle and classification of your data |

S3 is a managed service, so there is no operating system or patching for you to handle. A misconfigured public bucket is the customer's responsibility, not AWS's.

## Common traps

- Leaving Block Public Access off "to make it work" exposes data. Turn it off only for content that must be public.
- SSE-S3 is already on by default; you do not need to enable it.
- Access Analyzer for S3 reports exposure; it does not block it. Block Public Access prevents it.

## Key points

- Control access with IAM policies, bucket policies and Block Public Access; ACLs are off by default.
- Every new object is encrypted at rest automatically (SSE-S3); use SSE-KMS for key control and audit, SSE-C if you hold the key, or encrypt client-side.
- Use HTTPS, and a bucket policy to require it.
- IAM Access Analyzer for S3 spots public and cross-account access.
- AWS secures the service; you secure access and your data choices.

## Sources

- [Security best practices for Amazon S3](https://docs.aws.amazon.com/AmazonS3/latest/userguide/security-best-practices.html)
- [Protecting data with server-side encryption](https://docs.aws.amazon.com/AmazonS3/latest/userguide/serv-side-encryption.html)
