---
id: iam-security-identity-center-cognito-directory
title: "Who signs in: IAM Identity Center, Amazon Cognito, Directory Service and federation"
required: true
videoQuery: IAM Identity Center vs Amazon Cognito vs AWS Directory Service explained for Cloud Practitioner
---
## Two kinds of users, two services

| Users | Examples | Service |
| --- | --- | --- |
| Workforce (your employees and partners) | Staff opening the AWS Management Console or business applications | **AWS IAM Identity Center** |
| Customers of your own app | Shoppers signing up in a mobile app | **Amazon Cognito** |

## AWS IAM Identity Center

**IAM Identity Center** connects your workforce to AWS accounts and applications with **single sign-on**. Users sign in once through the **AWS access portal** and choose the account, role or application they are assigned.

- **Status and old names:** AWS Single Sign-On was renamed to AWS IAM Identity Center on July 26, 2022. Many exam questions still say "AWS Single Sign-On" or "AWS SSO"; the answer is the same service.
- **Identity source:** create users and groups in Identity Center itself, or connect an existing source such as Microsoft Active Directory (through AWS Managed Microsoft AD or AD Connector) or an external SAML 2.0 identity provider like Okta. Employees then use their existing corporate credentials rather than a new set.
- **Many accounts:** it works with AWS Organizations (the recommended organization instance runs in the management account). **Permission sets** define job-function permissions once, and Identity Center provisions them across accounts.
- **Applications:** it also gives access to AWS managed applications and to SAML 2.0 business applications such as Salesforce, Box or Microsoft 365, which you assign to users and groups.
- It is a recommended way to give people administrative access instead of using the root user.
- It comes at no additional charge.

## Amazon Cognito

**Amazon Cognito** is an identity platform for your web and mobile apps. It has two parts that work alone or together:

| Part | Question it answers | What it does |
| --- | --- | --- |
| **User pool** | Who is this user? | A user directory with sign-up and sign-in; issues JSON web tokens; supports social providers (Google, Apple, Facebook, Amazon) and SAML or OIDC providers; supports MFA with TOTP or SMS |
| **Identity pool** | What AWS resources may this user reach? | Exchanges a trusted token for temporary, limited-privilege AWS credentials through AWS STS; can also give guest access |

A typical flow: the user signs in to a user pool, the app trades the token with an identity pool, and the app calls Amazon S3 or DynamoDB directly with temporary credentials. Cognito suits "consumers sign up and sign in with Google", "mobile app sign-in" and "MFA for app users".

## AWS Directory Service

**AWS Directory Service** provides Microsoft Active Directory (AD) in the cloud, for applications that need AD or LDAP. Options:

| Option | What it is | Pick it when |
| --- | --- | --- |
| **AWS Managed Microsoft AD** | A real Windows Server AD run by AWS, in Standard and Enterprise editions | You need true AD features, Windows workloads, Amazon RDS for SQL Server, or a trust with on-premises AD; a Hybrid Edition connects a self-managed AD |
| **AD Connector** | A proxy that forwards sign-ins to your existing on-premises AD | You only want on-premises users to use AWS applications with their AD credentials |
| **Simple AD** | A smaller Samba 4 directory with basic AD features | You want a low-scale, low-cost directory with basic AD features (see the status below) |

Status: Simple AD has not been open to new customers since July 30, 2026, and existing customers keep full functionality; AWS points new users to AWS Managed Microsoft AD or AD Connector.

Directory Service is not the answer to "consumer sign-in" (Cognito) or "one portal for many AWS accounts" (IAM Identity Center), although Identity Center can use an AD as its source.

## Federation in one minute

**Identity federation** trusts an external identity provider (IdP). The user authenticates there, then receives temporary credentials for an IAM role. Two standards matter:

- **SAML 2.0** for corporate directories and business applications.
- **OpenID Connect (OIDC)** for web and social sign-in.

## Choosing quickly

- "Sign in once with corporate credentials to many AWS accounts", "portal for SaaS and AWS apps" or "third-party IdP for employees": **IAM Identity Center**.
- "Sign up and sign in for a consumer app, with Google": **Amazon Cognito**.
- "Active Directory in AWS" or "managed Microsoft AD": **AWS Directory Service**.
- "Temporary credentials API": **AWS STS** (previous lesson).

## Key points

- Workforce SSO is IAM Identity Center (formerly AWS SSO); customer sign-in is Cognito.
- Cognito user pools authenticate; identity pools hand out temporary AWS credentials.
- Directory Service offers Managed Microsoft AD, AD Connector and Simple AD (closed to new customers).
- Federation uses SAML 2.0 or OIDC and ends in a role.

## Sources

- [What is IAM Identity Center?](https://docs.aws.amazon.com/singlesignon/latest/userguide/what-is.html)
- [What is Amazon Cognito?](https://docs.aws.amazon.com/cognito/latest/developerguide/what-is-amazon-cognito.html)
- [What is AWS Directory Service?](https://docs.aws.amazon.com/directoryservice/latest/admin-guide/what_is.html)
