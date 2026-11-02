---
id: iam-security-iam-basics
title: "AWS IAM: users, groups, roles and policies"
required: true
videoQuery: AWS IAM users groups roles and policies explained for Cloud Practitioner
---
## What IAM does

**AWS Identity and Access Management (IAM)** controls **who** can sign in to your AWS account (authentication) and **what** they are allowed to do (authorization). IAM is a global service with no additional charge, and using it well is always the customer's job.

## The building blocks

- **IAM user**: one identity for one person or application, with **long-term credentials**: a console password and/or access keys.
- **IAM user group**: a collection of users. Permissions attached to the group apply to every member. Groups contain **only users** (no nested groups), and a user can be in several groups.
- **IAM role**: an identity with permissions but **no long-term password or access keys**. A user, an application or an AWS service **assumes** the role and receives **temporary credentials**. Example: an EC2 instance uses a role to read from an S3 bucket.
- **Policy**: a JSON document that lists permissions. For IAM identities, nothing is allowed until a policy allows it.

## Reading a policy

A policy contains one or more statements. The three parts to recognize:

- **Effect**: `Allow` or `Deny`.
- **Action**: which API operations, for example `s3:GetObject`.
- **Resource**: which resources, identified by their ARN, for example one S3 bucket.

A statement can also have a **Condition**, such as "only when the request uses TLS".

## Identity-based vs resource-based policies

An **identity-based policy** is attached to a user, group or role and says what that identity can do. A **resource-based policy** is attached to a resource, such as an **S3 bucket policy** or a KMS key policy, and names **who** (the principal) can use that resource. They are a common way to grant access to another AWS account.

## How AWS decides

| Situation | Result |
| --- | --- |
| No policy allows the request | Denied (implicit deny, the default) |
| A policy allows it and nothing denies it | Allowed |
| Any applicable policy explicitly denies it | Denied, even if another policy allows it |

**An explicit deny always wins.**

## Least privilege

Grant **only the permissions needed for the task**, and remove what is no longer used. AWS suggests starting with **AWS managed policies** for common job functions and then moving to tighter **customer managed policies**. **IAM Access Analyzer** can generate a policy from the activity a role actually used.

## Common traps

- "Give an application on EC2 access to S3" points to an **IAM role**, not access keys stored on the instance.
- "Many developers need the same permissions" points to an **IAM group**.
- A group cannot be the principal in a bucket policy; name users, roles, accounts or services instead.

## Key points

- Users have long-term credentials, groups share permissions, roles give temporary credentials.
- Policies are JSON with Effect, Action and Resource.
- Default deny; explicit deny overrides any allow.
- Apply least privilege and review unused permissions.

## Sources

- [Identity-based policies and resource-based policies](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_identity-vs-resource.html)
- [Policy evaluation logic: deny and allow](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic_policy-eval-denyallow.html)
- [Security best practices in IAM](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)
