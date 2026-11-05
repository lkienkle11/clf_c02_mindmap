---
id: iam-security-data-protection
title: "Protecting data: encryption, AWS KMS, Secrets Manager, ACM and CloudHSM"
required: true
videoQuery: AWS KMS Secrets Manager Certificate Manager CloudHSM explained for Cloud Practitioner
---
## Two states of data

- **Encryption at rest** protects stored data: S3 objects, EBS volumes, RDS databases, backups. Many services encrypt by default; for example, Amazon S3 has encrypted every new object upload since January 2023.
- **Encryption in transit** protects data moving over a network, usually with **TLS** (the "S" in HTTPS).

Deciding what to encrypt and with which keys is the customer's responsibility; AWS supplies the tools.

## AWS Key Management Service (AWS KMS)

**AWS KMS** creates and controls the **encryption keys** that AWS services use to encrypt your data. Keys are protected by hardware security modules that AWS operates, key material does not leave KMS unencrypted, and every use of a key in your account can be audited in **AWS CloudTrail**.

| Key type | Who manages it | What you control |
| --- | --- | --- |
| Customer managed key | You create and manage it | Key policy, rotation, disabling, deletion; monthly fee plus usage |
| AWS managed key | An AWS service creates it in your account (alias `aws/service`) | You can view it and audit its use; AWS rotates it every year; no monthly fee |
| AWS owned key | Owned by the AWS service, outside your account | Nothing; free and invisible to you |

Choose a **customer managed key** when you need control: your own key policy, your own rotation, or the ability to disable a key.

## AWS Secrets Manager

**Secrets Manager** stores **database passwords, API keys and other secrets**. Applications fetch the secret at runtime instead of keeping it in source code, and Secrets Manager can **rotate secrets automatically** on a schedule.

## AWS Certificate Manager (ACM)

**ACM** issues and manages **SSL/TLS certificates** for your websites and applications, and provides **managed renewal** for the certificates it issues (imported certificates you renew yourself). You attach them to integrated services such as Elastic Load Balancing, Amazon CloudFront and Amazon API Gateway to serve HTTPS.

## AWS CloudHSM

**AWS CloudHSM** gives you **dedicated, single-tenant hardware security modules** in the AWS Cloud. AWS provisions and maintains the hardware, but **you alone manage the users and keys** inside the HSMs; AWS cannot see them. Choose it when a rule requires keys in an HSM under your exclusive control. If you only need managed encryption keys, KMS is simpler.

## Common traps

- "Store and rotate a database password" means **Secrets Manager**, not KMS.
- "Create and control encryption keys" means **KMS**; "single-tenant HSM that only we control" means **CloudHSM**.
- "Provision a TLS certificate for a load balancer" means **ACM**.

## Key points

- At rest = stored data; in transit = data on the network (TLS).
- KMS manages keys; customer managed keys give the most control.
- Secrets Manager stores and rotates secrets; ACM issues and manages TLS certificates.
- CloudHSM = dedicated HSMs where you manage the keys.

## Sources

- [AWS KMS keys](https://docs.aws.amazon.com/kms/latest/developerguide/concepts.html)
- [What is AWS Secrets Manager?](https://docs.aws.amazon.com/secretsmanager/latest/userguide/intro.html)
- [What is AWS CloudHSM?](https://docs.aws.amazon.com/cloudhsm/latest/userguide/introduction.html)
