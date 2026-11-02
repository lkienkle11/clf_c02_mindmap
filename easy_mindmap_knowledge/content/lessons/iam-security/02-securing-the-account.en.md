---
id: iam-security-account-protection
title: "Securing the account: root user, MFA, credentials and identity services"
required: true
videoQuery: AWS root user best practices MFA access keys IAM Identity Center explained
---
## The root user

When you create an AWS account, you get the **root user**: the email address and password used to sign up. It has **complete access to everything** in the account, and you cannot attach IAM policies to it to limit what it can do.

- **Do not use it for everyday work.** Use an administrative identity instead (AWS recommends IAM Identity Center).
- **Turn on MFA** for the root user and **do not create access keys** for it.
- Sign in as root **only for tasks that require it**, for example: changing the root email or password of a standalone account, closing the account, restoring permissions after the only IAM administrator locked themselves out, or fixing an S3 bucket policy that denies everyone.

## Multi-factor authentication (MFA)

MFA asks for a second factor, such as a code from an authenticator app, a passkey or a hardware security key, after the password. AWS recommends phishing-resistant passkeys and security keys where possible.

## Long-term vs temporary credentials

- **Access keys** are **long-term** credentials for the CLI, SDKs and APIs. A leaked key works until someone deactivates it.
- **Temporary credentials** come from **assuming an IAM role** and expire on their own. AWS recommends them for people (through federation) and for workloads: EC2 instances and Lambda functions receive role credentials automatically.
- Never put access keys in code. If a tool really needs them, rotate them and remove unused ones.

A **password policy** sets rules for IAM user passwords, such as minimum length, character types, expiration and no reuse. It does not apply to the root user.

## Identity services to recognize

- **AWS IAM Identity Center** (formerly AWS Single Sign-On) is the recommended way to give your **workforce** single sign-on to **multiple AWS accounts** and applications. Create users in it or connect an existing identity provider, such as Microsoft Active Directory or Okta.
- **AWS Organizations service control policies (SCPs)** set the **maximum permissions** for accounts in an organization; they grant nothing by themselves.
- **Amazon Cognito** adds sign-up and sign-in to **your own web and mobile apps** for your **customers**. User pools are the user directory and support social sign-in such as Google or Apple; identity pools exchange a sign-in for temporary AWS credentials.

## Common traps

- "Employees need one login for many AWS accounts" means **IAM Identity Center**; "app users sign in with Google" means **Cognito**.
- An SCP can block an action in a member account even if an IAM policy allows it.

## Key points

- Use the root user only for root-only tasks, with MFA.
- Prefer roles and temporary credentials over access keys.
- Identity Center for workforce access; Cognito for application users.
- SCPs limit accounts; they never grant permissions.

## Sources

- [AWS account root user](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_root-user.html)
- [What is IAM Identity Center?](https://docs.aws.amazon.com/singlesignon/latest/userguide/what-is.html)
- [What is Amazon Cognito?](https://docs.aws.amazon.com/cognito/latest/developerguide/what-is-amazon-cognito.html)
