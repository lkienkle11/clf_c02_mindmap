---
id: iam-security-kms-and-cloudhsm
title: "Encryption keys: AWS KMS key types and AWS CloudHSM"
required: true
videoQuery: AWS KMS customer managed vs AWS managed keys vs CloudHSM explained
---
## Why keys matter

**Encryption at rest** protects data in storage and **encryption in transit** protects data on the network. Either one is only as strong as the protection of its **keys**. Choosing what to encrypt and who may use the keys is the customer's job; AWS supplies services that hold the keys safely.

## AWS Key Management Service (AWS KMS)

**AWS KMS** is a managed service to create and control the keys that encrypt and sign your data.

- KMS keys are protected by hardware security modules validated at **FIPS 140-3 Security Level 3**, and they never leave KMS unencrypted.
- Many services use KMS to encrypt data at rest, including **Amazon S3, Amazon EBS and Amazon RDS**. "Which service integrates with other services to encrypt data at rest" or "encryption for an EBS volume" means KMS.
- Access is controlled by the **key policy**, together with IAM policies and grants. A customer managed key's policy is controlled only by you.
- Every use of a key can be recorded in **AWS CloudTrail**, so you can audit who used it.

## Key types

| | Customer managed key | AWS managed key | AWS owned key |
| --- | --- | --- | --- |
| Created by | You | An AWS service, in your account (alias `aws/service`) | An AWS service, in its own account |
| You can view it | Yes | Yes | No |
| You manage it (policy, disable, delete) | Yes | No | No |
| Rotation | Optional automatic rotation | Automatic, every year | Handled by the service |
| Cost | Monthly fee plus usage | No monthly fee; usage may be charged | None |

Choose a **customer managed key** when control matters: your own key policy, your own rotation, disabling or deleting the key. You can **schedule deletion** only of customer managed keys. Use an **AWS managed key** when you want the service to encrypt for you without managing a key, and an **AWS owned key** for default encryption you do not need to see.

Exam-style statements that hold: customer managed keys let you define the key policy; AWS managed keys rotate every year; customer managed keys carry a monthly charge; you cannot see AWS owned keys in your account.

## AWS CloudHSM

A **hardware security module (HSM)** is a device that performs cryptographic operations and stores keys securely. **AWS CloudHSM** gives you **dedicated, single-tenant HSMs** in the AWS Cloud.

- AWS provisions the hardware and handles backups, configuration and maintenance.
- **You** create the users and manage the keys; your data and keys are encrypted end to end and not visible to AWS. User management is separate from IAM roles.
- Clusters in FIPS mode use HSMs validated at **FIPS 140-2 or FIPS 140-3 Level 3**; a non-FIPS mode also exists.
- You have more responsibility than with a fully managed service. Applications connect through standard interfaces such as PKCS#11, Java Cryptographic Extension (JCE) and Microsoft CNG, which helps when you migrate an existing cryptographic workload.

## KMS or CloudHSM?

| Question | AWS KMS | AWS CloudHSM |
| --- | --- | --- |
| What is it? | Managed key service | Dedicated HSMs that you operate |
| Who manages keys and users? | You set policies in KMS and IAM; AWS runs the service | You, inside your own HSMs |
| How do applications use it? | Built into many AWS services, such as S3, EBS and RDS | Your applications connect through PKCS#11, JCE or CNG |
| Choose it when | You want simple, integrated key management | A rule or application requires an HSM that only you control, or specific algorithms and standards |

AWS itself advises KMS if you want managed keys but do not need to operate HSMs.

Two exam notes. First, when a question asks which service can "manage encryption keys in the cloud" and offers CloudHSM but not KMS, CloudHSM is the key-management answer. Second, with both listed, "single-tenant, dedicated, customer-controlled HSM" means CloudHSM and "create and control keys that AWS services use" means KMS.

## Related services

AWS's own guidance sends passwords and API keys to **AWS Secrets Manager** and TLS certificates to **AWS Certificate Manager** (next lesson), and encryption keys to KMS.

## Key points

- KMS creates and controls keys; integrated with S3, EBS and RDS; use is logged in CloudTrail.
- Customer managed keys: you control policy, rotation, deletion, monthly fee. AWS managed keys: no monthly fee, rotated yearly. AWS owned keys: invisible, free.
- CloudHSM: dedicated single-tenant HSMs where you alone manage the keys.

## Sources

- [AWS KMS keys](https://docs.aws.amazon.com/kms/latest/developerguide/concepts.html)
- [What is AWS Key Management Service?](https://docs.aws.amazon.com/kms/latest/developerguide/overview.html)
- [What is AWS CloudHSM?](https://docs.aws.amazon.com/cloudhsm/latest/userguide/introduction.html)
