---
id: iam-security-guardduty-inspector-macie
title: "Finding problems: Amazon GuardDuty, Amazon Inspector and Amazon Macie"
required: true
videoQuery: Amazon GuardDuty vs Amazon Inspector vs Amazon Macie what each service finds
---
## Detect, scan, discover

These three services **find** issues and report them as **findings**. None of them blocks traffic; blocking is WAF, Shield and network controls. All can be managed for many accounts through AWS Organizations, and they send findings to Amazon EventBridge and to AWS Security Hub.

## Amazon GuardDuty: threats

**Amazon GuardDuty** is a threat detection service that continuously monitors and analyzes data sources and logs, using threat intelligence feeds (such as lists of malicious IP addresses and domains) and machine learning.

- **Foundational data sources**: AWS CloudTrail management events, VPC Flow Logs and DNS logs. When you enable GuardDuty it starts ingesting them itself; you do not turn those logs on or install anything for this core detection.
- **Protection plans** are optional add-ons for more sources, such as **S3 Protection**, EKS audit logs, RDS login activity, Lambda network activity, malware scanning of EBS volumes and S3 uploads, and Runtime Monitoring. Runtime Monitoring uses a GuardDuty security agent; the other core detections do not.
- Typical findings: compromised or exfiltrated credentials, unauthorized cryptomining, communication with malicious IP addresses, malware.
- The first time you enable it, you get a 30-day free trial.

Questions that say "continuously monitor accounts, workloads and S3 buckets for malicious activity" or "proactively detect a compromised instance or account" mean GuardDuty. It detects; it does not prevent attacks.

## Amazon Inspector: vulnerabilities

**Amazon Inspector** is a vulnerability management service. It automatically discovers and continually scans **Amazon EC2 instances, container images in Amazon ECR and AWS Lambda functions** for **software vulnerabilities (CVEs)** and **unintended network exposure**.

- You do not schedule scans: Inspector rescans when something changes, such as a new package, a patch or a new CVE.
- Each finding has an **Inspector risk score** adjusted for your environment, plus remediation advice; fixed findings close automatically.
- EC2 scanning uses the AWS Systems Manager Agent or an agentless method; scanning of source code repositories is also offered.

**Status and old wording:** the original **Amazon Inspector Classic**, which ran agent-based **assessment templates**, reached end of support on May 20, 2026. The current service is simply called Amazon Inspector. Exam questions about "assessment templates" or "assess EC2 for vulnerabilities" still have Inspector as the answer. When a scenario asks for a vulnerability assessment of EC2 and Inspector is among the options, it is the likely answer; Trusted Advisor or AWS Config fit pure best-practice or configuration checks.

## Amazon Macie: sensitive data in S3

**Amazon Macie** discovers sensitive data using **machine learning and pattern matching**.

- **Managed data identifiers** detect many types of personally identifiable information (PII), financial data and credentials. **Custom data identifiers** (regular expressions you define) can find your own proprietary or intellectual-property patterns.
- Macie keeps an **inventory of your S3 general purpose buckets** and evaluates their security and access control, raising **policy findings** for issues such as a publicly accessible bucket. Objects that contain sensitive data produce **sensitive data findings**.
- It runs automated discovery, or discovery jobs you define; the first 30 days are a free trial for bucket monitoring and automated discovery, but discovery jobs are not free during the trial.

"Discover and protect sensitive data in S3", "find PII" and "classify sensitive data or intellectual property" mean Macie. Macie looks at **what is in** the data; Inspector looks at **software**; GuardDuty watches **behavior**.

## What finds what

| Question | Service | What it examines |
| --- | --- | --- |
| Is there malicious activity or a compromised credential in my account? | GuardDuty | CloudTrail events, VPC Flow Logs, DNS logs, plus optional sources |
| Do my EC2 instances, container images or Lambda functions have known vulnerabilities? | Inspector | Software packages and network exposure |
| Where is sensitive data stored in S3, and is a bucket public or shared? | Macie | S3 objects and bucket settings |
| Which of my resources are shared with an external account? | IAM Access Analyzer | Resource policies |

For "one place to see all these alerts", see the next lesson.

## Key points

- GuardDuty: threat detection from logs; no agents for the core features; detects only.
- Inspector: vulnerability and exposure scanning of EC2, ECR images and Lambda; Classic ended May 20, 2026.
- Macie: machine learning to discover sensitive data in S3 and flag exposed buckets.

## Sources

- [What is Amazon GuardDuty?](https://docs.aws.amazon.com/guardduty/latest/ug/what-is-guardduty.html)
- [What is Amazon Inspector?](https://docs.aws.amazon.com/inspector/latest/user/what-is-inspector.html)
- [What is Amazon Macie?](https://docs.aws.amazon.com/macie/latest/user/what-is-macie.html)
