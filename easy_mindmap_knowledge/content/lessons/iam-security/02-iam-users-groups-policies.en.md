---
id: iam-security-iam-users-groups-policies
title: "IAM in depth: users, groups and policies"
required: true
videoQuery: AWS IAM policies identity-based vs resource-based managed vs inline explained
---
## IAM is global

**AWS Identity and Access Management (IAM)** is a **global** service. Its users, groups, roles and policies are not tied to a Region, so the same identities work wherever you run resources. IAM has no additional charge. Who is responsible for what in IAM is covered in the shared responsibility topic.

## Users and groups: what to remember

- An **IAM user** is created for one person or application and gets long-term credentials: a console password, access keys, or both. A new user has no permissions until you grant some.
- An **IAM user group** holds only users, never other groups, and a user can belong to several groups. No group contains everyone by default; you create it and add users.
- Permissions attach to the group, and members inherit them. When someone changes jobs, you change their group membership instead of editing their permissions.
- A group is not an identity that signs in, so it cannot be a principal in a policy.

AWS recommends that people use federation and temporary credentials, and that IAM users be kept for cases federation cannot cover. Exam questions that ask about creating credentials for individual people, or about grouping users to share permissions, still point to IAM users and IAM groups. Roles come in the next lesson.

## The policy types you may meet

| Policy type | Attached to | What it does |
| --- | --- | --- |
| Identity-based | A user, group or role | Grants permissions to that identity |
| Resource-based | A resource, such as an S3 bucket policy or a role trust policy | Grants permissions to the principal it names, in the same or another account |
| Permissions boundary | One user or role | Sets the maximum an identity-based policy can grant; grants nothing itself |
| Service control policy (SCP) | An AWS Organizations root, OU or account | Sets the maximum permissions for IAM users and roles in member accounts; grants nothing |

Boundaries and SCPs are guardrails: they limit what other policies can allow. An exam question about "limiting what accounts in an organization can do" points to SCPs.

## Managed or inline

| Kind | Who writes it | Reuse |
| --- | --- | --- |
| AWS managed policy | AWS; you cannot edit it, and AWS may update it | Attach to many identities |
| Customer managed policy | You; edit it any time | Attach to many identities |
| Inline policy | You; embedded in one identity | One-to-one, deleted with the identity |

If a policy could apply to more than one identity, a managed policy is better than an inline one. When an AWS managed policy does not grant what users need, **create a customer managed (custom) policy**; copying an AWS managed policy is a good starting point. Job-function policies such as **PowerUserAccess** exist, and AWS advises using **AdministratorAccess** only for account administrators.

## Reading a policy

A policy document has a **Version** and one or more **Statements**. Each statement has an **Effect** (`Allow` or `Deny`), **Action** and **Resource**, and optionally a **Condition**. A resource-based policy also names a **Principal**; in an identity-based policy the principal is implied.

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::example-bucket/*"
  }]
}
```

This allows reading objects in one bucket and nothing else.

## How a request is decided

1. Everything is **denied by default**.
2. An **explicit allow** in an applicable policy permits the request.
3. An **explicit deny** in any applicable policy overrides every allow, whichever policy was written first.

When the principal and the resource are in **different accounts**, both sides must allow it: the resource-based policy names the principal, and an identity-based policy must also grant it. In the same account, a resource-based policy that names the principal is enough.

## Least privilege

Grant only what a task needs. AWS suggests starting with AWS managed policies and then moving to narrower customer managed ones, using last accessed information and IAM Access Analyzer to see what is really used (see the root user and access keys lesson). Sharing root credentials, adding every developer to an administrator group, or granting broad permissions "so everyone can work" is the wrong answer.

## Common traps

- "Organize users so permissions are granted as a group" means IAM user groups, not security groups, which are network firewalls.
- Inline policies are not preferred over customer managed policies.
- IAM is always free; threat detection and web firewalls are other services.

## Key points

- IAM is global and free; users get long-term credentials, groups share permissions.
- Identity-based policies attach to identities; resource-based policies attach to resources and name a principal.
- Prefer managed policies; write a customer managed policy when AWS managed ones do not fit.
- Default deny; an explicit deny always wins; apply least privilege.

## Sources

- [Policies and permissions in IAM](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies.html)
- [Managed policies and inline policies](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_managed-vs-inline.html)
- [Global services (AWS Fault Isolation Boundaries)](https://docs.aws.amazon.com/whitepapers/latest/aws-fault-isolation-boundaries/global-services.html)
