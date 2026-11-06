---
id: iam-security-mfa-access-keys-root-user
title: "MFA, access keys, the root user and tools to review access"
required: true
videoQuery: AWS IAM MFA access keys root user credential report Access Analyzer explained
---
## MFA types

**Multi-factor authentication (MFA)** adds something you have to something you know. The root user and each IAM user can register up to eight MFA devices, and one is enough to sign in.

| MFA type | Notes |
| --- | --- |
| Passkeys and security keys | FIDO standards; phishing-resistant; AWS's first recommendation |
| Virtual authenticator app | TOTP codes on a phone; a fine interim choice |
| Hardware TOTP token | A device that shows a six-digit code |

AWS ended support for SMS text message MFA for IAM.

## Access keys, the CLI and SDKs

An **access key** is an access key ID plus a secret access key. Together they sign programmatic requests from the **AWS Command Line Interface (AWS CLI)**, the SDKs and the API. They do not sign in to the console. So when a question says a developer needs the CLI or "programmatic access", the answer is access keys; a user needing only console access gets a password.

- The secret is shown once, at creation. A user can have at most two keys.
- Never place keys in code or in files shared with others.
- **Rotate**: create the second key, move applications to it, then deactivate and delete the old one.
- Delete or deactivate keys that the "last used" information shows nobody needs.
- Prefer roles, so that no long-term key exists at all.

## Password policy

An account **password policy** applies to IAM user passwords. You can require a minimum length, character types, expiration (1 to 1,095 days) and no reuse of recent passwords, and allow users to change their own password. If you set nothing, a default policy applies. The policy **does not apply to the root user or to access keys**, and IAM has no lockout setting, so combine it with MFA. Users with permission can change their own password in the console or with the AWS CLI. A requirement such as "minimum password length" is a policy setting; "a password that can never be changed" is not a best practice.

## The root user

The root user has complete access to the account, and you cannot restrict it with IAM policies (SCPs can limit member accounts). Best practices:

- Turn on MFA, **do not create access keys**, and do not share it.
- There is one root user per account. Create an IAM Identity Center or IAM administrator for daily work.
- In a standalone account, only the account owner manages the root user's access keys (AWS Organizations can remove member-account root credentials centrally).
- In AWS Organizations, you can remove root credentials from member accounts centrally.

Tasks that require root credentials include:

| Needs root | Does not need root |
| --- | --- |
| Close a standalone account | Create IAM users and groups |
| Change a standalone account's root email or password | Launch an EC2 instance in any Region |
| Restore IAM permissions when the only administrator locked themselves out | Delete IAM users |
| Edit or delete a bucket policy that denies all principals | Create an AWS Organizations organization |
| Activate IAM access to the Billing console; register as a Reserved Instance Marketplace seller | View the bill, once IAM access to Billing is activated |

## Tools to review access

| Tool | What it tells you |
| --- | --- |
| **IAM credential report** | A CSV listing every user with the status of password, access keys (last rotated and used) and MFA device; for audits and compliance; generated at most every four hours |
| **IAM Access Advisor** (last accessed information) | For a user, group, role or policy: which services (and some actions) were last used, so you can remove unused permissions |
| **IAM Access Analyzer** | Findings for resources shared with an external entity or made public, such as S3 buckets, IAM roles and KMS keys; also unused access, policy validation and policy generation |

Exam wording varies: "AWS IAM Access Analyzer" and "AWS Identity and Access Management Access Analyzer" are the same feature. Its external-access analysis is free, but unused-access analysis and custom policy checks are charged. Its external-access analysis works per Region, so enable that analyzer in each Region you use.

**AWS Trusted Advisor** also has security checks, for example IAM access keys not rotated in 90 days, MFA on the root user, the IAM password policy and exposed access keys.

Choose by the question:

- "Is MFA enabled for every user", "list users with password and key status" or "report rotation details to an auditor" means the **credential report**.
- "Check for access keys that have not been rotated recently", with Trusted Advisor among the options, means **Trusted Advisor**.
- "Which S3 bucket or role is shared with another account" means **Access Analyzer**.
- "Which permissions are unused" means **Access Advisor**.

## Key points

- MFA: prefer passkeys and security keys; up to eight devices.
- Access keys are for CLI, SDK and API; rotate them, never embed them, prefer roles.
- Password policy covers IAM user passwords, not the root user.
- Root: MFA, no access keys, only for root-only tasks.
- Credential report = credential status; Access Advisor = last used; Access Analyzer = external access.

## Sources

- [AWS account root user](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_root-user.html)
- [Multi-factor authentication in IAM](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_mfa.html)
- [What is IAM Access Analyzer?](https://docs.aws.amazon.com/IAM/latest/UserGuide/what-is-access-analyzer.html)
