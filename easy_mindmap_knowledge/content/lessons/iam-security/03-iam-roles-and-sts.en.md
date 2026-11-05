---
id: iam-security-iam-roles-and-sts
title: "IAM roles, instance profiles and AWS STS"
required: true
videoQuery: IAM roles AssumeRole AWS STS temporary credentials cross-account access explained
---
## What a role is

An **IAM role** is an identity with permissions but **no password and no long-term access keys**. It is meant to be assumed by whoever needs it, and the session that results gets **temporary security credentials**. A user who assumes a role temporarily gives up their own permissions and works with the role's.

Every role has two kinds of policy:

- A **trust policy** (a resource-based policy) says **who may assume** the role.
- A **permissions policy** says **what the role may do**.

## Who can assume a role

| Who | Typical example |
| --- | --- |
| An AWS service (service principal) | EC2 or Lambda running code that calls other services |
| An IAM user or role in the same account | An admin switching to a more privileged role |
| An IAM user or role in another account | Cross-account access |
| An external user from a SAML 2.0 or OpenID Connect identity provider | Employees signing in through the company directory |

AWS also uses **service roles** (a role a service assumes for you) and **service-linked roles** (predefined by the service, which you can view but not edit).

## Roles for EC2 and instance profiles

An application on an EC2 instance cannot use a role directly because the operating system is abstracted from AWS. An **instance profile** is the container that carries one role to the instance. In the console, the instance profile is created for you; with the CLI or API you create it as a separate step. Applications read the role's credentials from the instance metadata, and they refresh automatically before they expire. An instance has one role at a time.

This is why "give an application on EC2 access to S3" or "let EC2 call Amazon SNS" has one answer: an **IAM role**. Access keys on the instance, or root user keys, are wrong.

## AWS Security Token Service (AWS STS)

**AWS STS** is the service that issues temporary credentials. They consist of an access key ID, a secret access key and a **session token**. They expire, are not stored with a user, and cannot be reused after they expire, so nothing needs to be rotated or revoked.

- STS has a global endpoint by default, and Regional endpoints you can choose instead. Credentials work in every Region.
- STS is offered at no additional charge.
- Its official name is *Security* Token Service, although some questions write "Simple Token Service".

| STS operation | Called by | Use |
| --- | --- | --- |
| `AssumeRole` | An IAM user or role | Take a role, including in another account |
| `AssumeRoleWithSAML` | A user who authenticated with a SAML 2.0 provider | Corporate federation |
| `AssumeRoleWithWebIdentity` | A user who authenticated with an OIDC provider | Social or app sign-in |
| `GetSessionToken` | An IAM user or root user | Temporary credentials, with MFA if required |

For `AssumeRole`, a session lasts at least 15 minutes, 1 hour by default, up to the role's maximum.

STS is the answer to "which service provides temporary, limited-privilege credentials", and to federated access. If the question is "centrally manage employee access to many accounts", the answer is IAM Identity Center, which uses these credentials under the hood.

## Cross-account access

To let users in account A reach resources in account B:

1. In account B (the trusting account), create a role whose **trust policy** names account A and whose permissions policy allows the needed actions.
2. In account A, give the user permission to call `sts:AssumeRole` on that role.
3. The user assumes the role, in the console or through STS, and gets temporary credentials for account B.

No IAM user needs to be created in account B. A question such as "grant users in one account access to resources in another" points to an **IAM role**.

## Why roles beat long-term keys

- Nothing long-lived is stored in code, on an instance or in a mobile app, so there is little to leak.
- Credentials expire on their own, and on EC2 they refresh automatically.
- One change to a role applies to every instance that uses it.

Create IAM users when you need credentials for individual people, or to place users in groups. Applications on EC2, mobile apps (through Amazon Cognito) and employees who already sign in on a corporate network use roles or federation instead.

## Key points

- A role has temporary credentials, a trust policy and a permissions policy.
- An instance profile delivers a role to EC2; STS issues the temporary credentials.
- Cross-account access: a role in the account that owns the resource, plus `sts:AssumeRole` permission in the other account.
- Prefer roles to access keys for every workload.

## Sources

- [IAM roles](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html)
- [Temporary security credentials in IAM](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_temp.html)
- [Use an IAM role to grant permissions to applications on Amazon EC2 instances](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_use_switch-role-ec2.html)
