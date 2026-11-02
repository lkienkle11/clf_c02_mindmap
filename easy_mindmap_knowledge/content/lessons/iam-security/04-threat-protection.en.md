---
id: iam-security-threat-protection
title: "Threat protection: Shield, WAF, GuardDuty, Inspector, Macie and Security Hub"
required: true
videoQuery: AWS Shield WAF GuardDuty Inspector Macie Security Hub differences explained
---
## Protecting the front door

- **AWS Shield Standard** protects **every AWS customer automatically at no additional charge** against the most common network and transport layer **DDoS** attacks.
- **AWS Shield Advanced** is a **paid subscription** with expanded DDoS protection for resources you choose, such as EC2 Elastic IP addresses, load balancers, CloudFront, Global Accelerator and Route 53. It adds 24/7 access to the **Shield Response Team** (with a Business or Enterprise support plan) and **cost protection** for scaling charges caused by an attack.
- **AWS WAF** is a **web application firewall** for HTTP(S) requests. You attach a **web ACL** of rules to CloudFront, an Application Load Balancer, API Gateway and other supported resources. Rules can block **SQL injection**, **cross-site scripting**, specific IP addresses or countries, and floods of requests from one source.

## Finding problems inside the account

- **Amazon GuardDuty** is **threat detection**. Once enabled, it analyzes **CloudTrail management events, VPC flow logs and DNS logs** without you setting up those logs, and uses threat intelligence and machine learning to spot compromised credentials, cryptomining or contact with malicious IP addresses.
- **Amazon Inspector** is **vulnerability management**. It automatically discovers and continually scans **EC2 instances, container images in Amazon ECR and Lambda functions** for software vulnerabilities (CVEs) and unintended network exposure.
- **Amazon Macie** uses machine learning and pattern matching to **discover sensitive data**, such as personal or financial information, **in Amazon S3**, and flags buckets that are public or shared.
- **AWS Security Hub** brings these signals together and prioritizes them. Its **Security Hub CSPM** capability (the original Security Hub) runs automated checks against standards such as AWS Foundational Security Best Practices and CIS and collects findings from GuardDuty, Inspector and Macie.
- **Amazon Detective** helps you **investigate the root cause** of a finding using graphs built from log data.
- **AWS Firewall Manager** applies WAF rules, Shield Advanced protection and security group rules **centrally across all accounts** in AWS Organizations.

Auditing who made an API call is **AWS CloudTrail** (see the deploying and operating topic).

## Exam keyword map

| Scenario keyword | Service |
| --- | --- |
| DDoS attack | AWS Shield |
| SQL injection, cross-site scripting, web ACL | AWS WAF |
| Threat detection from logs, DNS and network activity | Amazon GuardDuty |
| Vulnerability scanning of EC2, containers or Lambda | Amazon Inspector |
| Sensitive data (PII) in S3 | Amazon Macie |
| One dashboard of findings and best-practice checks | AWS Security Hub |

## Common traps

- GuardDuty **detects** threats; it does not block traffic. WAF and Shield **block or absorb** attacks.
- Inspector looks for **software vulnerabilities**; Macie looks at **data content**.
- "DDoS response team and cost protection" means Shield Advanced.

## Key points

- Shield = DDoS; WAF = layer 7 web rules.
- GuardDuty = threat detection; Inspector = vulnerabilities; Macie = sensitive data in S3.
- Security Hub = central findings and posture checks; Detective = investigation.

## Sources

- [AWS Shield Standard overview](https://docs.aws.amazon.com/waf/latest/developerguide/ddos-standard-summary.html)
- [What is Amazon GuardDuty?](https://docs.aws.amazon.com/guardduty/latest/ug/what-is-guardduty.html)
- [What is Amazon Inspector?](https://docs.aws.amazon.com/inspector/latest/user/what-is-inspector.html)
