---
id: iam-security-config-security-hub-detective
title: "Seeing the whole picture: AWS Config, AWS Security Hub, Amazon Detective and AWS Artifact"
required: true
videoQuery: AWS Security Hub vs Amazon Detective vs AWS Config vs GuardDuty explained
---
## From single findings to a security picture

GuardDuty, Inspector and Macie each report one kind of finding. The services here collect, investigate or record around them.

## AWS Config

**AWS Config** records the configuration of your resources and how it changed over time, and evaluates it with **Config rules** that mark resources compliant or noncompliant. The deploy and operate topic covers it in depth. For security it matters in three ways:

- It answers "what did this security group or IAM policy look like last month?" and "is every volume encrypted?".
- Security Hub CSPM needs AWS Config enabled to produce most of its control findings, and Firewall Manager needs it too.
- It does not say **who** made the change; that is AWS CloudTrail.

## AWS Security Hub

**AWS Security Hub** is a unified cloud security solution that prioritizes your most important security issues. It correlates and enriches signals from posture management, vulnerability management (**Amazon Inspector**), sensitive data (**Amazon Macie**) and threat detection (**Amazon GuardDuty**), and also receives findings from **IAM Access Analyzer**. Its exposure findings and attack path graph show how issues combine into risk, with automated response workflows and ticketing integration.

**Security Hub CSPM** is the name of the earlier AWS Security Hub: a cloud security posture management service. It:

- runs continuous, account-level checks against standards such as AWS Foundational Security Best Practices, CIS, PCI DSS and NIST, producing a security score;
- consolidates findings from AWS services and partner products in one standard format (ASFF) on a single dashboard;
- lets you automate responses through automation rules and Amazon EventBridge.

Older questions say only "AWS Security Hub" for both. "Aggregate alerts and findings from several services in one dashboard" and "cloud security posture management that aggregates alerts" mean Security Hub. Its threat, vulnerability and sensitive-data findings come from GuardDuty, Inspector and Macie, so it does not replace them.

## Amazon Detective

**Amazon Detective** helps you **analyze, investigate and identify the root cause** of security findings or suspicious activity. It automatically collects log data from your AWS resources and uses machine learning, statistical analysis and graph theory to build visualizations. Investigations often start from a GuardDuty or Security Hub CSPM finding, or from an entity such as an IP address or user, and move through triage, scoping (what was affected, where did it start) and response.

Detective does not detect threats; it explains them. "Use machine learning to analyze log data and conduct security investigations" means Detective.

## AWS Artifact

**AWS Artifact** is the self-service source of AWS's own compliance reports (SOC, PCI) and agreements. It tells you about AWS's controls, not the security of your resources. See the compliance lesson in the shared responsibility topic.

## Choosing among the family

| Question | Service |
| --- | --- |
| Is something malicious happening in my account? | GuardDuty |
| Are my EC2, ECR or Lambda workloads vulnerable? | Inspector |
| Where is sensitive data in S3? | Macie |
| What is the overall picture and what should I fix first? | Security Hub |
| How did it happen, and what else was touched? | Detective |
| What did a resource look like before, and does it follow my rules? | AWS Config |
| Who made this API call? | CloudTrail |
| Which resources are shared outside my account? | IAM Access Analyzer |
| Where is the AWS SOC or PCI report? | AWS Artifact |

## Common traps

- A single dashboard for alerts from several services is Security Hub, not GuardDuty, Inspector or Macie.
- Config tracks configuration; CloudTrail tracks API calls.
- Detective investigates after a finding exists; GuardDuty creates the finding.

## Key points

- Config: resource configuration history and compliance rules.
- Security Hub: aggregates and prioritizes findings; Security Hub CSPM runs the standards-based checks.
- Detective: investigates the root cause using graph analysis of log data.
- Artifact: AWS compliance reports; CloudTrail: who did what.

## Sources

- [Introduction to AWS Security Hub](https://docs.aws.amazon.com/securityhub/latest/userguide/what-is-securityhub-v2.html)
- [Introduction to AWS Security Hub CSPM](https://docs.aws.amazon.com/securityhub/latest/userguide/what-is-securityhub.html)
- [How Detective is used for investigation](https://docs.aws.amazon.com/detective/latest/userguide/detective-investigation-about.html)
