---
id: iam-security-acm-and-secrets-manager
title: "Certificates and secrets: AWS Certificate Manager and AWS Secrets Manager"
required: true
videoQuery: AWS Certificate Manager vs AWS Secrets Manager vs Parameter Store explained
---
## Two different kinds of "secret"

A **TLS certificate** proves a website's identity and enables HTTPS (encryption in transit). A **secret** is a credential your application uses, such as a database password, an API key or an OAuth token. Different jobs, different services.

## AWS Certificate Manager (ACM)

**AWS Certificate Manager (ACM)** creates, stores and renews **public and private SSL/TLS X.509 certificates** that protect your websites and applications. Older material may call it "AWS ACM" or just "Certificate Manager".

- You can have ACM **issue** a certificate, or **import** one from a third party. Public certificates are validated by proving you control the domain, for example through a DNS record.
- Certificates from ACM deploy directly to **integrated services**: **Elastic Load Balancing**, **Amazon CloudFront**, **Amazon API Gateway**, AWS Elastic Beanstalk and others. That is the "provision a certificate for the load balancer" answer.
- **Renewal is managed** for certificates ACM issues, so a site does not go down because a certificate expired. Imported certificates are not renewed for you.
- **Price:** public certificates used with integrated services have no certificate charge; you pay only for the resources that run your application. Private certificates come from **AWS Private CA**, which has its own pricing.
- ACM certificates are **Regional**: a certificate for a load balancer in one Region does not exist in another, and a certificate for CloudFront must be requested in US East (N. Virginia).

ACM provides the certificate, not firewall protection. It does not stop SQL injection or DDoS attacks.

## AWS Secrets Manager

**AWS Secrets Manager** helps you manage, retrieve and **rotate** database credentials, application credentials, OAuth tokens, API keys and other secrets through their life.

- Instead of hard-coding a password in source code, the application **calls Secrets Manager at run time** to fetch it.
- You can set an **automatic rotation schedule**, which replaces long-term secrets with short-term ones. Applications do not need to be redeployed when the secret changes.
- Secrets are encrypted with **AWS KMS**; the AWS managed key `aws/secretsmanager` costs nothing extra, and your own KMS key is billed at KMS rates.
- Access is controlled with IAM, and use is logged in AWS CloudTrail.
- It is not free. You pay per secret stored and per API call.

"Store and automatically rotate database credentials" is the classic Secrets Manager scenario.

## Where each credential type belongs

AWS gives this guidance for other kinds of secret:

| What you hold | Best home |
| --- | --- |
| Database passwords, API keys, OAuth tokens | AWS Secrets Manager |
| AWS credentials | AWS IAM (roles and temporary credentials) |
| Encryption keys | AWS KMS |
| Private keys and certificates | AWS Certificate Manager |
| SSH keys | Amazon EC2 Instance Connect |

## Secrets Manager or Parameter Store?

**AWS Systems Manager Parameter Store** also keeps configuration values and encrypted `SecureString` values (see the deploy and operate topic).

| Need | Choose |
| --- | --- |
| Store configuration data and passwords cheaply, standard tier at no additional charge | Parameter Store |
| Automatic rotation of credentials with the least operational effort | Secrets Manager |
| Securely store and retrieve database credentials with scheduled rotation | Secrets Manager |

If a question mentions rotation, pick Secrets Manager. If it only says "store configuration", Parameter Store is the cheaper fit.

## Common traps

- "Provision a TLS certificate" is ACM, never KMS or Secrets Manager.
- "Rotate a database password every 30 days" is Secrets Manager, not KMS (KMS manages keys) or CloudHSM.
- Passwords kept in Amazon S3, CloudFormation parameters or Storage Gateway are not the most secure choice.

## Key points

- ACM issues, imports and renews TLS certificates and deploys them to ELB, CloudFront and API Gateway.
- Secrets Manager stores secrets and can rotate them automatically; applications fetch them at run time.
- Parameter Store is the lower-cost place for configuration; add Secrets Manager when rotation is needed.

## Sources

- [What is AWS Certificate Manager?](https://docs.aws.amazon.com/acm/latest/userguide/acm-overview.html)
- [Managed automation with integrated services (ACM)](https://docs.aws.amazon.com/acm/latest/userguide/acm-services.html)
- [What is AWS Secrets Manager?](https://docs.aws.amazon.com/secretsmanager/latest/userguide/intro.html)
